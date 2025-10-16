<template>
  <DataTable
    v-model:expandedRowGroups='expandedRowGroups'
    expandable-row-groups
    :group-rows-by='viewType'
    row-group-mode='subheader'
    scrollable
    :sort-field='viewType'
    sort-mode='single'
    :sort-order='1'
    :value='data'
    @rowgroup-collapse='onRowGroupCollapse'
    @rowgroup-expand='onRowGroupExpand'>
    <template #groupheader='slotProps'>
      <span
        class='font-bold line-height-3 ml-2 vertical-align-middle'
        style='color: #0F6CBD'>
        <span v-if="viewType == 'decisionType'">
          {{ t('hrm.decision.decisionType.' + slotProps.data.decisionType.toLowerCase()) }}
        </span>

        <span v-if="viewType == 'signerName'">
          <span v-if='slotProps.data.signerId'>{{ slotProps.data.signerName }}</span>
          <span v-else>Không xác định</span>
        </span>

        <span v-if="viewType == 'decisionMakingLevelName'">
          {{ slotProps.data.decisionMakingLevelName }}
        </span>

        <span v-if="viewType == 'commendationObject'">
          {{
            t('hrm.decision.' + toLower(slotProps.data.commendationObject))
          }}
        </span>
      </span>
    </template>

    <Column
      header='STT'
      header-class='w-1rem'
      selection-mode='single'>
      <template #body='{ index }'>
        <div class='flex justify-content-center'>
          {{ index + 1 }}
        </div>
      </template>
    </Column>

    <Column
      header='Họ và tên nhân sự'
      header-class='w-20rem'>
      <template #body='{data}'>
        <div class='flex gap-2'>
          <HrmAvatar
            v-if='!(data?.commendationObject) || data?.commendationObject == "EMPLOYEE"'
            :avatar='generateAvatarUrl(data?.employeeGeneral?.avatar ||
              data?.employeeCommendations?.[0]?.avatar ||
              data?.employeeDisciplines?.[0]?.avatar)'
            class='border-round-sm cursor-pointer'
            width='2.5rem'/>
          <label class='align-content-center'>{{
            data?.employeeGeneral?.fullName ||
              data?.employeeCommendations?.[0]?.employeeOrganizationName ||
              data?.employeeDisciplines?.[0]?.employeeOrganizationName
          }}</label>
        </div>
      </template>
    </Column>

    <Column
      field='noDecision'
      header='Số quyết định'
      header-class='w-25rem'/>

    <Column
      header='Ngày hiệu lực'
      header-class='w-12rem'>
      <template #body='{data: {effectStartDate}}'>
        <div class='flex justify-content-center'>
          {{ effectStartDate ? moment(effectStartDate).format('DD/MM/YYYY') : '' }}
        </div>
      </template>
    </Column>

    <Column
      header='Ngày quyết định'
      header-class='w-20rem'>
      <template #body='{data: {decisionDate}}'>
        <div class='flex justify-content-center'>
          {{ decisionDate ? moment(decisionDate).format('DD/MM/YYYY') : '' }}
        </div>
      </template>
    </Column>

    <Column
      field='decisionType'
      header='Loại quyết định'
      header-class='w-15rem'>
      <template #body='{data: {decisionType}}'>
        {{ mapDecisionType(decisionType ?? '')?.name }}
      </template>
    </Column>

    <Column
      header='Ngày tạo'
      header-class='w-8rem'>
      <template #body='{data: {createdTime}}'>
        <div class='flex justify-content-center'>
          {{ createdTime ? moment(createdTime).format('DD/MM/YYYY') : '' }}
        </div>
      </template>
    </Column>

    <Column
      field='createdBy'
      header='Người tạo'
      header-class='w-15rem'>
      <template #body='{data: {createdBy}}'>
        <div class='flex justify-content-center'>
          <AppUser
            avatar-size='2.5'
            :user-id='createdBy'/>
        </div>
      </template>
    </Column>

    <Column
      field='status'
      header='Trạng thái'
      header-class='w-10rem'>
      <template #body='{data: {status}}'>
        <span
          v-if='status'
          class='status-badge text-white'
          :style='{background: tabMenu.find((st) => st.key == status)?.color ?? ""}'>{{
            mapDecisionStatus(status ?? '')?.name
          }}</span>
      </template>
    </Column>

    <Column header-class='w-1rem'>
      <template #body='{data}'>
        <ButtonIcon
          class='btn-create'
          icon='more_vert'
          outlined
          rounded
          text
          @click='toggleActionMenu({ event: $event, data: data })'/>
      </template>
    </Column>
  </DataTable>

  <FormDecision
    v-if='visibleForm'
    :decision-id='selectedDecision?.id'
    :visible='visibleForm'
    @hide-dialog='hideDialog'/>

  <FormTransferDecision
    v-if='visibleTransferForm'
    :decision-id='selectedDecision?.id'
    :visible='visibleTransferForm'
    @hide-dialog='hideDialog'/>

  <FormTerminationDecision
    v-if='visibleTerminationForm'
    :decision-id='selectedDecision?.id'
    :visible='visibleTerminationForm'
    @hide-dialog='hideDialog'/>

  <FormDismissalDecision
    v-if='visibleDismissalForm'
    :decision-id='selectedDecision?.id'
    :visible='visibleDismissalForm'
    @hide-dialog='hideDialog'/>

  <FormCommendationDecision
    v-if='visibleCommendationForm'
    :decision-id='selectedDecision?.id'
    :visible='visibleCommendationForm'
    @hide-dialog='hideDialog'/>

  <FormDisciplineDecision
    v-if='visibleDisciplineForm'
    :decision-id='selectedDecision?.id'
    :visible='visibleDisciplineForm'
    @hide-dialog='hideDialog'/>

  <FormReceptionDecision
    v-if='visibleReceptionForm'
    :decision-id='selectedDecision?.id'
    :visible='visibleReceptionForm'
    @hide-dialog='hideDialog'/>

  <SettingStatus
    v-if='visibleSettingStatus'
    :decision-id='selectedDecision?.id'
    :decision-status='selectedDecision?.status'
    :visible-dialog='visibleSettingStatus'
    @hide-dialog='hideDialog'/>

  <DecisionDetail
    v-if='visibleDetail'
    :decision-id='selectedDecision?.id'
    :header='"Chi tiết "+headerDetail'
    :visible='visibleDetail'
    @hide-dialog='hideDialog'/>

  <Menu
    ref='menuAction'
    :model='menuActions'
    :popup='true'>
    <template #item='{ item: { icon, label } }'>
      <MenuItem
        :class-icon="['mt-0 text-sm', icon === 'delete' ? 'text-red-300' : '']"
        :class-item="['mt-1', icon === 'delete' ? 'text-red-300' : '']"
        :icon='icon'
        :label='label'/>
    </template>
  </Menu>
  <Menu
    id='overlay_menu'
    ref='menuUtils'
    :model='items'
    :popup='true'>
    <template #item='itemProp'>
      <div class='cursor-pointer flex gap-1 p-2'>
        <AppIcon
          name='check'
          size='1.5'
          style='color: #0d99ff'
          :style='{ opacity: searchDecisionType == itemProp.item.code ? 1 : 0 }'/>
        <div
          :style='{color: searchDecisionType == itemProp.item.code ? "#0d99ff" : ""}'>
          {{ itemProp.item.label }}
        </div>
      </div>
    </template>
  </Menu>
