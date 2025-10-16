<template>
  <FormInputWrapper
    v-bind='$props'>
    <input
      :name='name'
      type='hidden'
      :value='inputValue'/>
    <TreeSelect
      v-model='model'
      class='w-full'
      :input-id='name'
      :invalid='!!error'
      :options='options'
      v-bind='omit($attrs, "class")'/>
  </FormInputWrapper>
</template>

<script lang='ts' setup>
import { omit } from 'lodash';
import type { TreeNode } from 'primevue/treenode';
import { computed, type PropType, ref, watch } from 'vue';

import FormInputWrapper from '@/apps/hrm/components/form/FormInputWrapper.vue';

defineProps({
  label: {
    type: String,
    required: true
  },
  name: {
    type: String,
    default: ''
  },
  options: {
    type: Array as PropType<TreeNode[]>,
    default: () => []
  },
  error: {
    type: String,
    default: undefined
  },
  bgHighlight: {
    type: Boolean,
    default: false
  },
  required: {
    type: Boolean,
    default: false
  },
  expandedLevel: {
    type: Number,
    default: 0
  }
});

// eslint-disable-next-line vue/require-prop-types
const modelValue = defineModel({ type: String });
const model = ref<{ [key: string]: boolean; }>(toModel(modelValue.value || ''));

watch(modelValue, (value) => {
  model.value = toModel(value || '');
}, { immediate: true });

watch(model, (value) => {
  modelValue.value = Object.keys(value).join(',');
});

function toModel(value: string) {
  return value.split(',').reduce((acc, cur) => {
    if (cur) {
      acc[cur] = true;
    }
    return acc;
  }, {} as { [key: string]: boolean; });
}

const inputValue = computed(() => {
  return model.value ? Object.keys(model.value).join(',') : '';
});
</script>

<style scoped>

</style>
