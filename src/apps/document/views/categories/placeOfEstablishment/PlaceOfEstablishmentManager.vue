<template>
  <div class='align-items-center flex flex-wrap justify-content-between mb-2'>
    <span class='font-bold text-primary text-xl'>{{
      t('document.placeOfEstablishment.tableTitle')
    }}</span>
    <div class='block p-input-icon-left'>
      <div class='actions flex gap-2'>
        <ButtonIcon
          class='btn-create'
          icon='add'
          :label="t('common.create')"
          @click='showPlaceOfEstablishmentFormDialog'/>
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
    :value='placeOfEstablishments'
    v-bind='DEFAULT_DATATABLE_CONFIG'>
    <template #empty>
      <span class='block font-bold text-600 text-center'>{{
        t('common.emptyRecords', {
          itemType: toLower(t('document.placeOfEstablishment.objectName')),
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
      :header="t('document.placeOfEstablishment.name')"></Column>

    <Column
      field='code'
      :header="t('document.placeOfEstablishment.code')"></Column>

    <Column
      class='text-center'
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

  <PlaceOfEstablishmentForm
    v-if='placeOfEstablishmentFormVisible'
    :id='placeOfEstablishment.id'
    :place-of-establishment='placeOfEstablishment'
    :visible-dialog='placeOfEstablishmentFormVisible'
    @hide-dialog='hidePlaceOfEstablishmentFormDialog'
    @reload='reload'/>
</template>

<script lang='ts' setup>
import { assign, cloneDeep, get, toLower } from 'lodash';
import Column from 'primevue/column';
import { useConfirm } from 'primevue/useconfirm';
import { inject, onMounted, reactive, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import {
  deletePlaceOfEstablishment,
  searchPlaceOfEstablishment,
} from '@/apps/document/api/graphql/place-of-establishment';
import {
  PlaceOfEstablishment,
  type PlaceOfEstablishmentEdge,
  type PlaceOfEstablishmentInterface,
} from '@/apps/document/model/placeOfEstablishment';
import PlaceOfEstablishmentForm
  from '@/apps/document/views/categories/placeOfEstablishment/PlaceOfEstablishmentForm.vue';
import { DEFAULT_DATATABLE_CONFIG, DEFAULT_PAGE_SIZE, } from '@/common/constants';
import { toastErrorData, toastSuccess, } from '@/common/helpers/custom-toast-service';
import { Direction, type Pageable } from '@/common/model/query';

const { t } = useI18n() || {};
const searchKeyword = ref('');
const getAllPlaceOfEstablishmentLoading = ref(true);
const placeOfEstablishments = ref<any[]>([]);
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
  onResult: searchPlaceOfEstablishmentResult,
  onError: searchPlaceOfEstablishmentError,
  refetch: searchPlaceOfEstablishmentRefetch,
  variables: searchPlaceOfEstablishmentVariable,
} = searchPlaceOfEstablishment(searchParams);

searchPlaceOfEstablishmentResult((res) => {
  const {
    totalCount,
    edges
  } = get(res, 'data.searchPlaceOfEstablishment', {
    totalCount: 0,
    edges: [],
  });
  totalRecords.value = totalCount;
  if (isLoadMore.value) {
    placeOfEstablishments.value = [
      ...placeOfEstablishments.value,
      ...edges.map((edge: PlaceOfEstablishmentEdge) => ({ ...edge.node })),
    ];
  } else {
    placeOfEstablishments.value = edges.map(
      (edge: PlaceOfEstablishmentEdge) => ({ ...edge.node }),
    );
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

searchPlaceOfEstablishmentError((error) => {
  getAllPlaceOfEstablishmentLoading.value = false;
  toastErrorData({
    prefix: 'hrm.placeOfEstablishment.errors',
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
  assign(placeOfEstablishment.value, new PlaceOfEstablishment());
  searchPlaceOfEstablishmentRefetch(searchParams);
}

function showPlaceOfEstablishmentFormDialog() {
  assign(placeOfEstablishment.value, new PlaceOfEstablishment());
  placeOfEstablishmentFormVisible.value = true;
  isDetail.value = false;
}

function editPlaceOfEstablishment() {
  placeOfEstablishmentFormVisible.value = true;
  isDetail.value = false;
}

function hidePlaceOfEstablishmentFormDialog() {
  placeOfEstablishmentFormVisible.value = false;
  assign(placeOfEstablishment.value, new PlaceOfEstablishment());
  searchParams.keyword = '';
}

const menuAction = ref();
const menuActions = [
  {
    label: t('common.edit'),
    icon: 'edit',
    command: () => {
      editPlaceOfEstablishment();
    },
  },
  {
    label: t('common.delete'),
    icon: 'delete',
    command: () => {
      handleDeletePlaceOfEstablishment();
    },
  },
];

function toggleActionMenu({
  event,
  data,
}: {
  event: Event;
  data: PlaceOfEstablishmentInterface;
}) {
  menuAction.value.toggle(event);
  placeOfEstablishment.value = cloneDeep(data);
  selectedRow.value = data;
}

const placeOfEstablishment = ref<PlaceOfEstablishmentInterface>(
  new PlaceOfEstablishment(),
);
const placeOfEstablishmentFormVisible = ref(false);

const {
  mutate: deletePlaceOfEstablishmentMutate,
  onDone: deletePlaceOfEstablishmentDone,
  onError: deletePlaceOfEstablishmentError,
} = deletePlaceOfEstablishment();

const confirm = useConfirm();

function handleDeletePlaceOfEstablishment() {
  confirm.require({
    message: t('common.confirmDelete', { itemName: placeOfEstablishment.value.name, }),
    header: t('common.confirm'),
    acceptLabel: t('common.delete'),
    acceptClass: 'p-button-danger',
    icon: 'pi pi-exclamation-triangle',
    accept: () => {
      deletePlaceOfEstablishmentMutate({ id: placeOfEstablishment.value.id });
    },
  });
}

deletePlaceOfEstablishmentDone(() => {
  toastSuccess({ message: t('common.result.message.deleted', { itemName: placeOfEstablishment.value.name, }), });
  confirm.close();
  reload();
});

deletePlaceOfEstablishmentError((error: any) => {
  toastErrorData({ error });
});

watch(searchTerm, (newValue) => {
  placeOfEstablishments.value = [];
  searchParams.keyword = newValue;
  searchParams.pageable.page = 0;
  searchPlaceOfEstablishmentVariable.value = searchParams;
});
</script>

<script lang='ts'>
export default { name: 'PlaceOfEstablishmentManager' };
</script>
