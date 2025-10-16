<template>
  <DataTable
    v-if='localData.length > 0'
    edit-mode='cell'
    group-rows-by='organizationName'
    :paginator='false'
    :pt="{
      table: { style: 'min-width: 50rem' },
      wrapper: {
        style: 'padding-bottom: 30px'
      },
      column: {
        bodyCell: bodyCellFunc
      }
    }"
    :row-class='getRowClass'
    row-group-mode='subheader'
    :scroll-height='`calc(100vh - 250px)`'
    scrollable
    selection-mode='single'
    :show-gridlines='true'
    table-style='min-width: 50rem; width: max-content;'
    :value='localDisplayData'
    @cell-edit-complete='onCellEditComplete($event)'
    @row-click='onRowClick'>
    <template #groupheader='slotProps'>
      <span
        class='font-bold line-height-3 ml-2 vertical-align-middle'
        style='color: #0F6CBD'>
        {{ slotProps.data.organizationName }}
      </span>
    </template>

    <ColumnGroup type='header'>
      <Row>
        <Column
          align-frozen='left'
          frozen
          header='STT'
          :rowspan='2'
          :style="{ 'width': '50px' }"/>
        <template
          v-for='col in localColumns'
          :key='col.id'>
          <template v-if='col.subColumns && col.subColumns.length > 0'>
            <Column
              :colspan='col.subColumns.length'
              :header='col.name'
              :style="{ 'width': '150px', 'max-width': '150px' }"/>
          </template>
          <template v-else>
            <Column
              align-frozen='left'
              :frozen='col.columnType === ColumnTypeEnum.FROM_SYSTEM && col.columnDataSystem === DataSystemEnum.FULL_NAME'
              :header='col.name'
              :rowspan='2'
              :style="{ 'width': '150px' }"/>
          </template>
        </template>
      </Row>
      <Row>
        <template
          v-for='col in localColumns'
          :key='col.id'>
          <template v-if='col.subColumns && col.subColumns.length > 0'>
            <template
              v-for='subCol in col.subColumns'
              :key='subCol.code'>
              <Column
                :header='subCol.name'
                :style="{ 'min-width': '150px', 'max-width': '150px' }"/>
            </template>
          </template>
        </template>
      </Row>
    </ColumnGroup>

    <Column
      align-frozen='left'
      field='stt'
      frozen
      header='STT'
      :style="{ 'min-width': '50px', 'max-width': '50px', 'text-align': 'center' }">
      <template #body='{ data, index }'>
        <span v-if='!data.isTotalRow'>{{ calculateSTT(index) }}</span>
      </template>
    </Column>

    <template
      v-for='col in localColumns'
      :key='col.id'>
      <template v-if='!col.subColumns || col.subColumns.length === 0'>
        <Column
          align-frozen='left'
          :field='col.code'
          :frozen='col.columnType === ColumnTypeEnum.FROM_SYSTEM && col.columnDataSystem === DataSystemEnum.FULL_NAME'
          :header='col.name'
          :style="{ 'width': '150px', 'max-width': '150px' }">
          <template #body='{ data, field }'>
            <p
              class='mb-0'
              :class="{ 'float-right': col.dataType === DataTypeEnum.INTEGER || col.dataType === DataTypeEnum.DECIMAL || col.columnType === ColumnTypeEnum.FORMULA }">
              <template v-if='col.columnType === ColumnTypeEnum.FORMULA && col.formula'>
                {{ col.dataType === DataTypeEnum.INTEGER ? formatNumber(calculateFormulaResult(col.formula, data)) : calculateFormulaResult(col.formula, data) }}
              </template>
              <template v-else>
                {{ col.dataType === DataTypeEnum.INTEGER ? formatNumber(data[field]) : data[field] }}
              </template>
            </p>
          </template>
          <template
            v-if='col.columnType !== ColumnTypeEnum.FROM_SYSTEM'
            #editor='{ data, field }'>
            <InputText
              v-if='col.dataType===DataTypeEnum.STRING'
              v-model='data[field]'
              autofocus
              class='excel-input p-inputtext-sm w-full'>
            </InputText>
            <InputNumber
              v-if='col.dataType===DataTypeEnum.INTEGER'
              v-model.number='data[field]'
              autofocus
              class='excel-input p-inputtext-sm w-full'></InputNumber>
            <InputNumber
              v-if='col.dataType=== DataTypeEnum.DECIMAL'
              v-model.number='data[field]'
              autofocus
              class='excel-input p-inputtext-sm w-full'
              locale='vi-VN'
              :max-fraction-digits='2'
              :min-fraction-digits='0'
              mode='decimal'
              :step='0.1'
              :use-grouping='false'></InputNumber>
            <Calendar
              v-if="col.dataType==='DATE'"
              id='date'
              v-model='data[field]'
              autofocus
              class='align-self-start flex-1'
              show-button-bar
              show-icon/>
          </template>
        </Column>
      </template>
      <template v-else>
        <template
          v-for='subCol in col.subColumns'
          :key='subCol.code'>
          <Column
            align-frozen='left'
            :editable='subCol.columnType !== ColumnTypeEnum.FROM_SYSTEM'
            :field='subCol.code'
            :frozen='subCol.columnType === ColumnTypeEnum.FROM_SYSTEM && subCol.columnDataSystem === DataSystemEnum.FULL_NAME'
            :style="{ 'min-width': '150px', 'max-width': '150px' }">
            <template #body='{ data, field }'>
              <p
                class='mb-0'
                :class="{ 'float-right': subCol.dataType === DataTypeEnum.INTEGER }">
                <template v-if='subCol.columnType === ColumnTypeEnum.FORMULA && subCol.formula'>
                  {{ subCol.dataType === DataTypeEnum.INTEGER ? formatNumber(calculateFormulaResult(subCol.formula, data)) : calculateFormulaResult(subCol.formula, data) }}
                </template>
                <template v-else>
                  {{ subCol.dataType === DataTypeEnum.INTEGER ? formatNumber(data[field]) : data[field] }}
                </template>
              </p>
            </template>
            <template
              v-if='subCol.columnType !== ColumnTypeEnum.FROM_SYSTEM'
              #editor='{ data, field }'>
              <p v-if='data.isTotalRow'>{{data[field]}}</p>
              <template v-else>
                <InputText
                  v-if='subCol.dataType===DataTypeEnum.STRING'
                  v-model='data[field]'
                  autofocus
                  class='excel-input p-inputtext-sm w-full'>
                </InputText>
                <InputNumber
                  v-if='subCol.dataType===DataTypeEnum.INTEGER'
                  v-model.number='data[field]'
                  autofocus
                  class='excel-input p-inputtext-sm w-full'></InputNumber>
                <InputNumber
                  v-if='subCol.dataType=== DataTypeEnum.DECIMAL'
                  v-model.number='data[field]'
                  autofocus
                  class='excel-input p-inputtext-sm w-full'
                  locale='vi-VN'
                  :max-fraction-digits='2'
                  :min-fraction-digits='0'
                  mode='decimal'
                  :step='0.1'
                  :use-grouping='false'></InputNumber>
                <Calendar
                  v-if='subCol.dataType===DataTypeEnum.DATE'
                  id='date'
                  v-model='data[field]'
                  autofocus
                  class='align-self-start flex-1'
                  show-button-bar
                  show-icon/>
              </template>
            </template>
          </Column>
        </template>
      </template>
    </template>
  </DataTable>
  <div
    v-else
    class='p-4 text-center text-gray-500'>
    {{ t('hrm.salary.salary.noTemplateFound') }}
  </div>
