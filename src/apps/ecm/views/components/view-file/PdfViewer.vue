<template>
  <object
    class='h-full w-full'
    :data='`${isChatAttachment ? generateChatAttachmentPreviewUrl(treePath) : generateFilePreviewUrl(treePath)}`'>
    <div class='align-items-center flex flex-column justify-content-center'>
      <img
        :alt='name'
        class='w-10rem'
        :src='`/images/file-extension-icons/pdf.svg`' />
      <h3>{{t("ecm.storage.error.unableDisplayPdf")}}</h3>
    </div>
  </object>
</template>

<script setup lang='ts'>

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

</script>

<script lang='ts'>
export default { name: 'PdfViewer' };
</script>