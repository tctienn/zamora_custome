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
        {{ activity.activityName }}
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
          :user-ids='[activity.createdBy]'/>
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
              {{ formatCurrency(activity.budget) }}
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
            activity.expectedTime ? moment(activity.expectedTime).format('DD/MM/YYYY') : ""
          }} {{ activity.endTime && activity.endTime ? " - " : "" }} {{
            activity.endTime ? moment(activity.endTime).format('DD/MM/YYYY') : ""
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
  <ActivityHistory
    v-if='showHistoryDialog'
    :id ='activity?.id'
    v-model:visible-dialog='showHistoryDialog'/>
</template>

<script setup lang="ts">

import { useConfirm } from 'primevue/useconfirm';
import { inject, type PropType, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { usePermissionStore } from '@/apps/admin/store/permission';
import { deleteActivityById } from '@/apps/mission/api/graphql/activity-api';
import { formatCurrency } from '@/apps/mission/helpers/currencyFormat';
import type { ActivityInterface } from '@/apps/mission/model/activity/activity';
import AppGroupAvatar from '@/common/components/app/AppGroupAvatar.vue';
import AppIcon from '@/common/components/app/AppIcon.vue';
import ButtonIcon from '@/common/components/custom/ButtonIcon.vue';
import ProgressRing from '@/common/components/custom/ProgressRing.vue';
import { toastError, toastSuccess } from '@/common/helpers/custom-toast-service';
import useMoment from '@/common/helpers/mixins/use-moment';
import type { Event } from '@/common/model/widget/event';

import ActivityHistory from '../../historyDialog/ActivityHistory.vue';

const props = defineProps({
  activity: {
    type: Object as PropType<ActivityInterface>,
    default: {} as ActivityInterface
  }
});

const emits = defineEmits(['refresh']);
const { moment } = useMoment();
const { t } = useI18n();
const menuAction = ref();
const visibleDetail = ref<boolean>(false);
const hasPermission = usePermissionStore().hasPermission;
const showHistoryDialog = ref<boolean>(false);

function showProjectDetail() {
  visibleDetail.value = true;
}

function toggleActionMenu({ event, }: { event: Event }) {
  menuAction.value.toggle(event);
}

const openForm = inject('openForm') as (id?: string, isDetail?: boolean) => void;
const {
  mutate: deleteMutate,
  onDone: deleteOnDone,
  onError: deleteOnError,
} = deleteActivityById();

const confirm = useConfirm();
const menuActionCondition = [
  {
    label: t('common.viewDetail'),
    icon: 'visibility',
    show: hasPermission('/MISSION/MISSION_DUTY/MISSION_DUTY-ACTIVITY/VIEW'),
    command: () => {
      openForm(props.activity.id, true);
    }
  },
  {
    label: t('common.edit'),
    icon: 'edit',
    show: hasPermission('/MISSION/MISSION_DUTY/MISSION_DUTY-ACTIVITY/UPDATE') && props.activity.status === 'NEW',
    command: () => {
      openForm(props.activity.id);
    }
  },
  {
    label: t('common.delete'),
    icon: 'delete',
    show: hasPermission('/MISSION/MISSION_DUTY/MISSION_DUTY-ACTIVITY/DELETE') && props.activity.status === 'NEW',
    command: () => {
      confirm.require({
        message: t('common.confirmDelete', {
          itemType: 'nhiệm vụ',
          itemName: props.activity?.activityName
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
    label: t('Xem lịch sử hoạt động'),
    icon: 'history',
    show: true,
    command: () => {
      showHistoryDialog.value = true;
    }
  }
];

const menuActions = menuActionCondition.filter((obj) => obj.show);

function deleteMission() {
  deleteMutate({ id: props.activity.id });
}

deleteOnDone(() => {
  toastSuccess({ message: t('mission.activity.message.deleteSuccess') });
  emits('refresh');
});

deleteOnError((e) => {
  if(e.graphQLErrors[0].extensions.errorCode == 'DeleteActivity'){
    toastError({ message: t('mission.activity.errors.hasJobs') });
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