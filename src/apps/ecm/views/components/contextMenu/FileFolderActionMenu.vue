<template>
  <ContextMenu
    ref='actionMenu'
    :model='actions'
    :popup='true'>
    <template #item='{item: {icon, label}}'>
      <MenuItem
        :icon='icon'
        icon-size='1.25'
        :label='label'/>
    </template>
  </ContextMenu>

  <FileFolderSaveDialog ref='saveDialog'/>

  <CopyAndMove
    v-if='foldersVisible'
    :is-copy='isCopy'
    :visible-dialog='foldersVisible'
    @hide-dialog='hideDialogFolders'/>

  <FileFolderInformation
    v-if='informationVisible'
    :is-folder='selectedHasFolder'
    :visible-dialog='informationVisible'
    @hide-dialog='hideDialogInfo'/>

  <FormGroupPermission
    v-if='formGroupPermissionVisible'
    :visible-dialog='formGroupPermissionVisible'
    @hide-dialog='hideFormGroupPermission'/>

  <FileVersionsDialog
    v-if='fileVersionsDialogVisible && selectedIds.length === 1 && !selectedIds[0].isFolder'
    :dialog-visible='fileVersionsDialogVisible'
    :file-id='selectedIds.length === 1 && !selectedIds[0].isFolder ? selectedIds[0].id : ""'
    @hide-dialog='hideFileVersionDialog'/>

  <EcmUploadNewVersion ref='uploadNewVersion'/>
</template>

<script setup lang='ts'>
import { every, some } from 'lodash';
import { storeToRefs } from 'pinia';
import type { MenuItem } from 'primevue/menuitem';
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { ServiceType } from '@/apps/ecm/api/graphql/file-manage';
import type { EcmFile, EcmFolder } from '@/apps/ecm/model/file-folder';
import {
  confirmDelete,
  confirmMoveToTrash,
  confirmRestore,
  downloadFileFolder,
  editable,
  important,
  openFileToEdit,
  pasteToFolder
} from '@/apps/ecm/service/action-file-folder';
import { ECM_ACTION, hasEcmPermission, hasTrashManagePermission, SUBJECT } from '@/apps/ecm/service/permission_helper';
import { useStorageStore } from '@/apps/ecm/store/storage';
import CopyAndMove from '@/apps/ecm/views/components/contextMenu/CopyAndMove.vue';
import FileFolderInformation from '@/apps/ecm/views/components/contextMenu/FileFolderInformation.vue';
import FormGroupPermission from '@/apps/ecm/views/components/contextMenu/FormGroupPermission.vue';
import FileVersionsDialog from '@/apps/ecm/views/components/versioning/FileVersionsDialog.vue';
import FileFolderSaveDialog from '@/apps/ecm/views/components/view/header/dropdown-action/FileFolderSaveDialog.vue';
import EcmUploadNewVersion from '@/apps/ecm/views/components/view/header/group-action-butons/EcmUploadNewVersion.vue';
import EventBus from '@/common/helpers/event-bus';

const foldersVisible = ref(false);
const informationVisible = ref(false);
const formGroupPermissionVisible = ref(false);
const fileVersionsDialogVisible = ref(false);
const uploadNewVersion = ref();

const isCopy = ref(false);
const { t } = useI18n();
const store = useStorageStore();

const {
  hasCreateAction,
  selectedFileFolders,
  selectedHasFolder,
  selectedIds,
  copyPasteFileFolders,
  serviceCanDelete,
  serviceCanPermission,
  isSharedFile,
  serviceType
} = storeToRefs(store);

