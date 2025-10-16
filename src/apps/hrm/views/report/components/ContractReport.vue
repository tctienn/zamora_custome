<template>
  <Sidebar
    v-model:visible='visible'
    :block-scroll='true'
    :dismissable='false'
    position='right'
    :pt="{
      header: {
        class: 'border-bottom-1 border-300',
      },
    }"
    :show-close-icon='false'
    style='width:95vw'
    @hide="emits('hide-dialog')">
    <template #header>
      <div class='align-items-center flex justify-content-between w-full'>
        <div class='align-items-center flex gap-2 p-sidebar-header-content'>
          <Button
            icon='pi pi-arrow-left'
            severity='danger'
            @click='hideForm'/>
          {{ t('hrm.report.contractStatisticsReport') }}
        </div>
        <div class='flex gap-2'>
          <SplitButton>
            <span class='align-items-center flex font-medium gap-2'>
              <AppIcon
                name='filter_alt'
                size='1.3'/>
              <span>Điều kiện lập</span>
            </span>
          </SplitButton>
          <Button
            icon='pi pi-file-export'
            label='Kết xuất'/>
          <Button
            icon='pi pi-print'
            label='In'/>
          <Button
            icon='pi pi-refresh'/>
        </div>
      </div>
    </template>
    <DataTable
      class='white-space-nowrap'
      group-rows-by='organizationId'
      :loading='isLoading'
      row-group-mode='rowspan'
      scroll-direction='both'
      scroll-height='flex'
      scrollable
      :show-gridlines='true'
      sort-field='organizationId'
      sort-mode='single'
      :sort-order='1'
      table-style='min-width: 200rem'
      :value='data'>
      <ColumnGroup type='header'>
        <Row>
          <Column
            header='STT'
            :rowspan='2'/>
          <Column

            header='Phòng ban'
            :rowspan='2'/>
          <Column

            header='Mã nhân sự'
            :rowspan='2'/>
          <Column

            header='Họ và tên'
            :rowspan='2'/>
          <Column
            header='Ngày sinh'
            :rowspan='2'/>
          <Column
            header='Chức vụ'
            :rowspan='2'/>
          <Column
            header='Chức danh'
            :rowspan='2'/>
          <Column
            header='Ngày vào công ty'
            :rowspan='2'/>
          <Column
            header='Ghi chú'
            :rowspan='2'/>
          <Column
            :colspan='13'
            header='Quá trình hợp đồng'/>
        </Row>

        <Row>
          <Column header='Lần ký'/>
          <Column header='Số hợp đồng'/>
          <Column header='Ngày ký'/>
          <Column header='Loại hợp đồng'/>
          <Column header='Thời hạn'/>
          <Column header='Ngày hiệu lực'/>
          <Column header='Ngày hết hạn'/>
          <Column header='Người ký'/>
          <Column header='Mức lương'/>
          <Column header='Ngạch lương'/>
          <Column header='Bậc lương'/>
          <Column header='Hệ số lương'/>
          <Column header='Phụ cấp'/>
        </Row>
      </ColumnGroup>

      <Column
        header-style='width:3rem'>
        <template #body='slotProps'>
          {{ slotProps.index + 1 }}
        </template>
      </Column>

      <Column
        field='organizationId'>
        <template #body='slotProps'>
          <span>{{ slotProps.data.organizationName ?? 'Không xác định' }}</span>
        </template>
      </Column>

      <Column
        field='code'/>
      <Column
        field='fullName'/>
      <Column
        field='birthDay'>
        <template #body='{data: {birthDay}}'>
          {{ birthDay ? moment(birthDay).format('DD/MM/YYYY') : '' }}
        </template>
      </Column>
      <Column field='position'/>
      <Column field='jobTitle'/>
      <Column>
        <template #body='{data: {joinDate}}'>
          {{ joinDate ? moment(joinDate).format('DD/MM/YYYY') : '' }}
        </template>
      </Column>
      <Column/>
      <Column/>
      <Column field='contract.code'/>
      <Column
        field='contract.signedDate'>
        <template #body='{data: {contract}}'>
          {{ contract?.signedDate ? moment(contract?.signedDate).format('DD/MM/YYYY') : '' }}
        </template>
      </Column>
      <Column field='contract.type'/>
      <Column>
        <template #body='{data: {contract}}'>
          {{ getYearMonthDiff(contract?.effectiveDate, contract?.expiryDate) }}
        </template>
      </Column>
      <Column>
        <template #body='{data: {contract}}'>
          {{ contract?.effectiveDate ? moment(contract?.effectiveDate).format('DD/MM/YYYY') : '' }}
        </template>
      </Column>
      <Column
        field='contract.expiryDate'>
        <template #body='{data: {contract}}'>
          {{ contract?.expiryDate ? moment(contract?.expiryDate).format('DD/MM/YYYY') : '' }}
        </template>
      </Column>
      <Column field='contract.signatory'/>
      <Column field='contractSalary.totalSalary'/>
      <Column field='contractSalary.grade'/>
      <Column field='contractSalary.scale'/>
      <Column field='contractSalary.coefficient'/>
      <Column>
        <template #body='{data: {contractSalaryBonus}}'>
          <pre>
{{ contractSalaryBonus?.map((b: any) => `${b.type}: ${b.amount}`).join('\n') }}
          </pre>
        </template>
      </Column>
    </DataTable>

  </Sidebar>
