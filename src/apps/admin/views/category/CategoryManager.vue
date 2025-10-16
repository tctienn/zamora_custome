<template>
  <DataTable
    v-model:selection='selectedCategory'
    class='h-full'
    data-key='code'
    :total-records='totalRecords'
    :value='dataCategoryTable'
    v-bind='DEFAULT_DATATABLE_CONFIG'
    @sort='onSort($event)'>
    <template #empty>
      <span class='block font-bold text-600 text-center'>{{
        t('common.emptyRecords', {
          itemType: toLower(t('admin.category.objectName')),
        })
      }}</span>
    </template>

    <Column
      class='text-center'
      :header='t("common.ordinalNumber")'>
      <template #body='slotProps'>
        {{ slotProps.index + 1 }}
      </template>
    </Column>

    <Column
      field='code'
      :header="t('admin.category.code')"
      :sortable='true'></Column>

    <Column
      field='name'
      :header="t('admin.category.name')"
      :sortable='true'></Column>

    <Column
      class='max-w-20rem'
      field='description'
      :header="t('common.description')"
      :sortable='true'>
    </Column>

    <Column
      class='text-center'
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
      class='text-center'
      :header="t('common.action')">
      <template #body='{ data }'>
        <ButtonIcon
          v-if='!data.isGlobal'
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

  <CategoryForm
    v-if='categoryFormVisible'
    v-model:is-create='isCreateCategory'
    v-model:visible-dialog='categoryFormVisible'
    :all-categories='dataCategoryTable'
    :all-category-group='categoryGroups'
    :category='category'
    :selected-category-group='selectedGroupCategory'
    @hide-dialog='hideCategoryFormDialog'
    @reload='reload'/>
</template>

<script lang='ts' setup>
import { assign, cloneDeep, toLower } from 'lodash';
import Column from 'primevue/column';
import DataTable, { type DataTableSortEvent } from 'primevue/datatable';
import type { TreeSelectionKeys } from 'primevue/tree';
import { useConfirm } from 'primevue/useconfirm';
import { onMounted, reactive, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { deleteCategoryGraphql, getAllCategoriesByGroupGraphql, } from '@/apps/admin/api/graphql/category-graphql-api';
import type { CategoryGroupInterface, CategoryInterface, } from '@/apps/admin/model/category';
import { usePermissionStore } from '@/apps/admin/store/permission';
import CategoryForm from '@/apps/admin/views/category/CategoryForm.vue';
import MenuItem from '@/common/components/custom/MenuItem.vue';
import { DEFAULT_DATATABLE_CONFIG, DEFAULT_PAGE_SIZE, } from '@/common/constants';
import { toastErrorData, toastSuccess, } from '@/common/helpers/custom-toast-service';
import { Direction, type Pageable } from '@/common/model/query';

const props = withDefaults(
  defineProps<{
    categoryGroups: CategoryGroupInterface[];
    selectedGroupCategory: CategoryGroupInterface | undefined;
    selectedKeyGroup: TreeSelectionKeys;
    groupCode: string;
  }>(),
  {
    categoryGroups: () => [],
    selectedGroupCategory: undefined,
    selectedKeyGroup: undefined,
    groupCode: undefined,
  },
);

const categoryFormVisible = defineModel<boolean>('categoryFormVisible');
const isCreateCategory = defineModel<boolean>('isCreateCategory');

const { t } = useI18n() || {};

const dataTable = ref(null);
const canLoadMore = ref(true);
const isLoadMore = ref(true);
const loadingMore = ref(false);
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
  groupCode: '',
  pageable: pageable,
});

const searchKeyword = ref('');
const totalRecords = ref(0);
const getCategoryLoading = ref(true);
const hasPermission = usePermissionStore().hasPermission;
const dataCategoryTable = ref<CategoryInterface[]>([]);

const {
  onResult: getCategoriesByGroupOnResult,
  onError: getCategoriesByGroupError,
  load: getCategoriesByGroupLoad,
  refetch: getCategoriesByGroupRefetch,
} = getAllCategoriesByGroupGraphql();

watch(
  () => props.groupCode,
  (value) => {
    pageable.page = 0;
    searchParams.pageable.page = 0;
    dataCategoryTable.value = [];
    canLoadMore.value = true;
    loadTable(value);
  },
);

function loadTable(groupCode: string) {
  const result: false | Promise<any> = getCategoriesByGroupLoad(undefined, {
    groupCode: groupCode,
    pageable: pageable,
  });
  if (result instanceof Promise<any>) {
    result.then((rs) => {
      dataCategoryTable.value = rs.allGroupCategories;
    });
  }

  result
  || getCategoriesByGroupRefetch({
    groupCode: groupCode,
    pageable: pageable,
  })?.then((value: any) => {
    dataCategoryTable.value = [
      ...dataCategoryTable.value,
      ...value.data?.allGroupCategories || [],
    ];

    loadingMore.value = false;
  });
}

getCategoriesByGroupOnResult((result: any) => {
  // canLoadMore.value = result.data?.allGroupCategories.length || 0 >= DEFAULT_PAGE_SIZE;
});

getCategoriesByGroupError((error: any) => {
  getCategoryLoading.value = false;
  toastErrorData({
    prefix: 'category.errors',
    error,
  });
});

const selectedCategory = ref<CategoryInterface>();

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
    pageable.page += 1;
    loadTable(props.groupCode);
    loadingMore.value = true;
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

function searchDatatable() {
  assign(searchParams, {
    keyword: searchKeyword.value,
    pageable: { page: 0 },
  });

  reload();
}

function reload() {
  pageable.page = 0;
  searchParams.pageable.page = 0;
  dataCategoryTable.value = [];
  assign(category.value, {});
  loadTable(props.groupCode);
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

function editCategory() {
  category.value.groupName = '';
  categoryFormVisible.value = true;
  isCreateCategory.value = false;
}

function hideCategoryFormDialog() {
  categoryFormVisible.value = false;
}

const menuAction = ref();
const menuActionCondition = [
  {
    label: t('common.edit'),
    icon: 'edit',
    show: hasPermission('/ADMIN/CATEGORY/CATEGORY_CATEGORY/UPDATE'),
    command: () => {
      editCategory();
    },
  },
  {
    label: t('common.delete'),
    icon: 'delete',
    show: hasPermission('/ADMIN/CATEGORY/CATEGORY_CATEGORY/DELETE'),
    command: () => {
      deleteCategory();
    },
  },
];

const menuActions = menuActionCondition.filter((obj) => obj.show);

function toggleActionMenu({
  event,
  data,
}: {
  event: Event;
  data: CategoryInterface;
}) {
  menuAction.value.toggle(event);
  category.value = cloneDeep(data);
  selectedCategory.value = category.value;
}

const category = ref<CategoryInterface>({} as CategoryInterface);

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
    header: t('common.confirm'),
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: t('common.delete'),
    acceptClass: 'p-button-danger',
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
