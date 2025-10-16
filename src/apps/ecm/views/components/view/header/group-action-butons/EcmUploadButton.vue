<template>
  <ButtonIcon
    v-if='hasFileCreatePermission(serviceType, path)'
    class='px-3 py-2'
    icon='upload'
    :label='t("common.upload")'
    text
    type='button'
    @click='toggleUploadMenu'/>
  <Menu
    ref='uploadMenu'
    :model='uploadOptions'
    :popup='true'>
    <template #item='{item: {icon, label}}'>
      <MenuItem
        :icon='icon'
        icon-size='1.25'
        :label='label'/>
    </template>
  </Menu>
  <form
    ref='fileUpload'
    class='hidden'
    name='fileUpload'>
    <input
      name='folderId'
      type='hidden'
      :value='folderId'>
    <input
      ref='selectFilesInput'
      :accept='ECM_FILE_ACCEPT.join(" ")'
      class='hidden max-h-0 max-w-0 opacity-0'
      multiple
      name='file'
      type='file'
      @change='uploadEcmFile'>
  </form>
  <form
    ref='folderUpload'
    class='hidden'
    name='folderUpload'>
    <input
      name='folderId'
      type='hidden'
      :value='folderId'>
    <input
      ref='selectFolder'
      class='hidden max-h-0 max-w-0 opacity-0'
      multiple
      name='file'
      type='file'
      webkitdirectory
      @change='uploadEcmFile'>
  </form>
</template>

<script setup lang='ts'>
import type { AxiosProgressEvent } from 'axios';
import { storeToRefs } from 'pinia';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { ECM_FILE_ACCEPT, MAX_FILE_SIZE } from '@/apps/ecm/constants';
import { hasFileCreatePermission } from '@/apps/ecm/service/permission_helper';
import { ecmUpload, validateFiles, validateFolder } from '@/apps/ecm/service/upload';
import { useBreadcrumbStore } from '@/apps/ecm/store/breadcrumb';
import { useStorageStore } from '@/apps/ecm/store/storage';
import { FILE_FOLDER_NAME_NOT_ALLOW_CHARACTERS } from '@/common/constants';
import { toastWarn } from '@/common/helpers/custom-toast-service';
import EventBus from '@/common/helpers/event-bus';
import { convertFileSize } from '@/common/helpers/file-utils';

const { t } = useI18n();
const store = useStorageStore();
const {
  folderId,
  serviceType
} = storeToRefs(store);
const { path, changeFileFolder } = storeToRefs(useBreadcrumbStore());
const uploadMenu = ref();
const selectFilesInput = ref();
const selectFolder = ref();
const fileUpload = ref();
const uploadOptions = [
  {
    label: t('ecm.storage.uploadFile'),
    icon: 'upload_file',
    command: () => selectFilesInput.value.click()

  },
  {
    label: t('ecm.storage.uploadFolder'),
    icon: 'drive_folder_upload',
    command: () => selectFolder.value.click()
  }
];

function toggleUploadMenu(event: Event) {
  uploadMenu.value.toggle(event);
}

function uploadEcmFile(event: Event) {
  changeFileFolder.value = !changeFileFolder.value;
  const target = event.target as HTMLInputElement;
  if (validate(target)) {
    const form = target.parentElement;
    if (form) {
      ecmUpload(form as HTMLFormElement, onUploadProgress);
    }
  }
  target.value = '';
}

function onUploadProgress(progressEvent: AxiosProgressEvent) {
  EventBus.emit('changeUploadProgress', (progressEvent.progress ?? 0) * 100);
}

function validate(target: HTMLInputElement): boolean {
  const invalidFileFolderName = `${t('common.fileFolderNotAllowCharacters')} ${FILE_FOLDER_NAME_NOT_ALLOW_CHARACTERS} ${t('common.and')} ${t('common.notStartWithDot')}`;
  if (target) {
    const selectedFiles = target.files;

    if (target.webkitdirectory && !validateFolder(selectedFiles)) {
      toastWarn({
        message: `${t('common.folderEmpty')} ${t('common.or')} ${invalidFileFolderName}`,
        life: 5000
      });
      return false;
    }
    const { invalidFileSizes, invalidFileNames } = validateFiles(selectedFiles);
    if (invalidFileSizes.length) {
      toastWarn({ message: t('ecm.storage.someFilesExceedMaxFileSize', { maxFileSize: convertFileSize(MAX_FILE_SIZE) }) });
      return false;
    }
    if (invalidFileNames.length) {
      toastWarn({ message: invalidFileFolderName });
      return false;
    }

    return true;
  }
  return false;
}
</script>

<script lang='ts'>

export default { name: 'EcmUploadButton' };
</script>