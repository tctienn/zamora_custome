<template>
  <div class='border-round card p-2'>
    <div class='flex font-bold justify-content-between text-primary text-xl'>
      <div>Giới thiệu nhân sự mới</div>
    </div>
    <div
      class='border-bottom-1 surface-border'
      style='margin: 0.5rem -0.5rem'></div>

    <div class='flex flex-column gap-3'>
      <div
        v-for='user in users'
        :key='user.id'
        class='flex gap-2'>
        <HrmAvatar
          class='border-round-sm cursor-pointer'
          width='3rem'/>
        <div class='w-full'>
          <div class='flex justify-content-between'>
            <div>{{ user.fullName }}</div>
            <div>{{ user.joinDate ? moment(user.joinDate).format('DD/MM/YYYY') : '' }}</div>
          </div>
          <div>{{ user.positionName }}{{
            user.positionName && user.organizationName ? ' | ' : ''
          }}{{ user.organizationName }}
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script lang='ts' setup>
import moment from 'moment';
import { ref } from 'vue';

import { getTopNewEmployee } from '@/apps/hrm/api/graphql/employee';
import HrmAvatar from '@/apps/hrm/components/HrmAvatar.vue';
import type { EmployeeSummary } from '@/apps/hrm/model/employee';

const users = ref<EmployeeSummary[]>();
getTopNewEmployee(5).onResult((res) => {
  users.value = res.data.getTopNewEmployee;
});
</script>

<style scoped>
</style>
