<template>
  <div class='timesheet-datatable-container'>
    <DataTable
      v-model:selection='selectionRowValue'
      data-key='employeeId'
      filter-display='menu'
      :lazy='true'
      :loading='loadingQueue || props.loadingTimesheet'
      paginator-template='FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown'
      responsive-layout='scroll'
      row-hover
      :rows='props.pageable.size'
      scroll-height='calc(100vh - 20rem)'
      scrollable
      selection-mode='single'
      :show-current-page-report='true'
      show-gridlines
      striped-rows
      :value='dataLocal'
      @page='onPage'
      @sort='onSort'>
      <template #empty>
        <ProgressBar
          v-if='props.loadingTimesheet'
          class='border-noround'
          mode='indeterminate'
          style='height: .25rem'></ProgressBar>
        <EmptyResult v-else/>
      </template>
      <Column
        frozen
        :header='t("common.ordinalNumber")'
        style='width: 2.5rem'>
        <template #body='{index}'>
          {{ index + 1 + (props.pageable.page * props.pageable.size) }}
        </template>
      </Column>
      <Column
        field='code'
        frozen
        :header='t("hrm.profile.general.code")'
        style='min-width:7rem'></Column>
      <Column
        field='fullName'
        frozen
        :header='t("hrm.profile.general.fullName")'
        style='min-width:12rem'></Column>
      <Column
        field='jobTitle'
        :header='t("hrm.contract.general.jobTitle")'
        style='min-width:8rem'></Column>
      <Column
        field='organizationName'
        frozen
        :header='t("hrm.contract.general.organization")'
        style='min-width:12rem'></Column>
      <Column
        v-for='c in props.dateColumns'
        :key='c'
        body-class='p-1'
        class='text-center'
        :class='{
          "bg-saturday": props.isWeekendFunc(c).isSaturday,
          "bg-sunday": props.isWeekendFunc(c).isSunday
        }'
        :header='moment(c).format("dd DD")'
        style='max-width: 4.5rem'>
        <template #body='{ data }'>
          <div
            v-if='!moment(c).isAfter(moment(props.today))'
            class='align-items-center flex gap-1 justify-content-center'>
            <div
              v-for='(shift) in data["shifts"]'
              :key='(shift as Shift).code'
              v-tooltip='(shift as Shift).name'
              class='border-round cursor-pointer h-2rem hover:surface-hover px-2 py-1'
              :class="{'w-2rem bg-black-alpha-10':!getAttendance(data['employeeId'], c, (shift as Shift).code)?.symbol}"
              @click='openViewDetailAttendance(data, c, (shift as Shift).code || "")'>
              {{ shift ? getAttendance(data['employeeId'], c, (shift as Shift).code)?.symbol : ' ' }}
            </div>
          </div>
        </template>
      </Column>
      <Column
        :header='t("hrm.timeSheet.table.sumDayPoints")'
        style='min-width:12rem'>
        <template #body='{ data }'>
          {{ calculateEmployeePoints(data).sumDayPoints }}
        </template>
      </Column>
      <Column
        :header='t("hrm.timeSheet.table.sumDayOffPoints")'
        style='min-width:12rem'>
        <template #body='{ data }'>
          {{ calculateEmployeePoints(data).sumDayOffPoints }}
        </template>
      </Column>
      <Column
        :header='t("hrm.timeSheet.table.sumOvertimePoints")'
        style='min-width:12rem'>
        <template #body='{ data }'>
          {{ calculateEmployeePoints(data).sumOvertimePoints }}
        </template>
      </Column>
      <Column
        :header='t("hrm.timeSheet.table.sumPointGetPaid")'
        style='min-width:12rem'>
        <template #body='{ data }'>
          {{ calculateEmployeePoints(data).sumPointGetPaid }}
        </template>
      </Column>
      <Column
        :header='t("hrm.timeSheet.table.sumPointGetBHXH")'
        style='min-width:12rem'>
        <template #body='{ data }'>
          {{ calculateEmployeePoints(data).sumPointGetBHXH }}
        </template>
      </Column>
      <Column
        :header='t("hrm.timeSheet.table.sumPointLeaveGetBHXH")'
        style='min-width:12rem'>
        <template #body='{ data }'>
          {{ calculateEmployeePoints(data).sumPointLeaveGetBHXH }}
        </template>
      </Column>
      <Column
        :header='t("hrm.timeSheet.table.sumPointLeaveCDGetPaid")'
        style='min-width:12rem'>
        <template #body='{ data }'>
          {{ calculateEmployeePoints(data).sumPointLeaveCDGetPaid }}
        </template>
      </Column>
      <Column
        :header='t("hrm.timeSheet.table.sumPointLeaveHolidayGetPain")'
        style='min-width:12rem'>
        <template #body='{ data }'>
          {{ calculateEmployeePoints(data).sumPointLeaveHolidayGetPain }}
        </template>
      </Column>
      <Column
        :header='t("hrm.timeSheet.table.other")'
        style='min-width:12rem'>
        <template #body='{ data }'>
          {{ calculateEmployeePoints(data).other }}
        </template>
      </Column>
      <Column
        :header='t("hrm.timeSheet.table.sumOvertimePointsWithSalary")'
        style='min-width:12rem'>
        <template #body='{ data }'>
          {{ calculateEmployeePoints(data).sumOvertimePointsWithSalary }}
        </template>
      </Column>
      <Column
        :header='t("hrm.timeSheet.table.sumTotalPoints")'
        style='min-width:12rem'>
        <template #body='{ data }'>
          {{ calculateEmployeePoints(data).sumTotalPoints }}
        </template>
      </Column>
    </DataTable>
  </div>
