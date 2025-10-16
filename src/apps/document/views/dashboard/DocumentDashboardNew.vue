<template>
  <div class='dashboard-grid h-full'>
    <template
      v-for='com in dashboardComponents'
      :key='com'>
      <component :is='com' />
    </template>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { computed } from 'vue';

import { RoleType } from '@/apps/document/model/permission';
import { useDocumentRolesStore } from '@/apps/document/store/document-role';
import AggregateByOrgNew from '@/apps/document/views/dashboard/components/AggregateByOrgNew.vue';
import PersonalSummaryNew from '@/apps/document/views/dashboard/components/PersonalSummaryNew.vue';
import VanThuAggregateByOrgNew from '@/apps/document/views/dashboard/components/VanThuAggregateByOrgNew.vue';

const { userDeptRole } = storeToRefs(useDocumentRolesStore());

const dashboardComponents = computed(() => {
  switch (userDeptRole.value.roleId) {
  case RoleType.LANH_DAO:
    return [PersonalSummaryNew, AggregateByOrgNew];
  case RoleType.VAN_THU:
    return [PersonalSummaryNew, VanThuAggregateByOrgNew];
  case RoleType.CHUYEN_VIEN:
  case RoleType.TRO_LY:
    return [PersonalSummaryNew];
  default:
    return [];
  }
});
</script>

<style scoped>
.dashboard-grid {
  display: grid;
  gap:1%;
  grid-template-columns: 66% 33%;
}
</style>
