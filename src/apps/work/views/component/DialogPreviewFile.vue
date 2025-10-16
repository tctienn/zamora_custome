<template>
  <Dialog
    v-model:visible='visibleDialog'
    v-bind='DEFAULT_DIALOG_CONFIG'
    :closable='true'
    :header='props.name'
    :pt="{
      content: {
        style: 'min-height: 50vh'
      }
    }"
    @hide='emits("hide-dialog")'>
    <component
      :is='viewer'
      :extension='extension'
      :name='name'
      :url='urlModified'/>
  </Dialog>
</template>

<script setup lang="ts">

import { computed, ref, watch, watchEffect } from 'vue';

import AudioPreview from '@/apps/document/views/doc/preview/AudioPreview.vue';
import ImagePreview from '@/apps/document/views/doc/preview/ImagePreview.vue';
import PdfPreview from '@/apps/document/views/doc/preview/PdfPreview.vue';
import UnsupportedFile from '@/apps/document/views/doc/preview/UnsupportedFile.vue';
import VideoPreview from '@/apps/document/views/doc/preview/VideoPreview.vue';
import { AUDIO_FILE_TYPES_SUPPORTED, IMAGE_FILE_TYPES_SUPPORTED, VIDEO_FILE_TYPES_SUPPORTED } from '@/apps/ecm/constants';
import { DEFAULT_DIALOG_CONFIG } from '@/common/constants';
import { getPreviewFile } from '@/common/helpers/file-utils';

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  url: {
    type: String,
    required: true,
    default: ''
  },
  name: {
    type: String,
    default: ''
  }
});

const emits = defineEmits(['hide-dialog']);

const urlModified = ref(props.url);

watchEffect(() => {
  urlModified.value = getPreviewFile(props.url);
});

const extension = computed(() => props.name.split('.').pop() || props.url.split('.').pop());
const viewer = computed(() => {
  if (!extension.value) {
    return UnsupportedFile;
  }
  if (extension.value === 'pdf') {
    return PdfPreview;
  } else if (IMAGE_FILE_TYPES_SUPPORTED.includes(extension.value)) {
    return ImagePreview;
  } else if (AUDIO_FILE_TYPES_SUPPORTED.includes(extension.value)) {
    return AudioPreview;
  } else if (VIDEO_FILE_TYPES_SUPPORTED.includes(extension.value)) {
    return VideoPreview;
  } else {
    return UnsupportedFile;
  }
});
const visibleDialog = ref(props.visible);
</script>

<script lang="ts">
export default { name: 'DialogPreviewFile' };
</script>

<style scoped>

</style>