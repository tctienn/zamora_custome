<template>
  <div
    v-if='object?.["fullName"]'
    class='cursor-pointer flex gap-2'
    @click='viewDetail(object?.["filePath"], object?.["fileExtension"])'>
    <img
      alt=''
      class='file-extension-icon flex h-2rem pt-2'
      draggable='false'
      :src='getFileIcon((object?.["fullName"])?.split(".")
        [(object?.["fullName"])?.split(".").length - 1])'
      @error='handleFileImageError'/>
    <p class='align-content-end'><b>{{ object?.['fullName'] }}</b>
      ({{ object?.['size'] ? convertFileSize(object?.['size']) : 0 }})</p>
  </div>
</template>

<script lang='ts' setup>
import { type PropType } from 'vue';

import { EDITABLE_FILE_TYPES } from '@/apps/ecm/constants';
import type { SearchSource } from '@/apps/search/model/search-response';
import { GATEWAY_URL } from '@/common/api/configService';
import { convertFileSize, getFileIcon, handleFileImageError } from '@/common/helpers/file-utils';

const props = defineProps({
  object: {
    type: Object as PropType<SearchSource>,
    default: undefined
  },
  highlight: {
    type: Object as PropType<{ [key: string]: string[] }>,
    default: undefined
  }
});

function viewDetail(filePath: string | undefined, extension: string) {
  if (filePath) {
    if (EDITABLE_FILE_TYPES.includes(extension)) {
      window.open(GATEWAY_URL + '/files/preview/' + changeFileExtension(filePath.replace('main', 'preview'), 'pdf'));
    } else {
      window.open(GATEWAY_URL + '/files/preview/' + filePath);
    }
  }
}

function changeFileExtension(filename: string, newExtension: string): string {
  return filename.replace(/\.[^/.]+$/, `.${newExtension}`);
}
</script>

<script lang='ts'>
export default { name: 'ItemAttachment' };

</script>

<style scoped>

</style>