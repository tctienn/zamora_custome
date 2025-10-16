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
          for='categoryGroupCode'>{{ t('work.taskAttachment.name') }}</label>: {{ fileFolder.name }}
      </div>
    </div>

    <div class='formgrid grid'>
      <div class='col field'>
        <label
          class='font-bold'
          for='categoryGroupCode'>{{ t('work.taskAttachment.path') }}</label>: {{ fileFolder.path }}
      </div>
    </div>

    <div class='formgrid grid'>
      <div class='col field'>
        <label
          class='font-bold'
          for='categoryGroupCode'>{{ t('work.taskAttachment.name') }}</label>: {{ fileFolder.taskName }}
      </div>
    </div>

    <div class='formgrid grid'>
      <div class='col field'>
        <label
          class='font-bold'
          for='categoryGroupName'>{{ t('work.taskAttachment.type') }}</label>:
        {{ props.isFolder ? t('common.folder') : t('common.file') }}
      </div>

      <div class='col field'>
        <label
          class='font-bold'
          for='categoryGroupName'>{{ t('work.taskAttachment.size') }}</label>: {{ convertFileSize(totalSize) }}
      </div>
    </div>

    <div class='formgrid grid'>
      <div class='col field'>
        <label
          class='font-bold'
          for='categoryGroupName'>{{ t('work.taskAttachment.createdBy') }}</label>:
        {{ fileFolder.createdName }}
      </div>

      <div class='col field'>
        <label
          class='font-bold'
          for='categoryGroupName'>{{ t('work.taskAttachment.lastModifiedBy') }}</label>:
        {{ fileFolder.lastModifiedName }}
      </div>
    </div>

    <div class='formgrid grid'>
      <div class='col field'>
        <label
          class='font-bold'
          for='categoryGroupCode'>{{ t('work.taskAttachment.createdTime') }}</label>:
        {{ convertReadableDate(fileFolder.createdTime) }}
      </div>

      <div class='col field'>
        <label
          class='font-bold'
          for='categoryGroupCode'>{{ t('work.taskAttachment.lastModifiedTime') }}</label>:
        {{ convertReadableDate(fileFolder.lastModifiedTime) }}
      </div>
    </div>

    <template #footer>
      <DialogFooter/>
    </template>
  </Dialog>
</template>

<script setup lang='ts'>
import { provide, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { getFileByIdGraphql } from '@/apps/work/api/graphql/attachment-api';
import type { AttachmentInterface } from '@/apps/work/model/attachmentTask';
import type { WorkAttachment } from '@/apps/work/model/workAttachment';
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
const totalSize = ref(0);

interface FolderProps {
  visibleDialog: boolean,
  isFolder: boolean,
  item: AttachmentInterface | null
}

const fileFolder = ref<AttachmentInterface>({} as AttachmentInterface);
const { t } = useI18n() || {};
const visible = ref(props.visibleDialog);

const id = ref(props.item ? props.item.id : '');

if (id.value) {
  const { onResult: getFileByIdResult } = getFileByIdGraphql(id.value);
  getFileByIdResult((res) => {
    fileFolder.value = res.data.getFileById;
    totalSize.value = res.data.getFileById.size;
  });
}

const categoryFormFooterButtons = {
  closeButton: {
    icon: 'close',
    label: t('common.close'),
    text: true,
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
