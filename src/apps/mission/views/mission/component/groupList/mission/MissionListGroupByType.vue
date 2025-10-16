<template>
  <DataTable
    v-model:expandedRowGroups='expandedRowGroups'
    class='h-full surface-overlay'
    expandable-row-groups
    group-rows-by='missionType'
    :loading='loading'
    :pt="{
      wrapper: {
        class: 'h-full surface-overlay',
      },
    }"
    row-group-mode='subheader'
    :row-hover='true'
    scroll-height='calc(100vh - 12rem)'
    scrollable
    table-style='min-width: 50rem'
    :value='displayedMissionData'>
    <template #groupheader='{ data }'>
      <span
        class='font-bold line-height-3 ml-2 vertical-align-middle'
        style='color: #0F6CBD; margin-bottom: 20px;'>
        {{ formatMissionType(data.missionType) }}
      </span>
    </template>

    <template #empty>
      <span class='block font-bold text-600 text-center'>
        {{ t('common.emptyRecords', { itemType: 'nhiệm vụ' }) }}
      </span>
    </template>

    <Column
      class='px-3 text-700 text-center'
      :header="t('mission.mission.No')"
      style='width: 2%'>
      <template #body='{ index }'>
        {{ index + 1 + (pageable?.page || 0) * (pageable?.size || 0) }}
      </template>
    </Column>

    <Column
      class='col-2 p-2'
      field='name'
      :header="t('mission.mission.missionTableCol.name')"
      header-class='float-left'>
      <template #body='{ data }'>
        <div
          class='cursor-pointer'
          @click='openForm(data.id, true)'>
          <p class='m-0'>{{ data.name }}</p>
          <p>{{ data.code }}</p>
        </div>
      </template>
    </Column>

    <Column
      class='col-1 p-2 text-700'
      field='missionType'
      :header="t('mission.mission.missionTableCol.missionType')">
      <template #body='{ data }'>
        {{ formatMissionType(data.missionType) }}
      </template>
    </Column>

    <Column
      class='col-1 p-0 text-700 text-center'
      field='startDate'
      :header="t('mission.mission.missionTableCol.startDate')"
      :sortable='true'
      style='width: 12%;'>
      <template #body='{ data }'>
        {{ formatDate(data.startDate, 'DD/MM/YYYY') }}
      </template>
    </Column>

    <Column
      class='col-1 p-0 text-700 text-center'
      field='endDate'
      :header="t('mission.mission.missionTableCol.endDate')"
      :sortable='true'
      style='width: 12%;'>
      <template #body='{ data }'>
        {{ formatDate(data.endDate, 'DD/MM/YYYY') }}
      </template>
    </Column>

    <Column
      class='col-1 text-700'
      field='budget'
      :header="t('mission.mission.missionTableCol.budget')">
      <template #body='{ data }'>
        {{ formatCurrency(data.budget) }}
      </template>
    </Column>

    <Column
      class='text-700'
      field='hostUnit'
      :header="t('mission.mission.missionTableCol.hostUnit')"
      header-class='float-left'
      style='width: 12%'>
      <template #body='{ data }'>
        {{ hostUnits.find(h => h.id == data.hostUnit)?.name || '' }}
      </template>
    </Column>

    <Column
      class='col-1 p-0 text-700 text-center'
      field='createdTime'
      :header="t('mission.mission.missionTableCol.createDate')"
      :sortable='true'>
      <template #body='{ data }'>
        {{ formatDate(data.createdTime, 'DD/MM/YYYY') }}
      </template>
    </Column>

    <Column
      class='col-1 p-0 text-center'
      field='createdBy'
      :header="t('mission.mission.missionTableCol.createBy')"
      style='width: 6%'>
      <template #body='{ data }'>
        <div class='flex justify-content-center'>
          <AppGroupAvatar
            v-if='data.createdBy'
            avatar-size='2.5'
            :user-ids='[data.createdBy]'/>
        </div>
      </template>
    </Column>

    <Column
      class='p-0 text-center'
      field='status'
      :header="t('mission.mission.missionTableCol.status')"
      style='width: 6%'>
      <template #body='{ data }'>
        <Badge
          class='py-0 status-badge'
          :severity='getStatusSeverity(data.status)?.color'
          :value='getStatusSeverity(data.status)?.text'/>
      </template>
    </Column>

    <Column
      class='px-0 text-center'
      :header="t('mission.mission.common.action1')"
      style='width: 5%'>
      <template #body='{ data }'>
        <Button
          icon='pi pi-ellipsis-v'
          rounded
          text
          @click='toggleActionMenu($event, data)'/>
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
    :id='missionId'
    v-model:visible-dialog='showHistoryDialog'/>
  <MissionHistoryDeadline
    v-if='showHistoryDeadlineDialog'
    :id ='missionId'
    v-model:visible-dialog='showHistoryDeadlineDialog'/>
