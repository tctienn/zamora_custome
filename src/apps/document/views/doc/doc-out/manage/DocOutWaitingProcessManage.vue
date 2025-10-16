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
        <DocOutProcessList
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
import { cloneDeep } from 'lodash';
import { storeToRefs } from 'pinia';
import type { MenuItem } from 'primevue/menuitem';
import { computed, inject, onMounted, type PropType, provide, reactive, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import type { Router } from 'vue-router';

import { docOutWaitingProcess } from '@/apps/document/api/graphql/doc-out';
import { readOutProcess } from '@/apps/document/api/graphql/outgoing-doc';
import type { DocOut } from '@/apps/document/model/doc/doc-out';
import type { DocOutSearch } from '@/apps/document/model/doc/search';
import { DocOutProcessType, type OutgoingProcess } from '@/apps/document/model/process/outgoing';
import { useDocumentRolesStore } from '@/apps/document/store/document-role';
import { DocumentAction } from '@/apps/document/views/doc/doc-in/action/action';
import DocumentOutDetail from '@/apps/document/views/doc/doc-out/detail/DocumentOutDetail.vue';
import DocOutProcessList from '@/apps/document/views/doc/doc-out/list/DocOutProcessList.vue';
import DocOutManageWrapper from '@/apps/document/views/doc/doc-out/manage/DocOutManageWrapper.vue';
import type { Edge } from '@/common/model/page';
import { Direction, type Order, type Pageable } from '@/common/model/query';

const selectedDocument = defineModel('selectedDocument', {
  type: Object as PropType<DocOut | undefined>,
  default: undefined
});
const { t } = useI18n();
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
} = docOutWaitingProcess(search, userDeptRole.value, pageable);
watch(result, (value) => {
  const edges = value.docOutWaitingProcess.edges;
  if (edges) {
    docOuts.value = cloneDeep(edges?.map((edge: Edge<DocOut>) => edge.node));
  }
});
const docOuts = ref<DocOut[]>([]);
const total = computed(() => result.value?.docOutWaitingProcess.totalCount);

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
  //   name: 'DocumentDocOutWaitingProcessDetail',
  //   params: { processId: docOut?.process?.id }
  // });
}

function isReadDoc(docOut: DocOut | undefined) {
  return docOut?.process?.isRead;
}

function readDoc(docOut: DocOut) {
  if (docOut?.process?.id) {
    readOutProcess()
      .mutate({ processId: docOut.process.id })
      .then((res) => {
        if (res?.data?.readOutProcess) {
          docOuts.value = docOuts.value.map((doc) => {
            if (doc.process?.id === docOut.process?.id) {
              doc.process = {
                ...doc.process,
                isRead: true,
              } as OutgoingProcess;
            }
            return doc;
          });
        }
      });
  }
}

const filters: (MenuItem & { code: string })[] = [
  {
    label: t('common.all'),
    code: 'all',
    icon: 'format_list_bulleted',
    command() {
      updateSearchField('processType', undefined);
    },
  },
  {
    label: t('document.doc.mainProcessing'),
    code: 'mainProcessing',
    icon: 'person_edit',
    command() {
      updateSearchField('processType', DocOutProcessType.XL_CHINH);
    },
  },
  {
    label: t('document.doc.coordinatedProcessing'),
    code: 'coordinatedProcessing',
    icon: 'group',
    command() {
      updateSearchField('processType', DocOutProcessType.PHOI_HOP);
    },
  },
];

provide('updateSearchField', updateSearchField);
provide('updatePageable', updatePageable);
provide('updateOrder', updateOrder);
provide('goToDetailRoute', goToDetailRoute);
provide('isReadDoc', isReadDoc);
provide('readDoc', readDoc);
provide('reloadDoc', refetch);
provide<Order[]>('sortFields', [
  {
    property: 'sendTime',
    direction: Direction.DESC,
  },
]);
provide('filters', filters);
provide('afterAction', () => refetch());
provide('defaultFilterTab', 0);
const updateCount = inject(
  'updateCount',
  (name: string, count: number) => void {},
);

watch(total, (total) => {
  if (total !== undefined && total !== null) {
    updateCount('DocumentDocOutWaitingProcessManage', total);
  }
}, { immediate: true });
onMounted(() => {
  load();
});
</script>

<style scoped>

</style>
