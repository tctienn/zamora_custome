<template>
  <div class='border-1 border-300 border-round-sm mr-2 w-full'>
    <TabView v-model:activeIndex='activeIndex'>
      <TabPanel
        v-for='(tab, index) in tabs'
        :key='index'
        :header='tab.title'>
        <component
          :is='tab.component'
          :employee-id='props.employeeId'
          :symbols-data='symbols' />
      </TabPanel>
    </TabView>
  </div>
</template>

<script lang="ts" setup>
import { defineAsyncComponent, onMounted, provide, ref, watch } from 'vue';

import { getDefaultPayslipInfos } from '@/apps/hrm/api/graphql/employee';
import { CATEGORY_TYPE } from '@/apps/hrm/constants/category';
import { fetchCategory } from '@/apps/hrm/helpers/utils';
import type { HrmCategory } from '@/apps/hrm/model/category';

// Mỗi tab gắn với 1 component
const props = defineProps({
  employeeId: {
    type: String,
    default: null
  },
});

const tabs = ref([
  {
    title: 'Phiếu lương tháng',
    component: defineAsyncComponent(() =>
      import('@/apps/hrm/views/profile/detail/detailComponent/PayslipByEmployee/MonthlyPayslip.vue')
    ),
  },
  {
    title: 'Diễn biến lương',
    component: defineAsyncComponent(() =>
      import('@/apps/hrm/views/profile/detail/detailComponent/PayslipByEmployee/SalaryProcess.vue')
    ),
  },
]);

const activeIndex = ref(0);
const symbols = ref<HrmCategory[]>([]);

// Fetch default payslip infos and provide to child components
const defaultPayslipInfos = ref<any[]>([]);
const { result } = getDefaultPayslipInfos();

// Watch for changes in the API result
watch(result, (newResult) => {
  if (newResult?.getDefaultPayslipInfos) {
    defaultPayslipInfos.value = newResult.getDefaultPayslipInfos;
  }
}, { immediate: true });

// Provide the data to child components
provide('defaultPayslipInfos', defaultPayslipInfos);
</script>

<style scoped>
:deep(.p-tabview-nav-container) {
  position: sticky;
  top: 0;
  z-index: 1;
  background-color: var(--surface-a);
}
:deep(.p-tabview .p-tabview-nav li .p-tabview-nav-link) {
  padding: 10px !important;
}
</style>
