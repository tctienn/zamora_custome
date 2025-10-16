<template>
  <div class='flex flex-column gap-4 h-full'>
    <div
      style='font-size: 18px;
      font-weight: bold;
      color: #1A4F9C;
      text-align: center;'>
      Hệ thống cảnh báo
    </div>

    <div class='flex flex-column'>
      <div class='cursor-pointer flex hover:bg-black-alpha-10 justify-content-between p-2'>
        <div class='align-content-center'>Hồ sơ nhân sự khai chờ phê duyệt</div>
        <span
          class='number-user'>{{ warning?.totalPendingContract }}</span>
      </div>

      <div
        class='cursor-pointer flex hover:bg-black-alpha-10 justify-content-between p-2'
        @click='visibleSidebar = true'>
        <div class='align-content-center'>Hồ sơ chưa đầy chủ thông tin cần thiết</div>
        <span
          class='number-user'>{{ warning?.totalProfileNotComplete }}</span>
      </div>

      <div class='cursor-pointer flex hover:bg-black-alpha-10 justify-content-between p-2'>
        <div class='align-content-center'>Hợp đồng lao động sắp hết hạn</div>
        <span
          class='number-user'>{{ warning?.totalContractExpire }}</span>
      </div>

      <div class='cursor-pointer flex hover:bg-black-alpha-10 justify-content-between p-2'>
        <div class='align-content-center'>Đến hạn bổ nhiệm lại, quá hạn</div>
        <span
          class='number-user'>{{ warning?.totalDecisionExpire }}</span>
      </div>

      <div class='cursor-pointer flex hover:bg-black-alpha-10 justify-content-between p-2'>
        <div class='align-content-center'>Hết hạn nghỉ thai sản</div>
        <span
          class='number-user'>{{ warning?.totalMaternityLeaveExpire }}</span>
      </div>
    </div>
  </div>

  <WarningSidebar
    v-if='visibleSidebar'
    :organization-id='organizationId'
    :visible='visibleSidebar'
    @hide-dialog='visibleSidebar = false'/>
</template>

<script lang='ts' setup>

import { ref, watch } from 'vue';

import { getWarningDashboard } from '@/apps/hrm/api/graphql/employee';
import WarningSidebar from '@/apps/hrm/views/dashboard/component/WarningSidebar.vue';

const props = defineProps<{
  organizationId?: string | null;
}>();

const visibleSidebar = ref(false);
const warning = ref();

watch(() => props.organizationId, (value) => {
  getWarningDashboard(value).onResult((res) => {
    warning.value = res.data?.getWarningDashboard;
  });
});

</script>

<style scoped>
:deep(.p-card-title) {
  font-size: 18px;
  font-weight: bold;
  color: #1A4F9C;
  text-align: center;
}

.p-card {
  border-radius: 0;
}

:deep(.number-user) {
  background-color: #FF4406;
}
</style>