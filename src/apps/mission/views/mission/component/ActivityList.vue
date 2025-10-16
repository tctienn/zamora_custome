<template>
  <DataTable
    v-model:expandedRows='expandedRows'
    class='h-full surface-overlay'
    :loading='loading'
    scroll-height='calc(100vh - 12rem)'
    scrollable
    table-style='min-width: 50rem'
    :value='displayedActivityData'
    @row-click='rowClicked'>
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
      class='px-2 text-700 text-center'
      :header='t("mission.mission.No")'
      style='width: 2%'>
      <template #body='{index}'>
        {{ index + 1 + (pageable?.page || 0) * (pageable?.size || 0) }}
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
          @click='openForm(data.id, true)'> 
          <p class='font-medium m-0'>{{ data.activityName }}</p>
          <p>{{ data.activityCode }}</p></div>
      </template>
    </Column>
    <Column
      class='p-2 text-700 text-left'
      field='missionName'
      :header='t("mission.mission.missionTableCol.name")'
      header-class='float-left'
      style='width: 12%'>
      <template #body='{ data }'>
        <div
          class='cursor-pointer'
          @click='openFormMission(data.missionId)'> 
          <p class='m-0'>{{ data.missionName }}</p>
        </div>
      </template>
    </Column>
    <Column
      class='col-1 p-0 text-700 text-center'
      field='expectedTime'
      :header='t("mission.activity.activityTableCol.expectedDate")'
      :sortable='true'
      style='width: 11%'>
      <template #body='{data: {expectedTime}}'>
        {{ formatDate(expectedTime,'DD/MM/YYYY') }}
      </template>
    </Column>
    <Column
      class='col-1 p-0 text-700 text-center'
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
      <template #body='{data:{hostUnitName}}'>
        {{ hostUnitName || 'Không xác định' }}
      </template>
    </Column>
    <Column
      class='col-2 py-2 text-700'
      field='coordinationUnitName'
      :header='t("mission.activity.activityTableCol.combinationUnit")'
      header-class='float-left'>
      <template #body='{data: { coordinationUnitNames }}'>
        <div
          v-for='(name, index) in coordinationUnitNames'
          :key='index'
          class='mb-1'>
          <p>{{ name }}</p>
        </div>
      </template>
    </Column>
    <Column
      class='p-1 text-700'
      field='budget'
      :header='t("mission.activity.activityTableCol.budget")'
      header-class='float-left'
      style='width: 6%'>
      <template #body='{data: {budget}}'>
        {{ formatCurrency(budget) }}
      </template>
    </Column>
    <Column
      class='p-0 text-left'
      field='createdBy'
      :header='t("mission.mission.missionTableCol.createBy")'
      style='width: 6%;'>
      <template #body='{data: {createdBy}}'>
        <div class='flex justify-content-center'>
          <AppGroupAvatar
            v-if='createdBy'
            avatar-size='2.5'
            :user-ids='[createdBy]'/>
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
    <Column
      class='p-1 text-center'
      style='width: 3%'>
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
          :class="item.icon === 'delete' ? 'text-red-500' : 'text-color'"
          :name='item.icon'
          size='1.5'/>
        <span :class="item.icon === 'delete' ? 'text-red-500' : 'text-color'">{{ item.label }}</span>
      </div>
    </template>
  </Menu>
  <ActivityHistory
    v-if='showHistoryDialog'
    :id ='activityId'
    v-model:visible-dialog='showHistoryDialog'/>
  <ActivityHistoryDeadline
    v-if='showHistoryDeadlineDialog'
    :id ='activityId'
    v-model:visible-dialog='showHistoryDeadlineDialog'/>
  <RejectActivityDialog
    v-if='showRejectDialog'
    :id='activityId'
    v-model:visible='showRejectDialog'
    @refresh="emits('refresh')"/>
</template>

<script setup lang='ts'>

