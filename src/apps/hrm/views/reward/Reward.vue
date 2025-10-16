<template>
  <div
    style='height: calc(100vh - 6rem)'>
    <div class='flex flex-column mb-2'>
      <Toolbar
        class='p-0'
        style='min-height: 3rem'>
        <template #start>
          <div class='align-items-center flex font-semibold gap-2 pl-2'>
            Danh sách khen thưởng, kỉ luật
          </div>
        </template>
        <template #end>
          <div class='btn-group-toolbar flex gap-1 mr-1'>
            <SplitButton
              v-if='hasPermission("/HRM/HRM_DEVELOPMENT/HRM_REWARD/CREATE")'
              class='btn-create focus:shadow-none font-medium'
              :label='t("common.create")'
              :model='types'
              style='border-radius: 0'
              @click='openForm'>
              <template #icon>
                <i
                  class='mr-2 pi pi-plus'
                  style='margin-top: 1px'></i>
              </template>
            </SplitButton>
            <Button
              class='focus:shadow-none font-normal hover:surface-200'
              icon='pi pi-filter'
              :label='t("common.filter")'
              severity='secondary'
              @click='toggle'></Button>
            <Button
              class='focus:shadow-none font-normal hover:surface-200'
              icon='pi pi-list'
              :label='t("common.viewBy")'
              severity='secondary'
              @click='viewTypeRef?.toggle'></Button>
            <Button
              class='focus:shadow-none font-normal hover:surface-200'
              icon='pi pi-file-import'
              :label='t("common.import")'
              severity='secondary'></Button>
            <Button
              class='focus:shadow-none font-normal hover:surface-200'
              icon='pi pi-file-export'
              :label='t("common.export")'
              severity='secondary'></Button>
            <!--            <Button-->
            <!--              class='focus:shadow-none font-normal hover:surface-200'-->
            <!--              icon='pi pi-cog'-->
            <!--              :label='t("common.setting")'-->
            <!--              severity='secondary'></Button>-->
          </div>
        </template>
      </Toolbar>
    </div>
    <div class='flex-grow-1'>
      <TabMenu
        v-if='viewType == "all"'
        :model='menus'>
        <template #item='{item}'>
          <div
            v-ripple
            class='flex gap-2 p-menuitem-link p-ripple px-3 py-2'
            @click='changeTab(item.key ?? "ALL")'>
            <a style='height: 1.5rem'>{{ item.label }}</a>
            <Badge
              :style='{background: item["color"]}'
              :value='item["count"]'></Badge>
          </div>
        </template>
      </TabMenu>
      <DecisionGroupItem
        v-if='viewType == "decisionMakingLevelName"'
        :data='decisions'
        view-type='decisionMakingLevelName'/>

      <DecisionGroupItem
        v-if='viewType == "commendationObject"'
        :data='decisions'
        view-type='commendationObject'/>

      <DecisionGroupItem
        v-if='viewType == "signerName"'
        :data='decisions'
        view-type='signerName'/>
      <DataTable
        v-if='viewType == "all"'
        v-bind='DEFAULT_DATATABLE_CONFIG'
        v-model:selection='selectedDecision'
        group-rows-by='key'
        row-group-mode='rowspan'
        row-hover
        scroll-height='calc(100vh - 12rem)'
        scrollable
        sort-mode='single'
        :value='decisions'
        @row-click='rowClicked'>
        <template #empty>
          <span class='block font-bold text-600 text-center'>{{
            t('common.emptyRecords', { itemType: 'quyết định' })
          }}</span>
        </template>
        <Column
          header='STT'
          header-class='w-1rem'>
          <template #body='{ index }'>
            <div class='flex justify-content-center'>
              {{ index + 1 }}
            </div>
          </template>
        </Column>

        <Column
          field='noDecision'
          header='Số quyết định'
          header-class='w-10rem'/>

        <Column
          header='Ngày quyết định'
          header-class='w-15rem'>
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
          header='Cấp khen thưởng'
          header-class='w-20rem'>
          <template #body='{data: {decisionMakingLevelName}}'>
            <div class='flex justify-content-center'>
              {{ decisionMakingLevelName }}
            </div>
          </template>
        </Column>

        <Column
          header='Nhân sự/Phòng ban'
          header-class='w-20rem'>
          <template #body='{data}'>
            <div class='flex gap-2'>
              <HrmAvatar
                v-if='!(data?.commendationObject) || data?.commendationObject == "EMPLOYEE"'
                :avatar='generateAvatarUrl(data?.employeeGeneral?.avatar ||
                  data?.employeeCommendations?.[0]?.avatar ||
                  data?.employeeDisciplines?.[0]?.avatar)'
                class='border-round-sm cursor-pointer'
                width='2rem'/>
              <label class='align-content-center'>{{
                data?.employeeGeneral?.fullName ||
                  data?.employeeCommendations?.[0]?.employeeOrganizationName ||
                  data?.employeeDisciplines?.[0]?.employeeOrganizationName
              }}</label>
            </div>
          </template>
        </Column>

        <Column
          header='Người ký'
          header-class='w-12rem'>
          <template #body='{data: {signerName}}'>
            <div class='flex justify-content-center'>
              {{ signerName }}
            </div>
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
    </div>
  </div>

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

  <Menu
    ref='viewTypeRef'
    :model='viewTypeMenu'
    popup>
    <template #item='itemProp'>
      <div class='cursor-pointer flex gap-1 p-2'>
        <AppIcon
          name='check'
          size='1.5'
          style='color: #0d99ff'
          :style='{ opacity: viewType == itemProp.item.key ? 1 : 0 }'/>
        <div
          :style='{color: viewType == itemProp.item.key ? "#0d99ff" : ""}'>
          {{ itemProp.item.label }}
        </div>
      </div>
    </template>
  </Menu>
