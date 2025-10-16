<template>
  <span class='my-2'>{{ label }}: <strong>{{ value }}</strong></span>
</template>

<script setup lang='ts'>
defineProps({
  label: {
    type: String,
    default: null,
  },
  value: {
    type: String,
    default: null
  },
});
</script>

<style scoped>

</style>