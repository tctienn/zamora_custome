<template>
  <div
    v-for='fileFolder in fileFolders'
    :key='fileFolder.id'
    class='border-bottom-1 flex flex-row py-1 result-item surface-border'>
    <div class='col-8 flex flex-row gap-2'>
      <img
        alt='folder icon'
        :class='isFolder(fileFolder) ? "folder-icon" : "file-extension-icon"'
        draggable='false'
        :src='getFileFolderIcon(fileFolder)'
        @error='handleFileImageError'/>
      <div class='flex flex-column justify-content-center'>
        <router-link
          class='font-bold line-number-1'
          target='_blank'
          :to='getFileFolderUrl(fileFolder)'>{{ fileFolder.name }}
        </router-link>

      </div>
    </div>

    <div class='col-2 text-center'>
      <span>{{ convertReadableDate(fileFolder.lastModifiedAt) }}</span>
    </div>
    <div class='col-2 text-center'>
      <span v-if='"size" in fileFolder'>{{ convertFileSize(fileFolder.size) }}</span>
    </div>
  </div>
</template>

<script setup lang='ts'>
import { split, startsWith } from 'lodash';
import { type PropType } from 'vue';

import { ServiceType } from '@/apps/ecm/api/graphql/file-manage';
import type { EcmFile, EcmFolder } from '@/apps/ecm/model/file-folder';
import { convertFileSize, getFileIcon, getFolderIcon, handleFileImageError } from '@/common/helpers/file-utils';
import { convertReadableDate } from '@/common/helpers/utils';

const props = defineProps({
  fileFolders: {
    type: Array as PropType<EcmFile[] | EcmFolder[]>,
    default: () => []
  },
  searchType: {
    type: String,
    default: ''
  }
});

const isFolder = (fileFolder: EcmFile | EcmFolder) => {
  return !('extension' in fileFolder);
};

const getFileFolderIcon = (fileFolder: EcmFile | EcmFolder) => {
  if (isFolder(fileFolder)) {
    return getFolderIcon();
  } else {
    return getFileIcon((fileFolder as EcmFile)['extension']);
  }
};

const getFileFolderUrl = (fileFolder: EcmFile | EcmFolder) => {
  if (isFolder(fileFolder)) {
    switch (props.searchType) {
    case ServiceType[ServiceType.PERSON]:
      return {
        name: 'EcmPersonalDocumentsMyDocuments',
        query: { folderId: fileFolder.id }
      };
    case ServiceType[ServiceType.GROUP]:
      return {
        name: 'EcmGroupDocument',
        params: { id: extractGroupIdFromTreePath(fileFolder.treePath) },
        query: { folderId: fileFolder.id }
      };
    case ServiceType[ServiceType.SHARED]:
      return {
        name: 'EcmSharedFolder',
        params: { folderId: fileFolder.id }
      };
    default:
      return '#';
    }
  } else {
    if (props.searchType === ServiceType[ServiceType.SHARED]) {
      return {
        name: 'EcmSharedFile',
        params: { fileId: fileFolder.id }
      };
    } else {
      return {
        name: 'EcmFileViewer',
        params: { fileId: fileFolder.id }
      };
    }

  }
};

const extractGroupIdFromTreePath = (treePath: string) => {
  if (startsWith(treePath, '/groups/')) {
    const treePathSplit = split(treePath, '/');
    return treePathSplit.length >= 3 ? treePathSplit[2] : '';
  }
  return '';
};
</script>

<script lang='ts'>
export default { name: 'ResultNameItem' };
</script>

<style scoped>

</style>