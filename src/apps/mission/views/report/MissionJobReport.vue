<template>
  <Toolbar class='align-content-center h-3rem mb-2 px-2 py-0 surface-0'>
    <template #start>
      <div class='font-bold'>
        {{ t(`mission.menu.missionJobReport`) }}
      </div>
    </template>
    <template #end>
      <div class='btn-group-toolbar flex gap-1 mr-1 my-1'>
        <ButtonGroup>
          <Button
            class='focus:shadow-none font-normal hover:surface-200'
            icon='pi pi-file-export'
            :label='t("common.export")'
            severity='secondary'
            @click='exportDialogVisible = true'>
          </Button>
        </ButtonGroup>
      </div>
    </template>
  </Toolbar>
  <DataTable
    :loading = 'isLoading'
    v-bind='DEFAULT_DATATABLE_CONFIG'
    :pt="{
      wrapper: {
        class: 'h-full surface-overlay',
      },
    }"
    row-hover
    show-gridlines
    :total-records='totalRecord'
    :value='jobReport'>
    <Column
      class='text-center'
      header='STT'
      style='width: 2%; padding: 0;'>
      <template #body='slotProps'>
        <div
          class='align-items-center flex items-center justify-content-center'>
          {{ slotProps.index + 1 }}
        </div>
      </template>
    </Column>

    <Column
      class='col-1 px-2'
      field='jobName'
      :header='t(`mission.report.jobName`)'>
    </Column>
    <Column
      class='col-1 px-2'
      field='implementationUnit'
      :header='t(`mission.report.executingUnit`)'>
    </Column>
    <Column
      class='col-1 px-2'
      field='jobDesc'
      :header='t(`mission.report.jobContent`)'>
    </Column>
    <Column
      class='col-1 px-2'
      field='completedTime'
      :header='t(`mission.report.startEndTime`)'>
    </Column>
    <Column
      class='col-1 px-2'
      field='jobBudget'
      :header='t(`mission.report.estimatedBudget`)'>
    </Column>
    
    <template #empty>
      <div class='text-center text-color-secondary text-sm'>
        <span>Không có dữ liệu</span>
      </div>
    </template>
  </DataTable>
  <ExportDialog
    v-if='exportDialogVisible'
    v-model:visibleDialog='exportDialogVisible'
    :export-options='exportOptions'
    :search='searchParams.searchActivityDeploymentReport'
    @hide-dialog='exportDialogVisible = false'/>
</template>

<script setup lang='ts'>