</template>

<script setup lang="ts">

import { evaluate } from 'mathjs';
import type { ColumnState } from 'primevue/column';
import { ref, watch, watchEffect } from 'vue';
import { useI18n } from 'vue-i18n';

import {
  ColumnTypeEnum,
  DataSystemEnum,
  DataTypeEnum,
  type EmployeePayslipColumn,
  type EmployeePayslipRow
} from '@/apps/hrm/model/salary';

interface Props {
  data: EmployeePayslipRow[];
  columns: EmployeePayslipColumn[];
  type: 'calculation' | 'payment'; // Type để phân biệt giữa bảng tính lương và bảng thanh toán
}

const props = defineProps<Props>();
// Define emits để truyền các sự kiện và dữ liệu ra ngoài
const emit = defineEmits<{
  cellEditComplete: [event: any];
  rowClick: [event: any];
  updateCells: [cells: any[]];
}>();

const { t } = useI18n();

// Helper function to get field value from data (supports both old and new structure)
const getFieldValue = (data: any, field: string) => {
  if (data.value && typeof data.value === 'object') {
    return data.value[field];
  }
  return data[field];
};

// Helper function to set field value in data (supports both old and new structure)
const setFieldValue = (data: any, field: string, value: any) => {
  if (data.value && typeof data.value === 'object') {
    data.value[field] = value;
  } else {
    data[field] = value;
  }
};

