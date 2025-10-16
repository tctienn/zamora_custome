<template>
  <div
    class=''
    style='height: calc(100vh - 6rem)'>
    <div class='flex flex-column'>
      <Toolbar
        class='p-0'
        style='min-height: 3rem'>
        <template #start>
          <div class='flex gap-3'>
            <div class='align-items-center flex font-semibold gap-2 pl-2'>
              Danh sách quyết định
            </div>
          </div>
        </template>
        <template #end>
          <div class='btn-group-toolbar flex gap-1 mr-1'>

            <SplitButton
              v-if='hasPermission("/HRM/HRM_CONTRACT_DECISION/HRM_DECISION/CREATE")'
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
              class='focus:shadow-none font-normal gap-2 hover:surface-200'
              :label='t("common.filter")'
              severity='secondary'
              @click='toggle'>
              <template #icon>
                <i
                  class='pi pi-filter'
                  style='margin-top: 1px'></i>
                <i class='flex-order-2 mt-1 pi pi-angle-down'/>
              </template>
            </Button>
            <Button
              class='focus:shadow-none font-normal hover:surface-200'
              icon='pi pi-file-import'
              label='Import'
              severity='secondary'></Button>
            <Button
              class='focus:shadow-none font-normal hover:surface-200'
              icon='pi pi-file-export'
              label='Export'
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
        v-if='viewType == "decisionType"'
        :data='decisions'
        view-type='decisionType'/>

      <DecisionGroupItem
        v-if='viewType == "signerName"'
        :data='decisions'
        view-type='signerName'/>

      <div class='full-height-table-wrapper'>
        <DataTable
          v-if='viewType == "all"'
          v-bind='DEFAULT_DATATABLE_CONFIG'
          v-model:selection='selectedDecision'
          class='full-height-table surface-0'
          group-rows-by='key'
          :loading='loading'
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
                {{ index + 1 + (pageable.page * pageable.size) }}
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
            header-class='w-10rem'/>

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
            header-class='w-20rem'>
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
            header-class='w-8rem'>
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
            header-class='w-8rem'>
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
      </div>
      <Paginator
        v-if='total'
        class='pr-2'
        current-page-report-template='{first}-{last}/{totalRecords}'
        :pt="{
          root: {
            class: 'border-noround-top'
          },
          paginatorwrapper: {
            class: 'custom-paginator-wrapper fix-center'
          },
        }"
        :rows='size'
        template='FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink JumpToPageDropdown CurrentPageReport'
        :total-records='total'
        @page='onPage'/>
    </div>
  </div>

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

  <FormSalaryDecision
    v-if='visibleSalaryAdjustmentForm'
    :decision-id='selectedDecision?.id'
    :visible='visibleSalaryAdjustmentForm'
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

  <FormOtherDecision
    v-if='visibleOtherForm'
    :decision-id='selectedDecision?.id'
    :visible='visibleOtherForm'
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
    :header='"Chi tiết "+ headerDetail'
    :visible='visibleDetail'
    @hide-dialog='hideDialog'/>

  <Menu
    ref='menuAction'
    :model='menuActions'
    :popup='true'>

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
import { cloneDeep, get } from 'lodash';
import { storeToRefs } from 'pinia';
import Column from 'primevue/column';
import type Menu from 'primevue/menu';
import type { PageState } from 'primevue/paginator';
import { useConfirm } from 'primevue/useconfirm';
import { computed, inject, markRaw, reactive, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { getAllUserServicePublic } from '@/apps/admin/api/graphql/admin-customer-tenant';
import { usePermissionStore } from '@/apps/admin/store/permission';
import { useDocumentRolesStore } from '@/apps/document/store/document-role';
import { getAllCategory } from '@/apps/hrm/api/graphql/category';
import { deleteById, getStatusesDecision, searchDecisionAdvance } from '@/apps/hrm/api/graphql/decision';
import HrmAvatar from '@/apps/hrm/components/HrmAvatar.vue';
import type { FileAttachmentEdge } from '@/apps/hrm/model/attachment';
import { type DecisionInterface, mapDecisionStatus, mapDecisionType } from '@/apps/hrm/model/decision';
import FormDecision from '@/apps/hrm/views/decision/AppointmentDecision/FormDecision.vue';
import FormCommendationDecision from '@/apps/hrm/views/decision/CommendationDecision/FormCommendationDecision.vue';
import DecisionDetail from '@/apps/hrm/views/decision/DecisionDetail.vue';
import DecisionGroupItem from '@/apps/hrm/views/decision/DecisionGroupItem.vue';
import FormDisciplineDecision from '@/apps/hrm/views/decision/Discipline/FormDisciplineDecision.vue';
import FormDismissalDecision from '@/apps/hrm/views/decision/Dismissal/FormDismissalDecision.vue';
import FormOtherDecision from '@/apps/hrm/views/decision/OtherDecision/FormOtherDecision.vue';
import FormReceptionDecision from '@/apps/hrm/views/decision/ReceptionDecision/FormReceptionDecision.vue';
import FormSalaryDecision from '@/apps/hrm/views/decision/SalaryAdjustmentDecision/FormSalaryDecision.vue';
import SettingStatus from '@/apps/hrm/views/decision/SettingStatus.vue';
import FormTerminationDecision from '@/apps/hrm/views/decision/TerminationDecision/FormTerminationDecision.vue';
import FormTransferDecision from '@/apps/hrm/views/decision/TransferDecision/FormTransferDecision.vue';
import OrganizationTree from '@/apps/work-flow/views/components/OrganizationTree/OrganizationTree.vue';
import AppUser from '@/common/components/app/AppUser.vue';
import { DEFAULT_DATATABLE_CONFIG } from '@/common/constants';
import { toastSuccess } from '@/common/helpers/custom-toast-service';
import { generateAvatarUrl } from '@/common/helpers/file-utils';
import useMoment from '@/common/helpers/mixins/use-moment';
import type { Pageable } from '@/common/model/query';
import { useGlobalSearchStore } from '@/common/store/search';

const hasPermission = usePermissionStore().hasPermission;
const { moment } = useMoment();
const { t } = useI18n();
const selectedDecision = ref({} as DecisionInterface);
const decisions = ref([] as DecisionInterface[]);
const decisionMakingLevels = ref<any[]>([]);
const visibleDetail = ref(false);
const loading = ref(true);
const visibleSettingStatus = ref(false);
const totalAll = ref(0);
const totalDraft = ref(0);
const totalPending = ref(0);
const size = 50;
const total = ref(0);
const totalApproved = ref(0);
const totalReject = ref(0);
const { setFields } = useGlobalSearchStore();
const {
  submit,
  model
} = storeToRefs(useGlobalSearchStore());
const { userDeptRole } = storeToRefs(
  useDocumentRolesStore(),
);

const defaultFilter = ref({
  organizationId: String,
  decisionType: String,
  signer: String,
  decisionMakingLevelId: String,
  decisionDateFrom: String,
  decisionDateTo: String,
  effectStartDate: Date,
  effectEndDate: Date,
  status: String
});

const visibleForm = ref(false);
const visibleTerminationForm = ref(false);
const visibleOtherForm = ref(false);
const visibleDismissalForm = ref(false);
const visibleTransferForm = ref(false);
const visibleSalaryAdjustmentForm = ref(false);
const visibleCommendationForm = ref(false);
const visibleDisciplineForm = ref(false);
const visibleReceptionForm = ref(false);
const searchTerm = inject('searchTerm', ref(''));
const tab = ref<string>('ALL');
const viewType = ref<string>('all');
const leaderUsers = ref<any[]>([]);
const leaderUserLoaded = ref(false);
const pageable = reactive<Pageable>({
  page: 0,
  size: 50
});
const categoryLoaded = ref(false);
const { onResult: categoryResult } = getAllCategory(userDeptRole.value, 'DECISION_LEVEL');
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

function onPage(event: PageState) {
  pageable.page = event.page;
}

function trySetField() {
  if (!leaderUserLoaded.value || !categoryLoaded.value) {
    return;
  }
  setFields({
    organizationId: {
      label: 'Đơn vị',
      component: markRaw(OrganizationTree),
      col: 6,
      props: {
        'selection-mode': 'single',
        'org-type': userDeptRole.value.type,
      },
    },
    decisionType: {
      label: 'Loại quyết định',
      type: String,
      col: 6,
      optionsDropdown: decisionTypes.map((d) => ({
        id: d.code,
        name: d.label
      })),
      isMultiSelect: true,
    },
    decisionDateFrom: {
      label: 'Ngày quyết định: Từ ngày',
      type: String,
      col: 6,
      isDatePicker: true,
    },
    decisionDateTo: {
      label: 'Ngày quyết định: Đến ngày',
      type: String,
      col: 6,
      isDatePicker: true,
    },
    effectStartDate: {
      label: 'Ngày hiệu lực: Từ ngày',
      type: String,
      col: 6,
      isDatePicker: true,
    },
    effectEndDate: {
      label: 'Ngày hiệu lực: Đến ngày',
      type: String,
      col: 6,
      isDatePicker: true,
    },
    signer: {
      label: 'Người ký',
      type: String,
      col: 6,
      optionsDropdown: leaderUsers.value.map((d) => ({
        id: d.id,
        name: `${d.email} | ${d.fullName} | ${d.username}`
      })),
      isMultiSelect: true,
    },
    decisionMakingLevelId: {
      label: 'Cấp ra quyết định',
      type: String,
      col: 6,
      optionsDropdown: decisionMakingLevels.value.map((d) => ({
        id: d.code,
        name: d.name
      })),
      isMultiSelect: true,
    }
  });
}

function openForm() {
  visibleForm.value = true;
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
  visibleOtherForm.value = false;
  visibleDismissalForm.value = false;
  visibleCommendationForm.value = false;
  visibleDisciplineForm.value = false;
  visibleReceptionForm.value = false;
  visibleSettingStatus.value = false;
  visibleDetail.value = false;
  visibleSalaryAdjustmentForm.value = false;
  refetch();
  decision.value = {} as DecisionInterface;
  selectedDecision.value = {} as DecisionInterface;
}

function searchDecisionByTab(tb: string) {
  load(undefined, {
    keyword: searchTerm.value,
    decisionPayload: {
      ...model.value,
      decisionDateFrom: model.value.decisionDateFrom ? moment(model.value.decisionDateFrom).format('YYYY-MM-DD') : null,
      decisionDateTo: model.value.decisionDateTo ? moment(model.value.decisionDateTo).format('YYYY-MM-DD') : null,
      effectStartDate: model.value.effectStartDate ? moment(model.value.effectStartDate).format('YYYY-MM-DD') : null,
      effectEndDate: model.value.effectEndDate ? moment(model.value.effectEndDate).format('YYYY-MM-DD') : null,
      status: tb
    },
    pageable: pageable
  });
}

function changeTab(tb: string) {
  tab.value = tb;
  loading.value = true;
  if (tab.value == 'ALL') {
    load(undefined, {
      keyword: searchTerm.value,
      decisionPayload: {
        ...model.value,
        decisionDateFrom: model.value.decisionDateFrom ? moment(model.value.decisionDateFrom).format('YYYY-MM-DD') : null,
        decisionDateTo: model.value.decisionDateTo ? moment(model.value.decisionDateTo).format('YYYY-MM-DD') : null,
        effectStartDate: model.value.effectStartDate ? moment(model.value.effectStartDate).format('YYYY-MM-DD') : null,
        effectEndDate: model.value.effectEndDate ? moment(model.value.effectEndDate).format('YYYY-MM-DD') : null,
        status: null
      },
      pageable: pageable
    });
  } else {
    searchDecisionByTab(tb);
  }
  loading.value = false;
}

const {
  onResult,
  refetch,
  load
} = searchDecisionAdvance();

const {
  onResult: getStatusOnResult,
  load: getStatusLoad
} = getStatusesDecision();
const decision = ref({} as DecisionInterface);
const confirm = useConfirm();

getStatusOnResult((res) => {
  const data = res.data.getStatusesDecision;
  totalDraft.value = data.find((d: any) => d.status == 'DRAFT')?.total ?? 0;
  totalPending.value = data.find((d: any) => d.status == 'WAITING_APPROVE')?.total ?? 0;
  totalApproved.value = data.find((d: any) => d.status == 'APPROVED')?.total ?? 0;
  totalReject.value = data.find((d: any) => d.status == 'REJECTED')?.total ?? 0;

  totalAll.value = totalDraft.value + totalPending.value + totalApproved.value + totalReject.value;
});

onResult((res) => {
  const {
    totalCount,
    edges
  } = get(res, 'data.searchDecisionAdvance', {
    totalCount: 0,
    edges: []
  });
  total.value = totalCount;
  decisions.value = edges.map((edge: FileAttachmentEdge, index: number) => ({
    ...edge.node,
    ordinalNumber: pageable.page * pageable.size + index + 1
  }));

  loading.value = false;
});

load(undefined, {
  keyword: '',
  decisionPayload: defaultFilter.value,
  pageable: pageable
});

getStatusLoad(undefined, {
  keyword: '',
  decisionPayload: defaultFilter.value
});

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
    icon: 'pi pi-info-circle',
    visible: hasPermission('/HRM/HRM_CONTRACT_DECISION/HRM_DECISION/VIEW'),
    command: () => {
      visibleDetail.value = true;
      const decisionTypeMap: Record<string, string> = {
        APPOINTMENT: 'Quyết định bổ nhiệm',
        TRANSFER: 'Quyết định điều chuyển',
        CONTRACT_TERMINATION: 'Quyết định chấm dứt HĐLĐ',
        COMMENDATION: 'Quyết định khen thưởng',
        DISCIPLINE: 'Quyết định kỷ luật lao động',
        RECEPTION: 'Quyết định tiếp nhận',
        DISMISSAL: 'Quyết định miễn nhiệm',
        SALARY_ADJUSTMENT: 'Quyết định điều chỉnh lương',
        OTHER: 'Quyết định khác'
      };

      headerDetail.value = decisionTypeMap[selectedDecision.value.decisionType] || 'Quyết định';
    },
  },
  {
    label: t('common.edit'),
    icon: 'pi pi-pencil',
    visible: hasPermission('/HRM/HRM_CONTRACT_DECISION/HRM_DECISION/UPDATE'),
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
      } else if (selectedDecision.value.decisionType == 'SALARY_ADJUSTMENT') {
        visibleSalaryAdjustmentForm.value = true;
      } else if (selectedDecision.value.decisionType == 'OTHER') {
        visibleOtherForm.value = true;
      }
    },
  },
  {
    label: 'Thiết lập trạng thái',
    icon: 'pi pi-tag',
    command: () => {
      visibleSettingStatus.value = true;
    },
  },
  {
    label: t('common.delete'),
    icon: 'pi pi-trash',
    visible: hasPermission('/HRM/HRM_CONTRACT_DECISION/HRM_DECISION/DELETE'),
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

const types = [
  {
    label: 'Quyết định tiếp nhận',
    command: () => {
      visibleReceptionForm.value = true;
      decision.value = {} as DecisionInterface;
      selectedDecision.value = {} as DecisionInterface;
    }
  },
  {
    label: 'Quyết định bổ nhiệm',
    command: () => {
      visibleForm.value = true;
      decision.value = {} as DecisionInterface;
      selectedDecision.value = {} as DecisionInterface;
    }
  },
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
  },
  {
    label: 'Quyết định điều chuyển',
    command: () => {
      visibleTransferForm.value = true;
      decision.value = {} as DecisionInterface;
      selectedDecision.value = {} as DecisionInterface;
    }
  },
  {
    label: 'Quyết định điều chỉnh lương',
    command: () => {
      visibleSalaryAdjustmentForm.value = true;
      decision.value = {} as DecisionInterface;
      selectedDecision.value = {} as DecisionInterface;
    }
  },
  {
    label: 'Quyết định miễn nhiệm',
    command: () => {
      visibleDismissalForm.value = true;
      decision.value = {} as DecisionInterface;
      selectedDecision.value = {} as DecisionInterface;
    }
  },
  {
    label: 'Quyết định chấm dứt HĐLĐ',
    command: () => {
      visibleTerminationForm.value = true;
      decision.value = {} as DecisionInterface;
      selectedDecision.value = {} as DecisionInterface;
    }
  },
  {
    label: 'Quyết định khác',
    command: () => {
      visibleOtherForm.value = true;
      decision.value = {} as DecisionInterface;
      selectedDecision.value = {} as DecisionInterface;
    }
  },
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
  menuActions[1].visible = selectedDecision.value.status !== 'APPROVED';
  menuActions[2].visible = selectedDecision.value.status !== 'APPROVED';
  menuActions[3].visible = selectedDecision.value.status !== 'APPROVED';
}