import { cloneDeep } from 'lodash';
import { storeToRefs } from 'pinia';
import Column from 'primevue/column';
import type { DataTableRowClickEvent } from 'primevue/datatable';
import type { TreeNode } from 'primevue/treenode';
import { useConfirm } from 'primevue/useconfirm';
import { computed, inject, type PropType, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { getAllOrganizationPublicGraphql } from '@/apps/admin/api/graphql/organization-graphql-api';
import { usePermissionStore } from '@/apps/admin/store/permission';
import { useUserMoreInfoStore } from '@/apps/admin/store/usersMoreInfo';
import { convertToOrganizationTreeNodes } from '@/apps/hrm/helpers/utils';
import { deleteActivityById, generalLeaderSubmitActivity } from '@/apps/mission/api/graphql/activity-api';
import { formatCurrency } from '@/apps/mission/helpers/currencyFormat';
import type { ActivityInterface } from '@/apps/mission/model/activity/activity';
import { RoleType } from '@/apps/mission/model/job/job';
import AppGroupAvatar from '@/common/components/app/AppGroupAvatar.vue';
import { toastError, toastSuccess } from '@/common/helpers/custom-toast-service';
import { useUserStore } from '@/common/store/user';

import { formatDate } from '../../../../../common/helpers/utils';
import RejectActivityDialog from './dialog/RejectActivityDialog.vue';
import ActivityHistoryDeadline from './extensionDeadline/activity/ActivityHistoryDeadline.vue';
import ActivityJobsTable from './groupList/job/ActivityJobsTable.vue';
import ActivityHistory from './historyDialog/ActivityHistory.vue';

const props = defineProps({
  activityData: {
    type: Array as PropType<ActivityInterface[]>,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
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
const { user } = storeToRefs(useUserStore());
const store = useUserMoreInfoStore();
const { usersMoreInfo } = storeToRefs(store);
const currentUserInfo = computed(() => {
  return user.value?.id ? usersMoreInfo.value[user.value.id] : undefined;
});

const rolesUser = computed(() => currentUserInfo.value?.roles || []);
const hasPermission = usePermissionStore().hasPermission;
const openForm = inject('openForm') as (id?: string, isDetail?: boolean) => void;
const openFormMission = inject('openFormMission') as (id?: string) => void;
const openFormApproverDeadline = inject('openFormApproverDeadline') as (id?: string, item?:ActivityInterface, isDetail?: boolean) => void;
const openFormRequestDeadline = inject('openFormRequestDeadline') as (id?: string, item?:ActivityInterface, isDetail?: boolean) => void;

const { t } = useI18n();
const activity = ref();
const selectedActivity = ref<ActivityInterface[]>([]);
const tree = ref<TreeNode[]>([]);
const treeMap = ref<Map<string, string>>(new Map());
const showHistoryDialog = ref<boolean>(false);
const showRejectDialog = ref<boolean>(false);
const showHistoryDeadlineDialog = ref<boolean>(false);
const activityId = ref();
const statusActivity = ref();
const expandedRows = ref([]);
const {
  mutate: deleteMutate,
  onDone: deleteOnDone,
  onError: deleteOnError
} = deleteActivityById();

const {
  mutate: approveMutate,
  onDone: approveOnDone,
  onError: approveOnError
} = generalLeaderSubmitActivity();

function toggleActionMenu(event: Event, data: ActivityInterface) {
  statusActivity.value = data.status;
  menuAction.value.toggle(event);
  activity.value = cloneDeep(data);
  activityId.value = data.id;
  selectedActivity.value = [activity.value];
}

function deleteActivity() {
  deleteMutate({ id: selectedActivity.value[0].id });
}

const menuAction = ref();
const confirm = useConfirm();

const flags = computed(() => {
  const isStaff = rolesUser.value.includes(RoleType.NHAN_VIEN);
  const isChief = rolesUser.value.includes(RoleType.TRUONG_PHONG);
  const isLeader = rolesUser.value.includes(RoleType.LANH_DAO);

  return {
    isChief,
    isStaff,
    isLeader,
    hasView: hasPermission('/MISSION/MISSION_DUTY/MISSION_DUTY-ACTIVITY/VIEW'),
    hasEdit: hasPermission('/MISSION/MISSION_DUTY/MISSION_DUTY-ACTIVITY/UPDATE'),
    hasDelete: hasPermission('/MISSION/MISSION_DUTY/MISSION_DUTY-ACTIVITY/DELETE')
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
        openForm(selectedActivity.value[0].id, true);
      }
    },
    {
      label: t('Chấp thuận'),
      icon: 'inbox',
      show: selectedActivity.value[0]?.youHaveSubmitActivityRequest,
      command: () => {
        confirm.require({
          message: t('mission.activity.confirmApprove', {
            itemType: t('hoạt động'),
            itemName: selectedActivity.value[0].activityName
          }),
          acceptLabel: t('Chấp thuận'),
          acceptClass: 'p-button-success',
          header: t('common.confirm'),
          icon: 'pi pi-inbox',
          accept: () => {
            handleApprove();
          }
        });

      }
    },
    {
      label: t('Không chấp thuận'),
      icon: 'inbox',
      show: selectedActivity.value[0]?.youHaveSubmitActivityRequest,
      command: () => {
        confirm.require({
          message: t('mission.activity.confirmReject', {
            itemType: t('hoạt động'),
            itemName: selectedActivity.value[0].activityName
          }),
          acceptLabel: t('Từ chối'),
          acceptClass: 'p-button-error',
          header: t('common.confirm'),
          icon: 'pi pi-inbox',
          accept: () => {
            handleReject();
          }
        });

      }
    },
    {
      label: t('common.edit'),
      icon: 'edit',
      show: f.hasEdit && ['NEW', 'IN_PROGRESS', 'GENERAL_LEADER_REJECTED_ACTIVITY'].includes(statusActivity.value),
      command: () => {
        openForm(selectedActivity.value[0].id);
      }
    },
    {
      label: t('common.delete'),
      icon: 'delete',
      show: f.hasDelete && ['NEW', 'GENERAL_LEADER_REJECTED_ACTIVITY', 'WAITING_FOR_GENERAL_LEADER_APPROVE_ACTIVITY'].includes(statusActivity.value),
      command: () => {
        confirm.require({
          message: t('common.confirmDelete', {
            itemType: 'hoạt động',
            itemName: selectedActivity.value[0].activityName
          }),
          acceptLabel: t('common.delete'),
          acceptClass: 'p-button-danger',
          header: t('common.confirm'),
          icon: 'pi pi-exclamation-triangle',
          accept: () => {
            deleteActivity();
          }
        });

      }
    },
    {
      label: t('Gia hạn thời gian'),
      icon: 'history',
      show: f.isChief && statusActivity.value === 'IN_PROGRESS',
      command: () => {
        openFormRequestDeadline(selectedActivity.value[0].id, activity.value);
      }
    },
    {
      label: t('Duyệt gia hạn thời gian'),
      icon: 'edit_calendar',
      show: selectedActivity.value[0]?.youHasExtensionDeadlineRequest,
      command: () => {
        openFormApproverDeadline(selectedActivity.value[0].id, activity.value);
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
      show: f.isStaff || statusActivity.value !== 'NEW',
      command: () => {
        showHistoryDeadlineDialog.value = true;
      }
    }
  ].filter((obj) => obj.show);
});

function handleApprove(){
  approveMutate({
    generaLeaderSubmitActivityInput: {
      activityId: selectedActivity.value[0].id,
      reasonWhyReject: null 
    }
  });
}
approveOnDone(() => {
  toastSuccess({ message: t('Đã chấp thuận hoạt động') });
  emits('refresh');
});

approveOnError(() => {
  toastError({ message: t('mission.mission.errors.errors') });
});

function handleReject(){
  showRejectDialog.value = true;
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

const visibleDetail = ref<boolean>(false);

function rowClicked(event: DataTableRowClickEvent) {
  selectedActivity.value = [event.data];
  visibleDetail.value = true;
}

function capitalizeName(name?: string): string {
  if (!name) {
    return '';
  }
  return name
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

getAllOrganizationPublicGraphql().onResult((res) => {
  tree.value = convertToOrganizationTreeNodes(res.data?.allOrganizationPublic || []);
  treeMap.value = new Map(
    tree.value
      .flatMap(node => [
        node.key && node.label ? [node.key, node.label] : [],
        ...flattenChildren(node).filter(child => child.key && child.label).map(child => [child.key, child.label] as [string, string])
      ])
      .filter((item): item is [string, string] => item.length === 2 && item.every(val => val !== undefined))
  );
});

function flattenChildren(node: TreeNode): TreeNode[] {
  const children = node.children || [];
  return [
    ...children,
    ...children.flatMap(child => flattenChildren(child))
  ];
}

const displayedActivityData = computed(() => {
  return props.activityData.map(activity => {
    const coordinationNames = activity.coordinationUnitName
      ? activity.coordinationUnitName
        .split(',')
        .map(id => treeMap.value.get(id.trim()))
        .filter(Boolean)
        .map(name => capitalizeName(name))
      : [];
    return{
      ...activity,
      hostUnitName: capitalizeName(treeMap.value.get(activity.hostUnit) || ''),
      coordinationUnitNames: coordinationNames
    };
  });
});

</script>

<style scoped>
:deep(.float-left .p-column-header-content) {
  align-items: flex-start !important;
  justify-content: flex-start !important;
}
</style>
