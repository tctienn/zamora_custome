<template>
  <div class='align-items-center flex flex-wrap justify-content-between mb-2'>
    <span class='font-bold text-primary text-xl'>{{
      t('document.partyPosition.tableTitle')
    }}</span>
    <div class='block p-input-icon-left'>
      <div class='actions flex gap-2'>
        <ButtonIcon
          class='btn-create'
          icon='add'
          :label="t('common.create')"
          @click='showPositionFormDialog'/>
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
    :value='positions'
    v-bind='DEFAULT_DATATABLE_CONFIG'>
    <template #empty>
      <span class='block font-bold text-600 text-center'>{{
        t('common.emptyRecords', {
          itemType: toLower(t('document.partyPosition.objectName')),
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
      :header="t('document.partyPosition.name')"></Column>

    <Column
      field='code'
      :header="t('document.partyPosition.code')"></Column>

    <Column
      field='description'
      :header="t('common.description')"
      style='width: 35%'>
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

  <PartyPositionForm
    v-if='positionFormVisible'
    :position='position'
    :visible-dialog='positionFormVisible'
    @hide-dialog='hidePositionFormDialog'
    @reload='reload'/>
</template>

<script lang='ts' setup>
import { assign, cloneDeep, get, toLower } from 'lodash';
import Column from 'primevue/column';
import { useConfirm } from 'primevue/useconfirm';
import { inject, onMounted, reactive, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { deletePartyPosition, searchPartyPosition, } from '@/apps/document/api/graphql/party-position';
import {
  PartyPosition,
  type PartyPositionEdge,
  type PartyPositionInterface,
} from '@/apps/document/model/partyPositon/partyPosition';
import PartyPositionForm from '@/apps/document/views/categories/partyPosition/PartyPositionForm.vue';
import { DEFAULT_DATATABLE_CONFIG, DEFAULT_PAGE_SIZE, } from '@/common/constants';
import { toastErrorData, toastSuccess, } from '@/common/helpers/custom-toast-service';
import { Direction, type Pageable } from '@/common/model/query';

const { t } = useI18n() || {};
const searchKeyword = ref('');
const getAllPositionLoading = ref(true);
const positions = ref<any[]>([]);
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
  onResult: searchPartyPositionResult,
  onError: searchPartyPositionError,
  refetch: searchPartyPositionRefetch,
  variables: searchPartyPositionVariable,
} = searchPartyPosition(searchParams);

searchPartyPositionResult((res) => {
  const {
    totalCount,
    edges
  } = get(res, 'data.searchPartyPosition', {
    totalCount: 0,
    edges: [],
  });
  totalRecords.value = totalCount;
  if (isLoadMore.value) {
    positions.value = [
      ...positions.value,
      ...edges.map((edge: PartyPositionEdge) => ({ ...edge.node })),
    ];
  } else {
    positions.value = edges.map((edge: PartyPositionEdge) => ({ ...edge.node, }));
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

searchPartyPositionError((error) => {
  getAllPositionLoading.value = false;
  toastErrorData({
    prefix: 'hrm.position.errors',
    error,
  });
});

function reload() {
  searchParams.keyword = '';
  searchParams.pageable.page = 0;
  assign(position.value, new PartyPosition());
  searchPartyPositionRefetch(searchParams);
}

function showPositionFormDialog() {
  assign(position.value, new PartyPosition());
  positionFormVisible.value = true;
  isDetail.value = false;
}

function editPosition() {
  positionFormVisible.value = true;
  isDetail.value = false;
}

function hidePositionFormDialog() {
  positionFormVisible.value = false;
  assign(position.value, new PartyPosition());
  searchParams.keyword = '';
  searchTermUpdate('');
}

const menuAction = ref();
const menuActions = [
  {
    label: t('common.edit'),
    icon: 'edit',
    command: () => {
      editPosition();
    },
  },
  {
    label: t('common.delete'),
    icon: 'delete',
    command: () => {
      deletePosition();
    },
  },
];

function toggleActionMenu({
  event,
  data,
}: {
  event: Event;
  data: PartyPositionInterface;
}) {
  menuAction.value.toggle(event);
  position.value = cloneDeep(data);
  selectedRow.value = data;
}

const position = ref<PartyPositionInterface>(new PartyPosition());
const positionFormVisible = ref(false);

const {
  mutate: deletePositionMutate,
  onDone: deletePositionDone,
  onError: deletePositionError,
} = deletePartyPosition();

const confirm = useConfirm();

function deletePosition() {
  confirm.require({
    message: t('common.confirmDelete', {
      itemType: t('hrm.position.objectName'),
      itemName: position.value.name,
    }),
    header: t('common.confirm'),
    acceptLabel: t('common.delete'),
    acceptClass: 'p-button-danger',
    icon: 'pi pi-exclamation-triangle',
    accept: () => {
      deletePositionMutate({ id: position.value.id });
    },
  });
}

deletePositionDone(() => {
  toastSuccess({
    message: t('common.result.message.deleted', {
      itemType: t('hrm.position.objectName'),
      itemName: position.value.name,
    }),
  });
  confirm.close();
  reload();
});

deletePositionError((error: any) => {
  toastErrorData({ error });
});

watch(searchTerm, (newValue) => {
  positions.value = [];
  searchParams.keyword = newValue;
  searchParams.pageable.page = 0;
  searchPartyPositionVariable.value = searchParams;
});
</script>

<script lang='ts'>
export default { name: 'PartyPositionManager' };
</script>
