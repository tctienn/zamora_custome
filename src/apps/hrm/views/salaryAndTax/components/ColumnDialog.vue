<template>
  <Dialog
    :draggable='false'
    :header="props.columnId ? t('hrm.salary.salary.editColumn') : t('hrm.salary.salary.createColumn')"
    v-bind='{...DEFAULT_DIALOG_CONFIG,style: {width: "50vw"}}'
    :visible='props.visible'
    @update:visible='onVisibleChange'>
    <div class='grid grid-cols-12'>
      <div class='col-12'>
        <div class='form-field'>
          <label class='block font-semibold mb-2'>{{ t('hrm.salary.salary.columnCode') }} <span class='text-red-500'>*</span></label>
          <InputText 
            v-if='!loading'
            v-model='localColumnForm.code' 
            class='w-full' 
            :class="{ 'p-invalid': errors.code }"
            :placeholder="t('hrm.salary.salary.enterColumnCode')"/>
          <Skeleton
            v-else
            class='w-full'
            height='40px' />
          <small
            v-if='!loading && errors.code'
            class='p-error'>{{ errors.code }}</small>
        </div>
      </div>
      <div class='col-12'>
        <div class='form-field'>
          <label class='block font-semibold mb-2'>{{ t('hrm.salary.salary.columnName') }} <span class='text-red-500'>*</span></label>
          <InputText 
            v-if='!loading'
            v-model='localColumnForm.name' 
            class='w-full' 
            :class="{ 'p-invalid': errors.name }"
            :placeholder="t('hrm.salary.salary.enterColumnName')"/>
          <Skeleton
            v-else
            class='w-full'
            height='40px' />
          <small
            v-if='!loading && errors.name'
            class='p-error'>{{ errors.name }}</small>
        </div>
      </div>
      <div class='col-6'>
        <div class='form-field'>
          <label class='block font-semibold mb-2'>{{ t('hrm.salary.salary.columnType') }}</label>
          <Dropdown 
            v-if='!loading'
            v-model='localColumnForm.columnType'
            class='w-full' 
            option-label='label' 
            option-value='value' 
            :options='columnTypeOptions'
            @change='onColumnTypeChange'/>
          <Skeleton
            v-else
            class='w-full'
            height='40px' />
        </div>
      </div>
      <div class='col-6'>
        <div class='form-field'>
          <label class='block font-semibold mb-2'>{{ t("hrm.salary.salary.dataSource") }}</label>
          <Dropdown
            v-model='localColumnForm.columnDataSystem'
            class='w-full'
            :disabled='!loading && localColumnForm.columnType !== ColumnTypeEnum.FROM_SYSTEM'
            option-label='label'
            option-value='value'
            :options='dataSourceOptions' />

        </div>
      </div>
      <div
        v-if='localColumnForm.columnType === ColumnTypeEnum.FROM_SYSTEM'
        class='col-6'>
        <div class='form-field'>
          <label class='block font-semibold mb-2'>Dữ liệu khởi tạo</label>
          <div class='align-items-center flex'>
            <InputSwitch v-model='localColumnForm.isInitData' />
            <span class='ml-2'>{{ localColumnForm.isInitData ? 'Có' : 'Không' }}</span>
          </div>
        </div>
      </div>
      <div 
        v-if='localColumnForm.columnType === ColumnTypeEnum.FORMULA'
        class='col-12'>
        <div class='form-field'>
          <label class='block font-semibold mb-2'>{{ t('hrm.salary.salary.columnTypes.formula') }}</label>
          <InputText
            v-if='!loading'
            ref='formulaInput'
            v-model='localColumnForm.formula'
            class='w-full'
            :placeholder="t('hrm.salary.salary.formulaExample')"/>
          <Skeleton
            v-else
            class='w-full'
            height='40px' />
          <small class='text-500'>Sử dụng mã cột (code) để tham chiếu. VD: A + B - C</small>
        </div>
      </div>
      <div 
        v-if='localColumnForm.columnType === ColumnTypeEnum.FORMULA'
        class='col-12'>
        <div class='form-field'>
          <label class='block font-semibold mb-2'>{{ t('hrm.salary.columns.availableColumns') }}</label>
          <div class='flex flex-wrap gap-1'>
            <Button
              v-for='col in availableColumnsForFormula'
              :key='col.code'
              class='p-1 w-auto'
              size='small'
              text
              @click='insertToFormula(col.code)'>
              <span class='text-sm'>{{ col.code }} ({{ col.name }})</span>
            </Button>
          </div>
        </div>
      </div>
      <div 
        v-if='localColumnForm.columnType === ColumnTypeEnum.FORMULA'
        class='col-12'>
        <div class='form-field'>
          <label class='block font-semibold mb-2'>{{ t('hrm.salary.columns.operators') }}</label>
          <div class='flex gap-1'>
            <Button
              v-for='operator in operators'
              :key='operator'
              class='p-1 w-auto'
              size='small'
              text
              @click='insertToFormula(operator)'>
              <span class='font-bold text-lg'>{{ operator }}</span>
            </Button>
          </div>
        </div>
      </div>
      <div class='col-6'>
        <div class='form-field'>
          <label class='block font-semibold mb-2'>{{ t('hrm.salary.salary.columnDataType') }}</label>
          <Dropdown 
            v-if='!loading'
            v-model='localColumnForm.dataType'
            class='w-full' 
            option-label='label' 
            option-value='value' 
            :options='getDataTypeOptionsForColumn(localColumnForm.columnType)'
            @change='onDataTypeChange'/>
          <Skeleton
            v-else
            class='w-full'
            height='40px' />
        </div>
      </div>
      <div class='col-6'>
        <div class='form-field'>
          <label class='block font-semibold mb-2'>{{ t('hrm.salary.salary.analyticFunction') }}</label>
          <Dropdown 
            v-if='!loading'
            v-model='localColumnForm.analyticFunction'
            class='w-full'
            option-label='label'
            option-value='value'
            :options='getAnalyticFunctionOptions(localColumnForm.dataType)'
            show-clear/>
          <Skeleton
            v-else
            class='w-full'
            height='40px' />
        </div>
      </div>
      <div class='col-6'>
        <div class='form-field'>
          <label class='block font-semibold mb-2'>{{ t('hrm.salary.salary.columnOrderNumber') }}</label>
          <InputNumber 
            v-if='!loading'
            v-model='localColumnForm.orderNumber'
            class='w-full'
            :min='1'
            :use-grouping='false'/>
          <Skeleton
            v-else
            class='w-full'
            height='40px' />
        </div>
      </div>

      <!--      <div class='col-12'>-->
      <!--        <div class='form-field'>-->
      <!--          <label class='block font-semibold mb-2'>{{ t('hrm.salary.salary.columnData') }}</label>-->
      <!--          <InputText -->
      <!--            v-if='!loading'-->
      <!--            v-model='localColumnForm.data' -->
      <!--            class='w-full' -->
      <!--            :placeholder="t('hrm.salary.salary.enterColumnData')"/>-->
      <!--          <Skeleton v-else class="w-full" height="40px" />-->
      <!--        </div>-->
      <!--      </div>-->
      <div class='col-6'>
        <div class='form-field'>
          <label class='block font-semibold mb-2'>{{ t('common.status') }}</label>
          <Dropdown 
            v-if='!loading'
            v-model='localColumnForm.status' 
            class='w-full' 
            option-label='label' 
            option-value='value' 
            :options='statusOptions'/>
          <Skeleton
            v-else
            class='w-full'
            height='40px' />
        </div>
      </div>
      
      <!-- Sub-columns selection -->
      <div class='col-12'>
        <div class='form-field'>
          <label class='block font-semibold mb-2'>{{ t('hrm.salary.salary.subColumns') }}</label>
          <MultiSelect
            v-model='selectedSubColumns'
            class='w-full'
            display='chip'
            option-label='name'
            option-value='id'
            :options='availableSubColumns'/>
        </div>
      </div>
    </div>
    <template #footer>
      <div class='flex gap-2 justify-content-end'>
        <Button 
          class='border-round-sm'
          icon='pi pi-times'
          :label="t('common.cancel')" 
          severity='danger'
          @click='onCancel'/>
        <Button
          class='border-round-sm'
          :disabled='!isFormValid || loading' 
          icon='pi pi-check'
          :label="t('common.save')" 
          :loading='loading'
          @click='onSave'/>
      </div>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import Dropdown from 'primevue/dropdown';
