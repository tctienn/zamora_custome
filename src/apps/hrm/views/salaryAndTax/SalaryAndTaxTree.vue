<template>
  <div class='border-none h-full'>
    <!-- Sidebar với tabpanel chia các trạng thái -->
    <TabView
      class='h-full'
      @tab-change='onTabChange'>
      <TabPanel header='Dự thảo & theo dõi'>
        <SalaryTabPanel
          key='tab-draft'
          :current-status='currentStatus'
          :salary-data='salaries'
          :selected-salary-id='selectedSalaryId'
          @select-salary='selectSalary' />
      </TabPanel>
      <TabPanel header='Chờ xem xét'>
        <SalaryTabPanel
          key='tab-review'
          :current-status='currentStatus'
          :salary-data='salaries'
          :selected-salary-id='selectedSalaryId'
          @select-salary='selectSalary' />
      </TabPanel>
      <TabPanel header='Chờ phê duyệt'>
        <SalaryTabPanel
          key='tab-approval'
          :current-status='currentStatus'
          :salary-data='salaries'
          :selected-salary-id='selectedSalaryId'
          @select-salary='selectSalary' />
      </TabPanel>
    </TabView>
  </div>
</template>

<script lang='ts' setup>
import TabPanel from 'primevue/tabpanel';
import TabView from 'primevue/tabview';
import { computed, inject, onMounted, ref } from 'vue';

import SalaryTabPanel from './components/SalaryTabPanel.vue';

interface TreePayslip {
  id: string;
  name: string;
  type: string;
  month: number;
  year: number;
  location: string;
  createdDate: string;
  createdBy: string;
  organizationIds: string[];
  templateIds: string[];
  status: string; // Expected to be lowercase to match component logic
}

const props = defineProps<{
  salaryData?: TreePayslip[]
}>();

const emits = defineEmits(['selectStatus', 'selectSalary']);

// Inject selectedSalary from parent component
const selectedSalary = inject<any>('selectedSalary');

// Initialize userMoreInfo store
// Note: We no longer need to initialize userMoreInfoStore here as it's in the child component

// State to track which item is currently selected
const selectedSalaryId = computed(() => selectedSalary?.value?.id || null);

// Salary data from parent component
const salaries = computed(() => props.salaryData || []);

// Current status
const currentStatus = ref('all');

// Years that are currently expanded 
// Note: Each child component manages its own expansion state now

// Function to select salary
function selectSalary(salary: any) {
  // Update selectedSalary through inject
  console.log('selectSalary', salary);
  if (selectedSalary) {
    selectedSalary.value = salary;
  }
}

// Handle tab change
function onTabChange(event: any) {
  // event.index: 0 - Draft & tracking, 1 - Pending review, 2 - Pending approval
  switch (event.index) {
  case 0:
    currentStatus.value = 'DRAFT'; // Draft
    break;
  case 1:
    currentStatus.value = 'PENDING_REVIEW'; // Pending review
    break;
  case 2:
    currentStatus.value = 'PENDING_APPROVAL'; // Pending approval
    break;
  default:
    currentStatus.value = 'all';
  }
  
  // Emit event for parent component to handle
  emits('selectStatus', currentStatus.value);
}

// Watch for changes in sortedFilteredGroupedSalaries to ensure first year is always expanded
// Note: This logic will be handled in the child component now
// We'll still need to ensure correct initial expansion, but it will work through props

</script>

<style scoped>
:deep(.p-tabview-panels) {
  padding: 0.25rem !important;
}

/* We'll keep the same styling but it will be handled in the child component */
</style>