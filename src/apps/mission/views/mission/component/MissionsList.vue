<template>
  <DataTable
    v-model:expandedRows='expandedRows'
    class='h-full surface-overlay'
    data-key='node.id'
    :loading='loading'
    scroll-height='calc(100vh - 12rem)'
    scrollable
    table-style='min-width: 50rem'
    :value='missionData'
    @row-click='rowClicked'>
    <template #expansion='{ data }'>
      <div class='pl-4'>
        <p class='font-medium'>Các hoạt động thuộc nhiệm vụ: {{data.node.name}}</p>
        <MissionActivitiesTable :id='data.node.id' />
      </div>
    </template>
    <Column
      class='px-3 text-700 text-center'
      :header='t("mission.mission.No")'
      style='width: 2%'>
      <template #body='{index}'>
        {{ index + 1 + pageable?.page * pageable?.size }}
      </template>
    </Column>
    <Column
      class='px-2'
      expander
      style='width: 5%' />
    <Column
      class='col-2 p-2'
      field='node.name'
      :header='t("mission.mission.missionTableCol.name")'
      header-class='float-left'>
      <template #body='{ data: { node } }'>
        <div
          class='cursor-pointer'
          @click='openForm(node.id, true)'>
          <p class='font-medium m-0'>{{ node.name }}</p>
          <p>{{ node.code }}</p>
        </div>
      </template>
    </Column>
    <Column
      class='col-1 p-2 text-700'
      field='node.missionType'
      :header='t("mission.mission.missionTableCol.missionType")'>
      <template #body='{ data: { node: { missionType } } }'>
        {{ formatMissionType(missionType) }}
      </template>
    </Column>
    <Column
      class='col-1 p-0 text-700 text-center'
      field='node.startDate'
      :header='t("mission.mission.missionTableCol.startDate")'
      :sortable='true'
      style='width: 12%;'>
      <template #body='{data: { node: { startDate } }}'>
        {{ formatDate(startDate,'DD/MM/YYYY') }}
      </template>
    </Column>
    <Column
      class='col-1 p-0 text-700 text-center'
      field='node.endDate'
      :header='t("mission.mission.missionTableCol.endDate")'
      :sortable='true'
      style='width: 12%;'>
      <template #body='{data: { node: { endDate } }}'>
        {{ formatDate(endDate,'DD/MM/YYYY') }}
      </template>
    </Column>
    <Column
      class='col-1 text-700'
      field='node.budget'
      :header='t("mission.mission.missionTableCol.budget")'>
      <template #body='{data: { node: { budget } }}'>
        {{ formatCurrency(budget) }}
      </template>
    </Column>
    <Column
      class='text-700'
      field='node.hostUnit'
      :header='t("mission.mission.missionTableCol.hostUnit")'
      header-class='float-left'
      style='width: 12%'>
      <template #body='{ data }'>
        {{ hostUnits.find(h => h.id == data.node.hostUnit)?.name || '' }}
      </template>
    </Column>
    <Column
      
      class='col-1 p-0 text-700 text-center'
      field='node.createdTime'
      :header='t("mission.mission.missionTableCol.createDate")'
      :sortable='true'>
      <template #body='{data: { node: { createdTime } }}'>
        {{ formatDate(createdTime,'DD/MM/YYYY') }}
      </template>
    </Column>
    <Column
      class='col-1 p-0 text-center'
      field='node.createdBy'
      :header='t("mission.mission.missionTableCol.createBy")'
      style='width: 6%'>
      <template #body='{data: { node: { createdBy } }}'>
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
      field='node.status'
      :header='t("mission.mission.missionTableCol.status")'
      style='width: 6%'>
      <template #body='{data: { node: { status } }}'>
        <Badge
          class='py-0 status-badge'
          :severity='getStatusSeverity(status)?.color'
          :value='getStatusSeverity(status)?.text'></Badge>
      </template>
    </Column>
    <Column
      class='px-0 text-center'
      :header='t("mission.mission.common.action1")'
      style='width: 5%'>
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
  <MissionHistory
    v-if='showHistoryDialog'
    :id ='missionId'
    v-model:visible-dialog='showHistoryDialog'/>
  <MissionHistoryDeadline
    v-if='showHistoryDeadlineDialog'
    :id ='missionId'
    v-model:visible-dialog='showHistoryDeadlineDialog'/>
</template>

<script setup lang='ts'>

