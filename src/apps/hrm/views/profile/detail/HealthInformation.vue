<template>
  <div class='align-items-center flex flex-wrap justify-content-between pb-2 text-primary'>
    <span class='font-bold text-lg'>{{ t('hrm.health.titleTab') }}</span>
  </div>

  <HealthInfoDetail
    class='mx-1'
    :data='newestHealth'
    :is-view='isView'/>

  <DataTable
    v-bind='DEFAULT_DATATABLE_CONFIG'
    v-model:selection='selectedRow'
    class='h-auto my-3 overflow-auto w-full'
    row-hover
    selection-mode='single'
    striped-rows
    style='max-height: 35rem'
    :value='listVaccine'>
    <Column
      class='text-center'
      field='doseNumber'
      :header='t(`hrm.health.doseNumber`)'
      style='min-width: 10vw'>
    </Column>
    <Column
      class='text-center'
      field='vaccinationDate'
      :header='t(`hrm.health.vaccinationDate`)'
      style='min-width: 7vw'>
      <template #body='{ data: { vaccinationDate } }'>
        {{ vaccinationDate && moment(vaccinationDate).format('DD/MM/YYYY') }}
      </template>
    </Column>
    <Column
      field='vaccineType'
      :header='t(`hrm.health.vaccineType`)'
      style='min-width: 10vw'>
    </Column>
    <Column
      class='text-center'
      field='batchNumber'
      :header='t(`hrm.health.batchNumber`)'
      style='min-width: 10vw'>
    </Column>
    <Column
      field='vaccinationFacility'
      :header='t(`hrm.health.vaccinationFacility`)'
      style='min-width: 10vw'>
    </Column>
    <Column
      class='text-center'
      field='signer'
      :header='t(`hrm.health.signer`)'
      style='min-width: 10vw'>
    </Column>
    <Column
      class='text-center'
      field='position'
      :header='t(`hrm.health.position`)'
      style='min-width: 10vw'>
    </Column>
  </DataTable>

  <HealthInfo
    v-for='(health, index) in healthInfos'
    :key='index'
    :data='health'
    :is-view='isView'/>
</template>

<script setup lang='ts'>
import Column from 'primevue/column';
import { inject, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { getAllEmployeeHealth, getAllEmployeeVaccineInfo } from '@/apps/hrm/api/graphql/employee-health';
import type { EmployeeHealth } from '@/apps/hrm/model/employee';
import HealthInfoDetail from '@/apps/hrm/views/profile/detail/detailComponent/HealthInfoDetail.vue';
import HealthInfo from '@/apps/hrm/views/profile/form/health/HealthInfo.vue';
import { DEFAULT_DATATABLE_CONFIG } from '@/common/constants';
import useMoment from '@/common/helpers/mixins/use-moment';

const props = defineProps({
  snapshotId: {
    type: String,
    default: null
  },
  isView: {
    type: Boolean,
    default: false
  }
});
const { moment } = useMoment();
const newestHealth = ref<EmployeeHealth>({} as EmployeeHealth);
const healthInfos = ref<EmployeeHealth[]>([]);
const { t } = useI18n();
const selectedRow = ref();
const listVaccine = ref<any[]>([]);
const {
  onResult: getAllEmployeeHealthResult,
  refetch: getAllEmployeeHealthRefetch
} = getAllEmployeeHealth(props.snapshotId);

const {
  onResult: getAllEmployeeVaccineInfoResult,
  refetch: getAllEmployeeVaccineInfoRefetch
} = getAllEmployeeVaccineInfo(props.snapshotId);

getAllEmployeeHealthResult((res) => {
  newestHealth.value = res.data.getAllEmployeeHealth[0];
  if (res.data.getAllEmployeeHealth.length > 0) {
    healthInfos.value = res.data.getAllEmployeeHealth.slice(1);
  }
});

getAllEmployeeVaccineInfoResult((res) => {
  listVaccine.value = res.data.getAllEmployeeVaccineInfo;
});

const injectedRefreshTable = inject('refreshHealthFormTab', ref(false));

watch(injectedRefreshTable, (newValue) => {
  if (newValue) {
    getAllEmployeeHealthRefetch();
    getAllEmployeeVaccineInfoRefetch();
    injectedRefreshTable.value = false;
  }
});
</script>

<style scoped>
:deep(.p-datatable-wrapper) {
  overflow: hidden !important;
}

:deep(.p-datatable-wrapper:hover) {
  overflow: auto !important;
}
</style>