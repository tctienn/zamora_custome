<template>
  <div class='align-items-center flex flex-wrap justify-content-between mb-2'>
    <div class='font-bold'>5. {{ t('document.restDay.tableTitle') }}</div>
    <div class='block p-input-icon-left'>
      <div class='actions flex gap-2'>
        <ButtonIcon
          class='btn-create'
          icon=''
          :label="t('Ngày nghỉ trong tuần')"
          outlined
          @click='showRestDayWeekFormDialog'/>
        <ButtonIcon
          class='btn-create'
          icon='add'
          :label="t('common.create')"
          @click='showRestDayFormDialog'/>
        <ButtonIcon
          v-if='selectedRows.length > 0'
          class='btn-create'
          icon='add'
          :label="t('Nhân bản ngày đã chọn')"
          @click='duplicateDate'/>
        <ButtonIcon
          icon='restart_alt'
          outlined
          @click='reload'/>
      </div>
    </div>
  </div>
  <DataTable
    v-model:selection='selectedRows'
    :data-key="'id'"
    :meta-key-selection='false'
    selection-mode='multiple'
    :total-records='totalRecords'
    :value='restDays'
    v-bind='DEFAULT_DATATABLE_CONFIG'>
    <template #empty>
      <span class='block font-bold text-600 text-center'>{{
        t('common.emptyRecords', {
          itemType: toLower(t('document.restDay.objectName')),
        })
      }}</span>
    </template>
    <Column
      class='text-center'
      selection-mode='multiple'/>
    <Column
      class='text-center'
      header='#'
      style='width: 5%'>
      <template #body='slotProps'>
        {{ slotProps.index + 1 }}
      </template>
    </Column>
    <Column
      field='restDayName'
      :header="t('document.restDay.name')"></Column>

    <Column
      class='text-center'
      field='fromDate'
      :header="t('document.restDay.fromDate')"></Column>

    <Column
      class='text-center'
      field='toDate'
      :header="t('document.restDay.toDate')"></Column>

    <Column
      class='text-center'
      field='year'
      :header="t('document.restDay.year')"></Column>

    <Column
      field='note'
      :header="t('document.restDay.note')"
      style='width: 25%'></Column>

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

  <RestDayForm
    v-if='restDayFormVisible'
    :id='restDay.id'
    :doc-type='restDay'
    :visible-dialog='restDayFormVisible'
    @hide-dialog='hideRestDayFormDialog'
    @reload='reload'/>

  <RestDayWeekDialog
    v-if='restDayWeekFormVisible'
    :visible-dialog='restDayWeekFormVisible'
    @hide-dialog='hideRestDayWeekDialog'/>
</template>

<script lang='ts' setup>
import { assign, cloneDeep, get, toLower } from 'lodash';
import Column from 'primevue/column';
import { useConfirm } from 'primevue/useconfirm';
import { inject, onMounted, reactive, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { RestDay, type RestDayEdge, type RestDayInterface, } from '@/apps/document/model/restDay';
import { deleteRestDay, duplicateRestDay, searchRestDay } from '@/apps/hrm/api/graphql/rest-day';
import RestDayForm from '@/apps/hrm/views/profile/form/config/components/RestDayForm.vue';
import RestDayWeekDialog from '@/apps/hrm/views/profile/form/config/components/RestDayWeekDialog.vue';
import { DEFAULT_DATATABLE_CONFIG, DEFAULT_PAGE_SIZE, } from '@/common/constants';
import { toastErrorData, toastSuccess, } from '@/common/helpers/custom-toast-service';
import { Direction, type Pageable } from '@/common/model/query';

const { t } = useI18n() || {};
const getAllRestDayLoading = ref(true);
const restDays = ref<any[]>([]);
let isDetail = ref(false);
const canLoadMore = ref(true);
const isLoadMore = ref(true);
const loadingMore = ref(false);
const selectedRows = ref<RestDayInterface[]>([]);
const searchTerm = inject('searchTerm', ref(''));
const searchTermUpdate = inject('updateSearchTerm', (value: string) => void {});

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
  onResult: searchRestDayResult,
  onError: searchRestDayError,
  refetch: searchRestDayRefetch,
  variables: searchRestDayVariable,
} = searchRestDay(searchParams);

