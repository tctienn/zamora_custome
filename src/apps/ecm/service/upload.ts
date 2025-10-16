import type { AxiosProgressEvent, AxiosRequestConfig } from 'axios';
import { forEach, startsWith } from 'lodash';

import { uploadMultiFile } from '@/apps/ecm/api/rest/manage';
import { MAX_FILE_SIZE } from '@/apps/ecm/constants';
import { useStorageStore } from '@/apps/ecm/store/storage';
import { FILE_FOLDER_NAME_NOT_ALLOW_CHARACTERS_REGEX } from '@/common/constants';
import { toastError } from '@/common/helpers/custom-toast-service';
import EventBus from '@/common/helpers/event-bus';
import i18n from '@/common/i18n';

const { t } = i18n.global;

function validateFiles(files: FileList | null): { invalidFileSizes: File[], invalidFileNames: File[] } {
  const invalidFileSizes: File[] = [];
  const invalidFileNames: File[] = [];
  if (files?.length) {
    forEach(files, file => {
      if (file.size > MAX_FILE_SIZE) {
        invalidFileSizes.push(file);
      }
      if (validateInvalidFileFolderName(file.name)) {
        invalidFileNames.push(file);
      }
    });
  }
  return {
    invalidFileSizes,
    invalidFileNames
  };
}

function validateFolder(files: FileList | null) {
  if (files?.length) {
    const firstFilePath = files[0].webkitRelativePath;
    const folderName = firstFilePath.substring(0, firstFilePath.indexOf('/'));
    return !validateInvalidFileFolderName(folderName);
  } else {
    return false;
  }
}

function validateInvalidFileFolderName(fileFolderName: string) {
  return FILE_FOLDER_NAME_NOT_ALLOW_CHARACTERS_REGEX.test(fileFolderName) || startsWith(fileFolderName, '.');
}

function ecmUpload(form: HTMLFormElement | undefined, onUploadProgress: (progressEvent: AxiosProgressEvent) => void) {
  if (form) {
    const data = new FormData(form);
    const config: AxiosRequestConfig = { onUploadProgress: onUploadProgress };
    uploadMultiFile(useStorageStore().serviceType, data, config)
      .catch((e) => {
        toastError({ message: t('ecm.capacity.error.' + e.code) });
      })
      .finally(() => {
        EventBus.emit('updateListFileFolder');
        EventBus.emit('updateFolderTree');
        EventBus.emit('changeUploadProgress', -1);
      });
    form.reset();
  }
}

export { ecmUpload, validateFiles, validateFolder };