<template>
  <div>
    <!-- Tab Menu with Calendar Icon -->
    <div class='date-filter-header w-max'>

      <!-- Show Modal Filter Display when active -->
      <div
        v-if='isModalFilterActive'
        class='align-items-center flex flex-1 gap-2 modal-filter-display'>
        <span class='filter-label'>{{ modalFilterDisplay }}</span>
        <Button
          v-tooltip='"Xóa bộ lọc"'
          class='clear-filter-btn'
          icon='pi pi-times'
          size='small'
          text
          @click='clearModalFilter'>
        </Button>
      </div>

      <!-- Show Tab Menu when modal filter is not active -->
      <TabMenu
        v-else
        v-model:active-index='activeTab'
        class='ml-2'
        :model='docFilterHeaders'>
        <template #item='{item, label, active, index}'>
          <a
            v-if='!active || !item.items'
            v-ripple
            class='p-ripple px-3 py-2'
            :class='{ "bg-active": active }'
            @click='changeTab(index, item.code)'>{{ label }}</a>
          <Dropdown
            v-else
            v-model='filterCode'
            v-ripple
            class='align-items-center flex h-full p-ripple'
            option-disabled='disabled'
            option-label='label'
            option-value='code'
            :options='item.items'
            :pt='{"root":{"class":"btn-grad border-noround "},"input":{"class":"px-3 text-color font-bold"},"trigger":{"style":{"display":"none"}}}'
            scroll-height='188px'>
          </Dropdown>
        </template>
      </TabMenu>
      <Button
        aria-label='Open time selection'
        class='calendar-icon-btn ml-1'
        icon='pi pi-calendar'
        text
        @click='showTimeSelectionModal = true'>
      </Button>
    </div>

    <!-- Time Selection Modal -->
    <Dialog
      v-model:visible='showTimeSelectionModal'
      class='time-selection-modal'
      header='Chọn thời gian'
      :modal='true'
      :style="{ width: '400px' }">
      <div class='time-selection-content'>
        <!-- Year Selection -->
        <div class='time-field'>
          <label>Năm:</label>
          <Dropdown
            v-model='selectedYear'
            class='w-full'
            option-label='label'
            option-value='value'
            :options='yearOptions'
            @change='onYearChange'>
          </Dropdown>
        </div>

        <!-- Month Selection -->
        <div class='time-field'>
          <label>Tháng:</label>
          <Dropdown
            v-model='selectedMonth'
            class='w-full'
            option-disabled='disabled'
            option-label='label'
            option-value='value'
            :options='monthOptions'
            @change='onMonthChange'>
          </Dropdown>
        </div>

        <!-- Week Selection -->
        <div class='time-field'>
          <label>Tuần:</label>
          <Dropdown
            v-model='selectedWeek'
            class='w-full'
            option-label='label'
            option-value='value'
            :options='weekOptions'
            @change='onWeekChange'>
          </Dropdown>
        </div>

      </div>

      <template #footer>
        <Button
          class='p-button-text'
          label='Đóng'
          @click='showTimeSelectionModal = false'>
        </Button>
        <Button
          class='p-button-primary'
          label='Áp dụng'
          @click='applyTimeSelection'>
        </Button>
      </template>
    </Dialog>
  </div>
</template>

<script lang='ts' setup>
import type { Moment } from 'moment/moment';
import type { MenuItem } from 'primevue/menuitem';
import { computed, inject, ref, watch } from 'vue';
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';

import type { SearchModel } from '@/apps/document/model/doc/search';
import { DateTimeFormat } from '@/common/constants';
import useMoment from '@/common/helpers/mixins/use-moment';

// Extended MenuItem type for our custom filter headers
type FilterMenuItem = MenuItem & {
  code: string;
  items?: FilterMenuItem[];
};

const emit = defineEmits(['toggle-advanced-filter']);

const { t } = useI18n();
const { moment } = useMoment();

// Tab menu and filter state
const activeTab = ref(0); // Start with year tab active
const filterCode = ref('YEAR');
const showTimeSelectionModal = ref(false);
const isModalFilterActive = ref(false);
const modalFilterDisplay = ref('');

