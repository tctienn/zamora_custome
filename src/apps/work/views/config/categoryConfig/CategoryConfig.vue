<template>
  <Toolbar class='align-content-center h-3rem mb-2 px-2 py-0 surface-0'>
    <template #start>
      <div class='align-items-center flex gap-2'>
        <div class='font-bold'>
          {{ t('admin.category.tableTitle') }}
        </div>
      </div>
    </template>
    <template #end>
      <div class='align-items-center btn-group-toolbar flex gap-1 h-3rem mr-1 my-1'>
        <ButtonIcon
          v-if="hasPermission('/ADMIN/CATEGORY/CATEGORY_CATEGORY/CREATE')"
          class='btn-create focus:shadow-none font-medium p-2'
          icon='add'
          :label='t("common.create")'
          @click='showCategoryFormDialog'/>

      </div>
    </template>
  </Toolbar>

  <div class='h-full surface-0'>
    <DataTable
      v-bind='DEFAULT_DATATABLE_CONFIG'
      lazy
      :loading='getCategoryLoading'
      :total-records='totalRecords'
      :value='categories'
      @page='onPage($event)'
      @sort='onSort($event)'>
      <template #empty>
        <span class='block font-bold text-600 text-center'>{{
          t('common.emptyRecords', {
            itemType: toLower(t('admin.category.objectName')),
          })
        }}</span>
      </template>

      <Column
        field='ordinalNumber'
        :header='t("common.ordinalNumber")'></Column>

      <Column
        field='code'
        :header="t('admin.category.code')"
        :sortable='true'></Column>

      <Column
        field='name'
        :header="t('admin.category.name')"
        :sortable='true'></Column>

      <Column
        field='groupName'
        :header="t('admin.category.group')"
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

      <Column
        v-if='menuActionsFilter.length'
        class='text-center'>
        <template #body='{ data }'>
          <ButtonIcon
            v-tooltip.top="t('common.action')"
            class='text-color'
            icon='list'
            rounded
            text
            @click='toggleActionMenu({ event: $event, data: data })'/>
        </template>
      </Column>
    </DataTable>
  </div>

  <Menu
    ref='menuAction'
    :model='categoryFromAdmin ? menuActionsForGlobal : menuActionsFilter'
    :popup='true'>
    <template #item='{ item: { icon, label } }'>
      <MenuItem
        :icon='icon'
        :label='label'/>
    </template>
  </Menu>

  <CategoryFormConfig
    v-if='categoryFormVisible'
    :all-category-group='parentCategoryGroups'
    :is-detail='isDetail'
    :item='category'
    :visible-dialog='categoryFormVisible'
    @hide-dialog='hideCategoryFormDialog'
    @reload='reload'/>
</template>

<script setup lang='ts'>
import { assign, cloneDeep, get, toLower } from 'lodash';
import Column from 'primevue/column';
import DataTable, { type DataTableSortEvent } from 'primevue/datatable';
import { useConfirm } from 'primevue/useconfirm';
import { computed, reactive, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { deleteCategoryGraphql, searchCategoryByAppGraphql, } from '@/apps/admin/api/graphql/category-graphql-api';
import { getAllCategoryGroupGraphql } from '@/apps/admin/api/graphql/category-group-graphql-api';
import type { CategoryEdge, CategoryGroupInterface, CategoryInterface, } from '@/apps/admin/model/category';
import { hasPermission } from '@/apps/admin/services/permission';
import CategoryFormConfig from '@/apps/work/views/config/categoryConfig/CategoryFormConfig.vue';
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
      property: 'server',
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
const getCategoryLoading = ref(true);
const categories = ref<CategoryInterface[]>([]);
const categoryFromAdmin = ref(false);
const menuActionsForGlobal = [
  {
    label: t('common.detail'),
    icon: 'visibility',
    functionPermission: '/ADMIN/CATEGORY/CATEGORY_GROUP/CREATE/VIEW',
    command: () => {
      detailCategory();
    },
  },
];

const {
  onResult: getCategoryResult,
  onError: getCategoryError,
  refetch: getCategoryRefetch,
} = searchCategoryByAppGraphql(searchParams);

getCategoryResult((result) => {
  const {
    totalCount,
    edges
  } = get(result, 'data.searchCategoryByApp', {
    totalCount: 0,
    edges: [],
  });
  totalRecords.value = totalCount;
  categories.value = edges.map((edge: CategoryEdge, index: number) => ({
    ...edge.node,
    ordinalNumber: pageable.page * pageable.size + index + 1,
  }));
  getCategoryLoading.value = false;
});

getCategoryError((error) => {
  getCategoryLoading.value = false;
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
  assign(category.value, {});
  getCategoryRefetch(searchParams);
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

function showCategoryFormDialog() {
  category.value = {
    code: '',
    name: '',
    description: '',
    groupCode: '',
    groupName: '',
    order: null,
    isGlobal: false,
    isDefault: false,
    status: 'ACTIVE',
  };
  categoryFormVisible.value = true;
  isDetail.value = false;
}

function editCategory() {
  category.value.groupName = '';
  categoryFormVisible.value = true;
  isDetail.value = false;
}

function detailCategory() {
  category.value.groupName = '';
  categoryFormVisible.value = true;
  isDetail.value = true;
}

function hideCategoryFormDialog() {
  categoryFormVisible.value = false;
  assign(category.value, {});
}

const menuAction = ref();
const menuActions = [
  {
    label: t('common.detail'),
    icon: 'visibility',
    functionPermission: '/ADMIN/CATEGORY/CATEGORY_CATEGORY/VIEW',
    command: () => {
      detailCategory();
    },
  },
  {
    label: t('common.edit'),
    icon: 'edit',
    functionPermission: '/ADMIN/CATEGORY/CATEGORY_CATEGORY/UPDATE',
    command: () => {
      editCategory();
    },
  },
  {
    label: t('common.delete'),
    icon: 'delete',
    functionPermission: '/ADMIN/CATEGORY/CATEGORY_CATEGORY/DELETE',
    command: () => {
      deleteCategory();
    },
  },
];

const menuActionsFilter = computed(() =>
  menuActions.filter((m) => hasPermission(m.functionPermission)),
);

function toggleActionMenu({
  event,
  data,
}: {
  event: Event;
  data: CategoryInterface;
}) {
  menuAction.value.toggle(event);
  category.value = cloneDeep(data);
  categoryFromAdmin.value = category.value.isGlobal;
}

const category = ref<CategoryInterface>({} as CategoryInterface);
const categoryFormVisible = ref(false);

const {
  mutate: deleteCategoryMutate,
  onDone: deleteCategoryDone,
  onError: deleteCategoryError,
} = deleteCategoryGraphql();

const confirm = useConfirm();

function deleteCategory() {
  confirm.require({
    message: t('common.confirmDelete', {
      itemType: t('admin.category.objectName'),
      itemName: category.value.name,
    }),
    acceptLabel: t('common.delete'),
    acceptClass: 'p-button-danger',
    header: t('common.confirm'),
    icon: 'pi pi-exclamation-triangle',
    accept: () => {
      deleteCategoryMutate({ code: category.value.code });
    },
  });
}

deleteCategoryDone(() => {
  toastSuccess({
    message: t('common.result.message.deleted', {
      itemType: t('admin.category.objectName'),
      itemName: category.value.name,
    }),
  });
  confirm.close();
  reload();
});

deleteCategoryError((error) => {
  toastErrorData({ error });
});
</script>

<script lang='ts'>
export default { name: 'CategoryManager' };
</script>
