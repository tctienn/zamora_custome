<template>
  <DataTable
    v-bind='DEFAULT_DATATABLE_CONFIG'
    data-key='tenant'
    :lazy='true'
    :loading='searchLoading'
    :total-records='totalRecords'
    :value='clients'
    @page='onPage($event)'
    @sort='onSort($event)'>
    <template #header>
      <div class='align-items-center flex flex-wrap justify-content-between'>
        <div class='align-items-center flex'>
          <ButtonIcon
            v-tooltip.top='t("common.create")'
            class='font-bold ml-1 text-primary text-white text-xl'
            icon='add_circle'
            rounded
            text
            @click='openDialog'></ButtonIcon>
          <span class='font-bold ml-2 text-primary text-white text-xl'>{{
            t('work.client.tableTitle') + ' (' + totalRecords + ')'
          }}</span>
        </div>

        <div class='flex'>
          <span class='block p-input-icon-left'>
            <i class='pi pi-search'/>
            <InputText
              v-model='searchKeyword'
              :placeholder='t("common.search")'
              @keyup.enter='search'/>
          </span>
        </div>
      </div>
    </template>

    <template #empty>
      <span class='block font-bold text-600 text-center'>{{
        t('common.emptyRecords', { itemType: toLower(t('customer.objectName')) })
      }}</span>
    </template>

    <Column
      header='#'>
      <template #body='slotProps'>
        {{ pageable.page * pageable.size + slotProps.index + 1 }}
      </template>
    </Column>

    <Column
      field='clientCode'
      :header='t("work.client.clientCode")'
      :sortable='true'>
    </Column>

    <Column
      field='clientName'
      :header='t("work.client.clientName")'
      :sortable='true'>
    </Column>

    <Column
      field='email'
      :header='t("work.client.email")'
      :sortable='true'>
    </Column>

    <Column
      field='address'
      :header='t("work.client.address")'
      :sortable='true'>
    </Column>

    <Column
      field='groupClient'
      :header='t("work.client.groupClient")'
      :sortable='true'>
      <template #body='{data: {groupClient}}'>
        <span>{{
          findCustomerType(groupClient)
        }}</span>
      </template>
    </Column>

    <Column
      field='contact'
      :header='t("work.client.contact")'
      :sortable='true'>
    </Column>

    <!--    <Column-->
    <!--      field='status'-->
    <!--      :header='t("common.status")'-->
    <!--      :sortable='true'>-->
    <!--      <template #body='{data: {status}}'>-->
    <!--        <span-->
    <!--          class='status-badge'-->
    <!--          :class='`status-${toLower(status)}`'>{{-->
    <!--            t(`common.statuses.${toLower(status)}`)-->
    <!--          }}</span>-->
    <!--      </template>-->
    <!--    </Column>-->

    <Column
      :header='t("work.client.action")'>
      <template #body='slotProps'>
        <ButtonIcon
          v-tooltip.top='t("common.action")'
          class='text-color'
          icon='list'
          rounded
          text
          @click='toggleActionMenu($event,slotProps.data)'/>
      </template>
    </Column>
  </DataTable>
  <Menu
    ref='menu'
    :model='actions'
    :popup='true'>
    <template #item='{item: {icon, label}}'>
      <MenuItem
        :icon='icon'
        :label='label'/>
    </template>
  </Menu>
  <CreateOrUpdateClientDialog
    v-if='showCreateOrUpdateDialog'
    :client='client'
    :display-dialog='showCreateOrUpdateDialog'
    @close-dialog='hideDialog'/>
</template>

<script setup lang='ts'>
import { assign, toLower } from 'lodash';
import Column from 'primevue/column';
import type { DataTableSortEvent } from 'primevue/datatable';
import { reactive, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

import { getCategoryByGroupCodePublicGraphql } from '@/apps/admin/api/graphql/category-graphql-api';
import type { CategoryInterface } from '@/apps/admin/model/category';
import { deleteClient, searchClientGraphql } from '@/apps/work/api/graphql/client-tenant-graphql-api';
import type { ClientEdge, ClientInterface } from '@/apps/work/model/client';
import { DEFAULT_DATATABLE_CONFIG, DEFAULT_PAGE_SIZE } from '@/common/constants';
import { toastSuccess } from '@/common/helpers/custom-toast-service';
import type { Pageable } from '@/common/model/query';

import CreateOrUpdateClientDialog from './CreateClient.vue';

const { t } = useI18n() || {};
let actions = ref<object[]>([]);
const menu = ref();
const clients = ref([]);
const searchLoading = ref(true);
const searchKeyword = ref('');
const totalRecords = ref(0);
const router = useRouter();
const client = ref<ClientInterface>({} as ClientInterface);
const pageable = reactive<Pageable>({
  page: 0,
  size: DEFAULT_PAGE_SIZE,
});

const defaultParam = {
  searchCondition: '',
  pageable: pageable
};
const {
  refetch: searchRefetch,
  onResult: searchOnResult
} = searchClientGraphql(defaultParam);
const {
  mutate: deleteClientMutate,
  onDone: deleteClientOnDone
} = deleteClient();

searchOnResult((result) => {
  const {
    loading,
    data
  } = result;
  searchLoading.value = loading;
  clients.value = data.clients.edges.map((edge: ClientEdge) => ({ ...edge.node, }));
  totalRecords.value = data.clients.totalCount;
});

let currentParam = { ...defaultParam };

let showCreateOrUpdateDialog = ref(false);

function openDialog() {
  // client.value = {} as ClientForm;
  // showCreateOrUpdateDialog.value = true;
  router.push({ name: 'ClientCreate' });
}

function toggleActionMenu(event: Event, data: ClientInterface) {
  menu.value.toggle(event);
  client.value = data;
  actions.value = [{
    label: t('common.edit'),
    icon: 'edit',
    command: () => {
      router.push({
        name: 'ClientUpdate',
        query: { id: client.value.id }
      });
    }
  }, {
    label: t('common.delete'),
    icon: 'delete',
    command: () => {
      deleteClientFunction(data.id);
    }
  }
  ];
}

function search() {
  currentParam = {
    ...currentParam,
    searchCondition: searchKeyword.value
  };
  searchRefetch(currentParam);
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
  assign(currentParam, pageable);
  searchRefetch(currentParam);
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
  assign(currentParam, pageable);
  searchRefetch(currentParam);
}

function deleteClientFunction(id: string | undefined) {
  deleteClientMutate({ id });
}

function hideDialog(value: boolean) {
  showCreateOrUpdateDialog.value = value;
  searchRefetch(currentParam);
}

deleteClientOnDone(() => {
  toastSuccess({ message: t('work.client.message.deleteSuccess') });
  searchRefetch(currentParam);
});

const categoriesCustomer = ref<CategoryInterface[]>([]);

const {
  onResult: getAllCategoryByGroupCodePublicOnResult,
  onError: getAllCategoryByGroupCodePublicOnError
} = getCategoryByGroupCodePublicGraphql('CUSTOMER_TYPE');
getAllCategoryByGroupCodePublicOnResult(res => {
  categoriesCustomer.value = res.data.getCategoryByGroupCodePublic as CategoryInterface[];
});
getAllCategoryByGroupCodePublicOnError(res => {
});

function findCustomerType(code: string) {
  return categoriesCustomer.value.find(c => c.code == code)?.name;
}

</script>

<script lang='ts'>
export default { name: 'ClientManager' };
</script>

<style scoped>

</style>