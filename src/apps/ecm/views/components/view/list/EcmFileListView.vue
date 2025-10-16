<template>
  <EcmStorageListView :data='data'>
    <img
      ref='image'
      :alt='data["extension"]'
      class='file-extension-icon'
      draggable='false'
      :src='getFileIcon(data["extension"])'
      @error='handleFileImageError'/>
    <template #name>
      <router-link
        v-tooltip.bottom='data.name'
        class='font-bold overflow-x-hidden text-center text-overflow-ellipsis w-full white-space-nowrap'
        :to='{name: "EcmFileViewer", params: {fileId: data.id}}'>{{ data.name }}
      </router-link>
    </template>
    <template #size>
      {{ convertFileSize(data.size) }}
    </template>
  </EcmStorageListView>
</template>

<script setup lang='ts'>
import type { PropType } from 'vue';
import { ref } from 'vue';

import type { EcmFile } from '@/apps/ecm/model/file-folder';
import EcmStorageListView from '@/apps/ecm/views/components/view/list/EcmStorageListView.vue';
import { convertFileSize, getFileIcon, handleFileImageError, } from '@/common/helpers/file-utils';

defineProps({
  data: {
    type: Object as PropType<EcmFile>,
    required: true
  }
});

const image = ref();
</script>

<script lang='ts'>
export default { name: 'EcmFileListView' };
</script>

<style scoped>

</style>