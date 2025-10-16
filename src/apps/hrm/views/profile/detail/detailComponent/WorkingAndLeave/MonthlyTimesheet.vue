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
      <div class='align-content-center flex flex-wrap font-semibold gap-1 ml-auto'>
        <i
          class='cursor-pointer pi pi-question-circle text-xl'
          @click='op?.toggle($event)'></i>
        <OverlayPanel ref='op'>
          <div class='flex flex-column gap-2'>
            <div class='font-semibold text-center text-xl w-full'>
              {{ t('hrm.attendance.detail.symbol') }}
            </div>
            <div
              v-for='symbol in symbolsData'
              :key='symbol.code'
              class='flex gap-2'>
              <div class='font-semibold w-3rem'>
                {{ symbol.code }}
              </div>
              {{ symbol.name }}

            </div>
          </div>
        </OverlayPanel>
      </div>
    </div>

    <div class='flex gap-4 justify-content-between'>
      <div class='gap-2 grid-days mt-3 w-full'>
        <div
          v-for='(day, index) in daysLabel'
          :key='index'
          class='text-center'>
          <div
            class='border-1 border-300 border-round-sm font-semibold h-full p-2 text-black-sub'
            :class='{
              "bg-cyan-100" : day.value !== 0 && day.value !== 6,
              "bg-red-100" : day.value === 0 || day.value === 6,
            }'>
            {{ day.label }}
          </div>

        </div>
        <div
          v-for='(day, index) in daysInCalendar'
          :key='index'
          class='text-center'>
          <div
            v-if='day'
            class='border-1 border-300 border-round-sm cursor-pointer flex h-full justify-content-between p-2'
            :class='dayClass(day)'
            @click='handlePickDay(day)'>
            <div>
              <span class='font-medium'>{{ day.label }}</span>
              <div class='mt-1 text-gray-600 text-xs'>{{ day.weekday }}</div>
            </div>
            <div v-if='!isWeekend(day)'>{{ code }}</div>
            <div class='font-bold'> {{
              attendancesInMonth.filter(item => item.date === day.dateStr).map(item => item.symbol).join(' ')
            }}
            </div>
          </div>
          <div
            v-else
            class='h-full'>&nbsp;
          </div>
        </div>
      </div>
      <InfoDayWorkAndLeave
        :date='selectedDate'
        :employee='employee'/>
    </div>
  </div>
</template>

<script lang='ts' setup>
import type OverlayPanel from 'primevue/overlaypanel';
import { computed, type PropType, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { attendanceInMonth } from '@/apps/hrm/api/graphql/attendance';
import { type Attendance } from '@/apps/hrm/model/attendance';
import type { HrmCategory } from '@/apps/hrm/model/category';
import InfoDayWorkAndLeave
  from '@/apps/hrm/views/profile/detail/detailComponent/WorkingAndLeave/InfoDayWorkAndLeave.vue';
import { DateTimeFormat } from '@/common/constants';
import useMoment from '@/common/helpers/mixins/use-moment';

const props = defineProps({
  employee: {
    type: String,
    default: '',
  },
  joinDate: {
    type: [String, Date], // ✅ Cho phép cả string lẫn Date
    default: null,
  },
  symbolsData: {
    type: Array as PropType<HrmCategory[]>,
    default: () => []
  }
});

const { moment } = useMoment();
const { t } = useI18n();
const op = ref<OverlayPanel>();
const today = moment(); // moment object
const selectedYear = ref(today.clone().startOf('year').toDate()); // PrimeVue cần Date object
const selectedMonth = ref(today.month()); // 0-11
const selectedDate = ref(today.format('YYYY-MM-DD')); // ISO string for comparison
const code = ref<any>('');
const attendancesInMonth = ref<Attendance[]>([]);

attendanceInMonth(props.employee, moment(today).format(DateTimeFormat.ISO_LOCAL_DATE))
  .onResult(res => {
    if (res.data?.attendanceInMonth) {
      attendancesInMonth.value = res.data.attendanceInMonth as Attendance[] || [];
    }
  });

const minDate = computed(() =>
  props.joinDate ? new Date(moment(props.joinDate).toDate()) : undefined
);

const months = Array.from({ length: 12 }, (_, i) => ({
  label: `Tháng ${moment().month(i).format('MM')}`, // "Jan", "Feb", ...
  value: i,
}));

const daysLabel = Array.from({ length: 7 }, (_, i) => ({
  label: i === 0 ? 'CN' : `Thứ ${i + 1}`,
  value: i,
}));

const daysInMonth = computed(() => {
  const year = moment(selectedYear.value).year();
  return moment({
    year,
    month: selectedMonth.value
  }).daysInMonth();
});

const daysInCalendar = computed(() => {
  const year = moment(selectedYear.value).year();
  const month = selectedMonth.value;

  const firstDay = moment({
    year,
    month,
    day: 1
  });
  const weekdayOfFirst = firstDay.day(); // 0 = Sunday, 6 = Saturday

  const days = Array.from({ length: daysInMonth.value }, (_, i) => {
    const date = moment({
      year,
      month,
      day: i + 1
    });
    return {
      label: String(i + 1),
      dateStr: date.format('YYYY-MM-DD'),
      weekday: date.format('ddd'),
      disabled: date.isAfter(today, 'day'),
    };
  });

  // Add empty slots before the first day (for alignment)
  const emptyDays = Array.from({ length: weekdayOfFirst }, () => null);

  return [...emptyDays, ...days];
});

function isSelectedMonth(monthIndex: number) {
  return selectedMonth.value === monthIndex;
}

function isFutureMonth(month: number) {
  const selectedYearVal = selectedYear.value.getFullYear();
  const currentYear = today.year();
  const currentMonth = today.month();

  if (selectedYearVal > currentYear) {
    return true;
  }
  if (selectedYearVal < currentYear) {
    return false;
  }

  return month > currentMonth;
}

const isWeekend = (day: any) => {
  return ['T7', 'CN'].includes(day.weekday);
};

function dayClass(day: any) {
  const todayStr = moment(today).format('YYYY-MM-DD');

  if (day.dateStr === todayStr) {
    return 'today'; // Hôm nay
  }

  if (day.disabled && !isWeekend(day)) {
    return 'disabledDay'; // Tương lai
  }

  if (isWeekend(day) || isWeekend(day) && day.disabled) {
    return 'weekend'; // Cuối tuần
  }

  return 'pass-day'; // Ngày đã qua (ngày trong quá khứ)
}

const handlePickDay = (day: any) => {
  if (day.disabled || isWeekend(day)) {
    selectedDate.value = '';
    return;
  }

  selectedDate.value = day.dateStr;
};

const isPastMonth = (monthIndex: number) => {
  const selectedYearMoment = moment(selectedYear.value);
  const currentYear = today.year();
  const currentMonth = today.month();

  return (
    selectedYearMoment.year() < currentYear
    || selectedYearMoment.year() === currentYear && monthIndex < currentMonth
  );
};

const isCurrentMonth = (monthIndex: number) => {
  const selectedYearMoment = moment(selectedYear.value);
  return (
    selectedYearMoment.year() === today.year()
    && monthIndex === today.month()
  );
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

.grid-days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
}

.pass-day {
  background: #EDFFF2
}

.today {
  background: #E5F3FF;
}

.weekend {
  background: #FFF5F5;
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