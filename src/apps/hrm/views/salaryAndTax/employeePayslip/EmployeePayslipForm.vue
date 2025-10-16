<template>
  <Sidebar
    v-model:visible='visibleForm'
    v-bind='DEFAULT_SIDEBAR_CONFIG'
    :header="t('hrm.salary.salaryAndTax.salaryType.bill')"
    :show-close-icon='false'
    style='width: 60vw'
    @hide="emits('hide-dialog')">
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
              @click="emits('hide-dialog')"/>
            <div class='align-content-center font-semibold text-2xl'>
              {{ t('hrm.salary.salaryAndTax.salaryType.bill') }}
            </div>
          </div>
        </div>
      </div>
    </template>

    <div>
      <div class='flex gap-2 py-2 w-full'>
        <div>
          <label
            v-required
            class='flex mb-1'>{{
              t(`hrm.salary.createdMonth`)
            }}
          </label>
          <Calendar
            v-model='date'
            class='w-full'
            date-format='mm/yy'
            view='month'/>
          <span
            v-if='!date && isSubmit'
            class='text-red-500 text-sm'>
            {{ t('hrm.salary.requiredDate') }}
          </span>
        </div>
        <div class='flex flex-column'>
          <label
            v-required
            class='flex mb-1'
            for='employeeId'>{{ t('hrm.contract.general.employee') }}
          </label>
          <Dropdown
            v-model='employeeId'
            :filter='true'
            name='employeeId'
            option-label='fullName'
            option-value='id'
            :options='employees'
            panel-class='custom-dropdown'
            placeholder='Chọn nhân sự'
            required
            style='width: 40rem'>
            <template #option='slotProps'>
              <div class='align-items-center flex gap-2'>
                <AppAvatar
                  :avatar='generateAvatarUrl(slotProps.option.avatar)'
                  shape='square'
                  size='2.5'/>
                <div>
                  <p class='font-semibold mb-0'>{{ slotProps.option.fullName }}</p>
                  <div
                    v-if='slotProps.option.positionName'
                    class='flex'>
                    <p class='mb-0 text-700 text-base'>{{ slotProps.option.positionName }}</p>
                    <p class='border-l-2 mb-0 ml-2 text-700 text-base'>| {{ slotProps.option.organizationName }}
                    </p>
                  </div>
                </div>
              </div>
            </template>
          </Dropdown>
          <span
            v-if='!employeeId && isSubmit'
            class='text-red-500 text-sm'>
            {{ t('hrm.salary.requiredEmployee') }}
          </span>
          <input
            v-model='employeeId'
            hidden=''
            name='employeeId'/>
        </div>
      </div>

      <DataTable
        class='mb-6 payslip-table'
        edit-mode='cell'
        :pt="{
          table: { style: 'min-width: 50rem' },
          column: {
            // @ts-ignore
            bodycell: ({ state }) => ({
              class: [{ 'pt-0 pb-0': state['d_editing'] }]
            })
          }
        }"
        show-gridlines
        :value='payslipInfos'>
        <Column
          header='STT'>
          <template #body='{data}'>
            <div
              class='align-items-center flex justify-content-center'
              :class='data.isGroup && "font-bold"'>
              {{ data.code }}
            </div>
          </template>
        </Column>
        <Column
          :header='t("meeting.meeting.content")'>
          <template #body='{data}'>
            <div
              class='align-items-center flex'
              :class='data.isGroup && "font-bold"'>
              {{ data.name }}
            </div>
          </template>
        </Column>
        <Column
          :header='t("hrm.salary.valueMoney")'
          style='width: 20rem'>
          <template #body='{ data }'>
            <div
              class='text-right'>
              {{ employeePayslipValueMap[data.id]?.toLocaleString('vi-VN') }}
            </div>
          </template>
          <template #editor='{ data }'>
            <InputNumber
              v-model='employeePayslipValueMap[data.id]'
              class='w-full'
              input-id='minmaxfraction'
              :max-fraction-digits='2'
              :min='0'
              :min-fraction-digits='0'/>
          </template>
        </Column>
      </DataTable>
    </div>

    <div
      class='border-primary-100 border-top-1 bottom-0 fixed flex gap-2 justify-content-center p-3 py-1 surface-overlay'
      style='width: 100%; left: 0; z-index: 1000'>
      <Button
        class='p-button-plain'
        icon='pi pi-times'
        :label="t('common.close')"
        severity='danger'
        @click="emits('hide-dialog')"/>
      <Button
        icon='pi pi-save'
        :label="t('common.save')"
        @click='onSave'/>
    </div>
  </Sidebar>
