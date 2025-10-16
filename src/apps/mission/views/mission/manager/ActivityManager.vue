<template>
  <div class='flex flex-column gap-2'>
    <Sidebar
      v-model:visible='visibleForm'
      :dismissable='false'
      v-bind='{...DEFAULT_DIALOG_CONFIG, style: {"width": "60rem"}}'
      :header="`${isDetail
        ? `${t('mission.activity.common.activity')}`
        : formId ? t('mission.activity.common.update') : t('mission.activity.common.create')}`"
      :modal='true'
      position='right'
      @hide='()=> closeDialog()'>
      <FormActivity
        :id='formId'
        :is-detail='isDetail'
        @hide-dialog='closeDialog'/>
    </Sidebar>
    <Toolbar class='p-0 px-2'>
      <template #start> 
        <div class='align-items-center flex gap-2'>
          <div class='font-bold'>
            {{ t('mission.mission.title.listActivity')}}
          </div>
        </div>
      </template>

      <template #end>    
        <div class='btn-group-toolbar flex gap-1 mr-1 my-1'>
          <Button
            v-if="hasPermission('/MISSION/MISSION_DUTY/MISSION_DUTY-ACTIVITY/CREATE')"
            class='btn-create focus:shadow-none font-medium p-2'
            icon='pi pi-plus'
            :label='t("common.create")'
            @click='handleAddClick'></Button>
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
        v-if='showRow == "list" || showRow == "mission"'
        v-model:activeItem='activeTab'
        :model='statusOptions'
        @tab-change='changeStatus($event)'>
        <template #item='{item}'>
          <div
            v-ripple
            class='flex gap-2 p-menuitem-link p-ripple px-3 py-2'>
            <a style='height: 1.5rem'>{{ item.label }}</a>
            <Badge
              :style="{ backgroundColor: item['color'], color: '#FFFFFF' }"
              :value='item["count"]'></Badge>
          </div>
        </template>
      </TabMenu>
    </div>
  </div>

  <ActivityKanban
    v-if='showRow == "kanban"'
    :activitys='activitiesData'
    @refresh='() => { refetchActivity(); refetchStatusCount(); }'/>
  <ActivityList
    v-if='showRow == "list"'
    :activity-data='activitiesData'
    :loading='loadingActivity'
    :pageable='pageableActivities'
    @refresh='() => { refetchActivity(); refetchStatusCount(); }'/>

  <ActivityListGroupByMission
    v-if='showRow == "mission"'
    :activity-data='activitiesData'
    :loading='loadingActivity'
    :pageable='pageableActivities'
    @refresh='() => { refetchActivity(); refetchStatusCount(); }'/>

  <Sidebar
    v-model:visible='visibleFormMission'
    :dismissable='false'
    v-bind='{...DEFAULT_DIALOG_CONFIG, style: {"width": "60rem"}}'
    :header="t('mission.mission.common.mission')"
    :modal='true'
    position='right'
    @hide='()=> closeDialog()'>
    <FormMission
      :id='missionId'
      :is-detail= 'true'
      @hide-dialog='closeDialog'/>
  </Sidebar>
  <RequestActivityExtensionDeadline
    v-if='showFormRequestDeadline'
    :id='formId'
    :activity='activity'
    :is-detail='isDetail'
    :visible-dialog='showFormRequestDeadline'
    @hide-dialog='closeDialog'/>
  <ApproverActivityExtensionDeadline
    v-if='showFormApproverDeadline'
    :id='formId'
    :activity='activity'
    :is-detail='isDetail'
    :visible-dialog='showFormApproverDeadline'
    @hide-dialog='closeDialog'/>
  <Paginator
    :class='{ hidden: !totalActivity }'
    current-page-report-template='{first}-{last}/{totalRecords}'
    :pt="{
      root: {
        class: 'border-noround-top'
      },
      paginatorwrapper: {
        class: 'custom-paginator-wrapper fix-center'
      },
    }"
    :rows='pageableActivities.size'
    template='FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink JumpToPageDropdown CurrentPageReport'
    :total-records='totalActivity'
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
import type Menu from 'primevue/menu';
import type { PageState } from 'primevue/paginator';
import type { TabMenuChangeEvent } from 'primevue/tabmenu';
import type { TreeNode } from 'primevue/treenode';
import { computed, inject, onMounted, provide, ref, watch, watchEffect } from 'vue';
import { useI18n } from 'vue-i18n';

import { getAllOrganizationPublicGraphql } from '@/apps/admin/api/graphql/organization-graphql-api';
import { usePermissionStore } from '@/apps/admin/store/permission';
import { useUserMoreInfoStore } from '@/apps/admin/store/usersMoreInfo';
import { convertToOrganizationTreeNodes } from '@/apps/hrm/helpers/utils';
import { getCountAllActivityStatus, searchActivitiesGraphql } from '@/apps/mission/api/graphql/activity-api';
import { findAllMission } from '@/apps/mission/api/graphql/mission';
import type { ActivityInterface, SearchActivityInput } from '@/apps/mission/model/activity/activity';
import { FilterMissionType, type MissionInterface, type MissionTypeInterface, StatusMission } from '@/apps/mission/model/mission/mission';
import ActivityList from '@/apps/mission/views/mission/component/ActivityList.vue';
import FormActivity from '@/apps/mission/views/mission/component/FormActivity.vue';
import AppIcon from '@/common/components/app/AppIcon.vue';
import { DateTimeFormat, DEFAULT_DIALOG_CONFIG } from '@/common/constants';
import { useGlobalSearchStore } from '@/common/store/search';

import ApproverActivityExtensionDeadline from '../component/extensionDeadline/activity/ApproverActivityExtensionDeadline.vue';
import RequestActivityExtensionDeadline from '../component/extensionDeadline/activity/RequestActivityExtensionDeadline.vue';
import FormMission from '../component/FormMission.vue';
import ActivityListGroupByMission from '../component/groupList/activity/ActivityListGroupByMission.vue';
import ActivityKanban from '../component/kanban/activity/ActivityKanban.vue';
const { setFields, $reset } = useGlobalSearchStore();
const {
  submit,
  model
} = storeToRefs(useGlobalSearchStore());
const hasPermission = usePermissionStore().hasPermission;
const totalActivity = ref<number>(0);
type ViewType = 'list' | 'kanban' | 'mission';
const viewType = ref<ViewType>('list');
const viewTypeRef = ref<InstanceType<typeof Menu> | null>(null);
const activeTab = ref();
const { t } = useI18n();
const addMenuRef = ref<InstanceType<typeof Menu> | null>(null);
const searchTerm = inject('searchTerm', ref(''));
const showRow = ref<string>('list');
const tree = ref<TreeNode[]>([]);
const activitiesData = ref<ActivityInterface[]>([]);
const missionOptions = ref<MissionInterface[]>([]);
const changeTag = ref<FilterMissionType>(FilterMissionType.MISSIONS);
const formId = ref();
const missionId = ref();
const isDetail = ref();
const visibleForm = ref<boolean>(false);
const visibleFormMission = ref<boolean>(false);
const showFormRequestDeadline = ref<boolean>(false);
const showFormApproverDeadline = ref<boolean>(false);
const activity = ref();
const { fetchAllUsers } = useUserMoreInfoStore();

const searchPayload = ref<SearchActivityInput>({
  keyword: '',
  fromDate: null,
  toDate: null,
  year: moment().format(DateTimeFormat.ISO_LOCAL_YEAR),
  missionId: null,
  hostUnit: null,
  coordinationUnitName: null,
  isGetListOfGeneralLeaderNeedSubmitActivity: false,
  status: null
});

const activityStatusCount = ref({
  totalAll: 0,
  new: 0,
  unProcessed: 0,
  inProgress: 0,
  completed: 0,
  waitingForGeneralLeaderApproveActivity: 0,
  generalLeaderRejectedActivity: 0,
  waitingForApprovalExtensionDeadlineRequest: 0
});

const pageableActivities = ref({
  page: 0,
  size: 50
});

const {
  onResult: onActivityResult,
  load: loadActivity,
  loading: loadingActivity,
  refetch: refetchActivity,
} = searchActivitiesGraphql();

function fetchData() {
  model.value.year = new Date(new Date().getFullYear(), 0, 1);
  loadActivity(undefined, {
    searchPayload: searchPayload.value,
    pageable: {
      ...pageableActivities.value,
      page: 0
    }
  });
}
onActivityResult((res) => {
  activitiesData.value = res.data.searchActivities.content;
  totalActivity.value = res.data.searchActivities.totalRecords;
});

watch(searchTerm, (newValue) => {
  refetchActivity({
    searchPayload: {
      ...searchPayload.value,
      keyword: newValue,
    },
    pageable: pageableActivities.value
  });
});

fetchData();

function handleAddClick(event: MouseEvent) {
  if (changeTag.value === FilterMissionType.JOBS) {
    addMenuRef.value?.toggle(event);
  } else {
    openForm();
  }
}

function openForm(id?: string, checkDetail?: boolean) {
  formId.value = id;
  isDetail.value = checkDetail;
  visibleForm.value = true;
}

function openFormMission(id?: string) {
  missionId.value = id;
  visibleFormMission.value = true;
}

function openFormRequestDeadline(id?: string, item?:ActivityInterface, checkDetail?: boolean) {
  formId.value = id;
  isDetail.value = checkDetail;
  activity.value = item;
  showFormRequestDeadline.value = true;
}
function openFormApproverDeadline(id?: string, item?:ActivityInterface, checkDetail?: boolean) {
  formId.value = id;
  isDetail.value = checkDetail;
  activity.value = item;
  showFormApproverDeadline.value = true;
}

watch(submit, () => {
  searchPayload.value = cloneDeep({
    status: model.value.status,
    missionId: model.value.missionId,
    hostUnit: model.value.hostUnit ? Object.keys(model.value.hostUnit)[0] : null,
    coordinationUnitName: model.value.coordinationUnitName ? Object.keys(model.value.coordinationUnitName)[0] : null,
    toDate: model.value.toDate
      ? moment(model.value.toDate).format(DateTimeFormat.ISO_LOCAL_DATE)
      : null,
    year: model.value.year
      ? moment(model.value.year).format(DateTimeFormat.ISO_LOCAL_YEAR)
      : null,
  });
  refetchActivity({
    searchPayload: {
      ...searchPayload.value,
      keyword: searchTerm.value,
    },
    pageable: pageableActivities.value
  });
});

function changeStatus(event: TabMenuChangeEvent ) {
  console.log(event);
  $reset();
  const selected = statusOptions.value[event.index];
  const status = selected?.value ?? null;
  searchPayload.value = { status: status === StatusMission.ALL ? null : status };
  if (status === StatusMission.WAITING_FOR_GENERAL_LEADER_APPROVE_ACTIVITY) {
    searchPayload.value.isGetListOfGeneralLeaderNeedSubmitActivity = true;
  }
  fetchData();
}

function closeDialog() {
  formId.value = null;
  visibleForm.value = false;
  missionId.value = null;
  visibleFormMission.value = false;
  showFormRequestDeadline.value = false;
  showFormApproverDeadline.value = false;
  refetchStatusCount();
  refetchActivity({
    searchPayload: searchPayload.value,
    pageable: {
      ...pageableActivities.value,
      page: 0
    }
  });
}

provide('openForm', openForm);
provide('openFormMission', openFormMission);
provide('openFormRequestDeadline', openFormRequestDeadline);
provide('openFormApproverDeadline', openFormApproverDeadline);

function refetchStatusCount() {
  getCountAllActivityStatus().onResult(res => {
    activityStatusCount.value = res.data.getCountAllActivityStatus;
  });
}

watchEffect(() => {
  refetchStatusCount();
});

const statusOptions = computed(() => {
  let countMap: {
  new?: number;
  totalAll?: number;
  unProcessed?: number;
  inProgress?: number;
  completed?: number;
  waitingForGeneralLeaderApproveActivity?: number;
  generalLeaderRejectedActivity?: number;
  waitingForApprovalExtensionDeadlineRequest?: number;
} = {};
  countMap = activityStatusCount.value;
  return[
    {
      label: t('mission.mission.statusOptions.all'),
      value: StatusMission.ALL,
      show: true,
      count: countMap ? countMap.totalAll : undefined,
      color: '#888888'
    },
    {
      label: t('mission.mission.statusOptions.new'),
      value: StatusMission.NEW,
      show: true,
      count: countMap ? countMap.new : undefined,
      color: '#3B82F6'
    },
    {
      label: t('Đang thực hiện'),
      value: StatusMission.IN_PROGRESS,
      show: true,
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
      label: t('Chờ chấp thuận'),
      value: StatusMission.WAITING_FOR_GENERAL_LEADER_APPROVE_ACTIVITY,
      show: true,
      count: countMap ? countMap.waitingForGeneralLeaderApproveActivity : 0,
      color: '#F59E0B'
    },
    {
      label: t('Không chấp thuận'),
      value: StatusMission.GENERAL_LEADER_REJECTED_ACTIVITY,
      show: true,
      count: countMap ? countMap.generalLeaderRejectedActivity : 0,
      color: '#EF4444'
    },
    {
      label: t('mission.mission.statusOptions.done'),
      value: StatusMission.COMPLETED,
      show: true,
      count: countMap ? countMap.completed : undefined,
      color: '#22C55E'
    }
  ].filter((item) => item.show);
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
      searchPayload.value.status = null;
      fetchData();
      viewType.value = 'kanban';
      showRow.value = 'kanban';
    },
  }, {
    label: 'Nhóm nhiệm vụ',
    key: 'mission',
    command: () => {
      viewType.value = 'mission';
      showRow.value = 'mission';
    },
  }
]);

const statusOptionFilter = ref<MissionTypeInterface[]>([
  {
    id: StatusMission.NEW,
    name: 'Tạo mới'
  },
  {
    id: StatusMission.COMPLETED,
    name: 'Hoàn thành'
  },
  {
    id: StatusMission.IN_PROGRESS,
    name: 'Đang thực hiện'
  },
  {
    id: StatusMission.WAITING_FOR_GENERAL_LEADER_APPROVE_ACTIVITY,
    name: 'Chờ chấp thuận'
  },
  {
    id: StatusMission.GENERAL_LEADER_REJECTED_ACTIVITY,
    name: 'Không chấp thuận'
  },
  {
    id: StatusMission.WAITING_FOR_APPROVAL_EXTENSION_DEADLINE_REQUEST,
    name: 'Chờ gia hạn'
  }
]);

const onPage = (event: PageState) => {
  pageableActivities.value.page = event.page;
  pageableActivities.value.size = event.rows;
  refetchActivity({
    searchPayload: {
      ...searchPayload.value,
      keyword: searchTerm.value,
    },
    pageable: pageableActivities.value
  });
};

setFields({
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
  missionId: {
    label: 'Nhiệm vụ',
    col: 12,
    optionsDropdown: missionOptions,
  },
  hostUnit: {
    label: 'Đơn vị chủ trì',
    col: 12,
    optionsTreeSelect: tree,
    isTreeSingleSelect: true,
  },
  coordinationUnitName: {
    label: 'Đơn vị phối hợp',
    col: 12,
    optionsTreeSelect: tree,
    isTreeSingleSelect: true,
  },
  toDate: {
    label: 'Đến ngày',
    type: String,
    isDatePicker: true,
    col: 6,
  },
      
});

getAllOrganizationPublicGraphql().onResult((res) => {
  tree.value = convertToOrganizationTreeNodes(res.data?.allOrganizationPublic || []);
});

findAllMission().onResult(res => {
  missionOptions.value = get(res, 'data.findAllMission');
});

onMounted(() => fetchAllUsers());
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