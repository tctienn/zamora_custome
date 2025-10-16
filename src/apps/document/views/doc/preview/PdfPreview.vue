<template>
  <object
    :key='url'
    class='h-full w-full'
    :data='url'
    style='min-height: calc(50vh - 60px);'>
    <div class='align-items-center flex flex-column justify-content-center p-4'>
      <img
        :alt='name'
        class='w-10rem'
        src='/images/file-extension-icons/pdf.svg'/>
      <h3>{{ t('ecm.storage.error.unableDisplayPdf') }}</h3>
    </div>
  </object>
</template>

<script lang='ts' setup>

import { useI18n } from 'vue-i18n';

defineProps({
  url: {
    type: String,
    required: true
  },
  name: {
    type: String,
    default: ''
  }
});

const { t } = useI18n();
</script>

<style scoped>

</style>