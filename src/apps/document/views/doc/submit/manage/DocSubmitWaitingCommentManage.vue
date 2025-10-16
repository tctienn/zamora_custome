<template>
  <DocSubmitManageWrapper
    v-model:selected-document='selectedDocument'
    :doc-submits='docSubmits'
    :loading='loading'
    :total='total'>
    <template #list>
      <DocSubmitCommentList
        v-model:selected-document='selectedDocument'
        :doc-submits='docSubmits'
        :loading='loading'
        :total='total'/>
    </template>
  </DocSubmitManageWrapper>
</template>

<script lang='ts' setup>

import { storeToRefs } from 'pinia';
import { computed, inject, onMounted, type PropType, provide, reactive, watch } from 'vue';
import type { Router } from 'vue-router';

import { docSubmitWaitingComment } from '@/apps/document/api/graphql/doc-submit';
import type { DocSubmit } from '@/apps/document/model/doc/doc-submit-input';
import type { DocSubmitSearch } from '@/apps/document/model/doc/search';
import { useDocumentRolesStore } from '@/apps/document/store/document-role';
import DocSubmitCommentList from '@/apps/document/views/doc/submit/list/DocSubmitCommentList.vue';
import DocSubmitManageWrapper from '@/apps/document/views/doc/submit/manage/DocSubmitManageWrapper.vue';
import type { Edge } from '@/common/model/page';
import { Direction, type Order, type Pageable } from '@/common/model/query';

const selectedDocument = defineModel('selectedDocument', {
  type: Object as PropType<DocSubmit | undefined>,
  default: undefined
});
const pageable = reactive<Pageable>({
  page: 0,
  size: 10,
});
const { userDeptRole } = storeToRefs(useDocumentRolesStore());
const search = reactive<DocSubmitSearch>({});
const {
  result,
  load,
  refetch,
  loading
} = docSubmitWaitingComment(search, userDeptRole.value, pageable);

const docSubmits = computed(() => result.value?.docSubmitWaitingComment?.edges.map((edge: Edge<DocSubmit>) => edge.node));
const total = computed(() => result.value?.docSubmitWaitingComment?.totalCount);

function updateSearchField(field: keyof DocSubmitSearch, value: any) {
  search[field] = value;
}

function updatePageable(page: number) {
  pageable.page = page;
}

function updateOrder(orders: Order[]) {
  pageable.sort = orders;
}

provide('updateSearchField', updateSearchField);
provide('updatePageable', updatePageable);
provide('updateOrder', updateOrder);
provide('goToDetailRoute', goToDetailRoute);
provide('afterAction', () => refetch());
provide<Order[]>('sortFields', [
  {
    property: 'sendTime',
    direction: Direction.DESC,
  },
]);
provide('defaultFilterTab', 0);

const updateCount = inject(
  'updateCount',
  (name: string, count: number) => void {},
);

function goToDetailRoute(router: Router, docSubmit: DocSubmit) {
  router.push({
    name: 'DocumentSubmitWaitingCommentDetail',
    params: { id: docSubmit.id }
  });
}

watch(total, (total) => {
  updateCount('DocumentSubmitWaitingCommentManage', total);
});
onMounted(() => {
  load();
});
</script>

<style scoped>

</style>