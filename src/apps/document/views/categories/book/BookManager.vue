<template>
  <div class='align-items-center flex flex-wrap justify-content-between mb-2'>
    <span class='font-bold text-primary text-xl'>{{
      t('document.book.tableTitle')
    }}</span>
    <div class='block p-input-icon-left'>
      <div class='actions flex gap-2'>
        <ButtonIcon
          class='btn-create'
          icon='add'
          :label="t('common.create')"
          @click='showBookFormDialog'/>
        <ButtonIcon
          icon='restart_alt'
          outlined
          @click='reload'/>
      </div>
    </div>
  </div>

  <div class='flex gap-3'>
    <div class='show-tree'>
      <TabMenu
        v-model:active-index='activeOrgType'
        class='w-full'
        :model='orgTypes'
        :pt="{
          action: 'p-3',
        }">
      </TabMenu>
      <Tree
        v-model:selectionKeys='selectedOrganization'
        class='h-full overflow-auto'
        :expanded-keys='expandKey'
        selection-mode='single'
        :style='`max-height: calc(100vh - 13rem)`'
        :value='treeNodes'
        @node-select='onChangeOrg'>
        <template #default='slotProps'>
          <div
            class='flex justify-content-between'
            :class="
              (slotProps.node.parentId === '' ||
                slotProps.node.parentId === null ||
                slotProps.node.parentId === 'undefined' ||
                slotProps.node.parentId === undefined
                ? 'font-bold'
                : '') +
                ' ' +
                (slotProps.node.status == 'DEACTIVATE' ? 'text-red-500' : '')
            ">
            <div>{{ slotProps.node.label }}</div>
          </div>
        </template>
      </Tree>
    </div>

    <DataTable
      v-model:selection='selectedRow'
      class='w-full'
      :total-records='totalRecords'
      :value='books'
      v-bind='DEFAULT_DATATABLE_CONFIG'>
      <template #empty>
        <span class='block font-bold text-600 text-center'>{{
          t('common.emptyRecords', {
            itemType: toLower(t('document.book.objectName')),
          })
        }}</span>
      </template>

      <Column
        class='text-center w-1rem'
        header='#'
        style='width: 5%'>
        <template #body='slotProps'>
          {{ slotProps.index + 1 }}
        </template>
      </Column>

      <Column
        class='w-20rem'
        field='bookName'
        :header="t('document.book.name')"></Column>

      <Column
        class='text-center w-10rem'
        field='bookType'
        :header="t('document.book.type')"
        style='width: 10%'>
        <template #body='{ data: { bookType } }'>
          {{
            bookType === 'DOC_IN'
              ? t('document.book.docCome')
              : t('document.book.docOut')
          }}
        </template>
      </Column>

      <Column
        class='text-center w-10rem'
        field='currentNumber'
        :header="t('document.book.currentNumber')"></Column>

      <Column
        class='text-center w-20rem'
        field='prefix'
        :header="t('document.book.prefix')"
        style='width: 20%'></Column>

      <Column
        class='text-center w-5rem'
        field='bookYear'
        :header="t('document.book.bookYear')"></Column>

      <Column
        class='text-center w-6rem'
        field='isDefault'
        :header="t('document.book.default')">
        <template #body='{ data: { isDefault } }'>
          <AppIcon
            v-if='isDefault'
            name='check'
            size='2'/>
        </template>
      </Column>

      <Column
        v-if='menuActions.length'
        class='text-center w-6rem'
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
  </div>
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

  <BookForm
    v-if='bookFormVisible'
    :id='book.id'
    :book='book'
    :visible-dialog='bookFormVisible'
    @hide-dialog='hideBookFormDialog'
    @reload='reloadBookInDept'/>
</template>

