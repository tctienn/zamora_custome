<template>
  <div
    class='align-items-center content-header flex flex-row justify-content-center'>
    <Dropdown
      v-model='groupId'
      :filter='true'
      option-label='name'
      option-value='id'
      :options='groups'
      :placeholder='t("common.selectGroup")'
      show-clear/>
  </div>
  <div
    v-if='groupId'
    class='admin-trash'>
    <EcmTemplate/>
  </div>

</template>

<script setup lang='ts'>
import { storeToRefs } from 'pinia';
import { onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import type { UserGroupInterface } from '@/apps/admin/model/userGroup';
import { getRootFolderId, listFoldersAndFiles, ServiceType } from '@/apps/ecm/api/graphql/file-manage';
import { allGroups } from '@/apps/ecm/api/graphql/group-graphql-api';
import { useStorageStore } from '@/apps/ecm/store/storage';
import EcmTemplate from '@/apps/ecm/views/components/view/EcmTemplate.vue';
import { useEcmErrorStore } from '@/common/store/ecm-error';

const { t } = useI18n();
const storageStore = useStorageStore();
const {
  serviceType,
  folderId,
  rootFolderId
} = storeToRefs(storageStore);
const erStore = useEcmErrorStore();
const groupId = ref<string>();
const groups = ref<UserGroupInterface[]>([]);
serviceType.value = ServiceType.ADMIN_TRASH;

function loadFilesFolders() {
  erStore.startFetchingData();
  if (groupId.value) {
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
        folderId.value = rootFolderId.value;
        getFilesAndFolders();
      } else {
        erStore.setSuccessDone();
      }
      stop();
    });
  } else {
    erStore.setSuccessDone();
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
    if (serviceType.value === ServiceType.ADMIN_TRASH) {
      storageStore.setFilesFolders(foldersAndFiles.files, foldersAndFiles.folders);
    }
    erStore.setSuccessDone();
    stop();
  });
}

onMounted(() => {
  allGroups().onResult(a => {
    if (a.data.allGroups) {
      groups.value = a.data.allGroups;
    }
  });
  storageStore.resetCopyPaste();
  storageStore.saveLayoutBefore('list', {
    column: 'lastModifiedAt',
    direction: 'desc'
  });
});

watch(groupId, loadFilesFolders);
</script>

<script lang='ts'>
import { defineComponent } from 'vue';

export default defineComponent({ name: 'EcmAdminTrash' });
</script>

<style lang='scss'>
.admin-trash {
  .ecm-storage {
    .ecm-wrap-view {
      height: calc(100vh - 16.5rem);

      &.has-extra-space {
        height: calc(100vh - 20.5rem);
      }
    }
  }
}

</style>