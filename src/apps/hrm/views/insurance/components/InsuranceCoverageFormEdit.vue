<template>
  <Dialog
    v-model:visible='visibleForm'
    :header='`Chỉnh sửa chi tiết đóng bảo hiểm: ${fullName}`'
    style='width: 70vw'
    @hide="emits('hide-dialog')">
    <div>
      <DataTable
        edit-mode='cell'
        show-gridlines
        :value='data'>
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
              <div class='text-right'>{{
                formatNumberVN(data[index][col.field])
              }}
              </div>
            </template>
            <template v-else>
              <div class='text-right'>
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

import { cloneDeep } from 'lodash';
import Column from 'primevue/column';
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { getInsuranceByMonthAndId, saveInsuranceByMonth } from '@/apps/hrm/api/graphql/insurance';
import { findParameterConfig } from '@/apps/hrm/api/graphql/parameterConfig';
import type { ParameterConfig } from '@/apps/hrm/model/parameter';

const props = defineProps({
  id: {
    type: String,
    default: null,
  },
  fullName: {
    type: String,
    default: null,
  },
  visibleDialog: {
    type: Boolean,
    default: false,
  },
});
const emits = defineEmits(['hide-dialog']);
const { t } = useI18n();
const isProcessing = ref(false);
const visibleForm = ref(props.visibleDialog);
const date = ref(new Date());
const data = ref<any>([]);
const parameter = ref<ParameterConfig>({} as ParameterConfig);

const { onResult: getInsuranceByMonthAndIdResult } = getInsuranceByMonthAndId(props.id);

findParameterConfig().onResult((res) => {
  parameter.value = cloneDeep(res.data.findParameterConfig);
});

const {
  mutate: saveInsuranceByMonthMutate,
  onDone: saveInsuranceByMonthDone,
} =
  saveInsuranceByMonth();

getInsuranceByMonthAndIdResult((res) => {
  data.value = [cloneDeep(res.data.getInsuranceByMonthAndId)];
});

const submit = () => {
  data.value = data.value.map((item: any) => ({ ...item }));
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
