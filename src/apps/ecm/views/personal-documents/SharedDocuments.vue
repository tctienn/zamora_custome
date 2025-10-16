<template>
  <EcmTemplate>
    <template #breadcrumb>
      <EcmSharedBreadcrumb class='bg-transparent ecm-breadcrumb pl-3'/>
    </template>
  </EcmTemplate>
</template>

<script lang='ts' setup>
import { storeToRefs } from 'pinia';
import { onMounted } from 'vue';
import { onBeforeRouteUpdate, useRoute } from 'vue-router';

import { getRootFolderId, listFoldersAndFiles, ServiceType } from '@/apps/ecm/api/graphql/file-manage';
import { useBreadcrumbStore } from '@/apps/ecm/store/breadcrumb';
import { useStorageStore } from '@/apps/ecm/store/storage';
import EcmTemplate from '@/apps/ecm/views/components/view/EcmTemplate.vue';
import EcmSharedBreadcrumb from '@/apps/ecm/views/components/view/header/EcmSharedBreadcrumb.vue';
import { useEcmErrorStore } from '@/common/store/ecm-error';

const storageStore = useStorageStore();
const breadcrumbStore = useBreadcrumbStore();
const erStore = useEcmErrorStore();
const {
  serviceType,
  folderId,
  rootFolderId
} = storeToRefs(storageStore);
serviceType.value = ServiceType.SHARED;

const route = useRoute();

function setFolderIdAndLoadData() {
  const query = route.query;
  const qFolderId = query['folderId'];
  if (qFolderId) {
    folderId.value = qFolderId ? qFolderId.toString() : '';
    const {
      onResult,
      stop
    } = getRootFolderId(serviceType.value, folderId.value);

    onResult((a) => {
      rootFolderId.value = a.data.rootFolder.id;
      stop();
      getFilesAndFolders();
    });
  } else {
    storageStore.resetFolderIds();
    breadcrumbStore.resetPath();

    getFilesAndFolders();
  }
}

function getFilesAndFolders() {
  const {
    onError,
    onResult,
    stop
  } = listFoldersAndFiles(serviceType.value, folderId.value);

  onError((e) => {
    erStore.setErrorDone(e);
    stop();
  });
  onResult((b) => {
    const foldersAndFiles = b.data.listFoldersAndFiles;
    if (serviceType.value === ServiceType.SHARED) {
      storageStore.setFilesFolders(foldersAndFiles.files, foldersAndFiles.folders);
    }
    erStore.setSuccessDone();
    stop();
  });
}

onBeforeRouteUpdate((to, from, next) => {
  if (to.path === from.path) {
    folderId.value = to.query['folderId']?.toString() || '';
    if (folderId.value) {
      const {
        onResult,
        stop
      } = getRootFolderId(serviceType.value, folderId.value);

      onResult((a) => {
        rootFolderId.value = a.data.rootFolder.id;
        stop();
        getFilesAndFolders();
      });
    } else {
      storageStore.resetFolderIds();
      breadcrumbStore.resetPath();
      getFilesAndFolders();
    }
  }
  next();
});

onMounted(() => {
  erStore.startFetchingData();
  setFolderIdAndLoadData();
});
</script>

<script lang='ts'>
export default { name: 'SharedDocuments' };
</script>