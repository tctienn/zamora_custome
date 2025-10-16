<template>
  <DataTable
    v-model:expandedRows='expandedRows'
    :loading = 'isLoading'
    scroll-height='450px'
    scrollable
    :total-records='totalRecord'
    :value='activityData'>
    <template #empty>
      <span class='block font-bold text-600 text-center'>{{
        t('common.emptyRecords', { itemType: 'hoạt động' })
      }}</span>
    </template>
    <template #expansion='{ data }'>
      <div class='pl-6'>
        <p class='font-medium'>Các công việc thuộc hoạt động: {{data.activityName}}</p>
        <ActivityJobsTable :id='data.id' />
      </div>
    </template>
    <Column
      class='px-3 text-700 text-center'
      :header='t("mission.mission.No")'
      style='width: 2%'>
      <template #body='{index}'>
        {{ index + 1 }}
      </template>
    </Column>
    <Column
      expander
      style='width: 5%' />
    <Column
      class='col-2 p-2'
      field='activityName'
      :header='t("mission.activity.activityTableCol.name")'
      header-class='float-left'>
      <template #body='{ data }'>
        <div
          class='cursor-pointer'
          @click='openForm(data?.id)'> 
          <p class='font-medium m-0'>{{ data.activityName }}</p>
          <p>{{ data.activityCode }}</p></div>
      </template>
    </Column>
    <Column
      class='col-2 p-0 text-700'
      field='expectedTime'
      :header='t("mission.activity.activityTableCol.expectedDate")'
      :sortable='true'
      style='width: 11%'>
      <template #body='{data: {expectedTime}}'>
        {{ formatDate(expectedTime,'DD/MM/YYYY') }}
      </template>
    </Column>
    <Column
      class='col-2 p-0 text-700'
      field='endTime'
      :header='t("mission.activity.activityTableCol.endDate")'
      :sortable='true'
      style='width: 11%'>
        
      <template #body='{data: {endTime}}'>
        {{ formatDate(endTime,'DD/MM/YYYY') }}
      </template>
    </Column>
    <Column
      class='text-700'
      field='hostUnit'
      :header='t("mission.mission.missionTableCol.hostUnit")'
      header-class='float-left'
      style='width: 11%'>
      <template #body='{ data }'>
        {{ hostUnits.find(h => h.id == data.hostUnit)?.name || '' }}
      </template>
    </Column>
    <Column
      class='col-2 py-2 text-700'
      field='coordinationUnitName'
      :header='t("mission.activity.activityTableCol.combinationUnit")'
      header-class='float-left'>
      <template #body='{data: { coordinationUnitName }}'>
        <div
          v-for='name in getCoordinationUnitNames(coordinationUnitName)'
          :key='name'>
          <span>{{ name }}</span>
        </div>
      </template>
    </Column>
    <Column
      class='p-0 text-center'
      field='status'
      :header='t("mission.mission.missionTableCol.status")'
      style='width: 6%'>
      <template #body='{data: {status}}'>
        <Badge
          class='capitalize font-semibold py-0 status-badge'
          :severity='getStatusSeverity(status)?.color'
          :value='getStatusSeverity(status)?.text'></Badge>
      </template>
    </Column>
  </DataTable>
  <Sidebar
    v-model:visible='visibleForm'
    :dismissable='false'
    v-bind='{...DEFAULT_DIALOG_CONFIG, style: {"width": "60rem"}}'
    :header="t('mission.activity.common.activity')"
    :modal='true'
    position='right'
    @hide='()=> visibleForm = false'>
    <FormActivity
      :id='formId'
      :is-detail = 'isDetail'
      @hide-dialog='visibleForm = false'/>
  </Sidebar>
</template>

<script lang="ts" setup>
import { get } from 'lodash';
import { nextTick, onMounted, reactive, ref } from 'vue';
import { useI18n } from 'vue-i18n';

const props = defineProps({
  id: {
    type: String,
    default: undefined
  },
});
const { t } = useI18n();

import { getAllOrganizationPublicGraphql } from '@/apps/admin/api/graphql/organization-graphql-api';
import type { OrganizationInterface } from '@/apps/admin/model/organization';
import { getActivityRelatedToMission } from '@/apps/mission/api/graphql/activity-api';
import type { ActivityInterface } from '@/apps/mission/model/activity/activity';
import { DEFAULT_DIALOG_CONFIG, DEFAULT_PAGE_SIZE } from '@/common/constants';
import { formatDate } from '@/common/helpers/utils';

import FormActivity from '../../FormActivity.vue';
import ActivityJobsTable from '../job/ActivityJobsTable.vue';
const expandedRows = ref([]);

const activityData = ref<ActivityInterface[]>([]);
const totalRecord = ref<number>();
const canLoadMore = ref<boolean>(true);
const visibleForm = ref<boolean>(false);
const isDetail = ref<boolean>(true);
const isLoadMore = ref<boolean>(true);
const isLoading = ref<boolean>(true);
const hostUnits = ref<OrganizationInterface[]>([]);
const formId = ref();

const pageable = reactive({
  page: 0,
  size: DEFAULT_PAGE_SIZE
});

const searchParams = reactive({
  missionId: props.id,
  pageable: pageable,
});

const {
  onResult,
  onError
} =
  getActivityRelatedToMission(searchParams);

onResult((res) => {
  const {
    totalRecords,
    content
  } = get(res, 'data.getActivityRelatedToMission', {
    totalRecords: 0,
    content: [],
  });

  console.log(totalRecords);
  
  totalRecord.value = totalRecords;
  if (isLoadMore.value) {
    activityData.value = [
      ...activityData.value,
      ...content,
    ];
  } else {
    activityData.value = content;
  }
  canLoadMore.value = content.length >= DEFAULT_PAGE_SIZE;
  isLoadMore.value = false;
  isLoading.value = false;
});

onError(()=>{
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
function openForm(id?: string){
  formId.value = id;
  visibleForm.value = true;
}
onMounted(() => {
  nextTick(() => {
    addScrollEventListener('.p-datatable-wrapper');
  });
});

const getStatusSeverity = (status: string) => {
  switch (status) {
  case 'NEW':
    return {
      color: 'info',
      text: 'Tạo mới' 
    };
  case 'UNPROCESSED':
    return {
      color: 'danger',
      text: 'Chưa thực hiện'
    };
  case 'WAITING_FOR_APPROVAL_EXTENSION_DEADLINE_REQUEST':
    return {
      color: 'warning',
      text: 'Chờ gia hạn'
    };
  case 'WAITING_FOR_GENERAL_LEADER_APPROVE_ACTIVITY':
    return {
      color: 'warning',
      text: 'Chờ chấp thuận'
    };
  case 'GENERAL_LEADER_REJECTED_ACTIVITY':
    return {
      color: 'danger',
      text: 'Không chấp thuận'
    };
  case 'IN_PROGRESS':
    return {
      color: 'primary',
      text: 'Đang thực hiện'
    };
  case 'COMPLETED':
    return {
      color: 'success',
      text: 'Hoàn thành'
    };
  }
};

getAllOrganizationPublicGraphql().onResult((res) => {
  hostUnits.value = res.data?.allOrganizationPublic || [];
});

function getCoordinationUnitNames(ids: string) {
  return (ids.split(',') || []).map(id => hostUnits.value.find(u => u.id === id)?.name || id);
}

</script>

<style>
:deep(.p-column-header-content) {
  display: inline-block;
}
:deep(.p-datatable){
    background-color: #e4f6f6;
}

:deep(.tr){
    background-color: #e4f6f6;
}
</style>