<template>
  <div class='align-items-center flex flex-wrap justify-content-between pb-2 text-primary'>
    <span class='font-bold text-lg'>{{ t('hrm.trainingProcess.titleTab') }}</span>
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
    :value='trainingProcesses'>
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
      class='text-center'
      field='fromMonth'
      :header='t(`hrm.trainingProcess.fromMonth`)'
      style='min-width: 10vw'>
      <template #body='{ data: { fromMonth } }'>
        {{ fromMonth && moment(fromMonth).format('MM/YYYY') }}
      </template>
    </Column>
    <Column
      class='text-center'
      field='toMonth'
      :header='t(`hrm.trainingProcess.toMonth`)'
      style='min-width: 10vw'>
      <template #body='{ data: { toMonth } }'>
        {{ toMonth && moment(toMonth).format('MM/YYYY') }}
      </template>
    </Column>
    <Column
      field='professionalLevel'
      :header='t(`hrm.trainingProcess.professionalLevel`)'
      style='min-width: 10vw'>
    </Column>
    <Column
      field='major'
      :header='t(`hrm.trainingProcess.major`)'
      style='min-width: 10vw'>
    </Column>
    <Column
      field='issuingPlace'
      :header='t(`hrm.trainingProcess.issuingPlace`)'
      style='min-width: 10vw'>
    </Column>
    <Column
      field='trainingSystem'
      :header='t(`hrm.trainingProcess.trainingSystem`)'
      style='min-width: 10vw'>
    </Column>
    <Column
      class='text-center'
      field='yearGraduation'
      :header='t(`hrm.trainingProcess.yearGraduation`)'
      style='min-width: 7vw'>
    </Column>
    <Column
      field='classification'
      :header='t(`hrm.trainingProcess.classification`)'
      style='min-width: 7vw'>
    </Column>
    <Column
      class='text-center'
      field='issueDate'
      :header='t(`hrm.trainingProcess.issueDate`)'
      style='min-width: 7vw'>
      <template #body='{ data: { issueDate } }'>
        {{ issueDate && moment(issueDate).format('DD/MM/YYYY') }}
      </template>
    </Column>
    <Column
      class='text-center'
      field='mainDegree'
      :header='t(`hrm.trainingProcess.mainDegree`)'
      style='min-width: 10vw'>
      <template #body='{ data: { mainDegree } }'>
        <AppIcon
          v-if='mainDegree'
          name='check'
          size='1.7'/>
      </template>
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

  <TrainingProcessForm
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
  deleteTrainingProcess,
  getAllTrainingProcessBySnapshotId
} from '@/apps/hrm/api/graphql/employee-training-process';
import type { FamilyRelationshipInfo, TrainingProcess } from '@/apps/hrm/model/employee';
import TrainingProcessForm from '@/apps/hrm/views/profile/form/training-process/TrainingProcessForm.vue';
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
const selectedRow = ref<FamilyRelationshipInfo>({} as FamilyRelationshipInfo);
const showForm = ref(false);
const menuRef = ref();
const confirm = useConfirm();
const trainingProcesses = ref<TrainingProcess[]>([]);

function toggleActionMenu(event: Event, data: IBookingCar) {
  menuRef.value.toggle(event);
  selectedRow.value = data;
}

const {
  onResult: getAllTrainingProcessBySnapshotIdResult,
  refetch: getAllTrainingProcessBySnapshotIdRefetch
} =
  getAllTrainingProcessBySnapshotId(
    props.snapshotId
  );

getAllTrainingProcessBySnapshotIdResult((res) => {
  trainingProcesses.value = res.data.getAllTrainingProcessBySnapshotId;
});

const {
  mutate: deleteTrainingProcessMutate,
  onDone: deleteTrainingProcessDone,
} =
  deleteTrainingProcess();

const confirmDeleteTrainingProcess = () => {
  confirm.require({
    message: t('common.confirmDelete', { itemName: selectedRow.value?.name, }),
    header: t('common.delete'),
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: t('common.delete'),
    rejectLabel: t('common.cancel'),
    accept: () => {
      handleDeleteTrainingProcess();
    },
  });
};

const handleDeleteTrainingProcess = () => {
  deleteTrainingProcessMutate({ id: selectedRow.value?.id });
};

deleteTrainingProcessDone(() => {
  toastSuccess({ message: t('Xóa thành công') });
  getAllTrainingProcessBySnapshotIdRefetch();
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
      confirmDeleteTrainingProcess();
    },
  },
];

function hideDialogFn() {
  showForm.value = false;
  getAllTrainingProcessBySnapshotIdRefetch();
}

const injectedRefreshTable = inject('refreshTrainingProcessTable', ref(false));

watch(injectedRefreshTable, (newValue) => {
  if (newValue) {
    getAllTrainingProcessBySnapshotIdRefetch();
    injectedRefreshTable.value = false;
  }
});

const isEditBySelf = inject('isEditBySelf', ref(false));
const profileStatus = inject('profileStatus', ref(''));
</script>

<style scoped>

</style>