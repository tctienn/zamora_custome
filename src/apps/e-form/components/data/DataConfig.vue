<template>
  <div>
    <div class='field'>
      <label>Nguồn dữ liệu</label>
      <Dropdown
        v-model='model.dataType'
        class='w-full'
        option-label='label'
        option-value='value'
        :options='typeOptions'></Dropdown>
    </div>

    <div
      v-if="model.dataType === 'static'"
      class='manual-options'>
      <div
        v-for='(option, index) in (model as StaticDataSource).options'
        :key='index'
        class='align-items-center flex gap-2'>
        <InputText
          v-model='option.label'
          placeholder='Label'/>
        <InputText
          v-model='option.value'
          placeholder='Value'/>
        <i
          class='cursor-pointer pi pi-trash text-red-500'
          @click='removeOption(index)'></i>
      </div>
      <Button
        icon='pi pi-plus'
        label='Thêm option'
        size='small'
        @click='addOption'/>
    </div>

    <div
      v-else-if="model.dataType === 'catalog'">
      <div class='field'>
        <label>Group:</label>
        <TreeSelect
          v-model='treeSelectKeys'
          class='w-full'
          :options='tree'
          selection-mode='single'/>
      </div>
      <div
        v-if='model.filters !== undefined'
        class='field'>
        <label>Filters:</label>
        <MongoFilterBuilder v-model='model.filters'/>
      </div>
    </div>
  </div>
</template>

<script lang='ts' setup>
import type { TreeSelectionKeys } from 'primevue/tree';
import type { TreeNode } from 'primevue/treenode';
import { computed, type PropType, reactive, ref, watch } from 'vue';

import type { CategoryGroupInterface } from '@/apps/admin/model/category';
import { useDynamicCategoryGroups } from '@/apps/e-form/api/graphql/category';
import MongoFilterBuilder from '@/apps/e-form/components/data/MongoFilterBuilder.vue';
import type { CatalogDataSource, DataSourceConfig, StaticDataSource } from '@/apps/e-form/model/data-source';
import { listToTree } from '@/common/helpers/utils';

const props = defineProps({
  modelValue: {
    type: Object as PropType<DataSourceConfig>,
    default: undefined
  }
});
const emit = defineEmits<{
  (e: 'update:modelValue', value: DataSourceConfig): void
}>();
const model = reactive<DataSourceConfig>(props.modelValue || {
  dataType: 'static',
  options: []
});
const typeOptions = [
  {
    label: 'Nhập thủ công',
    value: 'static'
  },
  {
    label: 'Từ Danh mục (MongoDB)',
    value: 'catalog'
  }
];

const { result: groupsResult } = useDynamicCategoryGroups();
const groups = computed((): CategoryGroupInterface[] => groupsResult.value?.dynamicCategoryGroups || []);
const tree = computed(() => listToTree(groups.value.map(g => ({
  key: g.code,
  label: g.name,
  data: g,
  parentId: g.parentCode,
  children: [],
} as TreeNode)), {
  id: 'key',
  parentId: 'parentId',
  children: 'children'
}));
const treeSelectKeys = ref<TreeSelectionKeys>({ [(model as CatalogDataSource).group]: true });

watch(treeSelectKeys, (keys) => {
  if (keys) {
    const firstKey = Object.keys(keys).find(k => keys[k]);
    if (firstKey) {
      (model as CatalogDataSource).group = firstKey;
      return;
    }
  }
  (model as CatalogDataSource).group = '';
}, { immediate: true });

watch(model, () => {
  emit('update:modelValue', model);
}, { deep: true });

watch(() => model.dataType, (newType) => {
  if (newType === 'static') {
    if ('group' in model) {
      delete (model as Partial<CatalogDataSource>).group;
      treeSelectKeys.value = {};
    }
    if ('filters' in model) {
      delete (model as Partial<CatalogDataSource>).filters;
    }
    (model as StaticDataSource).options = [];
  } else if (newType === 'catalog') {
    // Reset options when switching to catalog
    if ('options' in model) {
      delete (model as Partial<StaticDataSource>).options;
    }
    (model as CatalogDataSource).group = '';
    (model as CatalogDataSource).filters = [];
    treeSelectKeys.value = {};
  }
},);

function addOption() {
  if (model.dataType === 'static') {
    if (!model.options) {
      model.options = [];
    }
    model.options.push({
      label: '',
      value: ''
    });
  }
}

function removeOption(index: number) {
  if (model.dataType === 'static') {
    model.options?.splice(index, 1);
  }
}
</script>

<style scoped>

input, select, textarea {
  display: block;
  width: 100%;
  margin-bottom: 0.5rem;
}
</style>