<template>
  <div
    class='flex gap-2'
    style='height: calc(100vh - 11.2rem)'>
    <div
      class='h-full overflow-x-hidden overflow-y-auto p-0'
      style='width: 36rem'>
      <slot
        :doc-ins='docIns'
        :loading='loading'
        name='list'
        :selected-document='selectedDocument'
        :total='total'>
        <DocInList
          v-model:selectedDocument='selectedDocument'
          :doc-ins='docIns'
          :loading='loading'
          :total='total'/>
      </slot>
    </div>
    <div class='col overflow-y-auto p-0'>
      <div
        class='flex flex-column gap-1'
        style='height: calc(100vh - 11.2rem)'>
        <!-- DocInActionButtons moved to parent wrapper (DocInWrapper) -->
        <slot
          v-if='selectedDocument'
          :menu-actions='remainActions'
          name='preview'
          :selected-document='selectedDocument'>
          <DocInPreview
            v-if='selectedDocument'
            :menu-actions='remainActions'
            :model='selectedDocument'/>
        </slot>

        <!-- Show skeleton when loading and no document selected -->
        <DocInPreviewSkeleton v-else-if='loading && !selectedDocument'/>
        
        <!-- Show empty state when not loading and no document selected -->
        <EmptyDocSelectedPreview v-else/>
      </div>
    </div>
    <ExportDialog
      v-if='exportDialogVisible'
      v-model:visibleDialog='exportDialogVisible'
      :doc-status='props.docStatus'
      :export-options='exportOptions'
      :search='search'
      @hide-dialog='hideExportDialogVisibleDialog'/>
  </div>

</template>

<script lang="ts" setup>
import { storeToRefs } from 'pinia';
import { type AutoCompleteCompleteEvent, type AutoCompleteItemSelectEvent, } from 'primevue/autocomplete';
import Calendar from 'primevue/calendar';
import Dropdown from 'primevue/dropdown';
import { computed, inject, markRaw, onMounted, type PropType, provide, reactive, ref, watch, } from 'vue';
import { useI18n } from 'vue-i18n';

import { getAllBook } from '@/apps/document/api/graphql/book';
import { getAllDocType } from '@/apps/document/api/graphql/doc-type';
import { getAllField } from '@/apps/document/api/graphql/field';
import {
  getListDocInDocCodeByKeyWord,
  getListDocInPublisherByKeyWord,
  getListDocInQuoteByKeyWord,
  getListDocInSignerByKeyWord,
} from '@/apps/document/api/graphql/searchAdvanced';
import { exportExcelDocIn, exportPDFDocIn, exportWordDocIn, } from '@/apps/document/api/rest/docIn';
import { isDate } from '@/apps/document/helpers/composable/utils';
import { modelSearchFieldInKey } from '@/apps/document/helpers/injectionKeys';
import type { BookInterface } from '@/apps/document/model/book';
import { type DocIn, PRIORITIES, SECURITIES, } from '@/apps/document/model/doc/doc-in';
import type { SearchModel } from '@/apps/document/model/doc/search';
import ExportDialog from '@/apps/document/views/doc/component/ExportDialog.vue';
import { DocumentAction } from '@/apps/document/views/doc/doc-in/action/action';
import DocInList from '@/apps/document/views/doc/doc-in/list/DocInList.vue';
import DocInPreview from '@/apps/document/views/doc/doc-in/preview/DocInPreview.vue';
import DocInPreviewSkeleton from '@/apps/document/views/doc/doc-in/skeleton/DocInPreviewSkeleton.vue';
import EmptyDocSelectedPreview from '@/apps/document/views/doc/EmptyDocSelectedPreview.vue';
import AutoCompleteEmptyTemplate from '@/common/components/app/search/AutoCompleteEmptyTemplate.vue';
import { DateTimeFormat } from '@/common/constants';
import useMoment from '@/common/helpers/mixins/use-moment';
import type { Edge } from '@/common/model/page';
import type { Pageable } from '@/common/model/query';
import { useGlobalSearchStore } from '@/common/store/search';

