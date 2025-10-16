<template>
  <div class='align-items-center flex flex-wrap justify-content-between mb-2'>
    <span class='font-bold text-primary text-xl'>{{
      t('document.orgOut.tableTitle')
    }}</span>
    <div class='block p-input-icon-left'>
      <div class='actions flex gap-2'>
        <ButtonIcon
          class='btn-create'
          icon='add'
          :label="t('common.create')"
          @click='showOrgOutFormDialog'/>
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
    :value='orgOuts'
    v-bind='DEFAULT_DATATABLE_CONFIG'>
    <template #empty>
      <span class='block font-bold text-600 text-center'>{{
        t('common.emptyRecords', {
          itemType: toLower(t('document.orgOut.objectName')),
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
      field='orgOutName'
      :header="t('document.orgOut.name')"></Column>

    <Column
      class='text-center'
      field='orgOutCode'
      :header="t('document.orgOut.code')"></Column>

    <Column
      class='text-center'
      field='orgOutIdentify'
      :header="t('document.orgOut.identify')"></Column>

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

  <OrgOutForm
    v-if='orgOutFormVisible'
    :id='orgOut.id'
    :org-out='orgOut'
    :visible-dialog='orgOutFormVisible'
    @hide-dialog='hideOrgOutFormDialog'
    @reload='reload'/>
</template>

<script lang='ts' setup>
import { assign, cloneDeep, get, toLower } from 'lodash';
import Column from 'primevue/column';
import { useConfirm } from 'primevue/useconfirm';
import { inject, onMounted, reactive, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { deleteOrgOut, searchOrgOut, } from '@/apps/document/api/graphql/org-out';
import { OrgOut, type OrgOutEdge, type OrgOutInterface, } from '@/apps/document/model/orgOut';
import OrgOutForm from '@/apps/document/views/categories/orgOut/OrgOutForm.vue';
import { DEFAULT_DATATABLE_CONFIG, DEFAULT_PAGE_SIZE, } from '@/common/constants';
import { toastErrorData, toastSuccess, } from '@/common/helpers/custom-toast-service';
import { Direction, type Pageable } from '@/common/model/query';

const { t } = useI18n() || {};
const searchKeyword = ref('');
const getAllOrgOutLoading = ref(true);
const orgOuts = ref<any[]>([]);
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
  onResult: searchOrgOutResult,
  onError: searchOrgOutError,
  refetch: searchOrgOutRefetch,
  variables: searchOrgOutVariable,
} = searchOrgOut(searchParams);

searchOrgOutResult((res) => {
  const {
    totalCount,
    edges
  } = get(res, 'data.searchOrgOut', {
    totalCount: 0,
    edges: [],
  });
  totalRecords.value = totalCount;
  if (isLoadMore.value) {
    orgOuts.value = [
      ...orgOuts.value,
      ...edges.map((edge: OrgOutEdge) => ({ ...edge.node })),
    ];
  } else {
    orgOuts.value = edges.map((edge: OrgOutEdge) => ({ ...edge.node }));
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

searchOrgOutError((error) => {
  getAllOrgOutLoading.value = false;
  toastErrorData({
    prefix: 'hrm.orgOut.errors',
    error,
  });
});

function reload() {
  searchParams.keyword = '';
  searchParams.pageable.page = 0;
  assign(orgOut.value, new OrgOut());
  searchOrgOutRefetch(searchParams);
}

function showOrgOutFormDialog() {
  assign(orgOut.value, new OrgOut());
  orgOutFormVisible.value = true;
  isDetail.value = false;
}

function editOrgOut() {
  orgOutFormVisible.value = true;
  isDetail.value = false;
}

function hideOrgOutFormDialog() {
  orgOutFormVisible.value = false;
  assign(orgOut.value, new OrgOut());
  searchParams.keyword = '';
  searchTermUpdate('');
}

const menuAction = ref();
const menuActions = [
  {
    label: t('common.edit'),
    icon: 'edit',
    command: () => {
      editOrgOut();
    },
  },
  {
    label: t('common.delete'),
    icon: 'delete',
    command: () => {
      handleDeleteOrgOut();
    },
  },
];

function toggleActionMenu({
  event,
  data,
}: {
  event: Event;
  data: OrgOutInterface;
}) {
  menuAction.value.toggle(event);
  orgOut.value = cloneDeep(data);
  selectedRow.value = data;
}

const orgOut = ref<OrgOutInterface>(new OrgOut());
const orgOutFormVisible = ref(false);

const {
  mutate: deleteOrgOutMutate,
  onDone: deleteOrgOutDone,
  onError: deleteOrgOutError,
} = deleteOrgOut();

const confirm = useConfirm();

function handleDeleteOrgOut() {
  confirm.require({
    message: t('common.confirmDelete', {
      itemType: t('hrm.orgOut.objectName'),
      itemName: orgOut.value.orgOutName,
    }),
    header: t('common.confirm'),
    acceptLabel: t('common.delete'),
    acceptClass: 'p-button-danger',
    icon: 'pi pi-exclamation-triangle',
    accept: () => {
      deleteOrgOutMutate({ id: orgOut.value.id });
    },
  });
}

deleteOrgOutDone(() => {
  toastSuccess({
    message: t('common.result.message.deleted', {
      itemType: t('hrm.orgOut.objectName'),
      itemName: orgOut.value.orgOutName,
    }),
  });
  confirm.close();
  reload();
});

deleteOrgOutError((error: any) => {
  toastErrorData({ error });
});

watch(searchTerm, (newValue) => {
  orgOuts.value = [];
  searchParams.keyword = newValue;
  searchParams.pageable.page = 0;
  searchOrgOutVariable.value = searchParams;
});
</script>

<script lang='ts'>
export default { name: 'OrgOutManager' };
</script>
