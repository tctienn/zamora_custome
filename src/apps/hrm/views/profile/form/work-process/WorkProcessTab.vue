<template>
  <div class='align-items-center flex flex-wrap justify-content-between pb-2 text-primary'>
    <span class='font-bold text-lg'>{{ t('hrm.workProcess.titleTab') }}</span>
  </div>

  <DataTable
    v-model:selection='selectedRow'
    class='overflow-auto'
    row-hover
    selection-mode='single'
    style='max-height: unset'
    :value='workProcesses'
    v-bind='DEFAULT_DATATABLE_CONFIG'>
    <Column
      class='text-center'
      frozen
      header='#'
      style='width: 5%'>
      <template #body='slotProps'>
        <div
          class='align-items-center flex items-center justify-content-center'>
          {{ slotProps.index + 1 }}
        </div>
      </template>
    </Column>
    <Column
      class='text-center'
      field='fromMonth'
      :header='t(`hrm.workProcess.fromMonth`)'
      style='min-width: 7vw'>
      <template #body='{ data: { fromMonth } }'>
        {{ fromMonth && moment(fromMonth).format('MM/YYYY') }}
      </template>
    </Column>
    <Column
      class='text-center'
      field='toMonth'
      :header='t(`hrm.workProcess.toMonth`)'
      style='min-width: 7vw'>
      <template #body='{ data: { toMonth } }'>
        {{ toMonth && moment(toMonth).format('MM/YYYY') }}
      </template>
    </Column>
    <Column
      field='companyUnit'
      :header='t(`hrm.workProcess.companyUnit`)'
      style='min-width: 10vw'>
    </Column>
    <Column
      field='address'
      :header='t(`hrm.workProcess.address`)'
      style='min-width: 10vw'>
    </Column>
    <Column
      field='jobPosition'
      :header='t(`hrm.workProcess.jobPosition`)'
      style='min-width: 10vw'>
      <template #body='{data: {jobPosition}}'>
        <div style='white-space: pre-line; word-break: break-word;'>
          {{ jobPosition }}
        </div>
      </template>
    </Column>
    <Column
      field='salary'
      :header='t(`hrm.workProcess.salary`)'
      style='min-width: 10vw'>
    </Column>
    <Column
      field='referencesPerson'
      :header='t(`hrm.workProcess.references`)'
      style='min-width: 10vw'>
    </Column>
    <Column
      field='phone'
      :header='t(`hrm.workProcess.phone`)'
      style='min-width: 10vw'>
    </Column>
    <Column
      field='description'
      :header='t(`hrm.workProcess.description`)'
      style='min-width: 10vw'>
    </Column>
    <Column
      field='reasonForLeaving'
      :header='t(`hrm.workProcess.reasonForLeaving`)'
      style='min-width: 10vw'>
    </Column>
    <Column
      align-frozen='right'
      body-class='surface-card p-2'
      frozen
      style='max-width: 4rem'>
      <template #body='{data}'>
        <Button
          v-if='!isEditBySelf && !profileStatus || profileStatus === "DRAFT" && isEditBySelf'
          icon='pi pi-ellipsis-v'
          rounded
          text
          @click='toggleActionMenu($event, data)'></Button>
      </template>
    </Column>
  </DataTable>

  <Menu
    ref='menuRef'
    :model='menuActions'
    :popup='true'>
  </Menu>

  <WorkProcessForm
    v-if='showForm'
    :id='selectedRow.id'
    :employee-id='employeeId'
    :visible-dialog='showForm'
    @hide-dialog='hideDialogFn'/>
</template>

<script lang='ts' setup>
import Column from 'primevue/column';
import { useConfirm } from 'primevue/useconfirm';
import { inject, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { deleteWorkProcess, getAllWorkProcessByEmployeeId } from '@/apps/hrm/api/graphql/employee-work-process';
import type { WorkProcess } from '@/apps/hrm/model/employee';
import WorkProcessForm from '@/apps/hrm/views/profile/form/work-process/WorkProcessForm.vue';
import type { IBookingCar } from '@/apps/vehicle/model/bookingCar';
import { DEFAULT_DATATABLE_CONFIG } from '@/common/constants';
import { toastSuccess } from '@/common/helpers/custom-toast-service';
import useMoment from '@/common/helpers/mixins/use-moment';

const props = defineProps({
  employeeId: {
    type: String,
    default: null
  },
});
const { t } = useI18n();
const { moment } = useMoment();
const selectedRow = ref<WorkProcess>({} as WorkProcess);
const showForm = ref(false);
const menuRef = ref();
const confirm = useConfirm();
const workProcesses = ref<WorkProcess[]>([]);

function toggleActionMenu(event: Event, data: IBookingCar) {
  menuRef.value.toggle(event);
  selectedRow.value = data;
}

const {
  onResult: getAllWorkProcessByEmployeeIdResult,
  refetch: getAllWorkProcessByEmployeeIdRefetch
} =
  getAllWorkProcessByEmployeeId(
    props.employeeId
  );

getAllWorkProcessByEmployeeIdResult((res) => {
  workProcesses.value = res.data.getAllWorkProcessByEmployeeId;
});

const {
  mutate: deleteWorkProcessMutate,
  onDone: deleteWorkProcessDone,
} =
  deleteWorkProcess();

const confirmDeleteWorkProcess = () => {
  confirm.require({
    message: t('common.confirmDelete'),
    header: t('common.delete'),
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: t('common.delete'),
    acceptClass: 'p-button-danger',
    rejectLabel: t('common.cancel'),
    accept: () => {
      handleDeleteWorkProcess();
    },
  });
};

const handleDeleteWorkProcess = () => {
  deleteWorkProcessMutate({ id: selectedRow.value?.id });
};

deleteWorkProcessDone(() => {
  toastSuccess({ message: t('Xóa thành công') });
  getAllWorkProcessByEmployeeIdRefetch();
});

const menuActions = [
  {
    key: 'edit',
    label: t('common.edit'),
    icon: 'pi pi-pencil',
    command: () => {
      showForm.value = true;
    },
  },
  {
    key: 'delete',
    label: t('common.delete'),
    icon: 'pi pi-trash',
    command: () => {
      confirmDeleteWorkProcess();
    },
  },
];

function hideDialogFn() {
  showForm.value = false;
  getAllWorkProcessByEmployeeIdRefetch();
}

const injectedRefreshTable = inject('refreshWorkProcessTable', ref(false));

watch(injectedRefreshTable, (newValue) => {
  if (newValue) {
    getAllWorkProcessByEmployeeIdRefetch();
    injectedRefreshTable.value = false;
  }
});

const isEditBySelf = inject('isEditBySelf', ref(false));
const profileStatus = inject('profileStatus', ref(''));
</script>

<style scoped>
:deep(.p-datatable-wrapper) {
  overflow: hidden !important;
}

:deep(.p-datatable-wrapper:hover) {
  overflow: auto !important;
}
</style>