<script lang='ts' setup>
import { assign, cloneDeep, get, toLower } from 'lodash';
import Column from 'primevue/column';
import type { MenuItem } from 'primevue/menuitem';
import type { TreeExpandedKeys } from 'primevue/tree';
import type { TreeNode } from 'primevue/treenode';
import { useConfirm } from 'primevue/useconfirm';
import { inject, onMounted, reactive, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { getAllOrganizationGraphql } from '@/apps/admin/api/graphql/organization-graphql-api';
import type { OrganizationInterface } from '@/apps/admin/model/organization';
import { deleteBook, getAllByDeptId, searchBook, } from '@/apps/document/api/graphql/book';
import { getByTypeGraphql } from '@/apps/document/api/graphql/organization';
import { Book, type BookEdge, type BookInterface, } from '@/apps/document/model/book';
import { OrganizationType } from '@/apps/document/model/organization';
import BookForm from '@/apps/document/views/categories/book/BookForm.vue';
import { DEFAULT_DATATABLE_CONFIG, DEFAULT_PAGE_SIZE, } from '@/common/constants';
import { toastErrorData, toastSuccess, } from '@/common/helpers/custom-toast-service';
import { listToTree } from '@/common/helpers/utils';
import { Direction, type Pageable } from '@/common/model/query';

const activeOrgType = ref(0);
const { t } = useI18n() || {};
const getAllBookLoading = ref(true);
const books = ref<any[]>([]);
let isDetail = ref(false);
const canLoadMore = ref(true);
const isLoadMore = ref(true);
const loadingMore = ref(false);
const selectedRow = ref();
const searchTerm = inject('searchTerm', ref(''));
const searchTermUpdate = inject('updateSearchTerm', (value: string) => void {});
const organizations = ref([]);
const treeNodes = ref<TreeNode[]>([]);
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
  structureType: OrganizationType.ADMINISTRATIVE,
});
const totalRecords = ref(0);
const expandKey = ref<TreeExpandedKeys>();

function initExpandKeys(treeNodes: TreeNode[]) {
  const rs: Record<string, true> = {};
  treeNodes.forEach((node) => {
    rs[node.key || ''] = true;
  });
  return rs;
}

const {
  onResult: searchBookResult,
  onError: searchBookError,
  refetch: searchBookRefetch,
  variables: searchBookVariable,
} = searchBook(searchParams);

const {
  onResult: getAllByDeptIdResult,
  load: getAllByDeptIdLoad,
  refetch: getAllByDeptIdRefetch,
} = getAllByDeptId();

const nodeKey = ref();

function onChangeOrg(node: TreeNode) {
  // getAllByDeptIdRefetch({ id: node.key });
  nodeKey.value = node.key;
  getAllByDeptIdLoad(undefined, { id: node.key });
}

function reloadBookInDept() {
  searchParams.pageable.page = 0;
  nodeKey.value
    ? getAllByDeptIdLoad(undefined, { id: nodeKey.value })
    : searchBookRefetch();
}

searchBookResult((res) => {
  const {
    totalCount,
    edges
  } = get(res, 'data.searchBook', {
    totalCount: 0,
    edges: [],
  });
  totalRecords.value = totalCount;
  if (isLoadMore.value) {
    books.value = [
      ...books.value,
      ...edges.map((edge: BookEdge) => ({ ...edge.node })),
    ];
  } else {
    books.value = edges.map((edge: BookEdge) => ({ ...edge.node }));
  }

  canLoadMore.value = edges.length >= DEFAULT_PAGE_SIZE;
  loadingMore.value = false;
  isLoadMore.value = false;
});

