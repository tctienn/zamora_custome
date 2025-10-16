<template>
  <Toolbar
    class='p-0'
    style='min-height: 3rem'>
    <template #start>
      <div class='align-items-center flex font-semibold gap-2 ml-2'>
        {{ t('hrm.insurance.titleTab') }}
      </div>
    </template>
    <template #end>
      <div class='btn-group-toolbar flex gap-1 mr-1 my-1'>
        <Button
          v-if='tabIndex === 0 '
          class='btn-create focus:shadow-none font-normal hover:surface-200'
          icon='pi pi-plus-circle'
          :label="t('common.create')"
          @click='showForm = true'/>
        <Button
          v-if='tabIndex === 1'
          class='focus:shadow-none font-normal hover:surface-200'
          icon='pi pi-dollar'
          :label="t('Đóng bảo hiểm')"
          severity='secondary'
          @click='showInsuranceCoverageForm = true'/>
        <Button
          v-if='tabIndex === 0'
          class='focus:shadow-none font-normal hover:surface-200'
          icon='pi pi-sync'
          :label="t('Đồng bộ')"
          severity='secondary'
          @click='syncInsurance'/>
        <Button
          class='focus:shadow-none font-normal hover:surface-200'
          icon='pi pi-list'
          :label='t("Xem theo")'
          severity='secondary'
          @click='viewTypeRef?.toggle'/>
        <Button
          class='focus:shadow-none font-normal hover:surface-200'
          icon='pi pi-file-import'
          :label='t("common.import")'
          severity='secondary'></Button>
        <Button
          class='focus:shadow-none font-normal hover:surface-200'
          icon='pi pi-file-export'
          :label='t("common.export")'
          severity='secondary'
          @click='exportDialogVisible = true'></Button>
      </div>
    </template>
  </Toolbar>

  <div class='align-items-center flex justify-content-between my-2'>
    <TabMenu
      v-model:active-index='tabIndex'
      class='menu-height w-full'
      :model='menus'>
      <template #item='{item}'>
        <div
          v-ripple
          class='flex gap-2 p-menuitem-link p-ripple px-3 py-2'>
          <a style='height: 1.5rem'>{{ item.label }}</a>
        </div>
      </template>
    </TabMenu>
    <div
      v-if='tabIndex === 1'
      class='align-items-center flex gap-2'>
      Năm
      <Calendar
        v-model='date'
        class='w-8rem'
        date-format='yy'
        view='year'/>
      <Button
        v-for='m in 12'
        :key='m'
        :label="'T' + m"
        :outlined='month != m'
        :severity='(new Date().getMonth() + 1) >= m ? "success" : "contrast"'
        @click='month = m'/>
    </div>

  </div>

  <InsuranceTableGroup
    v-if='tabIndex === 0 && viewType !== "all"'
    ref='childRef'
    :group-field='viewType'
    @hide-dialog='hideDialogFn'/>

  <InsuranceTable
    v-if='tabIndex === 0 && viewType === "all"'
    ref='childRef'
    @hide-dialog='hideDialogFn'/>

  <InsuranceByMonthTable
    v-if='tabIndex === 1 && viewType === "all"'
    ref='childRefInsuranceByMonthTable'
    :month='month'
    :year='date.getFullYear()'
    @hide-dialog='hideDialogFn'/>

  <InsuranceByMonthTableGroup
    v-if='tabIndex === 1 && viewType !== "all"'
    ref='childRefInsuranceByMonthTable'
    :group-field='viewType'
    :month='month'
    :year='date.getFullYear()'
    @hide-dialog='hideDialogFn'/>

  <InsuranceForm
    v-if='showForm'
    :visible-dialog='showForm'
    @hide-dialog='hideDialogFn'/>

  <InsuranceCoverageForm
    v-if='showInsuranceCoverageForm'
    :month='month'
    :visible-dialog='showInsuranceCoverageForm'
    :year='date.getFullYear()'
    @hide-dialog='hideDialogFn'/>

  <ExportDialog
    v-if='exportDialogVisible'
    v-model:visibleDialog='exportDialogVisible'
    :export-options='exportOptions'
    :search='{searchInsurance: model, month: month, year: date.getFullYear()}'
    @hide-dialog='hideExportDialogVisibleDialog'/>

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
</template>

