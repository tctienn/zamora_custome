<template>
  <div
    class='surface-0'
    style='height: calc(100vh - 10rem)'>
    <DataTable
      v-model:selection='selectedRows'
      class='my-table'
      data-key='id'
      v-bind="{
        ...DEFAULT_DATATABLE_CONFIG,
        'scroll-height': 'calc(100vh - 13rem)',
      }"
      :meta-key-selection='false'
      scroll-direction='horizontal'
      :scrollable='true'
      :show-gridlines='true'
      :value='docs'
      @sort='onSort($event)'>
      <template #empty>
        <span class='block font-bold text-600 text-center'>{{
          t('common.emptyRecords', {
            itemType: toLower(t('document.book.objectName')),
          })
        }}</span>
      </template>

      <Column
        :header="t('STT')">
        <template #body='{index}'>
          {{ index + 1 }}
        </template>
      </Column>
      <Column
        field='docDate'
        :header="t('Ngày văn bản')"
        :sortable='true'
        style='width: 7vw'>
        <template #body='{data: {docDate}}'>
          {{ docDate ? moment(docDate).format('DD/MM/YYYY') : '' }}
        </template>
      </Column>
      <Column
        field='bookName'
        :header="t('Sổ văn bản')"
        style='width: 7vw'></Column>
      <Column
        field='docCode'
        :header="t('Số ký hiệu văn bản')"
        style='width: 7vw'></Column>
      <Column
        field='quote'
        :header="t('Trích yếu nội dung văn bản')"
        style='width: 7vw'>
        <template #body='{data: {quote}}'>
          <div>
            {{ quote ? quote.length > 100 ? quote?.substring(0, 100) + '...' : quote : '' }}
          </div>
        </template>
      </Column>
      <Column
        field='docTypeName'
        :header="t('Hình thức văn bản ')"
        style='width: 7vw'></Column>
      <Column
        field='priorityCode'
        :header="t('Độ khẩn')"
        style='width: 7vw'>
        <template #body='{data: {priorityCode}}'>
          {{ getPriorities(priorityCode) }}
        </template>
      </Column>
      <Column
        field='signerName'
        :header="t('Người ký')"
        style='width: 7vw'></Column>

      <Column
        field='issuerDeptName'
        :header="t('Đơn vị soạn thảo')"
        style='width: 7vw'></Column>

      <Column
        field='receiverDeptName'
        :header="t('Đơn vị nhận')"
        style='width: 7vw'></Column>

      <Column
        field='receiverUserName'
        :header="t('Cá nhân nhận')"
        style='width: 7vw'></Column>

      <Column
        field='numberOfCopy'
        :header="t('Số lượng bản')"
        style='width: 7vw'></Column>

      <Column
        field='issueDate'
        :header="t('Ngày chuyển')"
        :sortable='true'
        style='width: 7vw'>
        <template #body='{data: {issueDate}}'>
          {{ issueDate ? moment(issueDate).format('DD/MM/YYYY') : '' }}
        </template>
      </Column>

      <Column
        :header="t('Hình thức gửi')"
        style='width: 7vw'></Column>

      <Column
        :header="t('Ghi chú')"
        style='width: 7vw'></Column>
    </DataTable>
  </div>
</template>