watch(searchTerm, (newValue) => {
  decisions.value = [];
  load(undefined, {
    keyword: newValue,
    decisionPayload: defaultFilter.value,
    pageable: pageable
  });

  getStatusLoad(undefined, {
    keyword: newValue,
    decisionPayload: defaultFilter.value
  });
  // changeTab(tab.value);
});
const searchDecisionType = ref();
const menuUtils = ref();

const items = ref(
  decisionTypes.map(({
    code,
    label
  }) => ({
    code,
    label,
    command() {
      if (searchDecisionType.value === code) {
        load(undefined, {
          keyword: '',
          decisionPayload: {
            ...defaultFilter.value,
            decisionType: null
          },
          pageable: pageable
        });

        getStatusLoad(undefined, {
          keyword: '',
          decisionPayload: {
            ...defaultFilter.value,
            decisionType: null
          },
        });
        searchDecisionType.value = ref();
      } else {
        load(undefined, {
          keyword: '',
          decisionPayload: {
            ...defaultFilter.value,
            decisionType: code
          },
          pageable: pageable
        });

        getStatusLoad(undefined, {
          keyword: '',
          decisionPayload: {
            ...defaultFilter.value,
            decisionType: code
          },
        });
        searchDecisionType.value = code;
      }
    },
  }))
);

