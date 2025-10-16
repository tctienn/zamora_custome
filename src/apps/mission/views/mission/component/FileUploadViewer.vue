<template>
  <div class='field mb-0 mt-2'>
    <label
      v-required>Tài liệu minh chứng</label>
    <div
      :class="[
        'align-items-center flex gap-2 justify-content-between',
        !isDetail && 'border-1 border-round-md surface-border mb-1 p-2 pr-3'
      ]">
      <div class='align-items-center flex gap-1'>
        <ButtonIcon
          v-if='!isDetail'
          v-tooltip.top='"Chỉ tải lên file có định dạng pdf, tối đa 20MB"'
          class='mr-1 text-color'
          icon='upload'
          icon-size='1.7'
          rounded
          text
          @click='fileInput?.click()'/>
        <!-- <AppIcon
          class='text-red-500'
          name='description'
          size='1.4'/> -->
        <div
          :class="isDetail ? 'font-bold' : 'cursor-pointer'"
          @click='!isDetail && fileInput?.click()'>
          <p class='text-sm'>
            {{ fileName || '' }}
          </p>
        </div>
      </div>
      <div class='align-items-center flex'>
        <i
          v-if='fileName'
          class='cursor-pointer pi pi-eye text-blue-500 text-xl'
          @click.stop='previewFile'></i>
      </div>
      <input
        v-if='!isDetail'
        ref='fileInput'
        accept='.pdf'
        class='hidden'
        type='file'
        @change='handleFileSelect'/>
    </div>
  </div>
</template>

<script lang='ts' setup>
import { type PropType, ref } from 'vue';

import type { HandleAttachmentFile } from '@/apps/mission/model/job/job';
import { generatePreviewFileUrl } from '@/common/helpers/file-utils';

const props = defineProps({
  existingFile: {
    type: Object as PropType<HandleAttachmentFile>,
    default: null
  },
  fileName: {
    type: String,
    default: ''
  },
  selectedFile: {
    type: Object as PropType<File | null>,
    default: null
  },
  onDelete: {
    type: Function as PropType<(id: string) => Promise<void>>,
    default: undefined,
  },
  isDetail: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['file-selected']);

const fileInput = ref<HTMLInputElement | null>(null);

const handleFileSelect = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) {
    return;
  }
  if (props.existingFile?.fileId && props.onDelete) {
    
    try {
      await props.onDelete(props.existingFile.fileId);
    } catch (error) {
      console.error('Xóa file cũ thất bại:', error);
    }
  }
  emit('file-selected', file);
};

const previewFile = () => {
  let fileUrl: string | undefined;
  if (props.selectedFile && props.selectedFile instanceof File) {
    fileUrl = URL.createObjectURL(props.selectedFile);
  } else if (props.existingFile?.downloadPath) {
    fileUrl = generatePreviewFileUrl(props.existingFile?.downloadPath);
  }
  window.open(fileUrl, '_blank');
};
</script>

<style scoped></style>