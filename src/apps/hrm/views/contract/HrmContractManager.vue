<template>
  <div class='flex flex-column gap-2'>
    <Toolbar class='p-0 px-2'>
      <template #start>
        <div class='align-items-center flex gap-2'>
          <ButtonIcon
            v-tooltip='"Ẩn/Hiện"'
            class='align-self-center p-1'
            icon='menu'
            rounded
            text
            @click='listRef?.toggleTree()'/>

          <div class='font-bold'>
            {{ t('hrm.contract.title') }}
          </div>
        </div>

      </template>
      <template #end>
        <div class='btn-group-toolbar flex gap-1 mr-1 my-1'>
          <Button
            v-if='hasPermission("/HRM/HRM_CONTRACT_DECISION/HRM_CONTRACT/CREATE")'
            class='btn-create focus:shadow-none font-medium p-2'
            icon='pi pi-plus'
            :label='t("common.create")'
            @click='createContract'></Button>
          <Button
            class='focus:shadow-none font-normal gap-2 hover:surface-200'
            :label='t("common.viewBy")'
            severity='secondary'
            @click='viewTypeRef?.toggle'>
            <template #icon>
              <i
                class='pi pi-list'
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
          <Button
            class='focus:shadow-none font-normal hover:surface-200'
            icon='pi pi-cog'
            :label='t("common.setting")'
            severity='secondary'
            @click='configFormVisible = true'></Button>
        </div>
      </template>
    </Toolbar>
    <HrmContractListWrapper
      ref='listRef'
      :group-field-table='`${viewType}`'
      @show:detail='(data: any) => handleViewDetail(data)'/>
    <Paginator
      :class='{ hidden: !total }'
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
  <HrmContractFormSidebar
    v-model='contractEdit'
    v-model:visible='visible'/>
  <HrmContractDetailSidebar
    v-model='contractEdit'
    v-model:visible='detailVisible'
    :hd-template='hdTemplate'/>
  <Menu
    ref='viewTypeRef'
    :model='viewTypeMenu'
    popup>

    <template #item='itemProp'>
      <div class='cursor-pointer flex gap-1 p-2'>
        <AppIcon
          class='mr-2'
          name='check'
          size='1.5'
          :style='{opacity:viewType == itemProp.item.key ? 1 : 0,
                   color: viewType == itemProp.item.key ? "#0d99ff" : ""}'/>

        <div
          :style='{color: viewType == itemProp.item.key ? "#0d99ff" : ""}'>
          {{ itemProp.item.label }}
        </div>
      </div>
    </template>
  </Menu>
  <HrmConfigForm v-model:visible='configFormVisible'/>
</template>

