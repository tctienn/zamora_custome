<template>
  <Dialog
    v-model:visible='visibleForm'
    header='Thêm mới chi tiết đóng bảo hiểm'
    style='width: 70vw'
    @hide="emits('hide-dialog')">
    <div class='align-items-center flex gap-2 justify-content-end'>
      Tháng/Năm
      <Calendar
        v-model='date'
        date-format='mm/yy'
        disabled
        view='month'/>
      <ButtonIcon
        class='btn-create'
        icon='add'
        label='Tạo bảng kê tháng'
        @click='genTable'/>
    </div>

    <div class='mt-3'>
      <DataTable
        edit-mode='cell'
        scroll-height='40rem'
        scrollable
        show-gridlines
        :value='data'>
        <Column
          frozen
          header='TT'
          style='width: 5%; text-align: center'>
          <template #body='slotProps'>
            <div
              class='align-items-center flex items-center justify-content-center'>
              {{ slotProps.index + 1 }}
            </div>
          </template>
        </Column>
        <Column
          field='fullName'
          frozen
          header='Họ và tên'
          style='min-width: 200px'>
          <template #body='{data}'>
            {{ data.fullName }}
          </template>
        </Column>
        <Column
          v-for='col in editableColumns'
          :key='col.field'
          :field='col.field'
          style='min-width: 250px'>
          <template #header>
            <div>
              {{ col.header }}
              <div
                v-if='col.rate'
                class='mt-1 text-center'>{{ col.rate }}%
              </div>
            </div>
          </template>
          <template #body='{ index }'>
            <template v-if='data[index][col.field]'>
              <div class='text-center'>{{
                formatNumberVN(data[index][col.field])
              }}
              </div>
            </template>
            <template v-else>
              <div class='text-center'>
                0
              </div>
            </template>
          </template>
          <template #editor='{ index }'>
            <component
              :is='col.component'
              v-model='data[index][col.field]'
              autofocus
              v-bind='col.props'/>
          </template>
        </Column>
      </DataTable>
    </div>
    <div class='flex justify-content-center mt-2'>
      <Button
        icon='pi pi-save'
        :label="t('common.save')"
        :loading='isProcessing'
        @click='submit'/>
    </div>
  </Dialog>
</template>

<script lang='ts' setup>

