<template>
  <div class='full-height-table-wrapper'>
    <DataTable
      v-model:expandedRowGroups='expandedRowGroups'
      v-bind='DEFAULT_DATATABLE_CONFIG'
      v-model:selection='selectedRow'
      expandable-row-groups
      group-rows-by='campaignId'
      :loading = 'isLoading'
      :pt="{
        wrapper: {
          class: 'h-full surface-overlay',
        },
      }"
      row-group-mode='subheader'
      row-hover
      :total-records='totalRecord'
      :value='candidates'
      @sort='onSortChange'>

      <template #groupheader='{data}'>
        <span
          class='font-bold line-height-3 ml-2 vertical-align-middle'
          style='color: #0F6CBD; margin-bottom: 20px;'>{{ data.campaignName }}</span>
        <p
          class='font-italic font-medium'
          style='margin-left: 2.5rem;'>Mã chiến dịch: {{ data.campaignCode }}</p>
      </template>
      <template #empty>
        <span class='block font-bold text-600 text-center'>{{
          t('common.emptyRecords', { itemType: 'ứng tuyển' })
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
        field='avatarImg'
        header='Ảnh'
        style='width: 5%'>
        <template #body='{data: {avatarImg, candidateCode}}'>
          <div
            class='block-logo'>
            <img
              v-if='generateAvatarUrl(avatarImg)'
              :alt='extractAvatarLabel(candidateCode)'
              :src='generateAvatarUrl(avatarImg)' />
            <div
              v-else
              class='border-300 border-round-sm h-3rem p-avatar relative size text-color w-3rem'
              style='background-color: rgb(149, 165, 166);'>
              <span
                class='p-avatar-text text-2xl text-white'>
                {{ extractAvatarLabel(extractAvatarLabel(candidateCode), 1) }}
              </span>
            </div>
          </div>
        </template>
      </Column>
      <Column
        class='col-1 px-2'
        field='fullName'
        :header="t('hrm.candidate.general.fullName')"
        :sortable='true'>
        <template #body='{ data: { fullName, id } }'>
          <p
            class='cursor-pointer'
            @click='handleViewDetail(id)'>
            {{ fullName }}
          </p>
        </template>
      </Column>
      <Column
        class='col-1 px-2 text-center'
        field='dateOfBirth'
        :header="t('hrm.candidate.general.dateOfBirth')">
        <template #body='{data: {dateOfBirth}}'>
          {{ formatDate(dateOfBirth,'DD/MM/YYYY') || ""}}
        </template>
      </Column>
      <Column
        class='px-2 text-center'
        field='gender'
        :header="t('hrm.candidate.general.gender')">
        <template #body='{data: {gender}}'>
          <p>{{ t(`hrm.recruitment.general.${gender}`) }}</p>
        </template>
      </Column>
      <Column
        class='px-2 text-center'
        field='address'
        :header="t('hrm.candidate.general.address')"></Column>
      <Column
        class='col-1 px-2 text-center'
        field='phoneNumber'
        :header="t('hrm.candidate.general.phoneNumber')"></Column>
      <Column
        class='col-1 px-2 text-center'
        field='email'
        :header="t('hrm.candidate.general.email')"></Column>
      <Column
        class='px-2 text-center'
        field='createdTime'
        :header="t('hrm.recruitment.table.createdTime')">
        <template #body='{data: {createdDate}}'>
          {{ formatDate(createdDate,'DD/MM/YYYY') }}
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
            :value='t(`hrm.candidate.statusOptions.${status}`)'></Badge>
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
import { inject, nextTick, onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { deleteRecruitmentCandidateById } from '@/apps/hrm/api/graphql/candidate';
import type { Candidate, CandidateStatus } from '@/apps/hrm/model/candidate';
import AppUser from '@/common/components/app/AppUser.vue';
import { DEFAULT_DATATABLE_CONFIG } from '@/common/constants';
import { toastSuccess } from '@/common/helpers/custom-toast-service';
import { generateAvatarUrl } from '@/common/helpers/file-utils';
import { extractAvatarLabel, formatDate } from '@/common/helpers/utils';
const props = defineProps({
  candidates: {
    type: Array as PropType<Candidate[]>,
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
const selectedRow = ref<Candidate>();
const confirm = useConfirm();
const handleViewDetail = inject('handleViewDetailCandidate') as (id: string) => void;
const handleEdit = inject('handleEditCandidate') as (id?: string) => void;
const refetchData = inject('refetchDataCandidate', () => void {});
const expandedRowGroups = ref();
const searchInput = inject<{
  textSearch: string;
  sortBy?: string;
  sortDirection?: string;
  status: CandidateStatus | null;
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
  deleteRecruitmentCandidateById();

function toggleActionMenu(event: Event, data: Candidate) {
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
    message: t('common.confirmDelete', { itemName: selectedRow.value?.fullName }),
    header: t('common.delete'),
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: t('common.delete'),
    acceptClass: 'p-button-danger',
    rejectLabel: t('common.cancel'),
    accept: () => {
      handleDelete();
    },
  });
};

const handleDelete = () => {
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

watch(
  () => props.candidates,
  () => {
    expandAllGroups();
  });

const expandAllGroups = () => {
  const uniqueCampaignIds = [...new Set(props.candidates.map(item => item.campaignId))];
  expandedRowGroups.value = uniqueCampaignIds;
};
onMounted(() => {
  nextTick(() => {
    addScrollEventListener('.p-datatable-wrapper');
  });
});

const statusSeverityMap: Record<string, string> = {
  APPLIED: 'info',
  APPLYING: 'primary',
  PASSED: 'success',
  FAILED: 'warn',
  TRANSFERRED_CANDIDATE_PROFILE: 'danger',
  SUITABLE_FOR_OTHER_POSITIONS: 'secondary',
  CONTACT_LATER: 'info'
};
const getStatusSeverity = (status: string) => statusSeverityMap[status] || 'info';
</script>

<style scoped>
:deep(.highlight-row) {
  background: #e9ecef;
  color: #495057;
}

:deep(.status-badge) {
  text-transform: unset !important;
}

.block-logo {
  height: 3rem;
  width: 3rem;
}

.block-logo img {
  height: 100%;
  width: 100%;
  border-radius: 0.25rem;
  object-fit: cover;
}
</style>