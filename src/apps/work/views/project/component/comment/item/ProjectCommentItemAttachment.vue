<template>
  <div
    v-for='(file) of attachmentFiltered'
    :key='file.id'
    class='file-row p-2'>
    <div class='flex justify-content-between py-0'>
      <div
        class='align-items-center cursor-pointer flex gap-2'
        @click='openAtt(file)'>
        <img
          v-if='file.name'
          alt=''
          class='file-extension-icon h-2rem w-2rem'
          draggable='false'
          :src='getFileIcon(file.extension)'
          @error='handleFileImageError'/>
        <span :class='{"line-through":file?.isDeleted}'>
          {{ file.name }}
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
  <Dialog
    v-model:visible='visiblePreview'
    :header='selectedAtt?.name'
    maximizable
    modal
    :style='stylePreview'>
    <FilePreview
      v-if='selectedAtt'
      :name='selectedAtt.name'
      :url='(generateDownloadUrl(selectedAtt.downloadPath as string )||"").replace("/download/","/preview/")'/>
  </Dialog>
</template>

<script lang='ts' setup>
import { computed, type PropType, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import FilePreview from '@/apps/document/views/doc/preview/FilePreview.vue';
import {
  AUDIO_FILE_TYPES_SUPPORTED,
  EDITABLE_FILE_TYPES,
  IMAGE_FILE_TYPES_SUPPORTED,
  VIDEO_FILE_TYPES_SUPPORTED
} from '@/apps/ecm/constants';
import { downloadFolder } from '@/apps/work/api/rest/workAttachment';
import type { WorkAttachment } from '@/apps/work/model/workAttachment';
import { GATEWAY_URL } from '@/common/api/configService';
import {
  downloadFile,
  downloadFileUrl,
  generateChatAttachmentDownloadUrl,
  generateDownloadUrl,
  getFileIcon,
  handleFileImageError
} from '@/common/helpers/file-utils';

const props = defineProps({
  attachments: {
    type: Array as PropType<WorkAttachment[]>,
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
const attachmentFiltered = ref<(WorkAttachment & { isDeleted: boolean })[]>([]);
watch(() => props.attachments, (value) => {
  attachmentFiltered.value = value?.map(e => ({
    ...e,
    isDeleted: false
  }) || []);
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

const selectedAtt = ref<WorkAttachment>();
const visiblePreview = ref<boolean>(false);

function downloadFileFn(downloadPath: string, projectId: string, name: string) {
  downloadFolder(downloadPath, projectId).then((res) => {
    if (res) {
      downloadFile(res, name);
    }
  });
}

function openAtt(att: WorkAttachment) {
  selectedAtt.value = att;
  if (
    att?.extension
      && (IMAGE_FILE_TYPES_SUPPORTED.includes(att.extension)
          || AUDIO_FILE_TYPES_SUPPORTED.includes(att.extension)
          || VIDEO_FILE_TYPES_SUPPORTED.includes(att.extension) || 'pdf' == att.extension)
  ) {
    visiblePreview.value = true;
  } else {
    downloadFileFn(att.downloadPath, att?.objectId, att.name);
  }
}

const stylePreview = computed(() => {
  if (selectedAtt.value?.extension === 'pdf') {
    return {
      width: '70vw',
      height: '100%'
    };
  }
  return undefined;
});
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