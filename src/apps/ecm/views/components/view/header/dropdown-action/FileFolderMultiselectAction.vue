<template>
  <div class='flex'>
    <div class='flex flex-row'>
      <Button
        v-for='action in displayActions'
        :key='action.label'
        class='font-bold px-2 py-1'
        text
        @click='action.command()'>
        {{ t(`ecm.storage.fileFolderActions.${action.label}`) }}
      </Button>
    </div>

    <div
      v-if='menuActions.length'
      class='align-self-center flex flex-row'>
      <ButtonIcon
        class='p-2'
        icon='more_vert'
        icon-size='1.5'
        rounded
        severity='secondary'
        text
        @click='toggleActionMenu'/>
    </div>
  </div>

  <Menu
    v-if='menuActions.length'
    ref='multipleFileFolderActionMenu'
    :model='menuActions'
    :popup='true'>
    <template #item='{item: {icon, label}}'>
      <MenuItem
        :icon='icon'
        icon-size='1.25'
        :label='t(`ecm.storage.fileFolderActions.${label}`)'/>
    </template>
  </Menu>

  <CopyAndMove
    v-if='foldersVisible'
    :is-copy='isCopy'
    :visible-dialog='foldersVisible'
    @hide-dialog='hideDialogFolders'/>

</template>

<script setup lang='ts'>
import { every, some } from 'lodash';
import { storeToRefs } from 'pinia';
import type { MenuItem } from 'primevue/menuitem';
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { ServiceType } from '@/apps/ecm/api/graphql/file-manage';
import { confirmMoveToTrash, downloadFileFolder, important } from '@/apps/ecm/service/action-file-folder';
import { ECM_ACTION, hasEcmPermission, SUBJECT } from '@/apps/ecm/service/permission_helper';
import { useStorageStore } from '@/apps/ecm/store/storage';
import CopyAndMove from '@/apps/ecm/views/components/contextMenu/CopyAndMove.vue';
import EventBus from '@/common/helpers/event-bus';

const foldersVisible = ref(false);
const isCopy = ref(false);
const store = useStorageStore();
const {
  selectedFileFolders,
  selectedIds,
  isSharedFile,
  serviceType,
  serviceCanDelete,
} = storeToRefs(store);

const { t } = useI18n();

const allActions = [
  {
    key: 'download',
    label: 'download',
    icon: 'add',
    command: downloadFileFolder
  },
  {
    key: 'copy',
    label: 'copy',
    icon: 'file_copy',
    action: ECM_ACTION.COPY,
    command: store.copy
  },
  {
    key: 'move',
    label: 'move',
    icon: 'drive_file_move',
    action: ECM_ACTION.MOVE,
    command: aMove
  },
  {
    key: 'share',
    label: 'share',
    icon: 'share',
    action: ECM_ACTION.EDIT,
    command: aShare
  },
  {
    key: 'important',
    label: 'important',
    icon: 'star',
    command: important
  },
  {
    key: 'unimportant',
    label: 'unimportant',
    icon: 'star',
    command: important
  },
  {
    key: 'delete',
    label: 'delete',
    icon: 'delete',
    action: ECM_ACTION.MOVE_TO_TRASH,
    command: confirmMoveToTrash
  },
];

const sharedActions = [
  'open',
  // 'share',
  'download',
  'info'
];

const actions = computed(() => {
  const hasUnmarkedImportant = some(selectedFileFolders.value, { isImportant: false });
  const serviceHasImportant = [ServiceType.PERSON, ServiceType.PERSON_RECENT, ServiceType.GROUP].includes(serviceType.value);
  return allActions
    .filter(a => isSharedFile.value ? sharedActions.includes(a.key || '') : true)
    .filter(a => serviceHasImportant ? hasUnmarkedImportant && a.key !== 'unimportant' || !hasUnmarkedImportant && a.key !== 'important'
      : a.key !== 'unimportant' && a.key !== 'important')
    .filter(filterPermissions);
}
);

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

const [displayActions, menuActions] = [actions.value.slice(0, 3), actions.value.slice(3)];

const multipleFileFolderActionMenu = ref();
const toggleActionMenu = (event: Event) => {
  multipleFileFolderActionMenu.value.show(event);
};

function aShare() {
  if (selectedIds.value.length == 1) {
    EventBus.emit('openShareDialog', selectedIds.value[0]);
  }
}

function aMove() {
  foldersVisible.value = true;
  isCopy.value = false;
}

function hideDialogFolders() {
  foldersVisible.value = false;
}

</script>

<script lang='ts'>
export default { name: 'FileFolderMultiselectAction' };
</script>