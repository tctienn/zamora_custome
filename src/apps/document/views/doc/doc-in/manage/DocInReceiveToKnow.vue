<template>
  <div>
    <DocInManageWrapper
      v-model:selected-document='selectedDocument'
      :doc-ins='docIns'
      doc-status='ccDocs'
      :loading='loading'
      :menu-actions='documentActions'
      :total='total'>
      <template #list>
        <DocInReceiveToKnowList
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
import { cloneDeep } from 'lodash';
import { storeToRefs } from 'pinia';
import { computed, inject, onMounted, type PropType, provide, reactive, ref, watch, } from 'vue';
import type { Router } from 'vue-router';

import { ccDocs } from '@/apps/document/api/graphql/doc-in';
import { readCC } from '@/apps/document/api/graphql/incoming-doc';
import { modelSearchFieldInKey } from '@/apps/document/helpers/injectionKeys';
import type { CCInfo } from '@/apps/document/model/ccdoc';
import type { DocIn } from '@/apps/document/model/doc/doc-in';
import type { SearchModel } from '@/apps/document/model/doc/search';
import { useDocumentRolesStore } from '@/apps/document/store/document-role';
import { DocumentAction } from '@/apps/document/views/doc/doc-in/action/action';
import DocumentInDetail from '@/apps/document/views/doc/doc-in/detail/DocumentInDetail.vue';
import DocInReceiveToKnowList from '@/apps/document/views/doc/doc-in/list/DocInReceiveToKnowList.vue';
import DocInManageWrapper from '@/apps/document/views/doc/doc-in/manage/DocInManageWrapper.vue';
import type { Edge } from '@/common/model/page';
import { Direction, type Order, type Pageable } from '@/common/model/query';

const selectedDocument = defineModel('selectedDocument', {
  type: Object as PropType<DocIn | undefined>,
  default: undefined,
});
const visibleDetail = ref(false);
const documentActions = [
  DocumentAction.COPY,
  DocumentAction.CREATE_PROFILE,
  DocumentAction.CREATE_WORK,
  DocumentAction.PROCLAIM,
  DocumentAction.ASK_FOR_OPINION,
  DocumentAction.CREATE_DRAFT,
];
const pageable = reactive<Pageable>({
  page: 0,
  size: 10,
});
const { userDeptRole } = storeToRefs(useDocumentRolesStore());
const search = reactive<SearchModel>({});
const {
  result: resultDocIns,
  loading,
  load,
  refetch,
} = ccDocs(search, userDeptRole.value, pageable);
watch(resultDocIns, (value) => {
  const edges = value?.ccDocs?.edges;
  if (edges) {
    docIns.value = cloneDeep(edges.map((edge: Edge<DocIn>) => edge?.node));
  }
});
const docIns = ref<DocIn[]>([]);
const total = computed(() => resultDocIns.value?.ccDocs.totalCount);

function updateSearchField(field: keyof SearchModel, value: any) {
  search[field] = value;
}

function updatePageable(page: number) {
  pageable.page = page;
}

function updateOrder(orders: Order[]) {
  pageable.sort = orders;
}

function isReadDoc(docIn: DocIn | undefined) {
  return docIn?.cc?.isRead;
}

function readDoc(docIn: DocIn) {
  if (docIn.cc?.id) {
    readCC()
      .mutate({ ccId: docIn.cc?.id })
      .then((res) => {
        if (res?.data?.readCC) {
          docIns.value = docIns.value.map((doc) => {
            if (doc.cc?.id === docIn.cc?.id) {
              doc.cc = {
                ...doc.cc,
                isRead: true,
              } as CCInfo;
            }
            return doc;
          });
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
provide<Order[]>('sortFields', [
  {
    property: 'sendTime',
    direction: Direction.DESC,
  },
  {
    property: 'isRead',
    direction: Direction.ASC,
  },
]);
provide('afterAction', () => refetch());
provide('isFlowFinish', true);

function goToDetailRoute(router: Router, docIn: DocIn) {
  visibleDetail.value = true;
  // router.push({ path: `receive-to-know/detail/${docIn.id}` });
}

const updateCount = inject(
  'updateCount',
  (name: string, count: number) => void {},
);
watch(total, (total) => {
  if (total !== undefined && total !== null) {
    updateCount('DocumentDocInReceiveToKnowManage', total);
  }
}, { immediate: true });

onMounted(() => {
  load();
});
const hideButtons = ref<string[]>(['REVOKE']);
provide('hideButtonsName', hideButtons);
</script>

<style scoped></style>
