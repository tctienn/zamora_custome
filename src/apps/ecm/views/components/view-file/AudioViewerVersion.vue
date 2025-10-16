<template>
  <audio
    v-if='href'
    class='max-w-75 min-w-50'
    controls>
    <source :src='href'>
    {{ t('ecm.storage.error.browserNotSupportAudio') }}
  </audio>
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
  isChatAttachment: {
    type: Boolean,
    default: false
  }
});

const href = ref();
const { t } = useI18n();

viewPreVersion(props.treePath, props.md5).then((res) => {
  if (res) {
    const blob = new Blob([res]);
    href.value = window.URL.createObjectURL(blob);
  }
});

</script>

<script lang='ts'>
export default { name: 'AudioViewer' };
</script>