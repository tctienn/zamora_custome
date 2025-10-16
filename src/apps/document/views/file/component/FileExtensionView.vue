<template>
  <div
    class='folder px-3'
    :class='gridResponsiveClasses'>
    <div
      aria-haspopup='true'
      class='border-round file-folder-item flex flex-column grid-item hover:surface-100 prevent-select row-gap-2 surface-card'>
      <div class='cursor-pointer p-3'>
        <div class='align-items-center flex justify-content-between'>
          <div></div>
          <div class='align-items-center flex flex-row gap-1'>
            <div class='align-items-center flex'></div>
          </div>
        </div>

        <div class='align-items-center flex justify-content-center'>
          <img
            v-if='data.fileExtension'
            :alt='data.fileExtension'
            class='file-extension-icon'
            draggable='false'
            :src='getFileIcon(data.fileExtension)'
            @error='handleFileImageError'/>
        </div>

        <div class='text-container'>
          {{ truncate(data?.fileName, 20) }}
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { inject, type PropType } from 'vue';

import { GRID_RESPONSIVE_CLASSES_MAX_7 } from '@/common/constants';
import { getFileIcon, handleFileImageError } from '@/common/helpers/file-utils';
import type { FilesSystemData } from '@/common/model/attachment';

defineProps({
  data: {
    type: Object as PropType<FilesSystemData>,
    required: true,
  },
});

const gridResponsiveClasses = inject(
  'grid-responsive-classes',
  GRID_RESPONSIVE_CLASSES_MAX_7,
);

const truncate = (text: string | undefined, maxLength: number) => {
  if (!text) {
    return '';
  }
  return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
};
</script>

<style lang="scss" scoped>
.folder-menu {
  visibility: hidden;
}

.folder:hover {
  .folder-menu {
    visibility: visible;
  }
}

.text-container {
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  padding-top: 1rem;
  row-gap: 0.5rem;
  word-wrap: break-word;
  word-break: break-all;
  overflow-wrap: break-word;
  overflow: hidden;
  white-space: pre-wrap;
  max-width: 100%;
}
</style>
