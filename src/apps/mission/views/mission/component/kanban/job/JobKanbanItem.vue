<template>
  <div
    class='flex flex-column gap-3 kanban-item p-3 transition-duration-200 w-full'
    :draggable='true'
    style='border-radius: 2px'>
    <div class='align-items-center flex justify-content-between'>
      <div
        class='font-bold hover:text-blue-700'
        @click='showProjectDetail'>
        <AppIcon
          class='text-yellow-500'
          fill
          name='kid_star'
          rounded
          size='1'
          text/>
        {{ job.jobName }}
      </div>
      <ButtonIcon
        class='align-self-start flex-shrink-0 p-1'
        icon='more_vert'
        rounded
        text
        @click='toggleActionMenu({event : $event})'/>
    </div>
    <div
      v-if='false'
      style='min-height: 3rem'>
    </div>
    <div class='align-items-center flex justify-content-between'>
      <div class='flex gap-2'>
        <AppGroupAvatar
          avatar-size='2.5'
          :user-ids='[job.createdBy]'/>
        <AppGroupAvatar
          avatar-size='2.5'
          :user-ids='job?.assignerList?.map((item) => item.assignId)'
          :users-highlight='job?.assignerList?.map((item) => item.assignId)'/>
      </div>
      <div>
        <ProgressRing :progress='0'/>
      </div>
    </div>
    <div class='flex justify-content-between'>
      <div>
        <div class='flex justify-content-between'>
          <div class='flex gap-2'>
            <div class='align-items-center flex'>
              <AppIcon
                v-tooltip='"File đính kèm"'
                name='attach_file'
                size='1.5'
                text/>
            </div>
            <div class='align-items-center flex gap-1'>
              <AppIcon
                v-tooltip='"Công việc"'
                name='checklist'
                size='1.5'
                text/>
            </div>
            <div class='align-items-center flex gap-1'>
              <AppIcon
                v-tooltip='"Kinh phí"'
                name='account_balance_wallet'
                size='1.5'
                text />
              {{ formatCurrency(job.budget) }}
            </div>
          </div>
        </div>
      </div>
      <div class='align-items-center flex ml-2 text-right'>
        <AppIcon
          name='schedule'
          size='1.5'
          text/>

        <span
          class='flex'
          style='font-size: 10px'>
          {{
            job.createdTime ? moment(job.createdTime).format('DD/MM/YYYY') : ""
          }} {{ job.processingDeadline && job.processingDeadline ? " - " : "" }} {{
            job.processingDeadline ? moment(job.processingDeadline).format('DD/MM/YYYY') : ""
          }}
        </span>
      </div>
    </div>

  </div>
  <Menu
    ref='menuAction'
    :model='menuActions'
    :popup='true'>
    <template #item='{item: {icon, label}}'>
      <MenuItem
        :class-icon="['mt-0 text-sm', icon === 'delete' ? 'text-red-300' : '']"
        :class-item="['mt-1', icon === 'delete' ? 'text-red-300' : '']"
        :icon='icon'
        :label='label'/>
    </template>
  </Menu>
  <JobHistory
    v-if='showHistoryDialog'
    :id ='job.id'
    v-model:visible-dialog='showHistoryDialog'/>
  <DenyDialog
    v-if='showDenyDialog'
    :id='job.id'
    v-model:visible='showDenyDialog'
    @refresh="emits('refresh')"/>
</template>

<script setup lang="ts">

import { storeToRefs } from 'pinia';
import { useConfirm } from 'primevue/useconfirm';
import { inject, type PropType, ref, watch } from 'vue';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

import { usePermissionStore } from '@/apps/admin/store/permission';
import { useUserMoreInfoStore } from '@/apps/admin/store/usersMoreInfo';
import { acceptJob, deleteJob } from '@/apps/mission/api/graphql/job-api';
import { formatCurrency } from '@/apps/mission/helpers/currencyFormat';
import { type JobInterface, type JobType, RoleType } from '@/apps/mission/model/job/job';
import AppGroupAvatar from '@/common/components/app/AppGroupAvatar.vue';
import AppIcon from '@/common/components/app/AppIcon.vue';
import ButtonIcon from '@/common/components/custom/ButtonIcon.vue';
import ProgressRing from '@/common/components/custom/ProgressRing.vue';
import { toastError, toastSuccess } from '@/common/helpers/custom-toast-service';
import useMoment from '@/common/helpers/mixins/use-moment';
import type { Event } from '@/common/model/widget/event';
import { useUserStore } from '@/common/store/user';

