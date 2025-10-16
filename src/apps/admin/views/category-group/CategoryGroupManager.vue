<template>
  <Toolbar class='h-3rem mb-2 px-2 py-0 surface-0'>
    <template #start>
      <div class='align-items-center flex gap-2'>
        <div class='font-bold'>
          {{ t('admin.categoryGroup.objectName') }}
        </div>
      </div>
    </template>
    <template #end>
      <div class='btn-group-toolbar flex gap-3 mr-1 my-1'>
        <ButtonIcon
          v-if="hasPermission('/ADMIN/CATEGORY/CATEGORY_CATEGORY/CREATE')"
          class='btn-create focus:shadow-none font-medium p-2'
          icon='add'
          :label='t("common.create")'
          @click='addCategory'/>
        <ButtonIcon
          class='focus:shadow-none font-medium p-2'
          icon='export_notes'
          :label='t("common.export")'
          outlined
          @click='exportCategory'/>
      </div>
    </template>
  </Toolbar>
  <div class='expand grid grid-nogutter'>
    <div
      class='col-3 h-full pr-3'>
      <Tree
        v-model:selectionKeys='selectedKey'
        :meta-key-selection='true'
        selection-mode='single'
        :value='nodes'
        @node-select='onNodeSelect'>
        <template
          #default='slotProp'>
          <div
            class='align-items-center edge flex justify-content-between'
            :style="slotProp.node.data.status != 'ACTIVE' ? { color: '#EF4444' } : {}">
            {{ slotProp.node.label }}
          </div>
        </template>

      </Tree>
    </div>
    <div class='col-9 h-full surface-0'>
      <CategoryManager
        v-model:category-form-visible='categoryFormVisible'
        v-model:is-create-category='isCreateCategory'
        v-model:selected-key-group='selectedKey'
        :category-groups='categoryGroups'
        :group-code='groupCode'
        :selected-group-category='selectedGroupCategory'/>
    </div>
  </div>
</template>

