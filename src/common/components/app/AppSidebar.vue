<template>
  <div class='layout-sidebar'>
    <div
      ref='menuContainer'
      class='flex-column layout-menu-container'>
      <AppMenu
        class='flex-grow-1 overflow-auto'
        :model='model'
        style='scrollbar-width: none'></AppMenu>

      <div 
        v-if='showChatAndHelp'
        class='align-items-center flex flex-column font-semibold p-1 text-primary'>
        <router-link
          class='align-items-center border-round cursor-pointer flex flex-column gap-1 menu-item py-2 w-full'
          to='/chat'>
          <AppIcon
            name='chat_bubble'
            size='1.5'></AppIcon>
          Chat
        </router-link>
        <div class='align-items-center border-round cursor-pointer flex flex-column gap-1 menu-item py-2 w-full'>
          <AppIcon
            name='help'
            size='1.5'></AppIcon>
          Help
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import AppIcon from '@/common/components/app/AppIcon.vue';

import AppMenu from './AppMenu.vue';

defineProps({
  model: {
    type: Array,
    default: () => []
  },
  showChatAndHelp: {
    type: Boolean,
    default: true
  }
});
</script>

<style lang='scss' scoped>
.menu-item {
  color: var(--menuitem-text-color);

  &:hover {
    background-color: var(--v-sidebar-hover-bg);
    color: var(--text-primary)
  }

}
</style>
