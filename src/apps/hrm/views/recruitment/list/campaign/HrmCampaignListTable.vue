<template>
  <div class='full-height-table-wrapper'>
    <DataTable
      v-bind='DEFAULT_DATATABLE_CONFIG'
      v-model:selection='selectedRow'
      :loading = 'isLoading'
      :pt="{
        wrapper: {
          class: 'h-full surface-overlay',
        },
      }"
      row-hover
      :total-records='totalRecord'
      :value='campaigns'
      @sort='onSortChange'>
      <template #empty>
        <span class='block font-bold text-600 text-center'>{{
          t('common.emptyRecords', { itemType: 'chiến dịch' })
        }}</span>
      </template>
      <Column
        class='text-center'
        header='TT'
        style='width: 2%'>
        <template #body='slotProps'>
          <div
            class='align-items-center flex items-center justify-content-center'>
            {{ slotProps.index + 1 }}
          </div>
        </template>
      </Column>
      <Column
        class='col-1 px-2'
        field='code'
        :header="t('hrm.campaign.general.code')"
        :sortable='true'></Column>
      <Column
        class='col-2'
        field='name'
        :header="t('hrm.campaign.general.name')"
        :sortable='true'>
        <template #body='{ data: { name, id } }'>
          <p
            class='cursor-pointer'
            @click='handleViewDetail(id)'>
            {{ name }}
          </p>
        </template>
      </Column>
      <Column
        class='col-1'
        field='positionName'
        :header="t('hrm.recruitment.table.positionName')"></Column>
      <Column
        class='col-1 px-2 text-center'
        field='fromDate'
        :header="t('hrm.campaign.general.fromTime')">
        <template #body='{data: {fromDate}}'>
          {{ formatDate(fromDate,'DD/MM/YYYY') }}
        </template>
      </Column>

      <Column
        class='col-1 px-2 text-center'
        field='toDate'
        :header="t('hrm.campaign.general.toTime')">
        <template #body='{data: {toDate}}'>
          {{ formatDate(toDate,'DD/MM/YYYY') }}
        </template>
      </Column>
      <Column
        class='px-2 text-center'
        field='numberOfRecruits'
        :header="t('hrm.recruitment.table.quantity')"></Column>
      <Column
        class='px-2 text-center'
        field='numberOfRecruits'
        :header="t('hrm.recruitment.table.titleCv')"></Column>
      <Column
        class='col-1 px-2 text-center'
        field='numberOfRecruits'
        :header="t('hrm.recruitment.table.admitted')"></Column>
      <Column
        class='px-2 text-center'
        field='createdTime'
        :header="t('hrm.recruitment.table.createdTime')">
        <template #body='{data: {createdTime}}'>
          {{ formatDate(createdTime,'DD/MM/YYYY') }}
        </template>
      </Column>
      <Column
        class='px-2 text-center'
        field='createdBy'
        :header="t('hrm.recruitment.table.createdBy')"
        style='width: 6%'>
        <template #body='{data :{createdBy }}'>
          <div class='flex justify-content-center'>
            <AppUser
              v-if='createdBy'
              avatar-size='2.5'
              overlay-visible
              :user-id='createdBy'>
            </AppUser>
          </div>
        </template>
      </Column>
      <Column
        class='px-2 text-center'
        field='status'
        :header="t('common.status')">
        <template #body='{ data: { status } }'>
          <Badge
            v-if='status'
            class='py-0 status-badge'
            :severity='getStatusSeverity(status)'
            :value='t(`hrm.campaign.statusOptions.${status}`)'></Badge>
        </template>
      </Column>
      <Column
        class='px-0 text-center'
        :header="t('common.action')"
        style='width: 5%'>
        <template #body='{ data }'>
          <ButtonIcon
            v-tooltip.top="t('common.action')"
            class='text-color'
            icon='more_horiz'
            icon-size='1.7'
            rounded
            text
            @click='toggleActionMenu($event, data)'/>
        </template>
      </Column>
    </DataTable>
  </div>
  <Menu
    ref='menuRef'
    :model='menuActions'
    :popup='true'>
    <template #item='{ item, props:itemProps }'>
      <div
        v-bind='itemProps'
        class='align-items-center cursor-pointer flex gap-2 px-4 py-2'>
        <AppIcon
          :class='getMenuIconClass(item.icon)'
          :name='item.icon'
          size='1.5'/>
        <span :class='getMenuIconClass(item.icon)'>{{ item.label }}</span>
      </div>
    </template>
  </Menu>