import { get } from 'lodash';
import moment from 'moment';
import { storeToRefs } from 'pinia';
import InputNumber from 'primevue/inputnumber';
import MultiSelect from 'primevue/multiselect';
import { computed, inject, markRaw, nextTick, onMounted, reactive, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { findAllActivity } from '@/apps/mission/api/graphql/activity-api';
import { DateTimeFormat, DEFAULT_DATATABLE_CONFIG, DEFAULT_PAGE_SIZE } from '@/common/constants';
import { useGlobalSearchStore } from '@/common/store/search';

import { getActivityDeploymentListToReport } from '../../api/graphql/report-api';
import { exportExcelMissionJobReport, exportPdfMissionJobReport, exportWordMissionJobReport } from '../../api/rest/report';
import type { ActivityInterface } from '../../model/activity/activity';
import { type MissionTypeInterface, StatusMission } from '../../model/mission/mission';
import type { IMissionJobReport, ISearchMissionReport } from '../../model/report/report';
import ExportDialog from '../mission/component/ExportDialog/ExportDialog.vue';

const { t } = useI18n();
const exportDialogVisible = ref<boolean>(false);
const searchTerm = inject('searchTerm', ref(''));
const jobReport = ref<IMissionJobReport[]>([]);
const activityOptions = ref<ActivityInterface[]>([]);
const totalRecord = ref<number>();
const canLoadMore = ref<boolean>(true);
const isLoadMore = ref<boolean>(true);
const isLoading = ref<boolean>(true);
const { setFields } = useGlobalSearchStore();
const {
  submit,
  model
} = storeToRefs(useGlobalSearchStore());
const pageable = reactive({
  page: 0,
  size: DEFAULT_PAGE_SIZE
});

const searchParams = reactive({
  searchActivityDeploymentReport: {} as ISearchMissionReport,
  pageable: pageable, 
});
const {
  onResult: getDeploymentListToReportResult,
  refetch: getDeploymentListToReportRefetch,
  onError: getDeploymentListToReportError
} =
    getActivityDeploymentListToReport(searchParams);

watch(searchTerm, (newValue) => {
  searchParams.searchActivityDeploymentReport = {
    ...searchParams.searchActivityDeploymentReport,
    textSearch: newValue 
  };
  isLoading.value = true;
  getDeploymentListToReportRefetch(searchParams);
});

watch(submit, () => {
  searchParams.searchActivityDeploymentReport = { 
    ...model.value,
    fromDate: model.value.fromDate ? moment(model.value.fromDate).format(DateTimeFormat.ISO_LOCAL_DATE) : null,
    toDate: model.value.toDate ? moment(model.value.toDate).format(DateTimeFormat.ISO_LOCAL_DATE) : null,
    activityId: model.value.activityId ? model.value.activityId.toString() : null,
    textSearch: searchTerm.value
  };
  isLoading.value = true;
  getDeploymentListToReportRefetch(searchParams);
});

getDeploymentListToReportResult((res) => {
  const {
    totalRecords,
    content
  } = get(res, 'data.getActivityDeploymentListToReport', {
    totalRecords: 0,
    content: [],
  });

  totalRecord.value = totalRecords;
  if (isLoadMore.value) {
    jobReport.value = [
      ...jobReport.value,
      ...content,
    ];
  } else {
    jobReport.value = content;
  }
  canLoadMore.value = content.length >= DEFAULT_PAGE_SIZE;
  isLoadMore.value = false;
  isLoading.value = false;
});

getDeploymentListToReportError(()=>{
  isLoading.value = false;
});

// function reload() {
//   searchParams.searchInput.textSearch = '';
//   searchParams.pageable.page = 0;
//   isLoading.value = true;
//   getAirportRefetch(searchParams);
// }

function scrollEvent(event: Event) {
  const {
    scrollTop,
    scrollHeight,
    clientHeight
  } = event.target as HTMLElement;
  if (scrollTop + clientHeight + 1 >= scrollHeight && canLoadMore.value) {
    isLoadMore.value = true;
    searchParams.pageable.page += 1;
  }
}

function addScrollEventListener(selector: string) {
  const scrollableContainer = document.querySelector(selector);
  if (scrollableContainer) {
    scrollableContainer.addEventListener('scroll', scrollEvent);
  }
}

onMounted(() => {
  nextTick(() => {
    addScrollEventListener('.p-datatable-wrapper');
  });
});

const exportOptions = computed(() => {
  const fileName = 'Thống kê công việc thuộc hoạt động';
  return [
    {
      label: t('document.exportDoc.exportPdf'),
      fileName: fileName + '.pdf',
      exportFunction: exportPdfMissionJobReport,
      icon: '/images/file-types/pdf-logo.png',
    },
    {
      label: t('document.exportDoc.exportWord'),
      fileName: fileName + '.docx',
      icon: '/images/file-types/word-logo.png',
      exportFunction: exportWordMissionJobReport,
    },
    {
      label: t('document.exportDoc.exportExcel'),
      fileName: fileName + '.xlsx',
      exportFunction: exportExcelMissionJobReport,
      icon: '/images/file-types/excel-logo.png',
    },
  ];
});

const statusOptionFilter = ref<MissionTypeInterface[]>([
  {
    id: StatusMission.NEW,
    name: 'Tạo mới'
  },
  {
    id: StatusMission.IN_PROGRESS,
    name: t('mission.mission.statusOptions.inProgress'),
  },
  {
    id: StatusMission.UNPROCESSED,
    name: t('mission.mission.statusOptions.pending'),
  },
  {
    id: StatusMission.WAITING_FOR_ACCEPT,
    name: t('mission.mission.statusOptions.waitingApproval'),
  },
  {
    id: StatusMission.COMPLETED,
    name: t('mission.mission.statusOptions.done'),
  },
  
]);

setFields({
  activityId: {
    label: 'Hoạt động',
    col: 6,
    type: Array,
    component: markRaw(MultiSelect),
    props: {
      showClear: true,
      options: activityOptions,
      optionLabel: 'activityName',
      optionValue: 'id',
    },
  },
  status: {
    label: 'Trạng thái',
    col: 6,
    optionsDropdown: statusOptionFilter,
  },
  fromDate: {
    label: 'Từ ngày',
    type: String,
    isDatePicker: true,
    col: 6,
  },
  toDate: {
    label: 'Đến ngày',
    type: String,
    isDatePicker: true,
    hasAdd: true,
    col: 6,
  },
  fromBudget: {
    label: 'Kinh phí từ',
    col: 6,
    component: markRaw(InputNumber),
  },
  toBudget: {
    label: 'Đến',
    col: 6,
    component: markRaw(InputNumber),
  },
});

findAllActivity().onResult(res => {
  activityOptions.value = get(res, 'data.findAllActivity');
});
</script>

<style scoped>
:deep(th ) {
  background: #F3F3F3 !important;
  font-weight: 800;
}
</style>