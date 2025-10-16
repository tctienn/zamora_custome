<template>
  <EcmNoRouteWithCheckGridView
    :data='data'>
    <img
      :alt='data["extension"]'
      class='file-extension-icon'
      draggable='false'
      :src='getFileIcon(data["extension"])'
      @error='handleFileImageError'/>
    <template #name>
      {{ data.name }}
      <span
        class='font-italic'>
        {{ convertFileSize(data.size ? data.size : 0) }}
      </span>
    </template>
  </EcmNoRouteWithCheckGridView>
</template>

<script lang='ts' setup>

import type { PropType } from 'vue';

import type { EcmFile } from '@/apps/ecm/model/file-folder';
import EcmNoRouteWithCheckGridView
  from '@/apps/ecm/views/components/dialog/choose/grid/EcmNoRouteWithCheckGridView.vue';
import { convertFileSize, getFileIcon, handleFileImageError } from '@/common/helpers/file-utils';

defineProps({
  data: {
    type: Object as PropType<EcmFile>,
    required: true
  },
});

</script>

<style scoped>

</style>
