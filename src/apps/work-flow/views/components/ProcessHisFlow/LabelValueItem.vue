<template>
  <div class='flex'>
    <div
      class='mr-2 py-1'
      style='width:fit-content;white-space: nowrap'>
      <span :class='labelClass'>
        {{ label }}:
      </span>
    </div>
    <div
      class='py-1 w-full'
      style='width:fit-content;white-space: nowrap'>
      {{ value }}
    </div>
  </div>
</template>

<script lang="ts" setup>
defineProps({
  label: {
    type: String,
    default: ''
  },
  value: {
    type: String,
    default: ''
  },
  labelClass: {
    type: String,
    default: ''
  }
});
</script>

<style scoped>

</style>