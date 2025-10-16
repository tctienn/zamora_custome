<template>
  <Tree
    v-model:expanded-keys='expandedKeys'
    v-model:selection-keys='selected'
    highlight-on-select
    :pt='{
      label: {
        class: "w-full"
      }
    }'
    scroll-height='calc(100vh - 12rem)'
    selection-mode='single'
    :value='model'
    @node-expand='emitUpdateCount'
    @node-select='selectNode'>
    <template #default='{node}'>
      <div
        class='flex gap-2 justify-content-between relative w-full'
        :class='{"font-bold": node["level"] < 2, "text-blue-custom" : !node.key}'>
        <div>
          <i
            v-if='!node.key'
            class='absolute  mr-4  pi  pi-folder'
            style='left: -2rem'></i>
          {{ node.label }}
        </div>
        <div v-if='node["count"]'>{{ node['count'] }}</div>
      </div>
    </template>
  </Tree>
</template>

<script lang='ts' setup>
import type { TreeExpandedKeys, TreeSelectionKeys } from 'primevue/tree';
import Tree from 'primevue/tree';
import type { TreeNode } from 'primevue/treenode';
import { inject, type PropType, ref, watch } from 'vue';

import { getAllOrganizationPublicGraphql } from '@/apps/admin/api/graphql/organization-graphql-api';
import { convertToOrganizationTreeNodes } from '@/apps/hrm/helpers/utils';
import { useHrmProfileStore } from '@/common/store/hrm-profile';
import { useGlobalSearchStore } from '@/common/store/search';

const props = defineProps({
  undefinedOrganization: {
    type: String,
    default: undefined
  }
});
const emits = defineEmits(['updateCount']);
const idsQueue: string[] = [];
let isProcessing = false;
const model = defineModel({
  type: Array as PropType<TreeNode[]>,
  default: []
});
const { setTreeUnitData } = useHrmProfileStore();
const expandedKeys = ref<TreeExpandedKeys>();
const selected = ref<TreeSelectionKeys>();
const organizationId = inject('organizationId', ref<string>());
const initialOrganizationId = inject('initialOrganizationId', ref<string>());
const advancedSearchStore = useGlobalSearchStore();
const { setIsUsingAdvancedSearch, setAdvancedSearchValue } = advancedSearchStore;
watch(organizationId, (value) => {
  if (value) {
    selected.value = { [value]: true };
  } else {
    // Clear selection when organization ID is empty (e.g., when using advanced search)
    selected.value = {};
  }
});

function firstLevelExpand(tree: TreeNode[]): TreeExpandedKeys {
  const keys: TreeExpandedKeys = {};
  tree.forEach(n => {
    keys[n.key as keyof TreeExpandedKeys] = true;
  });
  return keys;
}

function selectFirstNode(tree: TreeNode[]): TreeExpandedKeys {
  const keys: TreeExpandedKeys = {};
  if (tree.length > 0) {
    keys[tree[0].key as keyof TreeExpandedKeys] = true;
  }
  return keys;
}

getAllOrganizationPublicGraphql().onResult((res) => {
  model.value = convertToOrganizationTreeNodes(res.data?.allOrganizationPublic || []);
  if (props.undefinedOrganization) {
    model.value.push({
      key: '',
      label: props.undefinedOrganization,
      level: 0
    });
  }
  setTreeUnitData(model.value);
  expandedKeys.value = firstLevelExpand(model.value);
  selected.value = selectFirstNode(model.value);
  initialOrganizationId.value = model.value[0]?.key;
  if (model.value[0]) {
    selectNode(model.value[0]);
  }

  model.value.forEach(n => {
    emits('updateCount', n.key);
    emitUpdateCount(n);
  });
});

function selectNode(node: TreeNode) {

  // First, disable advanced search mode
  setIsUsingAdvancedSearch(false);
  setAdvancedSearchValue(undefined);

  // Then set the organization ID, which should trigger normal search
  organizationId.value = node.key;

}

function emitUpdateCount(node: TreeNode, force = false): void {
  node.children?.forEach(n => {
    if (force || n['count'] === undefined) {
      if (n.key) {
        addToQueue(n.key);
      }
    }
  });
}

function updateModelCount(key: string, count: number): void {
  const cloneTree = structuredClone(model.value);
  updateCount(cloneTree, key, count);
  model.value = cloneTree;
}

function emitUpdateCountForCurrentExpandedNodes(): void {
  if (expandedKeys.value) {
    Object.keys(expandedKeys.value).forEach(key => {
      const node = findNodeInTree(key, model.value);
      if (node) {
        addToQueue(key);
        emitUpdateCount(node, true);
      }
    });
  }
}

defineExpose({
  updateModelCount,
  emitUpdateCountForCurrentExpandedNodes
});

function updateCount(tree: TreeNode[], key: string, count: number): void {
  for (const node of tree) {
    if (node.key === key) {
      node.count = count;
      return;
    }
    if (node.children && node.children.length > 0) {
      updateCount(node.children, key, count);
    }
  }
}

function findNodeInTree(key: string, tree: TreeNode[]): TreeNode | undefined {
  for (const node of tree) {
    if (node.key === key) {
      return node;
    }
    if (node.children && node.children.length > 0) {
      const found = findNodeInTree(key, node.children);
      if (found) {
        return found;
      }
    }
  }
}

function addToQueue(id: string): void {
  if (!idsQueue.includes(id)) {
    idsQueue.push(id);
    if (!isProcessing) {
      processQueue();
    }
  }
}

function processQueue(): void {
  if (idsQueue.length > 0) {
    isProcessing = true;
    const id = idsQueue.shift();
    if (id) {
      emits('updateCount', id);
    }
    setTimeout(processQueue, 200);
  } else {
    isProcessing = false;
  }
}

</script>

<style lang='scss'>
.text-blue-custom {
  color: var(--text-blue-custom);
}
</style>