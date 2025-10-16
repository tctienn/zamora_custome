<template>
  <object
    v-if='href'
    class='h-full w-full'
    :data='href'>
    >
    <div class='align-items-center flex flex-column justify-content-center'>
      <img
        :alt='name'
        class='w-10rem'
        :src='`/images/file-extension-icons/pdf.svg`'/>
      <h3>{{ t("ecm.storage.error.unableDisplayPdf") }}</h3>
    </div>
  </object>
</template>

<script setup lang='ts'>

import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { viewPreVersion } from '@/common/helpers/file-utils';

const props = defineProps({
  md5: {
    type: String,
    default: ''
  },
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
const href = ref();
const { t } = useI18n();

viewPreVersion(props.treePath, props.md5).then((res) => {
  if (res) {
    const blob = new Blob([res], { type: 'application/pdf' },);
    href.value = window.URL.createObjectURL(blob);
  }
});
</script>

<script lang='ts'>
export default { name: 'PdfViewer' };
</script>