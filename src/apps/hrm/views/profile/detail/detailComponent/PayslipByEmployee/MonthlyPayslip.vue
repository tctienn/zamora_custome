<template>
  <div class='p-3 space-y-4'>
    <!-- Chọn năm -->
    <div class='flex gap-2'>
      <Calendar
        v-model='selectedYear'
        date-format='yy'
        icon-display='input'
        input-class='custom-input'
        :max-date='today.toDate()'
        :min-date='minDate'
        show-icon
        view='year'/>
      <div class='flex flex-wrap gap-2'>
        <Button
          v-for='month in months'
          :key='month.value'
          class='border-round-sm month-btn shadow-none'
          :class="{
            'p-button-outlined border-300 text-color': !isSelectedMonth(month.value),
            'p-button-primary current-time': isSelectedMonth(month.value),
            'pass-day border-300 text-color': isPastMonth(month.value) && !isSelectedMonth(month.value),
            'disabledDay' : !isCurrentMonth(month.value) && !isPastMonth(month.value) && !isSelectedMonth(month.value),
            'today': isCurrentMonth(month.value) && !isPastMonth(month.value) && !isSelectedMonth(month.value)
          }"
          :disabled='isFutureMonth(month.value)'
          :label='month.label'
          @click='selectedMonth = month.value'/>
      </div>
    </div>

    <!-- Hiển thị danh sách bảng lương cho tháng/năm được chọn -->
    <div class='mt-2 payslip-list'>
      <div
        v-if='filteredPayslips.length > 0'
        class='payslip-items'>
        <div 
          v-for='payslip in filteredPayslips' 
          :key='payslip.id'
          class='border-round mb-2 p-3 payslip-item surface-border'>
          <div class='align-items-center flex justify-content-between'>
            <div>
              <div class='font-bold'>{{ payslip.payslipName }}</div>
              <div class='text-500 text-sm'>Mã: {{ payslip.payslipCode }}</div>
              <div class='text-500 text-sm'>Tên: {{ getNameByPayslipCode(payslip.payslipCode) }}</div>
            </div>
            <div class='text-right'>
              <div class='font-bold'>{{ formatCurrency(payslip.totalAmount) }}</div>
              <div class='text-500 text-sm'>{{ payslip.month }}/{{ payslip.year }}</div>
            </div>
          </div>
          
          <!-- DataTable for payslip details -->
          <div class='mt-3'>
            <DataTable
              class='mt-2'
              :pt="{
                table: { style: 'min-width: 50rem' }
              }"
              show-gridlines
              :value='payslip.payslipDetails'>
              <Column
                header='STT'>
                <template #body='{data}'>
                  <div
                    class='align-items-center flex justify-content-center'
                    :class='data.isGroup && "font-bold"'>
                    {{ data.code }}
                  </div>
                </template>
              </Column>
              <Column
                :header='t("meeting.meeting.content")'>
                <template #body='{data}'>
                  <div
                    class='align-items-center flex'
                    :class='data.isGroup && "font-bold"'>
                    {{ data.name }}
                  </div>
                </template>
              </Column>
              <Column
                :header='t("hrm.salary.valueMoney")'
                style='width: 20rem'>
                <template #body='{ data }'>
                  <div
                    class='text-right'>
                    {{ formatCurrency(data.value) }}
                  </div>
                </template>
              </Column>
            </DataTable>
          </div>
        </div>
      </div>

      <div
        v-else
        class='no-payslips p-4 text-center'>
        <p>Không có phiếu lương nào cho tháng {{selectedMonth}}
          năm {{ selectedYearNumber }}</p>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import Column from 'primevue/column';
import DataTable from 'primevue/datatable';
import { computed, inject, type Ref, ref, watch, watchEffect } from 'vue';
import { useI18n } from 'vue-i18n';

import { getPayslipByMonthYear } from '@/apps/hrm/api/graphql/salary';
import type { DefaultPayslipInfos, employeePayslipValueItem } from '@/apps/hrm/model/salary';
import useMoment from '@/common/helpers/mixins/use-moment';

const props = defineProps({
  employeeId: {
    type: String,
    required: true
  },
});

const { moment } = useMoment();
const { t } = useI18n();
const today = moment(); // moment object
const minDate = today.clone().subtract(10, 'years').toDate(); // Allow selection from 10 years ago
const selectedYear = ref(today.clone().startOf('year').toDate()); // PrimeVue needs Date object
const selectedMonth = ref(today.month() + 1); // 1-12 (current month as default, 1-indexed)
const payslips = ref<any[]>([]); // Store the payslip data
const selectedYearNumber = computed(() => selectedYear.value.getFullYear());

// Inject default payslip infos from parent component
const defaultPayslipInfos = inject<Ref<any[]>>('defaultPayslipInfos', ref([]));

// Initialize without parameters, we'll call refetch when needed
const { result, refetch } = getPayslipByMonthYear(props.employeeId, selectedMonth.value, 
  selectedYear.value ? selectedYear.value.getFullYear() : new Date().getFullYear());

