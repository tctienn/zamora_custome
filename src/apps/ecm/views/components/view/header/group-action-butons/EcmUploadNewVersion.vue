<template>
  <form
    ref='fileUpload'
    class='hidden'
    name='fileUpload'>
    <input
      name='folderId'
      type='hidden'
      :value='folderId'>
    <input
      v-if='file'
      name='fileId'
      type='hidden'
      :value='file.id'>
    <input
      ref='selectFileInput'
      :accept='ECM_FILE_ACCEPT.join(" ")'
      class='hidden max-h-0 max-w-0 opacity-0'
      name='file'
      type='file'
      @change='uploadEcmFile'>
  </form>
</template>

<script setup lang='ts'>
import { isEmpty, isEqual, lastIndexOf } from 'lodash';
import { storeToRefs } from 'pinia';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { uploadNewVersion } from '@/apps/ecm/api/rest/manage';
import { ECM_FILE_ACCEPT, MAX_FILE_SIZE } from '@/apps/ecm/constants';
import type { EcmFile } from '@/apps/ecm/model/file-folder';
import { useStorageStore } from '@/apps/ecm/store/storage';
import { toastWarn } from '@/common/helpers/custom-toast-service';
import EventBus from '@/common/helpers/event-bus';
import { convertFileSize } from '@/common/helpers/file-utils';

const { t } = useI18n();
const store = useStorageStore();
const {
  folderId,
  serviceType
} = storeToRefs(store);
const selectFileInput = ref();
const fileUpload = ref();

const file = ref<EcmFile>();

function uploadEcmFile(event: Event) {
  if (validate(event) && file.value) {
    const form = (event.target as HTMLElement).parentElement;
    if (form) {
      const data = new FormData(form as HTMLFormElement);
      data.set('file', selectFileInput.value.files[0], file.value.name);

      uploadNewVersion(serviceType.value, data)
        .then(() => {
          EventBus.emit('updateListFileFolder');
          EventBus.emit('updateFolderTree');
        });
      (form as HTMLFormElement).reset();
    }
  }
}

function validate(event: Event): boolean {
  let isValid = true;
  if (event.target) {
    const selectedFiles = (event.target as HTMLInputElement).files || [];
    if (!selectedFiles.length) {
      toastWarn({ message: t('ecm.storage.noFileSelected') });
      isValid = false;
    }

    const overMaxSizeNumber = [...selectedFiles].filter(({ size }) => size > MAX_FILE_SIZE).length;
    if (overMaxSizeNumber) {
      toastWarn({ message: t('ecm.storage.someFilesExceedMaxFileSize', { maxFileSize: convertFileSize(MAX_FILE_SIZE) }) });
      isValid = false;
    }

    const name = selectedFiles[0].name;
    const lastDotIndex = lastIndexOf(name, '.');

    const extension = lastDotIndex >= 0 ? name.substring(lastDotIndex + 1, name.length) : '';
    if (isEmpty(extension) || file.value && !isEqual(file.value.extension, extension)) {
      toastWarn({ message: t('ecm.storage.newVersionExtensionNotMatch') });
      isValid = false;
    }
  }
  if (!isValid) {
    (event.target as HTMLInputElement).value = '';
    return isValid;
  }
  return isValid;
}

function uploadFileVersion(ecmFile: EcmFile) {
  file.value = ecmFile;
  selectFileInput.value.click();
}

defineExpose({ uploadFileVersion });
</script>

<script lang='ts'>
export default { name: 'EcmUploadNewVersion' };
</script>