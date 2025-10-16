<template>
  <component
    :is='menuComponents[currentMenuComp]'
    ref='creationMenu'
    :model='actions'
    :popup='true'>

    <template #item='{item: {key, icon, img, label}}'>
      <a class='p-menuitem-link'>
        <img
          v-if='img'
          :alt='`file type ${key}`'
          class='h-2rem mr-2 w-2rem'
          :src='img'/>
        <AppIcon
          v-else
          class='h-2rem mr-2 w-2rem'
          :name='icon'
          size='2'/>
        <span class='p-menuitem-text'>{{ label }}</span>
      </a>
    </template>
  </component>

  <FileFolderSaveDialog ref='saveDialog'/>
</template>

<script setup lang='ts'>
import { camelCase, lowerCase, map, toLower } from 'lodash';
import { storeToRefs } from 'pinia';
import ContextMenu from 'primevue/contextmenu';
import Menu from 'primevue/menu';
import type { MenuItem } from 'primevue/menuitem';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { FILE_TYPES_CREATABLE } from '@/apps/ecm/constants';
import type { EcmFile, EcmFolder } from '@/apps/ecm/model/file-folder';
import { pasteInCurrentFolder } from '@/apps/ecm/service/action-file-folder';
import { hasFileCreatePermission, hasFolderCreatePermission } from '@/apps/ecm/service/permission_helper';
import { useBreadcrumbStore } from '@/apps/ecm/store/breadcrumb';
import { useStorageStore } from '@/apps/ecm/store/storage';
import FileFolderSaveDialog from '@/apps/ecm/views/components/view/header/dropdown-action/FileFolderSaveDialog.vue';
import { getFolderIcon } from '@/common/helpers/file-utils';
import type { BlankFileType } from '@/common/model';

const { t } = useI18n();
const store = useStorageStore();
const {
  serviceType,
  selectedFileFolders,
  copyPasteFileFolders,
} = storeToRefs(store);

const { path } = storeToRefs(useBreadcrumbStore());

const menuComponents = {
  Menu,
  ContextMenu
};
const currentMenuComp = ref<'Menu' | 'ContextMenu'>('Menu');
const actions = ref<MenuItem[]>();
const allActions: MenuItem[] = [
  {
    key: 'paste',
    icon: 'content_paste',
    label: t('ecm.storage.fileFolderActions.paste'),
    command: pasteInCurrentFolder
  },
  {
    key: 'separator-paste',
    separator: true
  },
  ...map(FILE_TYPES_CREATABLE, (option) => ({
    key: option.type,
    img: `/images/file-types/${option.type}.svg`,
    label: t('ecm.storage.createFileFolder', { type: toLower(t(`ecm.storage.filterFileTypes.${camelCase(option.type)}`)) }),
    command: () => toggleSaveFileFolderDialog({} as EcmFile, false, option)
  })),
  ...[{
    key: 'separator-folder',
    separator: true
  }],
  ...[{
    key: 'folder',
    img: getFolderIcon(),
    label: t('ecm.storage.createFileFolder', { type: lowerCase(t('common.folder')) }),
    command: () => toggleSaveFileFolderDialog({} as EcmFile | EcmFolder, true, null)
  }]];

const creationMenu = ref();
const toggleCreationMenu = (event: Event, isContextMenu: boolean) => {
  selectedFileFolders.value = [];
  currentMenuComp.value = isContextMenu ? 'ContextMenu' : 'Menu';
  actions.value = allActions.filter(filterPasteAction).filter(filterPermission);
  if (actions.value?.length) {
    creationMenu.value.toggle(event);
  }
};

function filterPasteAction(menu: MenuItem): boolean {
  const removePasteKey = 'paste';
  if (copyPasteFileFolders.value?.length) {
    if (menu.key?.includes('paste')) {
      return !copyPasteFileFolders.value.some(f => useBreadcrumbStore().pathId.includes(f.id));
    }
    return true;
  } else {
    return !menu.key?.includes(removePasteKey);
  }
}

function filterPermission(menu: MenuItem): boolean {
  if (menu.key?.includes('folder')) {
    return hasFolderCreatePermission(serviceType.value, path.value);
  }
  if (FILE_TYPES_CREATABLE.some(t => t.type === menu.key)) {
    return hasFileCreatePermission(serviceType.value, path.value);
  }
  if (menu.key?.includes('paste')) {
    if (copyPasteFileFolders.value?.length) {
      return copyPasteFileFolders.value.every(f =>
        'extension' in f ? hasFileCreatePermission(serviceType.value, path.value) : hasFolderCreatePermission(serviceType.value, path.value)
      );
    }
  }
  return true;
}

function hideMenu() {
  if (creationMenu.value.visible) {
    creationMenu.value.hide();
  }
}

const saveDialog = ref();
const toggleSaveFileFolderDialog = (data: EcmFolder | EcmFile, isFolder: boolean, option: BlankFileType | null) => {
  saveDialog.value.toggleDialog(data, isFolder, option);
  creationMenu.value.hide();
};

defineExpose({
  toggleCreationMenu,
  hideMenu
});
</script>

<script lang='ts'>
export default { name: 'FileFolderCreateMenu' };
</script>