import { defineStore, storeToRefs } from 'pinia';
import type { TreeExpandedKeys } from 'primevue/tree';
import type { TreeNode } from 'primevue/treenode';
import { ref, watch } from 'vue';
import { useRoute } from 'vue-router';

import { getTreeFolder } from '@/apps/ecm/api/rest/manage';
import type { FolderTree } from '@/apps/ecm/model/file-folder';
import { useStorageStore } from '@/apps/ecm/store/storage';
import i18n from '@/common/i18n';

const { t } = i18n.global;
export const useEcmTree = defineStore(
  'ecm_tree',
  () => {
    const tree = ref<TreeNode[]>();
    const expands = ref<TreeExpandedKeys>();
    const collapse = ref(true);

    const {
      serviceType,
      rootFolderId,
    } = storeToRefs(useStorageStore());

    const route = useRoute();

    function defaultExpanded(): TreeExpandedKeys {
      return tree.value?.length ? { [tree.value[0].key ?? '']: true } : {};
    }

    function mapToMenu(folder: FolderTree | TreeNode, url: string): TreeNode {
      if (folder.children?.length) {
        folder.children = folder.children.map(f => mapToMenu(f, url));
      }
      return {
        key: folder.id,
        label: 'label' in folder ? folder.label : folder.name,
        to: {
          path: url,
          query: { folderId: folder.id }
        },

        children: folder.children
      };
    }

    function updateTreeFolder() {
      if (rootFolderId.value) {
        getTreeFolder(serviceType.value, rootFolderId.value)
          .then(f => {
            if (f) {
              const menu = mapToMenu(f, route.fullPath);
              menu.label = t('ecm.menu.ecm');
              menu.to.query = undefined;
              tree.value = Array.of(menu);
            }
          });
      }
    }

    watch(tree, () => {
      expands.value = defaultExpanded();
    });

    watch(rootFolderId, updateTreeFolder);

    watch(() => [serviceType, rootFolderId], updateTreeFolder);
    return {
      tree,
      collapse,
      expands,
      updateTreeFolder,
    };
  });