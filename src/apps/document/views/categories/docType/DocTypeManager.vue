<template>
  <div class='align-items-center flex flex-wrap justify-content-between mb-2'>
    <span class='font-bold text-primary text-xl'>{{
      t('document.docType.tableTitle')
    }}</span>
    <div class='block p-input-icon-left'>
      <div class='actions flex gap-2'>
        <ButtonIcon
          class='btn-create'
          icon='add'
          :label="t('common.create')"
          @click='showDocTypeFormDialog'/>
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
    :value='docTypes'
    v-bind='DEFAULT_DATATABLE_CONFIG'>
    <template #empty>
      <span class='block font-bold text-600 text-center'>{{
        t('common.emptyRecords', {
          itemType: toLower(t('document.docType.objectName')),
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
      field='name'
      :header="t('document.docType.name')"></Column>

    <Column
      field='code'
      :header="t('document.docType.code')"></Column>

    <Column
      class='text-center'
      field='numberOfProcessingDays'
      :header="t('document.docType.numberOfProcessingDays')"></Column>

    <Column
      field='signDefault'
      :header="t('document.docType.signDefault')"></Column>

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

  <DocTypeForm
    v-if='docTypeFormVisible'
    :id='docType.id'
    :doc-type='docType'
    :visible-dialog='docTypeFormVisible'
    @hide-dialog='hideDocTypeFormDialog'
    @reload='reload'/>
</template>

<script lang='ts' setup>
import { assign, cloneDeep, get, toLower } from 'lodash';
import Column from 'primevue/column';
import { useConfirm } from 'primevue/useconfirm';
import { inject, onMounted, reactive, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { deleteDocType, searchDocType, } from '@/apps/document/api/graphql/doc-type';
import { DocType, type DocTypeEdge, type DocTypeInterface, } from '@/apps/document/model/docType';
import DocTypeForm from '@/apps/document/views/categories/docType/DocTypeForm.vue';
import { DEFAULT_DATATABLE_CONFIG, DEFAULT_PAGE_SIZE, } from '@/common/constants';
import { toastErrorData, toastSuccess, } from '@/common/helpers/custom-toast-service';
import { Direction, type Pageable } from '@/common/model/query';

const { t } = useI18n() || {};
const searchKeyword = ref('');
const getAllDocTypeLoading = ref(true);
const docTypes = ref<any[]>([]);
let isDetail = ref(false);
const canLoadMore = ref(true);
const isLoadMore = ref(true);
const loadingMore = ref(false);
const selectedRow = ref();
const searchTerm = inject('searchTerm', ref(''));
const searchTermUpdate = inject('updateSearchTerm', (value: string) => void {});

const pageable = reactive<Pageable>({
  page: 0,
  size: DEFAULT_PAGE_SIZE,
  sort: [
    {
      property: 'createdTime',
      direction: Direction.DESC,
    },
  ],
});
const searchParams = reactive({
  keyword: '',
  pageable: pageable,
});
const totalRecords = ref(0);
const {
  onResult: searchDocTypeResult,
  onError: searchDocTypeError,
  refetch: searchDocTypeRefetch,
  variables: searchDocTypeVariable,
} = searchDocType(searchParams);

searchDocTypeResult((res) => {
  const {
    totalCount,
    edges
  } = get(res, 'data.searchDocType', {
    totalCount: 0,
    edges: [],
  });
  totalRecords.value = totalCount;
  if (isLoadMore.value) {
    docTypes.value = [
      ...docTypes.value,
      ...edges.map((edge: DocTypeEdge) => ({ ...edge.node })),
    ];
  } else {
    docTypes.value = edges.map((edge: DocTypeEdge) => ({ ...edge.node }));
  }

  canLoadMore.value = edges.length >= DEFAULT_PAGE_SIZE;
  loadingMore.value = false;
  isLoadMore.value = false;
});

function scrollEvent(event: any) {
  const {
    scrollTop,
    scrollHeight,
    clientHeight
  } = event.target;
  if (
    scrollTop + clientHeight + 1 >= scrollHeight
    && !loadingMore.value
    && canLoadMore.value
  ) {
    isLoadMore.value = true;
    loadingMore.value = true;
    searchParams.pageable.page += 1;
  }
}

function addScrollEventListener(selector: string) {
  const scrollableContainer = document.querySelector(selector);
  if (scrollableContainer) {
    scrollableContainer.addEventListener('scroll', scrollEvent);
  }
}

onMounted(() => {
  addScrollEventListener('.p-datatable-wrapper');
});

searchDocTypeError((error) => {
  getAllDocTypeLoading.value = false;
  toastErrorData({
    prefix: 'hrm.docType.errors',
    error,
  });
});

function reload() {
  searchParams.keyword = '';
  searchParams.pageable.page = 0;
  assign(docType.value, new DocType());
  searchDocTypeRefetch(searchParams);
}

function showDocTypeFormDialog() {
  assign(docType.value, new DocType());
  docTypeFormVisible.value = true;
  isDetail.value = false;
}

function editDocType() {
  docTypeFormVisible.value = true;
  isDetail.value = false;
}

function hideDocTypeFormDialog() {
  docTypeFormVisible.value = false;
  assign(docType.value, new DocType());
  searchParams.keyword = '';
  searchTermUpdate('');
}

const menuAction = ref();
const menuActions = [
  {
    label: t('common.edit'),
    icon: 'edit',
    command: () => {
      editDocType();
    },
  },
  {
    label: t('common.delete'),
    icon: 'delete',
    command: () => {
      handleDeleteDocType();
    },
  },
];

function toggleActionMenu({
  event,
  data,
}: {
  event: Event;
  data: DocTypeInterface;
}) {
  menuAction.value.toggle(event);
  docType.value = cloneDeep(data);
  selectedRow.value = data;
}

const docType = ref<DocTypeInterface>(new DocType());
const docTypeFormVisible = ref(false);

const {
  mutate: deleteDocTypeMutate,
  onDone: deleteDocTypeDone,
  onError: deleteDocTypeError,
} = deleteDocType();

const confirm = useConfirm();

function handleDeleteDocType() {
  confirm.require({
    message: t('common.confirmDelete', {
      itemType: t('hrm.docType.objectName'),
      itemName: docType.value.name,
    }),
    header: t('common.confirm'),
    acceptLabel: t('common.delete'),
    acceptClass: 'p-button-danger',
    icon: 'pi pi-exclamation-triangle',
    accept: () => {
      deleteDocTypeMutate({ id: docType.value.id });
    },
  });
}

deleteDocTypeDone(() => {
  toastSuccess({
    message: t('common.result.message.deleted', {
      itemType: t('hrm.docType.objectName'),
      itemName: docType.value.name,
    }),
  });
  confirm.close();
  reload();
});

deleteDocTypeError((error: any) => {
  toastErrorData({ error });
});

watch(searchTerm, (newValue) => {
  docTypes.value = [];
  searchParams.keyword = newValue;
  searchParams.pageable.page = 0;
  searchDocTypeVariable.value = searchParams;
});
</script>

<script lang='ts'>
export default { name: 'DocTypeManager' };
</script>
