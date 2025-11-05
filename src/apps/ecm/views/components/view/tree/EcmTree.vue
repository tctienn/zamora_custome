<template>
  <div class='flex flex-column flex-shrink-0 h-full w-full'>
    <!--    <div-->
    <!--      v-if='collapse'-->
    <!--      class='collapse cursor-pointer ecm-tree flex-grow-1 p-3 text-color'-->
    <!--      @click='expandOrCollapseTree'>-->
    <!--      <p-->
    <!--        v-tooltip='t("common.expand")'-->
    <!--        class='h-10rem'>{{ t('ecm.storage.tree') }}</p>-->
    <!--    </div>-->

    <Tree class='border-noround-bottom border-noround-right ecm-tree flex-grow-1 overflow-y-auto'
      :expanded-keys='expands' :value='tree'>
      <template #default='{ node }'>
        <router-link class='align-items-center flex gap-2 text-color'
          :class='{ "font-bold text-primary current-folder": isCurrentFolder(node.to.query?.folderId || "") }'
          :to='node.to'>
          <AppIcon class='text-orange-400' fill :name='getFolderIcon(node.to.query?.folderId || "")' size='1.5' />
          {{ node.label }}
        </router-link>
      </template>
    </Tree>

    <!--    <ButtonIcon-->
    <!--      v-tooltip='collapse ? t("common.expand"): t("common.collapse")'-->
    <!--      class='border-noround-top'-->
    <!--      :icon='collapse ? "keyboard_double_arrow_right" : "keyboard_double_arrow_left"'-->
    <!--      severity='success'-->
    <!--      @click='expandOrCollapseTree'/>-->
  </div>

</template>

<script setup lang='ts'>
import { storeToRefs } from 'pinia';
import { nextTick, onMounted, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';

import { useEcmTree } from '@/apps/ecm/store/ecm_tree';
import EventBus from '@/common/helpers/event-bus';

const store = useEcmTree();
const {
  tree,
  expands,
} = storeToRefs(store);

const route = useRoute();

function getFolderIcon(folderId: string) {
  return route.query['folderId'] === folderId ? 'folder_open' : 'folder';
}

function isCurrentFolder(folderId: string) {
  return route.query['folderId'] === folderId;
}

// function expandOrCollapseTree() {
//   collapse.value = !collapse.value;
// }

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

<script lang='ts'>
export default { name: 'EcmTree' };
</script>

<style scoped lang='scss'>
.ecm-tree {
  background-color: var(--surface-c);

  //min-width: 15rem;
  //max-width: 20rem;

  //&.collapse {
  //  min-width: 0;
  //  width: 4rem;
  //  writing-mode: vertical-lr;
  //}
}

:deep(.p-tree) {
  padding: 0;
  border: 0;

  .p-tree-container {
    overflow-x: hidden;

    .p-treenode-content {
      width: 100%;

      .p-treenode-label {
        width: 100%;

        .current-folder {
          background-color: var(--surface-border);
          margin: 0 -0.5rem;
          padding: 0.25rem 0.5rem;
          border-radius: 0.5rem;
        }
      }
    }
  }
}
</style>
