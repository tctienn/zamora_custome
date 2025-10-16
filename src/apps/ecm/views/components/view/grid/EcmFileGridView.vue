<template>
  <EcmStorageGridView :data='data'>
    <img
      :alt='data["extension"]'
      class='file-extension-icon'
      draggable='false'
      :src='getFileIcon(data["extension"])'
      @error='handleFileImageError'/>
    <template #name>
      <router-link
        v-tooltip.bottom='data.name'
        class='font-bold overflow-x-hidden text-center text-overflow-ellipsis w-full white-space-nowrap'
        :to='{name: "EcmFileViewer", params: {fileId: data.id}}'>{{data.name}}</router-link>
      <span
        class='font-italic'>
        {{ convertFileSize(data.size ? data.size : 0) }}
      </span>
    </template>
  </EcmStorageGridView>

</template>

<script setup lang='ts'>

import type { PropType } from 'vue';

import type { EcmFile } from '@/apps/ecm/model/file-folder';
import EcmStorageGridView from '@/apps/ecm/views/components/view/grid/EcmStorageGridView.vue';
import { convertFileSize, getFileIcon, handleFileImageError } from '@/common/helpers/file-utils';

defineProps({
  data: {
    type: Object as PropType<EcmFile>,
    required: true
  }
});
</script>

<script lang='ts'>

export default { name: 'EcmFileGridView' };
</script>

<style scoped>

</style>