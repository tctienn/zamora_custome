<template>
  <Chips
    input-class='w-full'
    :max='3'
    :model-value='options'
    :pt="{
      container: 'w-full'
    }"
    separator=','
    v-bind='$attrs'>
    <template #chip='{value}'>
      {{ getOptionLabel(value) }}
    </template>
    <template #removetokenicon>
      {{ "" }}
    </template>
  </Chips>
</template>

<script lang="ts" setup>
import { type PropType, watchEffect } from 'vue';

const props = defineProps({
  optionLabel: {
    type: [String, Function] as PropType<string | ((data: any) => string)>,
    default: 'label'
  },
  optionValue: {
    type: [String, Function] as PropType<string | ((data: any) => any)>,
    default: 'value'
  },
  options: {
    type: Array as PropType<any[]>,
    default: () => []
  }

});
const modelValue = defineModel<any>();
const getOptionLabel = (item: any) => {
  return typeof props.optionLabel === 'function'
    ? props.optionLabel(item)
    : item[props.optionLabel];
};

// Function to get the value (handles both string and function)
const getOptionValue = (item: any) => {
  return typeof props.optionValue === 'function'
    ? props.optionValue(item)
    : item[props.optionValue];
};
watchEffect(() => {
  modelValue.value = props.options?.map(e => getOptionValue(e)) || [];
});

</script>

<style scoped></style>
