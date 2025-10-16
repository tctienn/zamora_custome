<template>
  <Toolbar class='align-content-center h-3rem mb-2 px-2 py-0 surface-0'>
    <template #start>
      <div class='align-items-center flex gap-2'>
        <div class='font-bold'>
          {{ t(`media.common.list`) }}
          {{ t(`media.common.${lowerCase(props.mediaType)}.nameLowerCase`) }}
        </div>
      </div>
    </template>
    <template #end>
      <div class='align-items-center btn-group-toolbar flex flex-warp gap-1 h-3rem mr-1 my-1'>
        <ButtonIcon
          class='btn-create focus:shadow-none font-medium p-2'
          icon='add'
          :label='t("common.create")'
          @click='showFormCreate'/>
        <ButtonIcon
          class='focus:shadow-none font-medium p-2'
          icon='send'
          :label='t("media.common.buttons.browser")'
          outlined/>
        <ButtonIcon
          class='focus:shadow-none font-medium p-2'
          icon='verified'
          :label='t("media.common.buttons.browsed")'
          outlined/>
        <ButtonIcon
          class='focus:shadow-none font-medium p-2'
          icon='arrow_back'
          :label='t("media.common.buttons.back")'
          outlined/>
        <ButtonIcon
          aria-controls='overlay_menu'
          class='focus:shadow-none font-medium p-2'
          icon='more_horiz'
          label='Công cụ'
          outlined
          @click='toggle'/>
        <ButtonIcon
          class='focus:shadow-none font-medium p-2'
          icon='restart_alt'
          label='Refresh'
          outlined
          @click='reload'/>
        
      </div>
    </template>
  </Toolbar>

  <!--  <div>-->
  <!--    <TabMenu-->
  <!--      v-model:activeIndex='active'-->
  <!--      :model='menus'>-->
  <!--    </TabMenu>-->
  <!--  </div>-->

  <div class='h-full surface-0'>
    <DataTable
      v-bind='DEFAULT_DATATABLE_CONFIG'
      v-model:selection='selectedRows'
      :data-key='"id"'
      :meta-key-selection='false'
      selection-mode='multiple'
      :total-records='totalRecords'
      :value='media'
      @sort='onSort($event)'>
      <Column
        class='text-center'
        selection-mode='multiple'/>
      <Column
        class='text-center'
        header='TT'
        style='width: 5%;'>
        <template #body='slotProps'>
          <div class='align-items-center flex items-center justify-content-center'>
            {{ slotProps.index + 1 }}
          </div>
        </template>
      </Column>

      <Column
        field='title'
        :header='t(`media.common.${lowerCase(props.mediaType)}.titleColumn`)'
        style='width: 25%;'>
      </Column>

      <Column
        field='groupName'
        :header='t("media.common.table.type")'>
      </Column>

      <Column
        class='text-center'
        field='createdTime'
        :header='t("media.common.table.createdTime")'
        :sortable='true'>
        <template #body='{data: {createdTime}}'>
          {{ formatDate(createdTime) }}
        </template>
      </Column>

      <Column
        field='createdBy'
        :header='t("media.common.table.createdBy")'>
        <template #body='{data: {createdBy}}'>
          <div class='align-items-center flex flex-row justify-content-center'>
            <AppUser
              avatar-only
              overlay-visible
              :user-id='createdBy'/>
          </div>
        </template>
      </Column>

      <Column
        :header="t('media.common.table.outstanding')">
        <template #body='{ data: { isHighlight } }'>
          <div class='align-items-center flex justify-content-center'>
            <i
              :class="['pi', isHighlight ? 'pi-star-fill' : '', 'text-yellow-500']"></i>
          </div>
        </template>
      </Column>

      <Column
        :header='t("media.common.table.viewCount")'>
        <template #body='{data: {viewed}}'>
          <div class='align-items-center flex justify-content-center'>
            <span
              class='number-user'
              @click='showDialogViewed(viewed)'>{{ viewed.length }}</span>
          </div>
        </template>
      </Column>

      <Column
        class='text-center'
        field='status'
        :header='t("common.status")'>
        <template #body='{data:{status}}'>
          <span
            class='border-round-sm px-2 py-1 status-badge text-white'
            :class='`status-${status.toLowerCase()}`'>{{
              t(`media.common.table.statuses.${status.toLowerCase()}`)
            }}</span>
        </template>
      </Column>

      <Column
        class='text-center'
        :header='t("common.action")'>
        <template #body='{data}'>
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
    <template #item='{item: {icon, label}}'>
      <MenuItem
        :class-icon="['mt-0 text-sm', icon === 'delete' ? 'text-red-300' : '']"
        :class-item="['mt-1', icon === 'delete' ? 'text-red-300' : '']"
        :icon='icon'
        :label='label'/>
    </template>
  </Menu>

  <MediaAnnouncement
    v-if='showForm'
    :id='selectedRows[0]?.id'
    :media-type='mediaType'
    :visible-dialog='showForm'
    @hide-dialog='hideDialogFn'/>

  <Menu
    id='overlay_menu'
    ref='mode'
    :model='items'
    :popup='true'/>

  <DialogViewed
    v-model:visible='dialogViewedUser'
    :list-viewed='listViewed'/>

  <Dialog
    v-model:visible='showDialogSetStatus'
    :dismissable-mask='true'
    :header='t("media.common.table.titleSetStatus")'
    modal
    style='width: 30rem'>
    <div class='flex flex-column flex-wrap gap-4'>
      <div
        v-for='(item, index) in MediaStatus'
        :key='index'
        class='align-items-center flex justify-content-between w-10rem'>
        <label
          class='ml-2'
          :for='`ingredient${index}`'>{{ t(`media.common.table.statuses.${item.toLowerCase()}`) }}</label>
        <RadioButton
          v-model='selectedMediaStatus'
          :input-id='`ingredient${index}`'
          :name='t(`media.common.table.statuses.${item.toLowerCase()}`)'
          :value='item'
          @change='handleUpdateStatusMedia'/>
      </div>
    </div>
  </Dialog>
