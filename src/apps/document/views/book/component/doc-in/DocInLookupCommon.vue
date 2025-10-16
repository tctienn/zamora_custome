<template>
  <DocInManageWrapper
    v-model:selected-document='selectedDocument'
    :doc-ins='docIns'
    :loading='loading'
    :menu-actions='documentActions'
    :total='total'>
    <template #list>
      <DocInProcessList
        v-model:selected-document='selectedDocument'
        :doc-ins='docIns'
        :loading='loading'
        :total='total'/>
    </template>
  </DocInManageWrapper>
</template>

<script lang='ts' setup>
import { storeToRefs } from 'pinia';
import type { AutoCompleteCompleteEvent, AutoCompleteItemSelectEvent } from 'primevue/autocomplete';
import Calendar from 'primevue/calendar';
import Dropdown from 'primevue/dropdown';
import type { VirtualScrollerLazyEvent } from 'primevue/virtualscroller';
import { computed, inject, markRaw, onMounted, type PropType, provide, reactive, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import type { Router } from 'vue-router';

import { getAllBook } from '@/apps/document/api/graphql/book';
import { searchAllDocIn } from '@/apps/document/api/graphql/doc-in';
import { getAllDocType } from '@/apps/document/api/graphql/doc-type';
import { getAllField } from '@/apps/document/api/graphql/field';
import { getOrgOut } from '@/apps/document/api/graphql/org-out';
import {
  getListDocInDocCodeByKeyWord,
  getListDocInPublisherByKeyWord,
  getListDocInQuoteByKeyWord,
  getListDocInSignerByKeyWord
} from '@/apps/document/api/graphql/searchAdvanced';
import { isDate } from '@/apps/document/helpers/composable/utils';
import type { BookInterface } from '@/apps/document/model/book';
import {
  DOC_SOURCES,
  type DocIn,
  METHOD_RECIEVES,
  PRIORITIES,
  PROCESS_IN_STATUSES,
  READ_STATUSES,
  SECURITIES
} from '@/apps/document/model/doc/doc-in';
import type { SearchModel } from '@/apps/document/model/doc/search';
import type { OrgOutInterface } from '@/apps/document/model/orgOut';
import { useDocumentRolesStore } from '@/apps/document/store/document-role';
import { DocumentAction } from '@/apps/document/views/doc/doc-in/action/action';
import DocInProcessList from '@/apps/document/views/doc/doc-in/list/DocInProcessList.vue';
import DocInManageWrapper from '@/apps/document/views/doc/doc-in/manage/DocInManageWrapper.vue';
import AutoCompleteEmptyTemplate from '@/common/components/app/search/AutoCompleteEmptyTemplate.vue';
import { DateTimeFormat } from '@/common/constants';
import useMoment from '@/common/helpers/mixins/use-moment';
import type { Edge } from '@/common/model/page';
import type { Order, Pageable } from '@/common/model/query';
import { useGlobalSearchStore } from '@/common/store/search';

const { t } = useI18n();

const documentActions = [
  DocumentAction.COPY,
  DocumentAction.PROCLAIM,
  DocumentAction.ASK_FOR_OPINION,
  DocumentAction.CREATE_DRAFT,
];
const selectedDocument = defineModel('selectedDocument', {
  type: Object as PropType<DocIn | undefined>,
  default: undefined,
});
const pageable = reactive<Pageable>({
  page: 0,
  size: 10,
});
const { moment } = useMoment();

const search = reactive<SearchModel>({});
const { userDeptRole } = storeToRefs(useDocumentRolesStore());
const {
  result: resultDocIns,
  loading,
  load,
  refetch,
} = searchAllDocIn(search, userDeptRole.value, pageable);

const docIns = computed(() =>
  resultDocIns.value?.searchAllDocIn.edges.map((edge: Edge<DocIn>) => edge.node),
);
const total = computed((): number => resultDocIns.value?.searchAllDocIn.totalCount || 0);
const updateCount = inject('updateCount', (countField: string, count: number) => void {});
watch(total, (value) => {
  updateCount('countDocIn', value);
});

function updateSearchField(field: keyof SearchModel, value: any) {
  search[field] = value;
}

function updatePageable(page: number) {
  pageable.page = page;
}

function updateOrder(orders: Order[]) {
  pageable.sort = orders;
}

function goToDetailRoute(router: Router, docIn: DocIn) {
  router.push({
    name: 'DocInLookupProcess',
    params: { processId: docIn.process?.id }
  });
}

provide('updateSearchField', updateSearchField);
provide('updatePageable', updatePageable);
provide('updateOrder', updateOrder);
provide('goToDetailRoute', goToDetailRoute);
provide('afterAction', () => refetch());
provide('isFlowFinish', true);
const {
  submit,
  model
} = storeToRefs(useGlobalSearchStore());
const { setFields } = useGlobalSearchStore();
watch(submit, () => {
  mapModel(model.value);
});

//To take incomingDate (from -> to)
const searchTerm = inject('searchTerm', ref(''));
watch(searchTerm, () => {
  updateSearchField('keyword', searchTerm.value);
});

function mapModel(model: SearchModel) {
  const keys = Object.keys(model);
  if (keys.length === 0) {
    Object.keys(search).forEach(key => {
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

const minDate = computed(() => new Date(search?.searchTimeFrom || 0));
const maxDate = computed(() => new Date(search?.searchTimeTo || 999999999));

type Signer = {
  signerId: string,
  signerName: string
}

type Publisher = {
  publisherId: string,
  publisherName: string,
  publisherType: string,
}

type DocCode = {
  docCode: string
}
type Quote = {
  quote: string
}

const suggestSigners = ref<Signer[]>([]);
const pageSigner = reactive<Pageable>({
  page: 0,
  size: 99999999
});
const {
  load: loadSigner,
  refetch: refetchSigner,
  onResult: onResultSigner,
} = getListDocInSignerByKeyWord(model.value.signerName, pageSigner);
onResultSigner((res) => {
  if (res) {
    suggestSigners.value = res.data?.getListDocInSignerByKeyWord
      ?.edges.map((e: Edge<Signer>) => e.node);
  }
});

const suggestPublishers = ref<Publisher[]>([]);
const pagePublisher = reactive<Pageable>({
  page: 0,
  size: 99999999
});
const {
  load: loadPublisher,
  refetch: refetchPublisher,
  onResult: onResultPublisher,
} = getListDocInPublisherByKeyWord(model.value.publisherName, pagePublisher);
onResultPublisher((res) => {
  if (res) {
    suggestPublishers.value = res.data?.getListDocInPublisherByKeyWord
      ?.edges.map((e: Edge<Publisher>) => e.node);
  }
});

const suggestDocCodes = ref<DocCode[]>([]);
const pageDocCode = reactive<Pageable>({
  page: 0,
  size: 99999999
});
const {
  load: loadDocCode,
  refetch: refetchDocCode,
  onResult: onResultDocCode,
} = getListDocInDocCodeByKeyWord(model.value.publisherName, pageDocCode);
onResultDocCode((res) => {
  if (res) {
    suggestDocCodes.value = res.data?.getListDocInDocCodeByKeyWord
      ?.edges.map((e: Edge<DocCode>) => e.node);
  }
});
const orgOuts = ref<OrgOutInterface[]>([] as OrgOutInterface[]);
const { onResult: getOrgResult } = getOrgOut();
getOrgResult((res) => {
  orgOuts.value = res.data.getOrgOut;
});

const suggestQuotes = ref<Quote[]>([]);
const pageQuote = reactive<Pageable>({
  page: 0,
  size: 5
});
const {
  load: loadQuote,
  refetch: refetchQuote,
  onResult: onResultQuote,
} = getListDocInQuoteByKeyWord(model.value.publisherName, pageQuote);
onResultQuote((res) => {
  if (res) {
    suggestQuotes.value = res.data?.getListDocInQuoteByKeyWord
      ?.edges.map((e: Edge<Quote>) => e.node);
  }
});

onMounted(() => {
  load();
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
        page: getPageForField(field)
      })
      || refetchFunctionForField(field, {
        keyword,
        page: getPageForField(field)
      });
    },
    focus: (event: Event) => {
      loadFunctionForField(field, {
        keyword: '',
        page: getPageForField(field)
      })
      || refetchFunctionForField(field, {
        keyword: '',
        page: getPageForField(field)
      });
    }
  });

  setFields({
    status: {
      label: t('document.doc.advancedSearch.status'),
      type: String,
      col: 6,
      component: markRaw(Dropdown),
      props: {
        pt: { input: 'font-semibold' },
        showClear: true,
        options: PROCESS_IN_STATUSES,
        optionLabel: (data: Record<string, any>) => t(data?.label || ''),
        optionValue: 'value',
      },
      labelStyle: { 'font-weight': 600 },
    },
    docTypeId: {
      label: t('document.doc.advancedSearch.docType'),
      type: String,
      col: 6,
      optionsDropdown: docTypes,
      isMultiSelect: true,
    },
    quote: {
      label: t('document.doc.advancedSearch.quote'),
      col: 12,
      component: markRaw(AutoCompleteEmptyTemplate),
      props: {
        suggestions: suggestQuotes,
        autoOptionFocus: true,
        optionLabel: 'quote',
        completeOnFocus: true,
        virtualScrollerOptions: {
          delay: 20,
          lazy: true,
          onLazyLoad: (event: VirtualScrollerLazyEvent) => console.log(event),
          itemSize: 40,
        },
        delay: 500,
        pt: { input: 'w-full', }
      },
      listener: autoCompleteListeners('quote'),
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
        pt: { input: 'w-full', }
      },
      listener: autoCompleteListeners('docCode'),
    },

    bookNumber: {
      label: t('document.doc.advancedSearch.bookNumber'),
      col: 6,
      type: Number,
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
    docDateFrom: {
      label: 'Ngày ban hành (Từ ngày)',
      type: String,
      col: 6,
      isDatePicker: true,
    },
    docDateTo: {
      label: 'Ngày ban hành (Đến ngày)',
      type: String,
      col: 6,
      isDatePicker: true,
    },
    publisherId: {
      label: 'Đơn vị ban hành (bên ngoài)',
      col: 6,
      component: markRaw(Dropdown),
      props: {
        'option-label': 'orgOutName',
        'option-value': 'id',
        'options': orgOuts,
        showClear: true,
        filter: true
      },
    },
    publisherNameIn: {
      label: 'Đơn vị ban hành nội bộ',
      col: 6,
      component: markRaw(AutoCompleteEmptyTemplate),
      props: {
        suggestions: suggestPublishers,
        completeOnFocus: true,
        autoOptionFocus: true,
        delay: 500,
        optionLabel: 'publisherName',
        pt: { input: 'w-full', },
      },
      listener: autoCompleteListeners('publisherName'),
    },
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
    // bookId: {
    //   label: t('document.doc.advancedSearch.book'),
    //   type: String,
    //   col: 3,
    //   optionsDropdown: books,
    // },
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
        pt: { input: 'w-full', }
      },
      listener: autoCompleteListeners('signerName'),
    },

    areaId: {
      label: t('document.doc.advancedSearch.area'),
      type: String,
      col: 6,
      optionsDropdown: fields,
      isMultiSelect: true,
    },
    deadlineDateFrom: {
      label: t('document.doc.advancedSearch.deadlineDateFrom'),
      type: String,
      col: 6,
      isDatePicker: true,
    },
    deadlineDateTo: {
      label: t('document.doc.advancedSearch.deadlineDateTo'),
      type: String,
      col: 6,
      isDatePicker: true,
    },
    transferDateFrom: {
      label: t('document.doc.advancedSearch.transferDateFrom'),
      type: String,
      col: 6,
      isDatePicker: true,
    },
    transferDateTo: {
      label: t('document.doc.advancedSearch.transferDateTo'),
      type: String,
      col: 6,
      isDatePicker: true,
    },
    publisherType: {
      label: t('document.doc.advancedSearch.receiveMethod'),
      col: 6,
      component: markRaw(Dropdown),
      props: {
        showClear: true,
        options: METHOD_RECIEVES,
        optionLabel: 'label',
        optionValue: 'value',
      },
    },
    handler: {
      label: t('document.doc.advancedSearch.handler'),
      col: 6,
    },
    readStatus: {
      label: t('document.doc.advancedSearch.readStatus'),
      col: 6,
      component: markRaw(Dropdown),
      props: {
        showClear: true,
        options: READ_STATUSES,
        optionLabel: 'label',
        optionValue: 'value',
      },
    },
    docSource: {
      label: t('document.doc.advancedSearch.docSource'),
      col: 6,
      component: markRaw(Dropdown),
      props: {
        showClear: true,
        options: DOC_SOURCES,
        optionLabel: 'label',
        optionValue: 'value',
      },
    },
    isRequireAnswer: {
      label: t('document.doc.advancedSearch.docFeedback'),
      type: String,
      col: 6,
      isCheckbox: true,
    },
    isLawDocument: {
      label: t('document.doc.advancedSearch.lawDocument'),
      type: String,
      col: 6,
      isCheckbox: true,

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
