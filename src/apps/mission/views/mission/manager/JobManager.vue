<template>
  <div class='flex flex-column gap-2'>
    <Sidebar
      v-model:visible='visibleForm'
      :dismissable='false'
      v-bind='{...DEFAULT_DIALOG_CONFIG, style: {"width": "80rem"}}'
      :header="`${isDetail
        ? `${t('mission.job.common.job')}`
        : formId ? t('mission.job.common.update') : t('mission.job.common.create')}`"
      :modal='true'
      position='right'
      @hide='()=> closeDialog()'>
      <FormJob
        :id='formId'
        :is-detail='isDetail'
        :job-type='currentJobType'
        :roles-user = 'rolesUser'
        @hide-dialog='closeDialog'/>
    </Sidebar>
    <Toolbar class='p-0 px-2'>
      <template #start> 
        <div class='align-items-center flex gap-2'>
          <div class='font-bold'>
            {{ t('mission.mission.title.listJob')}}
          </div>
        </div>
      </template>

      <template #end>    
        <div class='btn-group-toolbar flex gap-1 mr-1 my-1'>
          <Button
            v-if="hasPermission('/MISSION/MISSION_DUTY/MISSION_DUTY-JOB/CREATE')"
            class='btn-create focus:shadow-none font-medium p-2'
            icon='pi pi-plus'
            :label='t("common.create")'
            @click='handleAddClick'></Button>
          <Menu
            ref='addMenuRef'
            :model='addMenuOptions'
            :popup='true'/>
          <Button
            class='focus:shadow-none font-normal gap-2 hover:surface-200'
            :label='t("common.viewBy")'
            severity='secondary'
            @click='viewTypeRef?.toggle'>
            <template #icon>
              <i
                class='pi pi-list'
                style='margin-top: 1px'></i>
              <i class='flex-order-2 mt-1 pi pi-angle-down' />
            </template>
          </Button>
          <Button
            class='focus:shadow-none font-normal hover:surface-200'
            icon='pi pi-file-import'
            label='Import'
            severity='secondary'></Button>
          <Button
            class='focus:shadow-none font-normal hover:surface-200'
            icon='pi pi-file-export'
            label='Export'
            severity='secondary'></Button>
          <Button
            class='focus:shadow-none font-normal hover:surface-200'
            icon='pi pi-cog'
            :label='t("common.setting")'
            severity='secondary'></Button>
        </div> 
      </template>
    </Toolbar>
    <div class='border-round h-full overflow-x-auto w-full'>
      <TabMenu
        v-if='showRow == "list" || showRow == "activity"'
        v-model:activeIndex='activeTab'
        :model='statusOptions'
        @tab-change='changeStatus($event)'>
        <template #item='{item}'>
          <div
            v-ripple
            class='flex gap-2 p-menuitem-link p-ripple px-3 py-2'>
            <a style='height: 1.5rem'>{{ item.label }}</a>
            <Badge
              :style="{ backgroundColor: item['color'], color: item.textColor ? item.textColor : '#FFFFFF' }"
              :value='item["count"]'></Badge>
          </div>
        </template>
      </TabMenu>
    </div>
  </div>

  <JobKanban
    v-if='showRow == "kanban"'
    :jobs='jobsData'
    @refresh='() => { refetchJob(); refetchStatusCount(); }'/>
  
  <JobList
    v-if='showRow == "list"'
    :job-data='jobsData'
    :loading='loadingJob'
    :pageable='pageableJobs'
    :roles-user = 'rolesUser'
    @refresh='() => { refetchJob(); refetchStatusCount(); }'/>

  <JobListGroupByActivity
    v-if='showRow == "activity"'
    :job-data='jobsData'
    :loading='loadingJob'
    :pageable='pageableJobs'
    :roles-user = 'rolesUser'
    @refresh='() => { refetchJob(); refetchStatusCount(); }'/>

  <JobResultProcessor
    v-if='showFormResultProcessor'
    :id='formId'
    :is-detail='isDetail'
    :visible-dialog='showFormResultProcessor'
    @hide-dialog='closeDialog'/>
  <JobResultSignature
    v-if='showFormResultSignature'
    :id='formId'
    :is-detail='isDetail'
    :job-type='currentJobType'
    :visible-dialog='showFormResultSignature'
    @hide-dialog='closeDialog'/>
  <JobResultApprover
    v-if='showFormResultApprover'
    :id='formId'
    :is-detail='isDetail'
    :visible-dialog='showFormResultApprover'
    @hide-dialog='closeDialog'/>
  <RequestJobExtensionDeadline
    v-if='showFormRequestDeadline'
    :id='formId'
    :is-detail='isDetail'
    :job='job'
    :visible-dialog='showFormRequestDeadline'
    @hide-dialog='closeDialog'/>
  <ApproverJobExtensionDeadline
    v-if='showFormApproverDeadline'
    :id='formId'
    :is-detail='isDetail'
    :job='job'
    :visible-dialog='showFormApproverDeadline'
    @hide-dialog='closeDialog'/>

  <Paginator
    :class='{ hidden: !totalJob }'
    current-page-report-template='{first}-{last}/{totalRecords}'
    :pt="{
      root: {
        class: 'border-noround-top'
      },
      paginatorwrapper: {
        class: 'custom-paginator-wrapper fix-center'
      },
    }"
    :rows='pageableJobs.size'
    template='FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink JumpToPageDropdown CurrentPageReport'
    :total-records='totalJob'
    @page='onPage'/>

  <Menu
    ref='viewTypeRef'
    :model='viewTypeMenu'
    popup>

    <template #item='itemProp'>
      <div class='cursor-pointer flex gap-1 p-2'>
        <AppIcon
          class='mr-2'
          name='check'
          size='1.5'
          :style='{opacity:viewType==itemProp.item.key?1:0,
                   color: viewType == itemProp.item.key ? "#0d99ff" : ""}'/>

        <div
          :style='{color: viewType == itemProp.item.key ? "#0d99ff" : ""}'>
          {{ itemProp.item.label }}
        </div>
      </div>
    </template>
  </Menu>
</template>

<script setup lang='ts'>
import { cloneDeep, get } from 'lodash';
import moment from 'moment';
import { storeToRefs } from 'pinia';
import Dropdown from 'primevue/dropdown';
import type Menu from 'primevue/menu';
import type { PageState } from 'primevue/paginator';
import type { TabMenuChangeEvent } from 'primevue/tabmenu';
import type { TreeNode } from 'primevue/treenode';
import { computed, inject, markRaw, provide, reactive, ref, watch, watchEffect } from 'vue';
import { useI18n } from 'vue-i18n';

import { getAllOrganizationPublicGraphql } from '@/apps/admin/api/graphql/organization-graphql-api';
import { usePermissionStore } from '@/apps/admin/store/permission';
import { useUserMoreInfoStore } from '@/apps/admin/store/usersMoreInfo';
import { convertToOrganizationTreeNodes } from '@/apps/hrm/helpers/utils';
import { findAllActivity } from '@/apps/mission/api/graphql/activity-api';
import { getCountAllJobStatus, searchJobGraphql } from '@/apps/mission/api/graphql/job-api';
import { searchJobReportToLeader, searchListJobReportLeaderSendToSpecificGeneralLeader } from '@/apps/mission/api/graphql/job-report-api';
import type { ActivityInterface } from '@/apps/mission/model/activity/activity';
import { type JobInterface, JobType, type PersonalInterface, RoleType, type SearchJobInput } from '@/apps/mission/model/job/job';
import { type MissionTypeInterface, StatusMission } from '@/apps/mission/model/mission/mission';
import { getAllUserMoreInfoGraphql } from '@/common/api/graphql/user-graphql';
import AppIcon from '@/common/components/app/AppIcon.vue';
import { DateTimeFormat, DEFAULT_DIALOG_CONFIG } from '@/common/constants';
import { useGlobalSearchStore } from '@/common/store/search';
import { useUserStore } from '@/common/store/user';

import ApproverJobExtensionDeadline from '../component/extensionDeadline/job/ApproverJobExtensionDeadline.vue';
import RequestJobExtensionDeadline from '../component/extensionDeadline/job/RequestJobExtensionDeadline.vue';
import FormJob from '../component/FormJob.vue';
import JobResultApprover from '../component/formResult/JobResultApprover.vue';
import JobResultProcessor from '../component/formResult/JobResultProcessor.vue';
import JobResultSignature from '../component/formResult/JobResultSignature.vue';
import JobListGroupByActivity from '../component/groupList/job/JobListGroupByActivity.vue';
import JobList from '../component/JobList.vue';
import JobKanban from '../component/kanban/job/JobKanban.vue';
const { setFields, $reset } = useGlobalSearchStore();
const {
  submit,
  model
} = storeToRefs(useGlobalSearchStore());
const hasPermission = usePermissionStore().hasPermission;
const totalJob = ref<number>(0);
type ViewType = 'list' | 'kanban' | 'activity';
const viewType = ref<ViewType>('list');
const viewTypeRef = ref<InstanceType<typeof Menu> | null>(null);
const activeTab = ref<number>(0);
const { t } = useI18n();
const addMenuRef = ref<InstanceType<typeof Menu> | null>(null);
const searchTerm = inject('searchTerm', ref(''));
const showRow = ref<string>('list');
const tree = ref<TreeNode[]>([]);
const jobsData = ref<JobInterface[]>([]);
const activityOptions = ref<ActivityInterface[]>([]);
const personalOption = ref<PersonalInterface[]>([]);
const currentJobType = ref<JobType | undefined>();
const { user } = storeToRefs(useUserStore());
const store = useUserMoreInfoStore();
const { usersMoreInfo } = storeToRefs(store);
store.fetchAllUsers();
const formId = ref();
const isDetail = ref();
const showFormResultProcessor = ref<boolean>(false);
const showFormResultApprover = ref<boolean>(false);
const showFormResultSignature = ref<boolean>(false);
const showFormRequestDeadline = ref<boolean>(false);
const showFormApproverDeadline = ref<boolean>(false);
const isRefreshCode = ref<number>(0);
const job = ref();
const currentUserInfo = computed(() => {
  return user.value?.id ? usersMoreInfo.value[user.value.id] : undefined;
});

const rolesUser = computed(() => currentUserInfo.value?.roles || []);

function getDefaultSearchJob(): SearchJobInput {
  return {
    keyword: '',
    activityId: null,
    fromDate: null,
    toDate: null,
    year: moment().format(DateTimeFormat.ISO_LOCAL_YEAR),
    jobType: null,
    mainHandler: null,
    status: null
  };
}
const searchJob = ref<SearchJobInput>(getDefaultSearchJob());

function refetchSearchJob(){
  searchJob.value = getDefaultSearchJob();
}

const jobStatusCount = ref({
  new: 0,
  totalAll: 0,
  unProcessed: 0,
  inProgress: 0,
  completed: 0,
  totalReportJobToLeader: 0,
  totalReportJobGeneralLeaderApproved: 0,
  waitingForAccept: 0,
  waitingForApprovalExtensionDeadlineRequest: 0
});

const pageableJobs = ref({
  page: 0,
  size: 50
});
const searchParams = reactive({
  reportJobToLeaderSearchInput: { jobReportToLeaderStatus: 'WAITING_FOR_LEADER_APPROVAL' },
  pageable: pageableJobs,
});

const searchReportLeader = reactive({
  searchInput: { textSearch: '' },
  pageable: pageableJobs,
});
const {
  onResult: getJobReportResult,
  refetch: refetchJobReport,
} = searchJobReportToLeader();

const {
  onResult: getJobReportLeaderResult,
  refetch: refetchJobReportLeader,
} = searchListJobReportLeaderSendToSpecificGeneralLeader();

getJobReportResult((res) => {
  console.log('data.searchJobReportToLeader', res.data.searchJobReportToLeader);
  jobsData.value = res.data.searchJobReportToLeader.content;
  totalJob.value = res.data.searchJobReportToLeader.totalRecords;
});

getJobReportLeaderResult((res) => {
  console.log('data.searchListJobReportLeaderSendToSpecificGeneralLeader', res.data.searchListJobReportLeaderSendToSpecificGeneralLeader);
  jobsData.value = res.data.searchListJobReportLeaderSendToSpecificGeneralLeader.content;
  totalJob.value = res.data.searchListJobReportLeaderSendToSpecificGeneralLeader.totalRecords;
});

const {
  onResult: onJobResult,
  load: loadJob,
  loading: loadingJob,
  refetch: refetchJob,
} = searchJobGraphql();
function fetchData() {
  model.value.year = new Date(new Date().getFullYear(), 0, 1);
  loadJob(undefined, {
    jobSearchDto: searchJob.value,
    pageable: {
      ...pageableJobs.value,
      page: pageableJobs.value.page
    }
  });
}
onJobResult((res) => {
  jobsData.value = res.data.searchJob.content;
  totalJob.value = res.data.searchJob.totalRecords;
});

watch(searchTerm, (newValue) => {
  refetchJob({
    jobSearchDto: {
      ...searchJob.value,
      keyword: newValue,
    },
    pageable: pageableJobs.value
  });
});

fetchData();

function handleAddClick(event: MouseEvent) {
  addMenuRef.value?.toggle(event);
}

function openFormForJobType( jobType?:JobType, id?: string, checkDetail?:boolean) {
  formId.value = id;
  currentJobType.value = jobType;
  isDetail.value = checkDetail;
  visibleForm.value = true;
}

watch(submit, () => {
  searchJob.value = cloneDeep({
    ...getDefaultSearchJob(),
    ...model.value,
    fromDate: model.value.fromDate
      ? moment(model.value.fromDate).format(DateTimeFormat.ISO_LOCAL_DATE)
      : null,
    toDate: model.value.toDate
      ? moment(model.value.toDate).format(DateTimeFormat.ISO_LOCAL_DATE)
      : null,
    year: model.value.year
      ? moment(model.value.year).format(DateTimeFormat.ISO_LOCAL_YEAR)
      : moment().format(DateTimeFormat.ISO_LOCAL_YEAR),
  });
  refetchJob({
    jobSearchDto: {
      ...searchJob.value,
      keyword: searchTerm.value,
    },
    pageable: pageableJobs.value
  });
});

function changeStatus(event: TabMenuChangeEvent ) {
  const isLeader = rolesUser.value.includes(RoleType.LANH_DAO);
  const isChief = rolesUser.value.includes(RoleType.TRUONG_PHONG);
  const selected = statusOptions.value[event.index];
  const status = selected?.value ?? null;
  if (status == StatusMission.ALL) {
    refetchSearchJob();
    $reset();
    searchJob.value.status = null;
  } else if (status == StatusMission.NEW) {
    refetchSearchJob();
    $reset();
    searchJob.value.status = StatusMission.NEW;
  } else if (status == StatusMission.IN_PROGRESS) {
    refetchSearchJob();
    $reset();
    searchJob.value.status = StatusMission.IN_PROGRESS;
  } else if (status == StatusMission.WAITING_FOR_ACCEPT) {
    refetchSearchJob();
    $reset();
    searchJob.value.status = StatusMission.WAITING_FOR_ACCEPT;
  }else if (status == StatusMission.WAITING_FOR_APPROVAL_EXTENSION_DEADLINE_REQUEST) {
    refetchSearchJob();
    $reset();
    searchJob.value.status = StatusMission.WAITING_FOR_APPROVAL_EXTENSION_DEADLINE_REQUEST;
  } else if (status == StatusMission.WAITING_FOR_LEADER_APPROVAL) {
    $reset();
    if(isChief){
      refetchJobReport(searchParams);
    }
    if(isLeader) {
      refetchJobReportLeader(searchReportLeader);
    }
    return;
  } else if (status == StatusMission.COMPLETED) {
    refetchSearchJob();
    $reset();
    searchJob.value.status = StatusMission.COMPLETED;
  }
  refetchJob({
    jobSearchDto: searchJob.value,
    pageable: pageableJobs.value
  });
}

function closeDialog() {
  formId.value = null;
  visibleForm.value = false;
  showFormResultProcessor.value = false;
  showFormResultApprover.value = false;
  showFormResultSignature.value = false;
  showFormRequestDeadline.value = false;
  showFormApproverDeadline.value = false;
  console.log(activeTab.value);
  
  refetchStatusCount();
  if(activeTab.value == 3){
    refetchJobReport();
    refetchJobReportLeader();
  }else{
    refetchJob();
  }
  
}

function openFormResultProcessor(id?: string, checkDetail?:boolean) {
  formId.value = id;
  isDetail.value = checkDetail;
  showFormResultProcessor.value = true;
}

function openFormResultApprover(id?: string, checkDetail?:boolean) {
  formId.value = id;
  isDetail.value = checkDetail;
  showFormResultApprover.value = true;
}

function openFormResultSignature(jobType?:JobType, id?: string, checkDetail?:boolean) {
  formId.value = id;
  currentJobType.value = jobType;
  isDetail.value = checkDetail;
  showFormResultSignature.value = true;
}

function openFormRequestDeadline(id?: string, item?:ActivityInterface, checkDetail?: boolean) {
  formId.value = id;
  isDetail.value = checkDetail;
  job.value = item;
  showFormRequestDeadline.value = true;
}
function openFormApproverDeadline(id?: string, item?:ActivityInterface, checkDetail?: boolean) {
  formId.value = id;
  isDetail.value = checkDetail;
  job.value = item;
  showFormApproverDeadline.value = true;
}
provide('isRefreshCode', isRefreshCode);
provide('openFormResultProcessor', openFormResultProcessor);
provide('openFormForJobType', openFormForJobType);
provide('openFormResultApprover', openFormResultApprover);
provide('openFormResultSignature', openFormResultSignature);
provide('openFormRequestDeadline', openFormRequestDeadline);
provide('openFormApproverDeadline', openFormApproverDeadline);
function refetchStatusCount() {
  getCountAllJobStatus().onResult(res => {
    jobStatusCount.value = res.data.getCountAllJobStatus;
  });
}

watchEffect(() => {
  refetchStatusCount();
});

const statusOptions = computed(() => {
  const isChief = rolesUser.value.includes(RoleType.TRUONG_PHONG);
  const isLeader = rolesUser.value.includes(RoleType.LANH_DAO);
  let countMap: {
  new?: number;
  unProcessed?: number;
  inProgress?: number;
  completed?: number;
  totalAll?: number;
  totalReportJobToLeader?: number;
  totalReportJobGeneralLeaderApproved?: number;
  waitingForAccept?: number;
  waitingForApprovalExtensionDeadlineRequest?: number;
} = {};
  countMap = jobStatusCount.value;
  return[
    {
      label: t('mission.mission.statusOptions.all'),
      show: true,
      value: StatusMission.ALL,
      count: countMap ? countMap.totalAll : undefined,
      color: '#888888'
    },
    {
      show: true,
      label: t('mission.mission.statusOptions.new'),
      value: StatusMission.NEW,
      count: countMap ? countMap.new : undefined,
      color: '#3B82F6'
    },
    {
      show: true,
      label: t('mission.mission.statusOptions.inProgress'),
      value: StatusMission.IN_PROGRESS,
      count: countMap ? countMap.inProgress : undefined,
      color: '#213C7A'
    },
    {
      label: t('Chờ gia hạn'),
      value: StatusMission.WAITING_FOR_APPROVAL_EXTENSION_DEADLINE_REQUEST,
      show: true,
      count: countMap ? countMap.waitingForApprovalExtensionDeadlineRequest : undefined,
      color: '#FCD34D'
    },
    {
      show: isChief || isLeader,
      label: t('mission.mission.statusOptions.waitingApproval'),
      value: StatusMission.WAITING_FOR_LEADER_APPROVAL,
      count: isChief 
        ? countMap?.totalReportJobToLeader 
        : isLeader 
          ? countMap?.totalReportJobGeneralLeaderApproved 
          : undefined,
      color: '#F59E0B'
    },
    {
      show: true,
      label: 'Chờ tiếp nhận',
      value: StatusMission.WAITING_FOR_ACCEPT,
      count: countMap ? countMap.waitingForAccept : undefined,
      color: '#BDBDBD',
    },
    {
      show: true,
      label: t('mission.mission.statusOptions.done'),
      value: StatusMission.COMPLETED,
      count: countMap ? countMap.completed : undefined,
      color: '#22C55E'
    }
  ].filter((item) => item.show);;
});

const viewTypeMenu = ref([
  {
    label: 'Danh sách',
    key: 'list',
    command: () => {
      viewType.value = 'list';
      showRow.value = 'list';
    },
  }, {
    label: 'Kanban',
    key: 'kanban',
    command: () => {
      searchJob.value.status = null;
      fetchData();
      viewType.value = 'kanban';
      showRow.value = 'kanban';
      
    },
  }, {
    label: 'Nhóm hoạt động',
    key: 'activity',
    command: () => {
      viewType.value = 'activity';
      showRow.value = 'activity';
    },
  }
]);

const statusOptionFilter = ref<MissionTypeInterface[]>([
  {
    id: StatusMission.ALL,
    name: t('mission.mission.statusOptions.all')
  },
  {
    id: StatusMission.NEW,
    name: 'Tạo mới'
  },
  {
    id: StatusMission.COMPLETED,
    name: t('mission.mission.statusOptions.done'),
  },
  {
    id: StatusMission.IN_PROGRESS,
    name: t('mission.mission.statusOptions.inProgress'),
  },
  {
    id: StatusMission.WAITING_FOR_APPROVAL_EXTENSION_DEADLINE_REQUEST,
    name: 'Chờ gia hạn'
  }
]);

const onPage = (event: PageState) => {
  pageableJobs.value.page = event.page;
  pageableJobs.value.size = event.rows;
  fetchData();
};

const jobTypeOptionFilter = ref<MissionTypeInterface[]>([
  {
    id: JobType.ON_MISSION,
    name: t('mission.job.createOptions.missionBased'),
  },
  {
    id: JobType.OTHER,
    name: t('mission.job.createOptions.other'),
  }
]);

setFields({
  activityId: {
    label: 'Hoạt động',
    col: 12,
    type: String,
    component: markRaw(Dropdown),
    props: {
      showClear: true,
      options: activityOptions,
      optionLabel: 'activityName',
      optionValue: 'id',
    },
  },
  fromDate: {
    label: 'Từ ngày',
    type: String,
    isDatePicker: true,
    col: 6,
  },
  toDate: {
    label: 'Đến ngày',
    type: String,
    isDatePicker: true,
    hasAdd: true,
    col: 6,
  },
  year: {
    label: 'Năm',
    isDatePicker: true,
    col: 6,
    props: {
      view: 'year',
      dateFormat: 'yy',
    },
  },
  status: {
    label: 'Trạng thái',
    col: 6,
    optionsDropdown: statusOptionFilter,
  },
  jobType: {
    label: 'Loại công việc',
    col: 6,
    optionsDropdown: jobTypeOptionFilter,
  },
  mainHandler: {
    label: 'Người xử lý chính',
    col: 6,
    optionsDropdown: personalOption,
  },
});

const visibleForm = ref<boolean>(false);

getAllOrganizationPublicGraphql().onResult((res) => {
  tree.value = convertToOrganizationTreeNodes(res.data?.allOrganizationPublic || []);
});

findAllActivity().onResult(res => {
  activityOptions.value = get(res, 'data.findAllActivity');
});

getAllUserMoreInfoGraphql().onResult(res => {
  personalOption.value = get(res, 'data.getAllUserMoreInfo').map((user: { id: string; fullName: string }) => {
    return {
      id: user.id,
      name: user.fullName
    };
  });;
});

const addMenuOptions = ref([
  {
    label: t('mission.job.createOptions.missionBased'),
    icon: 'pi pi-check-square',
    command: () => openFormForJobType(JobType.ON_MISSION),
  },
  {
    label: t('mission.job.createOptions.other'),
    icon: 'pi pi-plus-circle',
    command: () => openFormForJobType(JobType.OTHER),
  },
]);
</script>

<style scoped>
:deep(.p-paginator) {
  border: unset;
  padding: unset;
}

.custom-paginator-wrapper {
  display: flex;
  height: 40px;
  align-items: center;
  overflow: hidden;
}

:deep(.p-paginator-page-options) {
  display: flex;
  align-items: center;
  height: 2rem;
}

:deep(.p-paginator .p-paginator-pages .p-paginator-page) {
  height: 2rem;
  min-width: 2rem;
  border-radius: 6px;
}
:deep(.p-paginator .p-paginator-first) {
  min-width: 2rem;
  height: 2rem;
}

:deep(.p-paginator .p-paginator-prev) {
  min-width: 2rem;
  height: 2rem;
}

:deep(.p-paginator .p-paginator-next) {
  min-width: 2rem;
  height: 2rem;
}

:deep(.p-paginator .p-paginator-last) {
  min-width: 2rem;
  height: 2rem;
}

:deep(.p-paginator .p-paginator-pages .p-paginator-page) {
  min-width: 2rem;
  height: 2rem;
}

:deep(.p-paginator .p-dropdown) {
  height: 2rem;

}

.p-toolbar{
  min-height: 42px;
}

.btn-create, .btn-import, .btn-filter, .btn-export {
  max-height: 37px;
}
</style>