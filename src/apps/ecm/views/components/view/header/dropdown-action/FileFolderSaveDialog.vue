<template>
  <Dialog
    v-bind='DEFAULT_DIALOG_CONFIG'
    v-model:visible='visible'
    :header='generateHeaderDialog()'
    :maximizable='false'
    :style='{ "min-width": "25vw" }'
    @hide='hideDialog'>
    <form
      ref='form'
      @submit.prevent='save'>
      <div class='p-fluid'>
        <div class='formgrid grid'>
          <div class='col field'>
            <div class='flex justify-content-between'>
              <label
                v-required
                for='fileFolderName'>{{ nameTitle }}</label>

              <span v-if='!_isFolder && fileOption'>
                {{ fileOption.extension }}
              </span>
            </div>

            <InputText
              id='fileFolderName'
              v-model='fileFolder.name'
              v-file-folder-name
              autofocus='true'
              :placeholder='nameTitle'
              @focus='($event.target as HTMLInputElement)?.select()'/>
            <small>{{
              `${ t('common.fileFolderNotAllowCharacters') } ${ FILE_FOLDER_NAME_NOT_ALLOW_CHARACTERS } ${ t('common.and') } ${ t('common.notStartWithDot') }`
            }}</small>
            <Divider
              v-if='editable'
              class='my-2'/>
            <div v-if='editable'>
              <Checkbox
                v-model='fileOption.openEditAfterCreate'
                binary
                input-id='open'/>
              <label
                class='ml-2'
                for='open'>{{ t('ecm.storage.confirmMessage.openEditAfterCreate') }}</label>
            </div>

          </div>
        </div>
      </div>
    </form>

    <template #footer>
      <DialogFooter/>
    </template>
  </Dialog>
</template>

