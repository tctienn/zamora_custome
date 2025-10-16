<template>
  <div class='advanced-search grid p-fluid'>
    <!-- Tree Panel -->
    <div class='col-12 md:col-5 pl-0 py-0'>
      <Tree
        v-model:selectionKeys='selectedKey'
        class='w-full'
        :filter='true'
        :filter-function='customFilter'
        filter-mode='strict'
        selection-mode='checkbox'
        :value='nodes'>
      </Tree>
      <Button
        class='border-round-sm justify-content-center mt-2 mx-auto text-center w-8rem'
        severity='warning'
        @click='clearAll'>
        Xóa tất cả
      </Button>
    </div>

    <!-- Search Builder -->
    <div
      class='border-1 border-200 border-round-lg col-12 h-full md:col-7 p-0 search-item-cpm'>
      <DynamicSearchBuilder
        ref='builderRef'
        v-model='formData'
        :fields='selectedFields'
        @remove-field='handleRemoveField'
        @update:model-value='handleUpdateModelValue'/>
    </div>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import type { TreeNode } from 'primevue/treenode';
import { onMounted, type PropType, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import DynamicSearchBuilder from '@/apps/hrm/components/DynamicSearchBuilder.vue';
import { useGlobalSearchStore } from '@/common/store/search';

const props = defineProps({
  nodes: {
    type: Array as PropType<TreeNode[]>,
    default: () => []
  }
});
const { t } = useI18n();
const builderRef = ref();
const formData = ref<{ [key: string]: any }>({});

const advancedSearchStore = useGlobalSearchStore();
const { advancedSearch } = storeToRefs(advancedSearchStore);
const { setAdvancedSearchValue } = advancedSearchStore;

const selectedKey = ref<any>({});
const selectedFields = ref<any[]>([]);

const extractCheckedLeafNodes = (nodes: TreeNode[], selectedKey: any) => {
  const result: TreeNode[] = [];

  const dfs = (node: TreeNode) => {
    const key = node.key;
    const selection = selectedKey[key as string];

    // Nếu là node lá và được chọn => thêm vào kết quả
    const isLeaf = !node.children || node.children.length === 0;
    const isChecked = selection?.checked || selection?._custom?.value?.checked;

    if (isLeaf && isChecked) {
      result.push(node);
    }

    // Nếu có con thì duyệt tiếp
    if (node.children) {
      node.children.forEach(dfs);
    }
  };

  nodes.forEach(dfs);
  return result;
};

const formatConditions = (payload: Record<string, { operator: string; value: any }>) => {
  const result: Record<string, any> = {};
  Object.entries(payload).forEach(([key, condition]) => {
    const [group, field] = key.split('.');
    if (!result[group]) {
      result[group] = {};
    }
    result[group][field] = condition;
  });

  return result;
};

watch(selectedKey, (newKey) => {
  console.log('🔄 selectedKey changed:', newKey);
  const newSelectedFields = extractCheckedLeafNodes(props.nodes, newKey);
  const newSelectedFieldKeys = newSelectedFields.map(field => field.key);

  // Track if any formData entries were removed
  let formDataChanged = false;
  
  // Remove formData entries for fields that are no longer selected
  Object.keys(formData.value).forEach(fieldKey => {
    if (!newSelectedFieldKeys.includes(fieldKey)) {
      delete formData.value[fieldKey];
      formDataChanged = true;
    }
  });
  
  // Trigger reactivity for formData if changes were made
  if (formDataChanged) {
    formData.value = { ...formData.value };
  }
  
  selectedFields.value = newSelectedFields;
}, { deep: true });

const handleRemoveField = (model: [], fieldKey: string) => {
  // Hủy chọn node trong Tree
  const prefix = fieldKey.split('.')[0];
  const prefixNode = Object.keys(selectedKey.value);
  const key = Object.keys(model);
  const isPrefixNode = key.some((node) => node.startsWith(prefix));
  selectedKey.value[fieldKey] = undefined;
  delete selectedKey.value[fieldKey];
  if (prefixNode.includes(prefix) && !isPrefixNode) {
    delete selectedKey.value[prefix];
  }

  // Xóa field trong formData
  if (formData.value && formData.value[fieldKey]) {
    delete formData.value[fieldKey];
    // đảm bảo reactivity
    formData.value = { ...formData.value };
  }

  console.log(formData.value);
};

const handleUpdateModelValue = (val: any) => {
  console.log('🔄 handleUpdateModelValue called with:', val);
  
  // Filter out fields that are not in selectedFields to prevent conflict
  const currentSelectedFieldKeys = selectedFields.value.map(field => field.key);
  const filteredVal: any = {};
  
  Object.keys(val).forEach(key => {
    if (currentSelectedFieldKeys.includes(key)) {
      filteredVal[key] = val[key];
    }
  });
  
  formData.value = filteredVal;
};

const clearAll = () => {
  selectedKey.value = {};
  formData.value = {};
};

function getFormData() {
  return formatConditions(formData.value);
}

const persistState = () => {
  setAdvancedSearchValue({
    formData: formData.value,
    selectedKey: selectedKey.value
  });
};

const restoreState = () => {
  const stored = advancedSearch.value;
  if (stored) {
    formData.value = stored.formData || {};
    selectedKey.value = stored.selectedKey || {};
  }
};

function normalizeString(str: string): string {
  return str
    .normalize('NFD') // Tách chữ và dấu
    .replace(/[\u0300-\u036f]/g, '') // Xoá dấu
    .replace(/đ/g, 'd') // Chuyển đ -> d
    .replace(/Đ/g, 'D') // Chuyển Đ -> D
    .toLowerCase(); // Chuyển thành thường
}

function customFilter(node: TreeNode, searchText: string): boolean {
  const rawLabel = typeof node.label === 'string' ? t(node.label) : '';
  const normalizedLabel = normalizeString(rawLabel);
  const normalizedSearch = normalizeString(searchText);

  // Tách từ trong label ra và kiểm tra từng từ
  const labelWords = normalizedLabel.split(/\s+/);
  return labelWords.some(word => word.startsWith(normalizedSearch));
}

onMounted(() => {
  restoreState();
});

defineExpose({
  getFormData,
  persistState
});

</script>

<style scoped>
.advanced-search {
  background: var(--bg-white-custom);
  border-radius: 8px;
  height: calc(100% - 20px);
  margin: auto;
  width: 100%;
}

:deep(.p-overlaypanel) {
  background: var(--surface-card);
  border: 1px solid var(--surface-border);
  border-radius: 8px;
}

:deep(.p-tree-wrapper) {
  overflow: auto;
  height: 500px;
}

:deep(.p-checkbox) {
  margin-right: 0;
}

:deep(.p-tree .p-checkbox .p-checkbox-input) {
  border-width: 1px;
  border-radius: 4px;
  width: 20px;
  height: 20px;
}

:deep(.p-tree .p-checkbox .p-checkbox-box) {
  border-width: 1px;
  border-radius: 4px;
  width: 20px;
  height: 20px;
}

:deep(.p-checkbox.p-highlight .p-checkbox-box) {
  background-color: var(--blue-500);
  border-color: var(--blue-500);
}

:deep(.p-checkbox.p-highlight .p-checkbox-box:hover) {
  border-color: var(--blue-500);
}

.search-item-cpm {
  height: 580px;
  overflow: auto;
}

:deep(.p-tree .p-treenode) {
  font-weight: 600;
}

:deep(.p-tree .p-treenode.p-treenode-leaf) {
  font-weight: 400 !important;
}
</style>
