<template>
  <Sidebar
    v-model:visible='visibleSidebar'
    :dismissable='false'
    position='right'
    v-bind='{...DEFAULT_DIALOG_CONFIG,style: {width: "80vw"}}'
    :pt="{
      header: {
        class: 'p-2 border-bottom-1 border-gray-500'
      },
      content: {
        class: 'pt-4'
      }
    }"
    :show-close-icon='false'
    @hide='onVisibleChange(false)'>
    <template #header>
      <div
        class='left-0 surface-0 w-full'
        style='z-index: 1000'>
        <div class='flex justify-content-between'>
          <div class='flex gap-1'>
            <ButtonIcon
              class='border-round-sm'
              icon='arrow_back'
              severity='danger'
              size='small'
              @click='onCancel'/>
            <div class='align-content-center font-semibold text-2xl'>
              {{ editingTemplate ? t('hrm.salary.salary.editTemplate') : t('hrm.salary.salary.createTemplate') }}
            </div>
          </div>
          <div class='flex gap-1'>
            <Button
              class='border-round-sm'
              :disabled='!isFormValid || isLoading'
              icon='pi pi-save'
              :label="t('common.save')"
              :loading='isLoading'
              @click='onSave'/>
          </div>
        </div>
      </div>
    </template>

    <div class='border-round-sm flex flex-column gap-2'>
      <div class='form-field'>
        <label class='block font-semibold mb-2'>{{ t('hrm.salary.salary.templateName') }} <span
          class='text-red-500'>*</span></label>
        <InputText
          v-model='localTemplateForm.name'
          class='w-full'
          :class="{ 'p-invalid': errors.name }"
          :placeholder="t('hrm.salary.salary.enterTemplateName')"/>
        <small
          v-if='errors.name'
          class='p-error'>{{ errors.name }}</small>
      </div>
      <div class='form-field'>
        <label class='block font-semibold mb-2'>{{ t('common.description') }}</label>
        <Textarea
          v-model='localTemplateForm.description'
          class='w-full'
          :placeholder="t('hrm.salary.salary.enterTemplateDescription')"
          rows='3'/>
      </div>

      <!-- Template Type -->
      <div class='form-field'>
        <label class='block font-semibold mb-2'>{{ t('hrm.salary.salary.templateType') }} <span
          class='text-red-500'>*</span></label>
        <Dropdown
          v-model='localTemplateForm.type'
          class='w-full'
          option-label='label'
          option-value='value'
          :options='templateTypeOptions'
          :placeholder="t('hrm.salary.salary.selectTemplateType')"/>
        <small
          v-if='errors.type'
          class='p-error'>{{ errors.type }}</small>
      </div>

      <!-- Template Status -->
      <div class='form-field'>
        <label class='block font-semibold mb-2'>{{ t('common.status') }}</label>
        <div class='align-items-center flex'>
          <RadioButton
            v-model='localTemplateForm.status'
            input-id='status-active'
            value='ACTIVE'/>
          <label
            class='ml-2 mr-4'
            for='status-active'>{{ t('common.statuses.active') }}</label>
          <RadioButton
            v-model='localTemplateForm.status'
            input-id='status-inactive'
            value='INACTIVE'/>
          <label
            class='ml-2'
            for='status-inactive'>{{ t('common.statuses.deactivate') }}</label>
        </div>
      </div>

      <!-- Columns Section -->
      <div class='form-field'>
        <div class='align-items-center border-round-sm flex justify-content-between mb-2'>
          <label class='block font-semibold mb-2'>{{ t('hrm.salary.salary.templateColumns') }}</label>
          
          <Button
            class='border-round-sm p-button-text surface-100 w-max'
            icon='pi pi-plus'
            :label="t('hrm.salary.salary.addColumn')"
            @click='addColumn'/>
        </div>
        <div class='flex flex-column gap-3'>
          <div class=''>
            <DataTable
              class='p-datatable-sm'
              scroll-direction='horizontal'
              scroll-height='45vh'
              scrollable
              show-gridlines
              table-style='min-width: 1200px'
              :value='localColumns'>
              <Column

                field='code'
                :header='t("hrm.salary.salary.columnCode")'
                header-style='width: 70px'>
                <template #body='{ data }'>
                  <InputText
                    v-model='data.code'
                    class='w-full'
                    @input='validateColumnCodeInput(data)'>
                  </InputText>
                  <small
                    v-if='data.errors?.code'
                    class='p-error'>{{ data.errors.code }}</small>
                </template>
              </Column>

              <Column
                field='name'
                :header='t("hrm.salary.salary.columnName")'
                header-style='min-width: 200px'>
                <template #body='{ data }'>
                  <InputText
                    v-model='data.name'/>
                  <small
                    v-if='data.errors?.name'
                    class='p-error'>{{ data.errors.name }}</small>
                </template>
              </Column>

              <Column
                field='type'
                :header='t("hrm.salary.salary.columnType")'
                header-style='min-width: 140px'>
                <template #body='{ data }'>
                  <Dropdown
                    v-model='data.columnType'
                    class='w-full'
                    option-label='label'
                    option-value='value'
                    :options='columnTypeOptions'
                    :placeholder='t("hrm.salary.salary.columnType")'
                    @change='onColumnTypeChange(data)'/>
                </template>
              </Column>

              <Column
                field='columnDataSystem'
                :header='t("hrm.salary.salary.dataSource")'
                header-style='min-width: 160px'>
                <template #body='{ data }'>
                  <Dropdown
                    v-if='data.columnType === "FROM_SYSTEM"'
                    v-model='data.columnDataSystem'
                    class='w-full'
                    option-label='label'
                    option-value='value'
                    :options='dataSourceOptions'
                    :placeholder='t("hrm.salary.salary.selectDataSource")'/>
                </template>
              </Column>

              <Column
                class='text-center'
                field='columnDataSystem'
                :header='t("hrm.salary.salary.dataSource")'
                header-style='width: 80px'>
                <template #body='{ data }'>
                  <InputSwitch
                    v-if='data.columnType === ColumnTypeEnum.FROM_SYSTEM'
                    v-model='data.isInitData' />
                  
                </template>
              </Column>

              <Column

                field='dataType'
                :header='t("hrm.salary.salary.columnDataType")'
                header-style='min-width: 130px'>
                <template #body='{ data }'>
                  <Dropdown
                    v-model='data.dataType'
                    class='w-full'
                    option-label='label'
                    option-value='value'
                    :options='getDataTypeOptionsForColumn(data.columnType)'
                    :placeholder='t("hrm.salary.salary.columnDataType")'
                    @change='onDataTypeChange(data)'/>
                </template>
              </Column>

              <Column
                field='analyticFunction'
                :header='t("hrm.salary.salary.analyticFunction")'
                header-style='min-width: 150px'>
                <template #body='{ data }'>
                  <Dropdown
                    v-model='data.analyticFunction'
                    class='w-full'
                    option-label='label'
                    option-value='value'
                    :options='getAnalyticFunctionOptions(data.dataType)'
                    :placeholder='t("hrm.salary.salary.analyticFunction")'
                    show-clear/>
                </template>
              </Column>

              <Column
                class='text-center'
                field='orderNumber'
                :header='t("hrm.salary.salary.columnOrderNumber")'
                header-style='width: 70px'>
                <template #body='{ data }'>
                  <InputNumber
                    v-model='data.orderNumber'
                    class='text-center w-full'
                    input-class='text-center'
                    :min='1'
                    :use-grouping='false'/>
                </template>
              </Column>

              <Column
                field='status'
                :header='t("hrm.salary.salary.columnStatus")'
                header-style='min-width: 100px'>
                <template #body='{ data }'>
                  <Dropdown
                    v-model='data.status'
                    class='w-full'
                    option-label='label'
                    option-value='value'
                    :options='statusOptions'
                    :placeholder='t("hrm.salary.salary.columnStatus")'/>
                </template>
              </Column>

              <Column
                :header='t("common.action")'
                header-style='min-width: 100px; text-align: center'>
                <template #body='{ index }'>
                  <div class='flex justify-content-center'>
                    <Button
                      v-if='localColumns.length > 1'
                      class='p-button-danger p-button-text'
                      icon='pi pi-trash'
                      @click='removeColumn(index)'/>
                  </div>
                </template>
              </Column>
            </DataTable>
          </div>

          <Button
            class='border-round-sm p-button-text surface-100 w-max'
            icon='pi pi-plus'
            :label="t('hrm.salary.salary.addColumn')"
            @click='addColumn'/>
        </div>
      </div>

    </div>

  </Sidebar>
