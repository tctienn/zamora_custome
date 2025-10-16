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
    :value='myTasks'>
    <Column
      class='text-center'
      frozen
      header='TT'>
      <template #body='slotProps'>
        <div
          class='align-items-center flex items-center justify-content-center'>
          {{ slotProps.index + 1 }}
        </div>
      </template>
    </Column>

    <Column
      field='name'
      frozen
      :header='t(`work.report.name`)'
      style='min-width: 18vw'></Column>

    <Column
      field='projectName'
      :header='t(`work.report.projectName`)'
      style='min-width: 10vw'></Column>

    <Column
      field='assignerName'
      :header='t(`work.report.assignerName`)'
      style='min-width: 8vw'>
    </Column>

    <Column
      field='follower'
      :header='t(`work.report.follower`)'
      style='min-width: 15vw'>
      <template #body='{ data: { follower } }'>
        {{
          follower
            ?.split(',')
            .map((user: string) => usersMoreInfo[user]?.fullName)
            .join(', ')
        }}
      </template>
    </Column>

    <Column
      field='description'
      :header='t(`work.report.description`)'
      style='min-width: 15vw'>
      <template #body='{ data: { description } }'>
        {{
          description &&
            parser.parseFromString(description, 'text/html').body.textContent
        }}
      </template>
    </Column>

    <Column
      class='text-center'
      field='startTime'
      :header='t(`work.report.startTime`)'
      style='min-width: 8vw'>
      <template #body='{ data: { startTime } }'>
        {{ moment(startTime).format('DD/MM/YYYY') }}
      </template>
    </Column>
    <Column
      class='text-center'
      field='dueTime'
      :header='t(`work.report.dueTime`)'
      style='min-width: 8vw'>
      <template #body='{ data: { dueTime } }'>
        {{ dueTime && moment(dueTime).format('DD/MM/YYYY') }}
      </template>
    </Column>

    <Column
      body-class='numDayExtend'
      class='text-center'
      :header='t(`work.report.numDayExtend`)'
      style='min-width: 8vw'>
      <template #body='{ data: { startTime, dueTime } }'>
        {{ calculateNumDays(startTime, dueTime) }}
      </template>
    </Column>

    <Column
      body-class='percent'
      class='text-center'
      field='percent'
      :header='t(`work.report.percent`)'
      style='min-width: 6vw'>
      <template #body='{ data: { percent } }'>
        <div v-if='percent'>{{ percent }}%</div>
      </template>
    </Column>
    <Column
      body-class='statusName'
      class='text-center'
      field='statusName'
      :header='t(`work.report.statusName`)'
      style='min-width: 8vw'></Column>

    <Column
      class='text-center'
      field='createdTime'
      :header='t(`work.report.createdTime`)'
      style='min-width: 8vw'>
      <template #body='{ data: { createdTime } }'>
        {{ createdTime && moment(createdTime).format('DD/MM/YYYY') }}
      </template>
    </Column>
  </DataTable>

  <ExportDialog
    v-if='exportDialogVisible'
    v-model:visibleDialog='exportDialogVisible'
    :export-options='exportOptions'
    :search='searchParams.searchModel'
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
import { camelCase, get, omit } from 'lodash';
import { storeToRefs } from 'pinia';
import Column from 'primevue/column';
import type Menu from 'primevue/menu';
import MultiSelect from 'primevue/multiselect';
import { computed, inject, markRaw, nextTick, onMounted, reactive, ref, watch, } from 'vue';
import { useI18n } from 'vue-i18n';

