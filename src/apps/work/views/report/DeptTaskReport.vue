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
    :value='data'>
    <ColumnGroup type='header'>
      <Row>
        <Column
          header='TT'
          :rowspan='2'/>
        <Column
          header='Phòng ban'
          :rowspan='2'/>
        <Column
          :colspan='3'
          header='Tổng công việc'/>
        <Column
          :colspan='3'
          header='Công việc đang thực hiện'/>
        <Column
          :colspan='3'
          header='Công việc hoàn thành'/>
      </Row>
      <Row>
        <Column header='Tổng'/>
        <Column header='Đúng hạn'/>
        <Column header='Quá hạn'/>
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
      <template #body='{data: { organizationId }}'>
        <div
          class='align-items-center flex items-center justify-content-center'>
          {{ getSttOgr(organizationId, orgsWithSTT) }}
        </div>
      </template>
    </Column>

    <Column field='organizationName'></Column>

    <Column
      class='text-center'
      field='totalTasks'
      style='min-width: 5vw'>
    </Column>
    <Column
      class='text-center'
      field='dueTasks'
      style='min-width: 7vw'>
      <template #body='{ data: { dueTasks, totalTasks } }'>
        <div>{{ dueTasks }} {{ calPercent(dueTasks, totalTasks) }}</div>
      </template>
    </Column>
    <Column
      class='text-center'
      field='overdueTasks'
      style='min-width: 7vw'>
      <template #body='{ data: { overdueTasks, totalTasks } }'>
        <div>{{ overdueTasks }} {{ calPercent(overdueTasks, totalTasks) }}</div>
      </template>
    </Column>

    <Column
      class='text-center'
      field='totalDoingTasks'
      style='min-width: 5vw'>
    </Column>
    <Column
      class='text-center'
      field='stillDueDoingTasks'
      style='min-width: 7vw'>
      <template #body='{ data: { stillDueDoingTasks, totalDoingTasks } }'>
        <div>{{ stillDueDoingTasks }} {{ calPercent(stillDueDoingTasks, totalDoingTasks) }}</div>
      </template>
    </Column>
    <Column
      class='text-center'
      field='overdueDoingTasks'
      style='min-width: 7vw'>
      <template #body='{ data: { overdueDoingTasks, totalDoingTasks } }'>
        <div>{{ overdueDoingTasks }} {{ calPercent(overdueDoingTasks, totalDoingTasks) }}</div>
      </template>
    </Column>

    <Column
      class='text-center'
      field='totalDoneTasks'
      style='min-width: 5vw'>
    </Column>
    <Column
      class='text-center'
      field='stillDueDoneTasks'
      style='min-width: 7vw'>
      <template #body='{ data: { stillDueDoneTasks, totalDoneTasks } }'>
        <div>{{ stillDueDoneTasks }} {{ calPercent(stillDueDoneTasks, totalDoneTasks) }}</div>
      </template>
    </Column>
    <Column
      class='text-center'
      field='overdueDoneTasks'
      style='min-width: 7vw'>
      <template #body='{ data: { overdueDoneTasks, totalDoneTasks } }'>
        <div>{{ overdueDoneTasks }} {{ calPercent(overdueDoneTasks, totalDoneTasks) }}</div>
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