</template>

<script setup lang="ts">
import { cloneDeep } from 'lodash';
import { storeToRefs } from 'pinia';
import Column from 'primevue/column';
import DataTable from 'primevue/datatable';
import ProgressBar from 'primevue/progressbar';
import { onMounted, reactive, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { attendanceInMonth } from '@/apps/hrm/api/graphql/attendance';
import { type Attendance, groupByEmployeeIdAndDate } from '@/apps/hrm/model/attendance';
import type { EmployeeShifts, Shift } from '@/apps/hrm/model/shift';
import type { TimeSheetDataItem } from '@/apps/hrm/model/time-sheet';
import EmptyResult from '@/common/components/empty/EmptyResult.vue';
import { DateTimeFormat } from '@/common/constants';
import useMoment from '@/common/helpers/mixins/use-moment';

interface Props {
  employeesDataList: EmployeeShifts[];
  loadingTimesheet: boolean;
  dateColumns: string[];
  today: string;
  pageable: {
    page: number;
    size: number;
  };
  size?: 'small' | 'normal' | 'large';
  filters?: any;
  selectionValue?: any;
  selectedTimesheet?: TimeSheetDataItem;
  loading?: boolean;
  isWeekendFunc: (date: string) => { isSaturday: boolean; isSunday: boolean; isWeekend: boolean; };
}

interface Emits {
  (e: 'page', event: any): void;
  (e: 'sort', event: any): void;
  (e: 'openViewDetailAttendance', data: any, date: string, shiftCode: string): void;
}
const props = withDefaults(defineProps<Props>(), {
  size: 'normal',
  filters: () => ({}),
  loading: false,
  selectionValue: () => [],
  selectedTimesheet: ()=> ({} as TimeSheetDataItem),
});
const emit = defineEmits<Emits>();
const { t } = useI18n();
const { moment } = useMoment();
const attendances = reactive<Record<string, Record<string, Attendance[]>>>({});
const selectionRowValue = ref(props.selectionValue);
const openViewDetailAttendance = (data: any, date: string, shiftCode: string) => {
  emit('openViewDetailAttendance', data, date, shiftCode);
};

const dataLocal = ref<EmployeeShifts[]>([]);
const onPage = (event: any) => {
  emit('page', event);
};

const onSort = (event: any) => {
  emit('sort', event);
};

// Function to calculate various point totals based on shift codes
const calculateSumDayPoints = (shiftCode: string) => {
  // Initialize all totals
  let sumPoint = 0;
  let restPoint = 0;
  let sumOverPoint = 0;
  let sumNopaidPoint = 0;
  let sumPointGetBhXH = 0;
  let sumPointLeaveGetBHXH = 0;
  let sumPointLeaveCDGetPaid = 0;
  let sumPointLeaveHolidayGetPain = 0;
  let other = 0;
  let sumOvertimePointsWithSalary = 0;

  // Convert shift code to uppercase for comparison
  const code = shiftCode?.toUpperCase();

  // Calculate based on the code
  if (code === 'X' || code === 'ONL') {
    sumPoint = 0.5;
  } else if (code === 'P') {
    restPoint = 1;
  } else if (code === 'P/2') {
    restPoint = 0.5;
  } else if (code === 'CT') {
    sumOverPoint = 0.5;
  } else if (code === 'H') {
    sumOverPoint = 0.5;
    other = 0.5;
  } else if (code === 'R0') {
    sumNopaidPoint = 1;
  } else if (code === 'R02') {
    sumNopaidPoint = 0.5;
  } else if (code === 'O') {
    sumPointGetBhXH = 0.5;
  } else if (code === 'NB') {
    sumPointLeaveGetBHXH = 0.5;
  } else if (code === 'CKH' || code === 'MC' || code === 'KH') {
    sumPointLeaveCDGetPaid = 0.5;
  } else if (code === 'NL') {
    sumPointLeaveHolidayGetPain = 0.5;
  } else if (code === 'TG') {
    sumOvertimePointsWithSalary = 1;
  }

  // Calculate total points (constrained for TG)
  let total = sumPoint + restPoint + sumOverPoint + sumNopaidPoint 
              + sumPointGetBhXH + sumPointLeaveGetBHXH + sumPointLeaveCDGetPaid 
              + sumPointLeaveHolidayGetPain + other;

  // Apply constraint for TG (not more than 3)
  if (sumOvertimePointsWithSalary > 3) {
    sumOvertimePointsWithSalary = 3;
  }
  total += Math.min(sumOvertimePointsWithSalary, 3);

  return {
    sumPoint,
    restPoint,
    sumOverPoint,
    sumNopaidPoint,
    sumPointGetBhXH,
    sumPointLeaveGetBHXH,
    sumPointLeaveCDGetPaid,
    sumPointLeaveHolidayGetPain,
    other,
    sumOvertimePointsWithSalary: Math.min(sumOvertimePointsWithSalary, 3),
    sumTotalPoints: total
  };
};

// Function to calculate point totals for an employee across all dates
const calculateEmployeePoints = (employee: any) => {
  const empId = employee.employeeId || employee.id;

  let totalSumPoint = 0;
  let totalRestPoint = 0;
  let totalSumOverPoint = 0;
  let totalSumNopaidPoint = 0;
  let totalSumPointGetBhXH = 0;
  let totalSumPointLeaveGetBHXH = 0;
  let totalSumPointLeaveCDGetPaid = 0;
  let totalSumPointLeaveHolidayGetPain = 0;
  let totalOther = 0;
  let totalSumOvertimePointsWithSalary = 0;

  // Loop through all date columns to calculate points for each date
  for (const date of props.dateColumns) {
    // Get all shifts for this employee on this date
    const employeeShiftsOnDate = employee.shifts || [];
    
    for (const shift of employeeShiftsOnDate) {
      // Get attendance for this employee on this date and shift
      // Using employeeId from the employee object and the current date and shift code
      const attendance = getAttendance(empId, date, (shift as Shift).code);
      
      // If there is attendance data with a symbol/code, calculate points
      if (attendance && attendance.symbol) {
        const shiftCode = attendance.symbol.toUpperCase();
        const points = calculateSumDayPoints(shiftCode);

        totalSumPoint += points.sumPoint;
        totalRestPoint += points.restPoint;
        totalSumOverPoint += points.sumOverPoint;
        totalSumNopaidPoint += points.sumNopaidPoint;
        totalSumPointGetBhXH += points.sumPointGetBhXH;
        totalSumPointLeaveGetBHXH += points.sumPointLeaveGetBHXH;
        totalSumPointLeaveCDGetPaid += points.sumPointLeaveCDGetPaid;
        totalSumPointLeaveHolidayGetPain += points.sumPointLeaveHolidayGetPain;
        totalOther += points.other;
        totalSumOvertimePointsWithSalary += points.sumOvertimePointsWithSalary;
      }
    }
  }

  // Apply constraint for overtime points: TG not more than 3 total
  const finalOvertimePoints = Math.min(totalSumOvertimePointsWithSalary, 3);

  // Calculate final total
  const sumTotalPoints = totalSumPoint + totalRestPoint + totalSumOverPoint 
                        + totalSumNopaidPoint + totalSumPointGetBhXH 
                        + totalSumPointLeaveGetBHXH + totalSumPointLeaveCDGetPaid 
                        + totalSumPointLeaveHolidayGetPain + totalOther 
                        + finalOvertimePoints;

  const result = {
    sumDayPoints: totalSumPoint,
    sumDayOffPoints: totalRestPoint,
    sumOvertimePoints: totalSumOverPoint,
    sumPointGetPaid: totalSumNopaidPoint,
    sumPointGetBHXH: totalSumPointGetBhXH,
    sumPointLeaveGetBHXH: totalSumPointLeaveGetBHXH,
    sumPointLeaveCDGetPaid: totalSumPointLeaveCDGetPaid,
    sumPointLeaveHolidayGetPain: totalSumPointLeaveHolidayGetPain,
    other: totalOther,
    sumOvertimePointsWithSalary: totalSumOvertimePointsWithSalary,
    sumTotalPoints: sumTotalPoints
  };

  // Add the calculated values to the employee object
  employee.sumDayPoints = totalSumPoint;
  employee.sumDayOffPoints = totalRestPoint;
  employee.sumOvertimePoints = totalSumOverPoint;
  employee.sumPointGetPaid = totalSumNopaidPoint;
  employee.sumPointGetBHXH = totalSumPointGetBhXH;
  employee.sumPointLeaveGetBHXH = totalSumPointLeaveGetBHXH;
  employee.sumPointLeaveCDGetPaid = totalSumPointLeaveCDGetPaid;
  employee.sumPointLeaveHolidayGetPain = totalSumPointLeaveHolidayGetPain;
  employee.other = totalOther;
  employee.sumOvertimePointsWithSalary = totalSumOvertimePointsWithSalary;
  employee.sumTotalPoints = sumTotalPoints;

  return result;
};

const calculateTotalPointsData = () => {

  if (dataLocal.value && dataLocal.value.length > 0) {
    // Create new array to trigger Vue reactivity
    const updatedData = dataLocal.value.map(employee => {
      const points = calculateEmployeePoints(employee);
      return {
        ...employee,
        sumDayPoints: points.sumDayPoints,
        sumDayOffPoints: points.sumDayOffPoints,
        sumOvertimePoints: points.sumOvertimePoints,
        sumPointGetPaid: points.sumPointGetPaid,
        sumPointGetBHXH: points.sumPointGetBHXH,
        sumPointLeaveGetBHXH: points.sumPointLeaveGetBHXH,
        sumPointLeaveCDGetPaid: points.sumPointLeaveCDGetPaid,
        sumPointLeaveHolidayGetPain: points.sumPointLeaveHolidayGetPain,
        other: points.other,
        sumOvertimePointsWithSalary: points.sumOvertimePointsWithSalary,
        sumTotalPoints: points.sumTotalPoints
      };
    });
    
    dataLocal.value = updatedData;
  }
};

// Watch for changes in employeesDataList and calculate points for each employee
watch(() => props.employeesDataList, (newDataList) => {
  if (newDataList) {
    dataLocal.value = cloneDeep(newDataList);
  }
});

function getAttendance(employeeId: string, date: string, shiftCode: string | undefined): Attendance | undefined {
  if (!employeeId || !date || !shiftCode) {
    return undefined;
  }
  return attendances[employeeId]?.[date]?.find((a) => a.shiftCode === shiftCode);
}
const loadingQueue = ref(false);
const employeeIdsQueue: string[] = [];
let isProcessing = false;
let queueResolvers: Array<() => void> = [];

function addToQueue(employeeId: string): Promise<void> {
  return new Promise((resolve) => {
    loadingQueue.value = true;
    queueResolvers.push(resolve);
    
    if (!employeeIdsQueue.includes(employeeId)) {
      employeeIdsQueue.push(employeeId);
      if (!isProcessing) {
        processQueue();
      }
    }
  });
}

function processQueue(): void {
  if (employeeIdsQueue.length > 0) {
    isProcessing = true;
    const employeeId = employeeIdsQueue.shift();
    if (employeeId) {
      const query = attendanceInMonth(employeeId, moment(props.today).format(DateTimeFormat.ISO_LOCAL_DATE));
      
      query.onResult(res => {
        if (res.data?.attendanceInMonth) {
          const attendancesInMonth = res.data.attendanceInMonth as Attendance[] || [];
          const grouped = groupByEmployeeIdAndDate(attendancesInMonth);
          for (const empId in grouped) {
            if (!attendances[empId]) {
              attendances[empId] = {};
            }

            for (const date in grouped[empId]) {
              if (!attendances[empId][date]) {
                attendances[empId][date] = [];
              }

              attendances[empId][date] = grouped[empId][date];
            }
          }
        }
        
        // Resolve the promise for this employee
        const resolver = queueResolvers.shift();
        if (resolver) {
          resolver();
        }
        
        // Continue processing queue
        setTimeout(processQueue, 100);
      });
      
      query.onError(error => {

        // Still resolve to avoid blocking
        const resolver = queueResolvers.shift();
        if (resolver) {
          resolver();
        }
        
        setTimeout(processQueue, 100);
      });
    }
  } else {
    isProcessing = false;
    loadingQueue.value = false;
  }
}

// watch(() => props.employeesDataList, (newVal) => {
//   if (newVal && newVal.length > 0) {
//     newVal.forEach(emp => {
//       if(emp.employeeId) {
//         addToQueue(emp.employeeId);
//       }
//     });
//   }
// }, {
//   immediate: true,
//   deep: true
// });

onMounted(() => {
  dataLocal.value = cloneDeep(props.employeesDataList);
});
defineExpose({
  addToQueue,
  calculateTotalPointsData 
});
</script>

<style scoped>
.timesheet-datatable-container {
  flex: 1;
  overflow: auto;
}
:deep(.excel-input .p-inputtext) {
  border: none;
  box-shadow: none;
  outline: none;
  border-radius: 0;
  padding: 0;
  text-align: center;
  font-size: 14px;
  width: 100%;
  height: 100%;
}

:deep(.p-cell-editing) {
  border: 2px solid #217346;
  background-color: var(--surface-overlay);
  padding: 0;
}

:deep(.bg-saturday) {
  background-color: var(--bg-saturday);
}
:deep(.bg-sunday) {
  background-color: var(--bg-sunday);
}
</style>