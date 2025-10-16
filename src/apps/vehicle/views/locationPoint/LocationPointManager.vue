<template>
  <Toolbar class='mb-2 p-0'>
    <template #start>
      <div class='align-items-center flex gap-2'>
        <div class='font-bold ml-3'>
          {{ t(`media.common.list`) }} {{ t(`vehicle.locationPoint.titleForm`) }}
        </div>
      </div>
    </template>
    <template #end>
      <div class='btn-group-toolbar flex gap-1 mr-1 my-1'>
        <Button
          class='btn-create focus:shadow-none font-medium p-2'
          icon='pi pi-plus'
          :label='t("common.create")'
          @click='showFormCreate'>
        </Button>
      </div>
    </template>
  </Toolbar>

  <DataTable
    v-bind='DEFAULT_DATATABLE_CONFIG'
    v-model:selection='selectedRow'
    :pt="{
      wrapper: {
        class: 'h-full surface-overlay',
      },
    }"
    row-hover
    :total-records='totalRecords'
    :value='locationPoint'
    @sort='onSort($event)'>
    <Column
      class='text-center'
      header='TT'
      style='width: 5%'>
      <template #body='slotProps'>
        <div
          class='align-items-center flex items-center justify-content-center'>
          {{ slotProps.index + 1 }}
        </div>
      </template>
    </Column>

    <Column
      field='name'
      :header='t(`vehicle.locationPoint.name`)'></Column>

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
          @click='toggleActionMenu($event, data)'/>
      </template>
    </Column>
  </DataTable>

  <Menu
    ref='menuRef'
    :model='menuActions'
    :popup='true'>
    <template #item='{ item: { icon, label } }'>
      <MenuItem
        :icon='icon'
        :label='label'/>
    </template>
  </Menu>

  <LocationPointForm
    v-if='showForm'
    :id='selectedRow?.id'
    :is-detail='isDetail'
    :visible-dialog='showForm'
    @hide-dialog='hideDialogFn'/>
</template>

<script lang='ts' setup>
import { assign, get } from 'lodash';
import Column from 'primevue/column';
import type { DataTableSortEvent } from 'primevue/datatable';
import { useConfirm } from 'primevue/useconfirm';
import { inject, nextTick, onMounted, reactive, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { deleteLocationPoint, searchLocationPoint, } from '@/apps/vehicle/api/graphql/location-point';
import type { ILocationPoint, LocationPointEdge, } from '@/apps/vehicle/model/locationPoint';
import LocationPointForm from '@/apps/vehicle/views/locationPoint/LocationPointForm.vue';
import { DEFAULT_DATATABLE_CONFIG, DEFAULT_PAGE_SIZE, } from '@/common/constants';
import { toastSuccess } from '@/common/helpers/custom-toast-service';

const { t } = useI18n();
const searchTerm = inject('searchTerm', ref(''));

watch(searchTerm, (newValue) => {
  searchParams.keyword = newValue;
  reload();
});

const pageable = reactive({
  page: 0,
  size: DEFAULT_PAGE_SIZE,
  sort: [
    {
      property: 'createdTime',
      direction: 'DESC',
    },
  ],
});
const showForm = ref(false);
const locationPoint = ref<ILocationPoint[]>([]);
const selectedRow = ref<ILocationPoint>();
const canLoadMore = ref(true);
const isLoadMore = ref(true);
const totalRecords = ref();
const menuRef = ref();
const isDetail = ref(false);
const confirm = useConfirm();

const searchParams = reactive({
  keyword: '',
  pageable: pageable,
});

const {
  onResult: getLocationPointResult,
  refetch: getLocationPointRefetch
} =
  searchLocationPoint(searchParams);
const {
  mutate: deleteLocationPointMutate,
  onDone: deleteLocationPointOnDone
} =
  deleteLocationPoint();

function reload() {
  searchParams.keyword = '';
  searchParams.pageable.page = 0;
  getLocationPointRefetch(searchParams);
}

getLocationPointResult((res) => {
  const {
    totalCount,
    edges
  } = get(res, 'data.searchLocationPoint', {
    totalCount: 0,
    edges: [],
  });
  totalRecords.value = totalCount;
  if (isLoadMore.value) {
    locationPoint.value = [
      ...locationPoint.value,
      ...edges.map((edge: LocationPointEdge) => ({ ...edge.node })),
    ];
  } else {
    locationPoint.value = edges.map((edge: LocationPointEdge) => ({ ...edge.node, }));
  }
  canLoadMore.value = edges.length >= DEFAULT_PAGE_SIZE;
  isLoadMore.value = false;
});

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

function toggleActionMenu(event: Event, data: ILocationPoint) {
  menuRef.value.toggle(event);
  selectedRow.value = data;
}

function showFormCreate() {
  selectedRow.value = undefined;
  showForm.value = true;
}

function hideDialogFn() {
  showForm.value = false;
  isDetail.value = false;
  selectedRow.value = undefined;
  reload();
}

function scrollEvent(event: Event) {
  const {
    scrollTop,
    scrollHeight,
    clientHeight
  } = event.target as HTMLElement;
  if (scrollTop + clientHeight + 1 >= scrollHeight && canLoadMore.value) {
    isLoadMore.value = true;
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
  nextTick(() => {
    addScrollEventListener('.p-datatable-wrapper');
  });
});

const menuActions = [
  {
    key: 'detail',
    label: t('common.viewMore'),
    icon: 'visibility',
    command: () => {
      isDetail.value = true;
      showForm.value = true;
    },
  },
  {
    key: 'edit',
    label: t('common.edit'),
    icon: 'edit',
    command: () => {
      showForm.value = true;
    },
  },
  {
    key: 'delete',
    label: t('common.delete'),
    icon: 'delete',
    command: () => {
      confirmDeleteMedia();
    },
  },
];

const confirmDeleteMedia = () => {
  confirm.require({
    message: t('common.confirmDelete', { itemName: selectedRow.value?.name }),
    header: t('common.delete'),
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: t('common.delete'),
    acceptClass: 'p-button-danger',
    rejectLabel: t('common.cancel'),
    accept: () => {
      handleDeleteLocationPoint();
    },
  });
};

const handleDeleteLocationPoint = () => {
  deleteLocationPointMutate({ id: selectedRow.value?.id });
};

deleteLocationPointOnDone(() => {
  toastSuccess({ message: t('Xóa thành công') });
  reload();
});
</script>

<style scoped></style>
