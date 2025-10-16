<template>
  <AppLoader v-if='loading'/>
  <EcmStorage v-else/>
</template>

<script setup lang='ts'>
import { storeToRefs } from 'pinia';
import { onMounted, onUnmounted, type PropType, ref } from 'vue';

import { listFoldersAndFiles, ServiceType } from '@/apps/ecm/api/graphql/file-manage';
import { useStorageStore } from '@/apps/ecm/store/storage';
import EcmStorage from '@/apps/ecm/views/components/view/EcmStorage.vue';

const props = defineProps({
  serviceType: {
    type: Number as PropType<ServiceType>,
    required: true,
    default: ServiceType.PERSON_RECENT
  }
});
const storageStore = useStorageStore();
const {
  folderId,
  selectedFileFolders,
  serviceType: type,
} = storeToRefs(storageStore);

function getFilesAndFolders() {
  const {
    onResult,
    stop
  } = listFoldersAndFiles(type.value, folderId.value);

  onResult((b) => {
    const foldersAndFiles = b.data.listFoldersAndFiles;
    if (type.value === props.serviceType) {
      storageStore.setFilesFolders(foldersAndFiles.files, foldersAndFiles.folders);
    }
    loading.value = false;
    stop();
  });
}

onMounted(() => {
  type.value = props.serviceType;
  loading.value = true;
  getFilesAndFolders();
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
const loading = ref(false);
</script>

<script lang='ts'>
export default { name: 'OneLayerDocuments' };
</script>

<style scoped>

</style>