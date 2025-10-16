<template>
  <ul class='layout-menu'>
    <template
      v-for='(item, i) in model'
      :key='item'>
      <AppMenuItem
        :index='i'
        :item='item'
        root />

      <li class='menu-separator'></li>
    </template>
  </ul>
</template>

<script setup>

import AppMenuItem from './AppMenuItem.vue';

defineProps({
  model: {
    type: Array,
    default: () => []
  }
});
</script>

<style lang="scss" scoped></style>
