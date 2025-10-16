<template>
  <DocOutManageWrapper
    v-model:selected-document='selectedDocument'
    :doc-outs='docOuts'
    :fields='fieldsSearch'
    :loading='docOutsLoading'
    :menu-actions='menuActions'
    :search='search'
    :total='docTotal'>
    <template #list>
      <DocOutProclaimedList
        v-model:selected-document='selectedDocument'
        :doc-outs='docOuts'
        :loading='docOutsLoading'
        :total='docTotal'/>
    </template>
  </DocOutManageWrapper>
</template>

<script lang="ts" setup>
import { storeToRefs } from 'pinia';
import { computed, inject, onMounted, type PropType, provide, reactive, ref, watch, } from 'vue';
import { useI18n } from 'vue-i18n';
import type { Router } from 'vue-router';

import { getAllBook } from '@/apps/document/api/graphql/book';
import { docOutIssued, docOutIssuedInDept, } from '@/apps/document/api/graphql/doc-out';
import { getAllDocType } from '@/apps/document/api/graphql/doc-type';
import type { BookInterface } from '@/apps/document/model/book';
import type { DocOut } from '@/apps/document/model/doc/doc-out';
import type { DocOutSearch } from '@/apps/document/model/doc/search';
import { useDocumentRolesStore } from '@/apps/document/store/document-role';
import { DocumentAction } from '@/apps/document/views/doc/doc-in/action/action';
import DocOutProclaimedList from '@/apps/document/views/doc/doc-out/list/DocOutProclaimedList.vue';
import DocOutManageWrapper from '@/apps/document/views/doc/doc-out/manage/DocOutManageWrapper.vue';
import type { Edge } from '@/common/model/page';
import { Direction, type Order, type Pageable } from '@/common/model/query';

const selectedDocument = defineModel('selectedDocument', {
  type: Object as PropType<DocOut | undefined>,
  default: undefined,
});
const menuActions: DocumentAction[] = [DocumentAction.CANCEL_PROMULGATE, DocumentAction.REVOKE_PROMULGATE];
const pageable = reactive<Pageable>({
  page: 0,
  size: 10,
});
const { userDeptRole } = storeToRefs(useDocumentRolesStore());
const search = reactive<DocOutSearch>({});
const { load, result, loading, refetch } = docOutIssued(
  search,
  userDeptRole.value,
  pageable,
);
const myProclaimed = computed(() =>
  result.value?.docOutIssued.edges.map((edge: Edge<DocOut>) => edge.node),
);
const total = computed(() => result.value?.docOutIssued.totalCount);

const {
  result: allResult,
  load: loadAll,
  loading: allLoading,
  refetch: refetchAll,
} = docOutIssuedInDept(search, userDeptRole.value, pageable);
const allProclaimed = computed(() =>
  allResult.value?.docOutIssuedInDept.edges.map(
    (edge: Edge<DocOut>) => edge.node,
  ),
);
const allTotal = computed(() => allResult.value?.docOutIssuedInDept.totalCount);

const currentProclaimedTab = ref(0);
const docOuts = computed(() =>
  currentProclaimedTab.value === 0 ? myProclaimed.value : allProclaimed.value,
);
const docTotal = computed(() =>
  currentProclaimedTab.value === 0 ? total.value : allTotal.value,
);
const docOutsLoading = computed(() =>
  currentProclaimedTab.value === 0 ? loading.value : allLoading.value,
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

function goToDetailRoute(router: Router, docOut: DocOut) {
  router.push({
    name: 'DocumentDocOutProclaimedDetail',
    params: { id: docOut?.id },
  });
}

provide('updateSearchField', updateSearchField);
provide('updatePageable', updatePageable);
provide('updateOrder', updateOrder);
provide('goToDetailRoute', goToDetailRoute);
provide('isFlowFinish', true);
provide('reloadDoc', reloadDoc);
provide<Order[]>('sortFields', [
  {
    property: 'docDate',
    direction: Direction.DESC,
  },
]);

function reloadDoc() {
  currentProclaimedTab.value === 0 ? refetch() : refetchAll();
}

provide('afterAction', reloadDoc);

provide('myProclaimedCount', total);
provide('allProclaimedCount', allTotal);
provide('changeProclaimedTab', (tab: number) => {
  updatePageable(0);
  currentProclaimedTab.value = tab;
});

const updateCount = inject(
  'updateCount',
  (name: string, count: number) => void {},
);
watch(total, (total) => {
  updateCount('DocumentDocOutProclaimedManage', total);
});
onMounted(() => {
  load();
  loadAll();
});
const { t } = useI18n();
const docTypes = ref([]);
const { onResult: getDocTypeResult } = getAllDocType();
getDocTypeResult((res) => {
  docTypes.value = res.data.getAllDocType;
});
const { onResult: getBookResult } = getAllBook();
getBookResult((res) => {
  books.value = res.data.getAllBook.map((item: BookInterface) => ({
    name: item.bookName,
    id: item.id,
  }));
});
const books = ref([]);
const fieldsSearch = ref({
  quote: {
    label: t('document.doc.advancedSearch.quote'),
    type: String,
    col: 6,
  },
  docCode: {
    label: t('document.doc.advancedSearch.docCode'),
    type: String,
    col: 6,
  },
  priorityCode: {
    label: t('document.doc.advancedSearch.priorityCode'),
    type: String,
    col: 6,
    optionsDropdown: [],
  },
  bookId: {
    label: t('document.doc.advancedSearch.book'),
    type: String,
    col: 6,
    optionsDropdown: books,
  },
  docTypeId: {
    label: t('document.doc.advancedSearch.docType'),
    type: String,
    col: 6,
    optionsDropdown: docTypes,
    isMultiSelect: true,
  },
  docDateFrom: {
    label: t('document.doc.advancedSearch.docDateFrom'),
    type: String,
    col: 6,
    isDatePicker: true,
  },
  docDateTo: {
    label: t('document.doc.advancedSearch.docDateTo'),
    type: String,
    col: 6,
    isDatePicker: true,
  },
  insideReceivingPlace: {
    label: t('Nơi nhận bên trong'),
    type: String,
    col: 6,
  },
  store: {
    label: t('Trạng thái lưu trữ'),
    type: String,
    col: 6,
    optionsDropdown: [],
  },
  externalRecipient: {
    label: t('Nơi nhận bên ngoài'),
    type: String,
    col: 6,
  },
  signerId: {
    label: t('Cán bộ xử lý'),
    type: String,
    col: 6,
  },
});
</script>

<style scoped></style>