searchRestDayResult((res) => {
  const {
    totalCount,
    edges
  } = get(res, 'data.searchRestDay', {
    totalCount: 0,
    edges: [],
  });
  totalRecords.value = totalCount;
  if (isLoadMore.value) {
    restDays.value = [
      ...restDays.value,
      ...edges.map((edge: RestDayEdge) => ({ ...edge.node })),
    ];
  } else {
    restDays.value = edges.map((edge: RestDayEdge) => ({ ...edge.node }));
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

function hideRestDayWeekDialog() {
  restDayWeekFormVisible.value = false;
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

searchRestDayError((error) => {
  getAllRestDayLoading.value = false;
  toastErrorData({
    prefix: 'hrm.restDay.errors',
    error,
  });
});

function reload() {
  searchParams.keyword = '';
  searchParams.pageable.page = 0;
  assign(restDay.value, new RestDay());
  searchRestDayRefetch(searchParams);
}

const {
  mutate: saveDuplicateRestDay,
  onDone: saveDuplicateRestDayDone
} =
  duplicateRestDay();

function duplicateDate() {
  saveDuplicateRestDay({ ids: filterByMaxYear(selectedRows.value) });
}

saveDuplicateRestDayDone(() => {
  toastSuccess({ message: t('document.restDay.saveDuplicateRestDayDone') });
  reload();
});

function filterByMaxYear(items: RestDayInterface[]): string {
  const maxYearMap = new Map<string, RestDayInterface>();

  items.forEach((item) => {
    const existingItem = maxYearMap.get(item.restDayName);
    if (!existingItem || item.year > existingItem.year) {
      maxYearMap.set(item.restDayName, item);
    }
  });

  return Array.from(maxYearMap.values())
    .map((item) => item.id)
    .join(',');
}

function showRestDayFormDialog() {
  restDay.value = new RestDay();
  restDayFormVisible.value = true;
  isDetail.value = false;
}

function showRestDayWeekFormDialog() {
  restDayWeekFormVisible.value = true;
}

function editRestDay() {
  restDayFormVisible.value = true;
  isDetail.value = false;
}

function hideRestDayFormDialog() {
  restDayFormVisible.value = false;
  restDay.value = new RestDay();
  searchParams.keyword = '';
  searchTermUpdate('');
}

const menuAction = ref();
const menuActions = [
  {
    label: t('common.edit'),
    icon: 'edit',
    command: () => {
      editRestDay();
    },
  },
  {
    label: t('common.delete'),
    icon: 'delete',
    command: () => {
      handleDeleteRestDay();
    },
  },
];

function toggleActionMenu({
  event,
  data,
}: {
  event: Event;
  data: RestDayInterface;
}) {
  menuAction.value.toggle(event);
  restDay.value = cloneDeep(data);
  selectedRows.value = [data];
}

const restDay = ref<RestDayInterface>(new RestDay());
const restDayFormVisible = ref(false);
const restDayWeekFormVisible = ref(false);

const {
  mutate: deleteRestDayMutate,
  onDone: deleteRestDayDone,
  onError: deleteRestDayError,
} = deleteRestDay();

const confirm = useConfirm();

function handleDeleteRestDay() {
  confirm.require({
    message: t('common.confirmDelete', {
      itemType: t('hrm.restDay.objectName'),
      itemName: restDay.value.restDayName,
    }),
    header: t('common.confirm'),
    acceptLabel: t('common.delete'),
    acceptClass: 'p-button-danger',
    icon: 'pi pi-exclamation-triangle',
    accept: () => {
      deleteRestDayMutate({ id: restDay.value.id });
    },
  });
}

deleteRestDayDone(() => {
  toastSuccess({
    message: t('common.result.message.deleted', {
      itemType: t('hrm.restDay.objectName'),
      itemName: restDay.value.restDayName,
    }),
  });
  confirm.close();
  reload();
});

deleteRestDayError((error: any) => {
  toastErrorData({ error });
});

watch(searchTerm, (newValue) => {
  restDays.value = [];
  searchParams.keyword = newValue;
  searchParams.pageable.page = 0;
  searchRestDayVariable.value = searchParams;
});
</script>

<script lang='ts'>
export default { name: 'RestDayManager' };
</script>