// Reactive selections for modal
const selectedYear = ref(new Date().getFullYear());
const selectedMonth = ref(new Date().getMonth() + 1); // moment months are 0-indexed, but display as 1-indexed
const selectedWeek = ref<string | number>('current');
const selectedDay = ref('today');

// Tab menu configuration
const docFilterHeaders = computed((): FilterMenuItem[] => [
  {
    label: t('document.filter.thisYear'),
    code: 'YEAR'
  },
  {
    label: t('document.filter.thisMonth'),
    code: 'MONTH'
  },
  {
    label: t('document.filter.thisWeek'),
    code: 'WEEK'
  },
  {
    label: t('document.filter.today'),
    code: `D-${moment().format('YYYY-MM-DD')}`,
    items: [
      {
        label: t('document.filter.today'),
        code: `D-${moment().format('YYYY-MM-DD')}`,
        command() {
          const today = moment();
          updateDateFilter(today.startOf('day'), today.clone().endOf('day'));
        },
      },
      {
        label: t('document.filter.yesterday'),
        code: `D-${moment().subtract(1, 'day').format('YYYY-MM-DD')}`,
        command() {
          const yesterday = moment().subtract(1, 'day');
          updateDateFilter(yesterday.startOf('day'), yesterday.clone().endOf('day'));
        },
      },
      {
        label: t('document.filter.dayBeforeYesterday'),
        code: `D-${moment().subtract(2, 'day').format('YYYY-MM-DD')}`,
        command() {
          const dayBefore = moment().subtract(2, 'day');
          updateDateFilter(dayBefore.startOf('day'), dayBefore.clone().endOf('day'));
        },
      }
    ]
  }
]);

// Dropdown options for modal
const yearOptions = computed(() => {
  const options = [];
  const currentYear = new Date().getFullYear();
  for (let i = 0; i < 5; i++) {
    const year = currentYear - i;
    options.push({
      label: `Năm ${year}`,
      value: year
    });
  }
  return options;
});

const monthOptions = computed(() => {
  const months = [
    'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
    'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
  ];

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1; // JavaScript months are 0-indexed

  return months.map((month, index) => {
    const monthValue = index + 1;
    const isFutureMonth = selectedYear.value === currentYear && monthValue > currentMonth;

    return {
      label: month,
      value: monthValue,
      disabled: isFutureMonth
    };
  });
});

const weekOptions = computed(() => [
  {
    label: 'Tuần này',
    value: 'current'
  },
  {
    label: 'Tuần trước',
    value: 'last'
  },
  {
    label: 'Tuần 1',
    value: 1
  },
  {
    label: 'Tuần 2',
    value: 2
  },
  {
    label: 'Tuần 3',
    value: 3
  },
  {
    label: 'Tuần 4',
    value: 4
  },
]);

const updateSearchField = inject('updateSearchField', (_field: keyof SearchModel, _value: string) => {
});

// Tab change handler
function changeTab(index: number, code: string) {
  activeTab.value = index;
  filterCode.value = code;

  const today = moment();
  let fromDate: Moment, toDate: Moment;

  switch (code) {
  case 'YEAR':
    selectedYear.value = today.year();
    fromDate = today.clone().startOf('year');
    toDate = today.clone().endOf('year');
    break;
  case 'MONTH':
    selectedYear.value = today.year();
    selectedMonth.value = today.month() + 1;
    fromDate = today.clone().startOf('month');
    toDate = today.clone().endOf('month');
    break;
  case 'WEEK':
    selectedWeek.value = 'current';
    fromDate = today.clone().startOf('week');
    toDate = today.clone().endOf('week');
    break;
  case 'DAY':
    selectedDay.value = 'today';
    fromDate = today.clone().startOf('day');
    toDate = today.clone().endOf('day');
    break;
  default:
    return;
  }

  updateDateFilter(fromDate, toDate);
}

