<template>
  <HrmTree
    ref='treeRef'
    class='border-none h-full'
    :undefined-organization='t("hrm.leave.notAssigned")'
    @update-count='updateCount'/>
</template>

<script lang='ts' setup>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { countEmployeeByFilter } from '@/apps/hrm/api/graphql/employee';
import HrmTree from '@/apps/hrm/components/tree/HrmTree.vue';
import { EmployeeSnapshotStatus } from '@/apps/hrm/model/employee';

const { t } = useI18n();
const treeRef = ref<InstanceType<typeof HrmTree>>();

function updateCount(id: string) {
  countEmployeeByFilter({ 
    organization: id,
    snapshotStatus: EmployeeSnapshotStatus.ACTIVE
  })
    .onResult(res => {
      if (res.loading) {
        return;
      }
      treeRef.value?.updateModelCount(id, res.data.countEmployeeByFilter);
    });
}
</script>

<style scoped>

</style>