</template>

<script setup lang='ts'>
import { cloneDeep, toLower } from 'lodash';
import { storeToRefs } from 'pinia';
import Column from 'primevue/column';
import type Menu from 'primevue/menu';
import type { MenuItem } from 'primevue/menuitem';
import { useConfirm } from 'primevue/useconfirm';
import { computed, inject, markRaw, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { getAllUserServicePublic } from '@/apps/admin/api/graphql/admin-customer-tenant';
import { usePermissionStore } from '@/apps/admin/store/permission';
import { useDocumentRolesStore } from '@/apps/document/store/document-role';
import { getAllCategory } from '@/apps/hrm/api/graphql/category';
import { deleteById, searchAdvanceReward } from '@/apps/hrm/api/graphql/decision';
import { getAllEmployeeInfo } from '@/apps/hrm/api/graphql/employee';
import HrmAvatar from '@/apps/hrm/components/HrmAvatar.vue';
import { type DecisionInterface, mapDecisionType } from '@/apps/hrm/model/decision';
import FormCommendationDecision from '@/apps/hrm/views/decision/CommendationDecision/FormCommendationDecision.vue';
import DecisionDetail from '@/apps/hrm/views/decision/DecisionDetail.vue';
import DecisionGroupItem from '@/apps/hrm/views/decision/DecisionGroupItem.vue';
import FormDisciplineDecision from '@/apps/hrm/views/decision/Discipline/FormDisciplineDecision.vue';
import SettingStatus from '@/apps/hrm/views/decision/SettingStatus.vue';
import OrganizationTree from '@/apps/work-flow/views/components/OrganizationTree/OrganizationTree.vue';
import AppUser from '@/common/components/app/AppUser.vue';
import { DEFAULT_DATATABLE_CONFIG } from '@/common/constants';
import { toastSuccess } from '@/common/helpers/custom-toast-service';
import { generateAvatarUrl } from '@/common/helpers/file-utils';
import useMoment from '@/common/helpers/mixins/use-moment';
import { useGlobalSearchStore } from '@/common/store/search';

const users = ref([]);
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
const {
  submit,
  model
} = storeToRefs(useGlobalSearchStore());
const { userDeptRole } = storeToRefs(
  useDocumentRolesStore(),
);

const allDecision = ref([]);
const draftDecisions = ref([]);
const hasPermission = usePermissionStore().hasPermission;
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
const { onResult: categoryResult } = getAllCategory(userDeptRole.value, 'DECISION_LEVEL');
const viewTypeRef = ref<InstanceType<typeof Menu> | null>(null);
const viewType = ref<string>('all');
const { setFields } = useGlobalSearchStore();
const leaderUserLoaded = ref(false);
const categoryLoaded = ref(false);
const leaderUsers = ref<any[]>([]);
const fields = ref<Record<string, any>>({});
const decisionMakingLevels = ref<any[]>([]);
const decisionTypes = [
  {
    code: 'RECEPTION',
    label: 'Quyết định tiếp nhận'
  },
  {
    code: 'APPOINTMENT',
    label: 'Quyết định bổ nhiệm'
  },
  {
    code: 'COMMENDATION',
    label: 'Quyết định khen thưởng'
  },
  {
    code: 'DISCIPLINE',
    label: 'Quyết định kỷ luật lao động'
  },
  {
    code: 'TRANSFER',
    label: 'Quyết định điều chuyển'
  },
  {
    code: 'SALARY_ADJUSTMENT',
    label: 'Quyết định điều chỉnh lương'
  },
  {
    code: 'DISMISSAL',
    label: 'Quyết định miễn nhiệm'
  },
  {
    code: 'CONTRACT_TERMINATION',
    label: 'Quyết định chấm dứt HĐLĐ'
  },
];

const viewTypeMenu = ref([
  {
    label: t('Đầy đủ'),
    key: 'all',
    command: () => {
      console.log('all');
      viewType.value = 'all';
    },
  },
  {
    label: 'Cấp khen thưởng/kỷ luật',
    key: 'decisionMakingLevelName',
    command: () => {
      viewType.value = 'decisionMakingLevelName';
    },
  },
  {
    label: 'Người ký',
    key: 'signerName',
    command: () => {
      viewType.value = 'signerName';
    },
  },
  {
    label: 'Loại khen thưởng/kỷ luật',
    key: 'commendationObject',
    command: () => {
      viewType.value = 'commendationObject';
    },
  }
]);

getAllUserServicePublic().onResult((res) => {
  leaderUsers.value = res.data.getAllUserServicePublic.filter((user: any) => user.roles?.includes('LANH_DAO'));
  leaderUserLoaded.value = true;
  trySetField();
});

categoryResult((res) => {
  decisionMakingLevels.value = res.data.getAllCategory;
  categoryLoaded.value = true;
  trySetField();
});

getAllEmployeeInfo().onResult((res) => {
  users.value = res.data.getAllEmployeeInfo;
});

function openForm() {
  visibleCommendationForm.value = true;
  decision.value = {} as DecisionInterface;
  selectedDecision.value = {} as DecisionInterface;
}

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
    decisions.value = allDecision.value.map((d: any) => {
      return d;
    });
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
} = searchAdvanceReward();
const decision = ref({} as DecisionInterface);
const confirm = useConfirm();
onResult((res) => {
  totalAll.value = res.data.searchAdvanceReward.totalAll ?? 0;
  totalDraft.value = res.data.searchAdvanceReward.totalDraft ?? 0;
  totalPending.value = res.data.searchAdvanceReward.totalWaitingApprove ?? 0;
  totalApproved.value = res.data.searchAdvanceReward.totalApproved ?? 0;
  totalReject.value = res.data.searchAdvanceReward.totalRejected ?? 0;

  allDecision.value = res.data.searchAdvanceReward.allDecision;
  draftDecisions.value = res.data.searchAdvanceReward.draftDecision;
  pendingDecisions.value = res.data.searchAdvanceReward.waitingApproveDecision;
  approvedDecisions.value = res.data.searchAdvanceReward.approvedDecision;
  rejectDecisions.value = res.data.searchAdvanceReward.rejectDecision;

  changeTab(tab.value);

});

