<template>
  <input
    ref='upload'
    multiple
    style='display: none'
    type='file'
    @cancel='cancelCurrentUpload'
    @change='selectedFiles'>
  <div
    v-if='selectingFiles'>Selecting ...
  </div>
  <div
    v-else
    class='flex flex-column gap-2'>
    <div
      v-for='file of files'
      :key='file.webkitRelativePath'
      class='align-items-center grid'>
      <ProgressSpinner
        class='col col-fixed h-2rem w-2rem'
        stroke-width='8'/>
      <div class='col flex gap-2'>
        <img
          :alt='file.type'
          class='w-2rem'
          :src='`/images/file-extension-icons/${file.name.substring(file.name.lastIndexOf(".") + 1)}.svg`'/>
        <div class='flex flex-column'>
          <span class='overflow-hidden text-overflow-ellipsis white-space-nowrap'>{{ file.name }}</span>
          <small class='font-italic'>{{ convertFileSize(file.size) }}</small>
        </div>
      </div>

    </div>
  </div>

</template>

<script setup lang='ts'>
import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { maxChatFileSize } from '@/apps/chat/constants';
import { toastError } from '@/common/helpers/custom-toast-service';
import EventBus from '@/common/helpers/event-bus';
import { convertFileSize } from '@/common/helpers/file-utils';

const props = defineProps({
  id: {
    type: String,
    required: true
  }
});
const { t } = useI18n();
const upload = ref();
const files = ref<FileList>();
const selectingFiles = ref(true);

function cancelCurrentUpload() {
  EventBus.emit('cancel-current-upload', props.id);
}

async function selectedFiles() {
  if (!validateSize(upload.value.files)) {
    toastError({ message: `${t('common.invalidFileSizeMessage')} ${convertFileSize(maxChatFileSize)}` });
    return;
  }
  files.value = upload.value.files;
  selectingFiles.value = false;

  EventBus.emit('send-attachments', {
    files: files.value,
    id: props.id
  });
}

function validateSize(files: FileList): boolean {
  return [...files].map(f => f.size).reduce((p, c) => p + c) < maxChatFileSize;
}

onMounted(() => {
  upload.value.click();
});
</script>

<script lang='ts'>
import { defineComponent } from 'vue';

export default defineComponent({ name: 'CUpload' });
</script>

<style scoped>

</style>