<template>
  <DataTable
    v-bind='DEFAULT_DATATABLE_CONFIG'
    :pt="{
      wrapper: {
        class: 'h-full surface-overlay',
      },
    }"
    row-hover
    show-gridlines
    :total-records='totalRecords'
    :value='projects'
    @sort='onSort($event)'>
    <ColumnGroup type='header'>
      <Row>
        <Column
          header='TT'
          :rowspan='2'/>
        <Column
          :header='t(`work.project.name`)'
          :rowspan='2'/>
        <Column
          :header='t(`work.project.admins`)'
          :rowspan='2'/>
        <Column
          :header='t(`work.project.startDate`)'
          :rowspan='2'/>
        <Column
          :header='t(`work.project.endDate`)'
          :rowspan='2'/>
        <Column
          :header='t(`work.report.percent`)'
          :rowspan='2'/>
        <Column
          :header='t(`work.project.task`)'
          :rowspan='2'/>
        <Column
          :colspan='3'
          header='Công việc đang thực hiện'/>
        <Column
          :colspan='3'
          header='Công việc hoàn thành'/>
      </Row>
      <Row>
        <Column header='Tổng'/>
        <Column header='Còn hạn'/>
        <Column header='Quá hạn'/>
        <Column header='Tổng'/>
        <Column header='Đúng hạn'/>
        <Column header='Quá hạn'/>
      </Row>
    </ColumnGroup>
    <Column
      class='text-center'
      header='#'
      style='width: 5%'>
      <template #body='slotProps'>
        <div
          class='align-items-center flex items-center justify-content-center'>
          {{ slotProps.index + 1 }}
        </div>
      </template>
    </Column>

    <Column
      field='name'
      style='min-width: 15vw'></Column>
    <Column
      field='admins'
      style='min-width: 13vw'>
      <template #body='{ data: { admins } }'>
        {{
          admins
            ?.map((user: string) => usersMoreInfo[user]?.fullName)
            .join(', ')
        }}
      </template>
    </Column>
    <Column
      class='text-center'
      field='startDate'
      style='min-width: 7vw'>
      <template #body='{ data: { startDate } }'>
        {{ startDate && moment(startDate).format('DD/MM/YYYY') }}
      </template>
    </Column>
    <Column
      class='text-center'
      field='endDate'
      style='min-width: 7vw'>
      <template #body='{ data: { endDate } }'>
        {{ endDate && moment(endDate).format('DD/MM/YYYY') }}
      </template>
    </Column>

    <Column
      class='text-center'
      field='progress'
      style='min-width: 5vw'>
      <template #body='{ data: { progress } }'>
        <div v-if='progress'>{{ Number.isInteger(progress) ? progress : progress.toFixed(1) }}%</div>
      </template>
    </Column>

    <Column
      class='text-center'
      field='totalTask'
      style='min-width: 6vw'>
    </Column>
    <Column
      class='text-center'
      field='totalDoingTask'
      style='min-width: 5vw'>
    </Column>
    <Column
      body-class='statusName'
      class='text-center'
      field='notOverdueTask'
      style='min-width: 7vw'>
      <template #body='{ data: { notOverdueTask, totalDoingTask } }'>
        <div>{{ notOverdueTask }} {{ calPercent(notOverdueTask, totalDoingTask) }}</div>
      </template>
    </Column>
    <Column
      body-class='numDayExtend'
      class='text-center'
      field='overdueTask'
      style='min-width: 7vw'>
      <template #body='{ data: { overdueTask, totalDoingTask } }'>
        <div>{{ overdueTask }} {{ calPercent(overdueTask, totalDoingTask) }}</div>
      </template>
    </Column>
    <Column
      class='text-center'
      field='totalDoneTask'
      style='min-width: 5vw'>
    </Column>
    <Column
      body-class='statusName'
      class='text-center'
      field='completedOnTime'
      style='min-width: 7vw'>
      <template #body='{ data: { completedOnTime, totalDoneTask } }'>
        <div>{{ completedOnTime }} {{ calPercent(completedOnTime, totalDoneTask) }}</div>
      </template>
    </Column>
    <Column
      body-class='numDayExtend'
      class='text-center'
      field='completedLate'
      style='min-width: 7vw'>
      <template #body='{ data: { completedLate, totalDoneTask } }'>
        <div>{{ completedLate }} {{ calPercent(completedLate, totalDoneTask) }}</div>
      </template>
    </Column>
  </DataTable>

  <ExportDialog
    v-if='exportDialogVisible'
    v-model:visibleDialog='exportDialogVisible'
    :export-options='exportOptions'
    :search='searchParams.searchModel'
    @hide-dialog='hideExportDialogVisibleDialog'/>
