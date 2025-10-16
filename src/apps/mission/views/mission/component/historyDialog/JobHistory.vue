<template>
  <Dialog
    v-model:visible='visibleForm'
    :header="t('Lịch sử công việc')"
    style='width: 80vw'
    @hide='handleClose'>
    <DataTable
      :loading = 'isLoading'
      :pt="{
        wrapper: {
          class: 'surface-overlay',
        },
      }"
      row-hover
      scroll-height='450px'
      scrollable
      show-gridlines
      striped-rows
      :total-records='totalRecord'
      :value='jobHistory'>
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
        class='col-1 text-center'
        field='actionTime'
        :header='t(`Thời gian`)'
        style='width: 2%'>
        <template #body='{ data: { actionTime } }'>
          <span>
            {{ formatDate(actionTime, 'DD/MM/YYYY HH:mm') }}
          </span>
        </template>
      </Column>
      <Column
        class='col-1'
        field='sendingUnit'
        :header='t(`Đơn vị gửi`)'></Column>
      <Column
        class='col-1'
        field='userSendId'
        :header='t(`Tên người gửi`)'>
        <template #body='{data :{userSendId}}'>
          <AppUser
            v-if='userSendId'
            avatar-size='2.5'
            info-visible
            name-visible
            overlay-visible
            :user-id='userSendId'>
          </AppUser>
        </template>
      </Column>
      <Column
        class='col-1'
        field='processingUnit'
        :header='t(`Đơn vị xử lý`)'></Column>
      <Column
        class='col-1'
        field='userProcessingId'
        :header='t(`Tên người xử lý`)'>
        <template #body='{data :{userProcessingId}}'>
          <AppUser
            v-if='userProcessingId'
            avatar-size='2.5'
            info-visible
            name-visible
            overlay-visible
            :user-id='userProcessingId'>
          </AppUser>
        </template>
      </Column>
      <Column
        class='col-1'
        field='status'
        :header='t(`Trạng thái`)'>
        <template #body='{data: { status }}'>
          <p>{{ t(`mission.jobResult.${status}`) }}</p>
        </template>
      </Column>
      <Column
        class='col-1'
        field='note'
        :header='t(`Ghi chú`)'></Column>
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
import { nextTick, onMounted, reactive, ref } from 'vue';

import { getJobHistoryByJobId } from '@/apps/mission/api/graphql/job-api';
import type { IJobHistory } from '@/apps/mission/model/job/job';
import { DEFAULT_PAGE_SIZE } from '@/common/constants';
import { formatDate } from '@/common/helpers/utils';

const jobHistory = ref<IJobHistory[]>([]);
const totalRecord = ref<number>();
const canLoadMore = ref<boolean>(true);
const isLoadMore = ref<boolean>(true);
const isLoading = ref<boolean>(true);

const pageable = reactive({
  page: 0,
  size: DEFAULT_PAGE_SIZE
});

const searchParams = reactive({
  jobId: props.id,
  pageable: pageable,
});

const {
  onResult: getJobHistoryResult,
  onError: getJobHistoryError
} =
  getJobHistoryByJobId(searchParams);

getJobHistoryResult((res) => {
  const {
    totalRecords,
    content
  } = get(res, 'data.getJobHistoryByJobId', {
    totalRecords: 0,
    content: [],
  });

  console.log(totalRecords);
  
  totalRecord.value = totalRecords;
  if (isLoadMore.value) {
    jobHistory.value = [
      ...jobHistory.value,
      ...content,
    ];
  } else {
    jobHistory.value = content;
  }
  canLoadMore.value = content.length >= DEFAULT_PAGE_SIZE;
  isLoadMore.value = false;
  isLoading.value = false;
});

getJobHistoryError(()=>{
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
</script>

<style scoped>
:deep(.p-column-header-content) {
  display: inline-block;
}
</style>