<script setup lang='ts'>
import { cloneDeep, get } from 'lodash';
import type { TreeSelectionKeys } from 'primevue/tree';
import type { TreeNode } from 'primevue/treenode';
import { useConfirm } from 'primevue/useconfirm';
import { computed, reactive, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { deleteCategoryGroupGraphql, getCategoryGroupGraphql } from '@/apps/admin/api/graphql/category-group-graphql-api';
import { exportCategoryRest } from '@/apps/admin/api/rest/exportApi';
import type { CategoryGroupEdge, CategoryGroupInterface } from '@/apps/admin/model/category';
import { usePermissionStore } from '@/apps/admin/store/permission';
import CategoryManager from '@/apps/admin/views/category/CategoryManager.vue';
import { DEFAULT_PAGE_SIZE } from '@/common/constants';
import { toastErrorData, toastSuccess } from '@/common/helpers/custom-toast-service';
import { downloadFile } from '@/common/helpers/file-utils';
import { sortTree } from '@/common/helpers/tree-node-utils';
import { listToTree } from '@/common/helpers/utils';
import { Direction, type Pageable } from '@/common/model/query';

const { t } = useI18n() || {};
const isCreateGroup = ref(true);
const canLoadMore = ref(true);
const isLoadMore = ref(true);
const loadingMore = ref(false);
const isExporting = ref<boolean>(false);
const nodes = computed<TreeNode[]>(() => {
  return sortTree(listToTree(categoryGroups.value.map((item: CategoryGroupInterface) => ({
    key: item.code,
    label: item.name,
    parentId: item.parentCode,
    data: { ...item },
    children: []
  })), {
    id: 'key',
    parentId: 'parentId',
    children: 'children'
  }), 'order');
});

const selectedKey = ref<TreeSelectionKeys>({});
const pageable = reactive<Pageable>({
  page: 0,
  size: DEFAULT_PAGE_SIZE,
  sort: [
    {
      property: 'order',
      direction: Direction.ASC
    }
  ]
});
const searchParams = reactive({
  keyword: '',
  pageable: pageable
});
const searchParamsGroup = reactive({
  keyword: '',
  pageable: {
    ...pageable,
    size: 99999999
  }
});
const categoryFormVisible = ref(false);
const selectedGroupCategory = ref<CategoryGroupInterface>();

const totalRecords = ref(0);
const getCategoryGroupLoading = ref(true);
const categoryGroups = ref<CategoryGroupInterface[]>([]);
const hasPermission = usePermissionStore().hasPermission;
const groupCode = ref();
const {
  onResult: getCategoryGroupResult,
  onError: getCategoryGroupError,
  refetch: getCategoryGroupRefetch
} = getCategoryGroupGraphql(searchParamsGroup);

getCategoryGroupResult(async (result) => {
  const {
    totalCount,
    edges
  } = get(result, 'data.categoryGroups', {
    totalCount: 0,
    edges: []
  });
  totalRecords.value = totalCount;
  if (isLoadMore.value) {
    categoryGroups.value = [...categoryGroups.value, ...edges.map((edge: CategoryGroupEdge) => ({ ...edge.node }))];
  } else {
    categoryGroups.value = edges.map((edge: CategoryGroupEdge) => ({ ...edge.node }));
  }
  isLoadMore.value = false;
  selectedGroupCategory.value = selectedGroupCategory.value || categoryGroups.value[0];
  selectedKey.value = { [selectedGroupCategory.value?.code as string]: true };
  groupCode.value = selectedGroupCategory.value?.code;
  canLoadMore.value = edges?.length >= DEFAULT_PAGE_SIZE;
  getCategoryGroupLoading.value = false;
});

getCategoryGroupError((error) => {
  getCategoryGroupLoading.value = false;
  toastErrorData({
    prefix: 'categoryGroup.errors',
    error
  });
});

function reloadGroup() {
  getCategoryGroupRefetch();
}

async function loadCategories(page: number, size: number) {
  getCategoryGroupLoading.value = true;
  searchParams.pageable.page = page;
  // getCategoriesByGroupRefetch();
}

function scrollEvent(event: any) {
  const { scrollTop, scrollHeight, clientHeight } = event.target;
  if (scrollTop + clientHeight + 1 >= scrollHeight && !loadingMore.value && canLoadMore.value) {
    isLoadMore.value = true;
    loadingMore.value = true;
    pageable.page += 1;
    loadCategories(pageable.page, pageable.size).then(() => {
      loadingMore.value = false;
    });
  }
}

function addScrollEventListener(selector: string) {
  const scrollableContainer = document.querySelector(selector);
  if (scrollableContainer) {
    scrollableContainer.addEventListener('scroll', scrollEvent);
  }
}

// onMounted(() => {
//   nextTick(() => {
//     if (dataTable.value) {
//       addScrollEventListener('.p-datatable-wrapper');
//     }
//   });
// });
function addCategoryGroup() {
  isCreateGroup.value = true;
  categoryGroupFormVisible.value = true;
}

function editCategoryGroup({ data }: { data: CategoryGroupInterface; event: Event }) {
  selectedGroupCategory.value = cloneDeep(data);
  selectedKey.value = { [data.code]: true };
  isCreateGroup.value = false;
  categoryGroupFormVisible.value = true;
}

function hideCategoryGroupFormDialog() {
  categoryGroupFormVisible.value = false;
  categoryGroup.value = {} as CategoryGroupInterface;
}

const categoryGroup = ref<CategoryGroupInterface>({} as CategoryGroupInterface);
const categoryGroupFormVisible = ref(false);

const {
  mutate: deleteCategoryGroupMutate,
  onDone: deleteCategoryGroupDone,
  onError: deleteCategoryGroupError
} = deleteCategoryGroupGraphql();

const confirm = useConfirm();

function deleteCategoryGroup() {
  confirm.require({
    message: t('common.confirmDelete', {
      itemType: t('categoryGroup.objectName'),
      itemName: categoryGroup.value.name
    }),
    header: t('common.confirm'),
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: t('common.delete'),
    acceptClass: 'p-button-danger',
    accept: () => {
      deleteCategoryGroupMutate({ code: selectedGroupCategory?.value?.code });
    }
  });
}

deleteCategoryGroupDone(() => {
  toastSuccess({
    message: t('common.result.message.deleted', {
      itemType: t('categoryGroup.objectName'),
      itemName: selectedGroupCategory?.value?.name
    })
  });
  confirm.close();
  reloadGroup();
});

deleteCategoryGroupError((error) => {
  toastErrorData({ error });
});

function onNodeSelect(node: TreeNode) {
  groupCode.value = node.key;
  selectedGroupCategory.value = node.data;
}

function exportCategory() {
  isExporting.value = true;
  exportCategoryRest(selectedGroupCategory.value?.code ?? '').then((value: any) => {
    if (value) {
      downloadFile(value, 'DanhMuc.xlsx');
    }
    isExporting.value = false;
  }).catch((reason: any) => {
  });

}

const isCreateCategory = ref<boolean>(true);

function addCategory() {
  categoryFormVisible.value = true;
  isCreateCategory.value = true;
}

</script>

<script lang='ts'>
export default { name: 'CategoryGroupManager' };
</script>

<style scoped>
:deep(.p-treenode-label) {
  width: 100%;
}

:deep(.p-tree .p-tree-container .p-treenode:focus  .p-treenode-content) {
  box-shadow: unset
}

.edge {
  .toggle {
    visibility: hidden;
  }

  &:hover {
    .toggle {
      visibility: visible;
    }
  }

}

:deep(.p-tree-selectable) {
  overflow: auto;
}

.expand {
  height: calc(100vh - 10rem);
}

:deep(.p-datatable-scrollable .p-datatable-wrapper) {
  max-height: 80vh;
}

:deep(.p-tree-selectable) {
  position: fixed;
  height: calc(100vh - 10rem);
  overflow: hidden;
  width: 22%;
}

:deep(.p-tree-selectable:hover) {
  overflow: auto;
}
</style>