const allActions: MenuItem[] = [
  {
    key: 'open',
    label: t('ecm.storage.fileFolderActions.open'),
    icon: 'file_open',
    action: ECM_ACTION.EDIT,
    command: openFileToEdit
  },
  {
    key: 'share',
    label: t('ecm.storage.fileFolderActions.share'),
    icon: 'share',
    action: ECM_ACTION.EDIT,
    command: share
  },
  {
    key: 'download',
    label: t('ecm.storage.fileFolderActions.download'),
    icon: 'download',
    action: ECM_ACTION.DOWNLOAD,
    command: downloadFileFolder
  },
  {
    key: 'downloadToMyDocument',
    label: t('ecm.storage.fileFolderActions.downloadToMyDocument'),
    icon: 'arrow_downward',
    action: ECM_ACTION.DOWNLOAD,
    command: downloadToMyDocument
  },
  {
    key: 'important',
    label: t('ecm.storage.fileFolderActions.important'),
    icon: 'star',
    command: important
  },
  {
    key: 'unimportant',
    label: t('ecm.storage.fileFolderActions.unimportant'),
    icon: 'star',
    command: important
  },
  {
    key: 'rename',
    label: t('ecm.storage.fileFolderActions.rename'),
    icon: 'edit',
    action: ECM_ACTION.EDIT,
    command: rename
  },
  {
    key: 'copy',
    label: t('ecm.storage.fileFolderActions.copy'),
    icon: 'file_copy',
    action: ECM_ACTION.COPY,
    command: store.copy
  },
  {
    key: 'cut',
    label: t('ecm.storage.fileFolderActions.cut'),
    icon: 'cut',
    action: ECM_ACTION.MOVE,
    command: store.cut
  },
  {
    key: 'paste',
    label: t('ecm.storage.fileFolderActions.paste'),
    icon: 'content_paste',
    action: ECM_ACTION.CREATE,
    command: pasteToFolder
  },
  {
    key: 'move',
    label: t('ecm.storage.fileFolderActions.move'),
    icon: 'drive_file_move',
    action: ECM_ACTION.MOVE,
    command: move
  },
  {
    key: 'copyTo',
    label: t('ecm.storage.fileFolderActions.copyTo'),
    icon: 'drive_file_move',
    action: ECM_ACTION.COPY,
    command: copyTo
  },
  {
    key: 'version',
    label: t('ecm.storage.fileFolderActions.version'),
    icon: 'filter_2',
    action: ECM_ACTION.VERSION_MANAGEMENT,
    command: () => {
      fileVersionsDialogVisible.value = true;
    }
  },
  {
    key: 'newVersion',
    label: t('ecm.storage.fileFolderActions.newVersion'),
    icon: 'filter_none',
    action: ECM_ACTION.VERSION_MANAGEMENT,
    command: () => {
      if (selectedFileFolders.value.length === 1 && 'extension' in selectedFileFolders.value[0]) {
        uploadNewVersion.value.uploadFileVersion(selectedFileFolders.value[0]);
      }
    }
  },
  {
    key: 'work',
    label: t('ecm.storage.fileFolderActions.work'),
    icon: 'work',
    command: (a: object) => {
    }
  },
  {
    key: 'info',
    label: t('ecm.storage.fileFolderActions.info'),
    icon: 'info',
    command: showInfo
  },
  {
    key: 'groupPermissions',
    label: t('ecm.storage.fileFolderActions.groupPermissions'),
    icon: 'group',
    checkFunc: hasTrashManagePermission,
    command: groupPermissions
  },
  {
    key: 'restore',
    label: t('ecm.storage.fileFolderActions.restore'),
    icon: 'restore_from_trash',
    action: ECM_ACTION.TRASH_MANAGEMENT,
    command: confirmRestore,
  },
  {
    key: 'delete',
    label: t('ecm.storage.fileFolderActions.delete'),
    icon: 'delete',
    action: ECM_ACTION.MOVE_TO_TRASH,
    command: () => {
      if (serviceCanDelete.value) {
        confirmDelete();
      } else {
        confirmMoveToTrash();
      }
    }
  }
];

const folderActions = [
  'share',
  'download',
  'important',
  'unimportant',
  'rename',
  'copy',
  'cut',
  'paste',
  'move',
  'copyTo',
  'info',
  'delete',
  'restore',
  'groupPermissions'
];

const multipleSelectedActions = [
  'download',
  'important',
  'unimportant',
  'copy',
  'cut',
  'move',
  'copyTo',
  'delete',
  'work',
  'restore'
];

const copyPasteActions = [
  'copy',
  'cut',
  'move',
  'copyTo',
  'paste',
];

const trashActions = [
  'info',
  'delete',
  'restore'
];

const sharedActions = [
  'open',
  // 'share',
  'download',
  'info',
  'downloadToMyDocument'
];