// Watch for dropdown changes in tab menu
watch(filterCode, (newCode) => {
  if (newCode && newCode.startsWith('D-')) {
    // It's a day selection with format D-YYYY-MM-DD
    const dateStr = newCode.substring(2); // Remove 'D-' prefix
    const selectedDate = moment(dateStr, 'YYYY-MM-DD');
    
    if (selectedDate.isValid()) {
      const startDate = selectedDate.clone().startOf('day');
      const endDate = selectedDate.clone().endOf('day');
      
      // Update selectedDay based on the date
      const today = moment();
      const yesterday = moment().subtract(1, 'day');
      const dayBefore = moment().subtract(2, 'day');
      
      if (selectedDate.isSame(today, 'day')) {
        selectedDay.value = 'today';
      } else if (selectedDate.isSame(yesterday, 'day')) {
        selectedDay.value = 'yesterday';
      } else if (selectedDate.isSame(dayBefore, 'day')) {
        selectedDay.value = 'dayBefore';
      } else {
        selectedDay.value = 'custom';
      }
      
      updateDateFilter(startDate, endDate);
    }
  } else if (newCode && newCode.includes('-') && !newCode.startsWith('D-')) {
    // It's a YYYY-MM format from month dropdown
    const [year, month] = newCode.split('-');
    // Sync modal values with selected month
    selectedYear.value = parseInt(year);
    selectedMonth.value = parseInt(month);

    const fromDate = moment(`${year}-${month}-01`).startOf('month');
    const toDate = moment(`${year}-${month}-01`).endOf('month');
    updateDateFilter(fromDate, toDate);
  }
});

// Event handlers for modal dropdown changes
function onYearChange() {
  // When year changes, check if selected month is valid for the new year
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  // If selected year is current year and selected month is in future, reset to current month
  if (selectedYear.value === currentYear && selectedMonth.value > currentMonth) {
    selectedMonth.value = currentMonth;
  } else if (selectedYear.value > currentYear) {
    // If selected year is future year (shouldn't happen with current yearOptions, but just in case)
    selectedMonth.value = 1; // Reset to January
  }
}

function onMonthChange() {
  // Just update the selection, don't apply until "Apply" is clicked
  // Validation will be done in monthOptions computed property
}

function onWeekChange() {
  // Just update the selection, don't apply until "Apply" is clicked
}

// Apply time selection from modal
function applyTimeSelection() {
  let startDate: Moment | undefined, endDate: Moment | undefined;

  // Check if filterCode contains YYYY-MM format or is a basic code
  if (filterCode.value && filterCode.value.includes('-')) {
    // It's a YYYY-MM format - apply based on modal selections
    startDate = moment().year(selectedYear.value).month(selectedMonth.value - 1).startOf('month');
    endDate = moment().year(selectedYear.value).month(selectedMonth.value - 1).endOf('month');
    // Update filterCode to match the new selection
    filterCode.value = `${selectedYear.value}-${selectedMonth.value.toString().padStart(2, '0')}`;
  } else {
    // Determine which selection to apply based on the filter code
    switch (filterCode.value) {
    case 'YEAR':
      startDate = moment().year(selectedYear.value).startOf('year');
      endDate = moment().year(selectedYear.value).endOf('year');
      break;
    case 'MONTH':
      startDate = moment().year(selectedYear.value).month(selectedMonth.value - 1).startOf('month');
      endDate = moment().year(selectedYear.value).month(selectedMonth.value - 1).endOf('month');
      // Update filterCode to YYYY-MM format for month dropdown
      filterCode.value = `${selectedYear.value}-${selectedMonth.value.toString().padStart(2, '0')}`;
      break;
    case 'WEEK':
      if (selectedWeek.value === 'current') {
        startDate = moment().startOf('week');
        endDate = moment().endOf('week');
      } else if (selectedWeek.value === 'last') {
        startDate = moment().subtract(1, 'week').startOf('week');
        endDate = moment().subtract(1, 'week').endOf('week');
      } else if (typeof selectedWeek.value === 'number') {
        const weekNum = selectedWeek.value;
        startDate = moment().week(weekNum).startOf('week');
        endDate = moment().week(weekNum).endOf('week');
      } else {
        // Fallback to current week if value is unexpected
        startDate = moment().startOf('week');
        endDate = moment().endOf('week');
      }
      break;
    case 'DAY':
      if (selectedDay.value === 'today') {
        startDate = moment().startOf('day');
        endDate = moment().endOf('day');
      } else if (selectedDay.value === 'yesterday') {
        startDate = moment().subtract(1, 'day').startOf('day');
        endDate = moment().subtract(1, 'day').endOf('day');
      } else if (selectedDay.value === 'dayBefore') {
        startDate = moment().subtract(2, 'day').startOf('day');
        endDate = moment().subtract(2, 'day').endOf('day');
      } else {
        // Default to today if selectedDay.value doesn't match expected values
        startDate = moment().startOf('day');
        endDate = moment().endOf('day');
      }
      break;
    default:
      // Default to current month
      startDate = moment().startOf('month');
      endDate = moment().endOf('month');
    }
  }

  if (startDate && endDate) {
    updateDateFilter(startDate, endDate);

    // Activate modal filter display
    isModalFilterActive.value = true;

    // Create display text based on selection
    let displayText = '';
    switch (filterCode.value) {
    case 'YEAR':
      displayText = `Năm ${selectedYear.value}`;
      break;
    case 'MONTH':
      displayText = `Tháng ${selectedMonth.value}/${selectedYear.value}`;
      break;
    case 'WEEK':
      if (selectedWeek.value === 'current') {
        displayText = 'Tuần này';
      } else if (selectedWeek.value === 'last') {
        displayText = 'Tuần trước';
      } else {
        displayText = `Tuần ${selectedWeek.value}`;
      }
      break;
    case 'DAY':
      if (selectedDay.value === 'today') {
        displayText = 'Hôm nay';
      } else if (selectedDay.value === 'yesterday') {
        displayText = 'Hôm qua';
      } else if (selectedDay.value === 'dayBefore') {
        displayText = 'Hôm kia';
      }
      break;
    default:
      if (filterCode.value && filterCode.value.includes('-')) {
        displayText = `Tháng ${selectedMonth.value}/${selectedYear.value}`;
      } else {
        displayText = 'Bộ lọc tùy chỉnh';
      }
    }

    modalFilterDisplay.value = displayText;
  }
  showTimeSelectionModal.value = false;
}