load(undefined, {
  keyword: '',
  rewardPayload: null
});

const menuAction = ref();
const headerDetail = ref();
const menuActions = [
  {
    label: t('common.detail'),
    icon: 'info',
    visible: hasPermission('/HRM/HRM_DEVELOPMENT/HRM_REWARD/VIEW'),
    command: () => {
      visibleDetail.value = true;
      if (selectedDecision.value.decisionType == 'COMMENDATION') {
        headerDetail.value = 'Quyết định khen thưởng';
      } else if (selectedDecision.value.decisionType == 'DISCIPLINE') {
        headerDetail.value = 'Quyết định kỷ luật lao động';
      }
    },
  },
  {
    label: t('common.edit'),
    icon: 'edit',
    visible: hasPermission('/HRM/HRM_DEVELOPMENT/HRM_REWARD/UPDATE'),
    command: () => {
      if (selectedDecision.value.decisionType == 'COMMENDATION') {
        visibleCommendationForm.value = true;
      } else if (selectedDecision.value.decisionType == 'DISCIPLINE') {
        visibleDisciplineForm.value = true;
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
    visible: hasPermission('/HRM/HRM_DEVELOPMENT/HRM_REWARD/DELETE'),
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
];

const types = [
  {
    label: 'Quyết định khen thưởng',
    command: () => {
      visibleCommendationForm.value = true;
      decision.value = {} as DecisionInterface;
      selectedDecision.value = {} as DecisionInterface;
    }
  },
  {
    label: 'Quyết định kỷ luật lao động',
    command: () => {
      visibleDisciplineForm.value = true;
      decision.value = {} as DecisionInterface;
      selectedDecision.value = {} as DecisionInterface;
    }
  }
];

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
    code: 'COMMENDATION',
    label: 'Quyết định khen thưởng',
    command() {
      searchDecisionType.value == 'COMMENDATION' ? load(undefined, { keyword: '' }) : load(undefined, {
        keyword: '',
        decisionType: 'COMMENDATION'
      });
      if (searchDecisionType.value == 'COMMENDATION') {
        searchDecisionType.value = ref();
      } else {
        searchDecisionType.value = 'COMMENDATION';
      }
    },
  }, {
    code: 'DISCIPLINE',
    label: 'Quyết định kỷ luật lao động',
    command() {
      searchDecisionType.value == 'DISCIPLINE' ? load(undefined, { keyword: '' }) : load(undefined, {
        keyword: '',
        decisionType: 'DISCIPLINE'
      });
      if (searchDecisionType.value == 'DISCIPLINE') {
        searchDecisionType.value = ref();
      } else {
        searchDecisionType.value = 'DISCIPLINE';
      }
    },
  }
]);

