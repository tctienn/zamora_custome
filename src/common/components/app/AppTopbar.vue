<template>
  <div class='layout-topbar'>
    <div class='flex'>
      <router-link
        class='app-logo'
        to='/'>
        <img
          alt='app logo'
          :src='logo'/>
        <span class='app-name'>{{ productName }}</span>
      </router-link>
      <button
        ref='menubutton'
        class='p-link topbar-menubutton'
        type='button'
        @click='onMenuButtonClick'>
        <span></span>
      </button>
    </div>

    <div class='topbar-search topbar-search-active w-25rem'>
      <SearchTopBar/>
    </div>
    <div class='align-items-center flex gap-4'>
      <div class='align-items-center flex gap-2'>
        <slot name='customMenu'></slot>
        <AppNotification/>
        <AppProductsMenu/>
      </div>

      <div class='m-0 topbar-profile'>
        <AppTopbarUser/>
      </div>
    </div>
  </div>
</template>

<script setup>
import { storeToRefs } from 'pinia';
import { usePrimeVue } from 'primevue/config';
import { computed, inject, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

import AppProductsMenu from '@/common/components/app/AppProductsMenu.vue';
import AppTopbarUser from '@/common/components/app/AppTopbarUser.vue';
import { useLayout } from '@/common/components/app/composables/layout';
import SearchTopBar from '@/common/components/app/search/SearchTopBar.vue';
import AppNotification from '@/common/components/custom/AppNotification.vue';
import { APP_NAME } from '@/common/constants';
import { generateAvatarUrl } from '@/common/helpers/file-utils';
import { useInfoStore } from '@/common/store/info';

const $primevue = usePrimeVue();
const { info } = storeToRefs(useInfoStore());
defineExpose({ $primevue });

const { onMenuToggle } = useLayout();
const router = useRouter();
const outsideClickListener = ref(null);
const topbarMenuActive = ref(false);
const { t } = useI18n();
const updateSearchTerm = inject('updateSearchTerm');
const searchTerm = inject('searchTerm', '');

const logo = computed(() =>
  info.value?.logo ? generateAvatarUrl(info.value?.logo) : '/logo.png',
);
const productName = computed(() => info.value?.productName || APP_NAME);

onMounted(() => {
  bindOutsideClickListener();
});

onBeforeUnmount(() => {
  unbindOutsideClickListener();
});

const bindOutsideClickListener = () => {
  if (!outsideClickListener.value) {
    outsideClickListener.value = (event) => {
      if (isOutsideClicked(event)) {
        topbarMenuActive.value = false;
      }
    };
    document.addEventListener('click', outsideClickListener.value);
  }
};
const unbindOutsideClickListener = () => {
  if (outsideClickListener.value) {
    document.removeEventListener('click', outsideClickListener.value);
    outsideClickListener.value = null;
  }
};
const isOutsideClicked = (event) => {
  if (!topbarMenuActive.value) {
    return;
  }

  const sidebarEl = document.querySelector('.layout-topbar-menu');
  const topbarEl = document.querySelector('.layout-topbar-menu-button');

  return !(
    sidebarEl.isSameNode(event.target)
      || sidebarEl.contains(event.target)
      || topbarEl.isSameNode(event.target)
      || topbarEl.contains(event.target)
  );
};
const onMenuButtonClick = () => {
  onMenuToggle();
};

function checkIfClassExists(className) {
  return !!document.querySelector(`.${className}`);
}

onMounted(() => {
  checkForClassOnRouteChange();
});
const isDocument = ref(false);

function checkForClassOnRouteChange() {
  const classNameToCheck = 'filter-in-search';
  isDocument.value = checkIfClassExists(classNameToCheck);
}

watch(router.currentRoute, () => {
  checkForClassOnRouteChange();
});
</script>
