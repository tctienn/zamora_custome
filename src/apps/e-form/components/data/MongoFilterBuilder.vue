<template>
  <div class='mongo-filter-builder'>
    <div
      v-for='(condition, index) in filters'
      :key='index'
      class='condition-row'>
      <Dropdown
        v-model='condition.field'
        class='w-9rem'
        :options='fields'
        placeholder='Trường'/>

      <Dropdown
        v-model='condition.operator'
        option-label='label'
        option-value='value'
        :options='operatorOptions'/>
      <InputText
        v-if='!isArrayOperator(condition.operator)'
        v-model='condition.value'
        class='w-10rem'
        placeholder='Giá trị'/>

      <InputText
        v-else
        class='w-10rem'
        :model-value='getArrayValue(condition)'
        placeholder='Danh sách giá trị'
        @update:model-value='updateArrayValue($event, condition)'/>
      <i
        v-tooltip='t("common.remove")'
        class='cursor-pointer ml-auto pi pi-trash text-red-500'
        @click='remove(index)'></i>

    </div>
    <Button
      class='mr-auto'
      icon='pi pi-plus'
      label='Thêm điều kiện'
      size='small'
      @click='add'/>
  </div>
</template>

<script lang='ts' setup>

import { computed, reactive, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { useDynamicCategoryKeys } from '@/apps/e-form/api/graphql/category';
import type { MongoFilterCondition } from '@/apps/e-form/model/data-source';

const props = defineProps<{
  modelValue: MongoFilterCondition[]
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: MongoFilterCondition[]): void
}>();

const filters = reactive<MongoFilterCondition[]>([...props.modelValue]);

watch(
  () => filters,
  () => {
    emit('update:modelValue', [...filters]);
  },
  { deep: true }
);
const { t } = useI18n();
const { result: keyResult } = useDynamicCategoryKeys();
const fields = computed((): string[] => keyResult.value?.dynamicCategoryKeys || []);
const operatorOptions = [
  {
    label: '=',
    value: '$eq'
  },
  {
    label: '≠',
    value: '$ne'
  },
  {
    label: '>',
    value: '$gt'
  },
  {
    label: '≥',
    value: '$gte'
  },
  {
    label: '<',
    value: '$lt'
  },
  {
    label: '≤',
    value: '$lte'
  },
  {
    label: 'in',
    value: '$in'
  },
  {
    label: 'not in',
    value: '$nin'
  },
];

function add() {
  filters.push({
    field: '',
    operator: '$eq',
    value: ''
  });
}

function remove(index: number) {
  filters.splice(index, 1);
}

function isArrayOperator(op: string) {
  return op === '$in' || op === '$nin';
}

function getArrayValue(cond: MongoFilterCondition): string {
  return Array.isArray(cond.value) ? cond.value.join(', ') : '';
}

function updateArrayValue(value: string, cond: MongoFilterCondition) {
  cond.value = value
    .split(',')
    .map(v => v.trim())
    .filter(v => v.length > 0);
}
</script>

<style scoped>
.mongo-filter-builder {
  display: flex;
  flex-direction: column;
  gap: .25rem;
}

.condition-row {
  display: flex;
  gap: .25rem;
  align-items: center;
}
</style>