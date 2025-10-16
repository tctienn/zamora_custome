<template>
  <div
    class='layout-container'
    :class='containerClass'>
    <AppTopbar ref='topbarRef'></AppTopbar>
    <AppSidebar></AppSidebar>
    <div class='layout-content-wrapper'>
      <div class='layout-content'>
        <div class='layout-content-inner'>
          <AppBreadcrumb></AppBreadcrumb>
          <router-view></router-view>
        </div>
      </div>
    </div>
    <Toast />
    <AppConfig></AppConfig>
  </div>
</template>

<script setup>
import { usePrimeVue } from 'primevue/config';
import { computed, onBeforeUnmount, ref, watch } from 'vue';

import AppBreadcrumb from './AppBreadcrumb.vue';
import AppConfig from './AppConfig.vue';
import AppSidebar from './AppSidebar.vue';
import AppTopbar from './AppTopbar.vue';
import { useLayout } from './composables/layout';

const $primevue = usePrimeVue();
const { layoutConfig, layoutState, isSidebarActive } = useLayout();

const outsideClickListener = ref(null);
const topbarRef = ref(null);

watch(isSidebarActive, (newVal) => {
  if (newVal) {
    bindOutsideClickListener();
  } else {
    unbindOutsideClickListener();
  }
});

onBeforeUnmount(() => {
  unbindOutsideClickListener();
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
      'layout-static-inactive': layoutState.staticMenuDesktopInactive.value && layoutConfig.menuMode.value === 'static',
      'p-ripple-disabled': $primevue.config.ripple === false,
      'layout-light': layoutConfig.layoutTheme.value === 'colorScheme' && layoutConfig.colorScheme.value === 'light',
      'layout-dark': layoutConfig.layoutTheme.value === 'colorScheme' && layoutConfig.colorScheme.value === 'dark',
      'layout-primary': layoutConfig.colorScheme.value !== 'dark' && layoutConfig.layoutTheme.value === 'primaryColor'
    }
  ];
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
    outsideClickListener.value = null;
  }
};
const isOutsideClicked = (event) => {
  const sidebarEl = document.querySelector('.layout-sidebar');
  const topbarEl = document.querySelector('.topbar-menubutton');

  return !(sidebarEl?.isSameNode(event.target) || sidebarEl?.contains(event.target) || topbarEl?.isSameNode(event.target) || topbarEl?.contains(event.target));
};
</script>

<style lang="scss"></style>
