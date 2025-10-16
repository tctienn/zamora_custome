<template>
  <div class='align-items-center flex flex-wrap justify-content-between mb-2'>
    <span class='font-bold text-primary text-xl'>{{
      t('document.groupReceivingDocuments.tableTitle')
    }}</span>
    <div class='block p-input-icon-left'>
      <div class='actions flex gap-2'>
        <ButtonIcon
          class='btn-create'
          icon='add'
          :label="t('common.create')"
          @click='showGroupReceivingDocumentsFormDialog'/>
        <ButtonIcon
          icon='restart_alt'
          outlined
          @click='reload'/>
      </div>
    </div>
  </div>
  <DataTable
    v-model:selection='selectedRow'
    :total-records='totalRecords'
    :value='groupReceivingDocumentsList'
    v-bind='DEFAULT_DATATABLE_CONFIG'>
    <template #empty>
      <span class='block font-bold text-600 text-center'>{{
        t('common.emptyRecords', {
          itemType: toLower(t('document.groupReceivingDocuments.objectName')),
        })
      }}</span>
    </template>
    <Column
      class='text-center'
      header='#'
      style='width: 5%'>
      <template #body='slotProps'>
        {{ slotProps.index + 1 }}
      </template>
    </Column>
    <Column
      field='code'
      :header="t('document.groupReceivingDocuments.code')"></Column>
    <Column
      field='name'
      :header="t('document.groupReceivingDocuments.name')"></Column>

    <Column
      field='users'
      :header="t('document.groupReceivingDocuments.members')">
      <template #body='{ data: { users } }'>
        <div class='flex justify-content-center'>
          <AppGroupAvatar
            v-if='users'
            avatar-size='2.5'
            :user-ids='[
              ...new Set<string>(
                users?.map((item: any) => item.userId?.toString()) || [],
              ),
            ]'/>
        </div>
      </template>
    </Column>

    <Column
      class='text-center'
      :exclude-global-filter='true'
      field='status'
      :header="t('common.status')">
      <template #body='{ data: { status } }'>
        <span
          class='status-badge'
          :class="`status-${status ? 'active' : 'deactivate'}`">{{
            status
              ? t(`common.statuses.active`)
              : t('common.statuses.deactivate')
          }}</span>
      </template>
    </Column>

    <Column
      v-if='menuActions.length'
      class='text-center'
      :header="t('common.action')"
      header-style='width: 10%'>
      <template #body='{ data }'>
        <ButtonIcon
          v-tooltip.top="t('common.action')"
          class='text-color'
          icon='more_horiz'
          icon-size='1.7'
          rounded
          text
          @click='toggleActionMenu({ event: $event, data: data })'/>
      </template>
    </Column>
  </DataTable>

  <Menu
    ref='menuAction'
    :model='menuActions'
    :popup='true'>
    <template #item='{ item: { icon, label } }'>
      <MenuItem
        :icon='icon'
        :label='label'/>
    </template>
  </Menu>

  <GroupReceivingDocumentsForm
    v-if='groupReceivingDocumentsFormVisible'
    :id='groupReceivingDocuments?.id'
    :visible-dialog='groupReceivingDocumentsFormVisible'
    @hide-dialog='hideGroupReceivingDocumentsFormDialog'
    @reload='reload'/>
</template>

