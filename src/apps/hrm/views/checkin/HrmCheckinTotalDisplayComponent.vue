<template>
  <div class='align-items-center border-round flex gap-2 px-3 py-2'>
    <span class='text-lg'>
      {{ title }}
    </span>
    <span class='font-semibold text-xl'>{{ count }}</span>
  </div>
</template>

<script lang='ts' setup>
defineProps({
  title: {
    type: String,
    default: ''
  },
  count: {
    type: Number,
    default: 0
  },
});
</script>

<style scoped>

</style>