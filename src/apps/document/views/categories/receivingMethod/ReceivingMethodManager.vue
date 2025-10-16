<template>
  <div class='align-items-center flex flex-wrap justify-content-between mb-2'>
    <span class='font-bold text-primary text-xl'>{{
      t('document.receivingMethod.tableTitle')
    }}</span>
    <div class='block p-input-icon-left'>
      <div class='actions flex gap-2'>
        <ButtonIcon
          class='btn-create'
          icon='add'
          :label="t('common.create')"
          @click='showReceivingMethodFormDialog'/>
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
    :value='receivingMethods'
    v-bind='DEFAULT_DATATABLE_CONFIG'>
    <template #empty>
      <span class='block font-bold text-600 text-center'>{{
        t('common.emptyRecords', {
          itemType: toLower(t('document.receivingMethod.objectName')),
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
      :header="t('document.receivingMethod.name')"></Column>

    <Column
      field='code'
      :header="t('document.receivingMethod.code')"></Column>

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

  <ReceivingMethodForm
    v-if='receivingMethodFormVisible'
    :id='receivingMethod.id'
    :receiving-method='receivingMethod'
    :visible-dialog='receivingMethodFormVisible'
    @hide-dialog='hideReceivingMethodFormDialog'
    @reload='reload'/>
</template>

<script lang='ts' setup>
import { assign, cloneDeep, get, toLower } from 'lodash';
import Column from 'primevue/column';
import { useConfirm } from 'primevue/useconfirm';
import { inject, onMounted, reactive, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { deleteReceivingMethod, searchReceivingMethod, } from '@/apps/document/api/graphql/receiving-method';
import {
  ReceivingMethod,
  type ReceivingMethodEdge,
  type ReceivingMethodInterface,
} from '@/apps/document/model/receivingMethod';
import ReceivingMethodForm from '@/apps/document/views/categories/receivingMethod/ReceivingMethodForm.vue';
import { DEFAULT_DATATABLE_CONFIG, DEFAULT_PAGE_SIZE, } from '@/common/constants';
import { toastErrorData, toastSuccess, } from '@/common/helpers/custom-toast-service';
import { Direction, type Pageable } from '@/common/model/query';

const { t } = useI18n() || {};
const searchKeyword = ref('');
const getAllReceivingMethodLoading = ref(true);
const receivingMethods = ref<any[]>([]);
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
  onResult: searchReceivingMethodResult,
  onError: searchReceivingMethodError,
  refetch: searchReceivingMethodRefetch,
  variables: searchReceivingMethodVariable,
} = searchReceivingMethod(searchParams);

searchReceivingMethodResult((res) => {
  const {
    totalCount,
    edges
  } = get(res, 'data.searchReceivingMethod', {
    totalCount: 0,
    edges: [],
  });
  totalRecords.value = totalCount;
  if (isLoadMore.value) {
    receivingMethods.value = [
      ...receivingMethods.value,
      ...edges.map((edge: ReceivingMethodEdge) => ({ ...edge.node })),
    ];
  } else {
    receivingMethods.value = edges.map((edge: ReceivingMethodEdge) => ({ ...edge.node, }));
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

searchReceivingMethodError((error) => {
  getAllReceivingMethodLoading.value = false;
  toastErrorData({
    prefix: 'hrm.receivingMethod.errors',
    error,
  });
});

function reload() {
  searchParams.keyword = '';
  searchParams.pageable.page = 0;
  assign(receivingMethod.value, new ReceivingMethod());
  searchReceivingMethodRefetch(searchParams);
}

function showReceivingMethodFormDialog() {
  assign(receivingMethod.value, new ReceivingMethod());
  receivingMethodFormVisible.value = true;
  isDetail.value = false;
}

function editReceivingMethod() {
  receivingMethodFormVisible.value = true;
  isDetail.value = false;
}

function hideReceivingMethodFormDialog() {
  receivingMethodFormVisible.value = false;
  assign(receivingMethod.value, new ReceivingMethod());
  searchParams.keyword = '';
  searchTermUpdate('');
}

const menuAction = ref();
const menuActions = [
  {
    label: t('common.edit'),
    icon: 'edit',
    command: () => {
      editReceivingMethod();
    },
  },
  {
    label: t('common.delete'),
    icon: 'delete',
    command: () => {
      handleDeleteReceivingMethod();
    },
  },
];

function toggleActionMenu({
  event,
  data,
}: {
  event: Event;
  data: ReceivingMethodInterface;
}) {
  menuAction.value.toggle(event);
  receivingMethod.value = cloneDeep(data);
  selectedRow.value = data;
}

const receivingMethod = ref<ReceivingMethodInterface>(new ReceivingMethod());
const receivingMethodFormVisible = ref(false);

const {
  mutate: deleteReceivingMethodMutate,
  onDone: deleteReceivingMethodDone,
  onError: deleteReceivingMethodError,
} = deleteReceivingMethod();

const confirm = useConfirm();

function handleDeleteReceivingMethod() {
  confirm.require({
    message: t('common.confirmDelete', {
      itemType: t('hrm.receivingMethod.objectName'),
      itemName: receivingMethod.value.name,
    }),
    header: t('common.confirm'),
    acceptLabel: t('common.delete'),
    acceptClass: 'p-button-danger',
    icon: 'pi pi-exclamation-triangle',
    accept: () => {
      deleteReceivingMethodMutate({ id: receivingMethod.value.id });
    },
  });
}

deleteReceivingMethodDone(() => {
  toastSuccess({
    message: t('common.result.message.deleted', {
      itemType: t('hrm.receivingMethod.objectName'),
      itemName: receivingMethod.value.name,
    }),
  });
  confirm.close();
  reload();
});

deleteReceivingMethodError((error: any) => {
  toastErrorData({ error });
});

watch(searchTerm, (newValue) => {
  receivingMethods.value = [];
  searchParams.keyword = newValue;
  searchParams.pageable.page = 0;
  searchReceivingMethodVariable.value = searchParams;
});
</script>

<script lang='ts'>
export default { name: 'ReceivingMethodManager' };
</script>
