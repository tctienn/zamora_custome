<template>
  <div class='align-items-center flex flex-wrap justify-content-between mb-2'>
    <span class='font-bold text-primary text-xl'>{{
      t('document.orgInterconnected.tableTitle')
    }}</span>
    <div class='block p-input-icon-left'>
      <div class='actions flex gap-2'>
        <ButtonIcon
          class='btn-create'
          icon='add'
          :label="t('common.create')"
          @click='showOrgInterconnectedFormDialog'/>
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
    :value='orgInterconnecteds'
    v-bind='DEFAULT_DATATABLE_CONFIG'>
    <template #empty>
      <span class='block font-bold text-600 text-center'>{{
        t('common.emptyRecords', {
          itemType: toLower(t('document.orgInterconnected.objectName')),
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
      :header="t('document.orgInterconnected.name')"></Column>

    <Column
      field='code'
      :header="t('document.orgInterconnected.code')"></Column>

    <Column
      field='identify'
      :header="t('document.orgInterconnected.identify')"></Column>

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

  <OrgInterconnectedForm
    v-if='orgInterconnectedFormVisible'
    :id='orgInterconnected.id'
    :org-interconnected='orgInterconnected'
    :visible-dialog='orgInterconnectedFormVisible'
    @hide-dialog='hideOrgInterconnectedFormDialog'
    @reload='reload'/>
</template>

<script lang='ts' setup>
import { assign, cloneDeep, get, toLower } from 'lodash';
import Column from 'primevue/column';
import { useConfirm } from 'primevue/useconfirm';
import { inject, onMounted, reactive, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { deleteOrgInterconnected, searchOrgInterconnected, } from '@/apps/document/api/graphql/org-interconnected';
import {
  OrgInterconnected,
  type OrgInterconnectedEdge,
  type OrgInterconnectedInterface,
} from '@/apps/document/model/orgInterconnected';
import OrgInterconnectedForm from '@/apps/document/views/categories/orgInterconnected/OrgInterconnectedForm.vue';
import { DEFAULT_DATATABLE_CONFIG, DEFAULT_PAGE_SIZE, } from '@/common/constants';
import { toastErrorData, toastSuccess, } from '@/common/helpers/custom-toast-service';
import { Direction, type Pageable } from '@/common/model/query';

const { t } = useI18n() || {};
const searchKeyword = ref('');
const getAllOrgInterconnectedLoading = ref(true);
const orgInterconnecteds = ref<any[]>([]);
let isDetail = ref(false);
const dataTable = ref(null);
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
  onResult: searchOrgInterconnectedResult,
  onError: searchOrgInterconnectedError,
  refetch: searchOrgInterconnectedRefetch,
  variables: searchOrgInterconnectedVariable,
} = searchOrgInterconnected(searchParams);

searchOrgInterconnectedResult((res) => {
  const {
    totalCount,
    edges
  } = get(res, 'data.searchOrgInterconnected', {
    totalCount: 0,
    edges: [],
  });
  totalRecords.value = totalCount;
  if (isLoadMore.value) {
    orgInterconnecteds.value = [
      ...orgInterconnecteds.value,
      ...edges.map((edge: OrgInterconnectedEdge) => ({ ...edge.node })),
    ];
  } else {
    orgInterconnecteds.value = edges.map((edge: OrgInterconnectedEdge) => ({ ...edge.node, }));
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

searchOrgInterconnectedError((error) => {
  getAllOrgInterconnectedLoading.value = false;
  toastErrorData({
    prefix: 'hrm.orgInterconnected.errors',
    error,
  });
});

function searchDatatable() {
  assign(searchParams, {
    keyword: searchKeyword.value,
    pageable: { page: 0 },
  });
  reload();
}

function reload() {
  searchParams.keyword = '';
  searchParams.pageable.page = 0;
  assign(orgInterconnected.value, new OrgInterconnected());
  searchOrgInterconnectedRefetch(searchParams);
}

function showOrgInterconnectedFormDialog() {
  assign(orgInterconnected.value, new OrgInterconnected());
  orgInterconnectedFormVisible.value = true;
  isDetail.value = false;
}

function editOrgInterconnected() {
  orgInterconnectedFormVisible.value = true;
  isDetail.value = false;
}

function hideOrgInterconnectedFormDialog() {
  orgInterconnectedFormVisible.value = false;
  assign(orgInterconnected.value, new OrgInterconnected());
  searchParams.keyword = '';
  searchTermUpdate('');
}

const menuAction = ref();
const menuActions = [
  {
    label: t('common.edit'),
    icon: 'edit',
    command: () => {
      editOrgInterconnected();
    },
  },
  {
    label: t('common.delete'),
    icon: 'delete',
    command: () => {
      handleDeleteOrgInterconnected();
    },
  },
];

function toggleActionMenu({
  event,
  data,
}: {
  event: Event;
  data: OrgInterconnectedInterface;
}) {
  menuAction.value.toggle(event);
  orgInterconnected.value = cloneDeep(data);
  selectedRow.value = data;
}

const orgInterconnected = ref<OrgInterconnectedInterface>(
  new OrgInterconnected(),
);
const orgInterconnectedFormVisible = ref(false);

const {
  mutate: deleteOrgInterconnectedMutate,
  onDone: deleteOrgInterconnectedDone,
  onError: deleteOrgInterconnectedError,
} = deleteOrgInterconnected();

const confirm = useConfirm();

function handleDeleteOrgInterconnected() {
  confirm.require({
    message: t('common.confirmDelete', {
      itemType: t('hrm.orgInterconnected.objectName'),
      itemName: orgInterconnected.value.name,
    }),
    header: t('common.confirm'),
    acceptLabel: t('common.delete'),
    acceptClass: 'p-button-danger',
    icon: 'pi pi-exclamation-triangle',
    accept: () => {
      deleteOrgInterconnectedMutate({ id: orgInterconnected.value.id });
    },
  });
}

deleteOrgInterconnectedDone(() => {
  toastSuccess({
    message: t('common.result.message.deleted', {
      itemType: t('hrm.orgInterconnected.objectName'),
      itemName: orgInterconnected.value.name,
    }),
  });
  confirm.close();
  reload();
});

deleteOrgInterconnectedError((error: any) => {
  toastErrorData({ error });
});

watch(searchTerm, (newValue) => {
  orgInterconnecteds.value = [];
  searchParams.keyword = newValue;
  searchParams.pageable.page = 0;
  searchOrgInterconnectedVariable.value = searchParams;
});
</script>

<script lang='ts'>
export default { name: 'OrgInterconnectedManager' };
</script>
