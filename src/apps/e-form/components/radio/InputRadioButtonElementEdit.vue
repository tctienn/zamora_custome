<template>
  <FormInputWrapper
    v-bind='$props'>
    <div class='flex justify-center'>
      <div class='flex flex-col gap-4'>
        <div
          v-for='category in getOptions'
          :key='category.value'
          class='align-items-center flex gap-2'>
          <RadioButton
            v-model='value'
            :disabled='disabled'
            :input-id='category.value'
            :name='category.value'
            :value='category.value'/>
          <label
            class='cursor-pointer'
            :for='category.value'>{{ category.label }}</label>
        </div>
      </div>
    </div>
  </FormInputWrapper>
</template>

<script lang='ts' setup>

import { computed, type PropType, ref, watch } from 'vue';

import { useCategoryDataOptions } from '@/apps/e-form/api/graphql/category';
import { convertToMongoFilter } from '@/apps/e-form/components/data/convert';
import { ElementMode } from '@/apps/e-form/components/element';
import FormInputWrapper from '@/apps/e-form/components/FormInputWrapper.vue';
import type { CatalogDataSource, DataSourceConfig, StaticDataSource } from '@/apps/e-form/model/data-source';

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
    type: Array as PropType<{ label: string; value: string }[]>,
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
  datasource: {
    type: Object as PropType<DataSourceConfig>,
    default: undefined
  },
});

// eslint-disable-next-line vue/require-prop-types
const value = defineModel();

const catalogOptions = ref<{ label: string; value: string }[]>([]);
watch(() => [props.datasource?.dataType, (props.datasource as CatalogDataSource)?.group], (newValue) => {
  const [dataType, group] = newValue;
  if (dataType === 'catalog' && group) {
    useCategoryDataOptions(group, convertToMongoFilter((props.datasource as CatalogDataSource)?.filters))
      .onResult(res => {
        catalogOptions.value = res?.data?.categoryDataOptions || [];
      });
  } else {
    catalogOptions.value = [];
  }
}, { immediate: true });

const getOptions = computed(() => {
  if (props.datasource?.dataType === 'catalog' && props.datasource?.group) {
    return catalogOptions.value;
  }
  return (props.datasource as StaticDataSource | undefined)?.options || props.options;
});
</script>

<style scoped>

</style>