watchEffect(() => {
  if (result.value?.getPayslipByMonthYear) {
    // Process the payslip data to include details
    const payslip = result.value.getPayslipByMonthYear;
    
    if (payslip) {
      let totalAmount = 0;
      let payslipDetails = [];

      if (payslip.employeePayslipValue && Array.isArray(payslip.employeePayslipValue)) {
        // Create payslip details from employeePayslipValue
        payslipDetails = payslip.employeePayslipValue.map((item: employeePayslipValueItem) => {
          // Find corresponding info from default payslip infos
          const payslipInfo = defaultPayslipInfos.value.find((info: DefaultPayslipInfos) => info.id === item.id) || {} as DefaultPayslipInfos;
          return {
            id: item.id,
            code: payslipInfo?.code || '',
            name: payslipInfo?.name || '',
            value: item.value || 0,
            isGroup: payslipInfo?.isGroup || false
          };
        });
        
        // Calculate total amount
        totalAmount = payslip.employeePayslipValue.reduce((sum: any, item: employeePayslipValueItem) => sum + (item.value || 0), 0);
      }

      const processedPayslip = {
        ...payslip,
        totalAmount,
        payslipDetails
      };

      payslips.value = [processedPayslip];
    } else {
      payslips.value = [];
    }
  } else {
    // Handle case where no data is returned
    payslips.value = [];
  }
});

// Watch for changes in selected month/year and refetch data
watch([selectedMonth, selectedYear], () => {
  if (props.employeeId && selectedYear.value) {
    refetch({
      employeeId: props.employeeId,
      month: selectedMonth.value, // selectedMonth is already 1-indexed
      year: selectedYear.value ? selectedYear.value.getFullYear() : new Date().getFullYear()
    });
  }
});

const months = Array.from({ length: 12 }, (_, i) => ({
  label: `Tháng ${String(i + 1).padStart(2, '0')}`, // "01", "02", ..., "12"
  value: i + 1, // 1-based month (1-12)
}));

function isSelectedMonth(monthIndex: number) {
  return selectedMonth.value === monthIndex;
}

function isFutureMonth(month: number) {
  // Check if selectedYear.value is a valid Date object
  if (!selectedYear.value ) {
    const currentMonth = today.month() + 1; // Convert to 1-indexed
    return month > currentMonth;
  }
  
  const selectedYearVal = selectedYear.value ? selectedYear.value.getFullYear() : new Date().getFullYear();
  const currentYear = today.year();
  const currentMonth = today.month() + 1; // Convert to 1-indexed

  if (selectedYearVal > currentYear) {
    return true;
  }
  if (selectedYearVal < currentYear) {
    return false;
  }

  return month > currentMonth;
}

const isPastMonth = (monthIndex: number) => {
  // Check if selectedYear.value is a valid Date object
  if (!selectedYear.value) {
    const currentMonth = today.month() + 1; // Convert to 1-indexed
    return monthIndex < currentMonth;
  }
  
  const selectedYearMoment = moment(selectedYear.value);
  const currentYear = today.year();
  const currentMonth = today.month() + 1; // Convert to 1-indexed

  return (
    selectedYearMoment.year() < currentYear
      || selectedYearMoment.year() === currentYear && monthIndex < currentMonth
  );
};

const isCurrentMonth = (monthIndex: number) => {
  // Check if selectedYear.value is a valid Date object
  if (!selectedYear.value ) {
    return false;
  }
  
  const selectedYearMoment = moment(selectedYear.value);
  return (
    selectedYearMoment.year() === today.year()
      && monthIndex === today.month() + 1 // Convert to 1-indexed
  );
};

// Since we now fetch payslips for a specific month/year, just return the payslips array
const filteredPayslips = computed(() => {
  return payslips.value || [];
});

// Function to get name from defaultPayslipInfos based on payslipCode
const getNameByPayslipCode = (payslipCode: string) => {
  if (!defaultPayslipInfos.value || !Array.isArray(defaultPayslipInfos.value)) {
    return payslipCode; // Return the code if no matching name is found
  }
  
  const matchedItem = defaultPayslipInfos.value.find((item: DefaultPayslipInfos) => item.payslipCode === payslipCode) as any;
  return matchedItem ? matchedItem.name : payslipCode;
};

// Format currency function
const formatCurrency = (value: number | string) => {
  if (!value) {
    return '0';
  }
  
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  return new Intl.NumberFormat('vi-VN', {
    style: 'decimal',
    maximumFractionDigits: 2
  }).format(numValue);
};
</script>

<style scoped>
:deep(.p-inputtext.p-component) {
  max-width: 100px;
}

:deep(.custom-input) {
  height: 35px;
}

:deep(.p-icon.p-datepicker-trigger-icon) {
  top: 1.25rem;
}

.p-button.p-0 {
  height: 2.5rem;
}

:deep(.p-button) {
  background: var(--badge);
  border-color: var(--badge);
}

.pass-day {
  background: #CCE8FF;
}

.today {
  background: #6FBF73;
  color: var(--surface-0) !important;
}

.disabledDay {
  background-color: #f5f5f5;
  opacity: 0.4;
}

.month-btn {
  height: 2.5rem;
  padding: 5px;
}

</style>