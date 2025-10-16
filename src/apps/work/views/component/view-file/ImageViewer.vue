<template>
  <img
    v-if='isSuccessful'
    :alt='name'
    class='max-w-75'
    :src='generatePreviewFileUrl(downloadPath)'
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

import { generateFilePreviewUrl, generatePreviewFileUrl } from '@/common/helpers/file-utils';

defineProps({
  downloadPath: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
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