// State cho dữ liệu và cột
const localData = ref<any[]>([]);
const localColumns = ref<any[]>([]);

// State cho các ô đã chỉnh sửa tạm thời
const cells = ref<any[]>([]);
const selectedRow = ref<any>(null);

// Cập nhật dữ liệu và cột khi props thay đổi
watch(() => props.data, (newData) => {
  localData.value = JSON.parse(JSON.stringify(newData));
}, { deep: true });

watch(() => props.columns, (newColumns) => {
  localColumns.value = [...newColumns];
}, { deep: true });

const localDisplayData = ref<any[]>([]);

watchEffect(() => {
  localDisplayData.value = processDisplayData();
});

function processDisplayData(): EmployeePayslipRow[] {
  // Handle empty or invalid data
  if (!props.data || props.data.length === 0) {
    return [];
  }

  // Create a deep copy of data and flatten value object if exists
  const displayData = localData.value.map(row => {
    if (row.value && typeof row.value === 'object') {
      // Flatten the value object into the row
      return {
        ...row,
        ...row.value
      };
    }
    return { ...row };
  });

  // Apply temporary cell changes
  applyCellChanges(displayData);

  // Calculate formulas if any
  const formulaColumns = getFormulaColumns();
  if (formulaColumns.size > 0) {
    calculateFormulas(displayData, formulaColumns);
  }

  // Calculate totals if needed
  const totalColumnCodes = getTotalColumnCodes();
  if (totalColumnCodes.size > 0 && hasTotalColumnChange(totalColumnCodes)) {
    calculateTotals(displayData, totalColumnCodes);
  }

  return displayData;
}

function applyCellChanges(displayData: EmployeePayslipRow[]): void {
  for (const change of cells.value) {
    const rowIndex = displayData.findIndex(row => row.employeeId === change.employeeId);
    if (rowIndex !== -1) {
      setFieldValue(displayData[rowIndex], change.columnId, change.newValue);
    }
  }
}

function getFormulaColumns(): Map<string, string> {
  const formulaColumns = new Map<string, string>();

  for (const col of localColumns.value) {
    if (col.columnType === ColumnTypeEnum.FORMULA) {
      formulaColumns.set(col.code, col.formula);
    }
    if (col.subColumns?.length) {
      for (const subCol of col.subColumns) {
        if (subCol.columnType === ColumnTypeEnum.FORMULA) {
          formulaColumns.set(subCol.code, subCol.formula);
        }
      }
    }
  }

  return formulaColumns;
}

function calculateFormulas(displayData: EmployeePayslipRow[], formulaColumns: Map<string, string>): void {
  for (const row of displayData) {
    if (row.isTotalRow || row.isGroupTotal || row.isOverallTotal) {
      continue;
    }
    for (const [columnCode, formula] of formulaColumns) {
      try {
        setFieldValue(row, columnCode, calculateFormulaResult(formula, row));
      } catch (error) {
        console.error(`Error calculating formula for column ${columnCode}:`, error);
        setFieldValue(row, columnCode, null);
      }
    }
  }
}

function getTotalColumnCodes(): Set<string> {
  const totalColumnCodes = new Set<string>();

  for (const col of localColumns.value) {
    if (col.isTotal) {
      totalColumnCodes.add(col.code);
    }
    if (col.subColumns?.length) {
      for (const subCol of col.subColumns) {
        if (subCol.isTotal) {
          totalColumnCodes.add(subCol.code);
        }
      }
    }
  }

  return totalColumnCodes;
}

function hasTotalColumnChange(totalColumnCodes: Set<string>): boolean {
  return cells.value.some(change => totalColumnCodes.has(change.columnId));
}

