<template>
  <div class='border-1 border-300 border-round-sm mr-2 w-full'>
    <TabView v-model:activeIndex='activeIndex'>
      <TabPanel
        v-for='(tab, index) in tabs'
        :key='index'
        :header='tab.title'>
        <component
          :is='tab.component'
          :employee='employeeId'
          :join-date='joinDate'
          :symbols-data='symbols'/>
      </TabPanel>
    </TabView>
  </div>
</template>

<script lang='ts' setup>
import { defineAsyncComponent, onMounted, ref } from 'vue';

import { CATEGORY_TYPE } from '@/apps/hrm/constants/category';
import { fetchCategory } from '@/apps/hrm/helpers/utils';
import type { HrmCategory } from '@/apps/hrm/model/category';

// Mỗi tab gắn với 1 component
const props = defineProps({
  employeeId: {
    type: String,
    default: null
  },
  joinDate: {
    type: [String, Date], // ✅ Cho phép cả string lẫn Date
    default: ''
  }
});
const tabs = ref([
  {
    title: 'Bảng chấm công tháng',
    component: defineAsyncComponent(() =>
      import('@/apps/hrm/views/profile/detail/detailComponent/WorkingAndLeave/MonthlyTimesheet.vue')
    ),
  },
  {
    title: 'Bảng theo dõi phép năm',
    component: defineAsyncComponent(() =>
      import('@/apps/hrm/views/profile/detail/detailComponent/WorkingAndLeave/AnnualLeave.vue')
    ),
  },
]);

const activeIndex = ref(0);
const symbols = ref<HrmCategory[]>([]);
onMounted(() => {
  fetchCategory(CATEGORY_TYPE.TIMEKEEPING_SYMBOLS, symbols);
});
</script>

<style scoped>
:deep(.p-tabview-nav-container) {
  position: sticky;
  top: 0;
  z-index: 1;
  background-color: var(--surface-a);
}
</style>
