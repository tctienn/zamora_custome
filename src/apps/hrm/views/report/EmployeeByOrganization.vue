<template>
  <Sidebar
    v-model:visible='visible'
    :block-scroll='true'
    :dismissable='false'
    position='right'
    :pt="{
      header: {
        class: 'border-bottom-1 border-300',
      },
    }"
    :show-close-icon='false'
    style='width:95vw'
    @hide="emits('hide-dialog')">
    <template #header>
      <div class='align-items-center flex justify-content-between w-full'>
        <div class='align-items-center flex gap-2 p-sidebar-header-content'>
          <Button
            icon='pi pi-arrow-left'
            severity='danger'
            @click='hideForm'/>
          {{ t('hrm.report.employeeByOrganizationReport') }}
        </div>
        <div class='flex gap-2'>

          <Button
            icon='pi pi-filter'
            label='Điều kiện lập'
            @click='togglePanel'/>
          <Button
            icon='pi pi-file-export'
            label='Kết xuất'
            @click='exportExcel'/>
          <!--          <Button-->
          <!--            icon='pi pi-print'-->
          <!--            label='In'/>-->
          <!--          <Button-->
          <!--            icon='pi pi-refresh'/>-->
        </div>
      </div>
    </template>
    <div
      v-if='processExport'
      class='align-content-center flex'
      style='height: calc(100vh - 10rem)'>
      <ProgressSpinner
        class='col col-fixed'
        stroke-width='8'/>
    </div>
    <DataTable
      v-else
      class='white-space-nowrap'
      :loading='isLoading'
      row-group-mode='rowspan'
      scroll-direction='both'
      scroll-height='flex'
      scrollable
      :show-gridlines='true'
      sort-mode='single'
      :sort-order='1'
      :value='data'>
      <ColumnGroup type='header'>
        <Row>
          <Column
            header='STT'
            :rowspan='2'/>
          <Column
            header='Mã nhân viên'
            :rowspan='2'/>
          <Column
            header='Họ và tên'
            :rowspan='2'/>

          <Column
            header='Ngày sinh'
            :rowspan='2'/>
          <Column
            header='Tuổi'
            :rowspan='2'/>
          <Column
            header='Giới tính'
            :rowspan='2'/>
          <Column
            header='Chức danh'
            :rowspan='2'/>
          <Column
            header='Chức vụ'
            :rowspan='2'/>
          <Column
            header='Loại lao động'
            :rowspan='2'/>
          <Column
            header='Quê quán'
            :rowspan='2'/>
          <Column
            header='Tình trạng hôn nhân'
            :rowspan='2'/>
          <Column
            header='Dân tộc'
            :rowspan='2'/>
          <Column
            header='Tôn giáo'
            :rowspan='2'/>
          <Column
            header='Đảng viên'
            :rowspan='2'/>
          <Column
            header='Đoàn viên'
            :rowspan='2'/>

          <Column
            :colspan='2'
            header='Thuộc diện chính sách'/>

          <Column
            :colspan='2'
            header='Nơi đăng ký HKTT'/>

          <Column
            :colspan='2'
            header='Nơi ở hiện nay'/>

          <Column
            header='Liên hện kẩn cấp'
            :rowspan='2'/>

          <Column
            header='Thành phần gia đình'
            :rowspan='2'/>

          <Column
            :colspan='3'
            header='Theo dõi CCCD/CMND'/>

          <Column
            header='Ngày vào đơn vị'
            :rowspan='2'/>
          <Column
            header='Thâm niên làm việc trong đơn vị'
            :rowspan='2'/>

          <Column
            :colspan='4'
            header='Trình độ chuyên môn'/>

          <Column
            header='Số di động'
            :rowspan='2'/>
          <Column
            header='Email'
            :rowspan='2'/>
          <Column
            header='Chiều cao'
            :rowspan='2'/>

          <Column
            header='Cân nặng'
            :rowspan='2'/>
        </Row>

        <Row>
          <Column header='Đã tham gia quân đội'/>
          <Column header='Con gia đình chính sách'/>
          <Column header='Số nhà, đường phố'/>
          <Column header='Xã/Phường, Quận/Huyện, Tỉnh/TP'/>

          <Column header='Số nhà, đường phố'/>
          <Column header='Xã/Phường, Quận/Huyện, Tỉnh/TP'/>

          <Column header='Số CCCD/CMND'/>
          <Column header='Ngày cấp'/>
          <Column header='Nơi cấp'/>

          <Column header='Trình độ văn hóa'/>
          <Column header='Bằng cấp'/>
          <Column header='Chuyên ngành'/>
          <Column header='Trình độ học vấn'/>
        </Row>
      </ColumnGroup>
      <Column
        field='ordinalNumber'
        header-style='width:3rem'>
      </Column>
      <Column field='code'/>
      <Column field='fullName'/>
      <Column field='birthDay'>
        <template #body='{data: {birthDay}}'>
          {{ birthDay ? moment(birthDay).format('DD/MM/YYYY') : '' }}
        </template>
      </Column>
      <Column field='age'/>
      <Column field='gender'>
        <template #body='{data: {gender}}'>
          {{ gender ? t('admin.employee.genderInfo.' + gender) : '' }}
        </template>
      </Column>
      <Column field='jobTitleName'/>
      <Column field='positionName'/>
      <Column field='employeeType'/>
      <Column field='homeTown'/>
      <Column field='maritalStatus'>
        <template #body='{data: {maritalStatus}}'>
          {{ maritalStatus ? t('hrm.profile.general.maritalStatusOptions.' + toLower(maritalStatus)) : '' }}
        </template>
      </Column>
      <Column field='nation'/>
      <Column field='religion'/>
      <Column field='isParty'>
        <template #body='{data: {isParty}}'>
          {{ isParty ? 'Có' : 'Không' }}
        </template>
      </Column>
      <Column field='isMember'>
        <template #body='{data: {isMember}}'>
          {{ isMember ? 'Có' : 'Không' }}
        </template>
      </Column>
      <Column field='dayJoiningRevolution'>
        <template #body='{data: {dayJoiningRevolution}}'>
          {{ dayJoiningRevolution ? moment(dayJoiningRevolution).format('DD/MM/YYYY') : '' }}
        </template>
      </Column>
      <Column field='childrenPolicyFamilies'/>
      <Column field='permanentResidentStreet'/>
      <Column field='permanentResident'/>
      <Column field='currentAddress'/>
      <Column field='currentResidence'/>
      <Column field='phoneNumber'/>
      <Column field='familyBackground'/>
      <Column field='cccdNumber'/>
      <Column field='issueDate'>
        <template #body='{data: {issueDate}}'>
          {{ issueDate ? moment(issueDate).format('DD/MM/YYYY') : '' }}
        </template>
      </Column>
      <Column field='issuePlace'/>
      <Column field='fromDate'>
        <template #body='{data: {fromDate}}'>
          {{ fromDate ? moment(fromDate).format('DD/MM/YYYY') : '' }}
        </template>
      </Column>
      <Column field='seniority'/>
      <Column field='educationalLevel'/>
      <Column field='degree'/>
      <Column field='major'/>
      <Column field='professionalLevel'/>
      <Column field='phoneNumber'/>
      <Column field='email'/>
      <Column field='height'/>
      <Column field='weight'/>
    </DataTable>

    <Paginator
      v-if='totalRecords'
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
      :total-records='totalRecords'
      @page='onPage'/>

    <OverlayPanel
      ref='op'
      class='w-30rem'
      unstyled>
      <div
        class='border-1 border-round formgrid grid mt-2 mx-0 overflow-auto py-3 search-popup shadow-4 surface-border surface-card'>
        <div class='col-12 field'>
          <label> Đơn vị </label>
          <Dropdown
            v-model='filter.departmentId'
            class='w-full'
            option-label='name'
            option-value='id'
            :options='organizations'
            show-clear>
            <template #option='{ option }'>
              <div
                class='flex gap-2 items-center relative'
                :class="{ 'text-blue font-semibold': option?.id === filter.departmentId }">
                <AppIcon
                  v-if='option?.id === filter.departmentId'
                  class='absolute'
                  name='check'
                  size='1.3'/>
                <span class='ml-4'>{{ option?.name }}</span>
              </div>
            </template>
          </Dropdown>
        </div>
        <FormInputDropdown
          v-model='filter.levelCode'
          class='col-6'
          is-multi-select
          :label="t('hrm.recruitment.general.level')"
          option-label='name'
          option-value='id'
          :options='levels'/>
        <FormInputDropdown
          v-model='filter.gender'
          class='col-6'
          is-show-clear
          :label="t('hrm.recruitment.general.gender')"
          option-label='label'
          option-value='value'
          :options='genderOptions'/>
        <FormInputDropdown
          v-model='filter.maritalStatus'
          class='col-6'
          is-show-clear
          :label="t('hrm.profile.general.maritalStatus')"
          option-label='label'
          option-value='value'
          :options='maritalStatusOptions'/>

        <div class='col-12 flex gap-2 justify-content-end'>
          <Button
            icon='pi pi-filter-slash'
            label='Xoá điều kiện'
            outlined
            @click='removeFilter'/>
          <Button
            icon='pi pi-check'
            label='Thực hiện'
            severity='primary'
            @click='search'/>
        </div>
      </div>
    </OverlayPanel>
  </Sidebar>
