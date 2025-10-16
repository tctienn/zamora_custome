<template>
  <video
    class='max-w-75 min-w-50'
    controls>
    <source :src='generatePreviewFileUrl(downloadPath)'>
    {{ t('ecm.storage.error.browserNotSupportVideo') }}
  </video>
</template>

<script setup lang='ts'>
import { useI18n } from 'vue-i18n';

import { generatePreviewFileUrl } from '@/common/helpers/file-utils';

defineProps({
  downloadPath: {
    type: String,
    required: true
  },
  isChatAttachment: {
    type: Boolean,
    default: false
  }
});

const { t } = useI18n();
</script>

<script lang='ts'>
export default { name: 'VideoViewer' };
</script>