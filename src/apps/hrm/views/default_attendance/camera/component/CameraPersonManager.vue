<template>
  <div class='flex flex-column gap-2'>
    <Toolbar class='p-0 px-2'>
      <template #start>
        <div class='px-3'>

        </div>
      </template>
      <template #end>
        <div class='align-items-center btn-group-toolbar flex gap-1 mr-1 my-1'>
          <Button
            class='btn-create focus:shadow-none font-medium p-2'
            :icon='"pi pi-sync " + (isSyncing ? "pi-spin": "")'
            :label='t("common.sync")'
            @click='sync'></Button>
          <Button
            class='focus:shadow-none font-normal gap-2 hover:surface-200'
            icon='pi pi-refresh'
            label='Refresh'
            severity='secondary'
            @click='refetch'></Button>
        </div>
      </template>
    </Toolbar>
    <DataTable
      v-bind='DEFAULT_DATATABLE_CONFIG'
      :value='data'>
      <Column
        class='text-center'
        :header='t("common.ordinalNumber")'
        style='width: 5%'>
        <template #body='{index}'>
          {{ index + 1 }}
        </template>
      </Column>
      <Column
        :header='t("common.name")'>
        <template #body='{data}'>
          <div class='align-items-center flex gap-2'>
            <HrmAvatar
              :avatar='data["avatar"]'
              class='border-round-sm cursor-pointer'
              width='2.5rem'/>
            <span class='font-semibold white-space-nowrap'>
              {{ data['name'] }}
            </span>
          </div>
        </template>
      </Column>
      <Column
        class='text-center'
        field='aliasId'
        header='Mã chấm công'>
      </Column>
      <Column
        class='text-center'
        field=''
        header='Giới tính'>
      </Column>
      <Column
        class='text-center'
        field=''
        header='Ngày sinh'>
      </Column>
      <Column
        class='text-center'
        field=''
        header='Phòng ban'>
      </Column>
      <Column
        class='text-center'
        field='title'
        header='Chức vụ'>
      </Column>
    </DataTable>
  </div>
</template>

<script lang='ts' setup>
import { get } from 'lodash';
import Column from 'primevue/column';
import { nextTick, onMounted, reactive, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { searchCameraPerson, syncCameraPersons } from '@/apps/hrm/api/graphql/camera';
import HrmAvatar from '@/apps/hrm/components/HrmAvatar.vue';
import type { CameraPerson, CameraPersonEdge } from '@/apps/hrm/model/camera';
import { DEFAULT_DATATABLE_CONFIG, DEFAULT_PAGE_SIZE } from '@/common/constants';
import { toastError, toastSuccess } from '@/common/helpers/custom-toast-service';

const { t } = useI18n();

const isSyncing = ref(false);
const canLoadMore = ref(true);
const isLoadMore = ref(true);

const pageable = reactive({
  page: 0,
  size: DEFAULT_PAGE_SIZE,
  sort: [],
});
const keyword = ref('');
const totalRecords = ref();
const {
  onResult: searchCameraPersonResult,
  refetch: searchCameraPersonRefetch
} = searchCameraPerson(keyword.value, pageable);
const data = ref<CameraPerson[]>([]);

searchCameraPersonResult((res) => {
  const {
    totalCount,
    edges
  } = get(res, 'data.searchCameraPerson', {
    totalCount: 0,
    edges: [],
  });
  totalRecords.value = totalCount;
  if (isLoadMore.value) {
    data.value = [
      ...data.value,
      ...edges.map((edge: CameraPersonEdge) => ({ ...edge.node })),
    ];
  } else {
    data.value = edges.map((edge: CameraPersonEdge) => ({ ...edge.node, }));
  }
  canLoadMore.value = edges.length >= DEFAULT_PAGE_SIZE;
  isLoadMore.value = false;
});

function sync() {
  isSyncing.value = true;
  syncCameraPersons().mutate()
    .then(() => {
      isSyncing.value = false;
      searchCameraPersonRefetch();
      toastSuccess();
    })
    .catch(() => {
      isSyncing.value = false;
      toastError();
    });
}

function refetch() {
  searchCameraPersonRefetch();
}

function scrollEvent(event: Event) {
  const {
    scrollTop,
    scrollHeight,
    clientHeight
  } = event.target as HTMLElement;
  if (scrollTop + clientHeight + 1 >= scrollHeight && canLoadMore.value) {
    isLoadMore.value = true;
    pageable.page += 1;
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
:deep(.image-container img) {
  border-radius: 4px;
  width: 100%;
}
</style>