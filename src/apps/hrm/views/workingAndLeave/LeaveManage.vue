<template>
  <div class='flex flex-column h-full'>
    <!-- Toolbar at the top with full width -->
    <Toolbar class='mb-2 p-0'>
      <template #start>
        <div class='align-items-center bold flex font-semibold gap-2 mr-4 pl-2'>
          <ButtonIcon
            v-tooltip='"Ẩn/Hiện"'
            class='align-self-center p-1'
            icon='menu'
            rounded
            text
            @click='toggleTree'/>
          <div class='font-bold'>
            Bảng theo dõi phép năm
          </div>
        </div>
        <Calendar
          ref='calendarRef'
          v-model='year'
          class='calendar'
          date-format='yy'
          :pt="{
            input: {
              class: 'hidden-calendar-input'
            },
            panel: {
              class: 'w-20rem'
            },
            root: {
              class: 'w-0 h-0 overflow-hidden absolute'
            }
          }"
          view='year'/>
        <div
          class='font-semibold year-display'
          @click='toggleCalendar'>
          <i class='pi pi-calendar'></i>
          <span>Năm {{ year ? year.getFullYear() : '' }}</span>
          <i class='pi pi-chevron-down'></i>
        </div>
      </template>

      <template #end>
        <div class='btn-group-toolbar flex gap-1 mr-1 my-1'>
          <Button
            class='focus:shadow-none font-normal gap-2 hover:surface-200'
            icon='pi pi-arrow-circle-right'
            label='Chuyển phép tồn'
            severity='secondary'/>
          <Button
            class='focus:shadow-none font-normal gap-2 hover:surface-200'
            icon='pi pi-sliders-h'
            label='Thiết lập phép năm'
            severity='secondary'/>
          <Button
            class='focus:shadow-none font-normal gap-2 hover:surface-200'
            icon='pi pi-file-import'
            label='Import'
            severity='secondary'/>
          <Button
            class='focus:shadow-none font-normal gap-2 hover:surface-200'
            icon='pi pi-file-export'
            label='Export'
            severity='secondary'/>
        </div>
      </template>
    </Toolbar>

    <!-- Main content area with tree and list -->
    <div class='full-height-table-wrapper'>
      <HrmListWrapper ref='wrapperRef'>
        <template #tree>
          <HrmLeaveTree/>
        </template>
        <template #list>
          <div class='border-round-sm h-full overflow-auto p-3 surface-0 w-full'>
            <!-- Debug info panel -->
            <div
              v-if='employeeLoading || employeeError || allEmployees.length === 0'
              class='border-round mb-2 p-3'
              style='background-color: #f8f9fa;'>
              <div
                v-if='employeeLoading'
                class='text-blue-600'>⏳ Loading employee data...</div>
              <div
                v-if='employeeError'
                class='text-red-600'>❌ Error loading data: {{ employeeError }}</div>
              <div
                v-if='!employeeLoading && !employeeError && allEmployees.length === 0'
                class='text-orange-600'>⚠️ No employee data found
              </div>
              <div
                v-if='allEmployees.length > 0'
                class='text-green-600'>✅ Loaded {{ allEmployees.length }} employees,
                showing {{ employees.length }}
              </div>
            </div>

            <DataTable
              v-model:expandedRowGroups='expandedRowGroups'
              class='full-height-table leave-table sticky-rowheader'
              expandable-row-groups
              group-rows-by='organizationName'
              :loading='employeeLoading'
              row-group-mode='subheader'
              row-hover
              :rows='pageable.size'
              scroll-height='flex'
              scrollable
              :value='employees'
              @rowgroup-collapse='onRowGroupCollapse'
              @rowgroup-expand='onRowGroupExpand'>
              
              <template #groupheader='slotProps'>
                <span
                  class='font-bold line-height-3 ml-2 vertical-align-middle'
                  style='color: #0F6CBD'>
                  {{ slotProps.data.organizationName || "Không xác định" }}
                </span>
              </template>
              
              <template #empty>
                <ProgressBar
                  v-if='employeeLoading'
                  class='border-noround'
                  mode='indeterminate'
                  style='height: .25rem'></ProgressBar>
                <EmptyResult v-else/>
              </template>
              
              <!-- STT Column -->
              <Column
                class='text-center'
                header='STT'
                style='max-width: 4rem'>
                <template #body='{index}'>
                  {{ index + 1 + (pageable.page * pageable.size) }}
                </template>
              </Column>
              
              <!-- Mã nhân sự -->
              <Column
                field='code'
                header='Mã nhân sự'
                style='min-width: 8rem'></Column>
              
              <!-- Họ và tên -->
              <Column
                field='fullName'
                header='Họ và tên'
                style='min-width: 12rem'></Column>
              
              <!-- Chức vụ -->
              <Column
                header='Chức vụ'
                style='min-width: 10rem'>
                <template #body='{data}'>
                  {{ data.positionName || data.position }}
                </template>
              </Column>
              
              <!-- Phép tồn -->
              <Column
                body-class='text-center'
                field='remainingLeave'
                header='Phép tồn'
                style='min-width: 6rem; background-color: #FAFAFA'></Column>
              
              <!-- Phép năm -->
              <Column
                body-class='text-center'
                field='annualLeave'
                header='Phép năm'
                style='min-width: 6rem; background-color: #EFF3FB'></Column>
              
              <!-- Phép thưởng -->
              <Column
                body-class='text-center'
                field='bonusLeave'
                header='Phép thưởng'
                style='min-width: 7rem; background-color: #FAFAFA'></Column>
              
              <!-- Thâm niên -->
              <Column
                body-class='text-center'
                field='seniorityLeave'
                header='Thâm niên'
                style='min-width: 7rem; background-color: #FAFAFA'></Column>
              
              <!-- Tổng phép -->
              <Column
                body-class='text-center font-semibold'
                field='totalLeave'
                header='Tổng phép'
                style='min-width: 7rem; background-color: #FFF5F5'></Column>
              
              <!-- Monthly leave columns T1-T12 -->
              <Column
                body-class='text-center'
                header='T1'
                style='min-width: 4rem'>
                <template #body='{data}'>
                  {{ data.monthlyLeave?.[0] || 0 }}
                </template>
              </Column>
              
              <Column
                body-class='text-center'
                header='T2'
                style='min-width: 4rem'>
                <template #body='{data}'>
                  {{ data.monthlyLeave?.[1] || 0 }}
                </template>
              </Column>
              
              <Column
                body-class='text-center'
                header='T3'
                style='min-width: 4rem'>
                <template #body='{data}'>
                  {{ data.monthlyLeave?.[2] || 0 }}
                </template>
              </Column>
              
              <Column
                body-class='text-center'
                header='T4'
                style='min-width: 4rem'>
                <template #body='{data}'>
                  {{ data.monthlyLeave?.[3] || 0 }}
                </template>
              </Column>
              
              <Column
                body-class='text-center'
                header='T5'
                style='min-width: 4rem'>
                <template #body='{data}'>
                  {{ data.monthlyLeave?.[4] || 0 }}
                </template>
              </Column>
              
              <Column
                body-class='text-center'
                header='T6'
                style='min-width: 4rem'>
                <template #body='{data}'>
                  {{ data.monthlyLeave?.[5] || 0 }}
                </template>
              </Column>
              
              <Column
                body-class='text-center'
                header='T7'
                style='min-width: 4rem'>
                <template #body='{data}'>
                  {{ data.monthlyLeave?.[6] || 0 }}
                </template>
              </Column>
              
              <Column
                body-class='text-center'
                header='T8'
                style='min-width: 4rem'>
                <template #body='{data}'>
                  {{ data.monthlyLeave?.[7] || 0 }}
                </template>
              </Column>
              
              <Column
                body-class='text-center'
                header='T9'
                style='min-width: 4rem'>
                <template #body='{data}'>
                  {{ data.monthlyLeave?.[8] || 0 }}
                </template>
              </Column>
              
              <Column
                body-class='text-center'
                header='T10'
                style='min-width: 4rem'>
                <template #body='{data}'>
                  {{ data.monthlyLeave?.[9] || 0 }}
                </template>
              </Column>
              
              <Column
                body-class='text-center'
                header='T11'
                style='min-width: 4rem'>
                <template #body='{data}'>
                  {{ data.monthlyLeave?.[10] || 0 }}
                </template>
              </Column>
              
              <Column
                body-class='text-center'
                header='T12'
                style='min-width: 4rem'>
                <template #body='{data}'>
                  {{ data.monthlyLeave?.[11] || 0 }}
                </template>
              </Column>
              
              <!-- Đã nghỉ -->
              <Column
                body-class='text-center'
                field='usedLeave'
                header='Đã nghỉ'
                style='min-width: 6rem'></Column>
              
              <!-- Còn lại -->
              <Column
                body-class='text-center'
                field='availableLeave'
                header='Còn lại'
                style='min-width: 6rem; background-color: #EDFFF2'></Column>
              
              <!-- Action Column -->
              <Column
                align-frozen='right'
                body-class='surface-card p-2'
                frozen
                header='Thao tác'
                style='max-width: 5rem'>
                <template #body='{data}'>
                  <Button
                    icon='pi pi-ellipsis-v'
                    rounded
                    text
                    @click='showActionMenus($event, data)'></Button>
                </template>
              </Column>
              
            </DataTable>
          </div>
        </template>
      </HrmListWrapper>
    </div>
    
    <!-- Action Context Menu -->
    <Menu
      ref='actionMenusRef'
      :model='actionMenus'
      popup></Menu>
  </div>
