<template>
  <Toolbar class='align-content-center h-3rem mb-2 px-2 py-0 surface-0'>
    <template #start>
      <div class='font-bold'>
        {{ t(`mission.menu.missionActivityReport`) }}
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
    :value= 'acitivityReport'>
    <Column
      class='text-center'
      frozen
      header='STT'>
      <template #body='slotProps'>
        <div
          class='align-items-center flex items-center justify-content-center'>
          {{ slotProps.index + 1 }}
        </div>
      </template>
    </Column>

    <Column
      field='activityName'
      frozen
      :header='t(`mission.report.activityName`)'
      style='min-width: 20vw'>
    </Column>
    <Column
      field='activityDescription'
      :header='t(`mission.report.activityContent`)'
      style='min-width: 18vw'>
      <template #body='{ data: {activityDescription} }'>
        <span v-sanitize-html='activityDescription'></span>
      </template>
    </Column>
    <Column
      field='completedTime'
      :header='t(`mission.report.completionTime`)'
      style='min-width: 18vw'>
    </Column>
    <Column

      field='hostUnit'
      :header='t(`mission.report.hostUnit`)'
      style='min-width: 14vw'>
    </Column>
    <Column

      field='coordinationUnitName'
      :header='t(`mission.report.coordinatingUnit`)'
      style='min-width: 18vw'>
    </Column>
    <Column

      field='activityBudget'
      :header='t(`mission.report.budget`)'
      style='min-width: 12vw'>
    </Column>
    <Column

      field='jobName'
      :header='t(`mission.report.implementationWork`)'
      style='min-width: 12vw'>
    </Column>
    <Column
      field='otherInformation'
      :header='t(`mission.report.otherInfo`)'
      style='min-width: 18vw'>
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
    :search = 'searchParams.searchActivityReport'
    @hide-dialog='exportDialogVisible = false'/>
</template>

<script setup lang='ts'>

import { get } from 'lodash';
import moment from 'moment';
import { storeToRefs } from 'pinia';
import InputNumber from 'primevue/inputnumber';
import type { TreeNode } from 'primevue/treenode';
import { computed, inject, markRaw, nextTick, onMounted, reactive, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { getAllOrganizationPublicGraphql } from '@/apps/admin/api/graphql/organization-graphql-api';
import { convertToOrganizationTreeNodes } from '@/apps/hrm/helpers/utils';
import { DateTimeFormat, DEFAULT_DATATABLE_CONFIG, DEFAULT_PAGE_SIZE } from '@/common/constants';
import { useGlobalSearchStore } from '@/common/store/search';

import { findAllMission } from '../../api/graphql/mission';
import { getActivityListToReport } from '../../api/graphql/report-api';
import { exportExcelMissionActivityReport, exportPdfMissionActivityReport, exportWordMissionActivityReport } from '../../api/rest/report';
import type { MissionInterface } from '../../model/mission/mission';
import type { IMissionActivityReport, ISearchMissionReport } from '../../model/report/report';
import ExportDialog from '../mission/component/ExportDialog/ExportDialog.vue';

const { t } = useI18n();
const exportDialogVisible = ref<boolean>(false);
const searchTerm = inject('searchTerm', ref(''));
const acitivityReport = ref<IMissionActivityReport[]>([]);
const totalRecord = ref<number>();
const canLoadMore = ref<boolean>(true);
const isLoadMore = ref<boolean>(true);
const isLoading = ref<boolean>(true);
const missionOptions = ref<MissionInterface[]>([]);
const tree = ref<TreeNode[]>([]);
const { setFields } = useGlobalSearchStore();
const {
  submit,
  model
} = storeToRefs(useGlobalSearchStore());
const pageable = reactive({
  page: 0,
  size: DEFAULT_PAGE_SIZE
});
const searchActivityReport = ref<ISearchMissionReport>({});

const searchParams = reactive({
  searchActivityReport: searchActivityReport,
  pageable: pageable,
});
const {
  onResult: getActivityReportResult,
  refetch: getActivityReportRefetch,
  onError: getActivityReportError
} =
getActivityListToReport(searchParams);

watch(searchTerm, (newValue) => {
  searchParams.searchActivityReport = {
    ...searchParams.searchActivityReport,
    textSearch: newValue 
  };
  isLoading.value = true;
  getActivityReportRefetch(searchParams);
});

watch(submit, () => {
  searchParams.searchActivityReport = {
    ...model.value,
    fromDate: model.value.fromDate ? moment(model.value.fromDate).format(DateTimeFormat.ISO_LOCAL_DATE) : null,
    toDate: model.value.toDate ? moment(model.value.toDate).format(DateTimeFormat.ISO_LOCAL_DATE) : null,
    coordinationUnitId: model.value.coordinationUnitId ? Object.keys(model.value.coordinationUnitId).toString() : null,
    missionId: model.value.missionId ? model.value.missionId.toString() : null,
    textSearch: searchTerm.value
  };
  isLoading.value = true;
  getActivityReportRefetch(searchParams);
});

getActivityReportResult((res) => {
  const {
    totalRecords,
    content
  } = get(res, 'data.getActivityListToReport', {
    totalRecords: 0,
    content: [],
  });
  
  totalRecord.value = totalRecords;
  if (isLoadMore.value) {
    acitivityReport.value = [
      ...acitivityReport.value,
      ...content,
    ];
  } else {
    acitivityReport.value = content;
  }
  canLoadMore.value = content.length >= DEFAULT_PAGE_SIZE;
  isLoadMore.value = false;
  isLoading.value = false;
});

getActivityReportError(()=>{
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
  const fileName = 'Thống kê hoạt động theo nhiệm vụ';
  return [
    {
      label: t('document.exportDoc.exportPdf'),
      fileName: fileName + '.pdf',
      icon: '/images/file-types/pdf-logo.png',
      exportFunction: exportPdfMissionActivityReport,
    },
    {
      label: t('document.exportDoc.exportWord'),
      fileName: fileName + '.docx',
      icon: '/images/file-types/word-logo.png',
      exportFunction: exportWordMissionActivityReport,
    },
    {
      label: t('document.exportDoc.exportExcel'),
      fileName: fileName + '.xlsx',
      exportFunction: exportExcelMissionActivityReport,
      icon: '/images/file-types/excel-logo.png',
    },
  ];
});

setFields({
  missionId: {
    label: 'Nhiệm vụ',
    isMultiSelect: true,
    col: 12,
    optionsDropdown: missionOptions,
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
  coordinationUnitId: {
    label: 'Đơn vị phối hợp',
    col: 12,
    optionsTreeSelect: tree
  },
});

findAllMission().onResult(res => {
  missionOptions.value = get(res, 'data.findAllMission');
});

getAllOrganizationPublicGraphql().onResult((res) => {
  tree.value = convertToOrganizationTreeNodes(res.data?.allOrganizationPublic || []);
});

</script>

<style scoped>
:deep(th ) {
  background: #F3F3F3 !important;
  font-weight: 800;
}
</style>