<script setup lang='ts'>
import { get } from 'lodash';
import { storeToRefs } from 'pinia';
import Column from 'primevue/column';
import { computed, inject, reactive, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { getAllOrganizationGraphql } from '@/apps/admin/api/graphql/organization-graphql-api';
import type { OrganizationInterface } from '@/apps/admin/model/organization';
import ExportDialog from '@/apps/document/views/doc/component/ExportDialog.vue';
import { getDeptTaskReport } from '@/apps/work/api/graphql/report';
import { exportExcelReportDeptTask } from '@/apps/work/api/rest/task-report';
import { DateTimeFormat, DEFAULT_DATATABLE_CONFIG } from '@/common/constants';
import useMoment from '@/common/helpers/mixins/use-moment';
import { listToTree } from '@/common/helpers/utils';
import { useGlobalSearchStore } from '@/common/store/search';

const { t } = useI18n();
const { moment } = useMoment();
const searchTerm = inject('searchTerm', ref(''));

const data = ref();

const searchParams = reactive({ searchModel: {} });
const {
  onResult: getDeptTaskReportResult,
  refetch: getDeptTaskReportRefetch
} =
  getDeptTaskReport(searchParams);
getDeptTaskReportResult((res) => {
  data.value = res.data.getDeptTaskReport;
});

function reload() {
  searchParams.searchModel = {};
  getDeptTaskReportRefetch(searchParams);
}

const exportDialogVisible = inject('exportDialogVisible', ref(false));
const exportOptions = computed(() => {
  const fileName = t('work.menu.deptTask');
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
      exportFunction: exportExcelReportDeptTask,
      icon: '/images/file-types/excel-logo.png',
    },
  ];
});

function hideExportDialogVisibleDialog() {
  exportDialogVisible.value = false;
}

const { setFields } = useGlobalSearchStore();
const {
  submit,
  model
} = storeToRefs(useGlobalSearchStore());

watch(submit, () => {
  data.value = [];
  searchParams.searchModel = {
    startTime: model.value.startTime
      ? moment(model.value.startTime).format(DateTimeFormat.ISO_LOCAL_DATE_TIME)
      : null,
    dueTime: model.value.dueTime
      ? moment(model.value.dueTime).format(DateTimeFormat.ISO_LOCAL_DATE_TIME)
      : null,
    deptIds: Object.keys(model.value.deptIds),
  };
  getDeptTaskReportRefetch(searchParams);
});
const organizations = ref([]);
const hierarchy = ref();
const orgsWithSTT = ref();
const { onResult: getAllOrganizationResult } = getAllOrganizationGraphql();
getAllOrganizationResult((response) => {
  const data = get(response, 'data.allOrganizationPublic', []);
  hierarchy.value = buildHierarchy(data);
  orgsWithSTT.value = assignSTT(hierarchy.value);
  organizations.value = listToTree(
    data.map((organization: OrganizationInterface) => ({
      key: organization.id,
      label: organization.name,
      data: organization.code,
      parentId: organization.parentCode,
      children: [],
    })),
    {
      id: 'data',
      parentId: 'parentId',
      children: 'children',
    },
  );
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

const getSttOgr = (id: string, ogrs: any[]): string => {
  return ogrs?.find((item: any) => item.id === id).stt;
};

setFields({
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
  deptIds: {
    label: 'Chọn phòng ban',
    type: String,
    col: 6,
    optionsTreeSelect: organizations,
  },
});

function buildHierarchy(organizations: any) {
  const orgMap: any = {};
  const rootNodes: any = [];

  organizations.forEach((org: any) => {
    orgMap[org.code] = {
      ...org,
      children: []
    };
  });

  organizations.forEach((org: any) => {
    if (org.parentCode && orgMap[org.parentCode]) {
      orgMap[org.parentCode].children.push(orgMap[org.code]);
    } else {
      rootNodes.push(orgMap[org.code]);
    }
  });

  return rootNodes;
}

function assignSTT(nodes: any[], prefix = '', level = 1): any[] {
  if (!Array.isArray(nodes)) {
    return [];
  }

  const result: any[] = [];

  nodes.forEach((node: any, index: number) => {
    let currentPrefix: string;

    if (level === 1) {
      currentPrefix = 'A';
    } else if (level === 2) {
      currentPrefix = `${index + 1}`;
    } else {
      currentPrefix = `${prefix}.${index + 1}`;
    }

    result.push({
      ...node,
      stt: currentPrefix
    });

    if (Array.isArray(node.children) && node.children.length) {
      result.push(...assignSTT(node.children, currentPrefix, level + 1));
    }
  });

  return result;
}

</script>

<style scoped>
:deep(.p-datatable-tbody > tr:first-child) {
  color: red
}
</style>