</template>

<script setup lang='ts'>
import { cloneDeep, toLower } from 'lodash';
import Column from 'primevue/column';
import type Menu from 'primevue/menu';
import type { MenuItem } from 'primevue/menuitem';
import { useConfirm } from 'primevue/useconfirm';
import { computed, inject, type PropType, reactive, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { deleteById, searchDecisions } from '@/apps/hrm/api/graphql/decision';
import HrmAvatar from '@/apps/hrm/components/HrmAvatar.vue';
import { type DecisionInterface, mapDecisionStatus, mapDecisionType } from '@/apps/hrm/model/decision';
import FormDecision from '@/apps/hrm/views/decision/AppointmentDecision/FormDecision.vue';
import FormCommendationDecision from '@/apps/hrm/views/decision/CommendationDecision/FormCommendationDecision.vue';
import DecisionDetail from '@/apps/hrm/views/decision/DecisionDetail.vue';
import FormDisciplineDecision from '@/apps/hrm/views/decision/Discipline/FormDisciplineDecision.vue';
import FormDismissalDecision from '@/apps/hrm/views/decision/Dismissal/FormDismissalDecision.vue';
import FormReceptionDecision from '@/apps/hrm/views/decision/ReceptionDecision/FormReceptionDecision.vue';
import SettingStatus from '@/apps/hrm/views/decision/SettingStatus.vue';
import FormTerminationDecision from '@/apps/hrm/views/decision/TerminationDecision/FormTerminationDecision.vue';
import FormTransferDecision from '@/apps/hrm/views/decision/TransferDecision/FormTransferDecision.vue';
import AppUser from '@/common/components/app/AppUser.vue';
import { toastSuccess } from '@/common/helpers/custom-toast-service';
import { generateAvatarUrl } from '@/common/helpers/file-utils';
import useMoment from '@/common/helpers/mixins/use-moment';

const props = defineProps({
  viewType: {
    type: String,
    default: 'decisionType'
  },
  data: {
    type: Array as PropType<DecisionInterface[]>,
    default: () => []
  }
});
const { moment } = useMoment();
const { t } = useI18n();
const selectedDecision = ref({} as DecisionInterface);
const decisions = ref([] as DecisionInterface[]);
const visibleDetail = ref(false);
const visibleSettingStatus = ref(false);
const totalAll = ref(0);
const totalDraft = ref(0);
const totalPending = ref(0);
const totalApproved = ref(0);
const totalReject = ref(0);
const onRowGroupCollapse = (event: any) => {
};

const onRowGroupExpand = (event: any) => {
  console.log('Expanded group:', event.data);

};

const allDecision = ref([]);
const draftDecisions = ref([]);
const pendingDecisions = ref([]);
const approvedDecisions = ref([]);
const rejectDecisions = ref([]);

const visibleForm = ref(false);
const visibleTerminationForm = ref(false);
const visibleDismissalForm = ref(false);
const visibleTransferForm = ref(false);
const visibleCommendationForm = ref(false);
const visibleDisciplineForm = ref(false);
const visibleReceptionForm = ref(false);
const searchTerm = inject('searchTerm', ref(''));
const tab = ref<string>('ALL');
const expandedRowGroups = ref<any[]>([]);

const tabMenu = computed(() => [
  {
    label: 'Tất cả',
    key: 'ALL',
    count: totalAll.value,
    color: '#0D99FF',
    command: () => null
  },
  {
    label: 'Dự thảo',
    key: 'DRAFT',
    count: totalDraft.value,
    color: '#888888',
    command: () => null
  },
  {
    label: 'Chờ duyệt',
    key: 'WAITING_APPROVE',
    count: totalPending.value,
    color: '#F0BC8B',
    command: () => null
  },
  {
    label: 'Đã duyệt',
    key: 'APPROVED',
    count: totalApproved.value,
    color: '#94C748',
    command: () => null
  },
  {
    label: 'Từ chối',
    key: 'REJECTED',
    count: totalReject.value,
    color: '#FF4406',
    command: () => null
  }
]);

function hideDialog() {
  visibleForm.value = false;
  visibleTransferForm.value = false;
  visibleTerminationForm.value = false;
  visibleDismissalForm.value = false;
  visibleCommendationForm.value = false;
  visibleDisciplineForm.value = false;
  visibleReceptionForm.value = false;
  visibleSettingStatus.value = false;
  visibleDetail.value = false;
  refetch();
  decision.value = {} as DecisionInterface;
  selectedDecision.value = {} as DecisionInterface;
}

function changeTab(tb: string) {
  tab.value = tb;
  if (tab.value == 'ALL') {
    decisions.value = allDecision.value;
  } else if (tab.value == 'DRAFT') {
    decisions.value = draftDecisions.value;
  } else if (tab.value == 'WAITING_APPROVE') {
    decisions.value = pendingDecisions.value;
  } else if (tab.value == 'APPROVED') {
    decisions.value = approvedDecisions.value;
  } else if (tab.value == 'REJECTED') {
    decisions.value = rejectDecisions.value;
  }
}

const {
  onResult,
  refetch,
  load
} = searchDecisions();
const decision = ref({} as DecisionInterface);
const confirm = useConfirm();
onResult((res) => {
  totalAll.value = res.data.searchDecisions.totalAll ?? 0;
  totalDraft.value = res.data.searchDecisions.totalDraft ?? 0;
  totalPending.value = res.data.searchDecisions.totalWaitingApprove ?? 0;
  totalApproved.value = res.data.searchDecisions.totalApproved ?? 0;
  totalReject.value = res.data.searchDecisions.totalRejected ?? 0;

  allDecision.value = res.data.searchDecisions.allDecision;
  draftDecisions.value = res.data.searchDecisions.draftDecision;
  pendingDecisions.value = res.data.searchDecisions.waitingApproveDecision;
  approvedDecisions.value = res.data.searchDecisions.approvedDecision;
  rejectDecisions.value = res.data.searchDecisions.rejectDecision;

  changeTab(tab.value);

});

load(undefined, { keyword: '' });

const menuAction = ref();
const headerDetail = ref();

interface MenuAction {
  label: string;
  icon: string;
  command: () => void;
  visible?: boolean;
}

const menuActions = reactive<MenuAction[]>([
  {
    label: t('common.detail'),
    icon: 'info',
    command: () => {
      visibleDetail.value = true;
      if (selectedDecision.value.decisionType == 'APPOINTMENT') {
        headerDetail.value = 'Quyết định bổ nhiệm';
      } else if (selectedDecision.value.decisionType == 'TRANSFER') {
        headerDetail.value = 'Quyết định điều chuyển';
      } else if (selectedDecision.value.decisionType == 'CONTRACT_TERMINATION') {
        headerDetail.value = 'Quyết định chấm dứt HĐLĐ';
      } else if (selectedDecision.value.decisionType == 'COMMENDATION') {
        headerDetail.value = 'Quyết định khen thưởng';
      } else if (selectedDecision.value.decisionType == 'DISCIPLINE') {
        headerDetail.value = 'Quyết định kỷ luật lao động';
      } else if (selectedDecision.value.decisionType == 'RECEPTION') {
        headerDetail.value = 'Quyết định tiếp nhận';
      } else if (selectedDecision.value.decisionType == 'DISMISSAL') {
        headerDetail.value = 'Quyết định miễn nhiệm';
      }
    },
  },
  {
    label: t('common.edit'),
    icon: 'edit',
    command: () => {
      if (selectedDecision.value.decisionType == 'APPOINTMENT') {
        visibleForm.value = true;
      } else if (selectedDecision.value.decisionType == 'TRANSFER') {
        visibleTransferForm.value = true;
      } else if (selectedDecision.value.decisionType == 'CONTRACT_TERMINATION') {
        visibleTerminationForm.value = true;
      } else if (selectedDecision.value.decisionType == 'COMMENDATION') {
        visibleCommendationForm.value = true;
      } else if (selectedDecision.value.decisionType == 'DISCIPLINE') {
        visibleDisciplineForm.value = true;
      } else if (selectedDecision.value.decisionType == 'RECEPTION') {
        visibleReceptionForm.value = true;
      } else if (selectedDecision.value.decisionType == 'DISMISSAL') {
        visibleDismissalForm.value = true;
      }
    },
  },
  {
    label: 'Thiết lập trạng thái',
    icon: 'settings',
    command: () => {
      visibleSettingStatus.value = true;
    },
  },
  {
    label: t('common.delete'),
    icon: 'delete',
    command: () => {
      confirm.require({
        message: `Bạn có chắc chắn muốn xóa quyết định ${decision.value.noDecision} này không?`,
        header: t('common.confirm'),
        icon: 'pi pi-exclamation-triangle',
        acceptLabel: t('common.delete'),
        acceptClass: 'p-button-danger',
        accept: () => {
          deleteById().mutate({ id: decision.value.id }).then(() => {
            toastSuccess({ message: 'Bạn đã xóa quyết định thành công.' });
            refetch();
          });
        }
      });
    },
  },
]);

function toggleActionMenu({
  event,
  data,
}: {
  event: Event;
  data: DecisionInterface;
}) {
  menuAction.value.toggle(event);
  decision.value = cloneDeep(data);
  selectedDecision.value = decision.value;
  menuActions[1].visible = selectedDecision.value.status !== 'APPROVED';
  menuActions[2].visible = selectedDecision.value.status !== 'APPROVED';
  menuActions[3].visible = selectedDecision.value.status !== 'APPROVED';
}

watch(searchTerm, (newValue) => {
  decisions.value = [];
  load(undefined, { keyword: newValue });
  changeTab(tab.value);
});
const searchDecisionType = ref();
const menuUtils = ref();
const items = ref([
  {
    code: 'RECEPTION',
    label: 'Quyết định tiếp nhận',
    command() {
      searchDecisionType.value == 'RECEPTION' ? load(undefined, { keyword: '' }) : load(undefined, {
        keyword: '',
        decisionType: 'RECEPTION'
      });

      searchDecisionType.value = 'RECEPTION';
    },
  }, {
    code: 'APPOINTMENT',
    label: 'Quyết định bổ nhiệm',
    command() {
      searchDecisionType.value == 'APPOINTMENT' ? load(undefined, { keyword: '' }) : load(undefined, {
        keyword: '',
        decisionType: 'APPOINTMENT'
      });
      searchDecisionType.value = 'APPOINTMENT';
    },
  }, {
    code: 'COMMENDATION',
    label: 'Quyết định khen thưởng',
    command() {
      searchDecisionType.value == 'COMMENDATION' ? load(undefined, { keyword: '' }) : load(undefined, {
        keyword: '',
        decisionType: 'COMMENDATION'
      });
      searchDecisionType.value = 'COMMENDATION';
    },
  }, {
    code: 'DISCIPLINE',
    label: 'Quyết định kỷ luật lao động',
    command() {
      searchDecisionType.value == 'DISCIPLINE' ? load(undefined, { keyword: '' }) : load(undefined, {
        keyword: '',
        decisionType: 'DISCIPLINE'
      });
      searchDecisionType.value = 'DISCIPLINE';
    },
  }, {
    code: 'TRANSFER',
    label: 'Quyết định điều chuyển',
    command() {
      searchDecisionType.value == 'TRANSFER' ? load(undefined, { keyword: '' }) : load(undefined, {
        keyword: '',
        decisionType: 'TRANSFER'
      });
      searchDecisionType.value = 'TRANSFER';
    },
  }, {
    code: 'SALARY_ADJUSTMENT',
    label: 'Quyết định điều chỉnh lương',
    command() {
      searchDecisionType.value == 'SALARY_ADJUSTMENT' ? load(undefined, { keyword: '' }) : load(undefined, {
        keyword: '',
        decisionType: 'SALARY_ADJUSTMENT'
      });
      searchDecisionType.value = 'SALARY_ADJUSTMENT';
    },
  }, {
    code: 'DISMISSAL',
    label: 'Quyết định miễn nhiệm',
    command() {
      searchDecisionType.value == 'DISMISSAL' ? load(undefined, { keyword: '' }) : load(undefined, {
        keyword: '',
        decisionType: 'DISMISSAL'
      });
      searchDecisionType.value = 'DISMISSAL';
    },
  }, {
    code: 'CONTRACT_TERMINATION',
    label: 'Quyết định chấm dứt HĐLĐ',
    command() {
      searchDecisionType.value == 'CONTRACT_TERMINATION' ? load(undefined, { keyword: '' }) : load(undefined, {
        keyword: '',
        decisionType: 'CONTRACT_TERMINATION'
      });
      searchDecisionType.value = 'CONTRACT_TERMINATION';
    },
  }
]);

function rowClicked(event: any) {
  if (event?.data?.decisionType == 'APPOINTMENT') {
    headerDetail.value = 'Quyết định bổ nhiệm';
  } else if (event?.data?.decisionType == 'TRANSFER') {
    headerDetail.value = 'Quyết định điều chuyển';
  } else if (event?.data?.decisionType == 'CONTRACT_TERMINATION') {
    headerDetail.value = 'Quyết định chấm dứt HĐLĐ';
  } else if (event?.data?.decisionType == 'COMMENDATION') {
    headerDetail.value = 'Quyết định khen thưởng';
  } else if (event?.data?.decisionType == 'DISCIPLINE') {
    headerDetail.value = 'Quyết định kỷ luật lao động';
  } else if (event?.data?.decisionType == 'RECEPTION') {
    headerDetail.value = 'Quyết định tiếp nhận';
  } else if (event?.data?.decisionType == 'DISMISSAL') {
    headerDetail.value = 'Quyết định miễn nhiệm';
  }
  selectedDecision.value = event?.data;
  visibleDetail.value = true;

}
</script>

<style scoped>
</style>