</template>

<script setup lang='ts'>
import { cloneDeep, get, throttle } from 'lodash';
import { storeToRefs } from 'pinia';
import Column from 'primevue/column';
import { useToast } from 'primevue/usetoast';
import { nextTick, onMounted, reactive, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { useDocumentRolesStore } from '@/apps/document/store/document-role';
import { getEmployeeContractReport } from '@/apps/hrm/api/graphql/contract';
import AppIcon from '@/common/components/app/AppIcon.vue';
import { DEFAULT_PAGE_SIZE } from '@/common/constants';
import useMoment from '@/common/helpers/mixins/use-moment';
import { getYearMonthDiff } from '@/common/helpers/time-util';
import type { Pageable } from '@/common/model/query';

const emits = defineEmits(['hide-dialog']);
const { t } = useI18n();
const isLoading = ref(true);
const visible = defineModel('visible', { type: Boolean });
const hideForm = () => {
  emits('hide-dialog');
};
const data = ref<any>([]);
const pageable = reactive<Pageable>({
  page: 0,
  size: 99999
});
const canLoadMore = ref(true);
const { userDeptRole } = storeToRefs(useDocumentRolesStore());
const isLoadMore = ref(true);
const {
  onResult: findEmployeeEducationReportResult,
  refetch: findEmployeeEducationReportRefetch,
} = getEmployeeContractReport(pageable);

const { moment } = useMoment();
findEmployeeEducationReportResult((res) => {
  const { edges } = get(res, 'data.getEmployeeContractReport', { edges: [] });

  if (isLoadMore.value) {
    data.value = [
      ...data.value,
      ...edges.map((edge: any) => cloneDeep(edge.node)),
    ];
  } else {
    data.value = edges.map((edge: any) => cloneDeep(edge.node));
  }

  canLoadMore.value = edges.length >= DEFAULT_PAGE_SIZE;
  isLoadMore.value = false;
  isLoading.value = false;
});

function scrollEvent(event: Event) {
  const {
    scrollTop,
    scrollHeight,
    clientHeight
  } = event.target as HTMLElement;
  if (scrollTop + clientHeight + 1 >= scrollHeight && canLoadMore.value) {
    isLoadMore.value = true;
    pageable.page += 1;
  }
}

function addScrollEventListener(selector: string) {
  const scrollableContainer = document.querySelector(selector);
  if (scrollableContainer) {
    scrollableContainer.addEventListener('scrollend', throttle(scrollEvent, 1000));
  }
}

onMounted(() => {
  nextTick(() => {
    addScrollEventListener('.p-datatable-wrapper');
  });
});
</script>

<style scoped>
.white-space-nowrap {
  white-space: nowrap;
}
</style>