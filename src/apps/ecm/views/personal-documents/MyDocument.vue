<template>
  <EcmTemplate/>
</template>

<script setup lang='ts'>

import { storeToRefs } from 'pinia';
import { onMounted, onUnmounted } from 'vue';
import { onBeforeRouteUpdate, useRoute } from 'vue-router';

import { getRootFolderId, listFoldersAndFiles, ServiceType } from '@/apps/ecm/api/graphql/file-manage';
import { useStorageStore } from '@/apps/ecm/store/storage';
import EcmTemplate from '@/apps/ecm/views/components/view/EcmTemplate.vue';
import EventBus from '@/common/helpers/event-bus';
import { useEcmErrorStore } from '@/common/store/ecm-error';

const storageStore = useStorageStore();
const {
  folderId,
  rootFolderId,
  serviceType,
} = storeToRefs(storageStore);
serviceType.value = ServiceType.PERSON;
const erStore = useEcmErrorStore();

const route = useRoute();

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
    if (serviceType.value === ServiceType.PERSON) {
      storageStore.setFilesFolders(foldersAndFiles.files, foldersAndFiles.folders);
    }
    erStore.setSuccessDone();

    stop();
  });
}

function loadFoldersFiles() {
  const {
    onError,
    onResult,
    stop
  } = getRootFolderId(serviceType.value, '');

  onError((e) => {
    erStore.setErrorDone(e);
    stop();
  });
  onResult((a) => {
    rootFolderId.value = a.data.rootFolder.id;
    const query = route.query;
    if (query['folderId']) {
      folderId.value = query['folderId'].toString();
    } else {
      folderId.value = rootFolderId.value || '';
    }
    getFilesAndFolders();

    stop();
  });
}

onBeforeRouteUpdate((to, from, next) => {
  if (to.path === from.path) {
    folderId.value = to.query['folderId']?.toString() || rootFolderId.value;
    getFilesAndFolders();
  }
  next();
});

onMounted(() => {
  erStore.startFetchingData();
  loadFoldersFiles();
  EventBus.on('updateListFileFolder', loadFoldersFiles);
});

onUnmounted(() => {
  EventBus.off('updateListFileFolder', loadFoldersFiles);
});

</script>

<script lang='ts'>
export default { name: 'MyDocuments' };
</script>
