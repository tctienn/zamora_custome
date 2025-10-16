<template>
  <img
    id='img'
    :alt='name'
    class='max-w-75'
    :src='href'
    @error='imageOnError'/>
</template>

<script setup lang='ts'>
import { type PropType, ref } from 'vue';

import type { EcmFile } from '@/apps/ecm/model/file-folder';
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
  },
  personal: {
    type: Boolean,
    default: false
  },
  file: {
    type: Object as PropType<EcmFile>,
    default: undefined
  }
});
const isSuccessful = ref(true);
const href = ref();
viewPreVersion(props.treePath, props.md5).then((res) => {
  if (res) {
    const blob = new Blob([res]);
    href.value = window.URL.createObjectURL(blob);
  }
});
const imageOnError = () => {
  isSuccessful.value = false;
};
</script>

<script lang='ts'>
export default { name: 'ImageViewerVersion' };
</script>