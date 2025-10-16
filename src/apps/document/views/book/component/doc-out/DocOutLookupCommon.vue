<template>
  <DocOutManageWrapper
    v-model:selected-document='selectedDocument'
    :doc-outs='docOuts'
    :fields='searchFields'
    :loading='loading'
    :menu-actions='documentActions'
    :total='total'>
    <template #list>
      <DocOutProcessList
        v-model:selected-document='selectedDocument'
        :doc-outs='docOuts'
        :loading='loading'
        :total='total'/>
    </template>
  </DocOutManageWrapper>

  <Dialog
    v-model:visible='visibleDialog'
    :header='"Chọn người/phòng ban"'
    v-bind='DEFAULT_DIALOG_CONFIG'
    @click.stop>
    <UserSelectMoreDetail
      v-model='selectedUser'
      class='w-full'
      display-mode='tree'
      :org-type='userDeptRole.type'
      :remove-empty-dep='false'
      selection-mode='multiple'
      style='height: 70vh'
      :users='allUsers'/>
    <template #footer>
      <div class='flex flex-row gap-2 justify-content-center py-1'>
        <Button
          icon='pi pi-times'
          :label="t('common.close')"
          severity='danger'
          @click='visibleDialog = false'/>
        <Button
          icon='pi pi-check'
          :label="t('common.save')"
          @click='saveOptionsReceiveInIds'/>
      </div>
    </template>
  </Dialog>
</template>

<script lang='ts' setup>
import { storeToRefs } from 'pinia';
import type { AutoCompleteCompleteEvent, AutoCompleteItemSelectEvent } from 'primevue/autocomplete';
import Calendar from 'primevue/calendar';
import Dropdown from 'primevue/dropdown';
import MultiSelect from 'primevue/multiselect';
import { computed, inject, markRaw, onMounted, type PropType, provide, reactive, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import type { Router } from 'vue-router';

import { useUserMoreInfoStore } from '@/apps/admin/store/usersMoreInfo';
import { getAllBook } from '@/apps/document/api/graphql/book';
import { searchAllDocOut } from '@/apps/document/api/graphql/doc-out';
import { getAllDocType } from '@/apps/document/api/graphql/doc-type';
import { getAllField } from '@/apps/document/api/graphql/field';
import { getOrgOut } from '@/apps/document/api/graphql/org-out';
import {
  getListDocOutDocCodeByKeyWord,
  getListDocOutPublisherByKeyWord,
  getListDocOutQuoteByKeyWord,
  getListDocOutSignerByKeyWord
} from '@/apps/document/api/graphql/searchAdvanced';
import { isDate } from '@/apps/document/helpers/composable/utils';
import type { BookInterface } from '@/apps/document/model/book';
import {
  type DocIn,
  PRIORITIES,
  PROCESS_OUT_STATUSES,
  READ_STATUSES,
  type UserDeptRoleInput
} from '@/apps/document/model/doc/doc-in';
import type { DocOut } from '@/apps/document/model/doc/doc-out';
import { type DocOutSearch } from '@/apps/document/model/doc/search';
import type { OrgOutInterface } from '@/apps/document/model/orgOut';
import { useDocumentRolesStore } from '@/apps/document/store/document-role';
import TemplateChips from '@/apps/document/views/book/component/TemplateChips.vue';
import { DocumentAction } from '@/apps/document/views/doc/doc-in/action/action';
import DocOutProcessList from '@/apps/document/views/doc/doc-out/list/DocOutProcessList.vue';
import DocOutManageWrapper from '@/apps/document/views/doc/doc-out/manage/DocOutManageWrapper.vue';
import OrganizationTree from '@/apps/work-flow/views/components/OrganizationTree/OrganizationTree.vue';
import UserSelectMoreDetail from '@/apps/work-flow/views/components/UserSelectMoreDetail/UserSelectMoreDetail.vue';
import AutoCompleteEmptyTemplate from '@/common/components/app/search/AutoCompleteEmptyTemplate.vue';
import { DateTimeFormat, DEFAULT_DIALOG_CONFIG } from '@/common/constants';
import useMoment from '@/common/helpers/mixins/use-moment';
import type { Edge } from '@/common/model/page';
import { Direction, type Order, type Pageable } from '@/common/model/query';
import type { SearchFields } from '@/common/model/search';
import { useGlobalSearchStore } from '@/common/store/search';

const { t } = useI18n();

const documentActions = [
  DocumentAction.COPY,
  DocumentAction.PROCLAIM,
  DocumentAction.ASK_FOR_OPINION,
  DocumentAction.CREATE_DRAFT,
];
const selectedDocument = defineModel('selectedDocument', {
  type: Object as PropType<DocOut | undefined>,
  default: undefined,
});
const pageable = reactive<Pageable>({
  page: 0,
  size: 10,
});
const { moment } = useMoment();

const search = reactive<DocOutSearch>({});
const { userDeptRole } = storeToRefs(useDocumentRolesStore());
const { allUsers } = storeToRefs(useUserMoreInfoStore());
const { fetchAllUsers } = useUserMoreInfoStore();
const {
  result: resultDocIns,
  loading,
  load,
  refetch,
} = searchAllDocOut(search, userDeptRole.value, pageable);
const total = computed((): number => resultDocIns.value?.searchAllDocOut.totalCount || 0);
const updateCount = inject('updateCount', (countField: string, count: number) => void {});
watch(total, (value) => {
  updateCount('countDocOut', value);
});
const docOuts = computed(() =>
  resultDocIns.value?.searchAllDocOut.edges.map((edge: Edge<DocOut>) => edge.node),
);

function updateSearchField(field: keyof DocOutSearch, value: any) {
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
    name: 'DocOutLookupProcess',
    params: { processId: docIn.process?.id }
  });
}