<script lang='ts' setup>
import camelcase from 'camelcase';
import { storeToRefs } from 'pinia';
import type Menu from 'primevue/menu';
import type { MenuItem } from 'primevue/menuitem';
import { computed, onMounted, reactive, type Ref, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { getAllOrganizationGraphql } from '@/apps/admin/api/graphql/organization-graphql-api';
import { usePermissionStore } from '@/apps/admin/store/permission';
import { useDocumentRolesStore } from '@/apps/document/store/document-role';
import ExportDialog from '@/apps/document/views/doc/component/ExportDialog.vue';
import { getAllCategory } from '@/apps/hrm/api/graphql/category';
import { createInsuranceIfNotExist } from '@/apps/hrm/api/graphql/insurance';
import { exportExcelInsuranceByMonth } from '@/apps/hrm/api/rest/insurance';
import { CATEGORY_TYPE } from '@/apps/hrm/constants/category';
import type { HrmCategory } from '@/apps/hrm/model/category';
import { InsuranceTab } from '@/apps/hrm/model/insurance';
import InsuranceByMonthTable from '@/apps/hrm/views/insurance/components/InsuranceByMonthTable.vue';
import InsuranceByMonthTableGroup from '@/apps/hrm/views/insurance/components/InsuranceByMonthTableGroup.vue';
import InsuranceCoverageForm from '@/apps/hrm/views/insurance/components/InsuranceCoverageForm.vue';
import InsuranceForm from '@/apps/hrm/views/insurance/components/InsuranceForm.vue';
import InsuranceTable from '@/apps/hrm/views/insurance/components/InsuranceTable.vue';
import InsuranceTableGroup from '@/apps/hrm/views/insurance/components/InsuranceTableGroup.vue';
import { useHrmProfileStore } from '@/common/store/hrm-profile';
import { useGlobalSearchStore } from '@/common/store/search';

const { t } = useI18n();
const tabIndex = ref(0);
const month = ref(new Date().getMonth() + 1);

const menus = reactive<MenuItem[]>(createMenus());
const tab = ref();
const showForm = ref(false);
const showInsuranceCoverageForm = ref(false);
const organizations = ref<any[]>([]);
const date = ref(new Date());
const exportDialogVisible = ref(false);
const hasPermission = usePermissionStore().hasPermission;

function createMenus(): MenuItem[] {
  return Object.keys(InsuranceTab).map(s => ({
    label: t(`hrm.insurance.insuranceTab.${camelcase(s)}`),
    code: s,
    command: () => {
      tab.value = InsuranceTab[s as keyof typeof InsuranceTab];
    }
  }));
}

const { setFields } = useGlobalSearchStore();
type ViewTypeInterface = 'all' | 'organizationId' | 'hospitalCode';
const viewTypeRef = ref<InstanceType<typeof Menu> | null>(null);
const viewType = ref<ViewTypeInterface>('all');
const viewTypeMenu = ref([
  {
    label: t('Đầy đủ'),
    key: 'all',
    command: () => {
      viewType.value = 'all';
    },
  },
  {
    label: 'Theo phòng ban',
    key: 'organizationId',
    command: () => {
      viewType.value = 'organizationId';
    },
  },
  {
    label: 'Nơi ĐK khám chữa bệnh',
    key: 'hospitalCode',
    command: () => {
      viewType.value = 'hospitalCode';
    },
  },
]);

const { model } = storeToRefs(useGlobalSearchStore());

const {
  mutate: createInsuranceIfNotExistMutate,
  onDone: createInsuranceIfNotExistDone,
} =
    createInsuranceIfNotExist();

function hideDialogFn() {
  showInsuranceCoverageForm.value = false;
  showForm.value = false;
  refetchInsuranceByMonthTable();
}

getAllOrganizationGraphql().onResult((res) => {
  organizations.value = res.data?.allOrganizationPublic || [];
});

const syncInsurance = () => {
  createInsuranceIfNotExistMutate();
};

createInsuranceIfNotExistDone(() => {
  refetchTable();
});

const childRef = ref();
const childRefInsuranceByMonthTable = ref();

function refetchTable() {
  if (childRef.value) {
    childRef.value.refetchTable();
  }
}

function refetchInsuranceByMonthTable() {
  if (childRefInsuranceByMonthTable.value) {
    childRefInsuranceByMonthTable.value.refetchTable();
  }
}

const exportOptions = computed(() => {
  const fileName = 'BẢNG THEO DÕI NHÂN SỰ ĐÓNG BẢO HIỂM';
  return [
    {
      label: t('document.exportDoc.exportPdf'),
      fileName: fileName + '.pdf',
      exportFunction: () => {
      },
      disabled: true,
      icon: '/images/file-types/pdf-logo.png',
    },
    {
      label: t('document.exportDoc.exportWord'),
      fileName: fileName + '.docx',
      exportFunction: () => {
      },
      disabled: true,
      icon: '/images/file-types/word-logo.png',
    },
    {
      label: t('document.exportDoc.exportExcel'),
      fileName: fileName + '.xlsx',
      exportFunction: exportExcelInsuranceByMonth,
      icon: '/images/file-types/excel-logo.png',
    },
  ];
});

function hideExportDialogVisibleDialog() {
  exportDialogVisible.value = false;
}

const hospitals = ref([]);
const positions = ref([]);
const hrmStore = useHrmProfileStore();
const { treeUnitData } = storeToRefs(hrmStore);
const { userDeptRole } = storeToRefs(useDocumentRolesStore());
const getDataMapping = (type: string, targetRef: Ref, getName = true) => {
  getAllCategory(userDeptRole.value, type).onResult((res) => {
    targetRef.value = (res.data.getAllCategory as HrmCategory[]).map(c => ({
      name: c.name,
      id: getName ? `${c.code}-${c.name}` : c.name
    })) || [];
  });
};

onMounted(() => {
  getDataMapping(CATEGORY_TYPE.HOSPITAL, hospitals, false);
  getDataMapping(CATEGORY_TYPE.JOB_POSITION, positions, false);
  setFields({
    organizationId: {
      label: 'Pháp nhân đóng',
      col: 6,
      isTreeSingleSelect: true,
      optionsTreeSelect: treeUnitData,
    },
    hospitalCode: {
      label: t('hrm.insurance.hospitalCode'),
      col: 6,
      optionsDropdown: hospitals,
    },
    jobPositions: {
      label: t('hrm.contract.general.position'),
      type: String,
      optionsDropdown: positions,
      isMultiSelect: true,
      col: 6,
    },
    dateFrom: {
      label: 'Từ tháng/năm tham gia',
      type: String,
      col: 3,
      isDatePicker: true,
    },
    dateTo: {
      label: 'Đến tháng/năm',
      type: String,
      col: 3,
      isDatePicker: true,
    },
  });
});

</script>

<style scoped>
.menu-height {
  min-height: 40px;
}
</style>