getAllByDeptIdResult((res) => {
  books.value = res.data.getAllByDeptId;
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

const selectedOrganization = ref();

function createCodeObject(objects: any[]): { [key: string]: boolean } {
  return objects.reduce(
    (acc, obj) => {
      acc[obj.code] = true;
      return acc;
    },
    {} as { [key: string]: boolean },
  );
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

searchBookError((error) => {
  getAllBookLoading.value = false;
  toastErrorData({
    prefix: 'hrm.book.errors',
    error,
  });
});

function reload() {
  searchParams.keyword = '';
  searchParams.pageable.page = 0;
  assign(book.value, new Book());
  searchBookRefetch(searchParams);
}

watch(activeOrgType, (newValue) => {
  if (newValue === 0) {
    searchParams.structureType = OrganizationType.ADMINISTRATIVE;
  } else if (newValue === 1) {
    searchParams.structureType = OrganizationType.PARTY;
  } else {
    searchParams.structureType = OrganizationType.UNION;
  }
  searchBookRefetch(searchParams);
});

function showBookFormDialog() {
  assign(book.value, new Book());
  bookFormVisible.value = true;
  isDetail.value = false;
}

function editBook() {
  bookFormVisible.value = true;
  isDetail.value = false;
}

function hideBookFormDialog() {
  bookFormVisible.value = false;
  assign(book.value, new Book());
  searchParams.keyword = '';
  searchTermUpdate('');
}

const menuAction = ref();
const menuActions = [
  {
    label: t('common.edit'),
    icon: 'edit',
    command: () => {
      editBook();
    },
  },
  {
    label: t('common.delete'),
    icon: 'delete',
    command: () => {
      handleDeleteBook();
    },
  },
];

function toggleActionMenu({
  event,
  data,
}: {
  event: Event;
  data: BookInterface;
}) {
  menuAction.value.toggle(event);
  book.value = cloneDeep(data);
  selectedRow.value = data;
}

const book = ref<BookInterface>(new Book());
const bookFormVisible = ref(false);

const {
  mutate: deleteBookMutate,
  onDone: deleteBookDone,
  onError: deleteBookError,
} = deleteBook();

const confirm = useConfirm();

function handleDeleteBook() {
  confirm.require({
    message: t('common.confirmDelete', {
      itemType: t('document.book.objectName'),
      itemName: book.value.bookName,
    }),
    header: t('common.confirm'),
    acceptLabel: t('common.delete'),
    acceptClass: 'p-button-danger',
    icon: 'pi pi-exclamation-triangle',
    accept: () => {
      deleteBookMutate({ id: book.value.id });
    },
  });
}

deleteBookDone(() => {
  toastSuccess({
    message: t('common.result.message.deleted', {
      itemType: t('document.book.objectName'),
      itemName: book.value.bookName,
    }),
  });
  confirm.close();
  reload();
});

deleteBookError((error: any) => {
  toastErrorData({ error });
});

watch(searchTerm, (newValue) => {
  books.value = [];
  searchParams.keyword = newValue;
  searchParams.pageable.page = 0;
  searchBookVariable.value = searchParams;
});

const orgTypes: MenuItem[] = [
  {
    label: t('document.book.ADMINISTRATIVE'),
    command: () => {
      fetchOrganizations(OrganizationType.ADMINISTRATIVE);
    },
  },
  {
    label: t('document.book.PARTY'),
    command: () => {
      fetchOrganizations(OrganizationType.PARTY);
    },
  },
  {
    label: t('document.book.UNION'),
    command: () => {
      fetchOrganizations(OrganizationType.UNION);
    },
  },
];
const {
  onResult: getAllOrganizationResult,
  refetch: getAllOrganizationRefetch,
} = getAllOrganizationGraphql();

getAllOrganizationResult((response) => {
  organizations.value = get(response, 'data.allOrganizationPublic', []);
  treeNodes.value = listToTree(
    organizations.value.map((organization: OrganizationInterface) => ({
      key: organization.id,
      label: organization.name,
      data: organization.code,
      code: organization.code,
      countUser: organization.users?.length,
      parentCode: organization.parentCode,
      children: [],
    })),
    {
      id: 'code',
      parentId: 'parentCode',
      children: 'children',
    },
  );
  expandKey.value = initExpandKeys(treeNodes.value);
});

const fetchOrganizations = (type: string) => {
  if (type === OrganizationType.ADMINISTRATIVE) {
    getAllOrganizationRefetch();
  } else {
    const { onResult: getOrganizationResult } = getByTypeGraphql(type);
    getOrganizationResult((res) => {
      organizations.value = res.data.getByType;
      treeNodes.value = listToTree(
        organizations.value.map((organization: OrganizationInterface) => ({
          key: organization.id,
          label: organization.name,
          data: organization.id,
          countUser: organization.users?.length,
          parentId: organization.parentId,
          children: [],
        })),
        {
          id: 'key',
          parentId: 'parentId',
          children: 'children',
        },
      );
      expandKey.value = initExpandKeys(treeNodes.value);
    });
  }
};
</script>

<script lang='ts'>
export default { name: 'BookManager' };
</script>

<style scoped>
.show-tree {
  width: 35rem;
}
</style>
