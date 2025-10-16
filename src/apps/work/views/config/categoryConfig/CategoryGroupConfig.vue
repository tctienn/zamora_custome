<template>
  <Toolbar class='align-content-center h-3rem mb-2 px-2 py-0 surface-0'>
    <template #start>
      <div class='align-items-center flex gap-2'>
        <div class='font-bold'>
          {{ t('admin.categoryGroup.tableTitle') }}
        </div>
      </div>
    </template>
    <template #end>
      <div class='align-items-center btn-group-toolbar flex gap-1 h-3rem mr-1 my-1'>
        <ButtonIcon
          class='btn-create focus:shadow-none font-medium p-2'
          icon='add'
          :label='t("common.create")' />
      </div>
    </template>
  </Toolbar>

  <div class='h-full surface-0'>
    <DataTable
      v-bind='DEFAULT_DATATABLE_CONFIG'
      lazy
      :loading='getCategoryGroupLoading'
      :total-records='totalRecords'
      :value='categoryGroups'
      @page='onPage($event)'
      @sort='onSort($event)'>
      <template #empty>
        <span class='block font-bold text-600 text-center'>{{
          t('common.emptyRecords', {
            itemType: toLower(t('admin.categoryGroup.objectName')),
          })
        }}</span>
      </template>

      <Column
        field='ordinalNumber'
        :header='t("common.ordinalNumber")'></Column>

      <Column
        field='code'
        :header="t('admin.categoryGroup.code')"
        :sortable='true'></Column>

      <Column
        field='name'
        :header="t('admin.categoryGroup.name')"
        :sortable='true'></Column>

      <Column
        field='parentName'
        :header="t('admin.categoryGroup.parent')"
        :sortable='true'>
      </Column>

      <Column
        class='max-w-20rem'
        field='description'
        :header="t('common.description')"
        :sortable='true'>
      </Column>

      <Column
        field='status'
        :header="t('common.status')"
        :sortable='true'>
        <template #body='{ data: { status } }'>
          <span
            class='status-badge'
            :class='`status-${toLower(status)}`'>{{
              status ? t(`common.statuses.${toLower(status)}`) : ''
            }}</span>
        </template>
      </Column>

      <Column class='text-center'>
        <template #body='{ data }'>
          <ButtonIcon
            v-tooltip.top="t('common.action')"
            class='text-color'
            icon='more_vert'
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
  <CategoryGroupForm
    v-if='categoryGroupFormVisible'
    :category-groups='parentCategoryGroups'
    :is-detail='isDetail'
    :item='categoryGroup'
    :visible-dialog='categoryGroupFormVisible'
    @hide-dialog='hideCategoryGroupFormDialog'
    @reload='reload'/>
</template>

<script setup lang='ts'>
import { assign, cloneDeep, get, toLower } from 'lodash';
import type Button from 'primevue/button';
import Column from 'primevue/column';
import DataTable, { type DataTableSortEvent } from 'primevue/datatable';
import { reactive, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import {
  getAllCategoryGroupGraphql,
  getCategoryGroupByAppGraphql,
} from '@/apps/admin/api/graphql/category-group-graphql-api';
import type { CategoryGroupEdge, CategoryGroupInterface, } from '@/apps/admin/model/category';
import { DEFAULT_DATATABLE_CONFIG, DEFAULT_PAGE_SIZE, } from '@/common/constants';
import { toastErrorData } from '@/common/helpers/custom-toast-service';
import { Direction, type Pageable } from '@/common/model/query';

const { t } = useI18n() || {};
let isDetail = ref(false);

const pageable = reactive<Pageable>({
  page: 0,
  size: DEFAULT_PAGE_SIZE,
  sort: [
    {
      property: 'order',
      direction: Direction.ASC,
    },
  ],
});
const searchParams = reactive({
  app: 'work-service',
  keyword: '',
  pageable: pageable,
});

const parentCategoryGroups = ref<CategoryGroupInterface[]>([]);
const { onResult: getAllCategoryGroupResult } = getAllCategoryGroupGraphql();

getAllCategoryGroupResult((response) => {
  parentCategoryGroups.value = get(response, 'data.allCategoryGroup', []);
});

const searchKeyword = ref('');
const totalRecords = ref(0);
const getCategoryGroupLoading = ref(true);
const categoryGroups = ref([]);
const categoryGroupFromAdmin = ref(false);

const {
  onResult: getCategoryGroupResult,
  onError: getCategoryGroupError,
  refetch: getCategoryGroupRefetch,
} = getCategoryGroupByAppGraphql(searchParams);

getCategoryGroupResult((result) => {
  const {
    totalCount,
    edges
  } = get(result, 'data.searchCategoryGroupByApp', {
    totalCount: 0,
    edges: [],
  });
  totalRecords.value = totalCount;
  categoryGroups.value = edges.map(
    (edge: CategoryGroupEdge, index: number) => ({
      ...edge.node,
      ordinalNumber: pageable.page * pageable.size + index + 1,
    }),
  );
  getCategoryGroupLoading.value = false;
});

getCategoryGroupError((error) => {
  getCategoryGroupLoading.value = false;
  toastErrorData({
    prefix: 'admin.categoryGroup.errors',
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
  categoryGroup.value = {} as CategoryGroupInterface;
  getCategoryGroupRefetch(searchParams);
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

function detailCategoryGroup() {
  categoryGroupFormVisible.value = true;
  isDetail.value = true;
}

function hideCategoryGroupFormDialog() {
  categoryGroupFormVisible.value = false;
  assign(categoryGroup.value, {});
}

const menuAction = ref();

const menuActions = [
  {
    label: t('common.detail'),
    icon: 'visibility',
    functionPermission: '/ADMIN/CATEGORY/CATEGORY_GROUP/CREATE/VIEW',
    command: () => {
      detailCategoryGroup();
    },
  },
];

function toggleActionMenu({
  event,
  data,
}: {
  event: Event;
  data: CategoryGroupInterface;
}) {
  menuAction.value.toggle(event);
  categoryGroup.value = cloneDeep(data);
  categoryGroup.value.parentName = '';
  categoryGroupFromAdmin.value = data.isGlobal;
}

const categoryGroup = ref<CategoryGroupInterface>({} as CategoryGroupInterface);
const categoryGroupFormVisible = ref(false);
</script>

<script lang='ts'>
export default { name: 'CategoryGroupConfig' };
</script>
