<template>
  <div class='border-round flex flex-column tree-select-cpn'>
    <TabMenu :model='menus'>
      <template #item='{item}'>
        <div
          v-ripple
          class='flex gap-2 p-menuitem-link p-ripple px-3'
          style='padding-top: 10px; padding-bottom: 5px'>
          <a style='height: 1.5rem'>{{ item.label }}</a>
          <Badge
            v-if='item["count"]'
            :value='item["count"]'></Badge>
        </div>
      </template>
    </TabMenu>
    <HrmTree
      ref='treeRef'
      class='border-none pt-1'
      scroll-height='calc(100vh - 13rem)'
      :undefined-organization='t("hrm.profile.notAssigned")'
      @update-count='updateCount'/>
  </div>
</template>

<script lang='ts' setup>
import type { MenuItem } from 'primevue/menuitem';
import { inject, onMounted, reactive, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { hasPermission } from '@/apps/admin/services/permission';
import { countEmployeeByFilter, countEmployeeSnapshotStatus } from '@/apps/hrm/api/graphql/employee';
import HrmTree from '@/apps/hrm/components/tree/HrmTree.vue';
import type { StatusCount } from '@/apps/hrm/model/count';
import { EmployeeSnapshotStatus } from '@/apps/hrm/model/employee';
import { useHrmProfileStore } from '@/common/store/hrm-profile';

const { t } = useI18n();
const hrmProfileStore = useHrmProfileStore();
const {
  resetChangedProperties,
  setRefetchCountTree
} = hrmProfileStore;
const treeRef = ref<InstanceType<typeof HrmTree>>();
const snapshotStatus = inject('snapshotStatus', ref<EmployeeSnapshotStatus>());
const menus = reactive<MenuItem[]>(
  [
    {
      visible: hasPermission('/HRM/HRM_PROFILE/HRM_PROFILE_CURRENT/'),
      label: t('hrm.profile.statusOptions.active'),
      code: EmployeeSnapshotStatus.ACTIVE,
      command: () => {
        resetChangedProperties();
        snapshotStatus.value = EmployeeSnapshotStatus.ACTIVE;
      }
    },
    {
      visible: hasPermission('/HRM/HRM_PROFILE/HRM_PROFILE_PENDING/'),
      label: t('hrm.profile.statusOptions.pending'),
      code: EmployeeSnapshotStatus.PENDING,
      command: () => {
        resetChangedProperties();
        snapshotStatus.value = EmployeeSnapshotStatus.PENDING;
      }
    }
  ]
);

const {
  onResult,
  refetch
} = countEmployeeSnapshotStatus();

onResult(res => {
  if (res.loading) {
    return;
  }
  const counts = res.data.countEmployeeSnapshotStatus as StatusCount[] || [];
  menus.forEach(
    m => {
      const c = counts.find(c => c.status === m['code']);
      m['count'] = c?.count || 0;
    });
});

watch(snapshotStatus, () => {
  setTimeout(() => treeRef.value?.emitUpdateCountForCurrentExpandedNodes(), 500);
});

function updateCount(id: string) {
  countEmployeeByFilter({
    organization: id,
    snapshotStatus: snapshotStatus.value
  })
    .onResult(res => {
      if (res.loading) {
        return;
      }
      treeRef.value?.updateModelCount(id, res.data.countEmployeeByFilter);
    });
}

// Gán refetch function vào Pinia store
onMounted(() => {
  setRefetchCountTree(refetch);
});
</script>

<style scoped>

</style>
