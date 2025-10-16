<template>
  <div class='align-items-center flex flex-wrap justify-content-between mt-4 pb-2 text-primary'>
    <span class='font-bold text-lg'>{{ t('hrm.certificate.titleTab') }}</span>
  </div>

  <DataTable
    v-model:selection='selectedRow'
    class='overflow-auto'
    row-hover
    scrollable
    selection-mode='single'
    :show-gridlines='isDetail'
    striped-rows
    style='max-height: unset'
    :value='certificates'>
    <Column
      class='text-center'
      frozen
      header='TT'>
      <template #body='slotProps'>
        <div
          class='align-items-center flex items-center justify-content-center'>
          {{ slotProps.index + 1 }}
        </div>
      </template>
    </Column>
    <Column
      field='fromMonth'
      :header='t(`hrm.certificate.fromMonth`)'
      style='min-width: 10vw'>
      <template #body='{ data: { fromMonth } }'>
        {{ fromMonth && moment(fromMonth).format('MM/YYYY') }}
      </template>
    </Column>
    <Column
      field='toMonth'
      :header='t(`hrm.certificate.toMonth`)'
      style='min-width: 10vw'>
      <template #body='{ data: { toMonth } }'>
        {{ toMonth && moment(toMonth).format('MM/YYYY') }}
      </template>
    </Column>
    <Column
      field='name'
      frozen
      :header='t(`hrm.certificate.name`)'
      style='min-width: 10vw'>
    </Column>
    <Column
      field='trainingField'
      :header='t(`hrm.certificate.trainingField`)'
      style='min-width: 10vw'>
    </Column>
    <Column
      field='trainingForm'
      :header='t(`hrm.certificate.trainingForm`)'
      style='min-width: 10vw'>
    </Column>
    <Column
      field='issuingPlace'
      :header='t(`hrm.certificate.issuingPlace`)'
      style='min-width: 10vw'>
    </Column>
    <Column
      field='result'
      :header='t(`hrm.certificate.result`)'
      style='min-width: 7vw'>
    </Column>
    <Column
      field='certificateType'
      :header='t(`hrm.certificate.certificateType`)'
      style='min-width: 10vw'>
    </Column>
    <Column
      class='text-center'
      field='fromDate'
      :header='t(`hrm.certificate.fromDate`)'
      style='min-width: 7vw'>
      <template #body='{ data: { fromDate } }'>
        {{ fromDate && moment(fromDate).format('DD/MM/YYYY') }}
      </template>
    </Column>
    <Column
      class='text-center'
      field='toDate'
      :header='t(`hrm.certificate.toDate`)'
      style='min-width: 10vw'>
      <template #body='{ data: { toDate } }'>
        {{ toDate && moment(toDate).format('DD/MM/YYYY') }}
      </template>
    </Column>
    <Column
      field='version'
      :header='t(`hrm.certificate.version`)'
      style='min-width: 7vw'>
    </Column>
    <Column
      class='text-center'
      field='releaseDate'
      :header='t(`hrm.certificate.releaseDate`)'
      style='min-width: 10vw'>
    </Column>
    <Column
      v-if='!isDetail'
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

  <CertificateForm
    v-if='showForm'
    :id='selectedRow.id'
    :employee-id='employeeId'
    :snapshot-id='snapshotId'
    :visible-dialog='showForm'
    @hide-dialog='hideDialogFn'/>
</template>

<script lang='ts' setup>
import Column from 'primevue/column';
import { useConfirm } from 'primevue/useconfirm';
import { inject, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import {
  deleteEmployeeCertificate,
  getAllEmployeeCertificateBySnapshotId
} from '@/apps/hrm/api/graphql/employee-training-process';
import type { EmployeeCertificate } from '@/apps/hrm/model/employee';
import CertificateForm from '@/apps/hrm/views/profile/form/training-process/CertificateForm.vue';
import type { IBookingCar } from '@/apps/vehicle/model/bookingCar';
import { toastSuccess } from '@/common/helpers/custom-toast-service';
import useMoment from '@/common/helpers/mixins/use-moment';

const props = defineProps({
  snapshotId: {
    type: String,
    default: null
  },
  employeeId: {
    type: String,
    default: null
  },
  isDetail: {
    type: Boolean,
    default: false
  },
});
const { t } = useI18n();
const { moment } = useMoment();
const selectedRow = ref<EmployeeCertificate>({} as EmployeeCertificate);
const showForm = ref(false);
const menuRef = ref();
const confirm = useConfirm();
const certificates = ref<EmployeeCertificate[]>([]);

function toggleActionMenu(event: Event, data: IBookingCar) {
  menuRef.value.toggle(event);
  selectedRow.value = data;
}

const {
  onResult: getAllCertificateBySnapshotIdResult,
  refetch: getAllCertificateBySnapshotIdRefetch
} =
  getAllEmployeeCertificateBySnapshotId(
    props.snapshotId
  );

getAllCertificateBySnapshotIdResult((res) => {
  certificates.value = res.data.getAllEmployeeCertificateBySnapshotId;
});

const {
  mutate: deleteCertificateMutate,
  onDone: deleteCertificateDone,
} =
  deleteEmployeeCertificate();

const confirmDeleteCertificate = () => {
  confirm.require({
    message: t('common.confirmDelete', { itemName: selectedRow.value?.name, }),
    header: t('common.delete'),
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: t('common.delete'),
    rejectLabel: t('common.cancel'),
    accept: () => {
      handleDeleteCertificate();
    },
  });
};

const handleDeleteCertificate = () => {
  deleteCertificateMutate({ id: selectedRow.value?.id });
};

deleteCertificateDone(() => {
  toastSuccess({ message: t('Xóa thành công') });
  getAllCertificateBySnapshotIdRefetch();
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
      confirmDeleteCertificate();
    },
  },
];

function hideDialogFn() {
  showForm.value = false;
  getAllCertificateBySnapshotIdRefetch();
}

const injectedRefreshTable = inject('refreshCertificateTable', ref(false));

watch(injectedRefreshTable, (newValue) => {
  if (newValue) {
    getAllCertificateBySnapshotIdRefetch();
    injectedRefreshTable.value = false;
  }
});

const isEditBySelf = inject('isEditBySelf', ref(false));
const profileStatus = inject('profileStatus', ref(''));
</script>

<style scoped>

</style>