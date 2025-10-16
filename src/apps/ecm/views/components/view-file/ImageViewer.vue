<template>
  <img
    v-if='isSuccessful'
    :alt='name'
    class='max-w-75'
    :src='isChatAttachment ? generateChatAttachmentPreviewUrl(treePath) : generateFilePreviewUrl(treePath)'
    @error='imageOnError'/>
  <div
    v-else
    class='align-items-center flex flex-column justify-content-center'>
    <AppIcon
      class='opacity-50 text-center'
      name='broken_image'
      size='10'/>
    <h3>{{ t('ecm.storage.error.unableLoadImage') }}</h3>
  </div>
</template>

<script setup lang='ts'>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { generateChatAttachmentPreviewUrl, generateFilePreviewUrl } from '@/common/helpers/file-utils';

defineProps({
  treePath: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  isChatAttachment: {
    type: Boolean,
    default: false
  }
});

const { t } = useI18n();
const isSuccessful = ref(true);

const imageOnError = () => {
  isSuccessful.value = false;
};
</script>

<script lang='ts'>
export default { name: 'ImageViewer' };
</script>