</template>

<script setup lang='ts'>
import type { DataTableSortEvent } from 'primevue/datatable';
import { useConfirm } from 'primevue/useconfirm';
import type { PropType } from 'vue';
import { inject, nextTick, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { deleteRecruitmentCampaignById } from '@/apps/hrm/api/graphql/campaign';
import type { Campaign, CampaignStatus } from '@/apps/hrm/model/compaign';
import AppUser from '@/common/components/app/AppUser.vue';
import { DEFAULT_DATATABLE_CONFIG } from '@/common/constants';
import { toastSuccess } from '@/common/helpers/custom-toast-service';
import { formatDate } from '@/common/helpers/utils';
const props = defineProps({
  campaigns: {
    type: Array as PropType<Campaign[]>,
    default: () => []
  },
  totalRecord: {
    type: Number,
    default: 0
  },
  isLoading: {
    type: Boolean,
    default: false
  },
  onLoadMore: {
    type: Function as PropType<() => void>,
    default: () => undefined,
  }
});

const canLoadMore = defineModel<boolean>('canLoadMore', { default: true });

const { t } = useI18n();
const menuRef = ref();
const selectedRow = ref<Campaign>();
const confirm = useConfirm();
const handleViewDetail = inject('handleViewDetailCampaign') as (id: string) => void;
const handleEdit = inject('handleEditCampaign') as (id?: string) => void;
const refetchData = inject('refetchData', () => void {});
const searchInput = inject<{
  textSearch: string;
  sortBy?: string;
  sortDirection?: string;
  status: CampaignStatus | null;
}>('searchInput', {
  textSearch: '',
  sortBy: undefined,
  sortDirection: undefined,
  status: null,
});

const {
  mutate: deleteMutate,
  onDone: deleteOnDone
} =
  deleteRecruitmentCampaignById();

function toggleActionMenu(event: Event, data: Campaign) {
  menuRef.value.toggle(event);
  selectedRow.value = data;
}
interface MenuAction{
  key: string;
  label: string;
  icon: string;
  command: () => void;
  disabled?: boolean;
};
const menuActions:MenuAction[] = [
  {
    key: 'edit',
    label: t('common.edit'),
    icon: 'edit',
    command: () => {
      handleEdit(selectedRow.value?.id);
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
      handleDeleteVehicle();
    },
  });
};

const handleDeleteVehicle = () => {
  deleteMutate({ id: selectedRow.value?.id });
};

deleteOnDone(() => {
  toastSuccess({ message: t('Xóa thành công') });
  refetchData();
});
function getMenuIconClass(icon?: string) {
  if (icon === 'delete') {
    return 'text-red-500';
  }
  return 'text-color'; 
}
function scrollEvent(event: Event) {
  const {
    scrollTop,
    scrollHeight,
    clientHeight
  } = event.target as HTMLElement;
  if (scrollTop + clientHeight + 1 >= scrollHeight && canLoadMore.value) {
    props.onLoadMore?.();
  }
}

function addScrollEventListener(selector: string) {
  const scrollableContainer = document.querySelector(selector);
  if (scrollableContainer) {
    scrollableContainer.addEventListener('scroll', scrollEvent);
  }
}

function onSortChange(event: DataTableSortEvent) {
  console.log(event);
  if (typeof event.sortField === 'string') {
    searchInput.sortBy = event.sortField;
    searchInput.sortDirection = event.sortOrder === 1 ? 'ASC' : 'DESC';
  }
}
onMounted(() => {
  nextTick(() => {
    addScrollEventListener('.p-datatable-wrapper');
  });
});

const getStatusSeverity = (status: string) => {
  switch (status) {
  case 'PLAN':
    return 'info';
  case 'WAITING_FOR_APPROVAL':
    return 'primary';
  case 'IN_PROGRESS':
    return 'success';
  case 'COMPLETED':
    return 'warn';
  case 'PAUSE':
    return 'danger';
  case 'GIVE_BACK':
    return 'secondary';
  case 'CANCELED':
    return 'info';
  }
};
</script>

<style scoped>
:deep(.highlight-row) {
  background: #e9ecef;
  color: #495057;
}

:deep(.status-badge) {
  text-transform: unset !important;
}
</style>