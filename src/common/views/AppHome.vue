<template>
  <div
    class='layout-container'
    :class='containerClass'>
    <AppTopbar ref='topbarRef'>
      <template #customMenu>
        <slot></slot>
      </template>
    </AppTopbar>
    <AppSidebar
      :model='menuShowFilter'
      :show-chat-and-help='showChatAndHelp'></AppSidebar>
    <div class='layout-content-wrapper'>
      <div class='layout-content'>
        <div class='layout-content-inner'>
          <router-view></router-view>
        </div>
      </div>
    </div>
    <Toast/>
    <UserOverlay
      ref='userOverlayRef'
      :user='userOverlay.user'/>
  </div>
</template>

<script lang='ts' setup>
import { storeToRefs } from 'pinia';
import { usePrimeVue } from 'primevue/config';
import { computed, nextTick, onBeforeUnmount, onMounted, provide, ref, watch, } from 'vue';
import { useRoute } from 'vue-router';

import type { UserMoreInfo } from '@/apps/admin/model/User';
import { getConfiguredApps } from '@/common/api/rest/menuApi';
import AppSidebar from '@/common/components/app/AppSidebar.vue';
import AppTopbar from '@/common/components/app/AppTopbar.vue';
import { useLayout } from '@/common/components/app/composables/layout';
import UserOverlay from '@/common/components/custom/UserOverlay.vue';
import EventBus from '@/common/helpers/event-bus';
import type { Menu } from '@/common/model/menu';
import { type AppMenu, useMenuStore } from '@/common/store/menu';
import { useThemeStore } from '@/common/store/theme';
import { useUserStore } from '@/common/store/user';

const route = useRoute();
const outsideClickListener = ref<(e: Event) => void>();
const $primevue = usePrimeVue();
const themeStore = useThemeStore();
const {
  menuMode,
  theme,
  dark
} = storeToRefs(themeStore);
const {
  layoutConfig,
  layoutState,
  isSidebarActive,
  changeThemeAndColorScheme
} = useLayout();
const {
  currentMenus,
  configuredApps
} = storeToRefs(useMenuStore());
const { user } = storeToRefs(useUserStore());
const userOverlayRef = ref();
const userOverlay = ref<{
  visible: boolean;
  user?: UserMoreInfo;
  event?: Event;
}>({ visible: false });
const searchTerm = ref('');
const updateSearchTerm = (term: string) => {
  searchTerm.value = term;
};

// Determine if we should show chat and help menu items
const showChatAndHelp = computed(() => {
  // Hide chat and help for admin module
  return !route.path.startsWith('/admin');
});

const containerClass = computed(() => {
  return [
    {
      'layout-slim': layoutConfig.menuMode.value === 'slim',
      'layout-slim-plus': layoutConfig.menuMode.value === 'slim-plus',
      'layout-static': layoutConfig.menuMode.value === 'static',
      'layout-overlay': layoutConfig.menuMode.value === 'overlay',
      'layout-overlay-active': layoutState.overlayMenuActive.value,
      'layout-mobile-active': layoutState.staticMenuMobileActive.value,
      'layout-static-inactive':
          layoutState.staticMenuDesktopInactive.value
          && layoutConfig.menuMode.value === 'static',
      'p-ripple-disabled': $primevue.config.ripple === false,
      'layout-light':
          layoutConfig.colorScheme.value !== 'dark'
          && layoutConfig.layoutTheme.value === 'colorScheme',
      'layout-primary':
          layoutConfig.colorScheme.value !== 'dark'
          && layoutConfig.layoutTheme.value === 'primaryColor',
      'layout-dark': layoutConfig.colorScheme.value === 'dark',
    },
  ];
});

provide('searchTerm', searchTerm);
provide('updateSearchTerm', updateSearchTerm);

onMounted(() => {
  if (!configuredApps?.value?.length) {
    getConfiguredApps().then((list) => {
      if (list) {
        //   const documentApp: Menu = {
        //     code: 'DOCUMENT',
        //     name: 'Văn bản',
        //     type: 'APP',
        //     icon: 'document.png',
        //     application: 'DOCUMENT',
        //     urlPublic: 'document',
        //     urlApplication: 'document',
        //   };
        //   if (list.findIndex((item) => item.code === documentApp.code) === -1) {
        //     list = [...list, documentApp];
        //   }
        configuredApps.value = list;
      }
    });
  }
});

watch(isSidebarActive, (newVal) => {
  if (newVal) {
    bindOutsideClickListener();
  } else {
    unbindOutsideClickListener();
  }
});
const menuShowFilter = ref<AppMenu[]>([]);

watch(() => user.value, (newVal) => {
  if (newVal.username === 'admin' || newVal.username?.includes('admin')) {
    menuShowFilter.value = currentMenus.value.filter((menu: AppMenu) => menu.menuCode !== 'PERSONAL_PROFILE');
  } else {
    menuShowFilter.value = currentMenus.value;
  }
}, {
  immediate: true,
  deep: true 
});

onMounted(() => {
  layoutConfig.menuMode.value = menuMode.value;
  changeThemeAndColorScheme(theme.value, dark.value ? 'dark' : 'light');
  EventBus.on('user-overlay', toggleUserOverlay);
});

onBeforeUnmount(() => {
  unbindOutsideClickListener();
  EventBus.off('user-overlay', toggleUserOverlay);
});

const bindOutsideClickListener = () => {
  if (!outsideClickListener.value) {
    outsideClickListener.value = (event) => {
      if (isOutsideClicked(event)) {
        layoutState.overlayMenuActive.value = false;
        layoutState.overlaySubmenuActive.value = false;
        layoutState.staticMenuMobileActive.value = false;
        layoutState.menuHoverActive.value = false;
      }
    };
    document.addEventListener('click', outsideClickListener.value);
  }
};
const unbindOutsideClickListener = () => {
  if (outsideClickListener.value) {
    document.removeEventListener('click', outsideClickListener.value);
    outsideClickListener.value = undefined;
  }
};
const isOutsideClicked = (event: Event) => {
  const sidebarEl = document.querySelector('.layout-sidebar');
  const topbarEl = document.querySelector('.topbar-menubutton');

  return !(
    sidebarEl?.isSameNode(event.target as Node)
      || sidebarEl?.contains(event.target as Node)
      || topbarEl?.isSameNode(event.target as Node)
      || topbarEl?.contains(event.target as Node)
  );
};

function toggleUserOverlay(data: {
  visible: boolean;
  user?: UserMoreInfo;
  event?: Event;
}) {
  nextTick(() => {
    userOverlay.value = data;
  }).then(() => {
    userOverlayRef.value.show(data.event);
  });
}
</script>

<style scoped></style>
