<template>
  <Toolbar class='align-content-center h-3rem mb-2 px-2 py-0 surface-0'>
    <template #start>
      <div class='align-items-center flex gap-2'>
        <div class='font-bold'>
          {{ t('work.configStatus.listConfigStatus') }}
        </div>
      </div>
    </template>
    <template #end>
      <div class='align-items-center btn-group-toolbar flex gap-1 h-3rem mr-1 my-1'>
        <ButtonIcon
          class='btn-create focus:shadow-none font-medium p-2'
          icon='add'
          :label="t('common.create')"
          @click='showConfigFormDialog'/>
      </div>
    </template>
  </Toolbar>

  <div class='h-full surface-0'>
    <DataTable
      :loading='configLoading'
      :total-records='totalRecords'
      :value='configStatuses'
      v-bind='DEFAULT_DATATABLE_CONFIG'
      @page='onPage($event)'
      @sort='onSort($event)'>
      <template #empty>
        <span class='block font-bold text-600 text-center'>{{
          t('common.emptyRecords', {
            itemType: toLower(t('work.configStatus.objectName')),
          })
        }}</span>
      </template>

      <Column
        field='ordinalNumber'
        :header='t("common.ordinalNumber")'></Column>

      <Column
        field='name'
        :header="t('work.configStatus.statusName')"></Column>

      <Column :header="t('work.configStatus.statusType')">
        <template #body='{ data: { type } }'>
          {{ t('common.statuses.' + toLower(type)) }}
        </template>
      </Column>

      <Column
        field='description'
        :header="t('work.configStatus.description')">
      </Column>

      <Column
        field='orderNo'
        :header="t('work.configStatus.orderNo')"></Column>

      <Column :header="t('work.configStatus.color')">
        <template #body='{ data }'>
          <ColorPicker
            class='ml-2'
            disabled
            format='hex'
            input-id='cp-hex'
            :model-value='data.color'/>
        </template>
      </Column>

      <Column
        v-if='menuActionsFilter.length'
        class='text-center'>
        <template #body='{ data }'>
          <ButtonIcon
            v-tooltip.top="t('common.action')"
            class='text-color'
            icon='more_horiz'
            rounded
            text
            @click='toggleActionMenu({ event: $event, data: data })'/>
        </template>
      </Column>
    </DataTable>
  </div>

  <Menu
    ref='menuAction'
    :model='menuActionsFilter'
    :popup='true'>
    <template #item='{ item: { icon, label } }'>
      <MenuItem
        :class-icon="['mt-0 text-sm', icon === 'delete' ? 'text-red-300' : '']"
        :class-item="['mt-1', icon === 'delete' ? 'text-red-300' : '']"
        :icon='icon'
        :label='label'/>
    </template>
  </Menu>

  <ConfigWorkStatusForm
    v-if='configWorkStatusFormVisible'
    :is-detail='isDetail'
    :item='configStatus'
    :visible-dialog='configWorkStatusFormVisible'
    @hide-dialog='hideCategoryFormDialog'
    @reload='reload'/>
</template>

