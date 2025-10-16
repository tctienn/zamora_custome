<template>
  <Dialog
    v-model:visible='visibleForm'
    :header="t('Lịch sử gia hạn nhiệm vụ')"
    style='width: 90vw;'
    @hide='handleClose'>
    <DataTable
      :loading = 'isLoading'
      :pt="{
        wrapper: {
          class: 'h-full surface-overlay',
        },
      }"
      row-hover
      scroll-height='450px'
      scrollable
      show-gridlines
      striped-rows
      :total-records='totalRecord'
      :value='historyDeadline'>
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
        class='col-2'
        field='newStartDeadline'
        :header='t(`Thời gian gia hạn ban đầu`)'>
        <template #body='{ data: { newStartDeadline } }'>
          <span>
            {{ formatDate(newStartDeadline, 'DD/MM/YYYY') }}
          </span>
        </template>
      </Column>
      <Column
        class='col-2'
        field='newEndDeadline'
        :header='t(`Thời gian gia hạn kết thúc`)'>
        <template #body='{ data: { newEndDeadline } }'>
          <span>
            {{ formatDate(newEndDeadline, 'DD/MM/YYYY') }}
          </span>
        </template>
      </Column>
      <Column
        class='col-2'
        field='reasonWhyExtension'
        :header='t(`Lý do`)'></Column>
      <Column
        class='col-1'
        field='generalLeaderId'
        :header='t(`Lãnh đạo`)'>
        <template #body='{data :{generalLeaderId}}'>
          <AppUser
            v-if='generalLeaderId'
            avatar-size='2.5'
            info-visible
            name-visible
            overlay-visible
            :user-id='generalLeaderId'>
          </AppUser>
        </template>
      </Column>
      <Column
        class='col-1'
        field='approveByGeneralLeaderStatus'
        :header='t(`Trạng thái`)'>
        <template #body='{data: {approveByGeneralLeaderStatus}}'>
          <Badge
            class='capitalize font-semibold py-0 status-badge'
            :severity='getStatusSeverity(approveByGeneralLeaderStatus)?.color'
            :value='getStatusSeverity(approveByGeneralLeaderStatus)?.text'></Badge>
        </template>
      </Column>
      <Column
        class='col-2'
        field='reasonIfReject'
        :header='t(`Lý do từ chối`)'></Column>
      <Column
        class='col-1'
        field='createdBy'
        :header='t(`Người gửi`)'>
        <template #body='{data :{createdBy}}'>
          <AppUser
            v-if='createdBy'
            avatar-size='2.5'
            info-visible
            name-visible
            overlay-visible
            :user-id='createdBy'>
          </AppUser>
        </template>
      </Column>
    </DataTable>

  </Dialog>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

const props = defineProps({
  visibleDialog: {
    type: Boolean,
    default: false,
  },
  id: {
    type: String,
    default: undefined
  },
});
const emits = defineEmits(['update:visibleDialog']);
const { t } = useI18n();

const visibleForm = computed({
  get: () => props.visibleDialog,
  set: (val) => emits('update:visibleDialog', val),
});
const handleClose = () => {
  emits('update:visibleDialog', false);
};

import { get } from 'lodash';
import { nextTick, onMounted, ref } from 'vue';

import { getAllMissionDeadlineExtensionRequest } from '@/apps/mission/api/graphql/mission';
import type { SendDeadlineExtension } from '@/apps/mission/model/mission/mission';
import { formatDate } from '@/common/helpers/utils';

const historyDeadline = ref<SendDeadlineExtension[]>([]);
const totalRecord = ref<number>();
const canLoadMore = ref<boolean>(true);
const isLoadMore = ref<boolean>(true);
const isLoading = ref<boolean>(true);

const {
  onResult: getMissionHistoryDeadlineResult,
  onError: getMissionHistoryDeadlineError
} =
  getAllMissionDeadlineExtensionRequest(props.id || '');

getMissionHistoryDeadlineResult((res) => {
  const value = get(res, 'data.getAllMissionDeadlineExtensionRequest');
  historyDeadline.value = [
    ...historyDeadline.value,
    ...value
  ];
  isLoading.value = false;
});

getMissionHistoryDeadlineError(()=>{
  isLoading.value = false;
});

function scrollEvent(event: Event) {
  const {
    scrollTop,
    scrollHeight,
    clientHeight
  } = event.target as HTMLElement;
  if (scrollTop + clientHeight + 1 >= scrollHeight && canLoadMore.value) {
    isLoadMore.value = true;
  }
}

function addScrollEventListener(selector: string) {
  const scrollableContainer = document.querySelector(selector);
  if (scrollableContainer) {
    scrollableContainer.addEventListener('scroll', scrollEvent);
  }
}

const getStatusSeverity = (status: string) => {
  switch (status) {
  case 'PENDING':
    return {
      color: 'warning',
      text: t('mission.mission.statusDeadline.PENDING')
    };
  case 'APPROVED':
    return {
      color: 'success',
      text: t('mission.mission.statusDeadline.AGREE_EXTENSION_DEADLINE')
    };
  case 'REJECTED':
    return {
      color: 'danger',
      text: t('mission.mission.statusDeadline.REJECTED_EXTENSION_DEADLINE')
    };
  };
};

onMounted(() => {
  nextTick(() => {
    addScrollEventListener('.p-datatable-wrapper');
  });
});
</script>

<style scoped>
:deep(.p-column-header-content) {
  display: inline-block;
}
</style>