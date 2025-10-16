<template>
  <div class='align-items-center flex justify-content-between'>
    <span class='font-bold text-primary text-xl'>{{
      t('document.report.tableTitle')
    }}</span>
    <div class='flex gap-2'>
      <Button
        label='Kết xuất'
        size='small'
        @click='exportDialogVisible = true'>
        <template #icon>
          <AppIcon
            class='mr-2'
            name='order_play'></AppIcon>
        </template>
      </Button>
      <ButtonIcon
        class='btn-create'
        icon='print'
        :label="t('In sổ')"
        outlined/>
    </div>
  </div>
  <div class='flex pt-2'>
    <TabMenu
      v-model:active-index='activeBookType'
      class='w-full'
      :model='bookTypes'
      :pt="{
        action: 'p-3',
      }">
    </TabMenu>
  </div>
  <ReportDocInTable v-if='activeBookType === 0'/>
  <ReportDocOutTable v-if='activeBookType === 1'/>
  <ReportDocSubmitTable v-if='activeBookType === 2'/>

  <ExportDialog
    v-if='exportDialogVisible'
    v-model:visibleDialog='exportDialogVisible'
    :export-options='exportOptions'
    :search='reportDocModel'
    @hide-dialog='hideExportDialogVisibleDialog'/>
</template>

