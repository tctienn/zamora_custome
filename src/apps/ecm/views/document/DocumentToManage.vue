<template>

  <DataTable
    v-bind='DEFAULT_DATATABLE_CONFIG'
    lazy
    :loading='getDocumentLoading'
    :total-records='totalRecords'
    :value='documents'
    @page='onPage($event)'
    @sort='onSort($event)'>
    <template #header>
      <div class='align-items-center flex flex-wrap justify-content-between'>
        <div class='align-items-center column-gap-2 flex flex-row'>
          <ButtonIcon
            class='text-white'
            icon='add_circle'
            rounded
            text
            @click='showFormDocumentTo'/>
          <span class='font-bold text-primary text-white text-xl'>{{t('ecm.document.listDocument') }}</span>
        </div>

        <div class='search-input-wrapper'>
          <AppIcon
            name='search'
            size='1.5'/>
          <InputText
            v-model='searchParams.keyword'
            :placeholder='t("common.search")'
            @keyup.enter='searchDatatableFn'/>
        </div>
      </div>
    </template>

    <template #empty>
      <span class='block font-bold text-600 text-center'>{{
        t('common.emptyRecords', {itemType: toLower(t('admin.userGroup.group'))})
      }}</span>
    </template>

    <Column
      header='#'>
      <template #body='{index}'>
        {{ index + 1 + pageable.page * pageable.size }}
      </template>
    </Column>

    <Column
      field='registrationNo'
      :header='t("ecm.document.registrationNo")'
      :sortable='true'>
    </Column>

    <Column
      field='documentNo'
      :header='t("ecm.document.documentNo")'
      :sortable='true'>
    </Column>

    <Column
      field='excerptFromTheText'
      :header='t("ecm.document.excerptFromTheText")'
      :sortable='true'>
    </Column>

    <Column
      field='urgency'
      :header='t("ecm.document.urgency")'
      :sortable='true'>
      <template #body='{data: {urgency}}'>
        {{ t('ecm.document.urgencyValue.' + lowerCase(urgency)) }}
      </template>
    </Column>

    <Column
      field='confidentiality'
      :header='t("ecm.document.confidentiality")'
      :sortable='true'>
      <template #body='{data: {confidentiality}}'>
        {{ t('ecm.document.confidentialityValue.' + lowerCase(confidentiality)) }}
      </template>
    </Column>

    <Column
      field='sender'
      :header='t("ecm.document.sender")'
      :sortable='true'>
      <template #body='{data: {sender}}'>
        {{ getUser(sender) }}
      </template>
    </Column>

    <Column
      field='signer'
      :header='t("ecm.document.signer")'
      :sortable='true'>
      <template #body='{data: {signer }}'>
        {{ getUser(signer) }}
      </template>
    </Column>

    <Column
      field='status'
      :header='t("ecm.document.status")'
      :sortable='true'>
      <template #body='{data: {status}}'>
        {{ t('ecm.document.statusValue.' + lowerCase(status)) }}
      </template>
    </Column>

    <Column
      field='toDate'
      :header='t("ecm.document.toDate")'
      :sortable='true'>
    </Column>

    <Column
      field='fileAttach'
      :header='t("ecm.document.fileAttach")'
      :sortable='true'>
      <template #body='{data: {fileAttach}}'>
        <a
          :href='GATEWAY_URL + "/files/download/" + fileAttach'
          type='download'>{{ fileAttach?.split('/')[fileAttach?.split('/').length - 1] }}</a>
      </template>
    </Column>
    <Column
      class='text-center'>
      <template #body='{data}'>
        <ButtonIcon
          v-if='data["status"] !== STATUSES.DELETED'
          class='text-color'
          icon='list'
          rounded
          text
          @click='toggleActionMenu({event : $event, data : data})'/>
      </template>
    </Column>
  </DataTable>

  <Menu
    ref='menuAction'
    :model='menuActionsFilter'
    :popup='true'>
    <template #item='{item: {icon, label}}'>
      <MenuItem
        :icon='icon'
        :label='label'/>
    </template>
  </Menu>
</template>

<script setup lang='ts'>

