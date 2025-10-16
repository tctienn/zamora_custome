<template>
  <Toolbar class='align-content-center h-3rem mb-2 px-2 py-0 surface-0'>
    <template #start>
      <div class='align-items-center flex gap-2'>
        <div class='font-bold'>
          {{ t('media.honor.honorList') }}
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
          icon='restart_alt'
          label='Refresh'
          outlined
          @click='reload'/>

      </div>
    </template>
  </Toolbar>

  <div class='h-full surface-0'>
    <DataTable
      v-bind='DEFAULT_DATATABLE_CONFIG'
      v-model:selection='selectedRow'
      :data-key='"id"'
      :meta-key-selection='false'
      selection-mode='single'
      :value='honors'>
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
        :header='t(`media.honor.honorName`)'
        style='width: 25%;'>
      </Column>

      <Column
        class='text-center'
        field='type'
        :header='t("media.honor.honorType")'>
        <template #body='{data: {type}}'>
          {{ type === 'USER' ? 'Cá nhân' : 'Phòng ban' }}
        </template>
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
        <template>
          <div class='align-items-center flex justify-content-center'>
            <span
              class='number-user'
              @click='showDialogViewed'>{{ 0 }}</span>
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

  <HonorForm
    v-if='showForm'
    :id='selectedRow?.id'
    :visible-dialog='showForm'
    @hide-dialog='hideDialogFn'/>
</template>

<script setup lang='ts'>

import { get, lowerCase } from 'lodash';
import Column from 'primevue/column';
import { useConfirm } from 'primevue/useconfirm';
import { inject, nextTick, onMounted, reactive, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { deleteHonor, searchHonor } from '@/apps/media/graphql/honor';
import type { HonorEdge, IHonor } from '@/apps/media/model/honor';
import HonorForm from '@/apps/media/views/honor/HonorForm.vue';
import { DEFAULT_DATATABLE_CONFIG, DEFAULT_PAGE_SIZE } from '@/common/constants';
import { toastSuccess } from '@/common/helpers/custom-toast-service';
import { formatDate } from '@/common/helpers/utils';
import { Direction, type Pageable } from '@/common/model/query';

const confirm = useConfirm();
const searchTerm = inject('searchTerm', ref(''));
const { t } = useI18n();

function hideDialogFn() {
  showForm.value = false;
  selectedRow.value = {} as IHonor;
  reload();
}

const {
  mutate: deleteMutate,
  onDone: deleteOnDone
} = deleteHonor();

const handleDelete = () => {
  deleteMutate({ id: selectedRow.value?.id, }).then(() => {
    reload();
  });
};

const confirmDelete = () => {
  confirm.require({
    message: `Bạn có chắc chắn muốn xóa ${selectedRow.value?.title}?`,
    header: t('common.confirm'),
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: t('common.delete'),
    acceptClass: 'p-button-danger',
    rejectLabel: 'Hủy',
    accept: () => {
      handleDelete();
    }
  });
};

const honors = ref<IHonor[]>([]);
const totalRecords = ref();
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
const selectedRow = ref<IHonor>();
const canLoadMore = ref(true);
const isLoadMore = ref(true);
const menuRef = ref();

const searchParams = reactive({
  keyword: '',
  pageable: pageable,
});

function toggleActionMenu(event: Event, data: IHonor) {
  menuRef.value.toggle(event);
  selectedRow.value = data;
}

watch(searchTerm, (newValue) => {
  searchParams.keyword = newValue;
  reload();
});

const {
  onResult: getHonorResult,
  refetch: getHonorRefetch
} = searchHonor(searchParams);

getHonorResult((res) => {
  const {
    totalCount,
    edges
  } = get(res, 'data.searchHonor', {
    totalCount: 0,
    edges: [],
  });
  totalRecords.value = totalCount;
  if (isLoadMore.value) {
    honors.value = [...honors.value, ...edges.map((edge: HonorEdge) => ({ ...edge.node }))];
  } else {
    honors.value = edges.map((edge: HonorEdge) => ({ ...edge.node }));
  }
  canLoadMore.value = edges.length >= DEFAULT_PAGE_SIZE;
  isLoadMore.value = false;
});

function reload() {
  const tableElement = document.querySelector('.p-datatable-wrapper');
  if (tableElement) {
    tableElement.scrollTop = 0;
  }
  searchParams.pageable.page = 0;
  getHonorRefetch(searchParams);
}

const menuActions = [
  {
    key: 'edit',
    label: t('common.edit'),
    icon: 'edit',
    command: () => {
      showForm.value = true;
    }
  },
  {
    key: 'delete',
    label: t('common.delete'),
    icon: 'delete',
    command: () => {
      confirmDelete();
    }
  },
];

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

function showFormCreate() {
  showForm.value = true;
}

deleteOnDone(() => {
  toastSuccess({ message: t('Xóa thành công') });
});

function showDialogViewed() {
  return null;
}
</script>

<style scoped>

</style>