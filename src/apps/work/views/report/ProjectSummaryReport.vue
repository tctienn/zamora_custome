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
    :value='projects'>
    <Column
      class='text-center'
      header='TT'
      style='width: 5%'>
      <template #body='slotProps'>
        <div
          class='align-items-center flex items-center justify-content-center'>
          {{ slotProps.index + 1 }}
        </div>
      </template>
    </Column>

    <Column
      field='code'
      :header='t(`work.project.code`)'
      style='min-width: 10vw'></Column>

    <Column
      field='name'
      :header='t(`work.project.name`)'
      style='min-width: 15vw'></Column>

    <Column
      field='typeName'
      :header='t(`work.project.type`)'
      style='min-width: 13vw'></Column>

    <Column
      field='groupName'
      :header='t(`work.project.group`)'
      style='min-width: 15vw'>
    </Column>

    <Column
      class='text-center'
      field='startDate'
      :header='t(`work.project.startDate`)'
      style='min-width: 10vw'>
      <template #body='{ data: { startDate } }'>
        {{ startDate && moment(startDate).format('DD/MM/YYYY') }}
      </template>
    </Column>
    <Column
      class='text-center'
      field='endDate'
      :header='t(`work.project.endDate`)'
      style='min-width: 10vw'>
      <template #body='{ data: { endDate } }'>
        {{ endDate && moment(endDate).format('DD/MM/YYYY') }}
      </template>
    </Column>

    <Column
      field='admins'
      :header='t(`work.project.admins`)'
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
      field='implementers'
      :header='t(`work.project.implement`)'
      style='min-width: 15vw'>
      <template #body='{ data: { implementers } }'>
        {{
          implementers
            ?.map((user: string) => usersMoreInfo[user]?.fullName)
            .join(', ')
        }}
      </template>
    </Column>

    <Column
      field='followers'
      :header='t(`work.project.follow`)'
      style='min-width: 15vw'>
      <template #body='{ data: { followers } }'>
        {{
          followers
            ?.map((user: string) => usersMoreInfo[user]?.fullName)
            .join(', ')
        }}
      </template>
    </Column>

    <Column
      class='text-center'
      field='totalTask'
      :header='t(`work.project.task`)'
      style='min-width: 7vw'>
    </Column>

    <Column
      field='description'
      :header='t(`work.project.description`)'
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
      field='progress'
      :header='t(`work.report.percent`)'
      style='min-width: 7vw'>
      <template #body='{ data: { progress } }'>
        <div v-if='progress'>{{ Number.isInteger(progress) ? progress : progress.toFixed(1) }}%</div>
      </template>
    </Column>
    <Column
      class='text-center'
      field='status'
      :header='t(`work.report.statusName`)'
      style='min-width: 10vw'>
      <template #body='{ data: { status } }'>
        <span v-if='status'>{{
          t(
            `work.common.table.statuses.${status?.toString().toLowerCase() || ''}`,
          )
        }}</span>
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
import { get } from 'lodash';
import { storeToRefs } from 'pinia';
import Column from 'primevue/column';
import MultiSelect from 'primevue/multiselect';
import { computed, inject, markRaw, nextTick, onMounted, reactive, ref, watch, } from 'vue';
import { useI18n } from 'vue-i18n';

import { useUserMoreInfoStore } from '@/apps/admin/store/usersMoreInfo';
import ExportDialog from '@/apps/document/views/doc/component/ExportDialog.vue';
import { getAllActiveProjectGroup } from '@/apps/work/api/graphql/projectGroup';
import { getAllActiveProjectType } from '@/apps/work/api/graphql/projectType';
import { searchReportProject } from '@/apps/work/api/graphql/report';
import { exportExcelReportProject } from '@/apps/work/api/rest/task-report';
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
const parser = new DOMParser();
const searchParams = reactive({
  searchModel: {},
  pageable: pageable,
});

const {
  onResult: searchReportProjectResult,
  refetch: searchReportProjectRefetch,
} = searchReportProject(searchParams);

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
  const fileName = 'Thống kê dự án';
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
      exportFunction: exportExcelReportProject,
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

</style>
