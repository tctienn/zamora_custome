<template>
  <AppIcon
    class='cursor-pointer product-menu-icon text-white'
    name='apps'
    size='2'
    @click='toggle'></AppIcon>

  <OverlayPanel
    ref='op'
    class='surface-50'
    :pt='{
      content: {
        class: "p-2"
      }
    }'>
    <div class='flex flex-wrap product-menu-container row-gap-2'>
      <div
        v-for='menu of configuredApps'
        :key='menu.code'
        class='align-items-start flex flex-wrap justify-content-center p-2 product-menu w-8rem'>

        <router-link
          v-tooltip.bottom='menu.description'
          class='column-gap-1 flex flex-row text-color'
          :to='`/${menu.urlPublic}`'
          @click='changeApp(menu.code)'>
          <div class='align-items-center flex flex-column gap-2 justify-content-center'>
            <img
              v-if='menu.icon'
              :alt='menu.name || menu.application'
              class='h-3rem w-3rem'
              :src='`/images/menus/${menu.icon}`'/>
            <AppIcon
              v-else
              class='text-center w-3rem'
              name='menu'
              size='3'/>
            <span class='font-bold text-center'>{{ menu.name || menu.application }}</span>
          </div>

        </router-link>
      </div>
    </div>
  </OverlayPanel>
</template>

<script lang='ts' setup>
import { storeToRefs } from 'pinia';
import { nextTick, ref } from 'vue';

import AppIcon from '@/common/components/app/AppIcon.vue';
import router from '@/common/router';
import { type AppMenu, useMenuStore } from '@/common/store/menu';

const menuStore = useMenuStore();

const { configuredApps } = storeToRefs(menuStore);
const op = ref();

function changeApp(menu: string) {
  menuStore.setCurrentApp(menu);
  op.value.hide();
  const firstMenu = findFirstItemInMenus(menuStore.currentMenus);
  if (firstMenu && firstMenu.to) {
    router.push({ path: firstMenu.to });
  }
}

function findFirstItemInMenus(menus: AppMenu[]): AppMenu | undefined {
  const first = menus[0];
  if (first.items) {
    return findFirstItemInMenus(first.items);
  }
  return first;
}

function toggle(event: Event) {
  if (configuredApps?.value?.length) {
    op.value.toggle(event);
    nextTick(() => correctNotificationPopup(event));
  }
}

function correctNotificationPopup(e: Event) {
  const popup = document.querySelector('.p-overlaypanel') as HTMLElement;
  if (popup) {
    const target = e.target as HTMLElement;
    const centerOfTarget = window.innerWidth - target.getBoundingClientRect().right + target.getBoundingClientRect().width / 2;
    const width = popup.getBoundingClientRect().width;
    popup.style.setProperty('right', '15px');
    popup.style.removeProperty('left');
    popup.style.setProperty('--overlayArrowLeft', `${width - centerOfTarget}px`);
  }
}
</script>

<script lang='ts'>
export default { name: 'AppProductsMenu' };
</script>

<style lang='scss' scoped>
.logo-icon {
  img {
    width: 2.5rem;
    height: 2.5rem;
  }
}

.p-overlaypanel {
  .p-overlaypanel-content {
    padding: .75rem;
    display: grid;
    grid-template-columns: auto auto auto;
    max-height: 15rem;
  }
}

.product-menu-container {
  width: 24rem;

  .product-menu {
    border-radius: .25rem;
    cursor: pointer;

    &:hover {
      box-shadow: 0 8px 16px 0 rgba(0, 0, 0, .2);
    }
  }
}
</style>
