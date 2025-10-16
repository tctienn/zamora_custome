<template>
  <DocSubmitManageWrapper
    v-model:selected-document='selectedDocument'
    :doc-submits='docSubmits'
    :loading='loading'
    :total='total'>
    <template #list>
      <DocSubmitProcessList
        v-model:selected-document='selectedDocument'
        :doc-submits='docSubmits'
        :loading='loading'
        :total='total'/>
    </template>
    <template #preview>
      <DocSubmitEvictPreview :model='selectedDocument'/>
    </template>
  </DocSubmitManageWrapper>
</template>

<script lang='ts' setup>

import { storeToRefs } from 'pinia';
import { computed, inject, onMounted, type PropType, provide, reactive, watch } from 'vue';

import { docSubmitRevoked } from '@/apps/document/api/graphql/doc-submit';
import type { DocSubmit } from '@/apps/document/model/doc/doc-submit-input';
import type { DocSubmitSearch } from '@/apps/document/model/doc/search';
import { useDocumentRolesStore } from '@/apps/document/store/document-role';
import DocSubmitProcessList from '@/apps/document/views/doc/submit/list/DocSubmitProcessList.vue';
import DocSubmitManageWrapper from '@/apps/document/views/doc/submit/manage/DocSubmitManageWrapper.vue';
import DocSubmitEvictPreview from '@/apps/document/views/doc/submit/preview/DocSubmitEvictPreview.vue';
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
  refetch,
  load,
  loading
} = docSubmitRevoked(search, userDeptRole.value, pageable);

const docSubmits = computed(() => result.value?.docSubmitRevoked?.edges.map((edge: Edge<DocSubmit>) => edge.node));
const total = computed(() => result.value?.docSubmitRevoked?.totalCount);

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

watch(total, (total) => {
  updateCount('DocumentSubmitEvictManage', total);
});
onMounted(() => {
  load();
});
</script>

<style scoped>

</style>