function calculateTotals(displayData: EmployeePayslipRow[], totalColumnCodes: Set<string>): void {
  const groupedData = new Map<string, EmployeePayslipRow[]>();
  const totalRows: EmployeePayslipRow[] = [];

  // Group data and collect total rows
  for (const row of displayData) {
    if (row.isTotalRow) {
      totalRows.push(row);
    } else {
      const orgName = row.organizationName;
      if (!groupedData.has(orgName)) {
        groupedData.set(orgName, []);
      }
      groupedData.get(orgName)?.push(row);
    }
  }

  // Calculate group totals
  for (const [orgName, rows] of groupedData) {
    const groupTotalRowIndex = displayData.findIndex(
      row => row.isGroupTotal && row.organizationName === orgName
    );

    if (groupTotalRowIndex !== -1) {
      const groupTotalRow = displayData[groupTotalRowIndex];
      for (const colCode of totalColumnCodes) {
        setFieldValue(groupTotalRow, colCode, calculateColumnTotal(rows, colCode));
      }
    }
  }

  // Calculate overall total
  const overallTotalRowIndex = displayData.findIndex(row => row.isOverallTotal);
  if (overallTotalRowIndex !== -1) {
    const overallTotalRow = displayData[overallTotalRowIndex];
    for (const colCode of totalColumnCodes) {
      setFieldValue(overallTotalRow, colCode, calculateColumnTotal(
        displayData.filter(row => !row.isTotalRow),
        colCode
      ));
    }
  }
}

function calculateColumnTotal(rows: EmployeePayslipRow[], colCode: string): number {
  let total = 0;
  for (const row of rows) {
    const value = getFieldValue(row, colCode);
    if (typeof value === 'number') {
      total += value;
    } else if (typeof value === 'string' && !isNaN(parseFloat(value))) {
      total += parseFloat(value);
    }
  }
  return total;
}

// Function to format numbers
const formatNumber = (value: any): string => {
  if (value === null || value === undefined || value === '') {
    return '';
  }
  
  // If it's a string and can be converted to number
  if (typeof value === 'string' && !isNaN(parseFloat(value))) {
    return parseFloat(value).toLocaleString('vi-VN');
  }
  
  // If it's a number
  if (typeof value === 'number') {
    return value.toLocaleString('vi-VN');
  }
  
  // If it's not a number, return the original value
  return value.toString();
};

// Function to calculate STT by counting non-total rows
const calculateSTT = (currentIndex: number): number => {
  let sttCount = 0;
  for (let i = 0; i <= currentIndex; i++) {
    if (localDisplayData.value[i] && !localDisplayData.value[i].isTotalRow) {
      sttCount++;
    }
  }
  return sttCount;
};

function updateTotal(field: string, index?: number): void {
  const normalizedField = field;

  // Get total column codes to check if this field should be totaled
  const totalColumnCodes = getTotalColumnCodes();
  
  // Only calculate total if this field is marked as isTotal
  if (!totalColumnCodes.has(normalizedField)) {
    return;
  }

  // Tính tổng cho cột thường
  const sum = localDisplayData.value
    .filter((p) => !p.isTotalRow && !p.isGroupTotal && !p.isOverallTotal)
    .reduce((acc, p) => acc + (Number(p[field]) || 0), 0);

  const groupTotalItem = localDisplayData.value.find(
    (p) => p.isTotalRow && p.isGroupTotal
  );
  const overallTotalItem = localDisplayData.value.find(
    (p) => p.isTotalRow && p.isOverallTotal
  );

  // Map công thức (key: field, value: formula string)
  const formulaColumns = getFormulaColumns();

  // Nếu field này có công thức → tính lại theo công thức
  if (formulaColumns.has(normalizedField)) {
    const formula = formulaColumns.get(normalizedField) || '';

    if (groupTotalItem) {
      groupTotalItem[field] = calculateFormulaResult(formula, groupTotalItem);
    }
    if (overallTotalItem) {
      overallTotalItem[field] = calculateFormulaResult(formula, overallTotalItem);
    }
  } else {
    // Nếu không phải công thức → cập nhật sum bình thường
    if (groupTotalItem) {
      groupTotalItem[field] = sum;
    }
    if (overallTotalItem) {
      overallTotalItem[field] = sum;
    }

  }
}

