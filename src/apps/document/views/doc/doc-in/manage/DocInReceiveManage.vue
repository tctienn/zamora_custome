<template>
  <div>
    <DocInManageWrapper
      v-model:selected-document='selectedDocument'
      :doc-ins='docIns'
      doc-status='waitingDocs'
      :loading='loading'
      :menu-actions='documentActions'
      :total='total'>
      <template #list>
        <DocInClerkList
          v-model:selected-document='selectedDocument'
          :doc-ins='docIns'
          :loading='loading'
          :total='total'/>
      </template>
    </DocInManageWrapper>

    <DocumentInDetail
      v-if='visibleDetail'
      :id='selectedDocument?.id'
      :visible='visibleDetail'
      @hide-sidebar='visibleDetail = false'/>
  </div>
</template>

<script lang='ts' setup>
import { storeToRefs } from 'pinia';
import { computed, inject, onMounted, onUnmounted, type PropType, provide, reactive, type Ref, ref, toRef, watch } from 'vue';
import type { Router } from 'vue-router';

import { waitingDocs } from '@/apps/document/api/graphql/doc-in';
import { readProcess } from '@/apps/document/api/graphql/incoming-doc';
import { modelSearchFieldInKey } from '@/apps/document/helpers/injectionKeys';
import type { DocIn } from '@/apps/document/model/doc/doc-in';
import type { SearchModel } from '@/apps/document/model/doc/search';
import type { InComingProcess } from '@/apps/document/model/process/incoming';
import { useDocumentRolesStore } from '@/apps/document/store/document-role';
import { DocumentAction } from '@/apps/document/views/doc/doc-in/action/action';
import DocumentInDetail from '@/apps/document/views/doc/doc-in/detail/DocumentInDetail.vue';
import DocInClerkList from '@/apps/document/views/doc/doc-in/list/DocInClerkList.vue';
import DocInManageWrapper from '@/apps/document/views/doc/doc-in/manage/DocInManageWrapper.vue';
import EventBus from '@/common/helpers/event-bus';
import type { Edge } from '@/common/model/page';
import { Direction, type Order, type Pageable } from '@/common/model/query';

const selectedDocument = defineModel('selectedDocument', {
  type: Object as PropType<DocIn | undefined>,
  default: undefined,
});
const visibleDetail = ref(false);
const documentActions = [
  DocumentAction.PUT_INTO_BOOK,
  DocumentAction.COPY,
  DocumentAction.PROCLAIM,
  DocumentAction.ASK_FOR_OPINION,
  DocumentAction.CREATE_DRAFT,
];

const pageable = reactive<Pageable>({
  page: 0,
  size: 10,
});
const { userDeptRole } = storeToRefs(useDocumentRolesStore());

// Inject wrapper reactive data for action buttons communication
const wrapperSearch = inject('wrapperSearch', ref<SearchModel>({})) as Ref<SearchModel>;

// Initialize local search from wrapperSearch
const search = reactive<SearchModel>({ ...wrapperSearch.value });

const {
  result: resultDocIns,
  loading,
  load,
  refetch,
} = waitingDocs(search, userDeptRole.value, pageable);
const docIns = computed(() =>
  resultDocIns.value?.waitingDocs.edges.map((edge: Edge<DocIn>) => edge.node),
);
const total = computed(() => resultDocIns.value?.waitingDocs.totalCount);

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
  visibleDetail.value = true;
  // router.push({
  //   name: 'DocumentDocInReceiveDetail',
  //   params: { id: docIn?.id },
  // });
}

function isReadDoc(docIn: DocIn | undefined) {
  return docIn?.process?.isRead;
}

function readDoc(docIn: DocIn) {
  if (docIn.process?.id) {
    readProcess()
      .mutate({ processId: docIn.process.id })
      .then((res) => {
        if (res?.data?.readProcess) {
          // Update the docIns reactively by refetching
          refetch();
        }
      });
  }
}

provide(modelSearchFieldInKey, search);
provide('updateSearchField', updateSearchField);
provide('updatePageable', updatePageable);
provide('updateOrder', updateOrder);
provide('goToDetailRoute', goToDetailRoute);
provide('isReadDoc', isReadDoc);
provide('readDoc', readDoc);
provide('afterAction', () => refetch());
provide('isClerkReceive', toRef(true));
provide<Order[]>('sortFields', [
  {
    property: 'incomingDate',
    direction: Direction.DESC,
  },
  {
    property: 'createdTime',
    direction: Direction.ASC,
  },
]);
const updateCount = inject(
  'updateCount',
  (name: string, count: number) => void {},
);

// Inject wrapper reactive data for action buttons communication
const wrapperSelectedDocument = inject('wrapperSelectedDocument', ref<DocIn | undefined>()) as Ref<DocIn | undefined>;
const wrapperMenuActions = inject('wrapperMenuActions', ref<DocumentAction[]>([])) as Ref<DocumentAction[]>;
const wrapperShowActionButtons = inject('wrapperShowActionButtons', ref(false)) as Ref<boolean>;
const wrapperDocStatus = inject('wrapperDocStatus', ref('')) as Ref<string>;

// Sync local data with wrapper
watch(selectedDocument, (newDoc) => {
  wrapperSelectedDocument.value = newDoc;
}, { immediate: true });

watch(() => documentActions, (actions) => {
  wrapperMenuActions.value = actions;
}, { immediate: true });

// Sync local search to wrapper
watch(() => search, (searchData) => {
  wrapperSearch.value = searchData;
}, {
  deep: true,
  immediate: true 
});

// Sync wrapper search to local search
watch(wrapperSearch, (wrapperSearchData) => {
  Object.assign(search, wrapperSearchData);
}, {
  deep: true,
  immediate: true 
});

// Enable action buttons for this component
wrapperShowActionButtons.value = true;
wrapperDocStatus.value = 'waitingDocs';

provide('defaultFilterTab', 0);
watch(total, (total) => {
  if (total !== undefined && total !== null) {
    updateCount('DocumentDocInReceiveManage', total);
  }
}, { immediate: true });

onMounted(() => {
  load();
  EventBus.on('reload-doc-in', reloadListDoc);
});

function reloadListDoc() {
  refetch();
}

onUnmounted(() => {
  EventBus.off('reload-doc-in', reloadListDoc);
});
</script>

<style scoped></style>
