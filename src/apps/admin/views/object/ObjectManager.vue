<template>
  <Toolbar class='align-content-center h-3rem mb-2 px-2 py-0 surface-0'>
    <template #start>
      <div class='align-items-center flex gap-2'>
        <div class='font-bold'>
          {{ t('admin.objectTemplate.tableTitle') }}
        </div>
      </div>
    </template>
  </Toolbar>

  <div class='h-full surface-0'>
    <DataTable
      v-model:selection='selectedRow'
      :total-records='totalRecords'
      :value='objects'
      v-bind='DEFAULT_DATATABLE_CONFIG'
      @sort='onSort($event)'>
      <template #empty>
        <span class='block font-bold text-600 text-center'>{{
          t('common.emptyRecords', {
            itemType: toLower(t('admin.objectTemplate.objectName')),
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
        field='name'
        :header="t('admin.objectTemplate.name')"></Column>

      <Column
        class='max-w-20rem'
        field='description'
        :header="t('common.description')">
      </Column>

      <Column
        class='text-center'
        field='status'
        :header="t('common.status')">
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

  <ObjectForm
    v-if='objectFormVisible'
    :item='object'
    :visible-dialog='objectFormVisible'
    @hide-dialog='hideObjectFormDialog'
    @reload='reload'/>
</template>

<script lang='ts' setup>
import { assign, cloneDeep, get, toLower } from 'lodash';
import Column from 'primevue/column';
import type { DataTableSortEvent } from 'primevue/datatable';
import { inject, onMounted, reactive, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

import { getObjectsGraphql } from '@/apps/admin/api/graphql/object-graphql-api';
import type { ObjectEdge, ObjectInterface } from '@/apps/admin/model/object';
import { hasPermission } from '@/apps/admin/services/permission';
import ObjectForm from '@/apps/admin/views/object/ObjectForm.vue';
import MenuItem from '@/common/components/custom/MenuItem.vue';
import { DEFAULT_DATATABLE_CONFIG, DEFAULT_PAGE_SIZE, STATUSES, } from '@/common/constants';
import { toastErrorData } from '@/common/helpers/custom-toast-service';
import { Direction, type Pageable } from '@/common/model/query';

const { t } = useI18n() || {};
const router = useRouter();
const searchTerm = inject('searchTerm', ref(''));
const searchTermUpdate = inject('updateSearchTerm', (value: string) => void {});
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
  keyword: '',
  pageable: pageable,
});

const searchKeyword = ref('');
const totalRecords = ref(0);
const getObjectLoading = ref(true);
const objects = ref<any[]>([]);
const selectedRow = ref();
const dataTable = ref(null);
const canLoadMore = ref(true);
const isLoadMore = ref(true);
const loadingMore = ref(false);

const {
  onResult: getObjectsResult,
  onError: getObjectsError,
  refetch: getObjectsRefetch,
  variables: getObjectsVariable,
} = getObjectsGraphql(searchParams);

getObjectsResult((result) => {
  const {
    totalCount,
    edges
  } = get(result, 'data.searchObjectsTemplate', { objectConnection: {}, });
  totalRecords.value = totalCount;
  canLoadMore.value = edges.length >= DEFAULT_PAGE_SIZE;
  loadingMore.value = false;
  if (isLoadMore.value) {
    objects.value = [
      ...objects.value,
      ...edges.map((edge: ObjectEdge) => ({ ...edge.node })),
    ];
  } else {
    objects.value = edges.map((edge: ObjectEdge) => ({ ...edge.node }));
  }
  getObjectLoading.value = false;
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

getObjectsError((error) => {
  getObjectLoading.value = false;
  toastErrorData({
    prefix: 'object.errors',
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
  searchParams.pageable.page = 0;
  assign(object.value, objectInitial);
  getObjectsRefetch(searchParams);
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

function editObject() {
  objectFormVisible.value = true;
}

function hideObjectFormDialog() {
  objectFormVisible.value = false;
  assign(object.value, objectInitial);
  searchParams.keyword = '';
  searchTermUpdate('');
}

const menuAction = ref();
const menuActions = [
  {
    label: t('common.view'),
    icon: 'visibility',
    command: () => {
      editObject();
    },
  },
  {
    label: t('common.configure'),
    icon: 'settings',
    command: () => {
      configObject();
    },
  },
];

function toggleActionMenu({
  event,
  data,
}: {
  event: Event;
  data: ObjectInterface;
}) {
  menuAction.value.toggle(event);
  object.value = cloneDeep(data);
  selectedRow.value = data;
}

const objectInitial = {
  id: '',
  className: '',
  name: '',
  description: '',
  status: STATUSES.ACTIVE,
  properties: [],
};
const object = ref<ObjectInterface>(objectInitial);
const objectFormVisible = ref(false);

function configObject() {
  router.push({
    name: 'objectProperty/VIEW',
    query: { objectId: object.value.id },
  });
}

watch(searchTerm, (newValue) => {
  objects.value = [];
  searchParams.keyword = newValue;
  searchParams.pageable.page = 0;
  getObjectsVariable.value = searchParams;
});
</script>

<script lang='ts'>
export default { name: 'ObjectManager' };
</script>
