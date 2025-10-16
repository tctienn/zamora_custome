<template>
  <DocOutManageWrapper
    v-model:selected-document='selectedDocument'
    :doc-outs='docOuts'
    :loading='loading'
    :search='search'
    :total='total'>
    <template #list>
      <DocOutProcessList
        v-model:selected-document='selectedDocument'
        :doc-outs='docOuts'
        :loading='loading'
        :total='total'/>
    </template>
    <template #preview>
      <DocOutEvictPreview :model='selectedDocument'/>
    </template>
  </DocOutManageWrapper>
</template>

<script lang='ts' setup>
import { storeToRefs } from 'pinia';
import { computed, inject, onMounted, type PropType, provide, reactive, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { docOutRevoked } from '@/apps/document/api/graphql/doc-out';
import type { DocOut } from '@/apps/document/model/doc/doc-out';
import type { DocOutSearch } from '@/apps/document/model/doc/search';
import { useDocumentRolesStore } from '@/apps/document/store/document-role';
import DocOutProcessList from '@/apps/document/views/doc/doc-out/list/DocOutProcessList.vue';
import DocOutManageWrapper from '@/apps/document/views/doc/doc-out/manage/DocOutManageWrapper.vue';
import DocOutEvictPreview from '@/apps/document/views/doc/doc-out/preview/DocOutEvictPreview.vue';
import type { Edge } from '@/common/model/page';
import { Direction, type Order, type Pageable } from '@/common/model/query';

const selectedDocument = defineModel('selectedDocument', {
  type: Object as PropType<DocOut | undefined>,
  default: undefined
});
const { t } = useI18n();
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
} = docOutRevoked(search, userDeptRole.value, pageable);
const docOuts = computed(() => result.value?.docOutRevoked.edges.map((edge: Edge<DocOut>) => edge.node));
const total = computed(() => result.value?.docOutRevoked.totalCount);

function updateSearchField(field: keyof DocOutSearch, value: any) {
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
provide<Order[]>('sortFields', [
  {
    property: 'sendTime',
    direction: Direction.DESC,
  },
]);
const updateCount = inject(
  'updateCount',
  (name: string, count: number) => void {},
);
provide('defaultFilterTab', 0);
watch(total, (total) => {
  updateCount('DocumentDocOutEvictManage', total);
});
onMounted(() => {
  load();
});
const hideButtons = ref<string[]>(['ALL']);
provide('hideButtonsName', hideButtons);
</script>

<style scoped>

</style>