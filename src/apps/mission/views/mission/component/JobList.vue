<template>
  <DataTable
    class='h-full surface-overlay'
    :loading='loading'
    :row-hover='true'
    scroll-height='calc(100vh - 12rem)'
    scrollable
    table-style='min-width: 50rem'
    :value='props.jobData'
    @row-click='rowClicked'>
    <Column
      class='p-1 px-3 text-700 text-center'
      :header='t("mission.mission.No")'>
      <template #body='{index}'>
        {{ index + 1 + pageable?.page * pageable?.size }}
      </template>
    </Column>
    <Column
      class='col-2 p-2'
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
          <!-- <Button
            class='custom-outline-btn'
            :label='t(`mission.job.jobTableCol.jobType.${data.jobType}`)'
            outlined
            :severity="data.jobType === 'ON_MISSION' ? 'success' : 'danger'" /> -->
        </div>
      </template>
    </Column>
    <Column
      class='col-2 text-700'
      :header='t("mission.job.jobTableCol.activityEndMission")'
      header-class='float-left'>
      <template #body='{ data }'>
        <div
          class='flex flex-column gap-2'
          :style='{ color: getDeadlineColor(data.processingDeadline) }'>
          <Button
            v-if='data.activityName'
            class='custom-outline-btn'
            :label='t(`${data.activityName}`)'
            outlined
            :severity='"success"'
            @click='openFormActivity(data.activityId)'/>
          <Button
            v-if='data.missionName'
            class='custom-outline-btn'
            :label='t(`${data.missionName}`)'
            outlined
            :severity='"info"' 
            @click='openFormMission(data.missionId)'/>
        </div>
      </template>
    </Column>
    <Column
      class='col-1 p-0 text-700'
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
      class='col-1 p-0 text-700 text-center'
      field='createdTime'
      :header='t("mission.mission.missionTableCol.createDate")'
      :sortable='true'>
      <template #body='{data: { createdTime, processingDeadline }}'>
        <p :style='{ color: getDeadlineColor(processingDeadline) }'>{{ formatDate(createdTime,'DD/MM/YYYY') }}</p>
      </template>
    </Column>
    <Column
      class='col-1 p-0 text-left'
       
      field='createdBy'
      :header='t("mission.mission.missionTableCol.createBy")'>
      <template #body='{data: { createdBy }}'>
        <div class='flex justify-content-center'>
          <AppGroupAvatar
            v-if='createdBy'
            avatar-size='2.5'
            :user-ids='[createdBy]'/>
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
          class='align-items-center flex gap-2'>
          <AppIcon
            v-if="data.jobType === 'ON_MISSION'"
            :class="flagColors[data.flag] ?? 'text-gray-400'"
            fill
            name='flag'
            size='1.5'/>
        </div>
      </template>
    </Column>
    <Column
      class='col-1 px-0 text-center'
      :header='t("mission.mission.common.action1")'
      style='min-width: 5rem'>
      <template #body='{data}'>
        <Button
          icon='pi pi-ellipsis-v'
          rounded
          text
          @click='toggleActionMenu($event, data)'>
        </Button>
      </template>
    </Column>
  </DataTable>
  <Menu
    ref='menuAction'
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
  <JobHistory
    v-if='showHistoryDialog'
    :id ='jobId'
    v-model:visible-dialog='showHistoryDialog'/>
  <JobHistoryDeadline
    v-if='showHistoryDeadlineDialog'
    :id ='jobId'
    v-model:visible-dialog='showHistoryDeadlineDialog'/>
  <DenyDialog
    v-if='showDenyDialog'
    :id='jobId'
    v-model:visible='showDenyDialog'
    @refresh="emits('refresh')"/>
  <Sidebar
    v-model:visible='showDetailActivity'
    :dismissable='false'
    v-bind='{...DEFAULT_DIALOG_CONFIG, style: {"width": "60rem"}}'
    :header="t('mission.activity.common.activity')"
    :modal='true'
    position='right'
    @hide='()=> showDetailActivity =false'>
    <FormActivity
      :id='activityId'
      :is-detail='isDetail'
      @hide-dialog='showDetailActivity =false'/>
  </Sidebar>

  <Sidebar
    v-model:visible='showDetailMission'
    :dismissable='false'
    v-bind='{...DEFAULT_DIALOG_CONFIG, style: {"width": "60rem"}}'
    :header="t('mission.mission.common.mission')"
    :modal='true'
    position='right'
    @hide='()=> showDetailMission =false'>
    <FormMission
      :id='missionId'
      :is-detail= 'isDetail'
      @hide-dialog='showDetailMission =false'/>
  </Sidebar>
