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
          {{ t('hrm.report.workProgressReport') }}
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
      class='white-space-nowrap'
      :group-rows-by='["code", "fullName", "currentOrganization"]'
      :loading='isLoading'
      row-group-mode='rowspan'
      scroll-direction='both'
      scroll-height='flex'
      scrollable
      :show-gridlines='true'
      sort-field='"code"'
      sort-mode='single'
      :sort-order='1'
      table-style='min-width: 200rem'
      :value='data'>
      <ColumnGroup type='header'>
        <Row>
          <Column
            header='STT'
            :rowspan='2'/>
          <Column
            :colspan='3'
            header='Nhân viên'/>
          <Column
            :colspan='11'
            header='Báo cáo quá trình công tác'/>
        </Row>

        <Row>
          <Column header='Mã nhân viên'/>
          <Column header='Tên nhân viên'/>
          <Column header='Đơn vị/Phòng ban'/>
          <Column header='Đơn vị làm việc'/>
          <Column header='Địa chỉ'/>
          <Column header='Ngày bắt đầu'/>
          <Column header='Ngày kết thúc'/>
          <Column header='Vị trí/Chức vụ'/>
          <Column header='Mô tả'/>
          <Column header='Lý do nghỉ việc'/>
          <Column header='Mức thu nhập'/>
          <Column header='Người tham chiếu'/>
          <Column header='SĐT người tham chiếu'/>
        </Row>
      </ColumnGroup>
      <Column
        field='ordinalNumber'
        header-style='width:3rem'>
      </Column>

      <Column
        field='code'>
      </Column>
      <Column
        field='fullName'/>
      <Column
        field='currentOrganization'/>
      <Column
        field='organization'>
      </Column>
      <Column field='workLocation'/>
      <Column>
        <template #body='{data: {fromDate}}'>
          {{ fromDate ? moment(fromDate).format('DD/MM/YYYY') : '' }}
        </template>
      </Column>
      <Column>
        <template #body='{data: {toDate}}'>
          {{ toDate ? moment(toDate).format('DD/MM/YYYY') : '' }}
        </template>
      </Column>
      <Column field='position'/>
      <Column field='description'/>
      <Column field='reasonForLeaving'/>
      <Column field='salary'/>
      <Column field='referencesPerson'/>
      <Column field='phone'/>
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
import { get, throttle } from 'lodash';
import Column from 'primevue/column';
import type { PageState } from 'primevue/paginator';
import { nextTick, onMounted, reactive, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { getAllOrganizationGraphql } from '@/apps/admin/api/graphql/organization-graphql-api';
import type { OrganizationInterface } from '@/apps/admin/model/organization';
import { workProgressReport } from '@/apps/hrm/api/graphql/employee';
import { exportExcelEmployeeByOrganization, exportExcelWorkProgress } from '@/apps/hrm/api/rest/employee';
import type { FileAttachmentEdge } from '@/apps/hrm/model/attachment';
import AppIcon from '@/common/components/app/AppIcon.vue';
import { downloadFile } from '@/common/helpers/file-utils';
import useMoment from '@/common/helpers/mixins/use-moment';
import type { Pageable } from '@/common/model/query';

const emits = defineEmits(['hide-dialog']);
const { t } = useI18n();
const isLoading = ref(true);
const organizations = ref<OrganizationInterface[]>([]);
const size = 50;
const op = ref();
const totalRecords = ref(0);
const filter = ref<{
  departmentId?: string | null
}>({});
const visible = defineModel('visible', { type: Boolean });
const hideForm = () => {
  emits('hide-dialog');
};
const data = ref<any>([]);
const canLoadMore = ref(true);
const isLoadMore = ref(true);
const pageable = reactive<Pageable>({
  page: 0,
  size: 50
});
const searchParam = reactive({
  organizationId: null,
  pageable: pageable
});
const {
  onResult: findEmployeeEducationReportResult,
  refetch: findEmployeeEducationReportRefetch
} = workProgressReport({ payload: searchParam });

const { moment } = useMoment();
findEmployeeEducationReportResult((res) => {
  isLoading.value = true;
  const {
    totalCount,
    edges
  } = get(res, 'data.workProgressReport', {
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

function onPage(event: PageState) {
  pageable.page = event.page;
}

function scrollEvent(event: Event) {
  const {
    scrollTop,
    scrollHeight,
    clientHeight
  } = event.target as HTMLElement;
  if (scrollTop + clientHeight + 1 >= scrollHeight && canLoadMore.value) {
    isLoadMore.value = true;
  }
}

const processExport = ref(false);

function exportExcel() {
  processExport.value = true;
  exportExcelWorkProgress(
    {
      ...searchParam,
      organizationId: filter.value.departmentId
    }
  )
    .then(file => {
      downloadFile(file!, 'Report.xlsx');
      processExport.value = false;
    });
}

function search() {
  findEmployeeEducationReportRefetch({
    payload: {
      ...searchParam,
      organizationId: filter.value.departmentId
    }
  });
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

function removeFilter() {
  filter.value = { departmentId: null };
}

function addScrollEventListener(selector: string) {
  const scrollableContainer = document.querySelector(selector);
  if (scrollableContainer) {
    scrollableContainer.addEventListener('scrollend', throttle(scrollEvent, 1000));
  }
}

onMounted(() => {
  nextTick(() => {
    addScrollEventListener('.p-datatable-wrapper');
  });
});
</script>

<style scoped>
.white-space-nowrap {
  white-space: nowrap;
}
</style>