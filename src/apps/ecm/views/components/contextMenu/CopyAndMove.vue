<template>
  <Dialog
    v-bind='DEFAULT_DIALOG_CONFIG'
    v-model:visible='visible'
    :header='t("ecm.storage.chooseFolderToMove")'
    style='width: 30%'
    @hide='emits("hide-dialog")'>

    <Tree
      v-model:expandedKeys='expandedFunctions'
      v-model:selectionKeys='selectedPermissions'
      class='border-none p-0'
      filter-mode='lenient'
      selection-mode='single'
      :value='nodes'>
    </Tree>
    <template #footer>
      <Button
        icon='pi pi-times'
        :label='t("common.close")'
        severity='danger'
        @click='emits("hide-dialog")'/>
      <Button
        icon='pi pi-check'
        :label='t("common.select")'
        @click='chooseFolder'/>
    </template>
  </Dialog>
</template>

<script setup lang='ts'>
import { storeToRefs } from 'pinia';
import type { TreeExpandedKeys, TreeSelectionKeys } from 'primevue/tree';
import type { TreeNode } from 'primevue/treenode';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { getRootFolderId, ServiceType } from '@/apps/ecm/api/graphql/file-manage';
import { getTreeFolder } from '@/apps/ecm/api/rest/manage';
import type { EcmFile, EcmFolder, FolderTree } from '@/apps/ecm/model/file-folder';
import { paste } from '@/apps/ecm/service/action-file-folder';
import { CopyPaste, useStorageStore } from '@/apps/ecm/store/storage';
import { DEFAULT_DIALOG_CONFIG } from '@/common/constants';

const props = withDefaults(defineProps<folderProps>(), {
  visibleDialog: false,
  isCopy: false
});

const emits = defineEmits(['hide-dialog']);

const store = useStorageStore();
const {
  selectedFileFolders,
  copyPasteFileFolders,
  copyPasteAction,
  serviceType,
  rootFolderId
} = storeToRefs(store);

interface folderProps {
    visibleDialog: boolean,
    isCopy: boolean
}

const { t } = useI18n() || {};
const visible = ref(props.visibleDialog);
const isCopy = ref(props.isCopy);
const nodes = ref<TreeNode[]>([]);
const selectedPermissions = ref<TreeSelectionKeys>({});
const expandedFunctions = ref<TreeExpandedKeys>({});
if (serviceType.value == ServiceType.SHARED) {
  const { onResult } = getRootFolderId(ServiceType.PERSON, '');
  onResult((res) => {
    getTreeFolder(ServiceType.PERSON, res.data.rootFolder.id).then((tree) => {
      if (tree) {
        nodes.value = convertTree([tree]);
        nodes.value[0].label = t('common.myFolder');
      }
    });
  });
} else {
  getTreeFolder(serviceType.value, rootFolderId.value).then((tree) => {
    if (tree) {
      nodes.value = convertTree([tree]);
      nodes.value[0].label = t('common.myFolder');
    }
  });
}

function convertTree(folder: FolderTree[]): TreeNode[] {
  const selectedPaths = selectedFileFolders.value.map(selectedFolder => selectedFolder.treePath);
  return folder.filter(e => !selectedPaths.includes(e.treePath)).map(fol => ({
    label: fol.name,
    key: fol.id,
    icon: 'pi pi-fw pi-folder',
    children: convertTree(fol.children)
  }));
}

type FileFolderParam = {
    type: string,
    ids: { id: string, isFolder: boolean }[],
    targetFolderId: string
}

function chooseFolder() {
  store.serviceType = ServiceType.PERSON;
  if (isCopy.value) {
    store.copy();
  } else {
    store.cut();
  }

  function updateCurrentFolder(param: FileFolderParam, data: (EcmFolder | EcmFile)[]) {
    if (copyPasteAction.value === (isCopy.value ? CopyPaste.COPY : CopyPaste.CUT)) {
      store.moveToTargetFolder(data);
    }
  }

  const param = {
    type: ServiceType[serviceType.value],
    ids: copyPasteFileFolders.value.map(f => {
      return {
        id: f.id,
        isFolder: !('extension' in f)
      };
    }),
    targetFolderId: Object.keys(selectedPermissions.value)[0]
  };
  paste(param, updateCurrentFolder);
  emits('hide-dialog');
}
</script>

<script lang='ts'>
export default { name: 'CopyAndMove' };
</script>

<style scoped>
</style>
