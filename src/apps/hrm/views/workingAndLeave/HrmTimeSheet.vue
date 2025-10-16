<template>
  <div class='flex flex-column gap-2 h-full w-full'>
    <Toolbar
      class='mb-2 p-0'
      style='min-height: 3rem'>
      <template #start>
        <div class='align-items-center flex gap-2 pl-2'>
          <ButtonIcon
            v-tooltip='"Ẩn/Hiện"'
            class='align-self-center p-1'
            icon='menu'
            rounded
            text
            @click='toggleTree'/>

          <p class='mb-0'>{{ t('hrm.timeSheet.title') }}</p>
          <HrmTimeSheetHelper/>

        </div>
      </template>
      <template #end>
        <div class='btn-group-toolbar flex gap-1 mr-1'>
          <Button
            class='btn-create focus:shadow-none font-medium'
            icon='pi pi-plus'
            :label='t("common.create")'
            @click='handleCreateNew'></Button>
          <Button
            class='focus:shadow-none font-normal hidden hover:surface-200'
            icon='pi pi-calculator'
            label='Tính công'
            severity='secondary'
            @click='handleCalculationData'></Button>
          <Button
            class='focus:shadow-none font-normal hover:surface-200'
            icon='pi pi-save'
            label='Lưu'
            severity='secondary'></Button>
          <Button
            v-if='selectedTimeSheet.status === TimeSheetStatus.DRAFT'
            class='focus:shadow-none font-normal hover:surface-200'
            icon='pi pi-send'
            label='Chuyển tổng hợp'
            severity='secondary'
            @click='visibleSendDialog = true'></Button>
          <template v-if='selectedTimeSheet.status === TimeSheetStatus.PENDING'>
            <Button
              class='focus:shadow-none font-normal hover:surface-200'
              icon='pi pi-check-square'
              label='Chốt công'
              severity='secondary'></Button>
            <Button
              class='focus:shadow-none font-normal hover:surface-200'
              icon='pi pi-arrow-circle-left'
              label='Trả lại'
              severity='secondary'></Button>
          </template>

          <Button
            class='focus:shadow-none font-normal hover:surface-200'
            icon='pi pi-file-import'
            label='Import'
            severity='secondary'></Button>
          
        </div>
      </template>
    </Toolbar>
    <div
      class='list-wrapper-content'
      :class='{ "hide-tree": isHidden }'>
      <div
        class='overflow-hidden transition-all'>
        <TabView
          class='h-full surface-0'
          @tab-change='onTabChange'>
          <TabPanel :header='t("hrm.timeSheet.tabView.draft")'>
            <TimeSheetTree
              ref='treeRef'
              class='h-full'
              style='background-color: var(--surface-e)'
              :time-sheet-data='timeSheetData'
              @refetch='refetchTimeSheetData'
              @select-status='() => {}'
              @select-time-sheet='onSelectTimeSheet'/>
          </TabPanel>
          <TabPanel :header='t("hrm.timeSheet.tabView.waitingForApproval")'>
            <TimeSheetTree
              ref='treeRef2'
              class='h-full'
              style='background-color: var(--surface-e)'
              :time-sheet-data='timeSheetData'
              @refetch='refetchTimeSheetData'
              @select-status='() => {}'
              @select-time-sheet='onSelectTimeSheet'/>
          </TabPanel>
        </TabView>
      </div>
      <div
        class='flex-grow-1 relative w-full'
        style='overflow: hidden;'>
        <div>
          <div
            v-if='combinedLoading'
            class='absolute align-items-center bg-black-alpha-30 flex h-full justify-content-center w-full z-5'
            style='top: 0; left: 0;'>
            <ProgressSpinner/>
          </div>
          <div
            v-if='!selectedTimeSheet'
            class='border-1 border-round p-4 surface-border surface-card'>
            <Skeleton
              height='60px'
              width='100%'/>
          </div>

          <div
            v-else
            class='flex justify-content-between p-3 surface-0'>
            <div class='align-items-center flex justify-content-between'>
              <div>
                <div class='font-bold text-xl'>{{ selectedTimeSheet?.name }}</div>
                <div class='mt-1 text-500 text-sm'> {{ t('common.month') }} {{ selectedTimeSheet?.month }}
                  {{ t('common.year') }} {{ selectedTimeSheet?.year }}
                </div>
                <div>
                  <span>{{findOrganization(selectedTimeSheet?.organizationId)?.name}}</span>
                </div>
              </div>
            </div>
            <div class='flex gap-1'>
              <div
                v-if='selectedTimeSheet?.status === TimeSheetStatus.DRAFT'
                class='flex gap-1'>
                <div
                  v-tooltip.bottom="'Chỉnh sửa'"
                  class='action-button align-items-center cursor-pointer flex hover:border-400 justify-content-center'
                  @click='handleEdit(selectedTimeSheet)'>
                  <i class='pi pi-pencil'></i>
                </div>
                <div
                  v-tooltip.bottom="'Xóa'"
                  class='action-button align-items-center cursor-pointer flex hover:border-400 justify-content-center'
                  @click='confirmDeleteMedia(selectedTimeSheet)'>
                  <i class='delete-btn pi pi-trash'></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div
          class='flex flex-column h-full mt-2 surface-0 w-full'
          style='overflow: hidden;'>

          <TimesheetDataTable
            ref='tableRef'
            :date-columns='dateColumns'
            :employees-data-list='employeesDataList'
            :is-weekend-func='detectWeekend'
            :loading='combinedLoading'
            :loading-timesheet='combinedLoading'
            :pageable='pageable'
            :selected-timesheet='selectedTimeSheet'
            :today='today.toISOString()'
            @open-view-detail-attendance='openViewDetailAttendance'/>

        </div>
      </div>
    </div>

    <TimeSheetCreate
      v-model:visible='visibleSidebarForm'
      :all-organization='orgsTree'
      :department='userDepartment'
      :editing-template='selectedTimeSheet'
      :user='user'
      @refetch='refetchTimeSheetData'
      @update:visible='(val: boolean) => { visibleSidebarForm = val }'/>

    <HrmAttendanceDetail
      v-model:visible='viewDetailVisible'
      :date='viewDetailAttendance?.date'
      :employee='viewDetailAttendance'
      :shift-code='viewDetailAttendance?.shiftCode'/>

    <DialogSendFlow
      v-model:visible='visibleSendDialog'
      :time-sheet-id='selectedTimeSheet?.id' />
  </div>
