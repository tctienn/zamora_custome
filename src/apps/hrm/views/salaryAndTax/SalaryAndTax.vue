<template>
  <div
    class='flex flex-column h-full w-full'
    style='overflow: hidden;'>
    <div
      class='flex-grow-1 relative surface-0 w-full'
      style='overflow: hidden;'>
      <!-- Loading overlay -->
      <div
        v-if='loadingDetailedPayslip || loadingCalculatePayslip'
        class='absolute align-items-center bg-black-alpha-30 flex h-full justify-content-center w-full z-5'
        style='top: 0; left: 0;'>
        <ProgressSpinner/>
        <span
          v-if='loadingCalculatePayslip'
          class='ml-2 text-white'></span>
      </div>
      <div class='border-bottom-1 p-3 surface-border'>
        <div class='align-items-center flex justify-content-between'>
          <div>
            <div class='font-bold text-xl'>{{ detailedSalaryInfo?.name || 'Chưa chọn bảng lương' }}</div>
            <div class='mt-1 text-500 text-sm'> {{ t('common.month') }} {{ detailedSalaryInfo?.month || currentMonth + 1 }}
              {{ t('common.year') }} {{ detailedSalaryInfo?.year || new Date().getFullYear() }}
            </div>
          </div>
          <div class='action-buttons-bar flex gap-1'>
            <div
              v-tooltip.bottom="'Chỉnh sửa'"
              class='action-button align-items-center cursor-pointer flex hover:border-400 justify-content-center'
              @click='openEditSalaryDialog'>
              <i class='pi pi-pencil'></i>
            </div>
            <div
              v-tooltip.bottom="'Xóa'"
              class='action-button align-items-center cursor-pointer flex hover:border-400 justify-content-center text-red'
              @click='handleDeletePayslip'>
              <i class='pi pi-trash'></i>
            </div>
            <div
              v-tooltip.bottom="'Cập nhật trạng thái'"
              class='action-button align-items-center cursor-pointer flex hover:border-400 justify-content-center'
              @click='handleUpdateStatus'>
              <i class='pi pi-refresh'></i>
            </div>
            <div
              v-tooltip.bottom="'Lưu dữ liệu'"
              class='action-button align-items-center cursor-pointer flex hover:border-400 justify-content-center'
              @click='handleUpdateData'>
              <i class='pi pi-save'></i>
            </div>
            <div
              v-tooltip.bottom="'Xuất PDF'"
              class='action-button align-items-center cursor-pointer flex hover:border-400 justify-content-center'>
              <i class='pi pi-file-pdf'></i>
            </div>
            <div
              v-tooltip.bottom="'In'"
              class='action-button align-items-center cursor-pointer flex hover:border-400 justify-content-center'>
              <i class='pi pi-print'></i>
            </div>
            <div
              v-tooltip.bottom="'Cập nhật dữ liệu'"
              class='action-button align-items-center cursor-pointer flex hover:border-400 justify-content-center'
              @click="emit('refetchData')">
              <i class='pi pi-sync'></i>
            </div>
          </div>
        </div>
      </div>
      <!-- Template-based tabs for different salary types -->
      <TabView
        v-model:activeIndex='activeTabIndex'
        class='w-full'
        style='height: calc(100vh - 200px); max-height: unset; overflow: hidden;'>
        <TabPanel
          class=''
          :header="t('hrm.salary.salary.templateTypes.salaryCalculation')"
          style='height: 100%; max-height: unset; overflow: hidden;'>
          <SalaryTableCommon
            :columns='salaryCalculationColumns'
            :data='displaySalaryCalculationData'
            type='calculation'
            @cell-edit-complete='onCellEditComplete'
            @row-click='onRowClick'
            @update-cells='updateCells'>

          </SalaryTableCommon>

        </TabPanel>

        <TabPanel
          :header="t('hrm.salary.salary.templateTypes.salaryPayment')"
          style='height: 100%; overflow: hidden;'>
          <SalaryTableCommon
            :columns='salaryCalculationColumns'
            :data='displaySalaryPaymentData'
            type='payment'
            @cell-edit-complete='onCellEditComplete'
            @row-click='onRowClick'
            @update-cells='updateCells'>

          </SalaryTableCommon>

        </TabPanel>

        <TabPanel
          :header="t('hrm.salary.salary.templateTypes.monthlySalary')"
          style='height: 100%; overflow: hidden;'>
          <SalaryPaySlipTab/>
        </TabPanel>
      </TabView>
    </div>
  </div>

  <!-- Create/Edit Salary Sidebar -->
  <CreatePayslipSidebar
    v-model:visible='visibleSidebarForm'
    :is-editing='true'
    :payslip-data='detailedSalaryInfo'
    @cancel='handleCancelSalary'
    @save='handleSaveSalary'/>

  <!-- Salary Information Sidebar -->
  <Sidebar
    v-model:visible='salaryInfoSidebarVisible'
    :dismissable='false'
    position='right'
    style='width: 500px'>
    <template #header>
      <h3>Thông tin chi tiết bảng lương</h3>
    </template>
    <SalarySidebar/>
  </Sidebar>

  <!-- Status Update Modal -->
  <Dialog
    v-model:visible='visibleStatusModal'
    :closable='false'
    :header='t("hrm.salary.salary.updateStatus")'
    :modal='true'
    style='width: 400px'>
    <div class='flex flex-column gap-3'>
      <p class='m-0'>{{ t('hrm.salary.salary.selectNewStatus') }}:</p>
      <div
        v-for='option in statusOptions'
        :key='option.value'
        class='align-items-center flex'>
        <RadioButton
          :id='option.value'
          v-model='selectedNewStatus'
          name='status'
          :value='option.value'/>
        <label
          class='ml-2'
          :for='option.value'
          style='cursor: pointer'>
          {{ option.label }}
        </label>
      </div>
    </div>

    <template #footer>
      <div class='flex gap-2 justify-content-end'>
        <Button
          :label='t("common.cancel")'
          severity='secondary'
          @click='visibleStatusModal = false'/>
        <Button
          :label='t("common.confirm")'
          @click='confirmUpdateStatus'/>
      </div>
    </template>
  </Dialog>
</template>

<script setup lang='ts'>

