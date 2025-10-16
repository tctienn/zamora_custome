<template>
  <Button
    :disabled='!parentFolderId'
    icon='pi pi-arrow-up'
    outlined
    size='small'
    @click='parentFolderId && emits("goToFolder", {id: parentFolderId})'/>
</template>

<script lang='ts' setup>
import { storeToRefs } from 'pinia';
import type { TreeNode } from 'primevue/treenode';
import { computed } from 'vue';

import { useEcmTree } from '@/apps/ecm/store/ecm_tree';
import { useStorageStore } from '@/apps/ecm/store/storage';

const emits = defineEmits(['goToFolder']);
const { folderId } = storeToRefs(useStorageStore());
const { tree } = storeToRefs(useEcmTree());

const parentFolderId = computed(() => {
  function findParentId(tree: TreeNode, folderId: string): string | undefined {
    const children = tree.children;
    if (!children) {
      return undefined;
    }
    for (const item of children) {
      if (item.key === folderId) {
        return tree.key;
      }
      const find = findParentId(item, folderId);
      if (find) {
        return find;
      }
    }
    return undefined;
  }

  if (tree.value) {
    for (const item of tree.value) {
      const parentId = findParentId(item, folderId.value);
      if (parentId) {
        return parentId;
      }
    }
  }

  return undefined;
});
</script>

<style scoped>

</style>
