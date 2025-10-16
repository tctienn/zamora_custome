<template>
  <Sidebar
    v-model:visible='visible'
    :header='header'
    position='right'
    style='width: 35rem'>
    <slot></slot>
  </Sidebar>
</template>

<script lang='ts' setup>
defineProps({
  header: {
    type: String,
    default: 'Config',
  },
});
const visible = defineModel('visible', {
  type: Boolean,
  default: false,
});
</script>

<style scoped>

</style>