</template>

<script setup lang='ts'>
import type Menu from 'primevue/menu';
import type { MenuItem } from 'primevue/menuitem';
import { computed, provide, reactive, type Ref, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { getAllEmployeeInfo, searchEmployees } from '@/apps/hrm/api/graphql/employee';
import HrmListWrapper from '@/apps/hrm/components/list/HrmListWrapper.vue';
import EmptyResult from '@/common/components/empty/EmptyResult.vue';
import { toastSuccess } from '@/common/helpers/custom-toast-service';

import HrmLeaveTree from './HrmLeaveTree.vue';

interface EmployeeLeaveData {
  id: string;
  code: string;
  fullName: string;
  position: string;
  positionName: string;
  organizationId: string;
  organizationName: string;
  // Leave data (mock for now)
  remainingLeave?: number;
  annualLeave?: number;
  bonusLeave?: number;
  seniorityLeave?: number;
  totalLeave?: number;
  usedLeave?: number;
  availableLeave?: number;
  monthlyLeave?: number[];
}

// Emits for action events
const emits = defineEmits(['menu:showAction', 'show:sidebar']);
const { t } = useI18n();
const allEmployees = ref<any[]>([]);
const wrapperRef = ref<InstanceType<typeof HrmListWrapper>>();
const expandedRowGroups = ref<any[]>([]);

// Action menu refs
const actionMenus = ref<MenuItem[]>();
const actionMenusRef = ref<InstanceType<typeof Menu>>();

// Action menu functions
function viewLeaveHistory(data: any) {
  console.log('View leave history for:', data.fullName);
  toastSuccess({ message: `Xem lịch sử nghỉ phép của ${data.fullName}` });
}

function editLeaveSettings(data: any) {
  console.log('Edit leave settings for:', data.fullName);
  toastSuccess({ message: `Chỉnh sửa thiết lập phép của ${data.fullName}` });
}

function adjustLeaveBalance(data: any) {
  console.log('Adjust leave balance for:', data.fullName);
  toastSuccess({ message: `Điều chỉnh số dư phép của ${data.fullName}` });
}

function transferRemainingLeave(data: any) {
  console.log('Transfer remaining leave for:', data.fullName);
  toastSuccess({ message: `Chuyển phép tồn cho ${data.fullName}` });
}

function exportLeaveReport(data: any) {
  console.log('Export leave report for:', data.fullName);
  toastSuccess({ message: `Xuất báo cáo phép của ${data.fullName}` });
}

// Action menu handler
function showActionMenus(event: Event, data: any) {
  console.log('Action menu clicked for employee:', data);
  
  actionMenus.value = [
    {
      label: 'Xem chi tiết',
      icon: 'pi pi-eye',
      command: () => viewLeaveHistory(data)
    },
    {
      label: 'Hiệu chỉnh',
      icon: 'pi pi-pencil',
      command: () => exportLeaveReport(data)
    }
  ];
  
  actionMenusRef.value?.toggle(event);
}

// Provide organization context for tree selection
const organizationId = ref<string>();
const initialOrganizationId = ref<string>();
provide('organizationId', organizationId);
provide('initialOrganizationId', initialOrganizationId);

// Create reactive filter and pageable objects like HrmProfileList.vue
const filter = reactive<any>({});
const pageable = reactive({
  page: 0,
  size: 1000
});

// Initialize filter with organizationId if available
if (organizationId.value) {
  filter.organization = organizationId.value;
}

// Load employee data using searchEmployees API with reactive objects
const {
  result,
  loading: employeeLoading,
  error: employeeError,
  load: loadEmployees
} = searchEmployees(filter, pageable);

// Watch for result changes exactly like HrmProfileList.vue
watch(
  [() => employeeLoading.value, () => result.value],
  ([loadingVal, resultVal]) => {
    console.log('Employee search API result - Loading:', loadingVal, 'Result:', resultVal);
    
    if (loadingVal) {
      allEmployees.value = [];
      return;
    }

    if (!resultVal) {
      console.log('No result yet');
      return;
    }

    // Process data exactly like HrmProfileList.vue
    const items = (resultVal?.searchEmployees as any)?.edges?.map((e: any) => {
      // Deep clone to avoid shared reference
      const node = JSON.parse(JSON.stringify(e.node));
      return node;
    }) || [];

    console.log('Raw employee data from search API:', items);
    
    if (items.length > 0) {
      allEmployees.value = addMockLeaveData(items);
      console.log('Processed employee data with leave data:', allEmployees.value);
    } else {
      console.log('No employee data found in search response');
      allEmployees.value = [];
    }
  },
  { immediate: true }
);

// Helper function to add mock leave data
function addMockLeaveData(employees: any[]) {
  return employees.map((emp: any) => {
    const remainingLeave = Math.floor(Math.random() * 5) + 1;
    const annualLeave = 12;
    const bonusLeave = Math.floor(Math.random() * 3);
    const seniorityLeave = Math.floor(Math.random() * 2);
    const totalLeave = annualLeave + bonusLeave + seniorityLeave + remainingLeave;
    const usedLeave = Math.floor(Math.random() * 8) + 1;
    const availableLeave = totalLeave - usedLeave;
    
    const processedEmployee = {
      ...emp,
      // Mock leave data - replace with actual API calls later
      remainingLeave,
      annualLeave,
      bonusLeave,
      seniorityLeave,
      totalLeave,
      usedLeave,
      availableLeave: Math.max(0, availableLeave), // Ensure non-negative
      monthlyLeave: Array.from({ length: 12 }, () => Math.floor(Math.random() * 3))
    };
    
    // Debug logging for first employee
    if (emp.code) {
      console.log(`Employee ${emp.code}: totalLeave=${totalLeave}, usedLeave=${usedLeave}, availableLeave=${Math.max(0, availableLeave)}`);
    }
    
    return processedEmployee;
  });
}

// Watch for changes in allEmployees
watch(allEmployees, (newVal) => {
  console.log('allEmployees updated:', newVal.length, 'employees');
  if (newVal.length > 0) {
    console.log('First employee:', newVal[0]);
  }
}, { deep: true });

// Watch loading and error states
watch([employeeLoading, employeeError], ([loading, error]) => {
  console.log('Loading state:', loading, 'Error state:', error);
}, { immediate: true });

// Watch for organization changes and reload data
watch(organizationId, (newOrgId) => {
  console.log('Organization changed to:', newOrgId);
  loadEmployeeData(newOrgId);
}, { immediate: true });

// Function to load employee data based on organization
function loadEmployeeData(orgId?: string) {
  console.log('Loading employee data for organization:', orgId);

  // Update reactive filter object
  if (orgId && orgId !== '') {
    filter.organization = orgId;
  } else {
    delete filter.organization;
  }

  // Reset pagination
  pageable.page = 0;

  console.log('Search filter:', filter);
  console.log('Pageable:', pageable);
  
  // Call loadEmployees without parameters to use reactive objects
  loadEmployees();
}

// Use allEmployees directly since they're already filtered by API
const employees = computed(() => {
  console.log('Returning employees:', allEmployees.value.length);
  return allEmployees.value;
});

// Group event handlers
const onRowGroupCollapse = (event: any) => {
  console.log('Row group collapsed:', event);
};

const onRowGroupExpand = (event: any) => {
  console.log('Row group expanded:', event);
};

// Watch for employee data changes and auto-expand all groups
watch(
  () => employees.value,
  (items) => {
    if (!items || items.length === 0) {
      expandedRowGroups.value = [];
      return;
    }
    // Auto-expand all organization groups
    expandedRowGroups.value = [...new Set(items.map((item: any) => item.organizationName))];
    console.log('Auto-expanded groups:', expandedRowGroups.value);
  },
  { immediate: true }
);

function toggleTree() {
  wrapperRef.value?.toggleTree();
}

defineExpose({ toggleTree });

const year: Ref<Date | null> = ref(new Date());
const calendarRef = ref();

const toggleCalendar = () => {
  const inputEl: HTMLInputElement | null =
      calendarRef.value?.$el?.querySelector('input');
  if (inputEl) {
    inputEl.focus();
    inputEl.click();
  }
};
</script>

<style scoped>

.year-display {
  display: flex;
  align-items: center;
  border: 1px solid #ccc;
  border-radius: 6px;
  padding: 6px 12px;
  cursor: pointer;
  gap: 6px;
  color: var(--text-color);
}

.hidden-calendar-input {
  display: none;
}

:deep(.list-wrapper) {
  height: calc(100vh - 14rem);
}

:deep(.p-tree) {
  border-radius: 4px;
}

/* Ensure proper table height behavior */
:deep(.full-height-table) {
  height: 100%;
  display: flex;
  flex-direction: column;
}

:deep(.full-height-table .p-datatable-wrapper) {
  flex: 1;
  overflow: auto;
}

/* DataTable grouping styles similar to HrmContractListTableGroup */
.sticky-rowheader {
  ::v-deep(.p-datatable-scrollable-table > .p-datatable-tbody > .p-rowgroup-header) {
    top: 44px !important;
  }
}

/* Leave table specific styles */
:deep(.leave-table) {
  font-size: 13px;
}

:deep(.leave-table .p-datatable-thead > tr > th) {
  background-color: #f5f5f5;
  color: black;
  font-weight: 600;
  padding: 6px 8px;
  border: 1px solid #ccc;
  text-align: center;
}

:deep(.leave-table .p-datatable-tbody > tr > td) {
  padding: 6px 8px;
  border: 1px solid #ccc;
  font-size: 13px;
  color: black;
}

:deep(.leave-table .p-datatable-tbody > tr:hover > td) {
  background-color: #e6f7ff !important;
}

:deep(.leave-table .p-rowgroup-header) {
  background-color: #f8f9fa;
  border: 1px solid #ccc;
}

:deep(.leave-table .p-rowgroup-header > td) {
  padding: 8px 12px;
  font-weight: bold;
}
</style>
