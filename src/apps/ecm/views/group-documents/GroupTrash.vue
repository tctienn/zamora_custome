<template>
  <EcmTemplate/>
</template>

<script setup lang='ts'>
import { storeToRefs } from 'pinia';
import { onMounted, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';

import { getRootFolderId, listFoldersAndFiles, ServiceType } from '@/apps/ecm/api/graphql/file-manage';
import { useEcmPermissions } from '@/apps/ecm/store/ecm_group_permissions';
import { useStorageStore } from '@/apps/ecm/store/storage';
import EcmTemplate from '@/apps/ecm/views/components/view/EcmTemplate.vue';
import { useEcmErrorStore } from '@/common/store/ecm-error';

const storageStore = useStorageStore();
const {
  rootFolderId,
  selectedFileFolders,
  serviceType,
} = storeToRefs(storageStore);

const route = useRoute();

const { groupId } = storeToRefs(useEcmPermissions());
const erStore = useEcmErrorStore();
serviceType.value = ServiceType.GROUP_TRASH;

function loadFoldersFiles() {
  groupId.value = route.params.id as string;
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
  } = listFoldersAndFiles(serviceType.value, rootFolderId.value);
  onError((e) => {
    erStore.setErrorDone(e);
    stop();
  });
  onResult((b) => {
    const foldersAndFiles = b.data.listFoldersAndFiles;
    if (serviceType.value === ServiceType.GROUP_TRASH) {
      storageStore.setFilesFolders(foldersAndFiles.files, foldersAndFiles.folders);
    }
    erStore.setSuccessDone();
    stop();
  });
}

onMounted(() => {
  erStore.startFetchingData();
  loadFoldersFiles();
  storageStore.resetCopyPaste();
  storageStore.saveLayoutBefore('list', {
    column: 'lastModifiedAt',
    direction: 'desc'
  });
});

onUnmounted(() => {
  selectedFileFolders.value = [];
  storageStore.changeToLayoutBefore();
});
</script>

<script lang='ts'>
export default { name: 'GroupTrash' };
</script>