<script lang='ts' setup>
import { storeToRefs } from 'pinia';
import type Menu from 'primevue/menu';
import type { PageState } from 'primevue/paginator';
import { computed, onMounted, provide, reactive, type Ref, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { usePermissionStore } from '@/apps/admin/store/permission';
import { useUserMoreInfoStore } from '@/apps/admin/store/usersMoreInfo';
import { RoleType } from '@/apps/document/model/permission';
import { useDocumentRolesStore } from '@/apps/document/store/document-role';
import { getAllCategory } from '@/apps/hrm/api/graphql/category';
import { findContractById } from '@/apps/hrm/api/graphql/contract';
import { CATEGORY_TYPE } from '@/apps/hrm/constants/category';
import type { HrmCategory } from '@/apps/hrm/model/category';
import type { Contract } from '@/apps/hrm/model/contract';
import HrmContractDetailSidebar from '@/apps/hrm/views/contract/HrmContractDetailSidebar.vue';
import HrmContractFormSidebar from '@/apps/hrm/views/contract/HrmContractFormSidebar.vue';
import HrmContractListWrapper from '@/apps/hrm/views/contract/list/HrmContractListWrapper.vue';
import HrmConfigForm from '@/apps/hrm/views/profile/form/config/HrmConfigForm.vue';
import { useHrmProfileStore } from '@/common/store/hrm-profile';
import { useGlobalSearchStore } from '@/common/store/search';

type ViewTypeInterface = 'all' | 'type' | 'workType' | 'effectiveMonth';
const hasPermission = usePermissionStore().hasPermission;
const { t } = useI18n();
const visible = ref(false);
const detailVisible = ref(false);
const listRef = ref<InstanceType<typeof HrmContractListWrapper>>();
const needRefresh = ref(false);
const contractEdit = ref<Contract>({} as Contract);
const hdTemplate = ref('');
const viewTypeRef = ref<InstanceType<typeof Menu> | null>(null);
const viewType = ref<ViewTypeInterface>('all');
const configFormVisible = ref(false);
const viewTypeMenu = ref([
  {
    label: t('Đầy đủ'),
    key: 'all',
    command: () => {
      viewType.value = 'all';
    },
  },
  {
    label: t('hrm.contract.general.contractType'),
    key: 'type',
    command: () => {
      viewType.value = 'type';
    },
  },
  {
    label: t('hrm.contract.general.workingForm'),
    key: 'workType',
    command: () => {
      viewType.value = 'workType';
    },
  },
  {
    label: t('hrm.contract.general.effectiveMonth'),
    key: 'effectiveMonth',
    command: () => {
      viewType.value = 'effectiveMonth';
    },
  }
]);

const { setFields } = useGlobalSearchStore();
const hrmStore = useHrmProfileStore();
const { treeUnitData } = storeToRefs(hrmStore);

const store = useUserMoreInfoStore();
const { allUsers } = storeToRefs(store);
const signatoryData = computed(() =>
  allUsers.value
    .filter(user => user.roles?.includes(RoleType.LANH_DAO))
    .map(user => ({
      name: user.fullName,
      id: `${user.id}-${user.fullName}`,
    }))
);
const types = ref([]);
const jobTitles = ref([]);
const workTypes = ref([]);
const positions = ref([]);
const { userDeptRole } = storeToRefs(useDocumentRolesStore());
const getDataMapping = (type: string, targetRef: Ref, getName = true) => {
  getAllCategory(userDeptRole.value, type).onResult((res) => {
    targetRef.value = (res.data.getAllCategory as HrmCategory[]).map(c => ({
      name: c.name,
      id: getName ? `${c.code}-${c.name}` : c.code
    })) || [];
  });
};

onMounted(() => {
  getDataMapping(CATEGORY_TYPE.CONTRACT_TYPE, types, true);
  getDataMapping(CATEGORY_TYPE.JOB_TITLE, jobTitles, true);
  getDataMapping(CATEGORY_TYPE.WORK_TYPE, workTypes, true);
  getDataMapping(CATEGORY_TYPE.JOB_POSITION, positions, true);
  setFields({
    organization: {
      label: 'Chọn đơn vị',
      col: 6,
      isTreeSingleSelect: true,
      optionsTreeSelect: treeUnitData,
    },
    signatory: {
      label: t('hrm.contract.general.signatory'),
      col: 6,
      isMultiSelect: true,
      optionsDropdown: signatoryData,
    },
    type: {
      label: t('hrm.contract.general.type'),
      col: 6,
      type: String,
      isMultiSelect: true,
      optionsDropdown: types,
    },
    jobTitle: {
      label: t('hrm.contract.general.jobTitle'),
      type: String,
      optionsDropdown: jobTitles,
      isMultiSelect: true,
      col: 6,
    },
    workType: {
      label: t('hrm.contract.general.workType'),
      type: String,
      optionsDropdown: workTypes,
      isMultiSelect: true,
      col: 6,
    },
    position: {
      label: t('hrm.contract.general.position'),
      type: String,
      optionsDropdown: positions,
      isMultiSelect: true,
      col: 6,
    },

    signedDateFrom: {
      label: `${t('hrm.contract.general.signedDate')}: ${t('admin.organization.fromDate')} `,
      type: String,
      col: 3,
      isDatePicker: true,
    },
    signedDateTo: {
      label: `${t('hrm.contract.general.signedDate')}: ${t('admin.organization.toDate')} `,
      type: String,
      col: 3,
      isDatePicker: true,
    },
    expiryDateFrom: {
      label: `${t('hrm.contract.general.expiryDate2')}: ${t('admin.organization.fromDate')} `,
      type: String,
      col: 3,
      isDatePicker: true,
    },
    expiryDateTo: {
      label: `${t('hrm.contract.general.expiryDate2')}: ${t('admin.organization.toDate')} `,
      type: String,
      col: 3,
      isDatePicker: true,
    },
    haveInsurance: {
      label: t('hrm.contract.general.haveInsurance'),
      type: String,
      isCheckbox: true,
      col: 6
    },

    // splitButton: {
    //   label: '',
    //   col: 3,
    //   isSplitButton: true,
    // }
  });
});

function resetData() {
  contractEdit.value = {} as Contract;
}

function createContract() {
  resetData();
  visible.value = true;
}

const size = 50;
const pageable = reactive({
  page: 0,
  size
});

const total = ref(0);

function onPage(event: PageState) {
  pageable.page = event.page;
}

const handleViewDetail = (data: any) => {
  hdTemplate.value = data.hdTemplate;
  console.log(data);
  findContractById(data.id)
    .onResult(res => {
      contractEdit.value = res.data.findContractById;
      contractEdit.value.isContractConcurrent = res.data.findContractById.isContractConcurrent || false;
    });
  detailVisible.value = data.show;
};

provide('needRefresh', needRefresh);
provide('resetData', resetData);
provide('contractEdit', contractEdit);
provide('contractFormVisible', visible);
provide('pageable', pageable);
provide('total', total);
</script>

<style scoped>
:deep(.p-paginator) {
  border: unset;
  padding: unset;
}

.custom-paginator-wrapper {
  display: flex;
  height: 40px;
  position: absolute;
  align-items: center;
  overflow: hidden;
}

:deep(.p-paginator-page-options) {
  display: flex;
  align-items: center;
  height: 2rem;
}

:deep(.p-paginator .p-paginator-pages .p-paginator-page) {
  height: 2rem;
  min-width: 2rem;
  border-radius: 6px;
}</style>