import InputNumber from 'primevue/inputnumber';
import InputSwitch from 'primevue/inputswitch';
import InputText from 'primevue/inputtext';
import MultiSelect from 'primevue/multiselect';
import Skeleton from 'primevue/skeleton';
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { getColumnTemplateById } from '@/apps/hrm/api/graphql/salary';
import { ColumnTypeEnum, DataSystemEnum, DataTypeEnum } from '@/apps/hrm/model/salary';
import { DEFAULT_DIALOG_CONFIG } from '@/common/constants';

interface ColumnForm {
  id?: string;
  code: string;
  name: string;
  columnType: string;
  dataType: string;
  analyticFunction?: string | null;
  columnDataSystem: string;
  orderNumber: number;
  data: string;
  status: string;
  formula?: string;
  subColumns?: string[];
  isInitData?: boolean;
}

interface DataTypeOption {
  label: string;
  value: string;
}

interface AnalyticFunctionOption {
  label: string;
  value: string;
}

interface StatusOption {
  label: string;
  value: string;
}

interface ColumnTypeOption {
  label: string;
  value: string;
}

interface Props {
  visible: boolean;
  columnId?: string;
  templateColumns?: any[]; // Array of template columns to populate sub-column options
}

interface Emits {
  (e: 'update:visible', value: boolean): void;
  (e: 'save', column: ColumnForm): void;
  (e: 'cancel'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const { t } = useI18n();

// Loading state
const loading = ref(false);

// Ref for formula input
const formulaInput = ref<any>(null);

// Available sub-columns options (excludes current column being edited)
const availableSubColumns = ref<any[]>([]);

// Reactive variable to hold selected sub-columns (full objects) (for the MultiSelect)
const selectedSubColumns = ref<any[]>([]);

// Operators for formula
const operators = ref<string[]>(['+', '-', '*', '/', '(', ')']);

// Available columns for formula (excludes current column)
const availableColumnsForFormula = computed(() => {
  if (props.templateColumns) {
    let currentColumnCode: string | null = null;
    if (props.columnId && props.templateColumns.length > 0) {
      const currentColumn = props.templateColumns.find(col => col.id === props.columnId && col.dataType === DataTypeEnum.INTEGER);
      currentColumnCode = currentColumn ? currentColumn.code : null;
    } else if (localColumnForm.value.code) {
      currentColumnCode = localColumnForm.value.code;
    }
    
    return props.templateColumns
      .filter(col => col.code !== currentColumnCode)
      .map(col => ({
        code: col.code,
        name: col.name,
        id: col.id
      }));
  }
  return [];
});

// Local form data
const localColumnForm = ref<ColumnForm>({
  code: '',
  name: '',
  dataType: 'STRING',
  columnDataSystem: '',
  columnType: '',
  analyticFunction: null,
  orderNumber: 1,
  data: '',
  status: 'ACTIVE',
  formula: '',
  subColumns: [],
  isInitData: false
});
const dataSourceOptions = ref<any[]>([]);

// Function to load data source options from API
async function loadDataSourceOptions() {
  // Mock data - in a real implementation, this would fetch from an API
  const mockDataSourceOptions = [
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

  dataSourceOptions.value = mockDataSourceOptions;
}

// Form errors
const errors = ref<Record<string, string>>({});

// Status options
const statusOptions = computed<StatusOption[]>(() => [
  {
    label: t('common.statuses.active'),
    value: 'ACTIVE'
  },
  {
    label: t('common.statuses.deactivate'),
    value: 'INACTIVE'
  }
]);

// Column type options
const columnTypeOptions = computed<ColumnTypeOption[]>(() => [
  {
    label: 'Dữ liệu hệ thống',
    value: ColumnTypeEnum.FROM_SYSTEM
  },
  {
    label: 'Nhập liệu',
    value: ColumnTypeEnum.MANUALLY_ENTERED
  },
  {
    label: 'Gán công thức',
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
  }
]);

// Get data type options based on column type
function getDataTypeOptionsForColumn(columnType: string) {
  if (columnType === ColumnTypeEnum.FORMULA) {
    // For FORMULA, only NUMBER and DECIMAL are allowed
    return dataTypeOptions.value.filter(opt => 
      opt.value === DataTypeEnum.INTEGER || opt.value === DataTypeEnum.DECIMAL
    );
  }
  // For other types, all data types are available
  return dataTypeOptions.value;
}

// Handle column type change to auto-set dataType
function onColumnTypeChange() {
  if (localColumnForm.value.columnType === ColumnTypeEnum.FORMULA) {
    // Auto-set to INTEGER for FORMULA
    localColumnForm.value.dataType = DataTypeEnum.INTEGER;
  } else if (localColumnForm.value.columnType === ColumnTypeEnum.MANUALLY_ENTERED) {
    // Auto-set to STRING for MANUALLY_ENTERED
    localColumnForm.value.dataType = DataTypeEnum.STRING;
  }
  // Clear formula if not FORMULA type
  if (localColumnForm.value.columnType !== ColumnTypeEnum.FORMULA) {
    localColumnForm.value.formula = '';
  }
  // Clear columnDataSystem if not FROM_SYSTEM
  if (localColumnForm.value.columnType !== ColumnTypeEnum.FROM_SYSTEM) {
    localColumnForm.value.columnDataSystem = '';
  }
  // Trigger dataType change validation
  onDataTypeChange();
}

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

// Get analytic function options based on data type
function getAnalyticFunctionOptions(dataType: string) {
  if (dataType === 'STRING') {
    // For STRING, only COUNT makes sense
    return analyticFunctionOptions.value.filter(opt => opt.value === 'COUNT');
  } else if (dataType === 'DATE') {
    // For DATE, only COUNT, MAX, MIN make sense (no SUM or AVERAGE)
    return analyticFunctionOptions.value.filter(opt => 
      opt.value === 'COUNT' || opt.value === 'MAX' || opt.value === 'MIN'
    );
  }
  // For NUMBER/DECIMAL, all functions are available
  return analyticFunctionOptions.value;
}

// Handle data type change to clear invalid analytic function
function onDataTypeChange() {
  // Get valid analytic function options for the new data type
  const validOptions = getAnalyticFunctionOptions(localColumnForm.value.dataType);
  const validValues = validOptions.map(opt => opt.value);
  
  // If current analyticFunction is not valid for new dataType, clear it
  if (localColumnForm.value.analyticFunction && !validValues.includes(localColumnForm.value.analyticFunction)) {
    localColumnForm.value.analyticFunction = null;
  }
}

// Form validation
const isFormValid = computed(() => {
  return localColumnForm.value.code && localColumnForm.value.code.trim().length > 0
         && localColumnForm.value.name && localColumnForm.value.name.trim().length > 0;
});

// Initialize form data based on props
// Watch for changes in visible prop
watch(() => props.visible, async (newVisible) => {
  if (newVisible) {
    // Reset form when dialog opens
    errors.value = {};
    
    if (props.columnId) {
      // Loading existing column data
      loading.value = true;
      try {
        const { onResult, onError } = getColumnTemplateById(props.columnId);
        
        onResult((result) => {
          if (result.data && result.data.findColumnTemplateById) {
            const columnData = result.data.findColumnTemplateById;
            localColumnForm.value = {
              id: columnData.id,
              code: columnData.code || '',
              name: columnData.name || '',
              columnType: columnData.columnType,
              columnDataSystem: columnData.columnDataSystem || '',
              dataType: columnData.dataType || '',
              analyticFunction: columnData.analyticFunction || null,
              orderNumber: columnData.orderNumber || 1,
              data: '', // Not in the schema
              status: columnData.status || 'ACTIVE',
              formula: columnData.formula || '',
              subColumns: columnData.subColumns || [], // Load subColumns if available
              isInitData: columnData.isInitData || false
            };
            // Initialize selected sub-columns with full objects
            selectedSubColumns.value = localColumnForm.value.subColumns || [];
          }
          loading.value = false;
          // Update available sub-columns after loading column data
          updateAvailableSubColumns();
        });
        
        onError((error) => {
          loading.value = false;
        });
      } catch (error) {
        loading.value = false;
      }
    } else {
      // Initialize with empty form for creating new column
      localColumnForm.value = { 
        code: '', 
        name: '', 
        columnType: '',
        dataType: 'STRING',
        columnDataSystem: '',
        analyticFunction: null,
        orderNumber: 1,
        data: '', 
        status: 'ACTIVE',
        formula: '',
        subColumns: [],
        isInitData: false
      };
      // Initialize selected sub-columns
      selectedSubColumns.value = [];
      loading.value = false;
      // Update available sub-columns for new column
      updateAvailableSubColumns();
    }
  }
}, { immediate: true });

// Watch for changes in templateColumns prop separately to update available sub-columns
watch(() => props.templateColumns, () => {
  updateAvailableSubColumns();
}, { immediate: true });

// Watch for changes in selectedSubColumns to keep form's subColumns in sync in real-time
watch(selectedSubColumns, (newSubColumns) => {
  localColumnForm.value.subColumns = newSubColumns || [];
}, { deep: true });

// Function to update available sub-columns based on template columns
function updateAvailableSubColumns() {
  if (props.templateColumns) {
    // Find the column being edited by ID to get its code for exclusion
    let currentColumnCode: string | null = null;
    if (props.columnId && props.templateColumns.length > 0) {
      const currentColumn = props.templateColumns.find(col => col.id === props.columnId);
      currentColumnCode = currentColumn ? currentColumn.code : null;
    } else if (localColumnForm.value.code) {
      // If we don't have the ID matched column, fall back to the form's code
      currentColumnCode = localColumnForm.value.code;
    }
    
    availableSubColumns.value = props.templateColumns
      .filter(col => col.code !== currentColumnCode) // Exclude current column being edited
      .map(col => ({
        code: col.code,
        name: col.name,
        id: col.id
      }));
  } else {
    availableSubColumns.value = [];
  }
  loadDataSourceOptions();
}

// Methods
function onVisibleChange(visible: boolean) {
  emit('update:visible', visible);
}

function onCancel() {
  emit('cancel');
}

// Function to insert column code or operator to formula
function insertToFormula(text: string) {
  if (!formulaInput.value) {
    // If input is not focused, just append to the end with space
    const currentFormula = localColumnForm.value.formula || '';
    const needsSpace = currentFormula.length > 0 && !currentFormula.endsWith(' ');
    localColumnForm.value.formula = currentFormula + (needsSpace ? ' ' : '') + text + ' ';
    return;
  }
  
  const input = formulaInput.value.$el as HTMLInputElement;
  const start = input.selectionStart || 0;
  const end = input.selectionEnd || 0;
  const currentFormula = localColumnForm.value.formula || '';
  
  // Add space before if needed
  const beforeText = currentFormula.substring(0, start);
  const needsSpaceBefore = beforeText.length > 0 && !beforeText.endsWith(' ');
  const textToInsert = (needsSpaceBefore ? ' ' : '') + text + ' ';
  
  // Insert text at cursor position with spacing
  const newFormula = currentFormula.substring(0, start) + textToInsert + currentFormula.substring(end);
  localColumnForm.value.formula = newFormula;
  
  // Set cursor position after inserted text
  setTimeout(() => {
    const newPosition = start + textToInsert.length;
    input.setSelectionRange(newPosition, newPosition);
    input.focus();
  }, 0);
}

function onSave() {
  // Validate form
  errors.value = {};
  let hasErrors = false;
  
  if (!localColumnForm.value.code || localColumnForm.value.code.trim().length === 0) {
    errors.value.code = t('common.validate.required', { item: t('hrm.salary.salary.columnCode') });
    hasErrors = true;
  }
  
  if (!localColumnForm.value.name || localColumnForm.value.name.trim().length === 0) {
    errors.value.name = t('common.validate.required', { item: t('hrm.salary.salary.columnName') });
    hasErrors = true;
  }
  
  if (hasErrors) {
    return;
  }

  emit('save', localColumnForm.value);
}

// Expose methods for parent component
defineExpose({
  resetForm: () => {
    localColumnForm.value = { 
      code: '', 
      name: '', 
      columnType: '',
      dataType: '',
      columnDataSystem: '',
      analyticFunction: null,
      subColumns: [],
      orderNumber: 1,
      data: '', 
      status: 'ACTIVE',
      formula: '',
      isInitData: false
    };
    errors.value = {};
  }
});
</script>

<style scoped>
.p-invalid {
  border-color: #f44336;
}

/* Form field styling to match TemplateSidebar */
.form-field {
  margin-bottom: 0.5rem;
}

.form-field .block.font-semibold.mb-2 {
  margin-bottom: 0.5rem;
}

/* Responsive grid padding */
[class*="col-"] {
  padding: 10px 5px;
  box-sizing: border-box;
}

/* Footer button container */
:deep(.p-dialog-footer) {
  display: flex;
  justify-content: end;
  gap: 0.5rem;
}
</style>