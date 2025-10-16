<template>
  <Dialog
    v-model:visible='visibleForm'
    :header="t('Lịch sử nhiệm vụ')"
    style='width: 80vw'
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
      :value='missionHistory'>
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
        field='userEdit'
        :header='t(`Họ tên`)'></Column>
      <Column
        class='col-2'
        field='userEditTime'
        :header='t(`Thời gian chỉnh sửa`)'></Column>
      <Column
        class='col-2'
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

import { getMissionHistoryById } from '@/apps/mission/api/graphql/mission';
import type { IMissionHistory } from '@/apps/mission/model/mission/mission';
import { DEFAULT_PAGE_SIZE } from '@/common/constants';

const missionHistory = ref<IMissionHistory[]>([]);
const totalRecord = ref<number>();
const canLoadMore = ref<boolean>(true);
const isLoadMore = ref<boolean>(true);
const isLoading = ref<boolean>(true);

const pageable = reactive({
  page: 0,
  size: DEFAULT_PAGE_SIZE
});

const searchParams = reactive({
  missionId: props.id,
  pageable: pageable,
});

const {
  onResult: getMissionHistoryResult,
  onError: getMissionHistoryError
} =
  getMissionHistoryById(searchParams);

getMissionHistoryResult((res) => {
  const {
    totalRecords,
    content
  } = get(res, 'data.getMissionHistoryById', {
    totalRecords: 0,
    content: [],
  });

  console.log(totalRecords);
  
  totalRecord.value = totalRecords;
  if (isLoadMore.value) {
    missionHistory.value = [
      ...missionHistory.value,
      ...content,
    ];
  } else {
    missionHistory.value = content;
  }
  canLoadMore.value = content.length >= DEFAULT_PAGE_SIZE;
  isLoadMore.value = false;
  isLoading.value = false;
});

getMissionHistoryError(()=>{
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