</template>

<script setup lang='ts'>

import { onMounted, reactive, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { findAllEmployees } from '@/apps/hrm/api/graphql/employee';
import { getDefaultPayslipInfos, getEmployeePayslip, saveEmployeePayslip } from '@/apps/hrm/api/graphql/salary';
import ButtonIcon from '@/common/components/custom/ButtonIcon.vue';
import { DEFAULT_SIDEBAR_CONFIG } from '@/common/constants';
import { toastSuccess } from '@/common/helpers/custom-toast-service';
import { generateAvatarUrl } from '@/common/helpers/file-utils';

const props = defineProps({
  visibleDialog: {
    type: Boolean,
    default: false,
  },
  id: {
    type: String,
    default: undefined,
  }
});
const emits = defineEmits(['hide-dialog']);
const visibleForm = ref(props.visibleDialog);
const { t } = useI18n();
const payslipInfos = ref();
const employeePayslipValue = ref();
const date = ref(new Date());
const employeeId = ref();
const employees = ref([]);

const employeePayslipValueMap = reactive<{ [key: string]: number }>({});

getDefaultPayslipInfos().onResult(res => {
  payslipInfos.value = sortFlatList(res.data.getDefaultPayslipInfos);

  if (props.id) {
    getEmployeePayslip(props.id).onResult((res) => {
      const data = res.data.getEmployeePayslip;
      date.value = new Date(data.year, data.month - 1, 1);
      employeeId.value = data.employeeId;
      employeePayslipValue.value = data.employeePayslipValue;
      mergeData();
    });
  } else {
    employeePayslipValue.value = payslipInfos.value
      .map((item: any) => ({
        id: item.id,
        value: null
      }));
    mergeData();
  }
});

const mergeData = () => {
  employeePayslipValue.value?.forEach((item: any) => {
    employeePayslipValueMap[item.id] = item.value;
  });
};

const {
  mutate,
  onDone
} = saveEmployeePayslip();

const isSubmit = ref(false);

const onSave = () => {
  isSubmit.value = true;
  if (!employeeId.value || !date.value) {
    return;
  }
  const updatedValues = Object.entries(employeePayslipValueMap).map(([id, value]) => ({
    id,
    value
  }));
  mutate({
    employeePayslip: {
      id: props.id,
      payslipCode: payslipInfos.value[0].payslipCode,
      payslipName: payslipInfos.value[0].payslipName,
      employeeId: employeeId.value,
      month: date.value.getMonth() + 1,
      year: date.value.getFullYear(),
      employeePayslipValue: updatedValues
    }
  });
};

onDone(() => {
  toastSuccess({ message: t('common.saveSuccess') });
  emits('hide-dialog');
});

onMounted(() => {
  findAllEmployees('').onResult((result) => {
    employees.value = result.data?.findAllEmployees || [];
  });
});

function sortFlatList(data: any[]): any[] {
  const map = new Map<string, any>();
  data.forEach(item => map.set(item.id, item));

  const childrenMap = new Map<string | null, any[]>();
  data.forEach(item => {
    const list = childrenMap.get(item.parentId) || [];
    list.push(item);
    childrenMap.set(item.parentId, list);
  });
  childrenMap.forEach((list, key) => {
    list.sort((a, b) => a.orderNum - b.orderNum);
  });

  const result: any[] = [];

  function pushItems(parentId: string | null) {
    const list = childrenMap.get(parentId);
    if (!list) {
      return;
    }
    for (const item of list) {
      result.push(item);
      if (item.isGroup) {
        pushItems(item.id);
      }
    }
  }

  pushItems(null);

  return result;
}

</script>

<style scoped>
.payslip-table {
  :deep(.p-inputtext) {
    padding: 0.5rem 0.75rem;
  }
}

</style>