<template>
  <FormInputWrapper
    v-bind='$props'>
    <NamedDropdown
      v-model='value'
      class='w-full'
      filter
      :input-id='name'
      :invalid='!!error'
      :is-multi-select='multiple'
      :is-show-clear='$props.isShowClear'
      :name='name'
      option-label='label'
      option-value='value'
      :options='getOptions'
      v-bind='omit($attrs, "class")'/>
  </FormInputWrapper>
</template>

<script lang='ts' setup>
import { omit } from 'lodash';
import { computed, type PropType, ref } from 'vue';

import { useCategoryDataOptions } from '@/apps/e-form/api/graphql/category';
import { convertToMongoFilter } from '@/apps/e-form/components/data/convert';
import { ElementMode } from '@/apps/e-form/components/element';
import FormInputWrapper from '@/apps/e-form/components/FormInputWrapper.vue';
import type { DataSourceConfig, StaticDataSource } from '@/apps/e-form/model/data-source';

const props = defineProps({
  mode: {
    type: String as PropType<ElementMode>,
    required: true,
  },
  label: {
    type: String,
    required: true
  },
  name: {
    type: String,
    default: ''
  },
  options: {
    type: Array,
    default: () => []
  },
  error: {
    type: String,
    default: undefined
  },
  required: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  },
  isShowClear: {
    type: Boolean,
    default: false
  },
  multiple: {
    type: Boolean,
    default: false
  },
  datasource: {
    type: Object as PropType<DataSourceConfig>,
    default: undefined
  },
});

// eslint-disable-next-line vue/require-prop-types
const value = defineModel();

const catalogOptions = ref<{ label: string; value: string }[]>([]);

if (props.datasource?.dataType === 'catalog' && props.datasource?.group) {
  useCategoryDataOptions(props.datasource.group, convertToMongoFilter(props.datasource.filters))
    .onResult(res => {
      catalogOptions.value = res?.data?.categoryDataOptions || [];
    });
}

const getOptions = computed(() => {
  if (props.datasource?.dataType === 'catalog' && props.datasource?.group) {
    return catalogOptions.value;
  }
  return (props.datasource as StaticDataSource | undefined)?.options || props.options;
});
</script>

<style scoped>

</style>