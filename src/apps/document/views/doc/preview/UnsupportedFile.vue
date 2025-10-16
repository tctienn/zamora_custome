<template>
  <div class='align-items-center flex flex-column p-4'>
    <img
      v-if='error'
      alt='unknown'
      class='w-10rem'
      src='/images/file-extension-icons/blank.svg'/>
    <img
      v-else
      alt='unsupported'
      class='w-10rem'
      :src='getFileIcon(extension)'
      @error='error=true'/>

    <h3>
      {{ t('ecm.storage.error.unablePreviewFile') }}
    </h3>
  </div>
</template>

<script lang='ts' setup>

import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { getFileIcon } from '@/common/helpers/file-utils';

defineProps({
  extension: {
    type: String,
    default: ''
  }
});
const { t } = useI18n();
const error = ref(false);
</script>

<style scoped>

</style>