// Function to handle cell edit completion events
const onCellEditComplete = (event: any) => {
  const { data, newValue, field, index } = event;
  if (data.isTotalRow) {
    // Không cho edit dòng tổng
    return;
  }

  if (!data.isGroupTotal && !data.isOverallTotal) {
    // Dòng thường - kiểm tra dataType của column để xử lý đúng
    let columnDef = null;
    
    // Tìm column definition (main column hoặc subColumn)
    for (const col of localColumns.value) {
      if (col.code === field) {
        columnDef = col;
        break;
      }
      // Check subColumns
      if (col.subColumns?.length) {
        const subCol = col.subColumns.find((sc: any) => sc.code === field);
        if (subCol) {
          columnDef = subCol;
          break;
        }
      }
    }
    
    // Apply value based on dataType
    if (columnDef && columnDef.dataType === DataTypeEnum.INTEGER) {
      const parsed = parseFloat(newValue);
      data[field] = isNaN(parsed) ? 0 : parsed;
    } else {
      // STRING or other types - keep original value
      data[field] = newValue;
    }
  } else {
    // Dòng đặc biệt (nếu cần cho phép edit vài field riêng)
    data[field] = newValue;
  }

  updateTotal(field, index);
  
  // Emit event to parent component
  emit('cellEditComplete', event);
};

// Function to get row class based on selection and row type
const getRowClass = (rowData: any) => {
  const classes = [];

  // Add selected row class if this row is selected
  if (selectedRow.value && selectedRow.value.employeeId === rowData.employeeId) {
    classes.push('selected-row');
  }

  // Add font-bold class for total rows
  if (rowData.isTotalRow) {
    classes.push('font-bold');
  }

  return classes.join(' ');
};

// Function to handle row click events
const onRowClick = (event: any) => {
  const rowData = event.data;
  // Don't handle clicks for total rows
  if (rowData.isTotalRow) {
    return;
  }

  // Set the selected row
  selectedRow.value = rowData;

  // Emit the row click event to parent component
  emit('rowClick', event);
};

// Function to handle row click events
const bodyCellFunc = (e: { state: ColumnState }) => ({ class: { 'pt-0 pb-0': e.state['d_editing'] } });

function calculateFormulaResult(formulaData: string, rowData: EmployeePayslipRow): any {
  if (!formulaData) {
    return null;
  }
  const formula = formulaData.trim();
  try {
    const expression = formula.startsWith('=') ? formula.substring(1).trim() : formula;
    const scope: { [key: string]: number } = {};
    
    // Get the data source (either rowData.value or rowData itself)
    const dataSource = (rowData as any).value && typeof (rowData as any).value === 'object' 
      ? (rowData as any).value 
      : rowData;
    
    for (const [key, value] of Object.entries(dataSource)) {
      let numericValue: number;
      if (value === null || value === undefined) {
        numericValue = 0;
      } else if (typeof value === 'number') {
        numericValue = value;
      } else if (typeof value === 'string' && !isNaN(parseFloat(value))) {
        numericValue = parseFloat(value);
      } else {
        numericValue = 0;
      }

      scope[key] = numericValue;
    }

    const symbols = expression.match(/[a-zA-Z]+\d*/g) || [];
    const undefinedSymbols = symbols.filter(symbol => !(symbol in scope));
    if (undefinedSymbols.length > 0) {
      for (const symbol of undefinedSymbols) {
        scope[symbol] = 0;
      }
    }

    const result = evaluate(expression, scope);
    return typeof result === 'number' ? result : 0;
  } catch (error) {
    console.error('Error calculating formula:', formula, 'Error:', error);
    return 0;
  }
}

watch(cells, (newCells) => {
  emit('updateCells', [...newCells]);
}, { deep: true });

</script>

<style scoped>
.float-right {
  text-align: right;
}
:deep(.p-inputtext) {
  width: 120px;
}

:deep(.selected-row) {
  background-color: #e3f2fd !important;
}

.selected-row:hover {
  background-color: #E5F3FF !important;
}

.font-bold {
  font-weight: bold !important;
}

.font-bold td {
  font-weight: bold !important;
  background-color: #f5f5f5 !important;
  border-top: 2px solid #ddd !important;
  border-bottom: 2px solid #ddd !important;
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
  padding: 0;
}
</style>