const actions = computed(() => {
  const hasUnmarkedImportant = some(selectedFileFolders.value, { isImportant: false });
  const serviceHasImportant = [ServiceType.PERSON, ServiceType.PERSON_RECENT, ServiceType.GROUP].includes(serviceType.value);
  return allActions
    .filter(a => serviceCanDelete.value ? trashActions.includes(a.key || '') : a.key !== 'restore')
    .filter(a => serviceType.value === ServiceType.SHARED ? a.key : a.key !== 'downloadToMyDocument')
    .filter(a => hasCreateAction.value ? true : !copyPasteActions.some(f => f === a.key))
    .filter(a => selectedHasFolder.value ? folderActions.some(f => f === a.key) : a.key !== 'paste')
    .filter(a => selectedFileFolders.value.length > 1 ? multipleSelectedActions.some(f => f === a.key) : filterPasteAction(a, selectedFileFolders.value[0]))
    .filter(a => selectedFileFolders.value.length == 1 && a.key === 'open' ? editable(selectedFileFolders.value[0]) : true)
    .filter(a => serviceHasImportant ? hasUnmarkedImportant && a.key !== 'unimportant' || !hasUnmarkedImportant && a.key !== 'important'
      : a.key !== 'unimportant' && a.key !== 'important')
    .filter(a => serviceCanPermission.value && selectedHasFolder.value ? folderActions.some(f => f === a.key) : a.key !== 'groupPermissions')
    .filter(a => isSharedFile.value ? sharedActions.includes(a.key || '') : true)
    .filter(filterPermissions);
});

function filterPasteAction(menu: MenuItem, folder: EcmFolder | EcmFile) {
  const removePasteKey = 'paste';
  if (copyPasteFileFolders.value?.length) {
    if (menu.key?.includes('paste')) {
      return !copyPasteFileFolders.value.some(f => folder.treePath.includes(f.treePath));
    }
    return true;
  } else {
    return !menu.key?.includes(removePasteKey);
  }
}

function filterPermissions(menu: MenuItem): boolean {
  if (menu.checkFunc) {
    return selectedFileFolders.value.every(fileFolder => menu.checkFunc(serviceType.value, fileFolder.treePath));
  }
  if (!menu.action) {
    return true;
  }

  return every(selectedFileFolders.value, (fileFolder) => {
    return hasEcmPermission(serviceType.value, fileFolder.treePath, ECM_ACTION[menu.action],
      SUBJECT[serviceCanDelete.value ? SUBJECT.TRASH : 'extension' in fileFolder ? SUBJECT.FILE : SUBJECT.FOLDER]);
  });
}

const saveDialog = ref();

const actionMenu = ref();
const toggleMenu = (event: Event) => {
  actionMenu.value.show(event);
};

function hideMenu() {
  if (actionMenu.value.visible) {
    actionMenu.value.hide();
  }
}

function rename() {
  const firstSelected = selectedFileFolders.value[0];
  const isFolder = !('extension' in firstSelected);
  saveDialog.value.toggleDialog(firstSelected, isFolder, {
    type: '',
    extension: isFolder ? '' : `.${firstSelected.extension}`
  });
}

function share() {
  if (selectedIds.value.length == 1) {
    EventBus.emit('openShareDialog', selectedIds.value[0]);
  }
}

function showInfo() {
  informationVisible.value = true;
}

function groupPermissions() {
  formGroupPermissionVisible.value = true;
}

function move() {
  foldersVisible.value = true;
  isCopy.value = false;
}

function downloadToMyDocument() {
  foldersVisible.value = true;
  isCopy.value = true;
}

function copyTo() {
  foldersVisible.value = true;
  isCopy.value = true;
}

function hideDialogFolders() {
  foldersVisible.value = false;
}

function hideDialogInfo() {
  informationVisible.value = false;
}

function hideFormGroupPermission() {
  formGroupPermissionVisible.value = false;
}

function hideFileVersionDialog() {
  fileVersionsDialogVisible.value = false;
}

defineExpose({
  toggleMenu,
  hideMenu,
});

</script>

<script lang='ts'>
export default { name: 'FileFolderActionMenu' };
</script>