import { useUserMoreInfoStore } from '@/apps/admin/store/usersMoreInfo';
import ExportDialog from '@/apps/document/views/doc/component/ExportDialog.vue';
import { getAllProjects } from '@/apps/work/api/graphql/project';
import { searchMyTasks } from '@/apps/work/api/graphql/report';
import { getAllActiveTaskGroup } from '@/apps/work/api/graphql/task-group';
import { exportExcelReportMyTask } from '@/apps/work/api/rest/task-report';
import { WorkStatusV2 } from '@/apps/work/model/work';
import { DateTimeFormat, DEFAULT_DATATABLE_CONFIG, DEFAULT_PAGE_SIZE, } from '@/common/constants';
import useMoment from '@/common/helpers/mixins/use-moment';
import { createOptions } from '@/common/helpers/utils';
import { useGlobalSearchStore } from '@/common/store/search';
import { useUserStore } from '@/common/store/user';

const { t } = useI18n();
const searchTerm = inject('searchTerm', ref(''));

type ViewTypeInterface = 'createdTimeDesc' | 'createdTimeAsc' | 'startTimeDesc' | 'startTimeAsc' | '';
const viewType = ref<ViewTypeInterface>('createdTimeAsc');

watch(searchTerm, (newValue) => {
  pageable.page = 0;
  myTasks.value = [];
  searchParams.searchModel = { keyword: newValue };
  searchMyTasksRefetch(searchParams);
});
const { usersMoreInfo } = storeToRefs(useUserMoreInfoStore());
const { moment } = useMoment();
const pageable = reactive({
  page: 0,
  size: DEFAULT_PAGE_SIZE,
  sort: [
    {
      property: 'createdTime',
      direction: 'ASC',
    },
  ],
});
const myTasks = ref<any[]>([]);
const canLoadMore = ref(true);
const isLoadMore = ref(true);
const totalRecords = ref();
const parser = new DOMParser();
const searchParams = reactive({
  searchModel: {},
  pageable: pageable,
});

const {
  onResult: searchMyTasksResult,
  refetch: searchMyTasksRefetch
} =
  searchMyTasks(searchParams);

function reload() {
  searchParams.pageable.page = 0;
  searchParams.searchModel = {};
  searchMyTasksRefetch(searchParams);
}

const exportDialogVisible = inject('exportDialogVisible', ref(false));
const viewTypeRef = inject('viewTypeRef', ref(false));

searchMyTasksResult((res) => {
  const {
    totalCount,
    edges
  } = get(res, 'data.searchMyTasks', {
    totalCount: 0,
    edges: [],
  });
  totalRecords.value = totalCount;
  if (isLoadMore.value) {
    myTasks.value = [
      ...myTasks.value,
      ...edges.map((edge: any) => ({ ...edge.node })),
    ];
  } else {
    myTasks.value = edges.map((edge: any) => ({ ...edge.node }));
  }
  canLoadMore.value = edges.length >= DEFAULT_PAGE_SIZE;
  isLoadMore.value = false;
});

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
const { user } = storeToRefs(useUserStore());
model.value.participantId = user.value.id;

watch(submit, () => {
  pageable.page = 0;
  myTasks.value = [];
  searchParams.searchModel = {
    ...model.value,
    startTime: model.value.startTime
      ? moment(model.value.startTime).format(DateTimeFormat.ISO_LOCAL_DATE_TIME)
      : null,
    dueTime: model.value.dueTime
      ? moment(model.value.dueTime).format(DateTimeFormat.ISO_LOCAL_DATE_TIME)
      : null,
  };
  searchMyTasksRefetch(searchParams);
});

const exportOptions = computed(() => {
  const fileName = 'Thống kê công việc tôi thực hiện';
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
      exportFunction: exportExcelReportMyTask,
      icon: '/images/file-types/excel-logo.png',
    },
  ];
});

function hideExportDialogVisibleDialog() {
  exportDialogVisible.value = false;
}

function calculateNumDays(startTime: any, dueTime: any) {
  if (!startTime || !dueTime) {
    return '';
  }
  const start = moment(startTime).startOf('day');
  const end = moment(dueTime).startOf('day');
  if (end.isBefore(start)) {
    return 0;
  }
  let workingDays = 0;
  let current = start.clone();
  while (current.isSameOrBefore(end)) {
    const day = current.isoWeekday();
    if (day !== 6 && day !== 7) {
      workingDays++;
    }
    current.add(1, 'day');
  }
  return workingDays;
}

