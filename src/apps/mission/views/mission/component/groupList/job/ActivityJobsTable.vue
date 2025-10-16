<template>
  <DataTable
    :loading = 'isLoading'
    scroll-height='450px'
    scrollable
    :total-records='totalRecord'
    :value='jobData'>
    <template #empty>
      <span class='block font-bold text-600 text-center'>{{
        t('common.emptyRecords', { itemType: 'công việc' })
      }}</span>
    </template>
    <Column
      class='p-1 px-3 text-700 text-center'
      :header='t("mission.mission.No")'
      style='width: 5%'>
      <template #body='{index}'>
        {{ index + 1 }}
      </template>
    </Column>
    <Column
      style='width: 5%' />
    <Column
      class='col-3 p-2'
      field='jobName'
      :header='t("mission.job.jobTableCol.name")'
      header-class='float-left'>
      <template #body='{ data }'>
        <div
          class='cursor-pointer'
          @click='openFormForJobType(data.jobType, data.id, true)'>
          <p
            class='font-medium mb-0'
            :style='{ color: getDeadlineColor(data.processingDeadline) }'>{{ data.jobName }}</p>
          <p
            class='mb-1'
            :style='{ color: getDeadlineColor(data.processingDeadline) }'>{{ data.jobCode }}</p>
        </div>
      </template>
    </Column>
    <Column
      class='col-2 p-0 text-700'
      field='processingDeadline'
      :header='t("mission.job.jobTableCol.processingDeadline")'
      header-class='float-left'
      :sortable='true'>
      <template #body='{ data: { processingDeadline } }'>
        <span :style='{ color: getDeadlineColor(processingDeadline) }'>
          {{ formatDate(processingDeadline, 'DD/MM/YYYY') }}
        </span>
      </template>
    </Column>
    <Column
      class='col-2 p-0 text-700'
      field='hostUnit'
      :header='t("mission.mission.missionTableCol.hostUnit")'
      header-class='float-left'>
      <template #body='{data}'>
        <p :style='{ color: getDeadlineColor(data.processingDeadline) }'>{{ capitalizeName(organizationMap[data.hostUnit]) || '' }}</p> 
      </template>
    </Column>
    <Column
      class='col-2 p-0 text-700'
      field='assignerList'
      :header='t("mission.job.jobTableCol.assignJob")'
      header-class='float-left'>
      <template #body='{ data }'>
        <div
          v-for='(assigner, idx) in data.assignerList'
          :key='idx'
          class='my-1'>
          <p :style='{ color: getDeadlineColor(data.processingDeadline) }'>{{capitalizeName(getAssignerName(assigner)) }}</p>
        </div>
      </template>
    </Column>
    <Column
      class='col-1 p-0 text-center'
      field='status'
      :header='t("mission.mission.missionTableCol.status")'>
      <template #body='{data: { status }}'>
        <Badge
          class='capitalize font-semibold py-0 status-badge'
          :severity='getStatusSeverity(status)?.color'
          :value='getStatusSeverity(status)?.text'></Badge>
      </template>
    </Column>
    <Column
      field='flag'
      :header='t(`Cờ`)'>
      <template #body='{ data }'>
        <div
          class='align-items-center flex gap-2 justify-content-center'>
          <AppIcon
            v-if="data.jobType === 'ON_MISSION'"
            :class="flagColors[data.flag] ?? 'text-gray-400'"
            fill
            name='flag'
            size='1.5'/>
        </div>
      </template>
    </Column>
  </DataTable>
  <Sidebar
    v-model:visible='visibleForm'
    :dismissable='false'
    v-bind='{...DEFAULT_DIALOG_CONFIG, style: {"width": "80rem"}}'
    :header="`${isDetail
      ? `${t('mission.job.common.job')}`
      : formId ? t('mission.job.common.update') : t('mission.job.common.create')}`"
    :modal='true'
    position='right'
    @hide='()=> visibleForm = false'>
    <FormJob
      :id='formId'
      :is-detail='isDetail'
      :job-type='currentJobType'
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
import { getJobRelatedToActivity } from '@/apps/mission/api/graphql/job-api';
import { getDeadlineColor } from '@/apps/mission/helpers/convert';
import type { JobInterface, JobType } from '@/apps/mission/model/job/job';
import { getAllUserMoreInfoGraphql } from '@/common/api/graphql/user-graphql';
import { DEFAULT_DIALOG_CONFIG, DEFAULT_PAGE_SIZE } from '@/common/constants';
import { formatDate } from '@/common/helpers/utils';

import FormJob from '../../FormJob.vue';

const jobData = ref<JobInterface[]>([]);
const totalRecord = ref<number>();
const canLoadMore = ref<boolean>(true);
const visibleForm = ref<boolean>(false);
const currentJobType = ref<JobType | undefined>();
const isDetail = ref();
const isLoadMore = ref<boolean>(true);
const isLoading = ref<boolean>(true);
const hostUnits = ref<OrganizationInterface[]>([]);
const organizationMap = ref<Record<string, string>>({});
const userMap = ref<Record<string, string>>({});
const formId = ref();

const pageable = reactive({
  page: 0,
  size: DEFAULT_PAGE_SIZE
});

const searchParams = reactive({
  activityId: props.id,
  pageable: pageable,
});

const {
  onResult,
  onError
} =
  getJobRelatedToActivity(searchParams);

onResult((res) => {
  const {
    totalRecords,
    content
  } = get(res, 'data.getJobRelatedToActivity', {
    totalRecords: 0,
    content: [],
  });
  totalRecord.value = totalRecords;
  if (isLoadMore.value) {
    jobData.value = [
      ...jobData.value,
      ...content,
    ];
  } else {
    jobData.value = content;
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
function openFormForJobType( jobType?:JobType, id?: string, checkDetail?:boolean) {
  formId.value = id;
  currentJobType.value = jobType;
  isDetail.value = checkDetail;
  visibleForm.value = true;
}
onMounted(() => {
  nextTick(() => {
    addScrollEventListener('.p-datatable-wrapper');
  });
});

getAllOrganizationPublicGraphql().onResult((res) => {
  hostUnits.value = res.data?.allOrganizationPublic || [];
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
      color: 'warning',
      text: 'Chưa xử lý'
    };
  case 'IN_PROGRESS':
    return {
      color: 'primary',
      text: 'Đang triển khai'
    };
  case 'WAITING_FOR_APPROVAL_EXTENSION_DEADLINE_REQUEST':
    return {
      color: 'warning',
      text: 'Chờ gia hạn'
    };
  case 'COMPLETED':
    return {
      color: 'success',
      text: 'Hoàn thành'
    };
  case 'WAITING_FOR_ACCEPT':
    return {
      color: 'secondary',
      text: 'Chờ tiếp nhận'
    };
  }
};

function capitalizeName(name: string): string {
  if (!name) {
    return '';
  }
  return name
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
function getAssignerName(assigner: { assignId: string; assignType: 'UNIT' | 'PERSONAL' }) {
  if (assigner.assignType === 'UNIT') {
    return organizationMap.value[assigner.assignId] || '';
  } else if (assigner.assignType === 'PERSONAL') {
    return userMap.value[assigner.assignId] || '';
  }
  return '';
}

getAllOrganizationPublicGraphql().onResult((res) => {
  const organizations = res.data?.allOrganizationPublic || [];
  organizationMap.value = organizations.reduce((acc: Record<string, string>, org: { id: string | number; name: string; }) => {
    acc[org.id] = org.name;
    return acc;
  }, {});
});

getAllUserMoreInfoGraphql().onResult((res) => {
  const users = res.data?.getAllUserMoreInfo || [];
  userMap.value = users.reduce((acc: Record<string, string>, user: { id: string | number; fullName: string; }) => {
    acc[user.id] = user.fullName;
    return acc;
  }, {});
  
});

const flagColors: Record<string, string> = {
  RED: 'text-red-500',
  YELLOW: 'text-yellow-500',
  GREEN: 'text-green-500'
};
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