import { assign, cloneDeep, get, lowerCase, toLower } from 'lodash';
import Column from 'primevue/column';
import DataTable, { type DataTableSortEvent } from 'primevue/datatable';
import { reactive, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';

import { getAllUserStatusActive } from '@/apps/admin/api/graphql/admin-customer-tenant';
import type { DocumentToInterface } from '@/apps/admin/model/document';
import type { UserInterface } from '@/apps/admin/model/User';
import { deleteDocumentToGraph, searchDocumentTo } from '@/apps/ecm/api/graphql/document-to-graphql';
import type { DocumentToEdge } from '@/apps/ecm/model/document';
import { GATEWAY_URL } from '@/common/api/configService';
import MenuItem from '@/common/components/custom/MenuItem.vue';
import { DEFAULT_DATATABLE_CONFIG, DEFAULT_PAGE_SIZE, STATUSES } from '@/common/constants';
import { toastSuccess } from '@/common/helpers/custom-toast-service';
import { Direction, type Pageable } from '@/common/model/query';

const { t } = useI18n() || {};
const route = useRoute();
const menuAction = ref();
const router = useRouter();
const totalRecords = ref(0);
const documents = ref([]);
const document = ref({} as DocumentToInterface);
const getDocumentLoading = ref(true);
const users = ref<UserInterface[]>([]);

const pageable = reactive<Pageable>({
  page: 0,
  size: DEFAULT_PAGE_SIZE,
  sort: [{
    property: 'excerptFromTheText',
    direction: Direction.ASC
  }]
});
// const { query } = route || {};
const searchParams = reactive<{ keyword: string, pageable: Pageable }>(
  route.query.searchParams ? JSON.parse(route.query.searchParams as string)
    : {
      keyword: '',
      pageable: pageable
    }
);

const {
  onResult: searchDocumentToOnResult,
  refetch: searchDocumentRefetch
} = searchDocumentTo(searchParams);
searchDocumentToOnResult((result) => {
  const {
    totalCount,
    edges
  } = get(result, 'data.searchDocumentTo', {
    totalCount: 0,
    edges: []
  });
  totalRecords.value = totalCount;
  documents.value = edges.map((edge: DocumentToEdge, index: number) => ({
    ...edge.node,
    ordinalNumber: pageable.page * pageable.size + index + 1
  }));
  getDocumentLoading.value = false;
});

const {
  mutate: deleteDocumentMutate,
  onDone: deleteDocumentOnDone
} = deleteDocumentToGraph();

function toggleActionMenu({
  event,
  data
}: { event: Event, data: DocumentToInterface }) {
  menuAction.value.toggle(event);
  document.value = cloneDeep(data);
}

function onPage(event: { page: number, rows: number }) {
  const {
    page,
    rows
  } = event;
  assign(pageable, {
    page,
    size: rows,
  });
  assign(searchParams, pageable);
  searchDocumentRefetch(searchParams);
}

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
  assign(searchParams, pageable);
  searchDocumentRefetch(searchParams);
}

function searchDatatableFn() {
  searchDocumentRefetch(searchParams);
}

const menuActions = [
  {
    label: t('common.edit'),
    icon: 'edit',
    command: () => {
      updateDocument();
    }
  },
  {
    label: t('common.delete'),
    icon: 'delete',
    command: () => {
      deleteDocument();
    }
  }
];
const menuActionsFilter = menuActions;

function updateDocument() {
  router.push({
    name: 'EcmDocumentTo/CREATE',
    query: {
      id: document.value.id,
      searchParams: JSON.stringify(searchParams)
    }
  });
}

function deleteDocument() {
  deleteDocumentMutate({ id: document.value.id });
}

const { onResult: getUserOnResult } = getAllUserStatusActive();
getUserOnResult((res) => {
  users.value = res.data.getAllUserStatusActive;
});

deleteDocumentOnDone(() => {
  toastSuccess({ message: t('ecm.document.deleteSuccess', {}) });
  searchDocumentRefetch(searchParams);
});

function showFormDocumentTo() {
  router.push({
    name: 'EcmDocumentTo/CREATE',
    query: {}
  });
}

function getUser(id: string) {
  return users.value.find((o) => o.id === id)?.username;
}

</script>

<script lang='ts'>
export default { name: 'DocumentToManage' };
</script>

<style scoped>

</style>