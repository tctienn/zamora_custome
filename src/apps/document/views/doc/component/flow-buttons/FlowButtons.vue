<template>
  <template
    v-for='outcome in outcomes'
    :key='outcome.name'>
    <FlowButton
      v-if='processVisible[outcome.name]'
      :class-name-btn='classNameBtn'
      :disabled='disabledFunc(outcome)'
      :icon-size='iconSize'
      :label='label?label(outcome):(outcome.label||"Nút")'
      :outcome='outcome'
      :size='size'
      @click="emits('action',outcome)">
    </FlowButton>
  </template>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue';

import FlowButton from '@/apps/document/views/doc/component/flow-buttons/FlowButton.vue';
import type { Outcome } from '@/apps/work-flow/model/flow';

import type { FlowButtonGroupEmits, FlowButtonGroupProps } from './flow-button-type';

const props = withDefaults(defineProps<FlowButtonGroupProps<Outcome & Record<string, any>>>(), {
  disabledFunc: () => false,
  visibleFunc: () => Promise.resolve(true),
  outcomes: () => [],
  classNameBtn: () => '',
});
const emits = defineEmits<FlowButtonGroupEmits>();
const processVisible = ref<{ [key: string]: boolean }>({});

watch(() => props.outcomes, async (outcomes) => {
  for (const o of outcomes) {
    processVisible.value[o.name] = await props.visibleFunc(o);
  }
}, {
  immediate: true,
  deep: true 
});

</script>

<style scoped>

</style>