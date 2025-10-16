<template>
  <div class='align-items-center flex flex-wrap justify-content-between pb-2 text-primary'>
    <span class='font-bold text-lg'>{{ t('hrm.receivingDoc.titleTab') }}</span>
  </div>

  <DataTable
    v-bind='DEFAULT_DATATABLE_CONFIG'
    v-model:selection='selectedRow'
    class='overflow-auto'
    row-hover
    selection-mode='single'
    striped-rows
    style='max-height: unset'
    :value='receivingDocs'>
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
      field='receivingDocName'
      :header='t(`hrm.receivingDoc.receivingDocName`)'
      style='min-width: 10vw'>
    </Column>
    <Column
      class='text-center'
      field='receivingDate'
      :header='t(`hrm.receivingDoc.receivingDate`)'
      style='min-width: 10vw'>
      <template #body='{ data: { receivingDate } }'>
        {{ receivingDate && moment(receivingDate).format('DD/MM/YYYY') }}
      </template>
    </Column>
    <Column
      field='files'
      :header='t(`hrm.receivingDoc.attachment`)'
      style='min-width: 10vw'>
      <template #body='{ data: { files } }'>
        <div
          v-if='files.length'
          class='align-items-center flex gap-2'>
          <img
            alt=''
            class='file-extension-icon h-2rem w-2rem'
            draggable='false'
            :src='getFileIcon(files[0].name.split(".")[files[0].name.split(".").length - 1])'
            @error='handleFileImageError'/>
          <div class='align-content-center word-break-break-word'>
            {{ files[0].name }}
          </div>
        </div>
      </template>
    </Column>
    <Column
      class='text-center'
      field='files'
      :header='t(`hrm.receivingDoc.size`)'
      style='min-width: 7vw'>
      <template #body='{ data: { files } }'>
        <div
          v-if='files.length'>
          {{ files[0].size }}KB
        </div>

      </template>
    </Column>
    <Column
      field='receiver'
      :header='t(`hrm.receivingDoc.receiver`)'
      style='min-width: 7vw'>
      <template #body='{ data: { receiver } }'>
        <div
          v-if='receiver'
          class='align-items-center flex justify-content-center'>
          <AppGroupAvatar
            v-if='receiver'
            avatar-size='2.3'
            :user-ids='[receiver]'/>
        </div>
      </template>
    </Column>
    <Column
      align-frozen='right'
      body-class='surface-card p-2'
      frozen
      style='max-width: 4rem'>
      <template #body='{data}'>
        <Button
          v-if='!props.isEditBySelf'
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

</template>

<script setup lang='ts'>
import Column from 'primevue/column';
import { useConfirm } from 'primevue/useconfirm';
import { inject, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import {
  deleteEmployeeReceivingDoc,
  getAllEmployeeReceivingDocBySnapshotId
} from '@/apps/hrm/api/graphql/employee-training-process';
import type { ReceivingDoc } from '@/apps/hrm/model/employee';
import type { IBookingCar } from '@/apps/vehicle/model/bookingCar';
import AppGroupAvatar from '@/common/components/app/AppGroupAvatar.vue';
import { DEFAULT_DATATABLE_CONFIG } from '@/common/constants';
import { toastSuccess } from '@/common/helpers/custom-toast-service';
import { getFileIcon, handleFileImageError } from '@/common/helpers/file-utils';
import useMoment from '@/common/helpers/mixins/use-moment';

const props = defineProps({
  snapshotId: {
    type: String,
    default: null
  },
  isEditBySelf: {
    type: Boolean,
    default: false
  }
});
const { t } = useI18n();
const { moment } = useMoment();
const selectedRow = ref<ReceivingDoc>({} as ReceivingDoc);
const showForm = ref(false);
const menuRef = ref();
const confirm = useConfirm();
const receivingDocs = ref<ReceivingDoc[]>([]);

function toggleActionMenu(event: Event, data: IBookingCar) {
  menuRef.value.toggle(event);
  selectedRow.value = data;
}

const {
  onResult: getAllEmployeeReceivingDocBySnapshotIdResult,
  refetch: getAllEmployeeReceivingDocBySnapshotIdRefetch
} =
  getAllEmployeeReceivingDocBySnapshotId(
    props.snapshotId
  );

getAllEmployeeReceivingDocBySnapshotIdResult((res) => {
  receivingDocs.value = res.data.getAllEmployeeReceivingDocBySnapshotId;
});

const {
  mutate: deleteEmployeeReceivingDocMutate,
  onDone: deleteEmployeeReceivingDocDone,
} =
  deleteEmployeeReceivingDoc();

const confirmDeleteWorkProcess = () => {
  confirm.require({
    message: t('common.confirmDelete', { itemName: selectedRow.value?.receivingDocName, }),
    header: t('common.delete'),
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: t('common.delete'),
    rejectLabel: t('common.cancel'),
    accept: () => {
      handleDeleteWorkProcess();
    },
  });
};

const handleDeleteWorkProcess = () => {
  deleteEmployeeReceivingDocMutate({ id: selectedRow.value?.id });
};

deleteEmployeeReceivingDocDone(() => {
  toastSuccess({ message: t('Xóa thành công') });
  getAllEmployeeReceivingDocBySnapshotIdRefetch();
});

const menuActions = [
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
  getAllEmployeeReceivingDocBySnapshotIdRefetch();
}

const injectedRefreshTable = inject('refreshReceivingDocTable', ref(false));

watch(injectedRefreshTable, (newValue) => {
  if (newValue) {
    getAllEmployeeReceivingDocBySnapshotIdRefetch();
    injectedRefreshTable.value = false;
  }
});
</script>

<style scoped>

</style>