<template>
  <div class='h-fit overflow-auto'>
    <div
      v-if='error'
      class='align-items-center flex flex-column justify-content-center p-4'>
      <img
        alt='error'
        class='w-10rem'
        :src='getFileIcon(extension)'>
      <h3>{{ t('ecm.storage.error.unableLoadImage') }}</h3>
    </div>
    <img
      v-else
      :alt='name'
      :src='url'
      style='width:100%'
      @error='error=true'/>
  </div>
</template>

<script lang='ts' setup>

import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { getFileIcon } from '@/common/helpers/file-utils';

defineProps({
  url: {
    type: String,
    required: true
  },
  name: {
    type: String,
    default: ''
  },
  extension: {
    type: String,
    default: ''
  }
});
const { t } = useI18n();
const error = ref(false);
</script>