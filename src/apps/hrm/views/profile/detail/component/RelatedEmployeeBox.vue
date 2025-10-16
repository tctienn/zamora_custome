<template>
  <div class='overflow-auto'>
    <RelatedEmployees
      :data='data?.sameOrganization'
      type='Phòng ban'/>
    <RelatedEmployees
      :data='data?.sameLastName'
      type='Tên'/>
    <RelatedEmployees
      :data='data?.sameFirstName'
      type='Họ'/>
    <RelatedEmployees
      label='Nhân sự '
      type='Liên quan'/>
  </div>
</template>

<script setup lang='ts'>

import { ref } from 'vue';

import { findRelatedEmployees } from '@/apps/hrm/api/graphql/employee';
import RelatedEmployees from '@/apps/hrm/views/profile/detail/component/RelatedEmployees.vue';

const props = defineProps({
  employeeId: {
    type: String,
    default: null
  },
});
const data = ref<any>();
const { onResult: findRelatedEmployeesResult } =
  findRelatedEmployees(
    props.employeeId
  );

findRelatedEmployeesResult((res) => {
  data.value = res.data.findRelatedEmployees;
});
</script>

<style scoped>

</style>