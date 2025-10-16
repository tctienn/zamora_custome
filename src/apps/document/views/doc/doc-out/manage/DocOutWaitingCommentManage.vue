<template>
  <DocOutManageWrapper
    v-model:selected-document='selectedDocument'
    :doc-outs='docOuts'
    :loading='loading'
    :menu-actions='menuActions'
    :search='search'
    :total='total'>
    <template #list>
      <DocOutCommentList
        v-model:selected-document='selectedDocument'
        :doc-outs='docOuts'
        :loading='loading'
        :total='total'/>
    </template>
  </DocOutManageWrapper>
</template>

<script lang='ts' setup>
import { storeToRefs } from 'pinia';
import { computed, inject, onMounted, type PropType, provide, reactive, ref, watch } from 'vue';
import type { Router } from 'vue-router';

import { docOutWaitingComments } from '@/apps/document/api/graphql/doc-out';
import type { DocOut } from '@/apps/document/model/doc/doc-out';
import type { DocOutSearch } from '@/apps/document/model/doc/search';
import { useDocumentRolesStore } from '@/apps/document/store/document-role';
import { DocumentAction } from '@/apps/document/views/doc/doc-in/action/action';
import DocOutCommentList from '@/apps/document/views/doc/doc-out/list/DocOutCommentList.vue';
import DocOutManageWrapper from '@/apps/document/views/doc/doc-out/manage/DocOutManageWrapper.vue';
import type { Edge } from '@/common/model/page';
import { Direction, type Order, type Pageable } from '@/common/model/query';

const selectedDocument = defineModel('selectedDocument', {
  type: Object as PropType<DocOut | undefined>,
  default: undefined
});
const menuActions: DocumentAction[] = [
  DocumentAction.CREATE_PROFILE,
];
const pageable = reactive<Pageable>({
  page: 0,
  size: 10,
});
const { userDeptRole } = storeToRefs(useDocumentRolesStore());
const search = reactive<DocOutSearch>({});
const {
  load,
  result,
  loading,
  refetch
} = docOutWaitingComments(search, userDeptRole.value, pageable);
const docOuts = computed(() => result.value?.docOutWaitingComments.edges.map((edge: Edge<DocOut>) => edge.node));
const total = computed(() => result.value?.docOutWaitingComments.totalCount);

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
    name: 'DocumentDocOutWaitingCommentDetail',
    params: { id: docOut?.id }
  });
}

function isReadDoc(docOut: DocOut | undefined) {
  return docOut?.comment?.isRead;
}

provide('updateSearchField', updateSearchField);
provide('updatePageable', updatePageable);
provide('updateOrder', updateOrder);
provide('goToDetailRoute', goToDetailRoute);
provide('isReadDoc', isReadDoc);
provide('afterAction', () => refetch());
provide('reloadDoc', refetch);
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
const updateCount = inject(
  'updateCount',
  (name: string, count: number) => void {},
);
provide('defaultFilterTab', 0);
watch(total, (total) => {
  if (total !== undefined && total !== null) {
    updateCount('DocumentDocOutWaitingCommentManage', total);
  }
}, { immediate: true });
onMounted(() => {
  load();
});
const hideButtons = ref<string[]>(['ALL']);
provide('hideButtonsName', hideButtons);
</script>

<style scoped>

</style>