<script lang='ts' setup>
import { cloneDeep, toLower } from 'lodash';
import Column from 'primevue/column';
import { useConfirm } from 'primevue/useconfirm';
import { inject, reactive, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import {
  deleteGroupReceivingDocuments,
  getAllGroupReceivingDocuments,
} from '@/apps/document/api/graphql/group-receiving-documents';
import type { GroupReceivingDocumentsInterface } from '@/apps/document/model/groupReceivingDocuments';
import GroupReceivingDocumentsForm
  from '@/apps/document/views/categories/groupReceivingDocuments/GroupReceivingDocumentsForm.vue';
import AppGroupAvatar from '@/common/components/app/AppGroupAvatar.vue';
import { DEFAULT_DATATABLE_CONFIG } from '@/common/constants';
import { toastErrorData, toastSuccess, } from '@/common/helpers/custom-toast-service';

const { t } = useI18n() || {};
const searchKeyword = ref('');
const getAllGroupReceivingDocumentsLoading = ref(true);
const groupReceivingDocumentsList = ref<GroupReceivingDocumentsInterface[]>([]);
let isDetail = ref(false);
const selectedRow = ref();
const searchTerm = inject('searchTerm', ref(''));
const searchTermUpdate = inject('updateSearchTerm', (value: string) => void {});

const searchParams = reactive({ keyword: '' });
const totalRecords = ref(0);
const {
  onResult: getAllGroupReceivingDocumentsResult,
  onError: getAllGroupReceivingDocumentsError,
  refetch: getAllGroupReceivingDocumentsRefetch,
  variables: searchGroupReceivingDocumentsVariable,
} = getAllGroupReceivingDocuments(searchParams);

getAllGroupReceivingDocumentsResult((res) => {
  groupReceivingDocumentsList.value = res.data.getAllGroupReceivingDocuments;
});

getAllGroupReceivingDocumentsError((error) => {
  getAllGroupReceivingDocumentsLoading.value = false;
  toastErrorData({
    prefix: 'hrm.groupReceivingDocuments.errors',
    error,
  });
});

function reload() {
  searchParams.keyword = '';
  getAllGroupReceivingDocumentsRefetch(searchParams);
}

function showGroupReceivingDocumentsFormDialog() {
  groupReceivingDocuments.value = {} as GroupReceivingDocumentsInterface;
  groupReceivingDocumentsFormVisible.value = true;
  isDetail.value = false;
}

function editGroupReceivingDocuments() {
  groupReceivingDocumentsFormVisible.value = true;
  isDetail.value = false;
}

function hideGroupReceivingDocumentsFormDialog() {
  groupReceivingDocumentsFormVisible.value = false;
  groupReceivingDocuments.value = {} as GroupReceivingDocumentsInterface;
  searchParams.keyword = '';
  searchTermUpdate('');
}

const menuAction = ref();
const menuActions = [
  {
    label: t('common.edit'),
    icon: 'edit',
    command: () => {
      editGroupReceivingDocuments();
    },
  },
  {
    label: t('common.delete'),
    icon: 'delete',
    command: () => {
      handleDeleteGroupReceivingDocuments();
    },
  },
];

function toggleActionMenu({
  event,
  data,
}: {
  event: Event;
  data: GroupReceivingDocumentsInterface;
}) {
  menuAction.value.toggle(event);
  groupReceivingDocuments.value = cloneDeep(data);
  selectedRow.value = data;
}

const groupReceivingDocuments = ref<GroupReceivingDocumentsInterface>({
  status: false,
  users: undefined,
  code: '',
  id: undefined,
  name: '',
});
const groupReceivingDocumentsFormVisible = ref(false);

const {
  mutate: deleteGroupReceivingDocumentsMutate,
  onDone: deleteGroupReceivingDocumentsDone,
  onError: deleteGroupReceivingDocumentsError,
} = deleteGroupReceivingDocuments();

const confirm = useConfirm();

function handleDeleteGroupReceivingDocuments() {
  confirm.require({
    message: t('common.confirmDelete', {
      itemType: t('document.groupReceivingDocuments.objectName'),
      itemName: groupReceivingDocuments.value.name,
    }),
    header: t('common.confirm'),
    acceptLabel: t('common.delete'),
    acceptClass: 'p-button-danger',
    icon: 'pi pi-exclamation-triangle',
    accept: () => {
      deleteGroupReceivingDocumentsMutate({ id: groupReceivingDocuments.value.id, });
    },
  });
}

deleteGroupReceivingDocumentsDone(() => {
  toastSuccess({
    message: t('common.result.message.deleted', {
      itemType: t('document.groupReceivingDocuments.objectName'),
      itemName: groupReceivingDocuments.value.name,
    }),
  });
  confirm.close();
  reload();
});

deleteGroupReceivingDocumentsError((error: any) => {
  toastErrorData({ error });
});

watch(searchTerm, (newValue) => {
  groupReceivingDocumentsList.value = [];
  searchParams.keyword = newValue;
  searchGroupReceivingDocumentsVariable.value = searchParams;
});
</script>

<script lang='ts'>
export default { name: 'GroupReceivingDocumentsManager' };
</script>
