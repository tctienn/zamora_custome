<template>
  <div :class='col'>
    <div class='font-medium mb-1 text-color-secondary text-sm'>{{ label }}</div>
    <div class='font-semibold text-base text-color'><slot>{{ value || '-' }}</slot></div>
  </div>
</template>

<script lang='ts' setup>
import type { PropType } from 'vue';

defineProps({
  label: {
    type: String,
    default: ''
  },
  value: {
    type: [String, Number] as PropType<string | number>,
    default: ''
  },
  col: {
    type: String,
    default: 'col-6'
  }
});
</script>