</template>

<script setup lang='ts'>

import { cloneDeep } from 'lodash';
import { storeToRefs } from 'pinia';
import Column from 'primevue/column';
import type { DataTableRowClickEvent } from 'primevue/datatable';
import { useConfirm } from 'primevue/useconfirm';
import { computed, inject, type PropType, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { getAllOrganizationPublicGraphql } from '@/apps/admin/api/graphql/organization-graphql-api';
import { usePermissionStore } from '@/apps/admin/store/permission';
import { acceptJob, deleteJob } from '@/apps/mission/api/graphql/job-api';
import { getJobCode, increaseJobStartValue } from '@/apps/mission/api/graphql/parameter-config';
import { createJob } from '@/apps/mission/api/rest/job';
import { getDeadlineColor } from '@/apps/mission/helpers/convert';
import { type JobInterface, type JobType, RoleType } from '@/apps/mission/model/job/job';
import { getAllUserMoreInfoGraphql } from '@/common/api/graphql/user-graphql';
import AppGroupAvatar from '@/common/components/app/AppGroupAvatar.vue';
import { DEFAULT_DIALOG_CONFIG } from '@/common/constants';
import { toastError, toastSuccess } from '@/common/helpers/custom-toast-service';
import { useUserStore } from '@/common/store/user';

import { formatDate } from '../../../../../common/helpers/utils';
import { cloneJob } from '../../../helpers/convert';
import DenyDialog from './dialog/DenyDialog.vue';
import JobHistoryDeadline from './extensionDeadline/job/JobHistoryDeadline.vue';
import FormActivity from './FormActivity.vue';
import FormMission from './FormMission.vue';
import JobHistory from './historyDialog/JobHistory.vue';

const props = defineProps({
  jobData: {
    type: Array as PropType<JobInterface[]>,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  },
  rolesUser: {
    type: Array as PropType<string[]>,
    default: () => []
  },
  pageable: {
    type: Object,
    default: () => ({
      page: 0,
      size: 50 
    })
  }
});

const emits = defineEmits(['refresh']);
const hasPermission = usePermissionStore().hasPermission;
const isRefreshCode = inject('isRefreshCode', ref(0));
const openFormForJobType = inject('openFormForJobType') as (jobType?:JobType, id?: string, isDetail?: boolean) => void;
const openFormResultProcessor = inject('openFormResultProcessor') as (id?: string, checkDetail?: boolean) => void;
const openFormResultApprover = inject('openFormResultApprover') as (id?: string, checkDetail?: boolean) => void;
const openFormResultSignature = inject('openFormResultSignature') as (jobType?:JobType, id?: string, checkDetail?: boolean) => void;
const openFormApproverDeadline = inject('openFormApproverDeadline') as (id?: string, item?:JobInterface, isDetail?: boolean) => void;
const openFormRequestDeadline = inject('openFormRequestDeadline') as (id?: string, item?:JobInterface, isDetail?: boolean) => void;

const { t } = useI18n();
const jobs = ref();
const { user } = storeToRefs(useUserStore());
const selectedJob = ref<JobInterface[]>([]);
const jobType = ref<JobType | undefined>();
const organizationMap = ref<Record<string, string>>({});
const userMap = ref<Record<string, string>>({});
const isEmployeeAccepted = ref();
const isLeaderAccepted = ref();
const jobReportStatus = ref();
const isStatus = ref();
const jobCode = ref<string>('');
const isCreator = ref();
const isDetail = ref<boolean>(true);
const showHistoryDialog = ref<boolean>(false);
const showHistoryDeadlineDialog = ref<boolean>(false);
const showDenyDialog = ref<boolean>(false);
const showDetailActivity = ref<boolean>(false);
const showDetailMission = ref<boolean>(false);
const jobId = ref();
const activityId = ref();
const missionId = ref();
const {
  mutate: deleteMutate,
  onDone: deleteOnDone,
  onError: deleteOnError
} = deleteJob();

const {
  mutate: acceptMutate,
  onDone: acceptOnDone,
  onError: acceptOnError
} = acceptJob();

const { mutate: increaseJobStartValueMutate } = increaseJobStartValue();

function toggleActionMenu(event: Event, data: JobInterface) {
  menuAction.value.toggle(event);
  jobs.value = cloneDeep(data);
  
  jobId.value = data.id;
  isLeaderAccepted.value = data.isLeaderAccepted;
  isEmployeeAccepted.value = data.isEmployeeAccepted;
  jobReportStatus.value = data.jobReportStatus;
  isStatus.value = data.status;
  isCreator.value = data.isCreator;
  selectedJob.value = [jobs.value];
  
  jobType.value = data.jobType as JobType;
}

const menuAction = ref();
const confirm = useConfirm();

const flags = computed(() => {
  const isStaff = props.rolesUser.includes(RoleType.NHAN_VIEN);
  const isChief = props.rolesUser.includes(RoleType.TRUONG_PHONG);
  const isLeader = props.rolesUser.includes(RoleType.LANH_DAO);
  const isCurrentUserAssigner = jobs.value?.assignerList?.some((a:{assignId?: string, assignType?: string}) => {
    return a.assignType === 'PERSONAL' && a.assignId === user.value.id;
  });
  
  return {
    isEmployeeNeedAccept: isStaff && !isEmployeeAccepted.value && isCurrentUserAssigner,
    isLeaderNeedAccept: isChief && (!isLeaderAccepted.value || isCurrentUserAssigner) && (!isCreator.value || selectedJob.value[0]?.isAssignForLeaderYourself),
    isShowApprover: isLeader && jobReportStatus.value === 'LEADER_APPROVED_AND_SEND_TO_GENERAL_LEADER_FOR_SIGNATURE',
    isShowReport: (isStaff || isChief && selectedJob.value[0]?.isAssignForLeaderYourself) && isEmployeeAccepted.value && isCurrentUserAssigner
     && ['LEADER_REJECTED', null, 'GENERAL_LEADER_REJECTED_AND_RETURN_TO_EMPLOYEE'].includes(jobReportStatus.value),
    isShowSignature: isChief 
      && ['WAITING_FOR_LEADER_APPROVAL', 'GENERAL_LEADER_REJECTED_AND_RETURN_TO_LEADER'].includes(jobReportStatus.value),
    isCompleted: isStatus.value === 'COMPLETED',
    isNew: isStatus.value === 'NEW',
    isInProgress: isStatus.value === 'IN_PROGRESS',
    isLeaderCreate: isCreator.value,
    hasView: hasPermission('/MISSION/MISSION_DUTY/MISSION_DUTY-JOB/VIEW'),
    hasEdit: hasPermission('/MISSION/MISSION_DUTY/MISSION_DUTY-JOB/UPDATE'),
    hasDelete: hasPermission('/MISSION/MISSION_DUTY/MISSION_DUTY-JOB/DELETE'),
    isChief,
    isLeader,
    isStaff
  };
});

const menuActions = computed(() => {
  const f = flags.value;
  return [
    {
      label: t('mission.job.reception'),
      icon: 'inbox',
      show: (f.isEmployeeNeedAccept || f.isLeaderNeedAccept) && isStatus.value === 'WAITING_FOR_ACCEPT',
      command: () => {
        confirm.require({
          message: t('mission.job.confirmReception', {
            itemType: t('mission.job.common.job'),
            itemName: selectedJob.value[0].jobName
          }),
          acceptLabel: t('mission.job.reception'),
          acceptClass: 'p-button-success',
          header: t('common.confirm'),
          icon: 'pi pi-inbox',
          accept: () => {
            handleReceptionJob();
          }
        });

      }
    },
    {
      label: t('mission.job.reject'),
      icon: 'cancel',
      show: (f.isEmployeeNeedAccept || f.isLeaderNeedAccept) && isStatus.value === 'WAITING_FOR_ACCEPT',
      command: () => {
        confirm.require({
          message: t('mission.job.confirmReject', {
            itemType: t('mission.job.common.job'),
            itemName: selectedJob.value[0].jobName
          }),
          acceptLabel: t('mission.job.reject'),
          acceptClass: 'p-button-danger',
          header: t('mission.job.reject'),
          icon: 'pi pi-times-circle',
          accept: () => {
            handleRejectJob();
          }
        });

      }
    },

    {
      label: t('mission.job.report'),
      icon: 'report',
      show: f.isShowReport,
      command: () => {
        openFormResultProcessor(selectedJob.value[0].id);
      }
    },
    {
      label: t('common.viewDetail'),
      icon: 'visibility',
      show: f.hasView,
      command: () => {
        openFormForJobType(jobType.value, selectedJob.value[0].id, true);
      }
    },
    {
      label: t('common.edit'),
      icon: 'edit',
      show: f.hasEdit && (isLeaderAccepted.value || f.isLeaderCreate) && !f.isCompleted,
      command: () => {
        openFormForJobType(jobType.value, selectedJob.value[0].id);
      }
    },
    {
      label: t('Nhân bản công việc'),
      icon: 'content_copy',
      show: true,
      command: () => {
        handleCloneJob();
      }
    },
    {
      label: selectedJob.value[0]?.isJobNeedToApproveByGeneralLeader ? t('mission.job.signature') : t('Phê duyệt'),
      icon: 'report',
      show: f.isShowSignature && !f.isCompleted,
      command: () => {
        openFormResultSignature(jobType.value, selectedJob.value[0].id);
      }
    },
    {
      label: t('Phê duyệt'),
      icon: 'report',
      show: f.isShowApprover,
      command: () => {
        openFormResultApprover(selectedJob.value[0].id);
      }
    },
    
    {
      label: t('common.delete'),
      icon: 'delete',
      show: f.hasDelete && f.isLeaderCreate && f.isNew,
      command: () => {
        confirm.require({
          message: t('common.confirmDelete', {
            itemType: t('mission.job.common.job'),
            itemName: selectedJob.value[0].jobName
          }),
          acceptLabel: t('common.delete'),
          acceptClass: 'p-button-danger',
          header: t('common.confirm'),
          icon: 'pi pi-exclamation-triangle',
          accept: () => {
            handleDeleteJob();
          }
        });
      }
    },
    {
      label: t('Gia hạn thời gian'),
      icon: 'history',
      show: f.isChief && f.isInProgress,
      command: () => {
        openFormRequestDeadline(selectedJob.value[0].id, jobs.value);
      }
    },
    {
      label: t('Duyệt gia hạn thời gian'),
      icon: 'edit_calendar',
      show: selectedJob.value[0]?.youHasExtensionDeadlineRequest,
      command: () => {
        openFormApproverDeadline(selectedJob.value[0].id, jobs.value);
      }
    },
    {
      label: t('Xem lịch sử hoạt động'),
      icon: 'history',
      show: true,
      command: () => {
        showHistoryDialog.value = true;
      }
    },
    {
      label: t('Xem lịch sử gia hạn'),
      icon: 'history',
      show: f.isStaff || !f.isNew,
      command: () => {
        showHistoryDeadlineDialog.value = true;
      }
    }
  ].filter((item) => item.show);
});

function handleDeleteJob() {
  deleteMutate({ id: selectedJob.value[0].id });
}

function handleReceptionJob(){
  acceptMutate({ id: selectedJob.value[0].id });
}

function handleRejectJob(){
  showDenyDialog.value = true;
}

watch(isRefreshCode, ()=> {
  getJobCode().refetch();
});

async function handleCloneJob() {
  try {
    await createJob(cloneJob(selectedJob.value[0], jobType.value, jobCode.value));
    toastSuccess({ message: t('Nhân bản công việc thành công') });
    emits('refresh');
    increaseJobStartValueMutate({}).then(() => getJobCode().refetch());
  } catch (err) {
    toastError({ message: t('mission.mission.errors.errors') });
  }
}

deleteOnDone(() => {
  toastSuccess({ message: t('Xóa công việc thành công') });
  emits('refresh');
});

deleteOnError(() => {
  toastError({ message: t('mission.mission.errors.errors') });
});

acceptOnError((err) => {
  if(err.graphQLErrors?.[0]?.extensions?.errorCode == 'AssignNotFound'){
    toastError({ message: 'Bạn không được gán quyền là người xử lý chính' });
  } else{
    toastError({ message: t('mission.mission.errors.errors') });
  }
});

acceptOnDone(() => {
  toastSuccess({ message: t('Tiếp nhận công việc thành công') });
  emits('refresh');
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

const visibleDetail = ref<boolean>(false);

function rowClicked(event: DataTableRowClickEvent) {
  selectedJob.value = [event.data];
  visibleDetail.value = true;
}

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

getJobCode().onResult((res) => {
  jobCode.value = res.data.getJobCode;
});

function getMenuIconClass(icon?: string) {
  if (icon === 'delete') {
    return 'text-red-500';
  }
  return 'text-color'; 
}

const flagColors: Record<string, string> = {
  RED: 'text-red-500',
  YELLOW: 'text-yellow-500',
  GREEN: 'text-green-500'
};

function openFormActivity(id?:string){
  activityId.value = id;
  showDetailActivity.value = true;
}

function openFormMission(id?:string){
  missionId.value = id;
  showDetailMission.value = true;
}
</script>

<style scoped>
:deep(.float-left .p-column-header-content) {
  align-items: flex-start !important;
  justify-content: flex-start !important;
}

.custom-outline-btn {
  font-size: 0.95rem;
  padding: 0.25rem 0.75rem;
}
</style>
