<template>
  <div class='align-items-center flex flex-wrap justify-content-between mb-2'>
    <span class='font-bold text-primary text-xl'>{{
      t('document.fileType.tableTitle')
    }}</span>
    <div class='block p-input-icon-left'>
      <div class='actions flex gap-2'>
        <ButtonIcon
          class='btn-create'
          icon='add'
          :label="t('common.create')"
          @click='showFileTypeFormDialog'/>
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
    :value='fileTypes'
    v-bind='DEFAULT_DATATABLE_CONFIG'>
    <template #empty>
      <span class='block font-bold text-600 text-center'>{{
        t('common.emptyRecords', {
          itemType: toLower(t('document.fileType.objectName')),
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
      :header="t('document.fileType.code')"></Column>
    <Column
      field='name'
      :header="t('document.fileType.name')"></Column>

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

  <FileTypeForm
    v-if='fileTypeFormVisible'
    :id='fileType?.id'
    :visible-dialog='fileTypeFormVisible'
    @hide-dialog='hideFileTypeFormDialog'
    @reload='reload'/>
</template>

<script lang='ts' setup>
import { cloneDeep, toLower } from 'lodash';
import Column from 'primevue/column';
import { useConfirm } from 'primevue/useconfirm';
import { inject, reactive, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { deleteFileType, getAllFileTypes, } from '@/apps/document/api/graphql/file-type';
import type { FileTypeInterface } from '@/apps/document/model/fileType';
import FileTypeForm from '@/apps/document/views/categories/fileType/FileTypeForm.vue';
import { DEFAULT_DATATABLE_CONFIG } from '@/common/constants';
import { toastErrorData, toastSuccess, } from '@/common/helpers/custom-toast-service';

const { t } = useI18n() || {};
const searchKeyword = ref('');
const getAllFileTypeLoading = ref(true);
const fileTypes = ref<any[]>([]);
let isDetail = ref(false);
const selectedRow = ref();
const searchTerm = inject('searchTerm', ref(''));
const searchTermUpdate = inject('updateSearchTerm', (value: string) => void {});

const searchParams = reactive({ keyword: '' });
const totalRecords = ref(0);
const {
  onResult: getAllFileTypesResult,
  onError: getAllFileTypesError,
  refetch: getAllFileTypesRefetch,
  variables: searchFileTypeVariable,
} = getAllFileTypes(searchParams);

getAllFileTypesResult((res) => {
  fileTypes.value = res.data.getAllFileTypes;
});

getAllFileTypesError((error) => {
  getAllFileTypeLoading.value = false;
  toastErrorData({
    prefix: 'hrm.fileType.errors',
    error,
  });
});

function reload() {
  searchParams.keyword = '';
  getAllFileTypesRefetch(searchParams);
}

function showFileTypeFormDialog() {
  fileType.value = {} as FileTypeInterface;
  fileTypeFormVisible.value = true;
  isDetail.value = false;
}

function editFileType() {
  fileTypeFormVisible.value = true;
  isDetail.value = false;
}

function hideFileTypeFormDialog() {
  fileTypeFormVisible.value = false;
  fileType.value = {} as FileTypeInterface;
  searchParams.keyword = '';
  searchTermUpdate('');
}

const menuAction = ref();
const menuActions = [
  {
    label: t('common.edit'),
    icon: 'edit',
    command: () => {
      editFileType();
    },
  },
  {
    label: t('common.delete'),
    icon: 'delete',
    command: () => {
      handleDeleteFileType();
    },
  },
];

function toggleActionMenu({
  event,
  data,
}: {
  event: Event;
  data: FileTypeInterface;
}) {
  menuAction.value.toggle(event);
  fileType.value = cloneDeep(data);
  selectedRow.value = data;
}

const fileType = ref<FileTypeInterface>({
  code: '',
  id: undefined,
  name: '',
});
const fileTypeFormVisible = ref(false);

const {
  mutate: deleteFileTypeMutate,
  onDone: deleteFileTypeDone,
  onError: deleteFileTypeError,
} = deleteFileType();

const confirm = useConfirm();

function handleDeleteFileType() {
  confirm.require({
    message: t('common.confirmDelete', {
      itemType: t('document.fileType.objectName'),
      itemName: fileType.value.name,
    }),
    header: t('common.confirm'),
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: t('common.delete'),
    acceptClass: 'p-button-danger',
    accept: () => {
      deleteFileTypeMutate({ id: fileType.value.id });
    },
  });
}

deleteFileTypeDone(() => {
  toastSuccess({
    message: t('common.result.message.deleted', {
      itemType: t('document.fileType.objectName'),
      itemName: fileType.value.name,
    }),
  });
  confirm.close();
  reload();
});

deleteFileTypeError((error: any) => {
  toastErrorData({ error });
});

watch(searchTerm, (newValue) => {
  fileTypes.value = [];
  searchParams.keyword = newValue;
  searchFileTypeVariable.value = searchParams;
});
</script>

<script lang='ts'>
export default { name: 'FileTypeManager' };
</script>