</template>

<script lang='ts' setup>

import { storeToRefs } from 'pinia';
import TabPanel from 'primevue/tabpanel';
import TabView from 'primevue/tabview';
import type { TreeNode } from 'primevue/treenode';
import { useConfirm } from 'primevue/useconfirm';
import { computed, onMounted, provide, reactive, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { getAllOrganizationPublicGraphql } from '@/apps/admin/api/graphql/organization-graphql-api';
import { useUserMoreInfoStore } from '@/apps/admin/store/usersMoreInfo';
import { employeeShifts } from '@/apps/hrm/api/graphql/shift';
import { deleteTimesheet, getAllTimesheetByYear, getTimesheet } from '@/apps/hrm/api/graphql/timesheet';
import { convertToOrganizationTreeNodes } from '@/apps/hrm/helpers/utils';
import { type Attendance } from '@/apps/hrm/model/attendance';
import { type EmployeeFilter } from '@/apps/hrm/model/employee';
import type { EmployeeShifts } from '@/apps/hrm/model/shift';
import { type TimeSheetDataItem, TimeSheetStatus } from '@/apps/hrm/model/time-sheet';
import DialogSendFlow from '@/apps/hrm/views/workingAndLeave/components/DialogSendFlow.vue';
import TimeSheetCreate from '@/apps/hrm/views/workingAndLeave/components/TimeSheetCreate.vue';
import TimesheetDataTable from '@/apps/hrm/views/workingAndLeave/components/TimesheetDataTable.vue';
import TimeSheetTree from '@/apps/hrm/views/workingAndLeave/components/TimeSheetTree.vue';
import HrmAttendanceDetail from '@/apps/hrm/views/workingAndLeave/HrmAttendanceDetail.vue';
import HrmTimeSheetHelper from '@/apps/hrm/views/workingAndLeave/HrmTimeSheetHelper.vue';
import { DateTimeFormat } from '@/common/constants';
import { toastError, toastSuccess } from '@/common/helpers/custom-toast-service';
import useMoment from '@/common/helpers/mixins/use-moment';
import type { Connection } from '@/common/model/page';
import type { Pageable } from '@/common/model/query';
import { useUserStore } from '@/common/store/user';

const isHidden = ref(false);
const { t } = useI18n();
const { moment } = useMoment();
const today = new Date();
const selectedDate = ref<Date>(today);
const visibleSidebarForm = ref(false);
const selectedTimeSheet = ref<TimeSheetDataItem>({} as TimeSheetDataItem);
const timeSheetData = ref<TimeSheetDataItem[]>([]);
const userAllInfor = useUserMoreInfoStore();
const activeTabStatusFilter = ref<string | null>('DRAFT'); // To keep track of the active tab filter
const userData = useUserStore();
const { user } = storeToRefs(userData);
const userDepartment = computed(() => userAllInfor.allUsers.find(u => u.id === user.value.id)?.departments || '');
const treeRef = ref();
const treeRef2 = ref();
const visibleSendDialog = ref(false);
const pageable = reactive<Pageable>({
  page: 0,
  size: 10000,
});
const filter = reactive<EmployeeFilter>({});

const employeesDataList = ref<any[]>([]);
const attendances = reactive<Record<string, Record<string, Attendance[]>>>({});
const viewDetailVisible = ref(false);
const viewDetailAttendance = reactive<EmployeeShifts & { date?: string, shiftCode?: string }>({});
const { onResult: onTimeSheetResult, onError: onTimeSheetError, refetch: onTimeSheetRefetch, loading: loadingTimeshet } = getAllTimesheetByYear(Number(moment().format('YYYY')));
const { result, } = employeeShifts(filter, pageable);
const employees = computed(() => (result.value?.employeeShifts as Connection<EmployeeShifts>)?.edges.map((edge) => edge.node) || []);
const tableRef = ref();
const loadingGetTimesheet = ref(false);
const combinedLoading = computed(() => loadingTimeshet.value || loadingGetTimesheet.value);
onTimeSheetResult((result) => {
  if (result.data && result.data.getAllTimesheetByYear) {
    // Update both the working data and the original data
    const fetchedData = result.data.getAllTimesheetByYear || [] as TimeSheetDataItem[];
    originalTimeSheetData.value = [...fetchedData]; // Store original data
    
    // Apply any current filter if there's an active tab selection
    if (activeTabStatusFilter.value) {
      timeSheetData.value = fetchedData.filter((timesheet: TimeSheetDataItem) => {
        return timesheet.status?.toUpperCase() === activeTabStatusFilter.value?.toUpperCase();
      });
    } else {
      timeSheetData.value = [...fetchedData]; // Show all if no filter
    }
  }
});

onTimeSheetError((error) => {
  toastError({ message: 'Lỗi khi tải dữ liệu bảng công!' });
});

// Function to refetch payslip data
function refetchTimeSheetData() {
  visibleSidebarForm.value = false;
  onTimeSheetRefetch();
}
const dateColumns = computed(() => {
  const startDate = moment(selectedDate.value).startOf('month');
  const endDate = moment(selectedDate.value).endOf('month');
  return Array.from(
    { length: endDate.diff(startDate, 'days') + 1 },
    (_, i) => moment(startDate).add(i, 'days').format(DateTimeFormat.ISO_LOCAL_DATE)
  );
});

function reFetchEmployee(employeeId: string) {
  tableRef.value.addToQueue(employeeId);
}

provide('reFetchEmployee', reFetchEmployee);

function openViewDetailAttendance(employee: EmployeeShifts, date: string, shiftCode: string | undefined) {
  if (!employee || !date || !shiftCode) {
    return;
  }
  viewDetailVisible.value = true;
  Object.assign(viewDetailAttendance, {
    ...employee,
    date,
    shiftCode,
  });
}

function detectWeekend(date: string) {
  const day = moment(date).day();
  return {
    isWeekend: day === 0 || day === 6,
    isSaturday: day === 6,
    isSunday: day === 0
  };
}
function toggleTree() {
  isHidden.value = !isHidden.value;
}

const handleCreateNew = () => {
  selectedTimeSheet.value = {} as TimeSheetDataItem;
  visibleSidebarForm.value = true;
};

const handleCalculationData = async () => {
  if (!tableRef.value || !employeesDataList.value.length) {
    return;
  }

  try {

    // Call addToQueue for all employees and wait for completion
    // Use employeeId instead of id
    const promises = employeesDataList.value
      .filter(emp => emp.employeeId || emp.id)
      .map(emp => {
        const empId = emp.employeeId || emp.id;
        return tableRef.value.addToQueue(empId);
      });
    
    await Promise.all(promises);

    // After all attendance data is loaded, recalculate points
    tableRef.value.calculateTotalPointsData();
  } catch (error) {
  }
};

const onSelectTimeSheet = async (item: TimeSheetDataItem) => {
  const id = item.id;
  if(!id) {
    return;
  }
  try {
    loadingGetTimesheet.value = true;
    // Call the getTimesheet API with the provided ID
    const { onResult, onError, loading } = getTimesheet(id);

    onResult((result) => {
      loadingGetTimesheet.value = false;
      if (result.data && result.data.getTimesheet) {
        selectedTimeSheet.value = result.data.getTimesheet;
        filter.organization = selectedTimeSheet.value.organizationId;
      } else {
        toastError({
          title: t('common.error'),
          message: t('hrm.timeSheet.fetchError.errorGetTimeSheet'),
        });
      }
    });

    onError((error) => {
      loadingGetTimesheet.value = false;
      toastError({
        title: t('common.error'),
        message: t('hrm.timeSheet.fetchError.errorGetTimeSheet'),
      });
    });
  } catch (error) {
    loadingGetTimesheet.value = false;
    toastError({
      title: t('common.error'),
      message: t('hrm.timeSheet.fetchError.errorGetTimeSheet'),
    });
  }
};

// Original timesheet data to preserve the full list when filtering
const originalTimeSheetData = ref<TimeSheetDataItem[]>([]);
const statusFilter = ref<string>(TimeSheetStatus.DRAFT);
// Function to handle tab change event and filter timesheet data by status
const onTabChange = (event: any) => {
  employeesDataList.value = [];

  if (event.index === 0) {
    statusFilter.value = 'DRAFT';
  } else if (event.index === 1) {
    statusFilter.value = 'PENDING';
  } else {
    // For other tabs, you can add more conditions
    statusFilter.value = '';
  }
  
  // Store the active filter
  activeTabStatusFilter.value = statusFilter.value;
  
  if (statusFilter.value && originalTimeSheetData.value.length > 0) {
    timeSheetData.value = originalTimeSheetData.value.filter((timesheet: TimeSheetDataItem) => {
      return timesheet.status?.toUpperCase() === statusFilter.value?.toUpperCase();
    });
  } else if (originalTimeSheetData.value.length > 0) {
    timeSheetData.value = [...originalTimeSheetData.value];
  }
  if(event.index === 0) {
    treeRef.value.selectTimeSheet(timeSheetData.value[0]);

  } else if(event.index === 1) {
    treeRef2.value.selectTimeSheet(timeSheetData.value[0]);
  }
  return true;
};

const { onResult: getAllOrganizationResult, } = getAllOrganizationPublicGraphql();
const orgsList = ref<any[]>([]);
const orgsTree = ref<TreeNode[]>([]);
const confirm = useConfirm();
onMounted(async () => {
  getAllOrganizationResult((response) => {
    orgsList.value = response.data?.allOrganizationPublic || [];
    orgsTree.value = convertToOrganizationTreeNodes(response.data?.allOrganizationPublic || []);
  });
});

const findOrganization = (id: string) => {
  return orgsList.value.find(org => org.id === id);
};

const confirmDeleteMedia = (item: TimeSheetDataItem | null) => {
  confirm.require({
    message: t('common.confirmDelete', { itemName: item?.name }),
    header: t('common.delete'),
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: t('common.delete'),
    acceptClass: 'p-button-danger',
    rejectLabel: t('common.cancel'),
    accept: () => {
      handleDeleteReport(item?.id);
    },
  });
};
const {
  mutate: deleteMutate,
  onDone: deleteOnDone
} = deleteTimesheet();
const handleDeleteReport = (id?: string) => {
  if(id){
    deleteMutate({ id: id });
  }
};

deleteOnDone(() => {
  toastSuccess({ message: t('Xóa thành công') });
  refetchTimeSheetData();
  treeRef.value.selectTimeSheet(timeSheetData.value[0]);
});

watch(
  () => employees.value,
  (newVal) => {
    employeesDataList.value = newVal
      .filter(emp => selectedTimeSheet.value.employeeIds.includes(emp.employeeId || ''))
      .map(emp => ({
        ...emp,
        shifts: emp.shifts || [],
      }));
    handleCalculationData();
  },
  {
    immediate: true,
    deep: true,
  }
);

const handleEdit = (timesheet: TimeSheetDataItem) => {
  if (timesheet.id) {
    selectedTimeSheet.value = { ...timesheet };
    visibleSidebarForm.value = true;
  } else {
    toastError({ message: 'Không tìm thấy bảng công để chỉnh sửa.' });
  }
};
</script>

<style lang="scss" scoped>
.tool-bar {
  background-color: var(--surface-overlay);
  min-height: 3rem;
}
:deep(.p-calendar .p-inputtext) {
  padding: 0.5rem;
  max-height: 36px;
  margin-top: auto;
  margin-bottom: auto;
}
:deep(.custom-select) {
  max-height: 36px;
  margin-top: auto;
  margin-bottom: auto;
}
:deep(.p-treeselect-label) {
  padding: 0.5rem;
  max-height: 36px;
}
:deep(.p-accordion-header-link) {
  padding: 7px;
}
:deep(.p-paginator-element) {
  max-height: 30px;
  width: 30px;
  min-width: 30px;
  border-radius: 8px;
}
:deep(.p-paginator .p-dropdown .p-dropdown-label) {
  max-height: 36px;
  padding: 0.5rem;
}
:deep(.p-paginator .p-dropdown .p-dropdown-trigger) {
  width: 32px;
  height: 32px;
}
:deep(.p-paginator .p-dropdown) {
  height: 32px;
  padding: 0;
}
:deep(.p-paginator.p-component) {
  padding: 0;
}
:deep(.p-paginator-current) {
  max-height: 36px;
  padding: 0.5rem;
}
.list-wrapper-content {
  display: grid;
  grid-template-columns: 30rem 1fr;
  gap: 0.5rem;
  flex: 1; /* Chiếm phần còn lại của container */
  min-height: 0; /* Cho phép scroll nội bộ */
  transition: all 0.3s ease;
  height: 100%;
  &.hide-tree {
    grid-template-columns: 0 1fr;
    gap: 0;
  }
}
:deep(.p-tabview-panels) {
  padding: 0.25rem !important;
}
.action-button {
  width: 32px;
  height: 32px;
  background: transparent;
  border: 1px solid transparent;
  transition: all 0.2s ease;
  border-radius: 4px;
  font-size: 16px;
  color: var(--text-color-secondary);
}
.action-button:hover {
  background: var(--surface-100);
  border-radius: 4px;
}
.delete-btn {
  color: #ef4444;
}

:deep(.p-datatable ){
  flex: 1;
}

:deep(.p-datatable-wrapper) {
  height: calc(-20rem + 100vh);
}
</style>