function updateDateFilter(fromDate: Moment, toDate: Moment) {
  updateSearchField('searchTimeFrom', fromDate.format(DateTimeFormat.ISO_LOCAL_DATE_TIME));
  updateSearchField('searchTimeTo', toDate.format(DateTimeFormat.ISO_LOCAL_DATE_TIME));
}

// Clear modal filter and return to tab menu
function clearModalFilter() {
  isModalFilterActive.value = false;
  modalFilterDisplay.value = '';

  // Reset to default filter (current year)
  activeTab.value = 0; // Year tab
  filterCode.value = 'YEAR';

  const today = moment();
  selectedYear.value = today.year();
  selectedMonth.value = today.month() + 1;

  const fromDate = today.clone().startOf('year');
  const toDate = today.clone().endOf('year');

  updateDateFilter(fromDate, toDate);
}

// Auto-apply default year filter when component mounts
onMounted(() => {
  // Apply default year filter automatically
  changeTab(0, 'YEAR');
});
</script>

<style scoped>
/* Main header layout */
.date-filter-header {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 5px 0;
  border-radius: 6px;
}

/* Calendar icon button */
.calendar-icon-btn {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  color: var(--primary-color);
  border: 1px solid transparent;
  &:hover {
    border-color: var(--primary-100);
    background: var(--primary-50);
  }
}

.calendar-icon-btn:hover {
  background: var(--primary-100);
  color: var(--primary-color);
}

/* Modal filter display */
.modal-filter-display {
  background: var(--primary-50);
  border: 1px solid var(--primary-100);
  border-radius: 6px;
  padding: 8px 12px;
  min-height: 36px;
}

.filter-label {
  font-weight: 500;
  color: var(--primary-700);
  font-size: 14px;
}

.clear-filter-btn {
  color: var(--primary-600);
  width: 24px;
  height: 24px;
  padding: 0;
  border-radius: 50%;
}

.clear-filter-btn:hover {
  background: var(--primary-100);
  color: var(--primary-700);
}

/* Tab menu styling */
:deep(.p-tabmenu) {
  background: transparent;
  border: none;
}

:deep(.p-tabmenu .p-tabmenu-nav) {
  background: transparent;
  border: none;
  display: flex;
  gap: 4px;
}

