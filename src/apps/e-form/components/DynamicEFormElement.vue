<template>
  <component
    :is='components[type]'
    v-bind='$props'
    @update:label='$emit("update:label", $event)'/>
</template>

<script
  lang='ts'
  setup>
import type { PropType } from 'vue';

import { components, ElementMode, ElementType } from '@/apps/e-form/components/element';

defineProps({
  mode: {
    type: String as PropType<ElementMode>,
    required: true,
  },
  type: {
    type: String as PropType<ElementType>,
    required: true,
  }
});

defineEmits(['update:label']);

</script>

<style scoped>

</style>