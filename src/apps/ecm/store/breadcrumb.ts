import { defineStore, storeToRefs } from 'pinia';
import { nextTick, ref, watch } from 'vue';

import { getCapacity, getTreePath, ServiceType } from '@/apps/ecm/api/graphql/file-manage';
import { useEcmPermissions } from '@/apps/ecm/store/ecm_group_permissions';
import { useStorageStore } from '@/apps/ecm/store/storage';

export const useBreadcrumbStore = defineStore('ecm_breadcrumb', () => {
  const { groupId } = storeToRefs(useEcmPermissions());
  const changeFileFolder = ref(false);
  const path = ref<string>('');
  const pathId = ref<string>('');
  const usedCapacity = ref(0);
  const totalCapacity = ref(1);

  const {
    folderId,
    rootFolderId,
    serviceType,
  } = storeToRefs(useStorageStore());

  function getCapacityFn() {
    getCapacity(serviceType.value, rootFolderId.value, serviceType.value == ServiceType.GROUP ? groupId.value : undefined)
      .onResult((res) => {
        usedCapacity.value = res.data.getCapacity.used;
        totalCapacity.value = res.data.getCapacity.total;
      });
  }

  function createBreadcrumb() {
    if (folderId.value) {
      getTreePath(serviceType.value, folderId.value)
        .onResult((a) => {
          if (a.data?.treePath) {
            path.value = a.data.treePath.path;
            pathId.value = a.data.treePath.pathId;
          }
        });
    }
  }

  watch(folderId, () => nextTick(createBreadcrumb));

  watch(changeFileFolder, () => nextTick(getCapacityFn));

  watch(rootFolderId, () =>
    nextTick(() => {
      createBreadcrumb();
      getCapacityFn();
    }));

  function resetPath() {
    path.value = '';
    pathId.value = '';
  }

  return {
    path,
    pathId,
    resetPath,
    createBreadcrumb,
    usedCapacity,
    totalCapacity,
    changeFileFolder,
    getCapacityFn
  };
});