</template>

<script lang='ts' setup>
import { assign, get } from 'lodash';
import { storeToRefs } from 'pinia';
import Column from 'primevue/column';
import type { DataTableSortEvent } from 'primevue/datatable';
import MultiSelect from 'primevue/multiselect';
import { computed, inject, markRaw, nextTick, onMounted, reactive, ref, watch, } from 'vue';
import { useI18n } from 'vue-i18n';

import { useUserMoreInfoStore } from '@/apps/admin/store/usersMoreInfo';
import ExportDialog from '@/apps/document/views/doc/component/ExportDialog.vue';
import { getAllActiveProjectGroup } from '@/apps/work/api/graphql/projectGroup';
import { getAllActiveProjectType } from '@/apps/work/api/graphql/projectType';
import { searchReportProject } from '@/apps/work/api/graphql/report';
import { exportExcelReportDetailProjects } from '@/apps/work/api/rest/task-report';
import type { ProjectTypeGroupInterface } from '@/apps/work/model/project';
import { DateTimeFormat, DEFAULT_DATATABLE_CONFIG, DEFAULT_PAGE_SIZE, } from '@/common/constants';
import useMoment from '@/common/helpers/mixins/use-moment';
import { useGlobalSearchStore } from '@/common/store/search';

const { t } = useI18n();
const searchTerm = inject('searchTerm', ref(''));

watch(searchTerm, (newValue) => {
  pageable.page = 0;
  projects.value = [];
  searchParams.searchModel = { keyword: newValue };
  searchReportProjectRefetch(searchParams);
});
const { usersMoreInfo } = storeToRefs(useUserMoreInfoStore());
const { moment } = useMoment();
const pageable = reactive({
  page: 0,
  size: DEFAULT_PAGE_SIZE,
  sort: [
    {
      property: 'createdTime',
      direction: 'DESC',
    },
  ],
});
const projects = ref<any[]>([]);
const canLoadMore = ref(true);
const isLoadMore = ref(true);
const totalRecords = ref();
const searchParams = reactive({
  searchModel: {},
  pageable: pageable,
});

const {
  onResult: searchReportProjectResult,
  refetch: searchReportProjectRefetch,
} = searchReportProject(searchParams);

function reload() {
  searchParams.pageable.page = 0;
  searchParams.searchModel = {};
  searchReportProjectRefetch(searchParams);
}

searchReportProjectResult((res) => {
  const {
    totalCount,
    edges
  } = get(res, 'data.searchReportProject', {
    totalCount: 0,
    edges: [],
  });
  totalRecords.value = totalCount;
  if (isLoadMore.value) {
    projects.value = [
      ...projects.value,
      ...edges.map((edge: any) => ({ ...edge.node })),
    ];
  } else {
    projects.value = edges.map((edge: any) => ({ ...edge.node }));
  }
  canLoadMore.value = edges.length >= DEFAULT_PAGE_SIZE;
  isLoadMore.value = false;
});

