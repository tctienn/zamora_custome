<template>
  <div>
    <DocOutManageWrapper
      v-model:selected-document='selectedDocument'
      :doc-outs='docOuts'
      :loading='loading'
      :menu-actions='menuActions'
      :search='search'
      :total='total'>
      <template #list>
        <DocOutEditorList
          v-model:selected-document='selectedDocument'
          :doc-outs='docOuts'
          :loading='loading'
          :total='total'/>
      </template>
    </DocOutManageWrapper>

    <!-- Doc-Out Detail Sidebar -->
    <DocumentOutDetail
      v-if='visibleDetail'
      :id='selectedDocument?.id'
      :visible='visibleDetail'
      @hide-sidebar='visibleDetail = false'/>
  </div>
</template>

<script lang='ts' setup>

import { storeToRefs } from 'pinia';
import { computed, inject, onMounted, type PropType, provide, reactive, type Ref, ref, toRef, watch } from 'vue';
import type { Router } from 'vue-router';

import { docOutDrafts } from '@/apps/document/api/graphql/doc-out';
import type { DocOut } from '@/apps/document/model/doc/doc-out';
import type { DocOutSearch } from '@/apps/document/model/doc/search';
import { useDocumentRolesStore } from '@/apps/document/store/document-role';
import { DocumentAction } from '@/apps/document/views/doc/doc-in/action/action';
import DocumentOutDetail from '@/apps/document/views/doc/doc-out/detail/DocumentOutDetail.vue';
import DocOutEditorList from '@/apps/document/views/doc/doc-out/list/DocOutEditorList.vue';
import DocOutManageWrapper from '@/apps/document/views/doc/doc-out/manage/DocOutManageWrapper.vue';
import type { Edge } from '@/common/model/page';
import { Direction, type Order, type Pageable } from '@/common/model/query';

const selectedDocument = defineModel('selectedDocument', {
  type: Object as PropType<DocOut | undefined>,
  default: undefined
});
const menuActions: DocumentAction[] = [
  DocumentAction.CREATE_DRAFT,
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
} = docOutDrafts(search, userDeptRole.value, pageable);
const docOuts = computed(() => result.value?.docOutDrafts.edges.map((edge: Edge<DocOut>) => edge.node));
const total = computed(() => result.value?.docOutDrafts.totalCount);

// Sidebar visibility state
const visibleDetail = ref(false);

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
  // Open sidebar instead of navigating to route
  visibleDetail.value = true;
  // Keep the old navigation as comment for reference
  // router.push({
  //   name: 'DocumentDocOutDraftDetail',
  //   params: { id: docOut?.id }
  // });
}

provide('updateSearchField', updateSearchField);
provide('updatePageable', updatePageable);
provide('updateOrder', updateOrder);
provide('goToDetailRoute', goToDetailRoute);
provide('afterAction', () => refetch());
provide('reloadDoc', refetch);
provide('isSpecialistDraft', toRef(true));
provide<Order[]>('sortFields', [
  {
    property: 'createdTime',
    direction: Direction.DESC,
  }
]);
provide('hideButtonsName', ['REJECT']);
provide('defaultFilterTab', 0);

const updateCount = inject(
  'updateCount',
  (name: string, count: number) => void {},
);

watch(total, (total) => {
  if (total !== undefined && total !== null) {
    updateCount('DocumentDocOutDraftManage', total);
  }
}, { immediate: true });
onMounted(() => {
  load();
});
</script>

<style scoped>

</style>