<script setup lang='ts'>
import { camelCase, get, isEmpty, toLower, toUpper, trimEnd, trimStart } from 'lodash';
import { storeToRefs } from 'pinia';
import { computed, provide, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { createEmptyFileGraphql, createFolder, rename, ServiceType } from '@/apps/ecm/api/graphql/file-manage';
import { EDITABLE_FILE_TYPES } from '@/apps/ecm/constants';
import type { EcmFile, EcmFolder } from '@/apps/ecm/model/file-folder';
import { useStorageStore } from '@/apps/ecm/store/storage';
import DialogFooter from '@/common/components/dialog/DialogFooter.vue';
import { DEFAULT_DIALOG_CONFIG, FILE_FOLDER_NAME_NOT_ALLOW_CHARACTERS } from '@/common/constants';
import { toastError, toastSuccess, toastWarn } from '@/common/helpers/custom-toast-service';
import EventBus from '@/common/helpers/event-bus';
import { generateFileEditorUrl } from '@/common/helpers/file-utils';
import type { BlankFileType } from '@/common/model';

const emits = defineEmits(['hide-dialog']);
const fileFolder = ref<EcmFile | EcmFolder>({} as EcmFile | EcmFolder);
const store = useStorageStore();
const {
  folderId: currentFolderId,
  serviceType
} = storeToRefs(store);
const visible = ref(false);
const _isFolder = ref(false);
const fileOption = ref<BlankFileType>({} as BlankFileType);
const itemType = computed(() => _isFolder.value ? 'folder' : 'file');
const nameTitle = computed(() => `${ t('ecm.storage.name') } ${ toLower(t('common.' + camelCase(itemType.value))) }`);
const labelAction = computed(() => fileFolder.value.id ? t('common.save') : t('ecm.storage.create'));
const { t } = useI18n();
const form = ref();
const {
  mutate: renameOnMutate,
  onError: renameOnError,
  onDone: renameOnDone
} = rename();
const {
  mutate: createFolderMutate,
  onError: createFolderOnError,
  onDone: createFolderOnDone
} = createFolder();

const editable = computed(() => !('id' in fileFolder.value || _isFolder.value)
  && EDITABLE_FILE_TYPES.includes(trimStart(fileOption.value.extension, '.')));

function save() {
  if ('id' in fileFolder.value) {
    graphRename();
  } else {
    if (_isFolder.value) {
      graphCreateFolder();
    } else {
      createEmptyFile();
    }
  }
}

function graphRename() {
  renameOnMutate({
    type: ServiceType[serviceType.value ? serviceType.value : ServiceType.PERSON],
    id: fileFolder.value.id,
    name: `${ fileFolder.value.name }${ _isFolder.value ? '' : fileOption.value.extension }`,
    isFolder: _isFolder.value
  }).then((a) => {
    if (a?.data && 'rename' in a.data) {
      store.updateFileFolder(a.data.rename);
    }
    hideDialog();
  });
}

renameOnError((err) => {
  toastError({ message: t('ecm.fileFolder.error.' + err.graphQLErrors[0].extensions.errorCode) });
});

renameOnDone(() => {
  toastSuccess({ message: t('ecm.fileFolder.message.renameSuccess') });
  EventBus.emit('updateFolderTree');
});

function graphCreateFolder() {
  createFolderMutate({
    type: ServiceType[serviceType.value ? serviceType.value : ServiceType.PERSON],
    name: fileFolder.value.name,
    parentFolderId: currentFolderId.value
  }).then((a) => {
    if (a?.data && 'createFolder' in a.data) {
      store.pushFolder(a.data.createFolder);
    }
    hideDialog();
  });
}

createFolderOnError((err) => {
  toastError({ message: t('ecm.fileFolder.error.' + err.graphQLErrors[0].extensions.errorCode) });
});

createFolderOnDone(() => {
  toastSuccess({ message: t('ecm.fileFolder.message.createFolderSuccess') });
  EventBus.emit('updateFolderTree');
});

const createEmptyFile = () => {
  const { name } = fileFolder.value;
  if (!isEmpty(fileOption.value.type) && !isEmpty(fileOption.value.extension)) {
    createEmptyFileMutate({
      type: ServiceType[serviceType.value ? serviceType.value : ServiceType.PERSON],
      name: `${ name }${ fileOption.value.extension }`,
      fileType: toUpper(fileOption.value.type),
      folderId: currentFolderId.value
    });
  } else {
    toastWarn({});
  }
};

const {
  mutate: createEmptyFileMutate,
  onDone: createEmptyFileDone,
  onError: createEmptyFileError
} = createEmptyFileGraphql();
createEmptyFileDone((response) => {
  const file: EcmFile = get(response, 'data.createEmptyFile', {});
  if (file.id) {
    store.pushFile({
      ...response.data.createEmptyFile,
      lastModifiedAt: new Date()
    });
    if (fileOption.value.openEditAfterCreate) {
      window.open(generateFileEditorUrl(file.id));
    }
    toastSuccess({ message: t('ecm.fileFolder.message.createFileSuccess') });
    hideDialog();
  }
});

createEmptyFileError((err) => {
  toastError({ message: t('ecm.fileFolder.error.' + err.graphQLErrors[0].extensions.errorCode) });
});

const footerButtons = ref({
  closeButton: {
    icon: 'close',
    label: t('common.close'),
    // text: true,
    severity: 'danger',
    type: 'button',
    command: () => hideDialog()
  },
  actionButton: {
    icon: 'check',
    label: labelAction,
    // text: true,
    type: 'button',
    command: save
  }
});
provide('dialogFooterButtons', footerButtons.value);

const generateHeaderDialog = () => {
  let header = '';

  if (fileFolder.value.id) {
    header += t('ecm.storage.fileFolderActions.rename');
  } else {
    header += t('ecm.storage.create');
  }

  header += ` ${ toLower(t('common.' + camelCase(itemType.value))) }`;

  return header;
};

const toggleDialog = (data: EcmFolder | EcmFile, isFolder: boolean, option: BlankFileType | null) => {
  let name = data.name;
  if (!isFolder && option && !isEmpty(option.extension)) {
    name = trimEnd(name, option.extension);
    name = name.split('.')[0];
  }
  _isFolder.value = isFolder;
  fileFolder.value = {
    ...data,
    name
  };
  visible.value = !visible.value;
  fileOption.value = option ? option : {
    type: '',
    extension: 'unknown'
  };
};

const hideDialog = () => {
  emits('hide-dialog');
  visible.value = false;
};

defineExpose({ toggleDialog });

</script>

<script lang='ts'>
export default { name: 'FileFolderSaveDialog' };
</script>
