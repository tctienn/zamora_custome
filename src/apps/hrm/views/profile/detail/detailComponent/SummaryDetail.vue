<template>
  <ProfileDetail
    v-if='activeRightBar === icons[0]'
    v-model='model'
    class='mr-2 w-full'/>

  <ContractDetail
    v-if='activeRightBar === icons[1]'
    :employee-id='model.employeeId'/>

  <DecisionByEmployee
    v-if='activeRightBar === icons[2]'
    :employee-id='model.employeeId'/>

  <WorkingAndLeave
    v-if='activeRightBar === icons[3]'
    :employee-id='model.employeeId'
    :join-date='model.general.joinDate'/>

  <PayslipAndTax
    v-if='activeRightBar === icons[4]'
    :employee-id='model.employeeId'
    :join-date='model.general.joinDate'/>

  <PersonalSocialInsurance
    v-if='activeRightBar === icons[5] && model.employeeId'
    :employee-id='model.employeeId'/>

  <AwardDetail
    v-if='activeRightBar === icons[7]'
    :employee-id='model.employeeId'/>

  <FilesFolder
    v-if='activeRightBar === icons[8]'
    :employee-id='model.employeeId'/>
</template>

<script lang='ts' setup>
import type { PropType } from 'vue';

import type { Employee } from '@/apps/hrm/model/employee';
import AwardDetail from '@/apps/hrm/views/profile/detail/detailComponent/AwardDetail.vue';
import ContractDetail from '@/apps/hrm/views/profile/detail/detailComponent/ContractDetail.vue';
import DecisionByEmployee from '@/apps/hrm/views/profile/detail/detailComponent/DecisionByEmployee.vue';
import FilesFolder from '@/apps/hrm/views/profile/detail/detailComponent/FilesFolder.vue';
import PayslipAndTax from '@/apps/hrm/views/profile/detail/detailComponent/PayslipAndTax.vue';
import PersonalSocialInsurance from '@/apps/hrm/views/profile/detail/detailComponent/PersonalSocialInsurance.vue';
import ProfileDetail from '@/apps/hrm/views/profile/detail/detailComponent/ProfileDetail.vue';
import WorkingAndLeave from '@/apps/hrm/views/profile/detail/detailComponent/WorkingAndLeave.vue';

defineProps({
  activeRightBar: {
    type: String,
    default: null
  },
  employeeId: {
    type: String,
    default: null
  },
});

const model = defineModel({
  type: Object as PropType<Employee>,
  default: {} as Employee
});

const icons = [
  'article',
  'description',
  'mark_email_read',
  'free_cancellation',
  'request_page',
  'admin_panel_settings',
  'school',
  // 'mark_as_unread',
  'star_border',
  'folder_open'
];

</script>

<style scoped>
:deep(.p-accordion-header-link) {
  border-radius: 4px;
}

:deep(.p-accordion-header:not(.p-disabled).p-highlight .p-accordion-header-link) {
  border-bottom-right-radius: 0;
  border-bottom-left-radius: 0;
}
</style>