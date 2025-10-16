<template>
  <div>
    <DocInManageWrapper
      v-model:selected-document='selectedDocument'
      :doc-ins='docIns'
      doc-status='processedDocs'
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
import { computed, inject, onMounted, type PropType, provide, reactive, ref, watch, } from 'vue';
import type { Router } from 'vue-router';

import { processedDocs } from '@/apps/document/api/graphql/doc-in';
import { modelSearchFieldInKey } from '@/apps/document/helpers/injectionKeys';
import type { DocIn } from '@/apps/document/model/doc/doc-in';
import type { SearchModel } from '@/apps/document/model/doc/search';
import { useDocumentRolesStore } from '@/apps/document/store/document-role';
import { DocumentAction } from '@/apps/document/views/doc/doc-in/action/action';
import DocumentInDetail from '@/apps/document/views/doc/doc-in/detail/DocumentInDetail.vue';
import DocInClerkList from '@/apps/document/views/doc/doc-in/list/DocInClerkList.vue';
import DocInManageWrapper from '@/apps/document/views/doc/doc-in/manage/DocInManageWrapper.vue';
import type { Edge } from '@/common/model/page';
import type { Order, Pageable } from '@/common/model/query';

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
const search = reactive<SearchModel>({});
const visibleDetail = ref(false);
const { userDeptRole } = storeToRefs(useDocumentRolesStore());
const {
  result: resultDocIns,
  loading,
  load,
  refetch,
} = processedDocs(search, userDeptRole.value, pageable);

const docIns = computed(() =>
  resultDocIns.value?.processedDocs.edges.map((edge: Edge<DocIn>) => edge.node),
);
const total = computed(() => resultDocIns.value?.processedDocs.totalCount);

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
  // router.push({ path: `clerk-processed/detail/${docIn.id}` });
}

provide(modelSearchFieldInKey, search);
provide('updateSearchField', updateSearchField);
provide('updatePageable', updatePageable);
provide('updateOrder', updateOrder);
provide('goToDetailRoute', goToDetailRoute);
provide('afterAction', () => refetch());
provide('isFlowFinish', true);
const updateCount = inject(
  'updateCount',
  (name: string, count: number) => void {},
);
watch(total, (total) => {
  if (total !== undefined && total !== null) {
    updateCount('DocumentDocInClerkProcessedManage', total);
  }
}, { immediate: true });
onMounted(() => {
  load();
});
const hideButtons = ref<string[]>(['ALL']);
provide('hideButtonsName', hideButtons);
</script>

<style scoped></style>
