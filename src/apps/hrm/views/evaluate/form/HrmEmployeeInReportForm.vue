<template>
  <DataTable
    class='p-datatable-gridlines p-datatable-lg w-full'
    edit-mode='cell'
    :pt='{
      column: {
        bodyCell: bodyCellFunc
      }
    }'
    :value='employeesValue'
    @cell-edit-complete='onCellEditComplete'>
    <Column
      class='px-2 text-center'
      header='STT'
      style='width: 2%'>
      <template #body='slotProps'>
        <div
          class='align-items-center flex items-center justify-content-center'>
          {{ slotProps.index + 1 }}
        </div>
      </template>
    </Column>
    <Column
      class='w-30rem'
      field='type'
      :header='t("hrm.evaluate.general.fullName")'
      :pt='{
        headerContent: {
          class: "justify-content-start"
        }
      }'>
      <template #body='{ data }'>
        {{ data.employeeName }}
      </template>
    </Column>
    <Column
      class='w-30rem'
      field='jobPositionCode'
      :header='t("hrm.evaluate.general.jobPositionCode")'
      :pt='{
        headerContent: {
          class: "justify-content-start"
        }
      }'>
      <template #editor='{data, field}'>
        <div class='select-position'>
          <Dropdown
            v-model='data[field]'
            autofocus
            class='custom-dropdown w-full'
            filter
            option-label='value'
            option-value='id'
            :options='jobPosition'
            @update:model-value="(val: string) => {
              const found = jobPosition.find(p => p.id === val)
              data.jobPositionName = found ? found.value : ''
            }"/>
        </div>
      </template>
      <template #body='{ data }'>
        {{ jobPosition.find(p => p.id == data.jobPositionCode)?.value || '' }}
      </template>
    </Column>
    <Column
      class='text-center w-3rem'
      header=''>
      <template #body='{ data }'>
        <Checkbox
          v-model='data.selectedEmployee'
          binary/>
      </template>
    </Column>
  </DataTable>
</template>

<script lang='ts' setup>
import type { ColumnState } from 'primevue/column';
import type { DataTableCellEditCompleteEvent } from 'primevue/datatable';
import { onMounted, type PropType, reactive, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { searchEmployees } from '@/apps/hrm/api/graphql/employee';
import { CATEGORY_TYPE } from '@/apps/hrm/constants/category';
import { fetchCategoryMappingNameWithId } from '@/apps/hrm/helpers/utils';
import type { EmployeeFilter, EmployeeSummary } from '@/apps/hrm/model/employee';
import type { EmployeeReport } from '@/apps/hrm/model/evaluate';
import type { Connection } from '@/common/model/page';

const props = defineProps({
  organizationId: {
    type: String,
    default: ''
  },
});

const { t } = useI18n();

const employeesValue = defineModel('employees', {
  type: Array as PropType<EmployeeReport[]>,
  default: [], 
});
const jobPosition = ref<{id: string, value: string }[]>([]);

const bodyCellFunc = (e: { state: ColumnState }) => ({ class: { 'pt-0 pb-0': e.state['d_editing'] } });
function onCellEditComplete(event: DataTableCellEditCompleteEvent) {
  employeesValue.value[event.index] = event.newData as EmployeeReport;
}
const filter = reactive<EmployeeFilter>({ organization: props.organizationId });
const {
  result,
  load: loadSearch,
} = searchEmployees(filter, {
  page: 0,
  size: 9999 
});

watch(() => props.organizationId, (newVal) => {
  if (newVal) {
    filter.organization = newVal;
    loadSearch();
  }
});

watch(result, () => {
  const connection = result.value?.searchEmployees as Connection<EmployeeSummary>;
  if (connection) {
    employeesValue.value = connection.edges.map(e => {
      const n = e.node;
      return {
        employeeId: n.id,
        employeeName: n.fullName,
        employeeOrganizationId: n.organizationId,
        employeeOrganizationName: n.organizationName,
        jobPositionCode: n.position, 
        jobPositionName: n.positionName 
      };
    });
  }
});

watch(employeesValue, (list) => {
  list.forEach(emp => {
    if (emp.selectedEmployee === undefined) {
      emp.selectedEmployee = true;
    }
  });
}, {
  deep: true,
  immediate: true 
});

if (employeesValue.value.length === 0) {
  loadSearch();
}
onMounted(() => {
  fetchCategoryMappingNameWithId(CATEGORY_TYPE.JOB_POSITION, jobPosition, {
    labelProp: 'name',
    idProp: 'code'
  });
});
</script>

<style scoped>
:deep(.custom-dropdown .p-dropdown-label){
  padding: 0.5rem 0.5rem;
}
</style>
