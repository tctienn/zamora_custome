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
        <DocInProcessList
          v-model:selected-document='selectedDocument'
          :doc-ins='docIns'
          :loading='loading'
          :total='total'/>
      </template>
    </DocInManageWrapper>

    <DocumentInWithProcessDetail
      v-if='visibleDetail'
      :process-id='processId'
      :visible='visibleDetail'
      @hide-sidebar='visibleDetail = false'/>
  </div>
</template>

<script lang='ts' setup>
import { storeToRefs } from 'pinia';
import type { MenuItem } from 'primevue/menuitem';
import { computed, inject, onMounted, type PropType, provide, reactive, ref, watch, } from 'vue';
import { useI18n } from 'vue-i18n';
import type { Router } from 'vue-router';

import { processedDocs } from '@/apps/document/api/graphql/doc-in';
import { modelSearchFieldInKey } from '@/apps/document/helpers/injectionKeys';
import type { DocIn } from '@/apps/document/model/doc/doc-in';
import type { SearchModel } from '@/apps/document/model/doc/search';
import { ProcessType } from '@/apps/document/model/process/incoming';
import { useDocumentRolesStore } from '@/apps/document/store/document-role';
import { DocumentAction } from '@/apps/document/views/doc/doc-in/action/action';
import DocumentInDetail from '@/apps/document/views/doc/doc-in/detail/DocumentInDetail.vue';
import DocumentInWithProcessDetail from '@/apps/document/views/doc/doc-in/detail/DocumentInWithProcessDetail.vue';
import DocInProcessList from '@/apps/document/views/doc/doc-in/list/DocInProcessList.vue';
import DocInManageWrapper from '@/apps/document/views/doc/doc-in/manage/DocInManageWrapper.vue';
import type { Edge } from '@/common/model/page';
import { Direction, type Order, type Pageable } from '@/common/model/query';

const documentActions = [
  DocumentAction.COPY,
  DocumentAction.CREATE_PROFILE,
  DocumentAction.CREATE_WORK,
  DocumentAction.PROCLAIM,
  DocumentAction.ASK_FOR_OPINION,
  DocumentAction.CREATE_DRAFT,
];
const selectedDocument = defineModel('selectedDocument', {
  type: Object as PropType<DocIn | undefined>,
  default: undefined,
});
const processId = ref();
const { t } = useI18n();
const { userDeptRole } = storeToRefs(useDocumentRolesStore());
const visibleDetail = ref(false);
const pageable = reactive<Pageable>({
  page: 0,
  size: 10,
});
const search = reactive<SearchModel>({});
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

function isReadDoc(docIn: DocIn | undefined) {
  return docIn?.cc?.isRead;
}

const filters: (MenuItem & { code: string })[] = [
  {
    label: t('common.all'),
    code: 'all',
    command() {
      updateSearchField('processType', undefined);
    },
  },
  {
    label: t('document.doc.mainProcessing'),
    code: 'mainProcessing',
    command() {
      updateSearchField('processType', ProcessType.XL_CHINH);
    },
  },
  {
    label: t('document.doc.coordinatedProcessing'),
    code: 'coordinatedProcessing',
    command() {
      updateSearchField('processType', ProcessType.PHOI_HOP);
    },
  },
];
provide(modelSearchFieldInKey, search);
provide('updateSearchField', updateSearchField);
provide('updatePageable', updatePageable);
provide('updateOrder', updateOrder);
provide('goToDetailRoute', goToDetailRoute);
provide('isReadDoc', isReadDoc);
provide('isFlowFinish', true);

provide<Order[]>('sortFields', [
  {
    property: 'sendTime',
    direction: Direction.DESC,
  },
]);
provide('filters', filters);
provide('afterAction', () => refetch());

function goToDetailRoute(router: Router, docIn: DocIn) {
  processId.value = docIn?.process?.id;
  visibleDetail.value = true;
  // router.push({ path: `processed/detail/${docIn?.process?.id}` });
}

const updateCount = inject(
  'updateCount',
  (name: string, count: number) => void {},
);
watch(total, (total) => {
  if (total !== undefined && total !== null) {
    updateCount('DocumentDocInProcessedManage', total);
  }
}, { immediate: true });
onMounted(() => {
  load();
});
const hideButtons = ref<string[]>(['ALL']);
provide('hideButtonsName', hideButtons);
</script>

<style scoped></style>