import { useConfirm } from 'primevue/useconfirm';
import { computed, nextTick, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

// Import the API functions
import {
  calculatePayslip,
  createPayslip,
  deletePayslip,
  findPayslipById,
  getAllSalaryTemplates,
  saveRecordValues,
  updateStatus
} from '@/apps/hrm/api/graphql/salary';
import type {
  DetailedSalaryInfoType,
  EmployeePayslipColumn,
  EmployeePayslipRow,
  EmployeesPayslip, PayslipDataType, TemplateColumn
} from '@/apps/hrm/model/salary';
import SalaryPaySlipTab from '@/apps/hrm/views/salaryAndTax/components/SalaryPaySlipTab.vue';
// Import toast services
import { toastError, toastSuccess } from '@/common/helpers/custom-toast-service';
import useMoment from '@/common/helpers/mixins/use-moment';

// Import the new components
import CreatePayslipSidebar from './components/CreatePayslipSidebar.vue';
import SalarySidebar from './components/SalarySidebar.vue';
import SalaryTableCommon from './components/SalaryTableCommon.vue';

const props = defineProps({
  payslipId: {
    type: String,
    required: false,
    default: ''
  }
});
const emit = defineEmits(['refetchData']);
const { moment } = useMoment();
const { t } = useI18n();
const confirm = useConfirm();

const currentMonth = new Date().getMonth();
const visibleSidebarForm = ref(false);
const salaryInfoSidebarVisible = ref(false);
const visibleStatusModal = ref(false);
const selectedNewStatus = ref('');
const activeTabIndex = ref(0); // Index of the currently active tab (0 = salary calculation, 1 = salary payment, 2 = monthly salary)
const {
  mutate: savePayslipMutate,
  onDone: savePayslipMutateDone,
  onError: savePayslipMutateError
} = createPayslip();
const {
  mutate: deletePayslipMutate,
  onDone: deletePayslipMutateDone,
  onError: deletePayslipMutateError
} = deletePayslip();
const {
  mutate: updateStatusMutate,
  onDone: updateStatusMutateDone,
  onError: updateStatusMutateError
} = updateStatus();

const {
  mutate: saveDataMutate,
  onDone: saveDataMutateDone,
  onError: saveDataMutateError
} = saveRecordValues();

const {
  mutate: calculatePayslipMutate,
  onDone: calculatePayslipMutateDone,
  onError: calculatePayslipMutateError
} = calculatePayslip();

const statusOptions = computed(() => [
  {
    label: t('hrm.salary.salaryAndTax.statusOptions.DRAFT'),
    value: 'DRAFT'
  },
  {
    label: t('hrm.salary.salaryAndTax.statusOptions.PENDING_REVIEW'),
    value: 'PENDING_REVIEW'
  },
  {
    label: t('hrm.salary.salaryAndTax.statusOptions.REVIEWED'),
    value: 'REVIEWED'
  },
  {
    label: t('hrm.salary.salaryAndTax.statusOptions.PENDING_APPROVAL'),
    value: 'PENDING_APPROVAL'
  },
  {
    label: t('hrm.salary.salaryAndTax.statusOptions.APPROVED'),
    value: 'APPROVED'
  },
  {
    label: t('hrm.salary.salaryAndTax.statusOptions.REJECTED'),
    value: 'REJECTED'
  }
]);

// Variable to hold the detailed salary information
const detailedSalaryInfo = ref<DetailedSalaryInfoType>({} as DetailedSalaryInfoType);

// State for templates and columns by type
const salaryCalculationColumns = ref<EmployeePayslipColumn[]>([]);
const salaryCalculationSubColumns = ref<EmployeePayslipColumn[]>([]);
const salaryPaymentColumns = ref<EmployeePayslipColumn[]>([]);
const salaryPaymentSubColumns = ref<EmployeePayslipColumn[]>([]);
const monthlySalaryColumns = ref<EmployeePayslipColumn[]>([]);
// State for salary data by type
const salaryCalculationData = ref<PayslipDataType[]>([]);
const salaryPaymentData = ref<PayslipDataType[]>([]);
const monthlySalaryData = ref<PayslipDataType[]>([]);
const cells = ref<any[]>([]);
// State for all templates
const allTemplates = ref<any[]>([]);

const loadingDetailedPayslip = ref(false);
const loadingCalculatePayslip = ref(false);
const currentLoadedPayslipId = ref<string | null>(null);
const isFetchingPayslip = ref(false);

// Function to fetch detailed payslip information by ID
function fetchDetailedPayslip(payslipId: string, force = false) {
  if (!payslipId) {
    return;
  }

  // Skip if already loaded this payslip (unless forced)
  if (!force && currentLoadedPayslipId.value === payslipId && detailedSalaryInfo.value?.id === payslipId) {
    return;
  }

  // Skip if already fetching to prevent multiple simultaneous requests
  if (isFetchingPayslip.value) {
    return;
  }

  loadingDetailedPayslip.value = true;
  isFetchingPayslip.value = true;

  const {
    onResult: onDetailedPayslipResult,
    onError: onDetailedPayslipError
  } = findPayslipById(payslipId);

  onDetailedPayslipResult((result) => {
    // Only process if still fetching (avoid race conditions)
    if (!isFetchingPayslip.value) {
      return;
    }
    
    if (result.data && result.data.findPayslipById) {
      detailedSalaryInfo.value = result.data.findPayslipById;
      currentLoadedPayslipId.value = payslipId;
      loadTemplatesByType(detailedSalaryInfo.value);
    } else {
      detailedSalaryInfo.value = {} as DetailedSalaryInfoType;
      currentLoadedPayslipId.value = null;
      // Clear column data if no salary info is found
      salaryCalculationColumns.value = [];
      salaryPaymentColumns.value = [];
      monthlySalaryColumns.value = [];
    }
    loadingDetailedPayslip.value = false;
    isFetchingPayslip.value = false;
  });

  onDetailedPayslipError((error) => {
    toastError({ message: 'Lỗi khi tải thông tin chi tiết bảng lương!' });
    detailedSalaryInfo.value = {} as DetailedSalaryInfoType;
    currentLoadedPayslipId.value = null;
    // Clear column data on error
    salaryCalculationColumns.value = [];
    salaryPaymentColumns.value = [];
    monthlySalaryColumns.value = [];
    loadingDetailedPayslip.value = false;
    isFetchingPayslip.value = false;
  });
}

// Function to load templates by type based on detailed salary information
function loadTemplatesByType(detailedSalary: any) {
  const employees = detailedSalary.employees || [];
  // If detailedSalary has columns directly (new structure without templates)
  if (detailedSalary.columns && Array.isArray(detailedSalary.columns) && detailedSalary.columns.length > 0) {
    const allColumns = detailedSalary.columns;

    // Set columns with proper grouping
    salaryCalculationColumns.value = groupColumnsWithSubColumns(allColumns) as EmployeePayslipColumn[];
    salaryPaymentColumns.value = groupColumnsWithSubColumns(allColumns) as EmployeePayslipColumn[];
    monthlySalaryColumns.value = groupColumnsWithSubColumns(allColumns) as EmployeePayslipColumn[];
    
    // Generate actual salary data from employee values
    salaryCalculationData.value = generateSalaryDataFromEmployees(salaryCalculationColumns.value, employees);
    salaryPaymentData.value = generateSalaryDataFromEmployees(salaryPaymentColumns.value, employees);
    monthlySalaryData.value = generateSalaryDataFromEmployees(monthlySalaryColumns.value, employees);
  } 
  // Legacy structure with templates
  else if (detailedSalary.templates && Array.isArray(detailedSalary.templates) && detailedSalary.templates.length > 0) {
    const templates = detailedSalary.templates;
    
    // Group templates by type and set columns
    const calculationTemplates = templates.filter((template: any) => template.type === 'SALARY_CALCULATION');
    const paymentTemplates = templates.filter((template: any) => template.type === 'SALARY_PAYMENT');
    const monthlyTemplates = templates.filter((template: any) => template.type === 'MONTHLY_SALARY');
    
    // Extract columns from each template type and group with subColumns
    salaryCalculationColumns.value = groupColumnsWithSubColumns(calculationTemplates.flatMap((template: any) => template.columns) || []) as EmployeePayslipColumn[];
    salaryPaymentColumns.value = groupColumnsWithSubColumns(paymentTemplates.flatMap((template: any) => template.columns) || []) as EmployeePayslipColumn[];
    monthlySalaryColumns.value = groupColumnsWithSubColumns(monthlyTemplates.flatMap((template: any) => template.columns) || []) as EmployeePayslipColumn[];

    // Generate actual salary data from employee values
    salaryCalculationData.value = generateSalaryDataFromEmployees(salaryCalculationColumns.value, employees);
    salaryPaymentData.value = generateSalaryDataFromEmployees(salaryPaymentColumns.value, employees);
    monthlySalaryData.value = generateSalaryDataFromEmployees(monthlySalaryColumns.value, employees);
  }
  // No data available
  else {
    // Clear all columns and data
    salaryCalculationColumns.value = [];
    salaryPaymentColumns.value = [];
    monthlySalaryColumns.value = [];
    salaryCalculationData.value = [];
    salaryPaymentData.value = [];
    monthlySalaryData.value = [];
  }
}

// Helper function to generate salary data from employee values with totals
function generateSalaryDataFromEmployees(columns: any[], employees: any[]) {
  if (!columns || columns.length === 0 || !employees || employees.length === 0) {
    return [];
  }

  // Sort all employees by orderNumber first to ensure correct order
  const sortedEmployees = [...employees].sort((a, b) => (a.orderNumber || 0) - (b.orderNumber || 0));

  // Group employees by organization (already sorted)
  const groupedEmployees = new Map<string, any[]>();
  sortedEmployees.forEach(employee => {
    const orgName = employee.organizationName || 'Khác';
    if (!groupedEmployees.has(orgName)) {
      groupedEmployees.set(orgName, []);
    }
    groupedEmployees.get(orgName)?.push(employee);
  });

  const salaryData = [] as any[];
  
  // Find columns that should be totaled
  const totalColumnCodes = new Set<string>();
  columns.forEach(col => {
    if (col.isTotal === true) {
      totalColumnCodes.add(col.code);
    }
    // Also check sub-columns
    if (col.subColumns && col.subColumns.length > 0) {
      col.subColumns.forEach((subCol: any) => {
        if (subCol.isTotal === true) {
          totalColumnCodes.add(subCol.code);
        }
      });
    }
  });

  // Process each organization group
  let globalIndex = 0; // Global index for STT
  groupedEmployees.forEach((employeesInGroup, orgName) => {
    // Employees already sorted globally, no need to sort again within group
    // Add all employee rows for this organization
    employeesInGroup.forEach((employee, indexInGroup) => {
      const employeeId = employee.employeeId;
      const employeeValue = employee.value || {};

      // Create value object with column codes as keys
      const valueObj = {} as any;
      
      // Map values from employee.value to corresponding columns
      columns.forEach(col => {
        // Add main column to value object - get value directly by column code
        valueObj[col.code] = employeeValue[col.code] !== undefined 
          ? employeeValue[col.code] 
          : col.dataType === 'NUMBER' ? 0 : null;
        // Add sub-columns if they exist
        if (col.subColumns && col.subColumns.length > 0) {
          col.subColumns.forEach((subCol: any) => {
            valueObj[subCol.code] = employeeValue[subCol.code] !== undefined
              ? employeeValue[subCol.code]
              : subCol.dataType === 'NUMBER' ? 0 : null;
          });
        }
      });
      
      // Create a base data object with employee info
      const dataRow = {
        employeeId: employeeId,
        value: valueObj,
        organizationId: employee.organizationId || '',
        organizationName: orgName,
        orderNumber: employee.orderNumber || 0,
        __typename: 'EmployeePayslipData'
      };

      salaryData.push(dataRow);
      globalIndex++;
    });

    // Always add group total row after all employees in this organization
    const groupTotalValueObj = {} as any;
    
    // Initialize all columns with empty values for the total row
    columns.forEach(col => {
      // Initialize main column
      groupTotalValueObj[col.code] = col.dataType === 'NUMBER' ? 0 : '';

      // Initialize sub-columns if they exist
      if (col.subColumns && col.subColumns.length > 0) {
        col.subColumns.forEach((subCol: any) => {
          groupTotalValueObj[subCol.code] = subCol.dataType === 'NUMBER' ? 0 : '';
        });
      }
    });

    // Find the column with orderNumber = 1 to display the label
    const firstOrderColumn = columns.find(col => col.orderNumber === 1);
    if (firstOrderColumn) {
      groupTotalValueObj[firstOrderColumn.code] = 'Tổng';
    }

    // Calculate totals for total columns in this group (if any exist)
    totalColumnCodes.forEach(colCode => {
      let total = 0;
      employeesInGroup.forEach(employee => {
        const employeeValue = employee.value || {};
        
        // Get value directly by column code
        const value = employeeValue[colCode] !== undefined ? employeeValue[colCode] : 0;
        if (typeof value === 'number') {
          total += value;
        } else if (typeof value === 'string' && !isNaN(parseFloat(value))) {
          total += parseFloat(value);
        }
      });
      groupTotalValueObj[colCode] = total;
    });
    
    const groupTotalRow = {
      employeeId: `group-total-${globalIndex}`,
      value: groupTotalValueObj,
      organizationId: '',
      organizationName: orgName,
      orderNumber: 0,
      __typename: 'EmployeePayslipData',
      isTotalRow: true,
      isGroupTotal: true
    };
    
    salaryData.push(groupTotalRow);
  });

  // Always add overall total row at the end
  const overallTotalValueObj = {} as any;

  // Initialize all columns with empty values for the total row
  columns.forEach(col => {
    // Initialize main column
    overallTotalValueObj[col.code] = col.dataType === 'NUMBER' ? 0 : '';

    // Initialize sub-columns if they exist
    if (col.subColumns && col.subColumns.length > 0) {
      col.subColumns.forEach((subCol: any) => {
        overallTotalValueObj[subCol.code] = subCol.dataType === 'NUMBER' ? 0 : '';
      });
    }
  });

  // Find the column with orderNumber = 1 to display the label
  const firstOrderColumn = columns.find(col => col.orderNumber === 1);
  if (firstOrderColumn) {
    overallTotalValueObj[firstOrderColumn.code] = 'Tổng cộng';
  }

  // Calculate overall totals (if any total columns exist)
  totalColumnCodes.forEach(colCode => {
    let total = 0;
    employees.forEach(employee => {
      const employeeValue = employee.value || {};
      
      // Get value directly by column code
      const value = employeeValue[colCode] !== undefined ? employeeValue[colCode] : 0;
      if (typeof value === 'number') {
        total += value;
      } else if (typeof value === 'string' && !isNaN(parseFloat(value))) {
        total += parseFloat(value);
      }
    });
    overallTotalValueObj[colCode] = total;
  });
  
  const overallTotalRow = {
    employeeId: 'overall-total',
    value: overallTotalValueObj,
    organizationId: '',
    organizationName: '',
    orderNumber: 0,
    __typename: 'EmployeePayslipData',
    isTotalRow: true,
    isOverallTotal: true
  };

  salaryData.push(overallTotalRow);

  return salaryData;
}

// Function to group columns with their subColumns
function groupColumnsWithSubColumns(columns: TemplateColumn[]) {
  if (!columns || columns.length === 0) {
    return [];
  }

  // In the new structure, subColumns is already a full object with properties
  // So we just need to process columns, keeping subColumns as they are
  const result = columns.map(col => {
    const processedCol = { ...col };

    // If this column has subColumns, ensure they're properly formatted
    if (col.subColumns && Array.isArray(col.subColumns) && col.subColumns.length > 0) {
      // Sort subColumns by orderNumber
      processedCol.subColumns = [...col.subColumns].sort((a: Partial<TemplateColumn>, b: Partial<TemplateColumn>) => {
        return (a.orderNumber || 0) - (b.orderNumber || 0);
      });
    }

    return processedCol;
  });

  // Sort main columns strictly by orderNumber
  result.sort((a, b) => {
    return (a.orderNumber || 0) - (b.orderNumber || 0);
  });
  return result;
}

// Function to open the edit salary dialog for the selected salary from tree
function openEditSalaryDialog() {
  if (detailedSalaryInfo?.value) {
    // Open the sidebar for editing the selected salary
    visibleSidebarForm.value = true;
  }
}

// Load all templates when component mounts
const {
  onResult: onAllTemplatesResult,
  onError: onAllTemplatesError
} = getAllSalaryTemplates();

onAllTemplatesResult((result) => {
  if (result.data && result.data.findTemplate) {
    allTemplates.value = result.data.findTemplate;

  }
});

onAllTemplatesError((error) => {
});

// Function to reset tab states to default values
function resetTabStates(clearLoadedId = true) {
  // Reset active tab index to the first tab
  activeTabIndex.value = 0;

  // Reset column data
  salaryCalculationColumns.value = [];
  salaryCalculationSubColumns.value = [];
  salaryPaymentColumns.value = [];
  salaryPaymentSubColumns.value = [];
  monthlySalaryColumns.value = [];

  // Reset table data
  salaryCalculationData.value = [];
  salaryPaymentData.value = [];
  monthlySalaryData.value = [];
  
  // Clear temporary changes
  cells.value = [];

  // Reset detailed salary info - clear completely to avoid showing old data
  detailedSalaryInfo.value = {
    id: undefined,
    name: '',
    month: 0,
    year: 0,
    location: '',
    createdDate: '',
    createdBy: '',
    organizationIds: [],
    columns: [],
    employees: []
  } as DetailedSalaryInfoType;
  
  // Reset loaded payslip ID only when switching payslips
  if (clearLoadedId) {
    currentLoadedPayslipId.value = null;
    isFetchingPayslip.value = false;
  }
}

watch(() => props.payslipId, (newPayslipId) => {
  if (newPayslipId) {
    // Only fetch if it's a different payslip ID (avoid duplicate fetch)
    if (currentLoadedPayslipId.value !== newPayslipId) {
      // Clear old data when switching payslips (clearLoadedId = true)
      resetTabStates(true);
      
      // Fetch new data
      fetchDetailedPayslip(newPayslipId);
    }
  } else {
    // If payslipId is cleared, reset everything (clearLoadedId = true)
    resetTabStates(true);
  }
}, { immediate: true });

// Handler for saving salary form
function handleSaveSalary(salaryData: any) {
  const payslipPayload = {
    name: salaryData.name,
    month: salaryData.month,
    year: salaryData.year,
    createdDate: salaryData.createdDate || new Date(),
    createdBy: salaryData.createdBy,
    organizationIds: salaryData.organizationIds,
    templateIds: salaryData.templateIds,
    location: salaryData.location || '',
  } as any;
  if(salaryData.id) {
    payslipPayload['id'] = salaryData.id;
  }

  savePayslipMutateDone((result) => {
    // Show success message to user
    toastSuccess({ message: t('hrm.salary.template.saveSuccess') || 'Lưu bảng lương thành công!' });
    // Optionally refresh data or update UI
    visibleSidebarForm.value = false;
    
    // Emit refetchData which will trigger watch to refetch detailed info
    // No need to manually call fetchDetailedPayslip as watch will handle it
    emit('refetchData');
  });

  savePayslipMutateError((error) => {
    // Show error message to user
    toastError({ message: t('hrm.salary.template.saveError') || 'Lỗi khi lưu bảng lương!' });
  });
  // Execute the mutation
  savePayslipMutate({ payslipPayload: payslipPayload });
}

// Handler for canceling salary form
function handleCancelSalary() {
  visibleSidebarForm.value = false;
}

// Handler for deleting a payslip
function handleDeletePayslip() {
  // Confirm deletion with user
  if (!detailedSalaryInfo.value?.id) {
    toastError({ message: 'Không tìm thấy ID của bảng lương cần xóa!' });
    return;
  }

  confirm.require({
    message: t('common.confirmDelete', {
      itemType: t('hrm.salary.salary.templateTypes.monthlySalary'),
      itemName: detailedSalaryInfo.value.name 
    }),
    header: t('common.confirm'),
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: t('common.delete'),
    acceptClass: 'p-button-danger',
    accept: () => {
      const payslipId = detailedSalaryInfo.value.id;

      deletePayslipMutateDone((result) => {
        toastSuccess({ message: 'Bảng lương đã được xóa thành công!' });

        // Optionally refresh the data or update UI
        // Clear the currently selected salary
        detailedSalaryInfo.value = {} as DetailedSalaryInfoType;
        emit('refetchData');
      });

      deletePayslipMutateError((error) => {
        toastError({ message: 'Lỗi khi xóa bảng lương!' });
      });

      // Execute the mutation
      deletePayslipMutate({ id: payslipId });
    }
  });
}

// Handler for updating status
function handleUpdateStatus() {
  if (!detailedSalaryInfo.value?.id) {
    toastError({ message: 'Không tìm thấy ID của bảng lương cần cập nhật!' });
    return;
  }

  // Set the current status as default selection
  selectedNewStatus.value = detailedSalaryInfo.value.status || 'DRAFT';

  // Show the status modal
  visibleStatusModal.value = true;
}

// Function to confirm status update
function confirmUpdateStatus() {
  if (!detailedSalaryInfo.value?.id) {
    toastError({ message: 'Không tìm thấy ID của bảng lương cần cập nhật!' });
    return;
  }

  if (!selectedNewStatus.value) {
    toastError({ message: 'Vui lòng chọn trạng thái mới!' });
    return;
  }

  updateStatusMutateDone((result) => {
    toastSuccess({ message: 'Cập nhật trạng thái thành công!' });

    // Close the modal
    visibleStatusModal.value = false;

    // Update the current selected salary with the new status
    if (detailedSalaryInfo.value) {
      detailedSalaryInfo.value.status = result.data.updateStatus.status;
    }
    
    // Emit refetchData which will trigger watch to refetch detailed info
    // No need to manually call fetchDetailedPayslip as watch will handle it
    emit('refetchData');
  });

  updateStatusMutateError((error) => {
    toastError({ message: 'Lỗi khi cập nhật trạng thái bảng lương!' });
    visibleStatusModal.value = false;
  });

  // Execute the mutation
  updateStatusMutate({
    id: detailedSalaryInfo.value.id,
    status: selectedNewStatus.value
  });
}

// Event handlers for saveData mutation
saveDataMutateDone((result) => {
  toastSuccess({ message: 'Dữ liệu đã được lưu thành công!' });
  
  // Refetch payslip data to get updated values (force to ensure fresh data)
  if (detailedSalaryInfo.value?.id) {
    fetchDetailedPayslip(detailedSalaryInfo.value.id, true);
  }
});

saveDataMutateError((error) => {
  toastError({ message: 'Lỗi khi lưu dữ liệu!' });
});

// Event handlers for calculatePayslip mutation
calculatePayslipMutateDone((result) => {
  try {
    if (result.data && result.data.calculatePayslip) {
      const calculatedEmployees = result.data.calculatePayslip;
      
      // Update detailedSalaryInfo with calculated values by merging with existing employees
      if (detailedSalaryInfo.value && detailedSalaryInfo.value.employees) {
        // Create a map of calculated data by employeeId for quick lookup
        const calculatedMap = new Map();
        calculatedEmployees.forEach((calcEmployee: any) => {
          if (calcEmployee && calcEmployee.employeeId) {
            calculatedMap.set(calcEmployee.employeeId, calcEmployee);
          }
        });
        
        // Merge calculated values into existing employees
        const mergedEmployees = detailedSalaryInfo.value.employees.map((employee: any) => {
          const calculatedData = calculatedMap.get(employee.employeeId);
          if (calculatedData && calculatedData.value) {
            // Merge calculated value with existing value
            return {
              ...employee,
              value: {
                ...employee.value || {},
                ...calculatedData.value
              },
              // Update other fields if they exist in calculated data
              organizationId: calculatedData.organizationId || employee.organizationId,
              organizationName: calculatedData.organizationName || employee.organizationName,
              orderNumber: calculatedData.orderNumber !== undefined ? calculatedData.orderNumber : employee.orderNumber
            };
          }
          return employee;
        });
        
        // Add any new employees from calculated data that don't exist in current employees
        calculatedEmployees.forEach((calcEmployee: any) => {
          if (calcEmployee && calcEmployee.employeeId) {
            const existingEmployee = mergedEmployees.find(
              (emp: any) => emp.employeeId === calcEmployee.employeeId
            );
            if (!existingEmployee) {
              mergedEmployees.push(calcEmployee);
            }
          }
        });
        
        // Reassign the entire detailedSalaryInfo object to avoid read-only property error
        detailedSalaryInfo.value = {
          ...detailedSalaryInfo.value,
          employees: mergedEmployees
        };
        
        // Regenerate salary data with merged values
        if (salaryCalculationColumns.value && salaryCalculationColumns.value.length > 0) {
          salaryCalculationData.value = generateSalaryDataFromEmployees(
            salaryCalculationColumns.value, 
            detailedSalaryInfo.value.employees
          );
        }
        if (salaryPaymentColumns.value && salaryPaymentColumns.value.length > 0) {
          salaryPaymentData.value = generateSalaryDataFromEmployees(
            salaryPaymentColumns.value, 
            detailedSalaryInfo.value.employees
          );
        }
        if (monthlySalaryColumns.value && monthlySalaryColumns.value.length > 0) {
          monthlySalaryData.value = generateSalaryDataFromEmployees(
            monthlySalaryColumns.value, 
            detailedSalaryInfo.value.employees
          );
        }
        
        // Clear temporary changes (cells) to show fresh calculated data
        cells.value = [];
      }
      
      // Clear cells and wait for DOM update to ensure computed properties show fresh data
      cells.value = [];
      
      // Use nextTick to ensure reactive updates are completed
      nextTick(() => {
        loadingCalculatePayslip.value = false;
        toastSuccess({ message: t('hrm.salary.salary.calculationSuccess') });
      });
    } else {
      loadingCalculatePayslip.value = false;
      toastError({ message: t('hrm.salary.salary.calculationError') });
    }
  } catch (error) {
    loadingCalculatePayslip.value = false;
    toastError({ message: t('hrm.salary.salary.calculationError') });
  }
});

calculatePayslipMutateError((error) => {
  loadingCalculatePayslip.value = false;
  toastError({ message: t('hrm.salary.salary.calculationError') });
});

// Function to handle data updates
const handleUpdateData = () => {
  // Get payslipId and employees from detailedSalaryInfo
  const payslipId = detailedSalaryInfo.value?.id;
  const employees = detailedSalaryInfo.value?.employees || [];
  
  if (!payslipId) {
    toastError({ message: t('hrm.salary.salary.notFoundId') });
    return;
  }
  
  // Create a map to track temporary changes by employeeId and columnCode
  const changesMap = new Map<string, Map<string, any>>();
  cells.value.forEach(change => {
    if (change.employeeId && change.columnId) {
      if (!changesMap.has(change.employeeId)) {
        changesMap.set(change.employeeId, new Map());
      }
      changesMap.get(change.employeeId)?.set(change.columnId, change.newValue);
    }
  });
  
  // Create array with structure: { employeeId, value }
  const records = employees
    .map((employee: EmployeesPayslip) => {
      // Clone value object and apply temporary changes if any
      const employeeValue = employee.value || {};
      const updatedValue = { ...employeeValue };
      
      // Apply changes from cells
      const employeeChanges = changesMap.get(employee.employeeId);
      if (employeeChanges) {
        employeeChanges.forEach((newValue, columnCode) => {
          updatedValue[columnCode] = newValue;
        });
      }
      
      return {
        employeeId: employee.employeeId,
        orderNumber: employee.orderNumber || 0, // Keep for sorting only
        value: updatedValue
      };
    })
    .sort((a, b) => a.orderNumber - b.orderNumber) // Sort by orderNumber
    .map(({ employeeId, value }) => ({
      employeeId,
      value 
    })); // Remove orderNumber from final payload

  // Call the saveRecordValues API with payslipId and records
  if (records.length > 0) {
    saveDataMutate({
      payslipId,
      records 
    });
    cells.value = [];
  } else {
    toastError({ message: t('hrm.salary.salary.noDataUpdate') });
  }
};

// Function to handle calculate payslip
const handleCalculatePayslip = () => {
  const payslipId = detailedSalaryInfo.value?.id;
  
  if (!payslipId) {
    toastError({ message: t('hrm.salary.salary.notFoundId') });
    return;
  }
  
  // Set loading state
  loadingCalculatePayslip.value = true;
  
  // Call the calculatePayslip API with payslipId
  calculatePayslipMutate({ payslipId });
};

// Function to handle cell edit completion events
const onCellEditComplete = (event: any) => {

  if (!event || !event.data) {
    return;
  }

  const { data, newValue, field } = event;
  const employeeId = data.employeeId;
  const columnCode = field; // This is the column code like 'A', 'B', 'C'

  if (!columnCode) {
    return;
  }

  // Store the change in temporary cells array for later saving, using columnCode
  const cellData = {
    employeeId: employeeId,
    columnId: columnCode, // columnId field actually stores columnCode for compatibility
    newValue: newValue
  };

  const existingIndex = cells.value.findIndex(
    cell => cell.employeeId === employeeId && cell.columnId === columnCode
  );

  if (existingIndex !== -1) {
    cells.value[existingIndex] = { ...cellData };
  } else {
    cells.value.push({ ...cellData });
  }

  // Update the display data and recalculate totals (only update the display, not original data)
  updateDisplayDataValueAndRecalculateTotals(employeeId, columnCode, newValue);
};

// Helper function to update display data values and recalculate totals
function updateDisplayDataValueAndRecalculateTotals(employeeId: string, columnCode: string, newValue: any) {
  // columnCode is used directly as the key
  if (!columnCode) {
    return;
  }

  // Update salary calculation data
  const calcRowIndex = salaryCalculationData.value.findIndex(
    (row: any) => row.employeeId === employeeId
  );
  if (calcRowIndex !== -1) {
    if (salaryCalculationData.value[calcRowIndex].value) {
      salaryCalculationData.value[calcRowIndex].value[columnCode] = newValue;
    } else {
      salaryCalculationData.value[calcRowIndex][columnCode] = newValue;
    }
  }

  // Update salary payment data
  const paymentRowIndex = salaryPaymentData.value.findIndex(
    (row: any) => row.employeeId === employeeId
  );
  if (paymentRowIndex !== -1) {
    if (salaryPaymentData.value[paymentRowIndex].value) {
      salaryPaymentData.value[paymentRowIndex].value[columnCode] = newValue;
    } else {
      salaryPaymentData.value[paymentRowIndex][columnCode] = newValue;
    }
  }

  // Update monthly salary data
  const monthlyRowIndex = monthlySalaryData.value.findIndex(
    (row: any) => row.employeeId === employeeId
  );
  if (monthlyRowIndex !== -1) {
    if (monthlySalaryData.value[monthlyRowIndex].value) {
      monthlySalaryData.value[monthlyRowIndex].value[columnCode] = newValue;
    } else {
      monthlySalaryData.value[monthlyRowIndex][columnCode] = newValue;
    }
  }

  // Recalculate totals based on affected column
  recalculateTotals(columnCode);
}

// Function to recalculate all totals after a value change
function recalculateTotals(changedColumnCode: string) {
  // Get all column definitions for total calculation from loaded columns
  const allColumns = [
    ...salaryCalculationColumns.value,
    ...salaryPaymentColumns.value,
    ...monthlySalaryColumns.value
  ];

  // Identify which columns have isTotal = true
  const totalColumnCodes = new Set<string>();
  allColumns.forEach((col: any) => {
    if (col.isTotal === true) {
      totalColumnCodes.add(col.code.toLowerCase());
    }
    if (col.subColumns && col.subColumns.length > 0) {
      col.subColumns.forEach((subCol: any) => {
        if (subCol.isTotal === true) {
          totalColumnCodes.add(subCol.code.toLowerCase());
        }
      });
    }
  });

  // Only recalculate if the changed column affects totals
  if (totalColumnCodes.has(changedColumnCode)) {
    // Regenerate all salary data to update totals (this will recalculate based on updated employee values)
    if (detailedSalaryInfo.value && detailedSalaryInfo.value.employees) {
      const employees = detailedSalaryInfo.value.employees;

      // Recalculate salary calculation data with totals
      if (salaryCalculationColumns.value && salaryCalculationColumns.value.length > 0) {
        salaryCalculationData.value = generateSalaryDataFromEmployeesWithTempChanges(salaryCalculationColumns.value, employees);
      }

      // Recalculate salary payment data with totals
      if (salaryPaymentColumns.value && salaryPaymentColumns.value.length > 0) {
        salaryPaymentData.value = generateSalaryDataFromEmployeesWithTempChanges(salaryPaymentColumns.value, employees);
      }

      // Recalculate monthly salary data with totals
      if (monthlySalaryColumns.value && monthlySalaryColumns.value.length > 0) {
        monthlySalaryData.value = generateSalaryDataFromEmployeesWithTempChanges(monthlySalaryColumns.value, employees);
      }
    }
  }
}

// Function to generate salary data that also applies temporary changes
function generateSalaryDataFromEmployeesWithTempChanges(columns: any[], employees: any[]) {
  // First generate the base data
  const baseData = generateSalaryDataFromEmployees(columns, employees);

  // Then apply temporary changes from the cells array
  if (cells.value && cells.value.length > 0) {
    baseData.forEach(row => {
      const employeeId = row.employeeId;

      // Apply all relevant temporary changes to this row
      cells.value.forEach(change => {
        if (change.employeeId === employeeId) {
          // change.columnId now contains columnCode directly
          const columnCode = change.columnId;
          
          if (row.value) {
            row.value[columnCode] = change.newValue;
          } else {
            row[columnCode] = change.newValue;
          }
        }
      });
    });
  }

  return baseData;
}

// Computed property for displaying data with temporary changes applied and recalculate totals
const displaySalaryCalculationData = computed(() => {
  if (!salaryCalculationData.value || salaryCalculationData.value.length === 0) {
    return [];
  }

  // Create a deep copy of the salary calculation data
  const displayData = JSON.parse(JSON.stringify(salaryCalculationData.value));

  // Apply temporary changes from cells
  cells.value.forEach(change => {
    // Find the row that matches this employeeId
    const rowIndex = displayData.findIndex((row: EmployeePayslipRow) => row.employeeId === change.employeeId);
    if (rowIndex !== -1) {
      // Update the field value with the temporary change
      if (displayData[rowIndex].value) {
        displayData[rowIndex].value[change.columnId] = change.newValue;
      } else {
        displayData[rowIndex][change.columnId] = change.newValue;
      }
    }
  });

  // Identify which columns can have totals (isTotal = true)
  const totalColumnCodes = new Set<string>();
  salaryCalculationColumns.value.forEach(col => {
    if (col.isTotal === true) {
      totalColumnCodes.add(col.code);
    }
    if (col.subColumns && col.subColumns.length > 0) {
      col.subColumns.forEach((subCol: any) => {
        if (subCol.isTotal === true) {
          totalColumnCodes.add(subCol.code);
        }
      });
    }
  });

  // Only recalculate totals if the changed field is a total-able column
  if (totalColumnCodes.size > 0 && cells.value.length > 0) {
    // Group the data by organization (excluding total rows)
    const groupedData = new Map<string, any[]>();
    const totalRows = [];

    displayData.forEach((row: EmployeePayslipRow ) => {
      if (row.isTotalRow) {
        totalRows.push(row);
      } else {
        const orgName = row.organizationName;
        if (!groupedData.has(orgName)) {
          groupedData.set(orgName, []);
        }
        groupedData.get(orgName)!.push(row);
      }
    });

    // Update group total rows
    groupedData.forEach((rows, orgName) => {
      // Find the group total row for this organization
      const groupTotalRowIndex = displayData.findIndex(
        (row: EmployeePayslipRow ) => row.isGroupTotal && row.organizationName === orgName
      );

      if (groupTotalRowIndex !== -1) {
        const groupTotalRow = displayData[groupTotalRowIndex];
        // Calculate totals for this group
        totalColumnCodes.forEach(colCode => {
          let total = 0;
          rows.forEach(row => {
            const value = row.value ? row.value[colCode] : row[colCode];
            if (typeof value === 'number') {
              total += value;
            } else if (typeof value === 'string' && !isNaN(parseFloat(value))) {
              total += parseFloat(value);
            }
          });
          if (groupTotalRow.value) {
            groupTotalRow.value[colCode] = total;
          } else {
            groupTotalRow[colCode] = total;
          }
        });
      }
    });

    // Update overall total row
    const overallTotalRowIndex = displayData.findIndex((row: EmployeePayslipRow ) => row.isOverallTotal);
    if (overallTotalRowIndex !== -1) {
      const overallTotalRow = displayData[overallTotalRowIndex];
      totalColumnCodes.forEach(colCode => {
        let total = 0;
        // Calculate total for all non-total rows
        displayData.forEach((row: EmployeePayslipRow ) => {
          if (!row.isTotalRow) {
            const value = row.value ? row.value[colCode] : row[colCode];
            if (typeof value === 'number') {
              total += value;
            } else if (typeof value === 'string' && !isNaN(parseFloat(value))) {
              total += parseFloat(value);
            }
          }
        });
        if (overallTotalRow.value) {
          overallTotalRow.value[colCode] = total;
        } else {
          overallTotalRow[colCode] = total;
        }
      });
    }
  }

  return displayData;
});

// Computed property for displaying salary payment data with temporary changes applied and recalculate totals
const displaySalaryPaymentData = computed(() => {
  if (!salaryPaymentData.value || salaryPaymentData.value.length === 0) {
    return [];
  }

  // Create a deep copy of the salary payment data
  const displayData = JSON.parse(JSON.stringify(salaryPaymentData.value));

  // Apply temporary changes from cells
  cells.value.forEach(change => {
    // Find the row that matches this employeeId
    const rowIndex = displayData.findIndex((row: EmployeePayslipRow ) => row.employeeId === change.employeeId);
    if (rowIndex !== -1) {
      // Update the field value with the temporary change
      displayData[rowIndex][change.columnId] = change.newValue;
    }
  });

  // Identify which columns can have totals (isTotal = true) for salary payment
  const totalColumnCodes = new Set<string>();
  salaryPaymentColumns.value.forEach(col => {
    if (col.isTotal === true) {
      totalColumnCodes.add(col.code);
    }
    if (col.subColumns && col.subColumns.length > 0) {
      col.subColumns.forEach((subCol: any) => {
        if (subCol.isTotal === true) {
          totalColumnCodes.add(subCol.code);
        }
      });
    }
  });

  // Only recalculate totals if the changed field is a total-able column
  if (totalColumnCodes.size > 0 && cells.value.length > 0) {
    // Group the data by organization (excluding total rows)
    const groupedData = new Map<string, any[]>();
    const totalRows = [];

    displayData.forEach((row: EmployeePayslipRow ) => {
      if (row.isTotalRow) {
        totalRows.push(row);
      } else {
        const orgName = row.organizationName;
        if (!groupedData.has(orgName)) {
          groupedData.set(orgName, []);
        }
        groupedData.get(orgName)?.push(row);
      }
    });

    // Update group total rows
    groupedData.forEach((rows, orgName) => {
      // Find the group total row for this organization
      const groupTotalRowIndex = displayData.findIndex(
        (row: EmployeePayslipRow) => row.isGroupTotal && row.organizationName === orgName
      );

      if (groupTotalRowIndex !== -1) {
        const groupTotalRow = displayData[groupTotalRowIndex];
        // Calculate totals for this group
        totalColumnCodes.forEach(colCode => {
          let total = 0;
          rows.forEach(row => {
            const value = row.value ? row.value[colCode] : row[colCode];
            if (typeof value === 'number') {
              total += value;
            } else if (typeof value === 'string' && !isNaN(parseFloat(value))) {
              total += parseFloat(value);
            }
          });
          if (groupTotalRow.value) {
            groupTotalRow.value[colCode] = total;
          } else {
            groupTotalRow[colCode] = total;
          }
        });
      }
    });

    // Update overall total row
    const overallTotalRowIndex = displayData.findIndex((row: EmployeePayslipRow) => row.isOverallTotal);
    if (overallTotalRowIndex !== -1) {
      const overallTotalRow = displayData[overallTotalRowIndex];
      totalColumnCodes.forEach(colCode => {
        let total = 0;
        // Calculate total for all non-total rows
        displayData.forEach((row: EmployeePayslipRow) => {
          if (!row.isTotalRow) {
            const value = row.value ? row.value[colCode] : row[colCode];
            if (typeof value === 'number') {
              total += value;
            } else if (typeof value === 'string' && !isNaN(parseFloat(value))) {
              total += parseFloat(value);
            }
          }
        });
        if (overallTotalRow.value) {
          overallTotalRow.value[colCode] = total;
        } else {
          overallTotalRow[colCode] = total;
        }
      });
    }
  }

  return displayData;
});

// Function to handle row click events
const onRowClick = (event: any) => {
  const rowData = event.data;
  // Don't handle clicks for total rows
  if (rowData.isTotalRow) {
    return;
  }
};

// Function to update cells from child component
const updateCells = (newCells: any[]) => {
  cells.value = [...newCells];
};

// Expose function to parent component
defineExpose({ handleCalculatePayslip });
</script>

<style lang='scss' scoped>

td, th {
  padding: 6px 8px;
  border: 1px solid #ccc;
  text-align: center;
  vertical-align: middle;
  word-break: break-word;
  white-space: normal;
  font-size: 13px;
  color: black;
}

thead td {
  font-weight: 600;
  background-color: #f5f5f5;
}

tbody td {
  background-color: #fff;
}

.header-row {
  background-color: #f5f5f5;
}

.year-display {
  display: flex;
  align-items: center;
  border: 1px solid #ccc;
  border-radius: 6px;
  padding: 6px 12px;
  cursor: pointer;
  gap: 6px;
  background: #fff;
}

.hidden-calendar-input {
  display: none;
}

.table-container {
  overflow-x: auto;
  overflow-y: auto;
  width: 100%;
  height: 100%;
}

.custom-table {
  border-collapse: collapse;
  width: max-content;
  table-layout: auto;
  font-size: 13px;
}

:deep(.p-splitbutton-menubutton) {
  border-radius: 0
}

.sticky-col-1 {
  position: sticky;
  left: 0;
  z-index: 10;
  background-color: white;
}

.sticky-col-2 {
  position: sticky;
  left: 42px;
  z-index: 10;
  background-color: white;
}

.sticky-col-3 {
  position: sticky;
  left: 252px;
  z-index: 10;
  background-color: white;
}

.selected-month {
  background-color: #fef3c7; /* yellow-100 */
  animation: pulse-highlight 1.2s ease-in-out;
  color: black
}

@keyframes pulse-highlight {
  0% {
    box-shadow: 0 0 0 0 rgba(250, 204, 21, 0.4);
  }
  70% {
    box-shadow: 0 0 0 8px rgba(250, 204, 21, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(250, 204, 21, 0);
  }
}

:deep(tbody tr:hover td) {
  background-color: #e6f7ff;
}

:deep(.p-tabview-panels) {
  padding-left: 0 !important;
  padding-right: 0 !important;
  padding-top: 12px !important;
  height: calc(100vh - 250px);
  max-height: unset;
}

/* Action buttons bar styling */
.action-buttons-bar {
  padding: 4px;
}

/* Action buttons styling */
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

:deep(.p-rowgroup-header) {
  border-right: 1px solid #ccc;
  border-bottom: 1px solid #ccc;
  border-left: 1px solid #ccc;

  & > td {
    background-color: var(--surface-100);
  }
}
</style>
