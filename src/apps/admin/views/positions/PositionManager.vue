<template>
  <Toolbar class='h-3rem mb-2 px-2 py-0 surface-0'>
    <template #start>
      <div class='align-items-center flex gap-2'>
        <div class='font-bold'>
          {{ t('admin.position.tableTitle') }}
        </div>
      </div>
    </template>
    <template #end>
      <div class='btn-group-toolbar flex gap-3 mr-1 my-1'>
        <Button
          v-if="hasPermission('/ADMIN/ADMIN_CONFIG/ADMIN_CONFIG-USER/CREATE')"
          class='btn-create focus:shadow-none font-medium p-2'
          icon='pi pi-plus'
          :label="t('common.create')"
          @click='showPositionFormDialog'/>

      </div>
    </template>
  </Toolbar>
  <div class='h-full surface-0'>
    <DataTable
      v-model:selection='selectedRow'
      :total-records='totalRecords'
      :value='positions'
      v-bind='DEFAULT_DATATABLE_CONFIG'>
      <template #empty>
        <span class='block font-bold text-600 text-center'>{{
          t('common.emptyRecords', {
            itemType: toLower(t('admin.position.objectName')),
          })
        }}</span>
      </template>

      <Column
        field='name'
        :header="t('admin.position.name')"></Column>

      <Column
        field='code'
        :header="t('admin.position.code')"></Column>

      <Column
        class='max-w-20rem'
        field='description'
        :header="t('common.description')">
      </Column>

      <Column
        class='text-center'
        :exclude-global-filter='true'
        field='status'
        :header="t('common.status')">
        <template #body='{ data: { status } }'>
          <span
            class='status-badge'
            :class="`status-${toLower(status) ? 'active' : 'deactivate'}`">{{
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
        header-style='width: 5%'>
        <template #body='{ data }'>
          <ButtonIcon
            v-tooltip.top="t('common.action')"
            class='text-color'
            icon='more_vert'
            icon-size='1.7'
            rounded
            text
            @click='toggleActionMenu({ event: $event, data: data })'/>
        </template>
      </Column>
    </DataTable>
  </div>

  <Menu
    ref='menuAction'
    :model='menuActions'
    :popup='true'>
    <template #item='{ item: { icon, label } }'>
      <MenuItem
        :class-icon="['mt-0 text-sm', icon === 'delete' ? 'text-red-300' : '']"
        :class-item="['mt-1', icon === 'delete' ? 'text-red-300' : '']"
        :icon='icon'
        :label='label'/>
    </template>
  </Menu>

  <PositionForm
    v-if='positionFormVisible'
    :is-detail='isDetail'
    :item='position'
    :positions='positions'
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

import { deletePositionGraphql, getPositionGraphql, } from '@/apps/admin/api/graphql/position/position-graphql';
import { Position, type PositionEdge, type PositionInterface, } from '@/apps/admin/model/position';
import { hasPermission } from '@/apps/admin/services/permission';
import PositionForm from '@/apps/admin/views/positions/PositionForm.vue';
import MenuItem from '@/common/components/custom/MenuItem.vue';
import { DEFAULT_DATATABLE_CONFIG, DEFAULT_PAGE_SIZE, } from '@/common/constants';
import { toastErrorData, toastSuccess, } from '@/common/helpers/custom-toast-service';
import { Direction, type Pageable } from '@/common/model/query';

const { t } = useI18n() || {};
const searchKeyword = ref('');
const getAllPositionLoading = ref(true);
const positions = ref<any[]>([]);
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
      property: 'code',
      direction: Direction.ASC,
    },
  ],
});
const searchParams = reactive({
  keyword: '',
  pageable: pageable,
});
const totalRecords = ref(0);
const {
  onResult: searchPositionResult,
  onError: searchPositionError,
  refetch: searchPositionRefetch,
  variables: searchPositionVariable,
} = getPositionGraphql(searchParams);

searchPositionResult((res) => {
  const {
    totalCount,
    edges
  } = get(res, 'data.positions', {
    totalCount: 0,
    edges: [],
  });
  totalRecords.value = totalCount;
  if (isLoadMore.value) {
    positions.value = [
      ...positions.value,
      ...edges.map((edge: PositionEdge) => ({ ...edge.node })),
    ];
  } else {
    positions.value = edges.map((edge: PositionEdge) => ({ ...edge.node }));
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

searchPositionError((error) => {
  getAllPositionLoading.value = false;
  toastErrorData({
    prefix: 'hrm.position.errors',
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

function onPage(event: { page: number; rows: number }) {
  const {
    page,
    rows
  } = event;
  assign(pageable, {
    page,
    size: rows,
  });
  assign(searchParams, pageable);
  searchPositionRefetch(searchParams);
}

function reload() {
  assign(position.value, new Position());
  pageable.page = 0;
  searchParams.keyword = '';
  searchTermUpdate('');
  searchPositionRefetch(searchParams);
}

function showPositionFormDialog() {
  assign(position.value, new Position());
  positionFormVisible.value = true;
  isDetail.value = false;
}

function editPosition() {
  positionFormVisible.value = true;
  isDetail.value = false;
}

function hidePositionFormDialog() {
  positionFormVisible.value = false;
  assign(position.value, new Position());
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
  data: PositionInterface;
}) {
  menuAction.value.toggle(event);
  position.value = cloneDeep(data);
  selectedRow.value = data;
}

const position = ref<PositionInterface>(new Position());
const positionFormVisible = ref(false);

const {
  mutate: deletePositionMutate,
  onDone: deletePositionDone,
  onError: deletePositionError,
} = deletePositionGraphql();

const confirm = useConfirm();

function deletePosition() {
  confirm.require({
    message: t('common.confirmDelete', {
      itemType: t('admin.position.objectName').toLowerCase(),
      itemName: position.value.name,
    }),
    header: t('common.confirm'),
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: t('common.delete'),
    acceptClass: 'p-button-danger',
    accept: () => {
      deletePositionMutate({ id: position.value.id });
    },
  });
}

deletePositionDone(() => {
  toastSuccess({
    message: t('common.result.message.deleted', {
      itemType: t('admin.position.objectName').toLowerCase(),
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
  searchPositionVariable.value = searchParams;
});
</script>

<script lang='ts'>
export default { name: 'PositionManager' };
</script>
