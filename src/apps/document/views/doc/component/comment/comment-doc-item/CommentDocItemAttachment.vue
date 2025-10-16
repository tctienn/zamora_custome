<template>
  <div
    v-for='(file) of attachmentFiltered'
    :key='file.id'
    class='file-row p-2'>
    <div class='flex justify-content-between py-0'>
      <div
        class='align-items-center cursor-pointer flex gap-2'
        @click='viewDetail(file.filePath || "" ,file.fileExtension,file.fileName || "")'>
        <img
          v-if='file.fileName'
          alt=''
          class='file-extension-icon h-2rem w-2rem'
          draggable='false'
          :src='getFileIcon(file.fileExtension)'
          @error='handleFileImageError'/>
        <span :class='{"line-through":file?.isDeleted}'>
          {{ file.fileName }}
        </span>
      </div>
      <template v-if='allowDelete'>
        <ButtonIcon
          v-if='!file.isDeleted'
          v-tooltip.top="t('Xoá tệp')"
          class='p-1'
          icon='close'
          size='1.2'
          style='border-radius:50%'
          text
          @click.stop='deleteAttachment(file.id)'/>
        <ButtonIcon
          v-if='file.isDeleted'
          v-tooltip.top="t('Bỏ xoá tệp')"
          class='p-1'
          icon='replay'
          size='1.2'
          style='border-radius:50%'
          text
          @click.stop='unDeleteAttachment(file.id||"")'/>
      </template>

    </div>
  </div>
</template>

<script lang='ts' setup>
import { cloneDeep } from 'lodash';
import { type PropType, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import type { DocumentAttachment } from '@/apps/document/model/attachment';
import { EDITABLE_FILE_TYPES } from '@/apps/ecm/constants';
import { GATEWAY_URL } from '@/common/api/configService';
import {
  downloadFileUrl,
  generateChatAttachmentDownloadUrl,
  getFileIcon,
  handleFileImageError
} from '@/common/helpers/file-utils';

const props = defineProps({
  attachments: {
    type: Array as PropType<DocumentAttachment[]>,
    default: () => []
  },
  allowDelete: {
    type: Boolean,
    default: false,
  }
});
const deletedAttachment = defineModel<Set<string>>('deletedAttachment', { default: () => new Set() });
// const emits = defineEmits<{
//   (e:'deleteAttachment', attachmentId:string):void
// }>();
const attachmentFiltered = ref<DocumentAttachment[]>([]);
watch(() => props.attachments, (value) => {
  attachmentFiltered.value = cloneDeep(value);
}, { immediate: true });
const { t } = useI18n();

function downloadAttachment(fullName: string, path: string) {
  const fileUrl = generateChatAttachmentDownloadUrl(path);
  if (fileUrl) {
    downloadFileUrl(fileUrl, fullName);
  }
}

function viewDetail(filePath: string, extension: string, fileName: string) {
  if (EDITABLE_FILE_TYPES.includes(extension)) {
    downloadAttachment(fileName, filePath);
  } else {
    window.open(GATEWAY_URL + '/files/preview/' + filePath);
  }
}

function deleteAttachment(id?: string) {
  if (id && props.allowDelete) {
    deletedAttachment.value.add(id);
    const item = attachmentFiltered.value.find(e => e.id === id);
    if (item) {
      item.isDeleted = true;
    }
  }
}

function unDeleteAttachment(id: string) {
  deletedAttachment.value.delete(id);
  const item = attachmentFiltered.value.find(e => e.id === id);
  if (item) {
    item.isDeleted = false;
  }
}

</script>

<style scoped>
.file-row {
  &:hover {
    .btnAction {
      display: block;
    }
  }
}

.btnAction {
  display: none
}
</style>