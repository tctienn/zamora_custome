<template>
  <Dialog
    v-bind='DEFAULT_DIALOG_CONFIG'
    v-model:visible='visible'
    :header='t("common.info")'
    style='width: 50%'
    @hide='emits("hide-dialog")'>
    <div class='formgrid grid'>
      <div class='col field'>
        <label
          class='font-bold'
          for='categoryGroupCode'>{{ t('ecm.fileFolder.name') }}</label>: {{ fileFolder.name }}
      </div>
    </div>

    <div class='formgrid grid'>
      <div class='col field'>
        <label
          class='font-bold'
          for='categoryGroupCode'>{{ t('ecm.fileFolder.path') }}</label>: {{ fileFolder.treePath }}
      </div>
    </div>

    <div class='formgrid grid'>
      <div class='col field'>
        <label
          class='font-bold'
          for='categoryGroupName'>{{ t('ecm.fileFolder.type') }}</label>:
        {{ props.isFolder ? t('common.folder') : t('common.file') }}
      </div>

      <div class='col field'>
        <label
          class='font-bold'
          for='categoryGroupName'>{{ t('ecm.fileFolder.size') }}</label>: {{ convertFileSize(totalSize) }}
      </div>
    </div>

    <div class='formgrid grid'>
      <div class='col field'>
        <label
          class='font-bold'
          for='categoryGroupName'>{{ t('ecm.fileFolder.creator') }}</label>:
        {{ fileFolder.createdBy }}
      </div>

      <div class='col field'>
        <label
          class='font-bold'
          for='categoryGroupName'>{{ t('ecm.fileFolder.updater') }}</label>:
        {{ fileFolder.lastModifiedBy }}
      </div>
    </div>

    <div class='formgrid grid'>
      <div class='col field'>
        <label
          class='font-bold'
          for='categoryGroupCode'>{{ t('ecm.fileFolder.createDate') }}</label>:
        {{ convertReadableDate(fileFolder.createdAt) }}
      </div>

      <div class='col field'>
        <label
          class='font-bold'
          for='categoryGroupCode'>{{ t('ecm.fileFolder.updateDate') }}</label>:
        {{ convertReadableDate(fileFolder.lastModifiedAt) }}
      </div>
    </div>

    <template #footer>
      <DialogFooter/>
    </template>
  </Dialog>
</template>

<script setup lang='ts'>
import { storeToRefs } from 'pinia';
import { provide, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { findFileById } from '@/apps/ecm/api/graphql/file-graphql';
import { findFolderById, getTotalSizeFileByTreePath } from '@/apps/ecm/api/graphql/folder-graphql';
import type { EcmFile, EcmFileFolder, EcmFolder } from '@/apps/ecm/model/file-folder';
import { useStorageStore } from '@/apps/ecm/store/storage';
import DialogFooter from '@/common/components/dialog/DialogFooter.vue';
import { DEFAULT_DIALOG_CONFIG } from '@/common/constants';
import { convertFileSize } from '@/common/helpers/file-utils';
import { convertReadableDate } from '@/common/helpers/utils';

const props = withDefaults(defineProps<FolderProps>(), {
  visibleDialog: false,
  isFolder: false,
  item: null
});
const emits = defineEmits(['hide-dialog']);
const store = useStorageStore();
const { selectedFileFolders, } = storeToRefs(store);
const totalSize = ref(0);

interface FolderProps {
  visibleDialog: boolean,
  isFolder: boolean,
  item: EcmFile | EcmFolder | null
}

const fileFolder = ref<EcmFileFolder>({} as EcmFileFolder);
const { t } = useI18n() || {};
const visible = ref(props.visibleDialog);

const id = ref(props.item ? props.item.id : selectedFileFolders.value[0].id);
const treePath = ref(props.item ? props.item.treePath : selectedFileFolders.value[0].treePath);

if (props.isFolder) {
  const { onResult: findFolderResult } = findFolderById(id.value);
  const { onResult: getTotalSizeResult } = getTotalSizeFileByTreePath(treePath.value);
  findFolderResult((res) => {
    fileFolder.value = res.data.findFolderById;
  });

  getTotalSizeResult((res) => {
    totalSize.value = res.data.getTotalSizeFileByTreePath;
  });
} else {
  const { onResult: findFileResult } = findFileById(id.value);
  findFileResult((res) => {
    fileFolder.value = res.data.findFileById;
    totalSize.value = res.data.findFileById.size;
  });
}

const categoryFormFooterButtons = {
  closeButton: {
    icon: 'close',
    label: t('common.close'),
    severity: 'danger',
    type: 'button',
    command: () => emits('hide-dialog')
  }
};
provide('dialogFooterButtons', categoryFormFooterButtons);
</script>

<script lang='ts'>
export default { name: 'FileFolderInformation' };
</script>

<style scoped>
</style>
