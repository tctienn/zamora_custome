<template>
  <div
    class='flex flex-column gap-2 h-full'>
    <TabMenu
      class='tab-menu-custom'
      :model='tabMenus'>
      <template #item='{item}'>
        <router-link
          v-ripple
          active-class='text-primary border-primary'
          class='align-items-center border-noround flex font-semibold gap-2 lg:hover:surface-hover nav-link-custom px-3 py-2 transition-duration-400'
          :to='item.to'>
          <span class='font-bold'>{{ item.label }}</span>
        </router-link>
      </template>
    </TabMenu>
    <router-view/>
  </div>
</template>

<script lang='ts' setup>
import { ref } from 'vue';

import { hasPermission } from '@/apps/admin/services/permission';

const tabMenus = ref([
  {
    visible: hasPermission('/HRM/HRM_ATTENDANCE/HRM_ATTENDANCE_CHECKIN/'),
    label: 'Check In/CheckOut',
    to: '/hrm/attendance-leave/check-in'
  },
  {
    visible: hasPermission('/HRM/HRM_ATTENDANCE/HRM_ATTENDANCE_TIMESHEET/'),
    label: 'Bảng chấm công',
    to: '/hrm/attendance-leave/timesheet'
  },
  {
    visible: hasPermission('/HRM/HRM_ATTENDANCE/HRM_ATTENDANCE_LEAVE/'),
    label: 'Phép năm',
    to: '/hrm/attendance-leave/leave'
  }
]);

</script>

<style scoped>
.tab-menu-custom {
  min-height: 3rem;
  border-radius: 4px;
  box-sizing: border-box;
}

:deep(.tab-menu-custom .p-tabmenu-nav) {
  height: 40px;
}

.nav-link-custom {
  height: 38px;
}

.nav-link-custom {
  border-bottom: 2px solid transparent;
  transition: border-bottom-color .2s;
}
</style>