:deep(.p-tabmenu .p-tabmenuitem) {
  border: 1px solid var(--surface-border);
  border-radius: 4px;
  margin: 0;
}

:deep(.p-tabmenu .p-tabmenuitem.p-highlight) {
  background: var(--primary-color);
  color: white;
  .p-inputwrapper.p-inputwrapper-filled {
    background: var(--bg-active-menu-item);
    &:hover {
      border-color: var(--bg-active-menu-item);
    }
  }
}

:deep(.p-tabmenu .p-tabmenuitem .p-menuitem-link) {
  padding: 8px 12px;
  border-radius: 4px;
  font-weight: 500;
  font-size: 14px;
}

:deep(.p-tabmenu .p-tabmenuitem.p-highlight .p-menuitem-link) {
  color: white;
}

/* Modal styling */
.time-selection-modal {
  border-radius: 8px;
  overflow: hidden;
}

.time-selection-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px 0;
}

.time-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.time-field label {
  font-weight: 600;
  font-size: 14px;
  color: var(--text-color);
}

/* Modal dropdown styling */
:deep(.time-selection-modal .p-dropdown) {
  width: 100%;
  border: 1px solid var(--surface-border);
  border-radius: 4px;
}

:deep(.time-selection-modal .p-dropdown:not(.p-disabled):hover) {
  border-color: var(--primary-color);
}

:deep(.time-selection-modal .p-dropdown:not(.p-disabled).p-focus) {
  outline: 0 none;
  outline-offset: 0;
  box-shadow: 0 0 0 2px var(--primary-50);
  border-color: var(--primary-color);
}

/* Modal footer */
:deep(.time-selection-modal .p-dialog-footer) {
  padding: 16px 20px;
  border-top: 1px solid var(--surface-border);
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* Button styling */
:deep(.time-selection-modal .p-button) {
  padding: 8px 16px;
  border-radius: 4px;
  font-weight: 500;
}

:deep(.time-selection-modal .p-button.p-button-text) {
  color: var(--text-color-secondary);
}

:deep(.time-selection-modal .p-button.p-button-text:hover) {
  background: var(--surface-hover);
  color: var(--text-color);
}

:deep(.time-selection-modal .p-button.p-button-primary) {
  background: var(--primary-color);
  border-color: var(--primary-color);
  color: white;
}

:deep(.time-selection-modal .p-button.p-button-primary:hover) {
  background: var(--primary-600);
  border-color: var(--primary-600);
}

:deep(.bg-active) {
  background: var(--bg-active-menu-item);
  color: var(--text-color);
  border-color: var(--bg-active-menu-item);
  font-weight: 700;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .date-filter-header {
    padding: 6px;
    gap: 6px;
  }

  .calendar-icon-btn {
    width: 32px;
    height: 32px;
  }

  :deep(.p-tabmenu .p-tabmenuitem .p-menuitem-link) {
    padding: 6px 10px;
    font-size: 13px;
  }

  .time-selection-modal {
    margin: 16px;
  }

  :deep(.time-selection-modal .p-dialog) {
    width: 95vw !important;
    max-width: 400px;
  }
}

@media (max-width: 480px) {
  .date-filter-header {
    padding: 4px;
    gap: 4px;
  }

  .calendar-icon-btn {
    width: 28px;
    height: 28px;
  }

  :deep(.p-tabmenu .p-tabmenuitem .p-menuitem-link) {
    padding: 4px 8px;
    font-size: 12px;
  }

  .time-field label {
    font-size: 13px;
  }

  .time-selection-content {
    gap: 12px;
    padding: 12px 0;
  }
}

/* Dark theme support */
@media (prefers-color-scheme: dark) {
  .date-filter-header {
    background: var(--surface-card);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
  }

  .calendar-icon-btn {
    background: var(--surface-ground);
    border-color: var(--surface-border);
    color: var(--text-color);
  }

  .calendar-icon-btn:hover {
    background: var(--surface-hover);
  }
  
  :deep(.p-tabmenu .p-tabmenuitem) {
    background: var(--surface-ground);
    border-color: var(--surface-border);
  }
  
  :deep(.p-tabmenu .p-tabmenuitem.p-highlight) {
    background: var(--primary-color);
    color: white;
  }
}
</style>
