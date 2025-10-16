<template>
  <div
    class='mt-3 personal-social-insurance'
    style='width: calc(100% - 60px);'>
    <!-- Block 1: Personal Social Insurance Information -->
    <h4>Thông tin bảo hiểm cá nhân</h4>
    <div class='info-block mb-4'>
      <div class='border border-1 border-300 border-round-sm p-3'>
        <p class='font-semibold mb-0 text-xl'>Thông tin chung</p>
        <div v-if='loadingInfo'>
          <Skeleton
            v-for='i in 4'
            :key="'info-skeleton-' + i"
            class='mb-2'
            height='2rem'
            width='100%'/>
        </div>
        <div v-else>
          <div
            v-for='(field, idx) in infoFields'
            :key='idx'
            class='col-12 flex gap-2 pb-1 pl-0'>
            <div class='font-medium w-14rem'>{{ field.label }}</div>
            <div class='font-semibold'>: {{ field.value }}</div>
          </div>
        </div>
      </div>
      <div class='border border-2 border-blue-300 border-dashed border-round-sm p-3'>
        <div v-if='loadingInfo'>
          <Skeleton
            v-for='i in 2'
            :key="'param-skeleton-' + i"
            class='mb-2'
            height='2rem'
            width='100%'/>
        </div>
        <div v-else>
          <div>
            <p class='font-medium mb-0'>{{ t('hrm.insurance.salaryPayment') }}:</p>
            <span class='font-semibold'>{{ formatCurrency(baseSalary) }}</span>
          </div>
          <div>
            <p class='font-medium mb-0'>{{ t('hrm.insurance.sumPaymentByPercent') }}</p>
            <span class='font-semibold'>{{ parameter.parameterTotalPay }}%</span>
          </div>
          <div class='flex justify-content-between'>
            <div>
              <p class='font-medium mb-0'>{{ t('hrm.insurance.companyPayment') }}</p>
              <span class='font-semibold'>{{ parameter.parameterCompanyPay }}%</span>
            </div>
            <div>
              <p class='font-medium mb-0'>{{ t('hrm.insurance.employeePayment') }}</p>
              <span class='font-semibold'>{{ parameter.parameterEmployeePay }}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Block 2: Table of Paid Social Insurance by Year -->
    <div>
      <h4>Bảng kê chi tiết đóng bảo hiểm</h4>
      <div v-if='loadingTable'>
        <Skeleton
          v-for='i in 3'
          :key="'table-skeleton-' + i"
          class='mb-2'
          height='3rem'
          width='100%'/>
      </div>
      <DataTable
        v-else
        class='p-datatable-sm'
        responsive-layout='scroll'
        scrollable
        show-gridlines
        :value='paidByYear'>
        <ColumnGroup type='header'>
          <Row>
            <Column
              align-frozen='left'
              body-class='border-right-1 border'
              frozen
              :header="$t('hrm.insurance.year')"
              header-class='border-right-1 border'
              :rowspan='2'
              style='text-align: center; min-width: 80px;'/>
            <Column
              v-for='month in months'
              :key='month.value'
              :colspan='5'
              :header="$t('hrm.insurance.month') + ' ' + month.value"
              style='text-align: center; background: #f4f4f4;'/>
            <Column
              align-frozen='right'
              frozen
              :header="$t('hrm.insurance.paymentTotal')"
              :rowspan='2'
              style='text-align: right; min-width: 120px;'/>
          </Row>
          <Row>
            <template
              v-for='month in months'
              :key="'sub-' + month.value">
              <Column :header="$t('hrm.insurance.paymentLevel')"/>
              <Column :header="$t('hrm.insurance.paymentBHXH')"/>
              <Column :header="$t('hrm.insurance.paymentBHYT')"/>
              <Column :header="$t('hrm.insurance.paymentBHTN')"/>
              <Column :header="$t('hrm.insurance.paymentBHTNLĐ')"/>
            </template>
          </Row>
        </ColumnGroup>
        <Column
          field='year'
          frozen
          style='text-align: center; font-weight: bold; min-width: 80px; background: #f4f4f4; z-index: 2;'/>
        <template
          v-for='(month, mIdx) in months'
          :key="'body-' + month.value">
          <Column
            :field='`months[${mIdx}].paymentLevel`'
            style='min-width: 90px; text-align: right;'>
            <template #body='{ data }'>
              <div class='flex justify-content-center'>
                {{ formatCurrency(data.months[mIdx]?.paymentLevel) }}
              </div>
            </template>
          </Column>
          <Column
            :body='(row: InsuranceYearData) => formatCurrency(row.months[mIdx]?.paymentBHXH)'
            :field='`months[${mIdx}].paymentBHXH`'
            style='min-width: 90px; text-align: right;'>
            <template #body='{ data }'>
              <div class='flex justify-content-center'>
                {{ formatCurrency(data.months[mIdx]?.paymentBHXH) }}
              </div>
            </template>
          </Column>
          <Column
            :body='(row: InsuranceYearData) => formatCurrency(row.months[mIdx]?.paymentBHYT)'
            :field='`months[${mIdx}].paymentBHYT`'
            style='min-width: 90px; text-align: right;'>
            <template #body='{ data }'>
              <div class='flex justify-content-center'>
                {{ formatCurrency(data.months[mIdx]?.paymentBHYT) }}
              </div>
            </template>
          </Column>
          <Column
            :body='(row: InsuranceYearData) => formatCurrency(row.months[mIdx]?.paymentBHTN)'
            :field='`months[${mIdx}].paymentBHTN`'
            style='min-width: 90px; text-align: right;'>
            <template #body='{ data }'>
              <div class='flex justify-content-center'>
                {{ formatCurrency(data.months[mIdx]?.paymentBHTN) }}
              </div>
            </template>
          </Column>
          <Column
            :body='(row: InsuranceYearData) => formatCurrency(row.months[mIdx]?.paymentBHTNLD)'
            :field='`months[${mIdx}].paymentBHTNLD`'
            style='min-width: 90px; text-align: right;'>
            <template #body='{ data }'>
              <div class='flex justify-content-center'>
                {{ formatCurrency(data.months[mIdx]?.paymentBHTNLD) }}
              </div>
            </template>
          </Column>
        </template>
        <Column
          align-frozen='right'
          :body='(row: InsuranceYearData) => formatCurrency(row.paymentTotal)'
          frozen
          style='text-align: right; font-weight: bold; min-width: 120px; background: #FFF5F5; z-index: 2;'>
          <template #body='{ data: {paymentTotal} }'>
            <div class='flex justify-content-center'>
              {{ formatCurrency(paymentTotal) }}
            </div>
          </template>
        </Column>
        <template #footer>
          <div class='align-items-center bg-yellow-50 border-200 border-top-1 flex justify-content-between pl-3 pr-2'>
            <p class='font-semibold mb-0'>{{ t('hrm.insurance.summary') }}:</p>
            <div
              class='border border-300 border-left-1 flex font-semibold justify-content-center pl-2 py-3 text-right'
              style='width: 110px'>{{ formatCurrency(totalAllYears) }}
            </div>
          </div>

        </template>
      </DataTable>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { cloneDeep } from 'lodash';
