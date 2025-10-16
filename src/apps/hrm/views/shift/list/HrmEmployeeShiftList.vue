<template>
  <DataTable
    v-model:editing-rows='editingRows'
    current-page-report-template='{first}-{last}/{totalRecords}'
    data-key='employeeId'
    edit-mode='row'
    paginator
    paginator-template='FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink JumpToPageDropdown CurrentPageReport'
    :pt="{
      table: { style: 'min-width: 50rem' },
      column: {
        bodycell: bodyCellFunc
      }
    }"
    row-hover
    :rows='50'
    scroll-height='calc(100vh - 14rem)'
    scrollable
    :total-records='total'
    :value='employees'
    @row-edit-save='onRowEditSave'>
    <Column style='width: 2.5rem'>
      <template #body='{index}'>
        {{ index + 1 + (pageable.page * pageable.size) }}
      </template>
    </Column>
    <Column
      body-class='p-0'
      style='width: 2.5rem'>
      <template #body='{data}'>
        <HrmAvatar
          :avatar='generateAvatarUrl(data["avatar"])'
          class='border-round-sm cursor-pointer'
          width='2.5rem'/>
      </template>
    </Column>
    <Column
      field='code'
      :header='t("hrm.profile.general.code")'
      style='width: 8rem'></Column>
    <Column
      field='fullName'
      :header='t("hrm.profile.general.fullName")'
      style='width: 20rem'></Column>

    <Column :header='t("hrm.shift.management.shifts")'>
      <template #body='{data}'>
        <div class='flex justify-content-between w-full'>
          <div>
            {{ data['shifts'].map((s: Shift) => s.name).join(', ') }}
          </div>
          <div
            v-if='data["totalHours"]'
            class='flex flex-column text-right'>
            <span>
              {{ t('hrm.shift.management.totalHours') }}: <span class='font-semibold'>{{ data['totalHours'] }}</span>
            </span>
            <span
              v-if='data["totalHours"] < 8'
              class='text-sm'>
              <i class='pi pi-exclamation-triangle text-orange-500'></i>
              {{ t('hrm.shift.management.warning.under8') }}</span>
            <span
              v-if='data["totalHours"] > 24'
              class='text-sm'>
              <i class='pi pi-exclamation-triangle text-red-500'></i>
              {{ t('hrm.shift.management.warning.over24') }}</span>
            <span
              v-if='data["totalHours"] > 8 && data["totalHours"] < 24'
              class='text-sm'>
              <i class='pi pi-exclamation-triangle text-orange-500'></i>
              {{ t('hrm.shift.management.warning.over8') }}</span>
          </div>
        </div>

      </template>
      <template #editor='{data}'>
        <div class='align-items-center flex justify-content-between'>
          <div class='flex gap-3'>
            <div
              v-for='(shift, index) in data["shifts"]'
              :key='index'
              class='align-items-center flex gap-1'>
              <Dropdown
                input-class='py-2'
                :model-value='shifts.find((s: Shift) => s.code === shift.code)'
                option-label='name'
                :options='shifts'
                style='min-width: 10rem'
                @update:model-value='(value: Shift)=>updateShift(shift, value)'>
                <template #option='{option}'>
                  {{ option['name'] }}
                  ({{ option['startTime'] }} - {{ option['endTime'] }})
                </template>
              </Dropdown>
              <i
                class='cursor-pointer pi pi-trash text-red-500'
                @click='deleteShift(data, index as number)'></i>
            </div>

          </div>
          <Button
            v-tooltip='t("common.add")'
            class='p-2 w-auto'
            icon='pi pi-plus'
            icon-class='w-1rem h-1rem text-center align-content-center'
            size='small'
            @click='addShift(data)'></Button>
        </div>

      </template>
    </Column>
    <Column
      body-style='text-align:center'
      row-editor
      style='width: 7rem'>
    </Column>
  </DataTable>
</template>

<script lang='ts' setup>
import { pick } from 'lodash';
import type { ColumnState } from 'primevue/column';
import type { DataTableRowEditSaveEvent } from 'primevue/datatable';
import { computed, inject, onMounted, reactive, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { employeeShifts, saveEmployeeShift } from '@/apps/hrm/api/graphql/shift';
import HrmAvatar from '@/apps/hrm/components/HrmAvatar.vue';
import { CATEGORY_TYPE } from '@/apps/hrm/constants/category';
import { fetchCategory } from '@/apps/hrm/helpers/utils';
import type { EmployeeFilter } from '@/apps/hrm/model/employee';
import type { EmployeeShifts, Shift } from '@/apps/hrm/model/shift';
import { toastError, toastSuccess } from '@/common/helpers/custom-toast-service';
import { generateAvatarUrl } from '@/common/helpers/file-utils';
import type { Connection } from '@/common/model/page';
import type { Pageable } from '@/common/model/query';

const { t } = useI18n();
const pageable = reactive<Pageable>({
  page: 0,
  size: 50,
});
const filter = reactive<EmployeeFilter>({});
const organizationId = inject('organizationId', ref<string>());

const {
  result,
  refetch
} = employeeShifts(filter, pageable);
const employees = computed(() => (result.value?.employeeShifts as Connection<EmployeeShifts>)?.edges.map((edge) => edge.node) || []);
const total = computed(() => (result.value?.employeeShifts as Connection<EmployeeShifts>)?.totalCount || 0);
const shifts = ref<Shift[]>([]);
const editingRows = ref<EmployeeShifts[]>([]);

watch(organizationId, (value) => {
  filter.organization = value;
  pageable.page = 0;
}, { immediate: true });

onMounted(() => {
  fetchCategory(CATEGORY_TYPE.SHIFT, shifts);
});

const bodyCellFunc = (e: { state: ColumnState }) => ({ class: e.state['d_editing'] && 'py-2' });

function addShift(employee: EmployeeShifts) {
  if (employee.shifts) {
    employee.shifts = [...employee.shifts, {}];
  } else {
    employee.shifts = [{}];
  }
}

function updateShift(shift: Shift, value: Shift) {
  Object.assign(shift, pick(value, ['code', 'name']));
}

function deleteShift(employee: EmployeeShifts, index: number) {
  employee.shifts = employee.shifts?.filter((shift: Shift, i: number) => i !== index) || [];
}

function onRowEditSave(event: DataTableRowEditSaveEvent) {
  let {
    data,
    newData,
  } = event;
  saveEmployeeShift().mutate({
    employeeId: data['employeeId'],
    shiftCodes: newData['shifts'].filter((shift: Shift) => shift.code).map((shift: Shift) => shift.code)
  })
    .then(() => {
      toastSuccess();
      refetch();
    }).catch(() => {
      toastError();
    });
}
</script>

<style scoped>

</style>