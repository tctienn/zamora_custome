<template>
  <Toolbar class='align-content-center h-3rem mb-2 px-2 py-0 surface-0'>
    <template #start>
      <div class='align-items-center flex gap-2'>
        <div class='font-bold'>
          {{ t(`media.common.list`) }}
          {{ t(`meeting.meetingRoom.titleForm`) }}
        </div>
      </div>
    </template>
    <template #end>
      <div class='align-items-center btn-group-toolbar flex flex-warp gap-1 h-3rem mr-1 my-1'>
        <Button
          class='btn-create focus:shadow-none font-medium p-2'
          icon='pi pi-plus'
          :label='t("common.create")'
          @click='showFormCreate'>
        </Button>

        <ButtonIcon
          v-tooltip.top='t("common.refresh")'
          class='focus:shadow-none font-normal hover:surface-200'
          icon='restart_alt'
          label='Refresh'
          outlined
          @click='reload'/>
      </div>
    </template>
  </Toolbar>

  <div
    class='surface-0'
    style='height: 100vh'>
    <DataTable
      v-model:selection='selectedRow'
      :loading='loading'
      row-hover
      :total-records='totalRecords'
      :value='meetingRoom'
      v-bind='DEFAULT_DATATABLE_CONFIG'
      @sort='onSort($event)'>
      <template #empty>
        <div class='align-items-center flex flex-column justify-content-center'>
          <span class='font-bold text-500 text-md'>
            {{ t('common.noData') }}
          </span>
        </div>
      </template>
      <Column
        class='text-center'
        :header='t("common.ordinalNumber")'
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
        :header='t(`meeting.meetingRoom.nameMeetingRoom`)'>
      </Column>

      <Column
        field='address'
        :header='t(`meeting.meetingRoom.address`)'
        style='width: 50%'>
      </Column>

      <Column
        class='text-center'
        field='status'
        :header="t('common.status')">
        <template #body='{ data: { status } }'>
          <span
            class='status-badge'
            :class="`status-${status === ACTIVITY_STATUSES.ACTIVE ? 'active' : 'deactivate'}`">{{
              t(
                `common.statuses.${status === ACTIVITY_STATUSES.ACTIVE ? 'active' : 'deactivate'}`,
              )
            }}</span>
        </template>
      </Column>

      <Column
        class='text-center'
        :header="t('common.action')"
        style='width: 5%'>
        <template #body='{ data }'>
          <Button
            icon='pi pi-ellipsis-v'
            rounded
            text
            @click='toggleActionMenu($event, data)'></Button>
         
        </template>
      </Column>
    </DataTable>
  </div>

  <Menu
    ref='menuRef'
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

  <MeetingRoomForm
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
import { inject, onMounted, reactive, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { deleteMeetingRoom, searchByKeyword, } from '@/apps/meeting/graphql/meeting-room';
import type { IMeetingRoom, MeetingRoomEdge, } from '@/apps/meeting/model/meeting-room';
import MeetingRoomForm from '@/apps/meeting/views/meeting/components/room/MeetingRoomForm.vue';
import { ACTIVITY_STATUSES, DEFAULT_DATATABLE_CONFIG, DEFAULT_PAGE_SIZE, } from '@/common/constants';
import { toastSuccess } from '@/common/helpers/custom-toast-service';
import { Direction, type Pageable } from '@/common/model/query';

const { t } = useI18n();
const searchTerm = inject('searchTerm', ref(''));

watch(searchTerm, (newValue) => {
  searchParams.keyword = newValue;
  reload();
});

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
const showForm = ref(false);
const meetingRoom = ref<IMeetingRoom[]>([]);
const selectedRow = ref<IMeetingRoom>();
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
  onResult: getMeetingRoomResult,
  loading,
  refetch: getMeetingRoomRefetch
} =
  searchByKeyword(searchParams);
const {
  mutate: deleteMeetingRoomMutate,
  onDone: deleteMeetingRoomOnDone
} =
  deleteMeetingRoom();

function reload() {
  searchParams.pageable.page = 0;
  getMeetingRoomRefetch(searchParams);
}

getMeetingRoomResult((res) => {
  const {
    totalCount,
    edges
  } = get(res, 'data.searchTextMeetingRoom', {
    totalCount: 0,
    edges: [],
  });
  totalRecords.value = totalCount;
  if (isLoadMore.value) {
    meetingRoom.value = [
      ...meetingRoom.value,
      ...edges.map((edge: MeetingRoomEdge) => ({ ...edge.node })),
    ];
  } else {
    meetingRoom.value = edges.map((edge: MeetingRoomEdge) => ({ ...edge.node, }));
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

function toggleActionMenu(event: Event, data: IMeetingRoom) {
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
  addScrollEventListener('.p-datatable-wrapper');
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
    message: t('common.confirmDelete', {
      itemType: t('meeting.common.room'),
      itemName: selectedRow.value?.name,
    }),
    header: t('common.confirm'),
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: t('common.delete'),
    acceptClass: 'p-button-danger',
    rejectLabel: t('common.cancel'),
    accept: () => {
      handleDeleteMeetingRoom();
    },
  });
};

const handleDeleteMeetingRoom = () => {
  deleteMeetingRoomMutate({ id: selectedRow.value?.id });
};

deleteMeetingRoomOnDone(() => {
  toastSuccess({ message: t('Xóa phòng họp thành công') });
  reload();
});
</script>

<style scoped></style>
