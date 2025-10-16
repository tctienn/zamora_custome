<template>
  <div class='flex flex-column gap-2'>
    <Sidebar
      v-model:visible='visibleForm'
      :dismissable='false'
      v-bind='{...DEFAULT_DIALOG_CONFIG, style: {"width": "60rem"}}'
      :header="`${isDetail
        ? `${t('mission.mission.common.mission')}`
        : formId ? t('mission.mission.common.update') : t('mission.mission.common.create')}`"
      :modal='true'
      position='right'
      @hide='()=> closeDialog()'>
      <FormMission
        :id='formId'
        :is-detail= 'isDetail'
        @hide-dialog='closeDialog'/>
    </Sidebar>
    <Toolbar class='p-0 px-2'>
      <template #start> 
        <div class='align-items-center flex gap-2'>
          <div class='font-bold'>
            {{ t('mission.mission.title.listMission')}}
          </div>
        </div>
      </template>

      <template #end>    
        <div class='btn-group-toolbar flex gap-1 mr-1 my-1'>
          <Button
            v-if="hasPermission('/MISSION/MISSION_DUTY/MISSION_DUTY-MANAGEMENT/CREATE')"
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
            severity='secondary'
            @click='exportDialogVisible = true'></Button>
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
        v-if='showRow == "list" || showRow == "type"'
        v-model:activeIndex='activeTab'
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

  <MissionsList
    v-if='showRow == "list"'
    :loading='loadingMission'
    :mission-data='missionsData'
    :pageable='pageableMissions'
    @refresh='() => { refetchMission(); refetchStatusCount(); }'/>

  <MissionKanban
    v-if='showRow == "kanban"'
    :loading='loadingMission'
    :missions='missionsData'
    @refresh='() => { refetchMission(); refetchStatusCount(); }'/>

  <MissionListGroupByType
    v-if='showRow == "type"'
    :loading='loadingMission'
    :mission-data='missionsData'
    :pageable='pageableMissions'
    @refresh='() => { refetchMission(); refetchStatusCount(); }'/>

  <RequestMissionExtensionDeadline
    v-if='showFormRequestDeadline'
    :id='formId'
    :is-detail='isDetail'
    :mission='mission'
    :visible-dialog='showFormRequestDeadline'
    @hide-dialog='closeDialog'/>
  <ApproverMissionExtensionDeadline
    v-if='showFormApproverDeadline'
    :id='formId'
    :is-detail='isDetail'
    :mission='mission'
    :visible-dialog='showFormApproverDeadline'
    @hide-dialog='closeDialog'/>

  <ProgressChart
    v-if='showChart'
    :id='formId'
    :visible-dialog='showChart'
    @hide-dialog='closeDialog'/>

  <Paginator
    :class='{ hidden: !totalMission }'
    current-page-report-template='{first}-{last}/{totalRecords}'
    :pt="{
      root: {
        class: 'border-noround-top'
      },
      paginatorwrapper: {
        class: 'custom-paginator-wrapper fix-center'
      },
    }"
    :rows='pageableMissions.size'
    template='FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink JumpToPageDropdown CurrentPageReport'
    :total-records='totalMission'
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
  <ExportDialog
    v-if='exportDialogVisible'
    v-model:visibleDialog='exportDialogVisible'
    :export-options='exportOptions'
    :search = 'searchModel'
    @hide-dialog='exportDialogVisible = false'/>
</template>

<script setup lang='ts'>
import { cloneDeep, get } from 'lodash';
import moment from 'moment';
import { storeToRefs } from 'pinia';
import InputNumber from 'primevue/inputnumber';
import type Menu from 'primevue/menu';
import type { PageState } from 'primevue/paginator';
import type { TabMenuChangeEvent } from 'primevue/tabmenu';
import type { TreeNode } from 'primevue/treenode';
import { computed, inject, markRaw, provide, ref, watch, watchEffect } from 'vue';
import { useI18n } from 'vue-i18n';

import { getAllOrganizationPublicGraphql } from '@/apps/admin/api/graphql/organization-graphql-api';
import { usePermissionStore } from '@/apps/admin/store/permission';
import { useUserMoreInfoStore } from '@/apps/admin/store/usersMoreInfo';
import { convertToOrganizationTreeNodes } from '@/apps/hrm/helpers/utils';
import { findAllMission, getCountAllMissionStatus, searchMissionsGraphql } from '@/apps/mission/api/graphql/mission';
import { exportExcelMissionActivityReport } from '@/apps/mission/api/rest/report';
import { type PersonalInterface } from '@/apps/mission/model/job/job';
import { type MissionInterface, MissionType, type MissionTypeInterface, type SearchMissionInput, StatusMission } from '@/apps/mission/model/mission/mission';
import FormMission from '@/apps/mission/views/mission/component/FormMission.vue';
import MissionsList from '@/apps/mission/views/mission/component/MissionsList.vue';
import { getAllUserMoreInfoGraphql } from '@/common/api/graphql/user-graphql';
import AppIcon from '@/common/components/app/AppIcon.vue';
import { DateTimeFormat, DEFAULT_DIALOG_CONFIG } from '@/common/constants';
import { useGlobalSearchStore } from '@/common/store/search';

import ProgressChart from '../component/chart/ProgressChart.vue';
import ExportDialog from '../component/ExportDialog/ExportDialog.vue';
import ApproverMissionExtensionDeadline from '../component/extensionDeadline/mission/ApproverMissionExtensionDeadline.vue';
import RequestMissionExtensionDeadline from '../component/extensionDeadline/mission/RequestMissionExtensionDeadline.vue';
import MissionListGroupByType from '../component/groupList/mission/MissionListGroupByType.vue';
import MissionKanban from '../component/kanban/mission/MissionKanban.vue';

const { setFields, $reset } = useGlobalSearchStore();
const {
  submit,
  model
} = storeToRefs(useGlobalSearchStore());
const hasPermission = usePermissionStore().hasPermission;
const totalMission = ref<number>(0);
type ViewType = 'list' | 'kanban' | 'group' | 'type';
const viewType = ref<ViewType>('list');
const viewTypeRef = ref<InstanceType<typeof Menu> | null>(null);
const activeTab = ref<number>(0);
const { t } = useI18n();
const searchTerm = inject('searchTerm', ref(''));
const showRow = ref<string>('list');
const tree = ref<TreeNode[]>([]);
const visibleForm = ref<boolean>(false);
const showFormRequestDeadline = ref<boolean>(false);
const showFormApproverDeadline = ref<boolean>(false);
const exportDialogVisible = ref<boolean>(false);
const showChart = ref<boolean>(false);
const store = useUserMoreInfoStore();
store.fetchAllUsers();

const missionsData = ref<MissionInterface[]>([]);
const mission = ref();
const missionOptions = ref<MissionInterface[]>([]);
const personalOption = ref<PersonalInterface[]>([]);
const formId = ref();
const isDetail = ref();
const searchModel = ref<SearchMissionInput>({
  keyword: '',
  fromDate: null,
  toDate: null,
  year: moment().format(DateTimeFormat.ISO_LOCAL_YEAR),
  missionType: null,
  fromBudget: null,
  toBudget: null,
  status: null
});

const missionStatusCount = ref({
  totalAll: 0,
  new: 0,
  unProcessed: 0,
  inProgress: 0,
  completed: 0,
  waitingForApprovalExtensionDeadlineRequest: 0
});

const pageableMissions = ref({
  page: 0,
  size: 50
});

const {
  onResult: onMissionResult,
  load: loadMission,
  loading: loadingMission,
  refetch: refetchMission,
} = searchMissionsGraphql();

function refetchStatusCount() {
  getCountAllMissionStatus().onResult(res => {
    missionStatusCount.value = res.data.getCountAllMissionStatus;
  });
}

watchEffect(() => {
  refetchStatusCount();
});

function fetchData() {
  model.value.year = new Date(new Date().getFullYear(), 0, 1);
  loadMission(undefined, {
    searchModel: {
      ...searchModel.value,
      keyword: searchTerm.value,
    },
    pageable: pageableMissions.value
  });
}
onMissionResult((res) => {
  missionsData.value = res.data.searchMissions.edges;
  totalMission.value = res.data.searchMissions.totalCount;
});

watch(searchTerm, (newValue) => {
  refetchMission({
    searchModel: {
      ...searchModel.value,
      keyword: newValue,
    },
    pageable: pageableMissions.value
  });
});

fetchData();

function handleAddClick() {
  openForm();
}

function openForm(id?: string, checkDetail?: boolean) {
  formId.value = id;
  isDetail.value = checkDetail;
  visibleForm.value = true;
}

function openChart(id?: string) {
  formId.value = id;
  showChart.value = true;
}

function openFormRequestDeadline(id?: string, item?:MissionInterface, checkDetail?: boolean) {
  formId.value = id;
  isDetail.value = checkDetail;
  mission.value = item;
  showFormRequestDeadline.value = true;
}
function openFormApproverDeadline(id?: string, item?:MissionInterface, checkDetail?: boolean) {
  formId.value = id;
  isDetail.value = checkDetail;
  mission.value = item;
  showFormApproverDeadline.value = true;
}
watch(submit, () => {
  searchModel.value = cloneDeep({
    ...model.value,
    fromBudget: model.value.fromBudget ? String(model.value.fromBudget) : null,
    toBudget: model.value.toBudget ? String(model.value.toBudget) : null,
    fromDate: model.value.fromDate
      ? moment(model.value.fromDate).format(DateTimeFormat.ISO_LOCAL_DATE)
      : null,
    toDate: model.value.toDate
      ? moment(model.value.toDate).format(DateTimeFormat.ISO_LOCAL_DATE)
      : null,
    year: model.value.year
      ? moment(model.value.year).format(DateTimeFormat.ISO_LOCAL_YEAR)
      : null,
  });
  refetchMission({
    searchModel: {
      ...searchModel.value,
      keyword: searchTerm.value,
    },
    pageable: pageableMissions.value
  });
});

function changeStatus(event: TabMenuChangeEvent ) {
  if (event.index == 0) {
    $reset();
    searchModel.value = { status: null };
  } else if (event.index == 1) {
    $reset();
    searchModel.value = { status: StatusMission.NEW };
  } else if (event.index == 2) {
    $reset();
    searchModel.value = { status: StatusMission.IN_PROGRESS };
  } else if (event.index == 3) {
    $reset();
    searchModel.value = { status: StatusMission.WAITING_FOR_APPROVAL_EXTENSION_DEADLINE_REQUEST };
  }else if (event.index == 4) {
    $reset();
    searchModel.value = { status: StatusMission.COMPLETED };
  }
  fetchData();
}

function closeDialog() {
  formId.value = null;
  visibleForm.value = false;
  showFormRequestDeadline.value = false;
  showFormApproverDeadline.value = false;
  showChart.value = false;
  refetchStatusCount();
  refetchMission();
}

provide('openForm', openForm);
provide('openFormRequestDeadline', openFormRequestDeadline);
provide('openFormApproverDeadline', openFormApproverDeadline);
provide('openChart', openChart);

const statusOptions = computed(() => {
  let countMap: {
  new?: number;
  totalAll?: number;
  unProcessed?: number;
  inProgress?: number;
  completed?: number;
  waitingForApprovalExtensionDeadlineRequest?: number;
} = {};
  countMap = missionStatusCount.value;
  return[
    {
      label: t('mission.mission.statusOptions.all'),
      value: StatusMission.ALL,
      count: countMap ? countMap.totalAll : undefined,
      color: '#888888'
    },
    {
      label: t('mission.mission.statusOptions.new'),
      value: StatusMission.NEW,
      count: countMap ? countMap.new : undefined,
      color: '#3B82F6'
    },
    {
      label: t('Đang thực hiện'),
      value: StatusMission.IN_PROGRESS,
      count: countMap ? countMap.inProgress : undefined,
      color: '#213C7A'
    },
    {
      label: 'Chờ gia hạn',
      value: StatusMission.WAITING_FOR_APPROVAL_EXTENSION_DEADLINE_REQUEST,
      count: countMap ? countMap.waitingForApprovalExtensionDeadlineRequest : undefined,
      color: '#F59E0B'
    },
    {
      label: t('mission.mission.statusOptions.done'),
      value: StatusMission.COMPLETED,
      count: countMap ? countMap.completed : undefined,
      color: '#22C55E'
    }
  ];
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
      searchModel.value.status = null;
      fetchData();
      viewType.value = 'kanban';
      showRow.value = 'kanban';
    },
  }, {
    label: 'Loại nhiệm vụ',
    key: 'type',
    command: () => {
      viewType.value = 'type';
      showRow.value = 'type';
    },
  }
]);

const typeOptions = ref<MissionTypeInterface[]>([
  {
    id: MissionType.TRONG_TAM,
    name: 'Trọng tâm'
  },
  {
    id: MissionType.THUONG_QUY,
    name: 'Thường quy'
  },
  {
    id: MissionType.PHAT_SINH,
    name: 'Phát sinh'
  }
]);

const statusOptionFilter = ref<MissionTypeInterface[]>([
  {
    id: StatusMission.NEW,
    name: 'Tạo mới'
  },
  
  {
    id: StatusMission.IN_PROGRESS,
    name: 'Đang thực hiện'
  },
  {
    id: StatusMission.WAITING_FOR_APPROVAL_EXTENSION_DEADLINE_REQUEST,
    name: 'Chờ gia hạn'
  },
  {
    id: StatusMission.COMPLETED,
    name: 'Hoàn thành'
  },
]);

const onPage = (event: PageState) => {
  pageableMissions.value.page = event.page;
  pageableMissions.value.size = event.rows;
  fetchData();
};

const exportOptions = computed(() => {
  const fileName = 'Thống kê hoạt động theo nhiệm vụ';
  return [
    {
      label: t('document.exportDoc.exportPdf'),
      fileName: fileName + '.pdf',
      icon: '/images/file-types/pdf-logo.png',
      disabled: true
    },
    {
      label: t('document.exportDoc.exportWord'),
      fileName: fileName + '.docx',
      icon: '/images/file-types/word-logo.png',
      disabled: true
    },
    {
      label: t('document.exportDoc.exportExcel'),
      fileName: fileName + '.xlsx',
      exportFunction: exportExcelMissionActivityReport,
      icon: '/images/file-types/excel-logo.png',
    },
  ];
});

setFields({
  year: {
    label: 'Năm',
    isDatePicker: true,
    col: 6,
    props: {
      view: 'year',
      dateFormat: 'yy',
      defaultDate: new Date(2025, 0, 1),
    },
  },
  missionType: {
    label: 'Loại nhiệm vụ',
    col: 6,
    optionsDropdown: typeOptions,
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
  fromBudget: {
    label: 'Kinh phí từ',
    col: 6,
    component: markRaw(InputNumber),
  },
  toBudget: {
    label: 'Đến',
    col: 6,
    component: markRaw(InputNumber),
  },
  status: {
    label: 'Trạng thái',
    col: 6,
    optionsDropdown: statusOptionFilter,
  },
});

getAllOrganizationPublicGraphql().onResult((res) => {
  tree.value = convertToOrganizationTreeNodes(res.data?.allOrganizationPublic || []);
});

findAllMission().onResult(res => {
  missionOptions.value = get(res, 'data.findAllMission');
});

getAllUserMoreInfoGraphql().onResult(res => {
  personalOption.value = get(res, 'data.getAllUserMoreInfo').map((user: { id: string; fullName: string }) => {
    return {
      id: user.id,
      name: user.fullName
    };
  });;
});
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