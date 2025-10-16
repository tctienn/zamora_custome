<template>
  <div class='overflow-auto w-full'>
    <video
      class='w-full'
      controls>
      <source :src='url'>
      {{ t('ecm.storage.error.browserNotSupportVideo') }}
    </video>
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