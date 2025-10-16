<template>
  <div
    ref='rootEl'
    class='relative w-full'>
    <div
      class='p-component p-dropdown p-inputtext py-2 w-full'
      :class="{ 'opacity-50 pointer-events-none': props.disabled }"
      @click='toggleDropdown'>
      <div class='flex flex-wrap gap-2 items-center'>
        <template v-if="props.selectionMode === 'multiple' && selectedLabels.length > 0">
          <span
            v-for='item in selectedLabels'
            :key='item.key'
            class='align-items-center bg-primary border-round-xl flex gap-1 px-2 py-1 text-sm text-white'>
            {{ item.label }}
            <i
              class='cursor-pointer ml-1 pi pi-times'
              style='font-size: 10px;'
              @click.stop='removeItem(item.key)' />
          </span>
        </template>
        <template v-else>
          <span class='p-dropdown-label'>{{ displayLabel }}</span>
        </template>
      </div>
      <span class='p-dropdown-trigger'><i class='pi pi-chevron-down'></i></span>
    </div>

    <div
      v-if='visible'
      class='absolute bg-white border dropdown-wrapper mt-1 rounded shadow-2 surface-overlay w-full z-5'
      @click.stop>
      <!-- Search box (cố định) -->
      <div class='bg-white border-bottom dropdown-search p-3 z-10'>
        <IconField>
          <InputIcon class='pi pi-search' />
          <InputText
            v-model='searchText'
            class='w-full' />
        </IconField>
      </div>

      <!-- Scrollable Tree -->
      <div class='dropdown-tree-scroll'>
        <Tree
          :expanded-keys='expandedKeys'
          :selection-keys='selectionKey'
          :selection-mode='props.selectionMode'
          :value='filteredTree'
          @node-select='onNodeSelect'
          @node-toggle='onNodeToggle'
          @node-unselect='onNodeUnselect'
          @update:selection-keys='onSelectionChange'/>
      </div>
    </div>
  </div>
</template>

<script setup>
import IconField from 'primevue/iconfield';
import InputIcon from 'primevue/inputicon';
import InputText from 'primevue/inputtext';
import Tree from 'primevue/tree';
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';

const props = defineProps({
  modelValue: {
    type: Object, // sửa từ Array thành Object
    default: () => ({}),
  },
  options: {
    type: Array,
    default: () => [],
  },
  placeholder: {
    type: String,
    default: 'Chọn giá trị...',
  },
  searchPlaceholder: {
    type: String,
    default: 'Tìm kiếm...',
  },
  selectionMode: {
    type: String,
    default: 'single',
    validator: (val) => ['single', 'multiple'].includes(val),
  },
  disabled: {
    type: Boolean,
    default: false,
  },
});
const emit = defineEmits(['update:modelValue']);

const visible = ref(false);
const searchText = ref('');
const expandedKeys = ref({});
const selectionKey = ref({});
const selectedNode = ref(null);

watch(
  () => props.modelValue,
  (val) => {
    selectionKey.value = { ...val || {} };
    if (props.selectionMode === 'single') {
      const key = Object.keys(selectionKey.value)[0];
      selectedNode.value = findNodeByKey(props.options, key);
    }
  },
  { immediate: true }
);

function toggleDropdown() {
  if (!props.disabled) {
    visible.value = !visible.value;
  }
}

function onNodeToggle(e) {
  expandedKeys.value = e.value;
}

function onNodeSelect(node) {
  const key = node.key;
  if (props.selectionMode === 'single') {
    const newValue = { [key]: true };
    selectionKey.value = newValue;
    selectedNode.value = node;
    emit('update:modelValue', newValue);
    visible.value = false;
  }
}

function onNodeUnselect() {
  if (props.selectionMode === 'single') {
    selectionKey.value = {};
    selectedNode.value = null;
    emit('update:modelValue', {});
  }
}

function onSelectionChange(newKeys) {
  if (props.selectionMode === 'multiple') {
    selectionKey.value = newKeys;
    emit('update:modelValue', { ...newKeys });
  }
}

function findNodeByKey(nodes, key) {
  for (const node of nodes) {
    if (node.key === key) {
      return node;
    }
    if (node.children) {
      const found = findNodeByKey(node.children, key);
      if (found) {
        return found;
      }
    }
  }
  return null;
}

function filterTree(nodes, keyword) {
  if (!keyword) {
    return nodes;
  }

  const lower = keyword.toLowerCase();
  const result = [];
  const expandMap = {};

  for (const node of nodes) {
    const match =
      node.label?.toLowerCase().includes(lower)
      || node.children && filterTree(node.children, keyword).length > 0;

    if (match) {
      const filteredChildren = node.children ? filterTree(node.children, keyword) : null;
      result.push({
        ...node,
        children: filteredChildren 
      });
      expandMap[node.key] = true;
    }
  }

  expandedKeys.value = expandMap;
  return result;
}

const filteredTree = computed(() => filterTree(props.options, searchText.value));

const displayLabel = computed(() => {
  const keys = Object.keys(props.modelValue || {});
  if (props.selectionMode === 'single') {
    return findNodeByKey(props.options, keys[0])?.label || props.placeholder;
  } else {
    const labels = keys.map((key) => findNodeByKey(props.options, key)?.label).filter(Boolean);
    return labels.length > 0 ? labels.join(', ') : props.placeholder;
  }
});

const rootEl = ref(null); // tham chiếu đến div gốc của component
function removeItem(keyToRemove) {
  const newKeys = { ...selectionKey.value };
  delete newKeys[keyToRemove];
  selectionKey.value = newKeys;
  emit('update:modelValue', { ...newKeys });
}

function handleClickOutside(event) {
  if (rootEl.value && !rootEl.value.contains(event.target)) {
    visible.value = false;
  }
}
const selectedLabels = computed(() => {
  return Object.keys(props.modelValue || {})
    .map((key) => ({
      key,
      label: findNodeByKey(props.options, key)?.label || key
    }))
    .filter((item) => item.label);
});

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<style scoped>
.p-dropdown-label {
  display: inline-block;
  width: 100%;
  padding-block: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.p-dropdown-trigger {
  position: absolute;
  right: 0rem;
  top: 50%;
  transform: translateY(-50%);
}

:deep(.p-tree) {
  border: none;
  border-top: 1px solid #dee2e6;
  border-radius: 0;
}
.p-tree-selectable {
  padding: 0;
  padding: 1rem;
}

.dropdown-wrapper {
  max-height: 360px;
  display: flex;
  flex-direction: column;
  border-radius: 6px;
  overflow: hidden;
}

/* Ô tìm kiếm cố định trên */
.dropdown-search {
  flex-shrink: 0;
  position: sticky;
  top: 0;
  background: white;
  z-index: 2;
}

/* Cây được scroll riêng */
.dropdown-tree-scroll {
  overflow-y: auto;
  flex: 1;
  padding: 0.5rem 0;
}

.tag-chip {
  background-color: #e0e0e0;
  border-radius: 12px;
  padding: 0.25rem 0.5rem;
  font-size: 0.85rem;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
}
.tag-chip i {
  cursor: pointer;
}
</style>
