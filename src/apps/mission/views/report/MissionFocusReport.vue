<template>
  <Toolbar class='align-content-center h-3rem mb-2 px-2 py-0 surface-0'>
    <template #start>
      <div class='font-bold'>
        {{ t(`mission.menu.missionFocusReport`) }}
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
    :value = 'missionFocus'>
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
      class='col-1'
      field='name'
      :header='t(`mission.report.missionName`)'>
    </Column>
    <Column
      class='col-1'
      field='description'
      :header='t(`mission.report.description`)'>
      <template #body='{ data: {description} }'>
        <span v-sanitize-html='description'></span>
      </template>
    </Column>
    <Column
      class='col-1'
      field='completedTime'
      :header='t(`mission.report.completionTime`)'>
    </Column>
    <Column
      class='col-1'
      field='hostUnit'
      :header='t(`mission.report.hostUnit`)'>
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
    :search='searchParams.searchMissionReport'
    @hide-dialog='exportDialogVisible = false'/>
</template>

<script setup lang='ts'>

import { get } from 'lodash';
import moment from 'moment';
import { storeToRefs } from 'pinia';
import InputNumber from 'primevue/inputnumber';
import { computed, inject, markRaw, nextTick, onMounted, reactive, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { DateTimeFormat, DEFAULT_DATATABLE_CONFIG, DEFAULT_PAGE_SIZE } from '@/common/constants';
import { useGlobalSearchStore } from '@/common/store/search';

import { getMissionListToReport } from '../../api/graphql/report-api';
import { exportExcelMissionFocusReport, exportPdfMissionFocusReport, exportWordMissionFocusReport } from '../../api/rest/report';
import { MissionType, type MissionTypeInterface } from '../../model/mission/mission';
import type { IMissionFocusReport, ISearchMissionReport } from '../../model/report/report';
import ExportDialog from '../mission/component/ExportDialog/ExportDialog.vue';

const { t } = useI18n();
const exportDialogVisible = ref<boolean>(false);
const searchTerm = inject('searchTerm', ref(''));
const missionFocus = ref<IMissionFocusReport[]>([]);
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

pageable.page = 0;
missionFocus.value = [];
const searchParams = reactive({
  searchMissionReport: {
    fromDate: null,
    toDate: null,
    textSearch: '',
    missionType: null,
    fromBudget: 0,
    toBudget: 0
  } as ISearchMissionReport,
  pageable: pageable,
});
const {
  onResult: getMissionFocusResult,
  refetch: getMissionFocusRefetch,
  onError: getMissionFocusError
} =
  getMissionListToReport(searchParams);

watch(searchTerm, (newValue) => {
  searchParams.searchMissionReport.textSearch = newValue;
  isLoading.value = true;
  getMissionFocusRefetch(searchParams);
});

watch(submit, () => {
  pageable.page = 0;
  missionFocus.value = [];
  searchParams.searchMissionReport.fromDate = model.value.fromDate ? moment(model.value.fromDate).format(DateTimeFormat.ISO_LOCAL_DATE) : null,
  searchParams.searchMissionReport.toDate = model.value.toDate ? moment(model.value.toDate).format(DateTimeFormat.ISO_LOCAL_DATE) : null,
  searchParams.searchMissionReport.fromBudget = model.value.fromBudget,
  searchParams.searchMissionReport.toBudget = model.value.toBudget,
  searchParams.searchMissionReport.missionType = model.value.missionType,
  isLoading.value = true;
  getMissionFocusRefetch(searchParams);
});
getMissionFocusResult((res) => {
  const {
    totalRecords,
    content
  } = get(res, 'data.getMissionListToReport', {
    totalRecords: 0,
    content: [],
  });
  
  totalRecord.value = totalRecords;
  if (isLoadMore.value) {
    missionFocus.value = [
      ...missionFocus.value,
      ...content,
    ];
  } else {
    missionFocus.value = content;
  }
  canLoadMore.value = content.length >= DEFAULT_PAGE_SIZE;
  isLoadMore.value = false;
  isLoading.value = false;
});

getMissionFocusError(()=>{
  isLoading.value = false;
});

// function reload() {
//   searchParams.searchInput.textSearch = '';
//   searchParams.pageable.page = 0;
//   isLoading.value = true;
//   getMissionFocusRefetch(searchParams);
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
  const fileName = 'Thống kê các nhiệm vụ trọng tâm';
  return [
    {
      label: t('document.exportDoc.exportPdf'),
      fileName: fileName + '.pdf',
      icon: '/images/file-types/pdf-logo.png',
      exportFunction: exportPdfMissionFocusReport,
    },
    {
      label: t('document.exportDoc.exportWord'),
      fileName: fileName + '.docx',
      icon: '/images/file-types/word-logo.png',
      exportFunction: exportWordMissionFocusReport,
    },
    {
      label: t('document.exportDoc.exportExcel'),
      fileName: fileName + '.xlsx',
      exportFunction: exportExcelMissionFocusReport,
      icon: '/images/file-types/excel-logo.png',
    },
  ];
});

const typeOptions = ref<MissionTypeInterface[]>([
  {
    id: MissionType.TRONG_TAM,
    name: 'Trọng tâm'
  },
  {
    id: MissionType.THUONG_QUY,
    name: 'Thường quy'
  },
  {
    id: MissionType.PHAT_SINH,
    name: 'Phát sinh'
  }
]);

setFields({
  missionType: {
    label: 'Loại nhiệm vụ',
    col: 12,
    optionsDropdown: typeOptions,
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
</script>

<style scoped>
:deep(.p-listbox) {
  height: 100%;
  border-radius: 4px;
}

:deep(th ) {
  background: #F3F3F3 !important;
  font-weight: 800;
}
</style>