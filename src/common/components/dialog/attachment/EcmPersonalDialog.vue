<template>
  <Dialog
    v-model:visible='visible'
    v-bind='DEFAULT_DIALOG_CONFIG'
    :header='headerTitle'
    @hide='emits("hide-dialog")'>

    {{files}}

    <template #footer>
      <DialogFooter/>
    </template>
  </Dialog>
</template>

<script setup lang='ts'>
import { get, isEmpty } from 'lodash';
import { provide, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { getEcmFileFolderGraphql, getEcmRootFolderIdGraphql } from '@/common/api/graphql/ecm-graphql';
import DialogFooter from '@/common/components/dialog/DialogFooter.vue';
import { DEFAULT_DIALOG_CONFIG } from '@/common/constants';
import { EcmFile, EcmFileFolder, EcmFolder, EcmServiceType } from '@/common/model/ecm';

const props = defineProps({
  dialogVisible: {
    type: Boolean,
    default: false
  },
  header: {
    type: String,
    default: ''
  }
});

const emits = defineEmits(['hide-dialog']);

const { t } = useI18n();

const visible = ref(props.dialogVisible);
const headerTitle = ref(props.header || t('common.attachment'));
const localFiles = ref<EcmFileFolder[]>([]);
const ecmFiles = ref<EcmFileFolder[]>([]);

const folders = ref<EcmFolder[]>([]);
const files = ref<EcmFile[]>([]);

const ecmPersonalFooterButtons = {
  closeButton: {
    icon: 'close',
    label: t('common.close'),
    text: true,
    severity: 'danger',
    type: 'button',
    command: () => emits('hide-dialog')
  },
  actionButton: {
    icon: 'check',
    label: t('common.select'),
    text: false,
    type: 'button',
    command: () => selectFiles()
  }
};
provide('dialogFooterButtons', ecmPersonalFooterButtons);

const { onResult: getEcmRootFolderIdResult } = getEcmRootFolderIdGraphql(EcmServiceType.PERSON, '');
getEcmRootFolderIdResult((response) => {
  const rootFolderId = get(response, 'data.rootFolder.id', '');
  if (!isEmpty(rootFolderId)) {
    const { onResult: getEcmFileFolderResult } = getEcmFileFolderGraphql(EcmServiceType.PERSON, rootFolderId);
    getEcmFileFolderResult((res) => {
      const fileFolders = get(res, 'data.listFoldersAndFiles', {
        files: [],
        folders: [] 
      });
      files.value = fileFolders.files;
      folders.value = fileFolders.folders;
    });
  }
});

function selectFiles() {
  return {
    localFiles: localFiles.value,
    ecmFiles: ecmFiles.value
  };
}
</script>

<script lang='ts'>
export default { name: 'EcmPersonalDialog' };
</script>