const props = defineProps({
  menuActions: {
    type: Array as PropType<DocumentAction[]>,
    default: () => [],
  },
  docIns: {
    type: Array as PropType<DocIn[]>,
    default: () => [],
  },
  total: {
    type: Number,
    default: 0,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  docStatus: {
    type: String,
    default: null,
  },
  showActionButton: {
    type: Boolean,
    default: true,
  },
});
const exportDialogVisible = ref(false);
const { t } = useI18n();
const { moment } = useMoment();
const selectedDocument = defineModel('selectedDocument', {
  type: Object as PropType<DocIn | undefined>,
  default: undefined,
});

function hideExportDialogVisibleDialog() {
  exportDialogVisible.value = false;
}

const search = inject(modelSearchFieldInKey);

const exportOptions = computed(() => [
  {
    label: t('document.exportDoc.exportPdf'),
    fileName: t('document.dashboard.incomingDoc') + '.pdf',
    exportFunction: exportPDFDocIn,
    icon: '/images/file-types/pdf-logo.png',
  },
  {
    label: t('document.exportDoc.exportWord'),
    fileName: t('document.dashboard.incomingDoc') + '.docx',
    exportFunction: exportWordDocIn,
    icon: '/images/file-types/word-logo.png',
  },
  {
    label: t('document.exportDoc.exportExcel'),
    fileName: t('document.dashboard.incomingDoc') + '.xlsx',
    exportFunction: exportExcelDocIn,
    icon: '/images/file-types/excel-logo.png',
  },
]);

watch(
  () => props.docIns,
  (value) => {
    const find = value.find(
      (doc) =>
        doc.id === selectedDocument.value?.id
              && (doc.processId
                ? doc.processId === selectedDocument.value?.processId
                : true)
              && (doc.commentId
                ? doc.commentId === selectedDocument.value?.commentId
                : true)
              && (doc.ccId ? doc.ccId === selectedDocument.value?.ccId : true),
    );
    if (find) {
      selectedDocument.value = find;
      return;
    }
    if (value.length > 0) {
      selectedDocument.value = value[0];
    } else {
      selectedDocument.value = undefined;
    }
  },
);
const actionsTop = [
  DocumentAction.PUT_INTO_BOOK,
  DocumentAction.CREATE_PROFILE,
];
const topActions = computed(() =>
  props.menuActions.filter((action) => actionsTop.includes(action)),
);
const remainActions = computed(() =>
  props.menuActions.filter((action) => !actionsTop.includes(action)),
);

const { submit, model } = storeToRefs(useGlobalSearchStore());
const { setFields } = useGlobalSearchStore();

const { onResult: getFieldResult } = getAllField();
const { onResult: getDocTypeResult } = getAllDocType();
const { onResult: getBookResult } = getAllBook();

const fields = ref([]);
const books = ref<BookInterface[]>([]);
const docTypes = ref([]);
getFieldResult((res) => {
  fields.value = res.data.getAllField;
});
getBookResult((res) => {
  books.value = res.data.getAllBook.map((item: BookInterface) => ({
    name: item.bookName,
    id: item.id,
  }));
});
getDocTypeResult((res) => {
  docTypes.value = res.data.getAllDocType;
});

watch(submit, () => {
  mapModel(model.value);
});

provide('doc', selectedDocument);

const updateSearchField = inject(
  'updateSearchField',
  (field: keyof SearchModel, value: any) => void {},
);
//To take incomingDate (from -> to)
const searchTerm = inject('searchTerm', ref(''));
watch(searchTerm, () => {
  updateSearchField('keyword', searchTerm.value.trim());
});

function mapModel(model: SearchModel) {
  const keys = Object.keys(model);
  if (keys.length === 0 && search) {
    Object.keys(search).forEach((key) => {
      if (!['searchTimeFrom', 'searchTimeTo'].includes(key)) {
        delete search[key as keyof SearchModel];
      }
    });
  }
  for (const key in model) {
    if (Object.prototype.hasOwnProperty.call(model, key)) {
      const value = model[key as keyof SearchModel];
      updateSearchField(
          key as keyof SearchModel,
          isDate(value)
            ? moment(value).format(DateTimeFormat.ISO_LOCAL_DATE)
            : value,
      );
    }
  }
}

///For suggest
const minDate = computed(() => new Date(search?.searchTimeFrom || 0));
const maxDate = computed(() => new Date(search?.searchTimeTo || 999999999));

type Signer = {
  signerId: string;
  signerName: string;
};

type Publisher = {
  publisherId: string;
  publisherName: string;
  publisherType: string;
};

type DocCode = {
  docCode: string;
};
type Quote = {
  quote: string;
};

const suggestSigners = ref<Signer[]>([]);
const pageSigner = reactive<Pageable>({
  page: 0,
  size: 99999999,
});
const {
  load: loadSigner,
  refetch: refetchSigner,
  onResult: onResultSigner,
} = getListDocInSignerByKeyWord(model.value.signerName, pageSigner);
onResultSigner((res) => {
  if (res) {
    suggestSigners.value = res.data?.getListDocInSignerByKeyWord?.edges.map(
      (e: Edge<Signer>) => e.node,
    ).filter((e: Signer) => e?.signerName && e.signerName.trim().length > 0);
  }
});

const suggestPublishers = ref<Publisher[]>([]);
const pagePublisher = reactive<Pageable>({
  page: 0,
  size: 99999999,
});
const {
  load: loadPublisher,
  refetch: refetchPublisher,
  onResult: onResultPublisher,
} = getListDocInPublisherByKeyWord(model.value.publisherName, pagePublisher);
onResultPublisher((res) => {
  if (res) {
    suggestPublishers.value =
        res.data?.getListDocInPublisherByKeyWord?.edges.map(
          (e: Edge<Publisher>) => e.node,
        );
  }
});

const suggestDocCodes = ref<DocCode[]>([]);
const pageDocCode = reactive<Pageable>({
  page: 0,
  size: 99999999,
});
const {
  load: loadDocCode,
  refetch: refetchDocCode,
  onResult: onResultDocCode,
} = getListDocInDocCodeByKeyWord(model.value.publisherName, pageDocCode);
onResultDocCode((res) => {
  if (res) {
    suggestDocCodes.value = res.data?.getListDocInDocCodeByKeyWord?.edges.map(
      (e: Edge<DocCode>) => e.node,
    );
  }
});

const suggestQuotes = ref<Quote[]>([]);
const pageQuote = reactive<Pageable>({
  page: 0,
  size: 99999999,
});
const {
  load: loadQuote,
  refetch: refetchQuote,
  onResult: onResultQuote,
} = getListDocInQuoteByKeyWord(model.value.publisherName, pageQuote);
onResultQuote((res) => {
  if (res) {
    suggestQuotes.value = res.data?.getListDocInQuoteByKeyWord?.edges.map(
      (e: Edge<Quote>) => e.node,
    );
  }
});
onMounted(() => {
  const calendarProps = {
    minDate,
    maxDate,
    showIcon: true,
    iconDisplay: 'input',
  };

  const autoCompleteListeners = (field: string) => ({
    'item-select': (event: AutoCompleteItemSelectEvent) => {
      model.value[field] = event.value[field];
    },
    complete: (event: AutoCompleteCompleteEvent) => {
      const keyword = event.query.trim();
      loadFunctionForField(field, {
        keyword,
        page: getPageForField(field),
      })
      || refetchFunctionForField(field, {
        keyword,
        page: getPageForField(field),
      });
    },
  });

  setFields({
    docTypeId: {
      label: t('document.doc.advancedSearch.docType'),
      type: String,
      col: 6,
      optionsDropdown: docTypes,
      isMultiSelect: true,
    },
    bookId: {
      label: t('document.doc.advancedSearch.book'),
      type: String,
      col: 6,
      optionsDropdown: books,
    },
    incomingDateFrom: {
      label: t('document.doc.advancedSearch.incomingDateFrom'),
      col: 6,
      component: markRaw(Calendar),
      props: calendarProps,
    },
    incomingDateTo: {
      label: t('document.doc.advancedSearch.incomingDateTo'),
      col: 6,
      component: markRaw(Calendar),
      props: calendarProps,
    },
    deadlineDateFrom: {
      label: 'Ngày ban hành (Từ ngày)',
      type: String,
      col: 6,
      isDatePicker: true,
    },
    deadlineDateTo: {
      label: 'Ngày ban hành (Đến ngày)',
      type: String,
      col: 6,
      isDatePicker: true,
    },
    signerName: {
      label: t('document.doc.advancedSearch.signer'),
      col: 6,
      component: markRaw(AutoCompleteEmptyTemplate),
      props: {
        suggestions: suggestSigners,
        completeOnFocus: true,
        autoOptionFocus: true,
        optionLabel: 'signerName',
        delay: 500,
        pt: { input: 'w-full' },
      },
      listener: autoCompleteListeners('signerName'),
    },
    publisherName: {
      label: 'Đơn vị ban hành',
      col: 6,
      component: markRaw(AutoCompleteEmptyTemplate),
      props: {
        suggestions: suggestPublishers,
        completeOnFocus: true,
        autoOptionFocus: true,
        delay: 500,
        optionLabel: 'publisherName',
        pt: { input: 'w-full' },
      },
      listener: autoCompleteListeners('publisherName'),
    },
    docCode: {
      label: t('document.doc.advancedSearch.docCode'),
      col: 6,
      component: markRaw(AutoCompleteEmptyTemplate),
      props: {
        suggestions: suggestDocCodes,
        completeOnFocus: true,
        autoOptionFocus: true,
        delay: 500,
        optionLabel: 'docCode',
        pt: { input: 'w-full' },
      },
      listener: autoCompleteListeners('docCode'),
    },
    // bookNumber: {
    //   label: t('document.doc.advancedSearch.bookNumber'),
    //   type: String,
    //   col: 3,
    // },
    securityCode: {
      label: t('document.doc.advancedSearch.securityCode'),
      col: 6,
      component: markRaw(Dropdown),
      props: {
        showClear: true,
        options: SECURITIES,
        optionLabel: 'label',
        optionValue: 'value',
      },
    },
    priorityCode: {
      label: t('document.doc.advancedSearch.priorityCode'),
      col: 6,
      component: markRaw(Dropdown),
      props: {
        showClear: true,
        options: PRIORITIES,
        optionLabel: 'label',
        optionValue: 'value',
      },
    },
    areaId: {
      label: t('document.doc.advancedSearch.area'),
      type: String,
      col: 6,
      optionsDropdown: fields,
      isMultiSelect: true,
    },
    quote: {
      label: t('document.doc.advancedSearch.quote'),
      col: 12,
      component: markRaw(AutoCompleteEmptyTemplate),
      props: {
        suggestions: suggestQuotes,
        completeOnFocus: true,
        autoOptionFocus: true,
        optionLabel: 'quote',
        delay: 500,
        pt: { input: 'w-full' },
      },
      listener: autoCompleteListeners('quote'),
    },
  });
});

function loadFunctionForField(field: string, params: any) {
  switch (field) {
  case 'signerName':
    return loadSigner(null, params);
  case 'publisherName':
    return loadPublisher(null, params);
  case 'docCode':
    return loadDocCode(null, params);
  case 'quote':
    return loadQuote(null, params);
  }
}

function refetchFunctionForField(field: string, params: any) {
  switch (field) {
  case 'signerName':
    return refetchSigner(params);
  case 'publisherName':
    return refetchPublisher(params);
  case 'docCode':
    return refetchDocCode(params);
  case 'quote':
    return refetchQuote(params);
  }
}

function getPageForField(field: string) {
  switch (field) {
  case 'signerName':
    return pageSigner;
  case 'publisherName':
    return pagePublisher;
  case 'docCode':
    return pageDocCode;
  case 'quote':
    return pageQuote;
  }
}
</script>

<style scoped></style>
