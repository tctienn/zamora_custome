<template>
  <div class='flex flex-column flex-shrink-0 h-full w-full'>
    <Tree
      v-model:selection-keys='selectedFolderId'
      class='border-noround-bottom border-noround-right ecm-tree flex-grow-1 overflow-y-auto'
      :expanded-keys='expands'
      selection-mode='single'
      :value='tree'>
      <template #default='{node}'>
        <div
          class='align-items-center flex gap-2 text-color'
          :class='{"font-bold text-primary current-folder": isCurrentFolder(node.key || "")}'>
          <AppIcon
            class='text-orange-400'
            fill
            :name='getFolderIcon(node.key || "")'
            size='1.5'/>
          {{ node.label }}
        </div>
      </template>
    </Tree>
  </div>
</template>

<script lang='ts' setup>
import { storeToRefs } from 'pinia';
import type { TreeSelectionKeys } from 'primevue/tree';
import { nextTick, onMounted, onUnmounted } from 'vue';

import { useEcmTree } from '@/apps/ecm/store/ecm_tree';
import EventBus from '@/common/helpers/event-bus';

const store = useEcmTree();
const {
  tree,
  expands,
} = storeToRefs(store);

const selectedFolderId = defineModel<TreeSelectionKeys>('selectedFolderId');

function getFolderIcon(folderId: string) {
  return selectedFolderId.value?.[folderId] ? 'folder_open' : 'folder';
}

function isCurrentFolder(folderId: string) {
  return selectedFolderId.value?.[folderId];
}

onMounted(() => {
  nextTick(() => {
    if (!tree.value) {
      store.updateTreeFolder();
    }
  });
  EventBus.on('updateFolderTree', store.updateTreeFolder);
});

onUnmounted(() => {
  EventBus.off('updateFolderTree', store.updateTreeFolder);
});
</script>

<style scoped>

</style>
