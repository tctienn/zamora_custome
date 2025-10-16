<template>
  <div
    ref='treeRef'
    class='flex flex-column gap-2'>
    <Tree
      v-model:expanded-keys='expandedKeys'
      v-model:selection-keys='selectedKeys'
      class='w-25rem'
      highlight-on-select
      :pt='{
        label: {
          style: {
            "flex-grow": 1,
          }
        }
      }'
      selection-mode='single'
      :value='treeModel'>
      <template #default='{node}'>
        <div class='flex justify-content-between show-on-hover'>
          {{ node.label }}
          <i
            class='pi pi-pencil'
            @click='edit(node.key)'></i>
        </div>
      </template>
      <template #edit='{node}'>
        <div
          class='label-editable'
          contenteditable
          @blur='save(node.key, trim(($event.target as HTMLElement)?.innerText))'
          @keyup.enter.prevent='save(node.key, trim(($event.target as HTMLElement)?.innerText))'
          @keyup.esc='cancelEdit(node.key)'>
          {{ node.label }}
        </div>
      </template>
    </Tree>

  </div>
</template>

<script lang='ts' setup>
import type { MutateResult } from '@vue/apollo-composable';
import { omit, trim } from 'lodash';
import type { TreeSelectionKeys } from 'primevue/tree';
import type { TreeNode } from 'primevue/treenode';
import { computed, inject, nextTick, ref, watch } from 'vue';

import { allEFormGroups, createEFormGroup, updateEFormGroup } from '@/apps/e-form/api/graphql/e-form-group';
import { convertGroupToTree, type EFormGroup } from '@/apps/e-form/model/e-form';

const newKeyPrefix = 'new-key-';
const { result } = allEFormGroups();
const groups = computed(() => result?.value?.eFormGroups as EFormGroup[] || []);
const treeModel = ref<TreeNode[]>([]);
const treeRef = ref<HTMLElement>();
watch(groups, (value) => {
  if (value) {
    treeModel.value = convertGroupToTree(value);
  } else {
    treeModel.value = [];
  }
});
const selectedKeys = ref<TreeSelectionKeys>();
const expandedKeys = ref<TreeSelectionKeys>();
const editing = ref(false);

function addGroup() {
  const firstGroup = selectedKeys.value ? Object.keys(selectedKeys.value)[0] : undefined;
  const firstNode = findFirstNode(treeModel.value, firstGroup);
  const key = `${newKeyPrefix}${new Date().getTime()}`;
  if (firstNode) {
    const newGroup: TreeNode = {
      key,
      label: 'New Group',
      data: {},
      parentKey: firstNode.key,
      type: 'edit'
    };
    if (!firstNode.children) {
      firstNode.children = [];
    }
    firstNode.children?.push(newGroup);
    if (firstNode.key) {
      expandedKeys.value = {
        ...expandedKeys.value,
        [firstNode.key]: true
      };
    }
  } else {
    const newGroup: TreeNode = {
      key,
      label: 'New Group',
      data: {},
      type: 'edit'
    };
    treeModel.value.push(newGroup);
  }
  selectedKeys.value = { [key.toString()]: true };

  nextTick(selectFirstInput);
}

defineExpose({ addGroup });

function findFirstNode(tree: TreeNode[], key: string | undefined): TreeNode | undefined {
  if (!key) {
    return undefined;
  }
  for (const node of tree) {
    if (node.key === key) {
      return node;
    }
    if (node.children) {
      const found = findFirstNode(node.children, key);
      if (found) {
        return found;
      }
    }
  }
  return undefined;
}

function findParentNode(tree: TreeNode[], key: string): TreeNode | undefined {
  for (const node of tree) {
    if (node.children) {
      for (const child of node.children) {
        if (child.key === key) {
          return node;
        }
      }
      const found = findParentNode(node.children, key);
      if (found) {
        return found;
      }
    }
  }
  return undefined;
}

function selectFirstInput() {
  const node = treeRef.value?.querySelector('div[contenteditable]') as HTMLElement;
  if (node) {
    node.focus();
    editing.value = true;
  }
}

function edit(key: string | undefined) {
  const node = findFirstNode(treeModel.value, key);
  if (node) {
    node.type = 'edit';
    editing.value = true;
    nextTick(selectFirstInput);
  }
}

function save(key: string, label: string | undefined) {
  const node = findFirstNode(treeModel.value, key);
  const payload = omit({
    ...node?.data || {},
    ...{
      name: label,
      parentId: findParentNode(treeModel.value, key)?.key
    }
  }, 'id');
  let run: MutateResult<any>;
  if (key.startsWith(newKeyPrefix)) {
    run = createEFormGroup().mutate({ payload });
  } else {
    run = updateEFormGroup().mutate({
      id: key,
      payload
    });
  }
  run.then((res) => {
    const group = (res?.data?.createEFormGroup || res?.data?.updateEFormGroup) as EFormGroup | undefined;
    if (group) {

      if (node) {
        node.data = group;
        node.key = group.id;
        node.label = group.name;
        node.type = undefined;
        editing.value = false;
      }
    }
  });

}

function cancelEdit(key: string) {
  const node = findFirstNode(treeModel.value, key);
  if (node) {
    node.type = undefined;
    editing.value = false;
  }
}

const selectedGroupId = inject('selectedGroupId', ref<string | undefined>());
watch(selectedKeys, (newVal) => {
  if (newVal) {
    selectedGroupId.value = Object.keys(newVal)[0];
  } else {
    selectedGroupId.value = undefined;
  }
});
</script>

<style scoped>
:deep(.p-treenode) {
  .show-on-hover {
    :is(i) {
      opacity: 0;
    }
  }
}

:deep(.p-treenode:hover) {
  .show-on-hover {
    :is(i) {
      opacity: 1;
    }
  }
}

.label-editable {
  outline: none;
}

</style>