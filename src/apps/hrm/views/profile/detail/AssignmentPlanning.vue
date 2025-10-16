<template>
  <div class='grid w-full'>
    <div class='col-6 flex flex-column'>
      <p class='font-bold mb-2 p-2 surface-300 text-primary-cus'>Bổ nhiệm - Điều động</p>
      <div
        class='h-full overflow-auto px-4'
        style='max-height: 75vh'>
        <WorkProcessInternal
          v-for='(data, index) in workProcessInternals'
          :key='index'
          :index='index + 1'
          :last-index='workProcessInternals.length'
          :model-value='data'
          :to-date-time='workProcessInternals[index-1]?.fromDate'/>
      </div>
    </div>
    <div class='col-6 flex flex-column surface-0'>
      <p class='font-bold mb-2 p-2 surface-300 text-primary-cus'>Quy hoạch</p>
      <div class='h-full mx-4'>
        <PlaningProcessInternal
          v-for='(data, index) in planingProcessInternals'
          :key='index'
          :index='index + 1'
          :last-index='planingProcessInternals.length'
          :model-value='data'/>
      </div>
    </div>
  </div>
</template>

<script setup lang='ts'>
import { ref } from 'vue';

import { getAllWorkProcessInternalByEmployeeId } from '@/apps/hrm/api/graphql/insurance';
import { getDataPlaningByEmployeeId } from '@/apps/hrm/api/graphql/planing';
import PlaningProcessInternal from '@/apps/hrm/views/profile/detail/component/PlaningProcessInternal.vue';
import WorkProcessInternal from '@/apps/hrm/views/profile/detail/component/WorkProcessInternal.vue';

const props = defineProps({
  employeeId: {
    type: String,
    default: null
  },
});
const workProcessInternals = ref<any[]>([]);
const planingProcessInternals = ref<any[]>([]);

const { onResult: getAllDataPlaningByEmployeeId } =
  getDataPlaningByEmployeeId(props.employeeId);

const { onResult: getAllWorkProcessInternalByEmployeeIdResult } =
  getAllWorkProcessInternalByEmployeeId(props.employeeId);

getAllDataPlaningByEmployeeId((res) => {
  planingProcessInternals.value = [...res.data.getPlaningByEmployeeId].reverse();
});

getAllWorkProcessInternalByEmployeeIdResult((res) => {
  let data = res.data.getAllWorkProcessInternalByEmployeeId;

  // Sắp xếp
  const sorted = [...data].sort((a, b) => {
    if (a.isCurrent && !b.isCurrent) {
      return -1;
    }
    if (!a.isCurrent && b.isCurrent) {
      return 1;
    }

    if (a.isConcurrent && !b.isConcurrent) {
      return -1;
    }
    if (!a.isConcurrent && b.isConcurrent) {
      return 1;
    }

    return new Date(b.fromDate).getTime() - new Date(a.fromDate).getTime();
  });

  // Đánh dấu phần tử còn lại
  workProcessInternals.value = sorted.map((item) => ({
    ...item,
    isRemaining: !item.isCurrent && !item.isConcurrent,
  }));
});

</script>

<style scoped>
.text-primary-cus {
  color: var(--text-primary-custom);
}
</style>