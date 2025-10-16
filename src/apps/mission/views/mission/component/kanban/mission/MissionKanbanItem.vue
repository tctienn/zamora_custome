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
        {{ mission.node?.name }}
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
          :user-ids='[mission?.node?.createdBy]'/>
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
                v-tooltip='"Trao đổi"'
                name='chat_bubble'
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
              {{ formatCurrency(mission.node?.budget) }}
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
            mission?.node?.startDate ? moment(mission?.node?.startDate).format('DD/MM/YYYY') : ""
          }} {{ mission?.node?.endDate && mission?.node?.endDate ? " - " : "" }} {{
            mission?.node?.endDate ? moment(mission?.node?.endDate).format('DD/MM/YYYY') : ""
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

  <MissionHistory
    v-if='showHistoryDialog'
    :id ='mission?.node?.id'
    v-model:visible-dialog='showHistoryDialog'/>
  <MissionHistoryDeadline
    v-if='showHistoryDeadlineDialog'
    :id ='mission?.node?.id'
    v-model:visible-dialog='showHistoryDeadlineDialog'/>
</template>

<script setup lang="ts">

import { storeToRefs } from 'pinia';
import { useConfirm } from 'primevue/useconfirm';
import { computed, inject, type PropType, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { usePermissionStore } from '@/apps/admin/store/permission';
import { useUserMoreInfoStore } from '@/apps/admin/store/usersMoreInfo';
import { deleteMissionById } from '@/apps/mission/api/graphql/mission';
import { formatCurrency } from '@/apps/mission/helpers/currencyFormat';
import { RoleType } from '@/apps/mission/model/job/job';
import type { MissionInterface } from '@/apps/mission/model/mission/mission';
import AppGroupAvatar from '@/common/components/app/AppGroupAvatar.vue';
import AppIcon from '@/common/components/app/AppIcon.vue';
import ButtonIcon from '@/common/components/custom/ButtonIcon.vue';
import ProgressRing from '@/common/components/custom/ProgressRing.vue';
import { toastError, toastSuccess } from '@/common/helpers/custom-toast-service';
import useMoment from '@/common/helpers/mixins/use-moment';
import type { Event } from '@/common/model/widget/event';
import { useUserStore } from '@/common/store/user';

import MissionHistoryDeadline from '../../extensionDeadline/mission/MissionHistoryDeadline.vue';
import MissionHistory from '../../historyDialog/MissionHistory.vue';

const props = defineProps({
  mission: {
    type: Object as PropType<MissionInterface>,
    default: {} as MissionInterface
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
const showHistoryDialog = ref<boolean>(false);
const showHistoryDeadlineDialog = ref<boolean>(false);
const visibleDetail = ref<boolean>(false);
const hasPermission = usePermissionStore().hasPermission;

function showProjectDetail() {
  visibleDetail.value = true;
}

function toggleActionMenu({ event, }: { event: Event }) {
  menuAction.value.toggle(event);
}

const openForm = inject('openForm') as (id?: string, isDetail?: boolean) => void;
const openFormApproverDeadline = inject('openFormApproverDeadline') as (id?: string, item?:MissionInterface, isDetail?: boolean) => void;
const openFormRequestDeadline = inject('openFormRequestDeadline') as (id?: string, item?:MissionInterface, isDetail?: boolean) => void;
const openChart = inject('openChart') as (id?: string) => void;
const {
  mutate: deleteMutate,
  onDone: deleteOnDone,
  onError: deleteOnError,
} = deleteMissionById();

const confirm = useConfirm();
const flags = computed(() => {
  const isStaff = rolesUser.value.includes(RoleType.NHAN_VIEN);
  const isChief = rolesUser.value.includes(RoleType.TRUONG_PHONG);
  const isLeader = rolesUser.value.includes(RoleType.LANH_DAO);

  return {
    isChief,
    isStaff,
    isLeader,
    hasView: hasPermission('/MISSION/MISSION_DUTY/MISSION_DUTY-MANAGEMENT/VIEW'),
    hasEdit: hasPermission('/MISSION/MISSION_DUTY/MISSION_DUTY-MANAGEMENT/UPDATE'),
    hasDelete: hasPermission('/MISSION/MISSION_DUTY/MISSION_DUTY-MANAGEMENT/DELETE')
  };
});
const menuActions = computed(()=> {
  const f = flags.value;
  return [
    {
      label: t('common.viewDetail'),
      icon: 'visibility',
      show: f.hasView,
      command: () => {
        openForm(props.mission?.node?.id, true);
      }
    },
    {
      label: t('common.edit'),
      icon: 'edit',
      show: f.hasEdit && ['NEW', 'IN_PROGRESS'].includes(props.mission.node.status),
      command: () => {
        openForm(props.mission?.node?.id);
      }
    },
    {
      label: t('common.delete'),
      icon: 'delete',
      show: f.hasDelete && props.mission.node.status === 'NEW',
      command: () => {
        confirm.require({
          message: t('common.confirmDelete', {
            itemType: 'nhiệm vụ',
            itemName: props.mission?.node?.name
          }),
          acceptLabel: t('common.delete'),
          acceptClass: 'p-button-danger',
          header: t('common.confirm'),
          icon: 'pi pi-exclamation-triangle',
          accept: () => {
            deleteMission();
          }
        });

      }
    },
    {
      label: t('Gia hạn thời gian'),
      icon: 'history',
      show: f.isChief && props.mission.node.status === 'IN_PROGRESS',
      command: () => {
        openFormRequestDeadline(props.mission?.node?.id, props.mission.node);
      }
    },
    {
      label: t('Duyệt gia hạn thời gian'),
      icon: 'edit_calendar',
      show: props.mission?.node?.youHasExtensionDeadlineRequest,
      command: () => {
        openFormApproverDeadline(props.mission?.node?.id, props.mission.node);
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
      show: f.isStaff || props.mission.node.status !== 'NEW',
      command: () => {
        showHistoryDeadlineDialog.value = true;
      }
    },
    {
      label: t('Xem tiến độ'),
      icon: 'insert_chart',
      show: true,
      command: () => {
        openChart(props.mission.node.id);
      }
    },
  ].filter((obj) => obj.show);
});

function deleteMission() {
  deleteMutate({ id: props.mission?.node?.id });
}

deleteOnDone(() => {
  toastSuccess({ message: t('Xoá nhiệm vụ thành công') });
  emits('refresh');
});

deleteOnError((e) => {
  if(e.graphQLErrors[0].extensions.errorCode == 'DeleteMission'){
    toastError({ message: t('mission.mission.errors.hasActivities') });
  }else{
    toastError({ message: t('mission.mission.errors.errors') });
  }
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