</template>

<script setup lang="ts">

import { useToast } from 'primevue/usetoast';
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { saveSalaryTemplate } from '@/apps/hrm/api/graphql/salary';
import {
  ColumnTypeEnum,
  DataSystemEnum,
  DataTypeEnum,
  type SalaryTemplate,
  type TemplateColumn,
  type TemplateForm
} from '@/apps/hrm/model/salary';
import ButtonIcon from '@/common/components/custom/ButtonIcon.vue';
import { DEFAULT_DIALOG_CONFIG } from '@/common/constants';

interface ColumnTypeOption {
  label: string;
  value: string;
}

interface DataTypeOption {
  label: string;
  value: string;
}

interface AnalyticFunctionOption {
  label: string;
  value: string;
}

interface Props {
  visible: boolean;
  editingTemplate: SalaryTemplate | null;
  templateForm: TemplateForm;
}

interface Emits {
  (e: 'update:visible', value: boolean): void;

  (e: 'save', template: any): void;

  (e: 'cancel'): void;
  (e: 'refetch'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();
const { t } = useI18n();
const toast = useToast();

// Loading state
const isLoading = ref(false);
let mutationHandled = false; // Flag to prevent duplicate notifications

// GraphQL operations
const {
  mutate: saveSalaryTemplateMutate,
  onDone: saveSalaryTemplateDone,
  onError: saveSalaryTemplateError
} = saveSalaryTemplate();

// Handle GraphQL events
saveSalaryTemplateDone((result) => {
  if (mutationHandled) {
    return;
  } // Prevent duplicate notifications
  mutationHandled = true;
  isLoading.value = false;
  if (result.data && result.data.saveTemplate) {
    toast.add({
      severity: 'success',
      summary: t('common.success'),
      detail: t('hrm.salary.template.saveSuccess'),
      life: 3000
    });

    // Emit event to parent with saved template
    emit('save', result.data.saveTemplate);
    // onVisibleChange(false);
  } else {
    toast.add({
      severity: 'error',
      summary: t('common.error'),
      detail: t('common.saveError'),
      life: 3000
    });
  }
  emit('refetch');
});

saveSalaryTemplateError((error) => {
  if (mutationHandled) {
    return;
  } // Prevent duplicate notifications
  mutationHandled = true;
  isLoading.value = false;
  toast.add({
    severity: 'error',
    summary: t('common.error'),
    detail: t('hrm.salary.template.saveError'),
    life: 3000
  });
});

// Local form data
const localTemplateForm = ref<TemplateForm>({
  name: '',
  description: '',
  type: '',
  status: 'ACTIVE'
});

// Local columns data
const localColumns = ref<TemplateColumn[]>([
  {
    code: '',
    name: '',
    columnType: '',
    dataType: 'STRING',
    analyticFunction: null,
    orderNumber: 1,
    status: 'ACTIVE',
    subColumns: []
  }
]);

// Computed ref for visibility to sync with props
const visibleSidebar = computed({
  get: () => props.visible,
  set: (value) => {
    emit('update:visible', value);
  }
});

// Form errors
const errors = ref<Record<string, string>>({});

// Template type options
const templateTypeOptions = computed(() => [
  {
    label: t('hrm.salary.salary.templateTypes.salaryCalculation'),
    value: 'SALARY_CALCULATION'
  },
  {
    label: t('hrm.salary.salary.templateTypes.salaryPayment'),
    value: 'SALARY_PAYMENT'
  },
  // {
  //   label: t('hrm.salary.salary.templateTypes.monthlySalary'),
  //   value: 'MONTHLY_SALARY'
  // }
]);

// Column type options
const columnTypeOptions = computed<ColumnTypeOption[]>(() => [
  {
    label: t('hrm.salary.columns.FROM_SYSTEM'),
    value: ColumnTypeEnum.FROM_SYSTEM
  },
  {
    label: t('hrm.salary.columns.MANUALLY_ENTERED'),
    value: ColumnTypeEnum.MANUALLY_ENTERED
  },
  {
    label: t('hrm.salary.columns.FORMULA'),
    value: ColumnTypeEnum.FORMULA
  }
]);

// Data type options
const dataTypeOptions = computed<DataTypeOption[]>(() => [
  {
    label: t('hrm.salary.salary.dataTypes.string'),
    value: DataTypeEnum.STRING
  },
  {
    label: t('hrm.salary.salary.dataTypes.integer'),
    value: DataTypeEnum.INTEGER
  },
  {
    label: t('hrm.salary.salary.dataTypes.decimal'),
    value: DataTypeEnum.DECIMAL
  },
  {
    label: t('hrm.salary.salary.dataTypes.date'),
    value: DataTypeEnum.DATE
  },

]);

// Analytic function options
const analyticFunctionOptions = computed<AnalyticFunctionOption[]>(() => [
  {
    label: t('hrm.salary.salary.analyticFunctions.sum'),
    value: 'SUM'
  },
  {
    label: t('hrm.salary.salary.analyticFunctions.average'),
    value: 'AVERAGE'
  },
  {
    label: t('hrm.salary.salary.analyticFunctions.count'),
    value: 'COUNT'
  },
  {
    label: t('hrm.salary.salary.analyticFunctions.max'),
    value: 'MAX'
  },
  {
    label: t('hrm.salary.salary.analyticFunctions.min'),
    value: 'MIN'
  }
]);

// Status options
const statusOptions = computed(() => [
  {
    label: t('hrm.salary.salary.columnStatuses.active'),
    value: 'ACTIVE'
  },
  {
    label: t('hrm.salary.salary.columnStatuses.inactive'),
    value: 'INACTIVE'
  }
]);

// Data source options - this would typically be loaded from an API
const dataSourceOptions = ref<any[]>([]);

// Function to load data source options from API
async function loadDataSourceOptions() {
  // Mock data - in a real implementation, this would fetch from an API
  dataSourceOptions.value = [
    {
      label: t('hrm.salary.systemDataField.FULL_NAME'),
      value: DataSystemEnum.FULL_NAME
    },
    {
      label: t('hrm.salary.systemDataField.EMPLOYEE_CODE'),
      value: DataSystemEnum.EMPLOYEE_CODE
    },
    {
      label: t('hrm.salary.systemDataField.POSITION'),
      value: DataSystemEnum.POSITION
    },
    {
      label: t('hrm.salary.systemDataField.WORKING_DAYS'),
      value: DataSystemEnum.WORKING_DAYS
    },
  ];
}

// Form validation
const isFormValid = computed(() => {
  return localTemplateForm.value.name && localTemplateForm.value.name.trim().length > 0;
});

// Watch for changes in props.visible to load data when sidebar opens
watch(() => props.visible, async (newVisible) => {
  if (newVisible) {
    // Reset form when sidebar opens
    errors.value = {};
    if (props.editingTemplate) {
      localTemplateForm.value = { ...props.templateForm };
      // If editing, load existing columns
      if (props.editingTemplate.columns) {
        // Make sure data source options are loaded first
        if (props.editingTemplate.columns.some(col => col.columnType === ColumnTypeEnum.FROM_SYSTEM)) {
          await loadDataSourceOptions();
        }
        
        localColumns.value = props.editingTemplate.columns.map((col: any) => ({
          id: col.id,
          code: col.code || '',
          name: col.name || '',
          columnType: col.columnType || '',
          columnDataSystem: col.columnDataSystem || (col.columnType === ColumnTypeEnum.FROM_SYSTEM && dataSourceOptions.value.length > 0 ? dataSourceOptions.value[0].value : null),
          dataType: col.dataType || 'STRING',
          subColumns: col.subColumns || [],
          isInitData: col.isInitData || false,
          analyticFunction: col.analyticFunction || null,
          orderNumber: col.orderNumber || 1,
          status: col.status || 'ACTIVE'
        })).sort((a, b) => (a.orderNumber || 0) - (b.orderNumber || 0)); // Sort by orderNumber
      } else {
        localColumns.value = [{
          code: '',
          name: '',
          columnType: '',
          columnDataSystem: null,
          dataType: 'STRING',
          analyticFunction: null,
          orderNumber: 1,
          status: 'ACTIVE'
        }];
      }
    } else {
      localTemplateForm.value = {
        name: '',
        description: '',
        type: '',
        status: 'ACTIVE'
      };
      localColumns.value = [{
        code: '',
        name: '',
        columnType: '',
        columnDataSystem: null,
        dataType: 'STRING',
        analyticFunction: null,
        orderNumber: 1,
        status: 'ACTIVE'
      }];
    }
    
  }
}, { immediate: false }); // Don't trigger immediately since computed handles initial state

// Watch for changes in editingTemplate to reset form when transitioning from edit to create
watch(() => props.editingTemplate, (newEditingTemplate) => {
  // When transitioning from editing to creating (editingTemplate becomes null), reset form
  if (!newEditingTemplate) {
    resetFormData();
  }
}, { immediate: true });

// Column management methods
function addColumn() {
  // Auto-calculate the next order number based on existing columns
  const maxOrderNumber = localColumns.value.length > 0 
    ? Math.max(...localColumns.value.map(col => col.orderNumber || 0)) 
    : 0;
  
  localColumns.value.push({
    code: '',
    name: '',
    columnType: '',
    columnDataSystem: null,
    dataType: 'STRING',
    analyticFunction: null,
    orderNumber: maxOrderNumber + 1,
    status: 'ACTIVE',
    subColumns: []
  });
  
  // Re-sort columns after adding a new one to maintain proper order
  localColumns.value.sort((a, b) => (a.orderNumber || 0) - (b.orderNumber || 0));
}

function removeColumn(index: number) {
  if (localColumns.value.length > 1) {
    localColumns.value.splice(index, 1);
    // Re-sort columns after removing to maintain proper order
    localColumns.value.sort((a, b) => (a.orderNumber || 0) - (b.orderNumber || 0));
  }
}

// Function to handle column type changes
function onColumnTypeChange(column: any) {
  if (column.columnType === ColumnTypeEnum.FROM_SYSTEM) {
    // If data source options haven't been loaded yet, load them
    if (dataSourceOptions.value.length === 0) {
      loadDataSourceOptions();
    }
    
    // Set the default value to the first option if available
    if (dataSourceOptions.value.length > 0 && !column.columnDataSystem) {
      column.columnDataSystem = dataSourceOptions.value[0].value;
    }
  } else {
    // Clear data source when type is not FROM_SYSTEM
    column.columnDataSystem = null;
  }
  
  // If column type is FORMULA, set data type to INTEGER (number) if not already a number type
  if (column.columnType === ColumnTypeEnum.FORMULA) {
    // Only change to NUMBER if current dataType is not a number type (NUMBER or DECIMAL)
    if (column.dataType !== DataTypeEnum.INTEGER && column.dataType !== DataTypeEnum.DECIMAL) {
      column.dataType = DataTypeEnum.INTEGER;
    }
  }
  
  // If column type is MANUALLY_ENTERED, set data type to STRING
  if (column.columnType === ColumnTypeEnum.MANUALLY_ENTERED) {
    column.dataType = DataTypeEnum.STRING;
  }
}

// Function to validate column code input to only allow letters
function validateColumnCodeInput(column: any) {
  if (column.code) {
    // Remove any non-alphabetic characters
    const cleanCode = column.code.replace(/[^A-Za-z]/g, '');
    if (cleanCode !== column.code) {
      column.code = cleanCode;
    }
  }
}

// Get analytic function options based on data type
function getAnalyticFunctionOptions(dataType: string) {
  if (dataType === DataTypeEnum.STRING) {
    // For STRING, only COUNT makes sense
    return analyticFunctionOptions.value.filter(opt => opt.value === 'COUNT');
  } else if (dataType === DataTypeEnum.DATE) {
    // For DATE, only COUNT, MAX, MIN make sense (no SUM or AVERAGE)
    return analyticFunctionOptions.value.filter(opt => 
      opt.value === 'COUNT' || opt.value === 'MAX' || opt.value === 'MIN'
    );
  }
  // For NUMBER/DECIMAL, all functions are available
  return analyticFunctionOptions.value;
}

// Handle data type change to clear invalid analytic function
function onDataTypeChange(column: any) {
  // Get valid analytic function options for the new data type
  const validOptions = getAnalyticFunctionOptions(column.dataType);
  const validValues = validOptions.map(opt => opt.value);
  
  // If current analyticFunction is not valid for new dataType, clear it
  if (column.analyticFunction && !validValues.includes(column.analyticFunction)) {
    column.analyticFunction = null;
  }
}

// Get data type options based on column type
function getDataTypeOptionsForColumn(columnType: string) {
  if (columnType === ColumnTypeEnum.FORMULA) {
    // For FORMULA columns, only allow number types (INTEGER and DECIMAL)
    return dataTypeOptions.value.filter(opt => 
      opt.value === DataTypeEnum.INTEGER || opt.value === DataTypeEnum.DECIMAL
    );
  }
  // For other column types, return all options
  return dataTypeOptions.value;
}

// Helper methods to display labels
function getColumnTypeLabel(columnType: string) {
  const option = columnTypeOptions.value.find(opt => opt.value === columnType);
  return option ? option.label : columnType;
}

function getDataTypeLabel(dataType: string) {
  const option = dataTypeOptions.value.find(opt => opt.value === dataType);
  return option ? option.label : dataType;
}

// Methods
function onVisibleChange(visible: boolean) {
  emit('update:visible', visible);
  resetFormData();
}

function onCancel() {
  emit('cancel');
  // Reset form when canceling to ensure clean state for next use
  resetFormData();
  onVisibleChange(false);
}

function onSave() {
  // Validate form
  errors.value = {};
  let hasErrors = false;

  if (!localTemplateForm.value.name || localTemplateForm.value.name.trim().length === 0) {
    errors.value.name = t('common.validate.required', { item: t('hrm.salary.salary.templateName') });
    hasErrors = true;
  }

  if (!localTemplateForm.value.type) {
    errors.value.type = t('common.validate.required', { item: t('hrm.salary.salary.templateType') });
    hasErrors = true;
  }

  // Validate columns
  let hasColumnErrors = false;
  localColumns.value.forEach((column, index) => {
    column.errors = {};
    let columnHasErrors = false;

    if (!column.code || column.code.trim().length === 0) {
      column.errors = column.errors || {};
      column.errors.code = t('common.validate.required', { item: t('hrm.salary.salary.columnCode') });
      columnHasErrors = true;
    } else if (!/^[A-Za-z]+$/.test(column.code.trim())) {
      // Add validation error if code contains non-alphabetic characters
      column.errors = column.errors || {};
      column.errors.code = t('common.validate.lettersOnly', { item: t('hrm.salary.salary.columnCode') });
      columnHasErrors = true;
    } else {
      // Check for duplicate column codes within the same template
      const duplicateColumnIndex = localColumns.value.findIndex((col, idx) => 
        col.code === column.code && idx !== index
      );
      if (duplicateColumnIndex !== -1) {
        column.errors = column.errors || {};
        column.errors.code = t('hrm.salary.template.columnCodeDuplicate');
        columnHasErrors = true;
      }
    }

    if (!column.name || column.name.trim().length === 0) {
      column.errors = column.errors || {};
      column.errors.name = t('common.validate.required', { item: t('hrm.salary.salary.columnName') });
      columnHasErrors = true;
    }

    if (!column.columnType) {
      column.errors = column.errors || {};
      column.errors.type = t('common.validate.required', { item: t('hrm.salary.salary.columnType') });
      columnHasErrors = true;
    }

    if (!column.dataType) {
      column.errors = column.errors || {};
      column.errors.dataType = t('common.validate.required', { item: t('hrm.salary.salary.columnDataType') });
      columnHasErrors = true;
    }

    if (columnHasErrors) {
      hasColumnErrors = true;
    }
  });

  if (hasErrors || hasColumnErrors) {
    return;
  }

  // Reset mutation handled flag and set loading state
  mutationHandled = false;
  isLoading.value = true;

  // Prepare template input for GraphQL mutation
  const templateInput = {
    id: props.editingTemplate?.id,
    name: localTemplateForm.value.name,
    description: localTemplateForm.value.description,
    type: localTemplateForm.value.type,
    status: localTemplateForm.value.status,
    columns: localColumns.value.map(column => ({
      id: column.id,
      code: column.code,
      name: column.name,
      columnType: column.columnType,
      columnDataSystem: column.columnDataSystem,
      formula: column.formula,
      dataType: column.dataType,
      analyticFunction: column.analyticFunction,
      isInitData: column.isInitData,
      orderNumber: column.orderNumber,
      status: column.status,
      subColumns: column.subColumns
    }))
  };

  // Call GraphQL mutation to save template
  saveSalaryTemplateMutate({ payload: templateInput });

}

// Function to reset form data to initial state
function resetFormData() {
  localTemplateForm.value = {
    name: '', 
    description: '', 
    type: '',
    status: 'ACTIVE' 
  };
  localColumns.value = [{
    code: '',
    name: '',
    columnType: '',
    columnDataSystem: null,
    dataType: 'STRING',
    analyticFunction: null,
    orderNumber: 1,
    status: 'ACTIVE',
    subColumns: []
  }].sort((a, b) => (a.orderNumber || 0) - (b.orderNumber || 0)); // Sort by orderNumber
  errors.value = {};
}

// Expose methods for parent component
defineExpose({
  resetForm: () => {
    resetFormData();
  }
});
</script>

<style lang="scss" scoped>
.p-invalid {
  border-color: #f44336;
}

.column-card {
  transition: box-shadow 0.3s;
}

.column-card:hover {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

:deep(.p-inputtext) {
  width: 100%;
}

:deep(.p-inputnumber) {
  width: 100%;
}

:deep(.p-dropdown) {
  width: 100%;
}

/* Form field styling */
.form-field {
  margin-bottom: 0.5rem;
}

.form-field .block.font-semibold.mb-2 {
  margin-bottom: 0.5rem;
}

/* DataTable scroll container */
:deep(.p-datatable-wrapper) {
  overflow-x: auto;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .column-card {
    padding: 1rem;
  }
}
</style>