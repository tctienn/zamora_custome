<template>
  <div class='salary-process-container'>
    <DataTable
      v-if='data.length > 0'
      class='border-1 surface-border'
      v-bind='DEFAULT_DATATABLE_CONFIG'
      :pt="{
        wrapper: {
          class: 'h-full surface-overlay',
        },
      }"
      row-hover
      :value='data'>
      <Column
        class='text-center'
        header='TT'
        style='width: 3rem'>
        <template #body='slotProps'>
          <div
            class='align-items-center flex items-center justify-content-center'>
            {{ slotProps.index + 1 }}
          </div>
        </template>
      </Column>

      <Column
        class='text-center'
        header='Tháng/năm'>
        <template #body='{data}'>
          {{ data.createdMonth }}/{{ data.createdYear }}
        </template>
      </Column>

      <Column
        class='text-center'
        header='Hình thức'>
        <template #body='{data}'>
          {{ t(`hrm.salary.${data.salaryProcessForm.toLowerCase()}`) }}
        </template>
      </Column>
      <Column
        class='text-center'
        field='salaryScale'
        header='Ngạch'>
      </Column>
      <Column
        class='text-center'
        field='salaryLevel'
        header='Bậc'>
      </Column>
      <Column
        class='text-center'
        field='salaryCoefficient'
        header='Hệ số'>
      </Column>
      <Column
        class='text-center'
        header='Trạng thái'>
        <template #body='{data}'>
          <i
            v-if='data.status'
            class='pi pi-check'></i>
        </template>
      </Column>
    </DataTable>
    <NodataView
      v-else
      :message="t('hrm.salary.salary.noPayslipDataMessage')" />
  </div>
</template>

<script lang="ts" setup>

import { onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { getAllSalaryProcessByEmployeeId } from '@/apps/hrm/api/graphql/salary';
import NodataView from '@/apps/hrm/components/NoDataView.vue';
import { DEFAULT_DATATABLE_CONFIG } from '@/common/constants';

const props = defineProps({
  employeeId: {
    type: String,
    required: true
  }
});

const { t } = useI18n();
const data = ref([]);

const {
  onResult: getAllSalaryProcessByEmployeeIdResult,
  refetch: getAllSalaryProcessByEmployeeIdRefetch
} = getAllSalaryProcessByEmployeeId(props.employeeId);

getAllSalaryProcessByEmployeeIdResult((res) => {
  data.value = res.data.getAllSalaryProcessByEmployeeId || [];
});

// Watch for changes in employeeId and refetch data
watch(() => props.employeeId, (newVal) => {
  if (newVal) {
    getAllSalaryProcessByEmployeeIdRefetch({ employeeId: newVal });
  }
});

// Initial data fetch
onMounted(() => {
  if (props.employeeId) {
    getAllSalaryProcessByEmployeeIdRefetch({ employeeId: props.employeeId });
  }
});
</script>