<script lang='ts' setup>
import moment from 'moment';
import { storeToRefs } from 'pinia';
import Calendar from 'primevue/calendar';
import Dropdown from 'primevue/dropdown';
import type { MenuItem } from 'primevue/menuitem';
import { computed, inject, markRaw, onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { getBook } from '@/apps/document/api/graphql/book';
import { getOrgOut } from '@/apps/document/api/graphql/org-out';
import {
  exportExcelReportDocIn,
  exportExcelReportDocOut,
  exportPDFReportDocIn,
  exportPDFReportDocOut,
  exportWordReportDocIn,
  exportWordReportDocOut,
} from '@/apps/document/api/rest/exportReport';
import { type BookInterface, BookType } from '@/apps/document/model/book';
import type { OrgOutInterface } from '@/apps/document/model/orgOut';
import { useDocumentRolesStore } from '@/apps/document/store/document-role';
import ExportDialog from '@/apps/document/views/doc/component/ExportDialog.vue';
import ReportDocInTable from '@/apps/document/views/report/component/ReportDocInTable.vue';
import ReportDocOutTable from '@/apps/document/views/report/component/ReportDocOutTable.vue';
import ReportDocSubmitTable from '@/apps/document/views/report/component/ReportDocSubmitTable.vue';
import OrganizationTree from '@/apps/work-flow/views/components/OrganizationTree/OrganizationTree.vue';
import { useGlobalSearchStore } from '@/common/store/search';

const { setFields } = useGlobalSearchStore();
const { t } = useI18n();
const orgOuts = ref<OrgOutInterface[]>([] as OrgOutInterface[]);
const books = ref<BookInterface[]>([] as BookInterface[]);
const activeBookType = ref();
const extensionMenuRef = ref();
const searchTerm = inject('searchTerm', ref(''));
const { onResult: getOrgResult } = getOrgOut();
const {
  currentOrgId,
  type,
  userDeptRole
} = storeToRefs(
  useDocumentRolesStore(),
);
const calendarProps = {
  showIcon: true,
  iconDisplay: 'input',
};
const {
  onResult: getBookResult,
  load: getBookLoad,
  refetch: getBookRefetch,
} = getBook();
const exportDialogVisible = ref(false);
getOrgResult((res) => {
  orgOuts.value = res.data.getOrgOut;
});

getBookResult((res) => {
  books.value = res.data.getBook;
});

getBookLoad(undefined, {
  structureType: type.value,
  depId: currentOrgId.value,
  bookType: BookType.DOC_IN,
}) || getBookRefetch();

function toggleExtension(event: Event) {
  extensionMenuRef.value.toggle(event);
}

function hideExportDialogVisibleDialog() {
  exportDialogVisible.value = false;
}

const { model } = storeToRefs(useGlobalSearchStore());

const reportDocModel = computed(() => {
  return {
    ...model.value,
    keyword: searchTerm.value,
    incomingDateFrom: model.value.incomingDateFrom
      ? moment(model.value.incomingDateFrom).format('YYYY-MM-DD')
      : null,
    incomingDateTo: model.value.incomingDateTo
      ? moment(model.value.incomingDateTo).format('YYYY-MM-DD')
      : null,
    issueDateFrom: model.value.issueDateFrom
      ? moment(model.value.issueDateFrom).format('YYYY-MM-DD')
      : null,
    issueDateTo: model.value.issueDateTo
      ? moment(model.value.issueDateTo).format('YYYY-MM-DD')
      : null,
    docDateFrom: model.value.docDateFrom
      ? moment(model.value.docDateFrom).format('YYYY-MM-DD')
      : null,
    docDateTo: model.value.docDateTo
      ? moment(model.value.docDateTo).format('YYYY-MM-DD')
      : null,
    organizationId: model.value.organizationId
      ? model.value.organizationId[0]
      : null,
  };
});

const exportOptions = computed(() => {
  const fileName = getFileName();

  return [
    {
      label: t('document.exportDoc.exportPdf'),
      fileName: `${fileName}.pdf`,
      exportFunction: getExportFunction('PDF'),
      icon: '/images/file-types/pdf-logo.png',
    },
    {
      label: t('document.exportDoc.exportWord'),
      fileName: `${fileName}.docx`,
      exportFunction: getExportFunction('Word'),
      icon: '/images/file-types/word-logo.png',
    },
    {
      label: t('document.exportDoc.exportExcel'),
      fileName: `${fileName}.xlsx`,
      exportFunction: getExportFunction('Excel'),
      icon: '/images/file-types/excel-logo.png',
    },
  ];
});

function getFileName() {
  const fileNames = [
    t('document.exportDoc.reportDocIn'),
    t('document.exportDoc.reportDocOut'),
    t('document.exportDoc.reportDocSubmit'),
  ];
  return fileNames[activeBookType.value] || '';
}

type ExportFormat = 'PDF' | 'Word' | 'Excel';

function getExportFunction(format: ExportFormat) {
  const exportFunctions: Record<ExportFormat, (any | null)[]> = {
    PDF: [exportPDFReportDocIn, exportPDFReportDocOut, null],
    Word: [exportWordReportDocIn, exportWordReportDocOut, null],
    Excel: [exportExcelReportDocIn, exportExcelReportDocOut, null],
  };

  return exportFunctions[format][activeBookType.value] || null;
}

const bookTypes: MenuItem[] = [
  {
    label: t('document.menu.documentDocIn'),
    command: () => {
    },
  },
  {
    label: t('document.menu.documentDocOut'),
    command: () => {
    },
  },
  // {
  //   label: t('document.menu.documentSubmit'),
  //   command: () => {},
  // },
];

onMounted(() => {
  activeBookType.value = 0;
});

watch(activeBookType, (value) => {
  model.value = {};
  if (value == 0) {
    getBookLoad(undefined, {
      structureType: type.value,
      depId: currentOrgId.value,
      bookType: BookType.DOC_IN,
    }) || getBookRefetch();
    setFields({
      organizationId: {
        label: 'Đơn vị',
        component: markRaw(OrganizationTree),
        col: 12,
        props: {
          'selection-mode': 'single',
          'org-type': userDeptRole.value.type,
        },
      },
      id: {
        label: 'Sổ văn bản đến',
        type: String,
        col: 12,
        component: markRaw(Dropdown),
        props: {
          showClear: true,
          options: books,
          optionLabel: 'bookName',
          optionValue: 'id',
        },
      },
      publisherId: {
        label: 'Cơ quan ban hành',
        type: String,
        component: markRaw(Dropdown),
        col: 12,
        props: {
          showClear: true,
          options: orgOuts,
          optionLabel: 'orgOutName',
          optionValue: 'id',
        },
      },
      incomingDateFrom: {
        label: 'Ngày đến: Từ ngày',
        type: String,
        col: 6,
        isDatePicker: true,
      },
      incomingDateTo: {
        label: 'Ngày đến',
        type: String,
        col: 6,
        isDatePicker: true,
      },
      docDateFrom: {
        label: 'Ngày văn bản: Ngày đến',
        type: String,
        col: 6,
        isDatePicker: true,
      },
      docDateTo: {
        label: t('Ngày đến'),
        col: 6,
        component: markRaw(Calendar),
        props: calendarProps,
      },
    });
  } else if (value == 1) {
    getBookLoad(undefined, {
      structureType: type.value,
      depId: currentOrgId.value,
      bookType: BookType.DOC_OUT,
    }) || getBookRefetch();
    setFields({
      organizationId: {
        label: 'Đơn vị',
        component: markRaw(OrganizationTree),
        col: 12,
        props: {
          'selection-mode': 'single',
          'org-type': userDeptRole.value.type,
        },
      },
      id: {
        label: 'Sổ văn bản đến',
        type: String,
        col: 12,
        component: markRaw(Dropdown),
        props: {
          showClear: true,
          options: books,
          optionLabel: 'bookName',
          optionValue: 'id',
        },
      },
      publisherId: {
        label: 'Cơ quan ban hành',
        type: String,
        component: markRaw(Dropdown),
        col: 12,
        props: {
          showClear: true,
          options: orgOuts,
          optionLabel: 'orgOutName',
          optionValue: 'id',
        },
      },
      issueDateFrom: {
        label: 'Ngày dự thảo: Từ ngày',
        type: String,
        col: 6,
        isDatePicker: true,
      },
      issueDateTo: {
        label: 'Ngày đến',
        type: String,
        col: 6,
        isDatePicker: true,
      },
      docDateFrom: {
        label: 'Ngày văn bản: Ngày đến',
        type: String,
        col: 6,
        isDatePicker: true,
      },
      docDateTo: {
        label: t('Ngày đến'),
        col: 6,
        component: markRaw(Calendar),
        props: calendarProps,
      },
    });
  }
});
</script>

<style scoped></style>
