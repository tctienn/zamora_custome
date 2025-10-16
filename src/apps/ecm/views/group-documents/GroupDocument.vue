<template>
  <EcmTemplate/>
</template>

<script setup lang='ts'>
import { storeToRefs } from 'pinia';
import { onMounted, onUnmounted } from 'vue';
import { onBeforeRouteUpdate, useRoute } from 'vue-router';

import { getRootFolderId, listFoldersAndFiles, ServiceType } from '@/apps/ecm/api/graphql/file-manage';
import { useEcmPermissions } from '@/apps/ecm/store/ecm_group_permissions';
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
const { groupId } = storeToRefs(useEcmPermissions());
const erStore = useEcmErrorStore();

serviceType.value = ServiceType.GROUP;

const route = useRoute();

function loadFoldersFiles() {
  const {
    query,
    params
  } = route;
  groupId.value = params.id as string;
  const {
    onError,
    onResult,
    stop
  } = getRootFolderId(serviceType.value, groupId.value);
  onError((e) => {
    erStore.setErrorDone(e);
    stop();
  });

  onResult((a) => {
    if (a.data.rootFolder) {
      rootFolderId.value = a.data.rootFolder.id;
      if (query['folderId']) {
        folderId.value = query['folderId'].toString();
      } else {
        folderId.value = rootFolderId.value || '';
      }
      getFilesAndFolders();
    } else {
      erStore.setSuccessDone();
    }
    stop();
  });
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
    if (serviceType.value === ServiceType.GROUP) {
      storageStore.setFilesFolders(foldersAndFiles.files, foldersAndFiles.folders);
    }
    erStore.setSuccessDone();
    stop();
  });
}

onMounted(() => {
  erStore.startFetchingData();
  loadFoldersFiles();
  EventBus.on('updateListFileFolder', loadFoldersFiles);
});

onBeforeRouteUpdate((to, from, next) => {
  if (to.path === from.path) {
    folderId.value = to.query['folderId']?.toString() || rootFolderId.value;
    getFilesAndFolders();
  }
  next();
});

onUnmounted(() => {
  EventBus.off('updateListFileFolder', loadFoldersFiles);
});
</script>

<script lang='ts'>
export default { name: 'GroupDocument' };
</script>