</template>

<script setup lang='ts'>
import { camelCase, get, toLower } from 'lodash';
import { storeToRefs } from 'pinia';
import Column from 'primevue/column';
import type { PageState } from 'primevue/paginator';
import { reactive, type Ref, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { getAllOrganizationGraphql } from '@/apps/admin/api/graphql/organization-graphql-api';
import type { OrganizationInterface } from '@/apps/admin/model/organization';
import { useDocumentRolesStore } from '@/apps/document/store/document-role';
import { getAllCategory } from '@/apps/hrm/api/graphql/category';
import { employeeByOrganizationReport } from '@/apps/hrm/api/graphql/employee';
import { exportExcelEmployeeByOrganization } from '@/apps/hrm/api/rest/employee';
import FormInputDropdown from '@/apps/hrm/components/form/FormInputDropdown.vue';
import { CATEGORY_TYPE } from '@/apps/hrm/constants/category';
import type { FileAttachmentEdge } from '@/apps/hrm/model/attachment';
import type { HrmCategory } from '@/apps/hrm/model/category';
import { Gender, MaritalStatus } from '@/apps/hrm/model/employee';
import AppIcon from '@/common/components/app/AppIcon.vue';
import { downloadFile } from '@/common/helpers/file-utils';
import useMoment from '@/common/helpers/mixins/use-moment';
import { type Pageable } from '@/common/model/query';

const emits = defineEmits(['hide-dialog']);
const filter = ref<{
  departmentId?: string | null,
  levelCode?: string | null,
  gender?: string | null,
  maritalStatus?: string | null
}>({});
const { t } = useI18n();
const isLoading = ref(true);
const size = 50;
const visible = defineModel('visible', { type: Boolean });
const organizations = ref<OrganizationInterface[]>([]);
const levels = ref([]);
const maritalStatusOptions = Object.keys(MaritalStatus).map((key) => ({
  label: t('hrm.profile.general.maritalStatusOptions.' + camelCase(key)),
  value: key
}));
const hideForm = () => {
  emits('hide-dialog');
};
const data = ref<any>([]);
const op = ref();
const totalRecords = ref(0);
const genderOptions = Object.keys(Gender).map((key) => ({
  label: t('hrm.profile.general.genderOptions.' + camelCase(key)),
  value: key
}));
const pageable = reactive<Pageable>({
  page: 0,
  size: 50
});

const searchParam = reactive({
  organizationId: null,
  professional: null,
  gender: null,
  maritalStatus: null,
  pageable: pageable
});

function onPage(event: PageState) {
  pageable.page = event.page;
}

const processExport = ref(false);

function exportExcel() {
  processExport.value = true;
  exportExcelEmployeeByOrganization(
    {
      ...searchParam,
      organizationId: filter.value.departmentId,
      professional: filter.value.levelCode,
      gender: filter.value.gender,
      maritalStatus: filter.value.maritalStatus
    }
  )
    .then(file => {
      downloadFile(file!, 'Report.xlsx');
      processExport.value = false;
    });
}

function search() {
  findEmployeeEducationReportRefetch({
    param: {
      ...searchParam,
      organizationId: filter.value.departmentId,
      professional: filter.value.levelCode,
      gender: filter.value.gender,
      maritalStatus: filter.value.maritalStatus
    }
  });
}

function removeFilter() {
  filter.value = {
    departmentId: null,
    levelCode: null,
    gender: null,
    maritalStatus: null
  };
}

getAllOrganizationGraphql().onResult((res) => {
  const orgs: OrganizationInterface[] = res.data?.allOrganizationPublic || [];
  const rootOrgs = orgs.filter((org) => !org.parentCode);
  const rootCodes = rootOrgs.map((r) => r.code);
  organizations.value = orgs.filter((org) => org.parentCode !== null && rootCodes.includes(org.parentCode));
});

function togglePanel(event: MouseEvent) {
  op.value.toggle(event);
}

const {
  onResult: findEmployeeEducationReportResult,
  refetch: findEmployeeEducationReportRefetch
} = employeeByOrganizationReport({ param: searchParam });

const { moment } = useMoment();
findEmployeeEducationReportResult((res) => {
  const {
    totalCount,
    edges
  } = get(res, 'data.employeeByOrganizationReport', {
    totalCount: 0,
    edges: [],
  });

  data.value = edges.map((edge: FileAttachmentEdge, index: number) => ({
    ...edge.node,
    ordinalNumber: pageable.page * pageable.size + index + 1
  }));

  totalRecords.value = totalCount;
  isLoading.value = false;
});

const { userDeptRole } = storeToRefs(useDocumentRolesStore());
const mapToOption = (type: string, targetRef: Ref) => {
  getAllCategory(userDeptRole.value, type).onResult((res) => {
    targetRef.value = (res.data.getAllCategory as HrmCategory[]).map(c => ({
      name: c.name,
      id: c.name
    })) || [];
  });
};

mapToOption(CATEGORY_TYPE.EDUCATION_LEVEL, levels);
</script>

<style scoped>

:deep(.p-selectbutton .p-button:focus) {
  box-shadow: none !important;
  outline: none !important;
}

:deep(.p-toolbar .p-inputtext) {
  padding: 0.4rem 0.75rem !important;
}

.view-button {
  display: flex;

  :deep(.p-button) {
    padding: 0.3rem 0.75rem !important;
  }
}

.btn-summary {
  background: var(--surface-overlay);
  color: var(--text-color);
  border: 1px solid transparent;
  padding: 5px 7px;
  max-height: 30px;
  border-radius: 4px;

  &:hover {
    border: 1px solid var(--surface-400) !important;
    background-color: var(--surface-200) !important;
  }
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

</style>