<template>
  <div>
    <DocInManageWrapper
      v-model:selected-document='selectedDocument'
      :doc-ins='docIns'
      doc-status='waitingDocs'
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
import { cloneDeep } from 'lodash';
import { storeToRefs } from 'pinia';
import type { MenuItem } from 'primevue/menuitem';
import { computed, inject, onMounted, type PropType, provide, reactive, type Ref, ref, watch, } from 'vue';
import { useI18n } from 'vue-i18n';
import type { Router } from 'vue-router';

import { waitingDocs } from '@/apps/document/api/graphql/doc-in';
import { readProcess } from '@/apps/document/api/graphql/incoming-doc';
import { modelSearchFieldInKey } from '@/apps/document/helpers/injectionKeys';
import type { DocIn } from '@/apps/document/model/doc/doc-in';
import type { SearchModel } from '@/apps/document/model/doc/search';
import { type InComingProcess, ProcessType, } from '@/apps/document/model/process/incoming';
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
const { t } = useI18n();
const pageable = reactive<Pageable>({
  page: 0,
  size: 10,
});
const { userDeptRole } = storeToRefs(useDocumentRolesStore());
const search = reactive<SearchModel>({});
const processId = ref();
const visibleDetail = ref(false);
const {
  result: resultDocIns,
  loading,
  load,
  refetch,
} = waitingDocs(search, userDeptRole.value, pageable);
watch(resultDocIns, (value) => {
  const edges = value?.waitingDocs?.edges;
  if (edges) {
    docIns.value = cloneDeep(edges.map((edge: Edge<DocIn>) => edge?.node));
  }
});
const docIns = ref<DocIn[]>([]);
const total = computed(() => resultDocIns.value?.waitingDocs.totalCount);

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
  return docIn?.process?.isRead;
}

function readDoc(docIn: DocIn) {
  if (docIn.process?.id) {
    readProcess()
      .mutate({ processId: docIn.process.id })
      .then((res) => {
        if (res?.data?.readProcess) {
          docIns.value = docIns.value.map((doc) => {
            if (doc.process?.id === docIn.process?.id) {
              doc.process = {
                ...doc.process,
                isRead: true,
              } as InComingProcess;
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

provide('updateSearchField', updateSearchField);
provide(modelSearchFieldInKey, search);
provide('updatePageable', updatePageable);
provide('updateOrder', updateOrder);
provide('goToDetailRoute', goToDetailRoute);
provide('isReadDoc', isReadDoc);
provide('readDoc', readDoc);
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
provide('filters', filters);
provide('afterAction', () => refetch());
provide('defaultFilterTab', 0);

const updateCount = inject(
  'updateCount',
  (name: string, count: number) => void {},
);

// Inject wrapper reactive data for action buttons communication
const wrapperSelectedDocument = inject('wrapperSelectedDocument', ref<DocIn | undefined>()) as Ref<DocIn | undefined>;
const wrapperMenuActions = inject('wrapperMenuActions', ref<DocumentAction[]>([])) as Ref<DocumentAction[]>;
const wrapperShowActionButtons = inject('wrapperShowActionButtons', ref(false)) as Ref<boolean>;
const wrapperDocStatus = inject('wrapperDocStatus', ref('')) as Ref<string>;
const wrapperSearch = inject('wrapperSearch', ref<SearchModel>({})) as Ref<SearchModel>;

// Sync local data with wrapper
watch(selectedDocument, (newDoc) => {
  wrapperSelectedDocument.value = newDoc;
}, { immediate: true });

watch(() => documentActions, (actions) => {
  wrapperMenuActions.value = actions;
}, { immediate: true });

watch(() => search, (searchData) => {
  wrapperSearch.value = searchData;
}, {
  deep: true,
  immediate: true 
});

// Enable action buttons for this component
wrapperShowActionButtons.value = true;
wrapperDocStatus.value = 'waitingDocs';

watch(total, (total) => {
  if (total !== undefined && total !== null) {
    updateCount('DocumentDocInWaitingManage', total);
  }
}, { immediate: true });

function goToDetailRoute(router: Router, docIn: DocIn) {
  processId.value = docIn?.process?.id;
  visibleDetail.value = true;
}

onMounted(() => {
  load();
});
</script>

<style scoped></style>
