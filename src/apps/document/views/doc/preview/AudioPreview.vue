<template>
  <div class='flex justify-content-center w-full'>
    <audio
      controls>
      <source :src='url'>
      {{ t('ecm.storage.error.browserNotSupportAudio') }}
    </audio>
  </div>

</template>

<script lang='ts' setup>

import { useI18n } from 'vue-i18n';

defineProps({
  url: {
    type: String,
    required: true
  }
});
const { t } = useI18n();

</script>

<style scoped>

</style>