</template>

<script setup lang="ts">
import { cloneDeep } from 'lodash';
import { storeToRefs } from 'pinia';
import Column from 'primevue/column';
import { useConfirm } from 'primevue/useconfirm';
import { computed, inject, onMounted, type PropType, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { getAllOrganizationPublicGraphql } from '@/apps/admin/api/graphql/organization-graphql-api';
import type { OrganizationInterface } from '@/apps/admin/model/organization';
import { usePermissionStore } from '@/apps/admin/store/permission';
import { useUserMoreInfoStore } from '@/apps/admin/store/usersMoreInfo';
import { deleteMissionById } from '@/apps/mission/api/graphql/mission';
import { formatMissionType } from '@/apps/mission/helpers/convert';
import { formatCurrency } from '@/apps/mission/helpers/currencyFormat';
import { RoleType } from '@/apps/mission/model/job/job';
import { type MissionInterface } from '@/apps/mission/model/mission/mission';
import AppGroupAvatar from '@/common/components/app/AppGroupAvatar.vue';
import { toastError, toastSuccess } from '@/common/helpers/custom-toast-service';
import { formatDate } from '@/common/helpers/utils';
import { useUserStore } from '@/common/store/user';

import MissionHistoryDeadline from '../../extensionDeadline/mission/MissionHistoryDeadline.vue';
import MissionHistory from '../../historyDialog/MissionHistory.vue';

const props = defineProps({
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
const hasPermission = usePermissionStore().hasPermission;
const openForm = inject('openForm') as (id?: string, isDetail?: boolean) => void;
const openFormApproverDeadline = inject('openFormApproverDeadline') as (id?: string, item?:MissionInterface, isDetail?: boolean) => void;
const openFormRequestDeadline = inject('openFormRequestDeadline') as (id?: string, item?:MissionInterface, isDetail?: boolean) => void;
const openChart = inject('openChart') as (id?: string) => void;
const { t } = useI18n();

const { user } = storeToRefs(useUserStore());
const store = useUserMoreInfoStore();
const { usersMoreInfo } = storeToRefs(store);
const currentUserInfo = computed(() => {
  return user.value?.id ? usersMoreInfo.value[user.value.id] : undefined;
});

const rolesUser = computed(() => currentUserInfo.value?.roles || []);
const missions = ref<MissionInterface>();
const selectedMission = ref<MissionInterface[]>([]);
const hostUnits = ref<OrganizationInterface[]>([]);
const showHistoryDialog = ref<boolean>(false);
const showHistoryDeadlineDialog = ref<boolean>(false);
const missionId = ref();
const statusMission = ref();
const expandedRowGroups = ref();

const {
  mutate: deleteMutate,
  onDone: deleteOnDone,
  onError: deleteOnError,
} = deleteMissionById();

function toggleActionMenu(event: Event, data: MissionInterface) {
  menuAction.value.toggle(event);
  statusMission.value = data.status;
  missionId.value = data.id;
  missions.value = cloneDeep(data);
  selectedMission.value = [missions.value];
}

function deleteMission() {
  deleteMutate({ id: selectedMission.value[0].id });
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
        openForm(selectedMission.value[0].id, true);
      }
    },
    {
      label: t('common.edit'),
      icon: 'edit',
      show: f.hasEdit && ['NEW', 'IN_PROGRESS'].includes(statusMission.value),
      command: () => {
        openForm(selectedMission.value[0].id);
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
            itemName: selectedMission.value[0].name
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
        openFormRequestDeadline(selectedMission.value[0].id, missions.value);
      }
    },
    {
      label: t('Duyệt gia hạn thời gian'),
      icon: 'edit_calendar',
      show: selectedMission.value[0]?.youHasExtensionDeadlineRequest,
      command: () => {
        openFormApproverDeadline(selectedMission.value[0].id, missions.value);
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
  if (e.graphQLErrors[0].extensions.errorCode == 'DeleteMission') {
    toastError({ message: t('mission.mission.errors.hasActivities') });
  } else {
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
      color: 'warning',
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

getAllOrganizationPublicGraphql().onResult((res) => {
  hostUnits.value = res.data?.allOrganizationPublic || [];
});

const displayedMissionData = computed(() => {
  return props.missionData
    .map(edge => edge.node)
    .sort((a, b) => a.missionType.localeCompare(b.missionType));
});

console.log(displayedMissionData.value);

const expandAllGroups = () => {
  const uniqueCampaignIds = [
    ...new Set(props.missionData.map(item => item.node.missionType))
  ];
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

::v-deep(.status-badge) {
  text-transform: unset !important;
}
</style>
