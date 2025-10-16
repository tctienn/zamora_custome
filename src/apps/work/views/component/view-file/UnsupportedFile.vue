<template>
  <div class='align-items-center flex flex-column'>
    <img
      alt='unsupported'
      class='w-10rem'
      :src='getFileIcon(extension)'/>
    <h3>
      {{ t('ecm.storage.error.unablePreviewFile') }}
    </h3>
    <!--    <a-->
    <!--      :download='name'-->
    <!--      :href='generateFileDownloadUrl(treePath)'>{{ t('ecm.storage.fileFolderActions.download') }}</a>-->
  </div>
</template>

<script setup lang='ts'>
import { useI18n } from 'vue-i18n';

import { getFileIcon } from '@/common/helpers/file-utils';

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
export default { name: 'UnsupportedFile' };
</script>

<style scoped>

</style>