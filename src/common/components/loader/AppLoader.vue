<template>
  <div class='align-items-center flex h-full justify-content-center'>
    <ProgressSpinner
      :class='`h-${size}rem w-${size}rem`'
      :stroke-width='`${size / 3}`'/>
  </div>
</template>

<script setup lang='ts'>
defineProps({
  size: {
    type: Number,
    default: 15
  }
});
</script>