const toggle = (event: Event) => {
  menuUtils.value.toggle(event);
};

const menus = computed(() => tabMenu.value);

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
  } else if (event?.data?.decisionType == 'SALARY_ADJUSTMENT') {
    headerDetail.value = 'Quyết định điều chỉnh lương';
  }
  selectedDecision.value = event?.data;
  visibleDetail.value = true;
}

watch(submit, () => {
  load(undefined, {
    keyword: searchTerm.value,
    decisionPayload: {
      ...model.value,
      decisionDateFrom: model.value.decisionDateFrom ? moment(model.value.decisionDateFrom).format('YYYY-MM-DD') : null,
      decisionDateTo: model.value.decisionDateTo ? moment(model.value.decisionDateTo).format('YYYY-MM-DD') : null,
      effectStartDate: model.value.effectStartDate ? moment(model.value.effectStartDate).format('YYYY-MM-DD') : null,
      effectEndDate: model.value.effectEndDate ? moment(model.value.effectEndDate).format('YYYY-MM-DD') : null
    },
    pageable: pageable
  });

  getStatusLoad(undefined, {
    keyword: searchTerm.value,
    decisionPayload: {
      ...model.value,
      decisionDateFrom: model.value.decisionDateFrom ? moment(model.value.decisionDateFrom).format('YYYY-MM-DD') : null,
      decisionDateTo: model.value.decisionDateTo ? moment(model.value.decisionDateTo).format('YYYY-MM-DD') : null,
      effectStartDate: model.value.effectStartDate ? moment(model.value.effectStartDate).format('YYYY-MM-DD') : null,
      effectEndDate: model.value.effectEndDate ? moment(model.value.effectEndDate).format('YYYY-MM-DD') : null
    }
  });
});
</script>