const toggle = (event: Event) => {
  menuUtils.value.toggle(event);
};

const menus = computed(() => tabMenu.value);

function rowClicked(event: any) {
  if (event?.data?.decisionType == 'COMMENDATION') {
    headerDetail.value = 'Quyết định khen thưởng';
  } else if (event?.data?.decisionType == 'DISCIPLINE') {
    headerDetail.value = 'Quyết định kỷ luật lao động';
  }
  selectedDecision.value = event?.data;
  visibleDetail.value = true;

}

watch(submit, () => {
  load(undefined, {
    keyword: searchTerm.value,
    rewardPayload: {
      ...model.value,
      decisionDateFrom: model.value.decisionDateFrom ? moment(model.value.decisionDateFrom).format('YYYY-MM-DD') : null,
      decisionDateTo: model.value.decisionDateTo ? moment(model.value.decisionDateTo).format('YYYY-MM-DD') : null,
      effectStartDate: model.value.effectStartDate ? moment(model.value.effectStartDate).format('YYYY-MM-DD') : null,
      effectEndDate: model.value.effectEndDate ? moment(model.value.effectEndDate).format('YYYY-MM-DD') : null
    }
  });
});

function trySetField() {
  if (!leaderUserLoaded.value || !categoryLoaded.value) {
    return;
  }

  fields.value = {
    organizationId: {
      label: 'Đơn vị',
      component: markRaw(OrganizationTree),
      col: 6,
      props: {
        'selection-mode': 'single',
        'org-type': userDeptRole.value.type,
      }
    },
    decisionType: {
      label: 'Danh hiệu',
      type: String,
      col: 6,
      optionsDropdown: decisionTypes.map((d) => ({
        id: d.code,
        name: d.label
      })),
      isMultiSelect: true
    },
    employeeOrganization: {
      label: 'Đơn vị/Nhân sự',
      col: 6,
    }, // để tạm, sẽ cập nhật đúng khi watch chạy
    decisionDateFrom: {
      label: 'Ngày quyết định: Từ ngày',
      type: String,
      col: 6,
      isDatePicker: true
    },
    decisionDateTo: {
      label: 'Ngày quyết định: Đến ngày',
      type: String,
      col: 6,
      isDatePicker: true
    },
    effectStartDate: {
      label: 'Ngày hiệu lực: Từ ngày',
      type: String,
      col: 6,
      isDatePicker: true
    },
    effectEndDate: {
      label: 'Ngày hiệu lực: Đến ngày',
      type: String,
      col: 6,
      isDatePicker: true
    },
    signer: {
      label: 'Người ký',
      type: String,
      col: 6,
      optionsDropdown: leaderUsers.value.map((d) => ({
        id: d.id,
        name: d.username
      })),
      isMultiSelect: true
    },
    decisionMakingLevelId: {
      label: 'Cấp ra quyết định',
      type: String,
      col: 6,
      optionsDropdown: decisionMakingLevels.value.map((d) => ({
        id: d.code,
        name: d.name
      })),
      isMultiSelect: true
    }
  };

  // Cập nhật đúng loại field employeeOrganization lần đầu
  updateEmployeeOrganizationField(model.value.objectCommendation);

  // Gọi setFields
  setFields(fields.value);
}

watch(() => model.value.objectCommendation, (value) => {
  updateEmployeeOrganizationField(value);
});

function updateEmployeeOrganizationField(type: string) {
  if (type === 'ORGANIZATION') {
    fields.value.employeeOrganization = {
      label: 'Phòng ban',
      component: markRaw(OrganizationTree),
      col: 6,
      props: {
        'selection-mode': 'single',
        'org-type': userDeptRole.value.type,
      }
    };
  } else if (type === 'EMPLOYEE') {
    fields.value.employeeOrganization = {
      label: 'Nhân sự',
      type: String,
      col: 6,
      optionsDropdown: users.value.map((u: any) => ({
        id: u.id,
        name: u.fullName
      })),
      isMultiSelect: true
    };
  }

  // Cập nhật lại UI mà không làm mất thứ tự
  setFields({ ...fields.value });
}
</script>

<style scoped>
:deep(.p-splitbutton-menubutton) {
  border-radius: 0
}

</style>
