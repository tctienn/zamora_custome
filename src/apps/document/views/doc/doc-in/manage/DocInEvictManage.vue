<template>
  <DocInManageWrapper
    v-model:selected-document='selectedDocument'
    :doc-ins='docIns'
    doc-status='revokedDocs'
    :loading='loading'
    :menu-actions='documentActions'
    :total='total'>
    <template #list>
      <DocInProcessList
        v-model:selected-document='selectedDocument'
        :doc-ins='docIns'
        :loading='loading'
        :total='total'/>
    </template>
    <template #preview='{ menuActions }'>
      <DocInEvictPreview
        :menu-actions='menuActions'
        :model='selectedDocument'/>
    </template>
  </DocInManageWrapper>
</template>

<script lang="ts" setup>
import { storeToRefs } from 'pinia';
import { computed, inject, onMounted, type PropType, provide, reactive, ref, watch, } from 'vue';
import { useI18n } from 'vue-i18n';

import { revokedDocs } from '@/apps/document/api/graphql/doc-in';
import { modelSearchFieldInKey } from '@/apps/document/helpers/injectionKeys';
import type { DocIn } from '@/apps/document/model/doc/doc-in';
import type { SearchModel } from '@/apps/document/model/doc/search';
import { useDocumentRolesStore } from '@/apps/document/store/document-role';
import { DocumentAction } from '@/apps/document/views/doc/doc-in/action/action';
import DocInProcessList from '@/apps/document/views/doc/doc-in/list/DocInProcessList.vue';
import DocInManageWrapper from '@/apps/document/views/doc/doc-in/manage/DocInManageWrapper.vue';
import DocInEvictPreview from '@/apps/document/views/doc/doc-in/preview/DocInEvictPreview.vue';
import type { Edge } from '@/common/model/page';
import { Direction, type Order, type Pageable } from '@/common/model/query';

const documentActions: DocumentAction[] = [];
const selectedDocument = defineModel('selectedDocument', {
  type: Object as PropType<DocIn | undefined>,
  default: undefined,
});
const { t } = useI18n();
const { userDeptRole } = storeToRefs(useDocumentRolesStore());
const pageable = reactive<Pageable>({
  page: 0,
  size: 10,
});
const search = reactive<SearchModel>({});
const { result, loading, load, refetch } = revokedDocs(
  search,
  userDeptRole.value,
  pageable,
);
const docIns = computed(() =>
  result.value?.revokedDocs.edges.map((edge: Edge<DocIn>) => edge.node),
);
const total = computed(() => result.value?.revokedDocs.totalCount);

function updateSearchField(field: keyof SearchModel, value: any) {
  search[field] = value;
}

function updatePageable(page: number) {
  pageable.page = page;
}

function updateOrder(orders: Order[]) {
  pageable.sort = orders;
}

provide(modelSearchFieldInKey, search);
provide('updateSearchField', updateSearchField);
provide('updatePageable', updatePageable);
provide('updateOrder', updateOrder);
provide('isFlowFinish', true);
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
watch(total, (total) => {
  if (total !== undefined && total !== null) {
    updateCount('DocumentDocInEvictManage', total);
  }
}, { immediate: true });
onMounted(() => {
  load();
});
const hideButtons = ref<string[]>(['ALL']);
provide('hideButtonsName', hideButtons);
provide('defaultFilterTab', 0);
</script>

<style scoped></style>