</template>

<script setup lang='ts'>
import { assign, get, lowerCase } from 'lodash';
import Column from 'primevue/column';
import type { DataTableSortEvent } from 'primevue/datatable';
import { useConfirm } from 'primevue/useconfirm';
import { inject, nextTick, onMounted, type PropType, reactive, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

import { deleteMedia, searchMedia, updateStatusMedia } from '@/apps/media/graphql/media';
import type { AnnouncementEdge } from '@/apps/media/model/announcement';
import { type IMedia, MediaStatus, MediaType, type Viewed } from '@/apps/media/model/media';
import MediaAnnouncement from '@/apps/media/views/media/MediaAnnouncement.vue';
import DialogViewed from '@/common/components/custom/DialogViewed.vue';
import { DEFAULT_DATATABLE_CONFIG, DEFAULT_PAGE_SIZE } from '@/common/constants';
import { toastSuccess } from '@/common/helpers/custom-toast-service';
import { formatDate } from '@/common/helpers/utils';
import { Direction, type Pageable } from '@/common/model/query';

const props = defineProps({
  mediaType: {
    type: String as PropType<MediaType>,
    required: true
  }
});
const confirm = useConfirm();
const searchTerm = inject('searchTerm', ref(''));
const { t } = useI18n();

function hideDialogFn() {
  showForm.value = false;
  selectedRows.value = [];
  reload();
}

const confirmDeleteMedia = () => {
  confirm.require({
    message: `Bạn có chắc chắn muốn xóa ${selectedRows.value[0].title}?`,
    header: t('common.confirm'),
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: t('common.delete'),
    acceptClass: 'p-button-danger',
    rejectLabel: 'Hủy',
    accept: () => {
      handleDeleteMedia();
    }
  });
};

const media = ref<IMedia[]>([]);
const totalRecords = ref();
const showDialogSetStatus = ref(false);
const showForm = ref(false);
const dialogViewedUser = ref(false);
const pageable = reactive<Pageable>({
  page: 0,
  size: DEFAULT_PAGE_SIZE,
  sort: [
    {
      property: 'createdTime',
      direction: Direction.DESC
    },
  ]
});
const selectedRows = ref<IMedia[]>([]);
const canLoadMore = ref(true);
const isLoadMore = ref(true);
const router = useRouter();
const menuRef = ref();
const selectedMediaStatus = ref('');

const searchParams = reactive({
  type: props.mediaType,
  keyword: '',
  pageable: pageable,
});

function toggleActionMenu(event: Event, data: IMedia) {
  menuRef.value.toggle(event);
  selectedRows.value = [data];
}

const listViewed = ref<Viewed[]>([]);
const {
  onResult: getMediaResult,
  refetch: getMediaRefetch
} = searchMedia(searchParams);
const {
  mutate: deleteMediaMutate,
  onDone: deleteMediaOnDone
} = deleteMedia();
const {
  mutate: updateStatusMediaMutate,
  onDone: updateStatusMediaOnDone
} = updateStatusMedia();

getMediaResult((res) => {
  const {
    totalCount,
    edges
  } = get(res, 'data.searchTextMedia', {
    totalCount: 0,
    edges: [],
  });
  totalRecords.value = totalCount;
  if (isLoadMore.value) {
    media.value = [...media.value, ...edges.map((edge: AnnouncementEdge) => ({ ...edge.node }))];
  } else {
    media.value = edges.map((edge: AnnouncementEdge) => ({ ...edge.node }));
  }
  canLoadMore.value = edges.length >= DEFAULT_PAGE_SIZE;
  isLoadMore.value = false;
});

watch(searchTerm, (newValue) => {
  searchParams.keyword = newValue;
  reload();
});

function handleDeleteMedia() {
  deleteMediaMutate({
    type: props.mediaType,
    id: selectedRows.value[0].id
  });
}

function handleUpdateStatusMedia() {
  updateStatusMediaMutate({
    type: props.mediaType,
    id: selectedRows.value[0].id,
    status: selectedMediaStatus.value
  });
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
        direction: sortOrder === 1 ? 'ASC' : 'DESC'
      }
    ]
  });
  assign(searchParams, pageable);
  reload();
}