const TASK_STATUS_OPTIONS = createOptions(omit(WorkStatusV2, 'ALL'), (key) =>
  t(`work.work.statuses.${camelCase(key)}`),
);

const projectOptions = ref();
const {
  onResult: allProjectsOnResult,
  load: allProjectsLoad
} =
  getAllProjects();
allProjectsOnResult((rs) => {
  projectOptions.value = get(rs, 'data.getAllProjects');
});
allProjectsLoad();

const taskGroupOptions = ref();
const {
  onResult: resultTaskGroup,
  load: loadTaskGroup
} =
  getAllActiveTaskGroup();
resultTaskGroup((rs) => {
  taskGroupOptions.value = get(rs, 'data.getAllActiveTaskGroup');
});
loadTaskGroup();

const viewTypeMenu = computed(() => [
  {
    label: t('work.report.createdTimeAsc'),
    key: 'createdTimeAsc',
    command: () => {
      viewType.value = viewType.value === 'createdTimeAsc' ? '' : 'createdTimeAsc';
      pageable.sort = [
        {
          property: 'createdTime',
          direction: 'ASC',
        },
      ];
      reload();
    },
  },
  {
    label: t('work.report.createdTimeDesc'),
    key: 'createdTimeDesc',
    command: () => {
      viewType.value = viewType.value === 'createdTimeDesc' ? '' : 'createdTimeDesc';
      pageable.sort = [
        {
          property: 'createdTime',
          direction: 'DESC',
        },
      ];
      reload();
    },
  },
  {
    label: t('work.report.startTimeAsc'),
    key: 'startTimeAsc',
    command: () => {
      viewType.value = viewType.value === 'startTimeAsc' ? '' : 'startTimeAsc';
      pageable.sort = [
        {
          property: 'startTime',
          direction: 'ASC',
        },
      ];
      reload();
    },
  },
  {
    label: t('work.report.startTimeDesc'),
    key: 'startTimeDesc',
    command: () => {
      viewType.value = viewType.value === 'startTimeDesc' ? '' : 'startTimeDesc';
      pageable.sort = [
        {
          property: 'startTime',
          direction: 'DESC',
        },
      ];
      reload();
    },
  }
]);

setFields({
  participantId: {
    label: 'Người thực hiện',
    type: String,
    col: 6,
    isChooseUser: true,
  },
  assignerId: {
    label: 'Người giao',
    type: String,
    col: 6,
    isChooseUser: true,
  },
  projectIds: {
    label: 'Chọn dự án',
    type: String,
    component: markRaw(MultiSelect),
    isMultiSelect: true,
    col: 6,
    props: {
      showClear: true,
      options: projectOptions,
      optionLabel: 'name',
      optionValue: 'id',
    },
  },
  taskGroupIds: {
    label: 'Nhóm công việc',
    type: String,
    component: markRaw(MultiSelect),
    isMultiSelect: true,
    col: 6,
    props: {
      showClear: true,
      options: taskGroupOptions,
      optionLabel: 'name',
      optionValue: 'id',
    },
  },
  startTime: {
    label: 'Từ ngày',
    type: String,
    col: 6,
    isDatePicker: true,
  },
  dueTime: {
    label: 'Đến ngày',
    type: String,
    col: 6,
    isDatePicker: true,
  },
  status: {
    label: t('vehicle.bookingCar.status'),
    type: String,
    component: markRaw(MultiSelect),
    col: 6,
    props: {
      showClear: true,
      options: TASK_STATUS_OPTIONS,
      optionLabel: 'label',
      optionValue: 'value',
    },
  },
});
</script>

<style scoped>
:deep(.numDayExtend) {
  background: #FFF5F5;
}

:deep(.percent) {
  background: #EFFAFE;
}

:deep(.statusName) {
  background: #F0FBF7;
}
</style>