import { cloneDeep, get } from 'lodash';
import Column from 'primevue/column';
import { computed, reactive, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import {
  generateInsuranceInfoByMonth,
  getFormInsuranceByMonth,
  saveInsuranceByMonth
} from '@/apps/hrm/api/graphql/insurance';
import { findParameterConfig } from '@/apps/hrm/api/graphql/parameterConfig';
import type { ParameterConfig } from '@/apps/hrm/model/parameter';
import ButtonIcon from '@/common/components/custom/ButtonIcon.vue';

const props = defineProps({
  month: {
    type: Number,
    required: true
  },
  year: {
    type: Number,
    required: true
  },
  visibleDialog: {
    type: Boolean,
    default: false,
  },
});
const emits = defineEmits(['hide-dialog']);
const { t } = useI18n();
const isProcessing = ref(false);
const pageable = reactive({
  page: 0,
  size: 99999,
  sort: [],
});
const date = computed(() => {
  return new Date(Number(props.year), Number(props.month) - 1); // month: 0-based
});

const visibleForm = ref(props.visibleDialog);
const data = ref<any>([]);
const parameter = ref<ParameterConfig>({} as ParameterConfig);

const {
  onResult: getFormInsuranceByMonthResult,
  refetch: getFormInsuranceByMonthRefetch
} = getFormInsuranceByMonth({
  month: props.month,
  year: props.year,
  pageable: pageable
});

findParameterConfig().onResult((res) => {
  parameter.value = cloneDeep(res.data.findParameterConfig);
});

const {
  mutate: generateInsuranceInfoByMonthMutate,
  onDone: generateInsuranceInfoByMonthDone,
} =
  generateInsuranceInfoByMonth();

const {
  mutate: saveInsuranceByMonthMutate,
  onDone: saveInsuranceByMonthDone,
} =
  saveInsuranceByMonth();

getFormInsuranceByMonthResult((res) => {
  const { edges } = get(res, 'data.getFormInsuranceByMonth', { edges: [], });
  data.value = edges.map((edge: any) => ({ ...edge.node, }));
});

const genTable = () => {
  generateInsuranceInfoByMonthMutate();
};

generateInsuranceInfoByMonthDone(() => {
  pageable.page = 0;
  getFormInsuranceByMonthRefetch();
});

const submit = () => {
  data.value = data.value.map((item: any) => ({
    ...item,
    month: props.month,
    year: props.year
  }));
  saveInsuranceByMonthMutate({ input: { list: data.value } });
};

saveInsuranceByMonthDone(() => {
  visibleForm.value = false;
  emits('hide-dialog');
});

const editableColumns = computed(() => [
  {
    field: 'paymentLevel',
    header: 'Mức lương đóng',
    component: 'InputNumber',
    props: { class: 'w-full' },
  },
  {
    field: 'paymentBHXH',
    header: 'BHXH',
    rate: parameter.value.parameterBHXH ?? 0,
    component: 'InputNumber',
    props: { class: 'w-full' },
  },
  {
    field: 'paymentBHYT',
    header: 'BHYT',
    rate: parameter.value.parameterBHYT ?? 0,
    component: 'InputNumber',
    props: { class: 'w-full' },
  },
  {
    field: 'paymentBHTN',
    header: 'BHTN',
    rate: parameter.value.parameterBHTN ?? 0,
    component: 'InputNumber',
    props: { class: 'w-full' },
  },
  {
    field: 'paymentBHTNLD',
    header: 'BHTNLĐ',
    rate: parameter.value.parameterBHTNLD ?? 0,
    component: 'InputNumber',
    props: { class: 'w-full' },
  },
  {
    field: 'paymentTotal',
    header: 'Tổng số tiền đóng BHXH',
    rate: parameter.value.parameterTotalPay ?? 0,
    component: 'InputNumber',
    props: { class: 'w-full' },
  },
  {
    field: 'companyPays',
    header: 'Công ty đóng',
    component: 'InputNumber',
    rate: parameter.value.parameterCompanyPay ?? 0,
    props: { class: 'w-full' },
  },
  {
    field: 'nldpays',
    header: 'NLĐ đóng',
    rate: parameter.value.parameterEmployeePay ?? 0,
    component: 'InputNumber',
    props: { class: 'w-full' },
  },
]);

function formatNumberVN(value: number): string {
  return new Intl.NumberFormat('vi-VN').format(value);
}

watch(data, (newData) => {
  if (!parameter.value) {
    return;
  }

  const {
    parameterBHXH,
    parameterBHYT,
    parameterBHTN,
    parameterBHTNLD,
    parameterCompanyPay,
    parameterEmployeePay,
  } = parameter.value;

  if (
    parameterBHXH === undefined
    || parameterBHYT === undefined
    || parameterBHTN === undefined
    || parameterBHTNLD === undefined
    || parameterCompanyPay === undefined
    || parameterEmployeePay === undefined
  ) {
    return;
  }

  newData.forEach((row: any) => {
    const paymentLevel = row.paymentLevel || 0;

    row.paymentBHXH = Math.round(paymentLevel * parameterBHXH / 100);
    row.paymentBHYT = Math.round(paymentLevel * parameterBHYT / 100);
    row.paymentBHTN = Math.round(paymentLevel * parameterBHTN / 100);
    row.paymentBHTNLD = Math.round(paymentLevel * parameterBHTNLD / 100);

    row.paymentTotal = row.paymentBHXH + row.paymentBHYT + row.paymentBHTN + row.paymentBHTNLD;

    row.companyPays = Math.round(paymentLevel * parameterCompanyPay / 100);
    row.nldpays = Math.round(paymentLevel * parameterEmployeePay / 100);
  });
}, { deep: true });

</script>

<style scoped>

</style>