import DataTable from 'primevue/datatable';
import Skeleton from 'primevue/skeleton';
import { computed, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { getAllOrganizationGraphql } from '@/apps/admin/api/graphql/organization-graphql-api';
import type { OrganizationInterface } from '@/apps/admin/model/organization';
import {
  getInsuranceDataByEmployeeId,
  getInsuranceGroupedByYear,
} from '@/apps/hrm/api/graphql/insurance';
import { findParameterConfig } from '@/apps/hrm/api/graphql/parameterConfig';
import type { Insurance, InsuranceYear, InsuranceYearData } from '@/apps/hrm/model/insurance';
import type { ParameterConfig } from '@/apps/hrm/model/parameter';
import { formatDate } from '@/common/helpers/utils';

const props = defineProps({
  employeeId: {
    type: String,
    default: '',
    required: true
  }
});

const insuranceInfo = ref<Insurance>();
const organizations = ref<OrganizationInterface[]>([]);
const parameter = ref<ParameterConfig>({} as ParameterConfig);
const baseSalary = ref(0);
const { onResult: getDataInsurance } = getInsuranceDataByEmployeeId(props.employeeId);
const { t } = useI18n();
const findOrganization = (id: string | undefined) => {
  if (!organizations.value) {
    return '';
  }
  if (!id) {
    return '';
  }
  const org = organizations.value.find((org: any) => org.id === id);
  return org ? org.name : '';
};
const infoFields = computed(() => [
  {
    label: t('hrm.insurance.codeBHXH'),
    value: insuranceInfo.value?.codeBHXH || ''
  },
  {
    label: t('hrm.insurance.cardNumBHYT'),
    value: insuranceInfo.value?.bookNumBHXH || ''
  },
  {
    label: t('hrm.insurance.organizationId'),
    value: findOrganization(insuranceInfo.value?.organizationId) || ''
  },
  {
    label: t('hrm.insurance.socialInsuranceParticipation'),
    value: insuranceInfo.value?.socialInsuranceParticipation ? formatDate(insuranceInfo.value.socialInsuranceParticipation, 'MM/YYYY') : ''
  },
  {
    label: 'Mã khám chữa bệnh',
    value: insuranceInfo.value?.medicalExaminationCode
  },
  {
    label: 'Nơi đăng ký khám chữa bệnh',
    value: insuranceInfo.value?.hospitalCode
  },
]);
const paidByYear = ref<InsuranceYearData[]>([]);
const loadingInfo = ref(true);
const loadingTable = ref(true);

function transformInsuranceData(data: InsuranceYear[]) {
  return data.map(group => {
    const months = Array.from({ length: 12 }, (_, index) => {
      const monthData = group.records.find(r => r.month === index + 1);
      return { ...monthData, };
    });

    const paymentTotal = months.reduce((sum, m) => sum + (m?.paymentTotal ?? 0), 0);

    return {
      year: group.year,
      months,
      paymentTotal
    };
  });
}

onMounted(() => {
  loadingInfo.value = true;
  loadingTable.value = true;
  getDataInsurance((res) => {
    insuranceInfo.value = res.data.getInsuranceByEmployeeId;
    loadingInfo.value = false;
  });

  getAllOrganizationGraphql().onResult((res) => {
    organizations.value = res.data?.allOrganizationPublic;
  });

  findParameterConfig().onResult((res) => {
    parameter.value = cloneDeep(res.data.findParameterConfig);
  });

  getInsuranceGroupedByYear(props.employeeId).onResult((res) => {
    const data = res.data.getInsuranceGroupedByYear;
    if (data.length > 0) {
      paidByYear.value = transformInsuranceData(data) as InsuranceYearData[];
      const recentMonth = data[0].records[data[0].records.length - 1] || [];
      const recentPayment = recentMonth?.paymentLevel || 0;
      if (recentPayment > 0) {
        baseSalary.value = recentPayment;
      } else {
        baseSalary.value = data[0].records[data[0].records.length - 2]?.paymentLevel || 0;
      }
    } else {
      paidByYear.value = [];
      baseSalary.value = 0;
    }

    loadingTable.value = false;
  });

});
const months = [
  {
    value: '01',
    label: 'Jan'
  },
  {
    value: '02',
    label: 'Feb'
  },
  {
    value: '03',
    label: 'Mar'
  },
  {
    value: '04',
    label: 'Apr'
  },
  {
    value: '05',
    label: 'May'
  },
  {
    value: '06',
    label: 'Jun'
  },
  {
    value: '07',
    label: 'Jul'
  },
  {
    value: '08',
    label: 'Aug'
  },
  {
    value: '09',
    label: 'Sep'
  },
  {
    value: '10',
    label: 'Oct'
  },
  {
    value: '11',
    label: 'Nov'
  },
  {
    value: '12',
    label: 'Dec'
  },
];

const totalAllYears = computed(() =>
  paidByYear.value.reduce((sum, item) => sum + item.paymentTotal, 0)
);

const formatCurrency = (value: string | number) => {
  if (value === null || value === undefined) {
    return 0;
  }
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};
</script>

<style scoped>
.info-block {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 20px;
}

:deep(.p-datatable.p-datatable-sm .p-datatable-footer) {
  padding: 0;
}

</style>
