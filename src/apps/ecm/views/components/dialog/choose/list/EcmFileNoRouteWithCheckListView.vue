<template>
  <EcmNoRouteWithCheckListView
    :data='data'>
    <img
      ref='image'
      :alt='data["extension"]'
      class='file-extension-icon'
      draggable='false'
      :src='getFileIcon(data["extension"])'
      @error='handleFileImageError'/>
    <template #name>
      {{ data.name }}
    </template>
    <template #size>
      {{ convertFileSize(data.size) }}
    </template>
  </EcmNoRouteWithCheckListView>
</template>

<script lang='ts' setup>
import type { PropType } from 'vue';

import type { EcmFile } from '@/apps/ecm/model/file-folder';
import EcmNoRouteWithCheckListView
  from '@/apps/ecm/views/components/dialog/choose/list/EcmNoRouteWithCheckListView.vue';
import { convertFileSize, getFileIcon, handleFileImageError } from '@/common/helpers/file-utils';

defineProps({
  data: {
    type: Object as PropType<EcmFile>,
    required: true
  }
});

</script>

<style scoped>

</style>