provide('updateSearchField', updateSearchField);
provide('updatePageable', updatePageable);
provide('updateOrder', updateOrder);
provide('goToDetailRoute', goToDetailRoute);
provide('afterAction', () => refetch());
provide('isFlowFinish', true);
provide<Order[]>('sortFields', [
  {
    property: 'sendTime',
    direction: Direction.DESC,
  },
]);
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

function mapModel(model: DocOutSearch) {
  const keys = Object.keys(model);
  if (keys.length === 0) {
    Object.keys(search).forEach(key => {
      if (!['searchTimeFrom', 'searchTimeTo'].includes(key)) {
        delete search[key as keyof DocOutSearch];
      }
    });
  }
  for (const key in model) {
    if (Object.prototype.hasOwnProperty.call(model, key)) {
      const value = model[key as keyof DocOutSearch];
      updateSearchField(
          key as keyof DocOutSearch,
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
} = getListDocOutSignerByKeyWord(model.value.signerName, pageSigner);
onResultSigner((res) => {
  if (res) {
    suggestSigners.value = res.data?.getListDocOutSignerByKeyWord
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
} = getListDocOutPublisherByKeyWord(model.value.publisherName, pagePublisher);
onResultPublisher((res) => {
  if (res) {
    suggestPublishers.value = res.data?.getListDocOutPublisherByKeyWord
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
} = getListDocOutDocCodeByKeyWord(model.value.publisherName, pageDocCode);
onResultDocCode((res) => {
  if (res) {
    suggestDocCodes.value = res.data?.getListDocOutDocCodeByKeyWord
      ?.edges.map((e: Edge<DocCode>) => e.node);
  }
});

const suggestQuotes = ref<Quote[]>([]);
const pageQuote = reactive<Pageable>({
  page: 0,
  size: 99999999
});
const {
  load: loadQuote,
  refetch: refetchQuote,
  onResult: onResultQuote,
} = getListDocOutQuoteByKeyWord(model.value.publisherName, pageQuote);
onResultQuote((res) => {
  if (res) {
    suggestQuotes.value = res.data?.getListDocOutQuoteByKeyWord
      ?.edges.map((e: Edge<Quote>) => e.node);
  }
});

const orgOuts = ref<OrgOutInterface[]>([] as OrgOutInterface[]);
const { onResult: getOrgResult } = getOrgOut();
getOrgResult((res) => {
  orgOuts.value = res.data.getOrgOut;
});

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
});
const visibleDialog = ref(false);
const selectedUser = ref<(UserDeptRoleInput & { id: string; })[]>([]);
const searchFields = ref<SearchFields>({
  status: {
    label: t('document.doc.advancedSearch.status'),
    col: 6,
    component: markRaw(Dropdown),
    props: {
      pt: { input: 'font-semibold' },
      showClear: true,
      options: PROCESS_OUT_STATUSES,
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
      completeOnFocus: true,
      autoOptionFocus: true,
      optionLabel: 'quote',
      delay: 500,
      pt: { input: 'w-full', }
    },
    listener: autoCompleteListeners('quote'),
  },
  issuerDeptId: {
    label: 'Đơn vị ban hành',
    col: 6,
    component: markRaw(OrganizationTree),
    props: {
      'org-type': userDeptRole.value.type,
      'selection-mode': 'single',
      filter: true
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
  createDateFrom: {
    label: t('Ngày tạo (Từ ngày)'),
    col: 6,
    component: markRaw(Calendar),
    props: calendarProps,
  },
  createDateTo: {
    label: t('Ngày tạo (Đến ngày)'),
    col: 6,
    component: markRaw(Calendar),
    props: calendarProps,
  },
  receiveInIds: {
    label: t('Nơi nhận bên trong'),
    col: 6,
    component: markRaw(TemplateChips),
    props: {
      optionLabel: (data: any) => data.userName || data.deptName,
      optionValue: (data: any) => data.userId || data.deptId,
      options: selectedUser
    },
    listener: { click: () => visibleDialog.value = true }
  },
  receiveOutIds: {
    label: t('Nơi nhận bên ngoài'),
    col: 6,
    component: markRaw(MultiSelect),
    props: {
      'option-label': 'orgOutName',
      'option-value': 'id',
      'options': orgOuts,
      showClear: true,
      filterMatchMode: 'contains',
      filter: true
    },
  },

  handler: {
    label: t('document.doc.advancedSearch.handler'),
    type: String,
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

});
onMounted(() => {
  load();
  fetchAllUsers();
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

function saveOptionsReceiveInIds() {
  visibleDialog.value = false;
}

</script>

<style scoped></style>
