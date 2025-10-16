<template>
  <object
    class='h-full w-full'
    :data='`${generateFilePreviewPdfUrl(path, extension)}`'>
    <div class='align-items-center flex flex-column h-full justify-content-center'>
      <img
        :alt='name'
        class='w-10rem'
        :src='getFileIcon(extension)' />
      <h3>{{t("ecm.storage.error.unablePreviewFile")}}</h3>
    </div>
  </object>
</template>

<script setup lang='ts'>

import { useI18n } from 'vue-i18n';

import { generateFilePreviewPdfUrl, getFileIcon } from '@/common/helpers/file-utils';

defineProps({
  path: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  extension: {
    type: String,
    required: true
  }
});

const { t } = useI18n();

</script>

<script lang='ts'>
export default { name: 'EditableViewer' };
</script>