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
            @click='wrapperRef?.toggleTree()'/>

          <div class='font-bold'>
            {{ t('Đánh giá nhân sự') }}
          </div>
        </div>
      </template>
      <template #end>
        <div class='btn-group-toolbar flex gap-1 mr-1 my-1'>
          <Button
            v-if='activeTab === "MY_DEPT"'
            class='btn-create focus:shadow-none font-medium p-2'
            icon='pi pi-plus'
            :label='t("common.create")'
            @click='showFormCreate'></Button>
          <Button
            v-if='(selectedReport?.report.evaluateStatus === "DRAFT" && activeTab === "MY_DEPT") || (selectedSummaryReport && activeTab === "SUMMARY")'
            class='focus:shadow-none font-normal hover:surface-200'
            icon='pi pi-save'
            :label='t("common.save")'
            @click = 'onSave'></Button>
          <Button
            v-if='selectedReport?.report.evaluateStatus ==="DRAFT" && activeTab === "MY_DEPT"'
            class='focus:shadow-none font-normal hover:surface-200'
            icon='pi pi-send'
            :label='t("Gửi tổng hợp")'
            @click='handleProcessing'></Button>
          <Button
            v-if='activeTab === "WAITING" && listOrganization.length > 0'
            class='btn-create focus:shadow-none font-medium p-2'
            icon='pi pi-send'
            :label='t("Lập tổng hợp")'
            @click='showFormSummaryReport'></Button>
          <Button
            v-if='selectedSummaryReport?.summaryReport?.id'
            class='focus:shadow-none font-normal hover:surface-200'
            icon='pi pi-sitemap'
            label='Theo dõi'
            severity='secondary'
            @click='showFormSiteMap'></Button>
          <Button
            v-if='selectedSummaryReport?.summaryReport?.id && !isFinalStep'
            class='focus:shadow-none font-normal hover:surface-200'
            icon='pi pi-send'
            label='Chuyển xử lý'
            severity='secondary'
            @click='showFormNextFlow'></Button>
          <Button
            v-if='selectedSummaryReport?.summaryReport?.id && selectedSummaryReport?.summaryReport.evaluateEmployeeSummaryReportStatus !== "APPROVED" && isFinalStep'
            class='focus:shadow-none font-normal hover:surface-200'
            :disabled='!isFinalStep'
            icon='pi pi-send'
            label='Duyệt'
            severity='secondary'
            @click='handleApprove'></Button>
          <Button
            class='focus:shadow-none font-normal hover:surface-200'
            icon='pi pi-file-import'
            label='Import'
            severity='secondary'></Button>
          <Button
            class='focus:shadow-none font-normal hover:surface-200'
            icon='pi pi-file-export'
            label='Export'
            severity='secondary'
            @click='openExportDialog'></Button>
          <Button
            class='focus:shadow-none font-normal hover:surface-200'
            icon='pi pi-cog'
            :label='t("common.setting")'
            severity='secondary'></Button>
        </div>
      </template>
    </Toolbar>
    <HrmEvaluateListWrapper
      ref='wrapperRef'/>
    <HrmEvaluateFormSidebar
      v-model='evaluateEdit'
      v-model:visible='visible'/>

    <HrmSummaryReportSidebar
      v-model='summaryReport'
      v-model:visible='visibleSummaryReport'/>

    <HrmEvaluateProcessingForm
      v-if='visibleProcessing'
      v-model:visible='visibleProcessing'/>
    <HrmSummaryReportSiteMap
      v-if='visibleSiteMap'
      v-model:visible='visibleSiteMap'/>
    <HrmSummaryReportNextFlowForm
      v-if='visibleNextFlow'
      v-model:visible='visibleNextFlow'
      :handle-users = 'handleUsers'
      :node = 'nodes'
      :task-pr = 'task'/>
    <ExportDialog
      v-if='visibleExportDialog'
      v-model:visibleDialog='visibleExportDialog'
      :export-options='exportOptions'
      :search = 'searchParams'
      @hide-dialog='visibleExportDialog = false'/>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { computed, onMounted, provide, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { useUserMoreInfoStore } from '@/apps/admin/store/usersMoreInfo';
import ExportDialog from '@/apps/mission/views/mission/component/ExportDialog/ExportDialog.vue';
import { getTaskByObjectId, nextNodesIgnoreStatus } from '@/apps/work-flow/api/graphql/task';
import type { Task } from '@/apps/work-flow/model/process/work';
import { toastError, toastSuccess } from '@/common/helpers/custom-toast-service';
import { useAppStore } from '@/common/store/app';
import { useUserStore } from '@/common/store/user';

import { findAllEmployees } from '../../api/graphql/employee';
import { getEvaluateEmployeeReportDetail, getEvaluateEmployeeSummaryReportDetailById } from '../../api/graphql/evaluate';
import { approvedEvaluate, exportExcelHrmEvaluateEmployee, exportExcelHrmSummaryEvaluateEmployee } from '../../api/rest/evaluate';
import type { EmployeeSummary } from '../../model/employee';
// eslint-disable-next-line max-len
import type { EmployeeReport, Evaluate, EvaluateReportDetail, EvaluateReportSummaryDetail, ListOfEvaluateEmployeeReportOnEachOrganization, SummaryReport } from '../../model/evaluate';
import HrmEvaluateProcessingForm from './form/HrmEvaluateProcessingForm.vue';
import HrmSummaryReportNextFlowForm from './form/summaryReport/HrmSummaryReportNextFlowForm.vue';
import HrmSummaryReportSidebar from './form/summaryReport/HrmSummaryReportSidebar.vue';
import HrmSummaryReportSiteMap from './form/summaryReport/HrmSummaryReportSiteMap.vue';
import HrmEvaluateFormSidebar from './HrmEvaluateFormSidebar.vue';
import HrmEvaluateListWrapper from './list/HrmEvaluateListWrapper.vue';

const { t } = useI18n();
const appStore = useAppStore();
const { fetchAllUsers } = useUserMoreInfoStore();
const { user } = storeToRefs(useUserStore());
const wrapperRef = ref<InstanceType<typeof HrmEvaluateListWrapper>>();
const selectedReport = ref<EvaluateReportDetail | null>(null);
const selectedSummaryReport = ref<EvaluateReportSummaryDetail | null>(null);
const listOrganization = ref<ListOfEvaluateEmployeeReportOnEachOrganization[]>([]);
const evaluateEdit = ref({} as Evaluate);
const summaryReport = ref({} as SummaryReport);
const visible = ref<boolean>(false);
const visibleSummaryReport = ref<boolean>(false);
const visibleProcessing = ref<boolean>(false);
const visibleExportDialog = ref<boolean>(false);
const visibleSiteMap = ref<boolean>(false);
const visibleNextFlow = ref<boolean>(false);
const isFinalStep = ref<boolean>(false);
const isOpening = ref(true);
const isRefresh = ref<number>(0);
const activeTab = ref<'MY_DEPT' | 'WAITING' | 'SUMMARY'>('MY_DEPT');
const employeeInfo = ref<EmployeeSummary>({} as EmployeeSummary);
const searchParams = ref({});
const exportFunction = ref();
const fileName = ref<string>('');
const task = ref<Task>({} as Task);
const nodes = ref();
const handleUsers = ref();

function resetData() {
  evaluateEdit.value = {} as Evaluate;
  summaryReport.value = {} as SummaryReport;
}

function showFormCreate() {
  visible.value = true;
}

function showFormSummaryReport() {
  visibleSummaryReport.value = true;
}

function showFormSiteMap() {
  visibleSiteMap.value = true;
}

function showFormNextFlow() {
  visibleNextFlow.value = true;
}
function mapEmployeeReport(e: EmployeeReport) {
  return {
    employeeId: e.employeeId,
    employeeName: e.employeeName,
    employeeOrganizationId: e.employeeOrganizationId,
    employeeOrganizationName: e.employeeOrganizationName,
    jobPositionCode: e.jobPositionCode,
    jobPositionName: e.jobPositionName,
    selectedEmployee: e.selectedEmployee

  };
}
const handleEdit = (id: string) => {
  isOpening.value = true;
  getEvaluateEmployeeReportDetail(id).onResult((res) => {
    if (!isOpening.value) {
      return;
    }
    const value = res.data.getEvaluateEmployeeReportDetail;
    evaluateEdit.value = {
      ...value.report,
      monthReport: value.report.monthReport ? new Date(value.report.monthReport) : null,
      createReportDate: value.report.createdTime ? new Date(value.report.createdTime) : null,
      employees: (value.employees || []).map(mapEmployeeReport)
    };
    visible.value = true;
  });
};

const handleViewDetail = (id: string) => {
  const { onResult, onError } = getEvaluateEmployeeReportDetail(id);
  appStore.loading = true;
  onResult((res) => {
    const value = res.data.getEvaluateEmployeeReportDetail;
    if(value){
      selectedReport.value = value as EvaluateReportDetail;
    }
    appStore.loading = false;
  });
  onError(()=>{
    appStore.loading = false;
  });
};

const handleEditSummary = (id: string) => {
  isOpening.value = true;
  getEvaluateEmployeeSummaryReportDetailById(id).onResult((res) => {
    if (!isOpening.value) {
      return;
    }
    const value = res.data.getEvaluateEmployeeSummaryReportDetailById;
    summaryReport.value = {
      ...value.summaryReport,
      monthReport: value.summaryReport.monthReport ? new Date(value.summaryReport.monthReport) : null,
      createReportDate: value.summaryReport.createdTime ? new Date(value.summaryReport.createdTime) : null,
    };
    visibleSummaryReport.value = true;
  });
};

const handleViewDetailSummary = (id: string) => {
  const { onResult, onError } = getEvaluateEmployeeSummaryReportDetailById(id);
  appStore.loading = true;
  onResult((res) => {
    const value = res.data.getEvaluateEmployeeSummaryReportDetailById;
    if(value){
      selectedSummaryReport.value = value as EvaluateReportSummaryDetail;
    }
    appStore.loading = false;
  });
  onError(()=>{
    appStore.loading = false;
  });
};

const handleProcessing = ()=>{
  visibleProcessing.value = true;
};

type SaveHandler = () => void;
const saveHandler = ref<null | SaveHandler>(null);
function registerSaveHandler(fn: () => void) {
  saveHandler.value = fn;
}

function onSave() {
  if (saveHandler.value) {
    saveHandler.value();
  }
}

function openExportDialog() {
  if (['MY_DEPT', 'WAITING'].includes(activeTab.value)) {
    searchParams.value = { evaluateEmployeeReportId: selectedReport.value?.report.id };
    exportFunction.value = exportExcelHrmEvaluateEmployee;
    fileName.value = selectedReport.value?.report.evaluateName || '';
  } else if (activeTab.value === 'SUMMARY') {
    searchParams.value = { evaluateEmployeeSummaryReportId: selectedSummaryReport.value?.summaryReport.id };
    exportFunction.value = exportExcelHrmSummaryEvaluateEmployee;
    fileName.value = selectedSummaryReport.value?.summaryReport.evaluateSummaryReportName || 'Đánh giá tổng hợp';
  }
  visibleExportDialog.value = true;
}

watch(() => selectedSummaryReport.value?.summaryReport?.id, (id) => {
  if (!id) {
    return;
  }
  checkIsNextFlow();
});

async function checkIsNextFlow() {
  const { refetch: refetchTask } = getTaskByObjectId(selectedSummaryReport.value?.summaryReport?.id || '');
  const res = await refetchTask?.({ objectId: selectedSummaryReport.value?.summaryReport?.id || '' });
  if (!res) {
    return;
  }
  task.value = res.data?.getTaskByObjectId;
  if (!task.value) {
    return;
  }
  const {
    load: nextNodesIgnoreStatusLoad,
    refetch: nextNodesIgnoreStatusRefetch
  } = nextNodesIgnoreStatus(task.value.workId, task.value.nodeId, 'APPROVE');

  let result = await nextNodesIgnoreStatusLoad() ?? await nextNodesIgnoreStatusRefetch();
  result = await nextNodesIgnoreStatusRefetch();
  if (result) {
    nodes.value = result?.data?.nextNodesIgnoreStatus || [];
    isFinalStep.value = result?.data?.nextNodesIgnoreStatus?.[0]?.type == 'END';
    handleUsers.value = nodes.value[0]?.data?.options?.userIds?.[0];
  }
}

async function handleApprove() {
  try {
    const id = selectedSummaryReport.value?.summaryReport?.id;
    if (!id) {
      return;
    }
    await approvedEvaluate(id);
    toastSuccess({ message: 'Đã duyệt thành công' });
    handleViewDetailSummary(selectedSummaryReport.value?.summaryReport?.id || '');
    isRefresh.value++;
  } catch (err) {
    toastError();
  }
}

const exportOptions = computed(() => {
  return [
    {
      label: t('document.exportDoc.exportPdf'),
      fileName: fileName.value + '.pdf',
      icon: '/images/file-types/pdf-logo.png',
      disabled: true
    },
    {
      label: t('document.exportDoc.exportWord'),
      fileName: fileName.value + '.docx',
      icon: '/images/file-types/word-logo.png',
      disabled: true
    },
    {
      label: t('document.exportDoc.exportExcel'),
      fileName: fileName.value + '.xlsx',
      exportFunction: exportFunction.value,
      icon: '/images/file-types/excel-logo.png',
    },
  ];
});

onMounted(() => {
  fetchAllUsers();
  findAllEmployees('').onResult((res)=>{
    employeeInfo.value = res.data?.findAllEmployees?.find(({ userId }: {userId: string})=> user.value.id === userId);
  });
});

provide('registerSaveHandler', registerSaveHandler);
provide('handleViewDetail', handleViewDetail);
provide('handleViewDetailSummary', handleViewDetailSummary);
provide('selectedReport', selectedReport);
provide('selectedSummaryReport', selectedSummaryReport);
provide('resetData', resetData);
provide('isRefresh', isRefresh);
provide('handleEdit', handleEdit);
provide('handleEditSummary', handleEditSummary);
provide('activeTab', activeTab);
provide('listOrganization', listOrganization);
provide('isOpening', isOpening);
provide('employeeInfo', employeeInfo);
</script>

<style scoped></style>
