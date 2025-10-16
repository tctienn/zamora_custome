<template>
  <DataTable
    v-model:expandedRowGroups='expandedRowGroups'
    class='h-full surface-overlay'
    expandable-row-groups
    group-rows-by='activityId'
    :loading='loading'
    row-group-mode='subheader'
    :row-hover='true'
    scroll-height='calc(100vh - 12rem)'
    scrollable
    table-style='min-width: 50rem'
    :value='displayedJobData'
    @row-click='rowClicked'>
    <template #groupheader='{data}'>
      <span
        class='font-bold line-height-3 ml-2 vertical-align-middle'
        style='color: #0F6CBD; margin-bottom: 20px;'>{{ data.activityName }}</span>
    </template>
    <template #empty>
      <span class='block font-bold text-600 text-center'>{{
        t('common.emptyRecords', { itemType: 'công việc' })
      }}</span>
    </template>
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
          <Button
            class='custom-outline-btn'
            :label='t(`mission.job.jobTableCol.jobType.${data.jobType}`)'
            outlined
            :severity="data.jobType === 'ON_MISSION' ? 'success' : 'danger'" />
        </div>
      </template>
    </Column>
    <Column
      class='col-2 text-700'
      :header='t("mission.job.jobTableCol.activityEndMission")'
      header-class='float-left'>
      <template #body='{ data: { missionName, activityName, processingDeadline } }'>
        <div
          class='flex flex-column'
          :style='{ color: getDeadlineColor(processingDeadline) }'>
          <p class='mb-0'>{{ activityName }}</p>
          <p>{{ missionName }}</p>
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
      <template #body='{ data: {flag} }'>
        <div
          class='align-items-center flex gap-2'>
          <AppIcon
            :class="flagColors[flag] ?? 'text-gray-400'"
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
  <DenyDialog
    v-if='showDenyDialog'
    :id='jobId'
    v-model:visible='showDenyDialog'
    @refresh="emits('refresh')"/>
</template>

<script setup lang='ts'>

import { cloneDeep } from 'lodash';
import Column from 'primevue/column';
import type { DataTableRowClickEvent } from 'primevue/datatable';
import { useConfirm } from 'primevue/useconfirm';
import { computed, inject, onMounted, type PropType, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { getAllOrganizationPublicGraphql } from '@/apps/admin/api/graphql/organization-graphql-api';
import { usePermissionStore } from '@/apps/admin/store/permission';
import { acceptJob, deleteJob } from '@/apps/mission/api/graphql/job-api';
import { getDeadlineColor } from '@/apps/mission/helpers/convert';
import { type JobInterface, type JobType, RoleType } from '@/apps/mission/model/job/job';
import { getAllUserMoreInfoGraphql } from '@/common/api/graphql/user-graphql';
import AppGroupAvatar from '@/common/components/app/AppGroupAvatar.vue';
import { toastError, toastSuccess } from '@/common/helpers/custom-toast-service';
import { formatDate } from '@/common/helpers/utils';

import DenyDialog from '../../dialog/DenyDialog.vue';
import JobHistory from '../../historyDialog/JobHistory.vue';
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
const openFormForJobType = inject('openFormForJobType') as (jobType?:JobType, id?: string, isDetail?: boolean) => void;
const openFormResultProcessor = inject('openFormResultProcessor') as (id?: string, checkDetail?: boolean) => void;
const openFormResultApprover = inject('openFormResultApprover') as (id?: string, checkDetail?: boolean) => void;
const openFormResultSignature = inject('openFormResultSignature') as (jobType?:JobType, id?: string, checkDetail?: boolean) => void;

const { t } = useI18n();
const jobs = ref();
const selectedJob = ref<JobInterface[]>([]);
const jobType = ref<JobType | undefined>();
const organizationMap = ref<Record<string, string>>({});
const userMap = ref<Record<string, string>>({});
const isEmployeeAccepted = ref();
const isLeaderAccepted = ref();
const jobReportStatus = ref();
const isStatus = ref();
const isCreator = ref();
const showHistoryDialog = ref<boolean>(false);
const showDenyDialog = ref<boolean>(false);
const jobId = ref();
const expandedRowGroups = ref();
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

  return {
    isEmployeeNeedAccept: isStaff && !isEmployeeAccepted.value,
    isLeaderNeedAccept: isChief && !isCreator.value && !isLeaderAccepted.value,
    isShowApprover: isLeader && jobReportStatus.value === 'LEADER_APPROVED_AND_SEND_TO_GENERAL_LEADER_FOR_SIGNATURE',
    isShowReport: isStaff && isEmployeeAccepted.value
     && ['LEADER_REJECTED', null, 'GENERAL_LEADER_REJECTED_AND_RETURN_TO_EMPLOYEE'].includes(jobReportStatus.value),
    isShowSignature: isChief 
      && ['WAITING_FOR_LEADER_APPROVAL', 'GENERAL_LEADER_REJECTED_AND_RETURN_TO_LEADER'].includes(jobReportStatus.value),
    isCompleted: isStatus.value === 'COMPLETED',
    isNew: isStatus.value === 'NEW',
    isLeaderCreate: isCreator.value,
    hasView: hasPermission('/MISSION/MISSION_DUTY/MISSION_DUTY-JOB/VIEW'),
    hasEdit: hasPermission('/MISSION/MISSION_DUTY/MISSION_DUTY-JOB/UPDATE'),
    hasDelete: hasPermission('/MISSION/MISSION_DUTY/MISSION_DUTY-JOB/DELETE'),
  };
});

const menuActions = computed(() => {
  const f = flags.value;
  return [
    {
      label: t('mission.job.reception'),
      icon: 'inbox',
      show: f.isEmployeeNeedAccept || f.isLeaderNeedAccept,
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
      show: f.isEmployeeNeedAccept || f.isLeaderNeedAccept,
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
      label: t('mission.job.report'),
      icon: 'report',
      show: f.isShowReport,
      command: () => {
        openFormResultProcessor(selectedJob.value[0].id);
      }
    },
    {
      label: t('mission.job.signature'),
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
      label: t('Xem lịch sử hoạt động'),
      icon: 'history',
      show: true,
      command: () => {
        showHistoryDialog.value = true;
      }
    }
  ].filter((item) => item.show);
});

function handleDeleteJob() {
  deleteMutate({ id: selectedJob.value[0].id });
}

function handleReceptionJob(){
  console.log(selectedJob.value[0]);
  
  acceptMutate({ id: selectedJob.value[0].id });
}

function handleRejectJob(){
  showDenyDialog.value = true;
}

deleteOnDone(() => {
  toastSuccess({ message: t('Xóa công việc thành công') });
  emits('refresh');
});

deleteOnError(() => {
  toastError({ message: t('mission.mission.errors.errors') });
});

acceptOnError(() => {
  toastError({ message: t('mission.mission.errors.errors') });
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

const displayedJobData = computed(() =>
  [...props.jobData].sort((a, b) => a.activityId?.localeCompare(b.activityId) || 0)
);

const expandAllGroups = () => {
  const uniqueCampaignIds = [...new Set(props.jobData.map(item => item.activityId))];
  expandedRowGroups.value = uniqueCampaignIds;
};

onMounted(() => {
  expandAllGroups();
});
</script>

<style scoped>
:deep(.float-left .p-column-header-content) {
  align-items: flex-start !important;
  justify-content: flex-start !important;
}
</style>