updateStatusMediaOnDone(() => {
  showDialogSetStatus.value = false;
  reload();
});

function showDialogViewed(viewed: Viewed[]) {
  if (viewed.length === 0) {
    return;
  }
  listViewed.value = viewed;
  dialogViewedUser.value = true;
}

deleteMediaOnDone(() => {
  toastSuccess({ message: t('Xóa thông báo thành công') });
  reload();
});

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

function showFormCreate() {
  selectedRows.value = [];
  showForm.value = true;
}

function reload() {
  const tableElement = document.querySelector('.p-datatable-wrapper');
  if (tableElement) {
    tableElement.scrollTop = 0;
  }
  searchParams.pageable.page = 0;
  getMediaRefetch(searchParams);
}

onMounted(() => {
  nextTick(() => {
    addScrollEventListener('.p-datatable-wrapper');
  });
});

function editMedia() {
  showForm.value = true;
}

const menuActions = [
  {
    key: 'edit',
    label: t('common.edit'),
    icon: 'edit',
    command: () => {
      editMedia();
    }
  },

  {
    key: 'edit',
    label: t('media.common.table.review'),
    icon: 'visibility',
    command: () => {
      router.push({
        name: 'MediaAnnouncementQuickView',
        params: { id: selectedRows.value[0]?.id }
      });
    }
  },
  {
    key: 'edit',
    label: t('media.common.table.process'),
    icon: 'family_history',
  },
  {
    key: 'edit',
    label: t('media.common.table.evict'),
    icon: 'settings_backup_restore',
  },
  {
    key: 'edit',
    label: t('media.common.table.setStatus'),
    icon: 'display_settings',
    command: () => {
      selectedMediaStatus.value = selectedRows.value[0]?.status;
      showDialogSetStatus.value = true;
    }
  },
  {
    key: 'delete',
    label: t('common.delete'),
    icon: 'delete',
    command: () => {
      confirmDeleteMedia();
      // handleDeleteMedia();
    }
  },
];

const mode = ref();
const items = ref([
  {
    label: 'Chuyển theo qui trình',
    icon: 'share'
  },
  {
    label: 'Chuyển đến nhóm',
    icon: 'groups'
  }
]);

const toggle = (event: Event) => {
  mode.value.toggle(event);
};

</script>

<style lang='scss' scoped>

:deep(.p-dialog-content) {
  padding: unset !important;
}

</style>