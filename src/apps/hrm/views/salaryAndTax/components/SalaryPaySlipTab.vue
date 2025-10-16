<template>
  <div class='align-items-center flex justify-content-between p-2'>
    <div class='font-semibold text-2xl'>Phiếu lương</div>
    <ButtonIcon
      v-tooltip.left='t("common.create")'
      class='mr-2'
      icon='add_circle_outline'
      icon-size='1.7'
      rounded
      text
      @click='employeePayslipFormVisible = true'/>
  </div>

  <div class='table-container'>
    <DataTable
      v-model:selection='selectedRow'
      class='p-datatable-sm'
      column-resize-mode='fit'
      resizable-columns
      v-bind='{...DEFAULT_DATATABLE_CONFIG}'
      scroll-height='60vh'
      scrollable
      :value='paySlipData'>
      <Column
        header='TT'
        :style="{ width: '50px' }">
        <template #body='slotProps'>
          <div
            class='align-items-center flex items-center justify-content-center'>
            {{ slotProps.index + 1 }}
          </div>
        </template>
      </Column>
      <Column
        field='fullName'
        :header='t("hrm.relationship.name")'></Column>
      <Column
        class='text-center'
        field='code'
        :header='t("admin.user.userCode")'></Column>
      <Column
        class='text-center'
        field='jobTitleName'
        header='Chức vụ'></Column>
      <Column
        :header='t(`hrm.salary.createdMonth`)'>
        <template #body='{data}'>
          <div
            class='align-items-center flex items-center justify-content-center'>
            {{ data.month }}/{{ data.year }}
          </div>
        </template>
      </Column>
      <Column
        align-frozen='right'
        body-class='surface-card p-2'
        frozen
        style='width: 3rem'>
        <template #body='{data}'>
          <Button
            icon='pi pi-ellipsis-v'
            rounded
            text
            @click='showActionMenus($event, data)'></Button>
        </template>
      </Column>
    </DataTable>
  </div>

  <EmployeePayslipForm
    v-if='employeePayslipFormVisible'
    :id='selectedRow?.id'
    :visible-dialog='employeePayslipFormVisible'
    @hide-dialog='hideDialog'/>

  <Menu
    ref='actionMenusRef'
    :model='actionMenus'
    popup></Menu>
</template>

<script setup lang='ts'>
import { get } from 'lodash';
import Button from 'primevue/button';
import Column from 'primevue/column';
import DataTable from 'primevue/datatable';
import type Menu from 'primevue/menu';
import { useConfirm } from 'primevue/useconfirm';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { deleteEmployeePayslip, searchEmployeePayslip } from '@/apps/hrm/api/graphql/salary';
import EmployeePayslipForm from '@/apps/hrm/views/salaryAndTax/employeePayslip/EmployeePayslipForm.vue';
import ButtonIcon from '@/common/components/custom/ButtonIcon.vue';
import { DEFAULT_DATATABLE_CONFIG } from '@/common/constants';
import { toastSuccess } from '@/common/helpers/custom-toast-service';

const { t } = useI18n();
const employeePayslipFormVisible = ref(false);

const paySlipData = ref([]);
const actionMenusRef = ref();
const selectedRow = ref();

const {
  onResult,
  refetch
} = searchEmployeePayslip();

onResult((res) => {
  const { edges } = get(res, 'data.searchEmployeePayslip', { edges: [], });
  paySlipData.value = edges.map((edge: any) => ({ ...edge.node }));
});

const showActionMenus = (e: Event, data: any) => {
  actionMenusRef.value?.toggle(e);
  selectedRow.value = data;
};

const hideDialog = () => {
  selectedRow.value = undefined;
  refetch();
  employeePayslipFormVisible.value = false;
};

const {
  mutate,
  onDone
} = deleteEmployeePayslip();

const actionMenus = [
  {
    key: 'edit',
    label: t('common.edit'),
    icon: 'pi pi-pencil',
    command: () => {
      employeePayslipFormVisible.value = true;
    },
  },
  {
    key: 'delete',
    label: t('common.delete'),
    icon: 'pi pi-trash',
    class: 'delete-action',
    command: () => {
      confirmDelete();
    },
  },
];
const confirm = useConfirm();
const confirmDelete = () => {
  confirm.require({
    message: t('common.confirmDelete', { itemName: t('hrm.salary.salaryAndTax.salaryType.bill') + ' ' + selectedRow.value.fullName }),
    header: t('common.delete'),
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: t('common.delete'),
    acceptClass: 'p-button-danger',
    rejectLabel: t('common.cancel'),
    accept: () => {
      mutate({ id: selectedRow.value.id });
    },
  });
};

onDone(() => {
  refetch();
  toastSuccess({ message: t('common.deleteSuccess') });
});

function formatCurrency(value: string) {
  if (!value) {
    return '0';
  }
  return parseInt(value).toLocaleString('vi-VN');
}
</script>

<style scoped>
.table-container {
  overflow-x: auto;
  overflow-y: auto;
  height: calc(100vh - 290px);
  width: 100%;
}

:deep(.p-datatable) {
  font-size: 13px;
}

:deep(.p-datatable-header) {
  padding: 8px 12px;
  font-weight: 600;
}

:deep(.p-datatable-tbody > tr > td) {
  padding: 6px 8px;
}

:deep(.p-datatable-thead > tr > th) {
  padding: 8px;
  background-color: #f5f5f5;
  font-weight: 600;
}
</style>