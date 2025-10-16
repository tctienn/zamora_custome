<template>
  <a class='p-menuitem-link'>
    <AppIcon
      class='mt-1 p-menuitem-icon'
      :class='classIcon'
      :name='icon'
      :size='iconSize'
      :style='styleIcon'/>
    <span
      class='p-menuitem-text'
      :class='classItem'
      :style='styleItem'>{{ label }}</span>
  </a>
</template>

<script setup>

defineProps({
  icon: {
    type: String,
    default: undefined
  },
  iconSize: {
    type: String,
    default: '1.5',
  },
  label: {
    type: [String, Function],
    required: true
  },
  styleItem: {
    type: Object,
    default: () => ({})
  },
  classItem: {
    type: [String, Array],
    default: ''
  },
  styleIcon: {
    type: Object,
    default: () => ({})
  },
  classIcon: {
    type: [String, Array],
    default: ''
  }
});
</script>

<script>
export default { name: 'MenuItem' };
</script>

<style scoped>

</style>