<template>
  <div class='font-bold mb-2 text-primary text-xl'>
    Quản trị văn bản
  </div>
  <DocInManageWrapper
    v-model:selected-document='selectedDocument'
    :doc-ins='docIns'
    :loading='loading'
    :menu-actions='documentActions'
    :total='total'>
    <template #docInActionButtons>
      <div></div>
    </template>
    <template #list>
      <DocInAdminList
        v-model:selected-document='selectedDocument'
        :doc-ins='docIns'
        :loading='loading'
        :total='total'/>
    </template>
    <template #preview='{menuActions,selectedDocument:selected}'>
      <AdminDocInPreview
        :menu-actions='menuActions'
        :model='selected'>
      </AdminDocInPreview>
    </template>
  </DocInManageWrapper>
</template>

<script setup lang="ts">

import { computed, provide, reactive, ref } from 'vue';
import type { Router } from 'vue-router';

import { adminSearchAllDocIn } from '@/apps/document/api/graphql/admin-action';
import { modelSearchFieldInKey } from '@/apps/document/helpers/injectionKeys';
import type { DocIn } from '@/apps/document/model/doc/doc-in';
import type { SearchModel } from '@/apps/document/model/doc/search';
import AdminDocInPreview from '@/apps/document/views/doc/admin-action/AdminDocInPreview.vue';
import DocInAdminList from '@/apps/document/views/doc/admin-action/DocInAdminList.vue';
import type { DocumentAction } from '@/apps/document/views/doc/doc-in/action/action';
import DocInManageWrapper from '@/apps/document/views/doc/doc-in/manage/DocInManageWrapper.vue';
import type { Edge } from '@/common/model/page';
import { Direction, type Order, type Pageable } from '@/common/model/query';

const selectedDocument = ref<DocIn>();
const loading = ref<boolean>(false);
const pageable = reactive<Pageable>({
  page: 0,
  size: 10,
});
const search = reactive<SearchModel>({});
const documentActions = ref<DocumentAction[]>([]);

const { load, result: resultDocIns } = adminSearchAllDocIn(search, pageable);
const docIns = computed<DocIn[]>(() =>
  resultDocIns.value?.adminSearchAllDocIn.edges.map((edge: Edge<DocIn>) => edge.node),
);
const total = computed(() => resultDocIns.value?.adminSearchAllDocIn.totalCount);

load();

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
    name: 'DocumentAdminDocInDetail',
    params: { id: docIn?.id },
  });
}

function goToEditRoute(router: Router, docIn: DocIn) {
  router.push({
    name: 'DocumentAdminDocInUpdate',
    params: { id: docIn?.id },
  });
}

provide(modelSearchFieldInKey, search);
provide('updateSearchField', updateSearchField);
provide('updatePageable', updatePageable);
provide('updateOrder', updateOrder);
provide('goToDetailRoute', goToDetailRoute);
provide('goToEditRoute', goToEditRoute);

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
</script>

<style scoped>

</style>