<style scoped>
:deep(.p-splitbutton-menubutton) {
  border-radius: 0
}

:deep(.p-tabmenu-nav) {
  margin-top: 8px
}

.tool-bar {
  background-color: var(--surface-overlay);
  min-height: 3rem;
}

:deep(.p-calendar .p-inputtext) {
  padding: 0.5rem;
  max-height: 36px;
  margin-top: auto;
  margin-bottom: auto;
}

:deep(.custom-select) {
  max-height: 36px;
  margin-top: auto;
  margin-bottom: auto;
}

:deep(.p-treeselect-label) {
  padding: 0.5rem;
  max-height: 36px;
}

:deep(.p-accordion-header-link) {
  padding: 7px;
}

:deep(.p-paginator-element) {
  max-height: 30px;
  width: 30px;
  min-width: 30px;
  border-radius: 8px;
}

:deep(.p-paginator .p-dropdown .p-dropdown-label) {
  max-height: 36px;
  padding: 0.5rem;
}

:deep(.p-paginator .p-dropdown .p-dropdown-trigger) {
  width: 32px;
  height: 32px;
}

:deep(.p-paginator .p-dropdown) {
  height: 32px;
  padding: 0;
}

:deep(.p-paginator.p-component) {
  padding: 0;
}

:deep(.p-paginator-current) {
  max-height: 36px;
  padding: 0.5rem;
}
.custom-paginator-wrapper {
  display: flex;
  height: 40px;
  position: absolute;
  align-items: center;
  overflow: hidden;
}
</style>