<script lang='ts' setup>
import { assign, get, throttle, toLower } from 'lodash';
import moment from 'moment/moment';
import { storeToRefs } from 'pinia';
import Column from 'primevue/column';
import type { DataTableSortEvent } from 'primevue/datatable';
import { inject, onMounted, reactive, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import type { UserEdge } from '@/apps/admin/model/User';
import { reportDocOut } from '@/apps/document/api/graphql/report';
import type { BookInterface } from '@/apps/document/model/book';
import { getPriorities } from '@/apps/document/model/doc/doc-in';
import type { DocOut } from '@/apps/document/model/doc/doc-out';
import { useDocumentRolesStore } from '@/apps/document/store/document-role';
import { DEFAULT_DATATABLE_CONFIG } from '@/common/constants';
import { Direction, type Pageable } from '@/common/model/query';
import { useGlobalSearchStore } from '@/common/store/search';

const {
  submit,
  model
} = storeToRefs(useGlobalSearchStore());
const { userDeptRole } = storeToRefs(useDocumentRolesStore());
const { t } = useI18n();
const selectedRows = ref<BookInterface[]>([]);
const totalRecords = ref(0);
const searchTerm = inject('searchTerm', ref(''));
const docs = ref<DocOut[]>([] as DocOut[]);
const {
  load: reportDocOutLoad,
  onResult: reportDocOutResult
} = reportDocOut();
reportDocOutResult((res) => {
  const {
    totalCount,
    edges
  } = get(res, 'data.reportDocOut', {
    totalCount: 0,
    edges: [],
  });
  docs.value = [...docs.value, ...edges.map((edge: UserEdge) => edge.node)];
  totalRecords.value = totalCount;
});

const pageable = reactive<Pageable>({
  page: 0,
  size: 20,
  sort: [
    {
      property: 'docDate',
      direction: Direction.ASC,
    },
  ],
});

// reportDocOutLoad(undefined, { userDeptRole: userDeptRole.value });

function onSort(event: DataTableSortEvent) {
  const {
    sortField,
    sortOrder
  } = event;
  assign(pageable, {
    page: 0,
    sort: [
      {
        property: sortField,
        direction: sortOrder === 1 ? 'ASC' : 'DESC'
      }
    ]
  });

  docs.value = [];

  reportDocOutLoad(undefined, {
    userDeptRole: userDeptRole.value,
    reportDocOutModel: {
      ...model.value,
      keyword: searchTerm.value,
      issueDateFrom: model.value.issueDateFrom ? moment(model.value.issueDateFrom).format('YYYY-MM-DD') : null,
      issueDateTo: model.value.issueDateTo ? moment(model.value.issueDateTo).format('YYYY-MM-DD') : null,
      docDateFrom: model.value.docDateFrom ? moment(model.value.docDateFrom).format('YYYY-MM-DD') : null,
      docDateTo: model.value.docDateTo ? moment(model.value.docDateTo).format('YYYY-MM-DD') : null
    },
    pageable
  });
}

watch(submit, () => {
  pageable.page = 0;
  docs.value = [];
  reportDocOutLoad(undefined, {
    userDeptRole: userDeptRole.value,
    reportDocOutModel: {
      ...model.value,
      keyword: searchTerm.value,
      issueDateFrom: model.value.issueDateFrom ? moment(model.value.issueDateFrom).format('YYYY-MM-DD') : null,
      issueDateTo: model.value.issueDateTo ? moment(model.value.issueDateTo).format('YYYY-MM-DD') : null,
      docDateFrom: model.value.docDateFrom ? moment(model.value.docDateFrom).format('YYYY-MM-DD') : null,
      docDateTo: model.value.docDateTo ? moment(model.value.docDateTo).format('YYYY-MM-DD') : null
    },
    pageable
  });
});

watch(searchTerm, (value) => {
  pageable.page = 0;
  docs.value = [];
  reportDocOutLoad(undefined, {
    userDeptRole: userDeptRole.value,
    reportDocOutModel: {
      ...model.value,
      keyword: searchTerm.value,
      issueDateFrom: model.value.issueDateFrom ? moment(model.value.issueDateFrom).format('YYYY-MM-DD') : null,
      issueDateTo: model.value.issueDateTo ? moment(model.value.issueDateTo).format('YYYY-MM-DD') : null,
      docDateFrom: model.value.docDateFrom ? moment(model.value.docDateFrom).format('YYYY-MM-DD') : null,
      docDateTo: model.value.docDateTo ? moment(model.value.docDateTo).format('YYYY-MM-DD') : null
    },
    pageable
  });
});

function moreReport() {
  if (docs.value.length >= totalRecords.value) {
    return;
  }
  pageable.page++;
}

function scrollEvent(e: Event) {
  e.target instanceof HTMLElement
  && e.target.scrollHeight - e.target.scrollTop - 100 <= e.target.clientHeight
  && moreReport();
}

function addScrollEventListener(selector: string) {
  const scrollableContainer = document.querySelector(selector);
  if (scrollableContainer) {
    scrollableContainer.addEventListener(
      'scrollend',
      throttle(scrollEvent, 2000),
    );
  }
}

onMounted(() => {
  addScrollEventListener('.p-datatable-wrapper');
});
</script>

<style scoped>
.my-table {
  display: block;
  overflow-x: auto;
  white-space: nowrap;
}
</style>