<script lang='ts' setup>
import { assign, get, toLower } from 'lodash';
import Column from 'primevue/column';
import DataTable, { type DataTableSortEvent } from 'primevue/datatable';
import type { MenuItem } from 'primevue/menuitem';
import { useConfirm } from 'primevue/useconfirm';
import { reactive, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { deleteConfigStatusGraphql, searchGraphql, } from '@/apps/work/api/graphql/config-work-status-api';
import { ConfigWorkStatus, type ConfigWorkStatusEdge, } from '@/apps/work/model/configWorkStatus';
import ConfigWorkStatusForm from '@/apps/work/views/config/configWorkStatus/ConfigWorkStatusForm.vue';
import { DEFAULT_DATATABLE_CONFIG, DEFAULT_PAGE_SIZE, } from '@/common/constants';
import { toastErrorData, toastSuccess, } from '@/common/helpers/custom-toast-service';
import { Direction, type Pageable } from '@/common/model/query';

const { t } = useI18n() || {};
let isDetail = ref(false);
const pageable = reactive<Pageable>({
  page: 0,
  size: DEFAULT_PAGE_SIZE,
  sort: [
    {
      property: 'name',
      direction: Direction.ASC,
    },
  ],
});
const searchParams = reactive({
  keyword: '',
  pageable: pageable,
});
const configWorkStatusFormVisible = ref(false);

const searchKeyword = ref('');
const totalRecords = ref(0);
const configLoading = ref(true);
const configStatuses = ref<ConfigWorkStatus[]>([] as ConfigWorkStatus[]);
const configStatus = ref<ConfigWorkStatus>({} as ConfigWorkStatus);

const {
  onResult: searchResult,
  onError: searchError,
  refetch: searchRefetch,
} = searchGraphql(searchParams);

searchResult((result) => {
  const {
    totalCount,
    edges
  } = get(result, 'data.search', {
    totalCount: 0,
    edges: [],
  });
  totalRecords.value = totalCount;
  configStatuses.value = edges.map(
    (edge: ConfigWorkStatusEdge, index: number) => ({
      ...edge.node,
      ordinalNumber: pageable.page * pageable.size + index + 1,
    }),
  );
  configLoading.value = false;
});

searchError((error) => {
  configLoading.value = false;
  toastErrorData({
    prefix: 'admin.category.errors',
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
  assign(configStatus.value, {});
  searchRefetch(searchParams);
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
  reload();
}

function onSort(event: DataTableSortEvent) {
  const {
    sortField,
    sortOrder
  } = event;
  assign(pageable, {
    page: 0,
    sort: [
      {
        property: sortField,
        direction: sortOrder === 1 ? 'ASC' : 'DESC',
      },
    ],
  });
  assign(searchParams, pageable);
  reload();
}

function showConfigFormDialog() {
  configStatus.value = {
    id: '',
    description: '',
    type: null,
    color: 'ff0303',
    name: '',
    orderNo: null,
  };
  configWorkStatusFormVisible.value = true;
  isDetail.value = false;
}

function editConfigStatus() {
  configWorkStatusFormVisible.value = true;
  isDetail.value = false;
}

function detailConfigStatus() {
  configWorkStatusFormVisible.value = true;
  isDetail.value = true;
}

function hideCategoryFormDialog() {
  configWorkStatusFormVisible.value = false;
}

const menuAction = ref();
const menuActionsFilter = [
  {
    label: t('common.detail'),
    icon: 'visibility',
    // functionPermission: '/ADMIN/CATEGORY/CATEGORY_CATEGORY/VIEW',
    command: () => {
      detailConfigStatus();
    },
  },
  {
    label: t('common.edit'),
    icon: 'edit',
    // functionPermission: '/ADMIN/CATEGORY/CATEGORY_CATEGORY/UPDATE',
    command: () => {
      editConfigStatus();
    },
  },
  {
    label: t('common.delete'),
    icon: 'delete',
    // functionPermission: '/WORK/CONFIG_/CATEGORY_CATEGORY/DELETE',
    command: () => {
      deleteStatus();
    },
  },
];

// const menuActionsFilter = computed(() => menuActions.filter(m => hasPermission(m.functionPermission)));

function toggleActionMenu({
  event,
  data,
}: {
  event: Event;
  data: ConfigWorkStatus;
}) {
  menuAction.value.toggle(event);
  configStatus.value = data;
}

const {
  mutate: deleteStatusMutate,
  onDone: deleteStatusDone,
  onError: deleteStatusError,
} = deleteConfigStatusGraphql();

const confirm = useConfirm();

function deleteStatus() {
  confirm.require({
    message: t('common.confirmDelete', {
      itemType: t('work.configStatus.objectName'),
      itemName: configStatus.value.name,
    }),
    acceptLabel: t('common.delete'),
    acceptClass: 'p-button-danger',
    header: t('common.confirm'),
    icon: 'pi pi-exclamation-triangle',
    accept: () => {
      deleteStatusMutate({ id: configStatus.value.id });
    },
  });
}

deleteStatusDone(() => {
  toastSuccess({
    message: t('common.result.message.deleted', {
      itemType: t('work.configStatus.objectName'),
      itemName: configStatus.value.name,
    }),
  });
  confirm.close();
  reload();
});

deleteStatusError((error) => {
  toastErrorData({ error });
});
</script>

<script lang='ts'>
export default { name: 'ConfigWorkStatusManage' };
</script>
