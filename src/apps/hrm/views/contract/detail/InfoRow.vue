<template>
  <div class='col-6'>
    <div class='font-medium mb-1 text-color-secondary text-sm'>{{ label }}</div>
    <div class='font-semibold text-base text-color'>{{ value || '-' }}</div>
  </div>
</template>

<script lang='ts' setup>
defineProps({
  label: {
    type: String,
    default: ''
  },
  value: {
    type: String,
    default: ''
  }
});
</script>
