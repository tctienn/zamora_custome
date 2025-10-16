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
import AggregateByOrg from '@/apps/document/views/dashboard/components/AggregateByOrg.vue';
import PersonalSummary from '@/apps/document/views/dashboard/components/PersonalSummary.vue';
import VanThuAggregateByOrg from '@/apps/document/views/dashboard/components/VanThuAggregateByOrg.vue';

const { userDeptRole } = storeToRefs(useDocumentRolesStore());

const dashboardComponents = computed(() => {
  switch (userDeptRole.value.roleId) {
  case RoleType.LANH_DAO:
    return [PersonalSummary, AggregateByOrg];
  case RoleType.VAN_THU:
    return [PersonalSummary, VanThuAggregateByOrg];
  case RoleType.CHUYEN_VIEN:
  case RoleType.TRO_LY:
    return [PersonalSummary];
  default:
    return [];
  }
});
</script>

<style scoped>
.dashboard-grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fit, minmax(35rem, 1fr));
}
</style>