function onSort(event: DataTableSortEvent) {
  const {
    sortField,
    sortOrder
  } = event;
  assign(pageable, {
    page: 0,
    sort: [
      {
        property: sortField,
        direction: sortOrder === 1 ? 'ASC' : 'DESC',
      },
    ],
  });
  assign(searchParams, pageable);
  reload();
}

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

const { setFields } = useGlobalSearchStore();
const {
  submit,
  model
} = storeToRefs(useGlobalSearchStore());

watch(submit, () => {
  pageable.page = 0;
  projects.value = [];
  searchParams.searchModel = {
    ...model.value,
    startDate: model.value.startDate
      ? moment(model.value.startDate).format(DateTimeFormat.ISO_LOCAL_DATE)
      : null,
    endDate: model.value.endDate
      ? moment(model.value.endDate).format(DateTimeFormat.ISO_LOCAL_DATE)
      : null,
  };
  searchReportProjectRefetch(searchParams);
});

const exportDialogVisible = inject('exportDialogVisible', ref(false));
const exportOptions = computed(() => {
  const fileName =
    'Báo cáo chi tiết các dự án đến ngày '
    + moment(model.value.endDate || new Date()).format('DD/MM/YYYY');
  return [
    {
      label: t('document.exportDoc.exportPdf'),
      fileName: fileName + '.pdf',
      icon: '/images/file-types/pdf-logo.png',
      disabled: true,
    },
    {
      label: t('document.exportDoc.exportWord'),
      fileName: fileName + '.docx',
      icon: '/images/file-types/word-logo.png',
      disabled: true,
    },
    {
      label: t('document.exportDoc.exportExcel'),
      fileName: fileName + '.xlsx',
      exportFunction: exportExcelReportDetailProjects,
      icon: '/images/file-types/excel-logo.png',
    },
  ];
});

function hideExportDialogVisibleDialog() {
  exportDialogVisible.value = false;
}

const typeOptions = ref<ProjectTypeGroupInterface[]>([]);
const groupOptions = ref<ProjectTypeGroupInterface[]>([]);

getAllActiveProjectType().onResult((rs) => {
  typeOptions.value = get(rs, 'data.getAllActiveProjectType');
});
getAllActiveProjectGroup().onResult((rs) => {
  groupOptions.value = get(rs, 'data.getAllActiveProjectGroup');
});

const calPercent = (data: number, sum: number): string => {
  if (sum > 0) {
    const percent = data / sum * 100;
    const display = Number.isInteger(percent) ? percent : percent.toFixed(1);
    return `(${display}%)`;
  } else {
    return '(0%)';
  }
};

setFields({
  adminId: {
    label: 'Người quản trị',
    type: String,
    col: 6,
    isChooseUser: true,
  },
  implementerId: {
    label: 'Người thực hiện',
    type: String,
    col: 6,
    isChooseUser: true,
  },
  followerId: {
    label: 'Người theo dõi',
    type: String,
    col: 6,
    isChooseUser: true,
  },
  types: {
    label: 'Chọn loại dự án',
    type: String,
    component: markRaw(MultiSelect),
    isMultiSelect: true,
    col: 6,
    props: {
      showClear: true,
      options: typeOptions,
      optionLabel: 'name',
      optionValue: 'id',
    },
  },
  startDate: {
    label: 'Từ ngày',
    type: String,
    col: 6,
    isDatePicker: true,
  },
  endDate: {
    label: 'Đến ngày',
    type: String,
    col: 6,
    isDatePicker: true,
  },
  groupIds: {
    label: 'Chọn nhóm dự án',
    type: String,
    component: markRaw(MultiSelect),
    isMultiSelect: true,
    col: 6,
    props: {
      showClear: true,
      options: groupOptions,
      optionLabel: 'name',
      optionValue: 'id',
    },
  },
});
</script>

<style scoped>
:deep(.numDayExtend) {
  background: #FFF5F5;
}

:deep(.statusName) {
  background: #F0FBF7;
}
</style>
