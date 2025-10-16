<template>
  <component
    :is='viewer'
    :extension='extension'
    :name='name'
    :url='urlModified'/>
</template>

<script lang='ts' setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';

import AudioPreview from '@/apps/document/views/doc/preview/AudioPreview.vue';
import ImagePreview from '@/apps/document/views/doc/preview/ImagePreview.vue';
import PdfPreview from '@/apps/document/views/doc/preview/PdfPreview.vue';
import UnsupportedFile from '@/apps/document/views/doc/preview/UnsupportedFile.vue';
import VideoPreview from '@/apps/document/views/doc/preview/VideoPreview.vue';
import {
  AUDIO_FILE_TYPES_SUPPORTED,
  IMAGE_FILE_TYPES_SUPPORTED,
  VIDEO_FILE_TYPES_SUPPORTED
} from '@/apps/ecm/constants';
import EventBus from '@/common/helpers/event-bus';

const props = defineProps({
  url: {
    type: String,
    required: true
  },
  name: {
    type: String,
    default: ''
  }
});

const urlModified = ref(props.url);

watch(() => props.url, (newUrl) => {
  urlModified.value = newUrl;
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

function addTimestampToUrl() {
  urlModified.value = `${ props.url }?t=${ new Date().getTime() }`;
}

onMounted(() => {
  EventBus.on('reload-preview', addTimestampToUrl);
});

onUnmounted(() => {
  EventBus.off('reload-preview', addTimestampToUrl);
});
</script>