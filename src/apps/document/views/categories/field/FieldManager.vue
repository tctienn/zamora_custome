<template>
  <div class='align-items-center flex flex-wrap justify-content-between mb-2'>
    <span class='font-bold text-primary text-xl'>{{
      t('document.field.tableTitle')
    }}</span>
    <div class='block p-input-icon-left'>
      <div class='actions flex gap-2'>
        <ButtonIcon
          class='btn-create'
          icon='add'
          :label="t('common.create')"
          @click='showFieldFormDialog'/>
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
    :value='fields'
    v-bind='DEFAULT_DATATABLE_CONFIG'>
    <template #empty>
      <span class='block font-bold text-600 text-center'>{{
        t('common.emptyRecords', {
          itemType: toLower(t('document.field.objectName')),
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
      :header="t('document.field.name')"></Column>

    <Column
      field='code'
      :header="t('document.field.code')"></Column>

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

  <FieldForm
    v-if='fieldFormVisible'
    :id='field.id'
    :field='field'
    :visible-dialog='fieldFormVisible'
    @hide-dialog='hideFieldFormDialog'
    @reload='reload'/>
</template>

<script lang='ts' setup>
import { assign, cloneDeep, get, toLower } from 'lodash';
import Column from 'primevue/column';
import { useConfirm } from 'primevue/useconfirm';
import { inject, onMounted, reactive, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { deleteField, searchField } from '@/apps/document/api/graphql/field';
import { Field, type FieldEdge, type FieldInterface, } from '@/apps/document/model/field';
import FieldForm from '@/apps/document/views/categories/field/FieldForm.vue';
import { DEFAULT_DATATABLE_CONFIG, DEFAULT_PAGE_SIZE, } from '@/common/constants';
import { toastErrorData, toastSuccess, } from '@/common/helpers/custom-toast-service';
import { Direction, type Pageable } from '@/common/model/query';

const { t } = useI18n() || {};
const searchKeyword = ref('');
const getAllFieldLoading = ref(true);
const fields = ref<any[]>([]);
let isDetail = ref(false);
const canLoadMore = ref(true);
const isLoadMore = ref(true);
const loadingMore = ref(false);
const selectedRow = ref();
const searchTerm = inject('searchTerm', ref(''));

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
  onResult: searchFieldResult,
  onError: searchFieldError,
  refetch: searchFieldRefetch,
  variables: searchFieldVariable,
} = searchField(searchParams);

searchFieldResult((res) => {
  const {
    totalCount,
    edges
  } = get(res, 'data.searchField', {
    totalCount: 0,
    edges: [],
  });
  totalRecords.value = totalCount;
  if (isLoadMore.value) {
    fields.value = [
      ...fields.value,
      ...edges.map((edge: FieldEdge) => ({ ...edge.node })),
    ];
  } else {
    fields.value = edges.map((edge: FieldEdge) => ({ ...edge.node }));
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

searchFieldError((error) => {
  getAllFieldLoading.value = false;
  toastErrorData({
    prefix: 'hrm.field.errors',
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
  assign(field.value, new Field());
  searchFieldRefetch(searchParams);
}

function showFieldFormDialog() {
  assign(field.value, new Field());
  fieldFormVisible.value = true;
  isDetail.value = false;
}

function editField() {
  fieldFormVisible.value = true;
  isDetail.value = false;
}

function hideFieldFormDialog() {
  fieldFormVisible.value = false;
  assign(field.value, new Field());
  searchParams.keyword = '';
}

const menuAction = ref();
const menuActions = [
  {
    label: t('common.edit'),
    icon: 'edit',
    command: () => {
      editField();
    },
  },
  {
    label: t('common.delete'),
    icon: 'delete',
    command: () => {
      handleDeleteField();
    },
  },
];

function toggleActionMenu({
  event,
  data,
}: {
  event: Event;
  data: FieldInterface;
}) {
  menuAction.value.toggle(event);
  field.value = cloneDeep(data);
  selectedRow.value = data;
}

const field = ref<FieldInterface>(new Field());
const fieldFormVisible = ref(false);

const {
  mutate: deleteFieldMutate,
  onDone: deleteFieldDone,
  onError: deleteFieldError,
} = deleteField();

const confirm = useConfirm();

function handleDeleteField() {
  confirm.require({
    message: t('common.confirmDelete', {
      itemType: t('hrm.field.objectName'),
      itemName: field.value.name,
    }),
    header: t('common.confirm'),
    acceptLabel: t('common.delete'),
    acceptClass: 'p-button-danger',
    icon: 'pi pi-exclamation-triangle',
    accept: () => {
      deleteFieldMutate({ id: field.value.id });
    },
  });
}

deleteFieldDone(() => {
  toastSuccess({
    message: t('common.result.message.deleted', {
      itemType: t('hrm.field.objectName'),
      itemName: field.value.name,
    }),
  });
  confirm.close();
  reload();
});

deleteFieldError((error: any) => {
  toastErrorData({ error });
});

watch(searchTerm, (newValue) => {
  fields.value = [];
  searchParams.keyword = newValue;
  searchParams.pageable.page = 0;
  searchFieldVariable.value = searchParams;
});
</script>

<script lang='ts'>
export default { name: 'FieldManager' };
</script>
