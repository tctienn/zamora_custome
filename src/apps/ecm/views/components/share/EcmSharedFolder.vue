<template>
  <div
    class='align-items-center content-header flex flex-row justify-content-between'>
    <EcmSharedBreadcrumb class='pl-3'/>
  </div>
  <AppLoader v-if='loading'/>
  <EcmStorage v-else/>
</template>

<script setup lang='ts'>
import { storeToRefs } from 'pinia';
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

import { getRootFolderId, ServiceType } from '@/apps/ecm/api/graphql/file-manage';
import { getSharedFileFolderInFolderGraphql } from '@/apps/ecm/api/graphql/share';
import { useBreadcrumbStore } from '@/apps/ecm/store/breadcrumb';
import { useStorageStore } from '@/apps/ecm/store/storage';
import EcmStorage from '@/apps/ecm/views/components/view/EcmStorage.vue';
import EcmSharedBreadcrumb from '@/apps/ecm/views/components/view/header/EcmSharedBreadcrumb.vue';

const storageStore = useStorageStore();
const breadcrumbStore = useBreadcrumbStore();
const {
  serviceType,
  folderId,
  rootFolderId
} = storeToRefs(storageStore);
const loading = ref(false);
serviceType.value = ServiceType.SHARED;

function setFolderId() {
  const route = useRoute();
  const { folderId: queryFolderId } = route.params;

  if (queryFolderId) {
    folderId.value = queryFolderId as string;
    getRootFolderId(serviceType.value, folderId.value)
      .onResult((a) => {
        rootFolderId.value = a.data.rootFolder ? a.data.rootFolder.id : null;
      });
  } else {
    storageStore.resetFolderIds();
    breadcrumbStore.resetPath();
  }
}

function getFilesAndFolders() {
  getSharedFileFolderInFolderGraphql(folderId.value)
    .onResult((b) => {
      const foldersAndFiles = b.data.sharedFileFolderInFolder;
      if (serviceType.value === ServiceType.SHARED) {
        storageStore.setFilesFolders(foldersAndFiles.files, foldersAndFiles.folders);
      }
      loading.value = false;
    });
}

onMounted(() => {
  loading.value = true;
  setFolderId();
  getFilesAndFolders();
});

</script>

<script lang='ts'>
export default { name: 'EcmSharedFile' };
</script>

<style scoped>

</style>