import { cloneDeep } from 'lodash';
import { storeToRefs } from 'pinia';
import Column from 'primevue/column';
import type { DataTableRowClickEvent } from 'primevue/datatable';
import { useConfirm } from 'primevue/useconfirm';
import { computed, inject, type PropType, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { getAllOrganizationPublicGraphql } from '@/apps/admin/api/graphql/organization-graphql-api';
import { usePermissionStore } from '@/apps/admin/store/permission';
import { useUserMoreInfoStore } from '@/apps/admin/store/usersMoreInfo';
import type { OrganizationInterface } from '@/apps/document/model/organization';
import { deleteMissionById } from '@/apps/mission/api/graphql/mission';
import { formatMissionType } from '@/apps/mission/helpers/convert';
import { formatCurrency } from '@/apps/mission/helpers/currencyFormat';
import { RoleType } from '@/apps/mission/model/job/job';
import { type MissionInterface } from '@/apps/mission/model/mission/mission';
import AppGroupAvatar from '@/common/components/app/AppGroupAvatar.vue';
import { toastError, toastSuccess } from '@/common/helpers/custom-toast-service';
import { useUserStore } from '@/common/store/user';

import { formatDate } from '../../../../../common/helpers/utils';
import MissionHistoryDeadline from './extensionDeadline/mission/MissionHistoryDeadline.vue';
import MissionActivitiesTable from './groupList/activity/MissionActivitiesTable.vue';
import MissionHistory from './historyDialog/MissionHistory.vue';

defineProps({
  missionData: {
    type: Array as PropType<MissionInterface[]>,
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
const expandedRows = ref([]);
const hasPermission = usePermissionStore().hasPermission;
const openForm = inject('openForm') as (id?: string, isDetail?: boolean) => void;
const openFormApproverDeadline = inject('openFormApproverDeadline') as (id?: string, item?:MissionInterface, isDetail?: boolean) => void;
const openFormRequestDeadline = inject('openFormRequestDeadline') as (id?: string, item?:MissionInterface, isDetail?: boolean) => void;
const openChart = inject('openChart') as (id?: string) => void;
const { t } = useI18n();
const missions = ref();
const mission = ref();
const selectedMission = ref<MissionInterface[]>([]);
const showHistoryDialog = ref<boolean>(false);
const showHistoryDeadlineDialog = ref<boolean>(false);
const missionId = ref();
const statusMission = ref();
const hostUnits = ref<OrganizationInterface[]>([]);
const {
  mutate: deleteMutate,
  onDone: deleteOnDone,
  onError: deleteOnError,
} = deleteMissionById();

function toggleActionMenu(event: Event, data: MissionInterface) {
  menuAction.value.toggle(event);
  statusMission.value = data.node.status;
  console.log(statusMission.value);
  missionId.value = data.node.id;
  missions.value = cloneDeep(data);
  mission.value = cloneDeep(data.node);
  selectedMission.value = [missions.value];
}

function deleteMission() {
  deleteMutate({ id: selectedMission.value[0].node.id });
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
        openForm(selectedMission.value[0].node.id, true);
      }
    },
    {
      label: t('common.edit'),
      icon: 'edit',
      show: f.hasEdit && ['NEW', 'IN_PROGRESS'].includes(statusMission.value),
      command: () => {
        openForm(selectedMission.value[0].node.id);
      }
    },
    {
      label: t('common.delete'),
      icon: 'delete',
      show: f.hasDelete && statusMission.value === 'NEW',
      command: () => {
        confirm.require({
          message: t('common.confirmDelete', {
            itemType: 'nhiệm vụ',
            itemName: selectedMission.value[0].node.name
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
      show: f.isChief && statusMission.value === 'IN_PROGRESS',
      command: () => {
        openFormRequestDeadline(selectedMission.value[0].node.id, mission.value);
      }
    },
    {
      label: t('Duyệt gia hạn thời gian'),
      icon: 'edit_calendar',
      show: selectedMission.value[0]?.node?.youHasExtensionDeadlineRequested,
      command: () => {
        openFormApproverDeadline(selectedMission.value[0].node.id, mission.value);
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
      show: f.isStaff || statusMission.value !== 'NEW',
      command: () => {
        showHistoryDeadlineDialog.value = true;
      }
    },
    {
      label: t('Xem tiến độ'),
      icon: 'insert_chart',
      show: true,
      command: () => {
        openChart(selectedMission.value[0].node.id);
      }
    },
  ].filter((obj) => obj.show);
});

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
  selectedMission.value = [event.data];
  visibleDetail.value = true;
}

getAllOrganizationPublicGraphql().onResult((res) => {
  hostUnits.value = res.data?.allOrganizationPublic || [];
});

</script>

<style scoped>
:deep(.float-left .p-column-header-content) {
  align-items: flex-start !important;
  justify-content: flex-start !important;
}

::v-deep(.status-badge) {
  text-transform: unset !important;
}
</style>