import DenyDialog from '../../dialog/DenyDialog.vue';
import JobHistory from '../../historyDialog/JobHistory.vue';
const props = defineProps({
  job: {
    type: Object as PropType<JobInterface>,
    default: {} as JobInterface
  }
});
const emits = defineEmits(['refresh']);
const { user } = storeToRefs(useUserStore());
const store = useUserMoreInfoStore();
const { usersMoreInfo } = storeToRefs(store);
const currentUserInfo = computed(() => {
  return user.value?.id ? usersMoreInfo.value[user.value.id] : undefined;
});

const rolesUser = computed(() => currentUserInfo.value?.roles || []);

const { moment } = useMoment();
const { t } = useI18n();
const menuAction = ref();
const visibleDetail = ref<boolean>(false);
const showHistoryDialog = ref<boolean>(false);
const showDenyDialog = ref<boolean>(false);
const hasPermission = usePermissionStore().hasPermission;

function showProjectDetail() {
  visibleDetail.value = true;
}

function toggleActionMenu({ event, }: { event: Event }) {
  menuAction.value.toggle(event);
}

const openFormForJobType = inject('openFormForJobType') as (jobType?:JobType, id?: string, isDetail?: boolean) => void;
const openFormResultProcessor = inject('openFormResultProcessor') as (id?: string, checkDetail?: boolean) => void;
const openFormResultApprover = inject('openFormResultApprover') as (id?: string, checkDetail?: boolean) => void;
const openFormResultSignature = inject('openFormResultSignature') as (jobType?:JobType, id?: string, checkDetail?: boolean) => void;
const {
  mutate: deleteMutate,
  onDone: deleteOnDone,
  onError: deleteOnError,
} = deleteJob();

const {
  mutate: acceptMutate,
  onDone: acceptOnDone,
  onError: acceptOnError
} = acceptJob();

const confirm = useConfirm();

const flags = computed(() => {
  const isStaff = rolesUser.value.includes(RoleType.NHAN_VIEN);
  const isChief = rolesUser.value.includes(RoleType.TRUONG_PHONG);
  const isLeader = rolesUser.value.includes(RoleType.LANH_DAO);

  return {
    isEmployeeNeedAccept: isStaff && !props.job.isEmployeeAccepted,
    isLeaderNeedAccept: isChief && !props.job.isCreator && !props.job.isLeaderAccepted,
    isShowApprover: isLeader && props.job.jobReportStatus === 'LEADER_APPROVED_AND_SEND_TO_GENERAL_LEADER_FOR_SIGNATURE',
    isShowReport: isStaff && props.job.isEmployeeAccepted
     && ['LEADER_REJECTED', null, 'GENERAL_LEADER_REJECTED_AND_RETURN_TO_EMPLOYEE'].includes(props.job.jobReportStatus),
    isShowSignature: isChief 
      && ['WAITING_FOR_LEADER_APPROVAL', 'GENERAL_LEADER_REJECTED_AND_RETURN_TO_LEADER'].includes(props.job.jobReportStatus ?? ''),
    isCompleted: props.job.status === 'COMPLETED',
    isNew: props.job.status === 'NEW',
    isLeaderCreate: props.job.isCreator,
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
            itemName: props.job?.jobName
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
            itemName: props.job?.jobName
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
        openFormForJobType(props.job.jobType as JobType, props.job.id, true);
      }
    },
    {
      label: t('common.edit'),
      icon: 'edit',
      show: f.hasEdit && (props.job.isLeaderAccepted || f.isLeaderCreate) && !f.isCompleted,
      command: () => {
        openFormForJobType(props.job.jobType as JobType, props.job.id);
      }
    },
    {
      label: t('mission.job.report'),
      icon: 'report',
      show: f.isShowReport,
      command: () => {
        openFormResultProcessor(props.job.id);
      }
    },
    {
      label: t('mission.job.signature'),
      icon: 'report',
      show: f.isShowSignature && !f.isCompleted,
      command: () => {
        openFormResultSignature(props.job.jobType as JobType, props.job.id);
      }
    },
    {
      label: t('Phê duyệt'),
      icon: 'report',
      show: f.isShowApprover,
      command: () => {
        openFormResultApprover(props.job.id);
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
            itemName: props.job?.jobName
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
  deleteMutate({ id: props.job.id });
}

function handleReceptionJob(){
  acceptMutate({ id: props.job.id });
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

watch(visibleDetail, (value) => {
  if (!value) {
    emits('refresh');
  }
});

</script>

<style lang="scss" scoped>
.kanban-item {
  background-color: var(--surface-a);
  touch-action: pan-x;
  cursor: pointer;
  user-select: none;

  &:hover {
    background-color: var(--surface-300);
  }
}
</style>