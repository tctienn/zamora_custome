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
          {{ t('hrm.report.employeeEducationReport') }}
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
      v-bind='DEFAULT_DATATABLE_CONFIG'
      class='white-space-nowrap'
      :loading='isLoading'
      row-hover
      scroll-direction='both'
      scroll-height='flex'
      scrollable
      :show-gridlines='true'
      :value='data'>
      <ColumnGroup type='header'>
        <Row>
          <Column
            header='TT'
            :rowspan='2'/>
          <Column
            :colspan='4'
            header='Nhân viên'/>
          <Column
            :header='t("hrm.profile.education.specializedJob")'
            :rowspan='2'/>
          <Column
            header='Mô tả chi tiết công việc'
            :rowspan='2'/>
          <Column
            :header='t("hrm.profile.education.generalLevel")'
            :rowspan='2'/>
          <Column
            :colspan='6'
            header='Quá trình học'/>
        </Row>
        <Row>
          <Column
            :header='t("hrm.profile.general.code")'/>
          <Column
            :header='t("hrm.profile.general.fullName")'/>
          <Column
            :header='t("hrm.profile.general.birthDay")'/>
          <Column
            header='Đơn vị/Phòng ban'/>
          <Column
            :header='t("hrm.certificate.issuingPlace")'/>
          <Column
            header='Thời gian đào tạo'/>
          <Column
            header='Trình độ chuyên môn'/>
          <Column
            header='Chuyên ngành học'/>
          <Column
            header='Tốt nghiệp loại'/>
          <Column
            header='Trình độ chính'/>
        </Row>
      </ColumnGroup>
      <Column
        field='ordinalNumber'
        header-style='width:3rem'>
      </Column>
      <Column
        class='text-center'
        field='code'
        style='width: 5vw'>
      </Column>
      <Column
        field='fullName'
        style='width: 15vw'>
      </Column>
      <Column
        class='text-center'
        field='birthDay'
        style='width: 10vw'>
        <template #body='{ data: {birthDay} }'>
          {{ birthDay && moment(birthDay).format('DD/MM/YYYY') }}
        </template>
      </Column>
      <Column
        field='organizationName'
        style='width: 15vw'>
      </Column>
      <Column
        field='professionalLevel'
        style='width: 17vw'>
      </Column>
      <Column
        field='workDescription'
        style='width: 15vw'>
      </Column>
      <Column
        class='text-center'
        field='generalLevel'
        style='width: 10vw'>
      </Column>

      <Column
        field='issuingPlace'
        style='width: 10vw'/>
      <Column
        style='width: 10vw'>
        <template #body='{data: {trainingFromDate, trainingToDate}}'>
          {{
            [trainingFromDate, trainingToDate]
              .filter(Boolean)
              .map(d => moment(d).format('DD/MM/YYYY'))
              .join(' - ')
          }}
        </template>
      </Column>
      <Column
        field='professionalLevelProcess'
        style='width: 10vw'/>
      <Column
        field='major'
        style='width: 10vw'/>
      <Column
        field='classification'
        style='width: 10vw'/>
      <Column
        field='mainDegree'
        style='width: 10vw'>
        <template #body='{data: {mainDegree}}'>
          {{ mainDegree ? 'Chính' : '' }}
        </template>
      </Column>
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
          class='col-12'
          is-multi-select
          :label="t('hrm.recruitment.general.level')"
          option-label='name'
          option-value='id'
          :options='levels'/>

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
import { get } from 'lodash';
import { storeToRefs } from 'pinia';
import Column from 'primevue/column';
import type { PageState } from 'primevue/paginator';
import { reactive, type Ref, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { getAllOrganizationGraphql } from '@/apps/admin/api/graphql/organization-graphql-api';
import type { OrganizationInterface } from '@/apps/admin/model/organization';
import { useDocumentRolesStore } from '@/apps/document/store/document-role';
import { getAllCategory } from '@/apps/hrm/api/graphql/category';
import { findEmployeeEducationReport } from '@/apps/hrm/api/graphql/employee-training-process';
import { exportExcelEmployeeEducation } from '@/apps/hrm/api/rest/employee';
import FormInputDropdown from '@/apps/hrm/components/form/FormInputDropdown.vue';
import { CATEGORY_TYPE } from '@/apps/hrm/constants/category';
import type { FileAttachmentEdge } from '@/apps/hrm/model/attachment';
import type { HrmCategory } from '@/apps/hrm/model/category';
import AppIcon from '@/common/components/app/AppIcon.vue';
import { DEFAULT_DATATABLE_CONFIG } from '@/common/constants';
import { downloadFile } from '@/common/helpers/file-utils';
import useMoment from '@/common/helpers/mixins/use-moment';
import type { Pageable } from '@/common/model/query';

const emits = defineEmits(['hide-dialog']);
const { t } = useI18n();
const op = ref();

function removeFilter() {
  filter.value = {
    departmentId: null,
    levelCode: null,
    gender: null,
    maritalStatus: null
  };
}

function togglePanel(event: MouseEvent) {
  op.value.toggle(event);
}

const isLoading = ref(true);
const totalRecords = ref(0);
const visible = defineModel('visible', { type: Boolean });
const organizations = ref<OrganizationInterface[]>([]);
const hideForm = () => {
  emits('hide-dialog');
};
const data = ref<any>([]);
const size = 50;
const processExport = ref(false);

const pageable = reactive<Pageable>({
  page: 0,
  size: 50
});

const searchParam = reactive({
  organizationId: null,
  professional: null,
  pageable: pageable
});

const filter = ref<{
  departmentId?: string | null,
  levelCode?: string | null,
  gender?: string | null,
  maritalStatus?: string | null
}>({});

const {
  onResult: findEmployeeEducationReportResult,
  refetch: findEmployeeEducationRefetch
} = findEmployeeEducationReport({ payload: searchParam });

getAllOrganizationGraphql().onResult((res) => {
  const orgs: OrganizationInterface[] = res.data?.allOrganizationPublic || [];
  const rootOrgs = orgs.filter((org) => !org.parentCode);
  const rootCodes = rootOrgs.map((r) => r.code);
  organizations.value = orgs.filter((org) => org.parentCode !== null && rootCodes.includes(org.parentCode));
});

function onPage(event: PageState) {
  pageable.page = event.page;
}

const { moment } = useMoment();
findEmployeeEducationReportResult((res) => {
  isLoading.value = true;
  const {
    totalCount,
    edges
  } = get(res, 'data.findEmployeeEducationReport', {
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

const levels = ref([]);
const { userDeptRole } = storeToRefs(useDocumentRolesStore());

const mapToOption = (type: string, targetRef: Ref) => {
  getAllCategory(userDeptRole.value, type).onResult((res) => {
    targetRef.value = (res.data.getAllCategory as HrmCategory[]).map(c => ({
      name: c.name,
      id: c.name
    })) || [];
  });
};

function search() {
  findEmployeeEducationRefetch({
    payload: {
      ...searchParam,
      organizationId: filter.value.departmentId,
      professional: filter.value.levelCode
    }
  });
}

function exportExcel() {
  processExport.value = true;
  exportExcelEmployeeEducation(
    {
      ...searchParam,
      organizationId: filter.value.departmentId,
      professional: filter.value.levelCode,
    }
  )
    .then(file => {
      downloadFile(file!, 'Report.xlsx');
      processExport.value = false;
    });
}

mapToOption(CATEGORY_TYPE.EDUCATION_LEVEL, levels);
</script>

<style scoped>
.white-space-nowrap {
  white-space: nowrap;
}

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