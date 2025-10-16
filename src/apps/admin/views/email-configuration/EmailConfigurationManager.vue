<template>
  <Toolbar class='h-3rem mb-2 px-2 py-0 surface-0'>
    <template #start>
      <div class='align-items-center flex gap-2'>
        <div class='font-bold'>
          {{ t('admin.emailConfiguration.tableTitle') }}
        </div>
      </div>
    </template>
    <template #end>
      <div class='align-content-center btn-group-toolbar flex flex-wrap gap-3 h-3rem mr-1 my-auto'>
        <ButtonIcon
          class='btn-create focus:shadow-none font-medium p-2'
          icon='add'
          :label="t('common.create')"
          @click='createEmailConfiguration'/>
      </div>
    </template>
  </Toolbar>

  <div class='h-full surface-0'>
    <DataTable
      v-model:selection='selectedRow'
      :total-records='totalRecords'
      :value='emailConfigurations'
      v-bind='DEFAULT_DATATABLE_CONFIG'
      @sort='onSort($event)'>
      <template #empty>
        <span class='block font-bold text-600 text-center'>{{
          t('common.emptyRecords', {
            itemType: toLower(t('admin.emailConfiguration.objectName')),
          })
        }}</span>
      </template>

      <Column
        class='text-center'
        :header='t("common.ordinalNumber")'>
        <template #body='slotProps'>
          {{ slotProps.index + 1 }}
        </template>
      </Column>

      <Column
        field='name'
        :header="t('admin.emailConfiguration.name')"
        :sortable='true'></Column>

      <Column
        field='server'
        :header="t('admin.emailConfiguration.server')"
        :sortable='true'></Column>

      <Column
        field='protocol'
        :header="t('admin.emailConfiguration.protocol')"
        :sortable='true'>
        <template #body='{ data: { protocol } }'>
          {{ t(`admin.emailConfiguration.protocols.${camelCase(protocol)}`) }}
        </template>
      </Column>

      <Column
        field='port'
        :header="t('admin.emailConfiguration.port')"
        :sortable='true'>
      </Column>

      <Column
        field='account'
        :header="t('admin.emailConfiguration.account')"
        :sortable='true'>
      </Column>

      <Column
        class='max-w-20rem'
        field='description'
        :header="t('common.description')"
        :sortable='true'>
      </Column>

      <Column
        class='text-center'
        field='status'
        :header="t('common.status')"
        :sortable='true'>
        <template #body='{ data: { status } }'>
          <span
            class='status-badge'
            :class='`status-${toLower(status)}`'>{{
              status ? t(`common.statuses.${toLower(status)}`) : ''
            }}</span>
        </template>
      </Column>

      <Column
        class='text-center'
        :header="t('common.action')">
        <template #body='{ data }'>
          <ButtonIcon
            v-tooltip.top="t('common.action')"
            class='text-color'
            icon='more_vert'
            icon-size='1.7'
            rounded
            text
            @click='toggleActionMenu({ event: $event, data: data })'/>
        </template>
      </Column>
    </DataTable>
  </div>

  <Menu
    ref='menuAction'
    :model='menuActions'
    :popup='true'>
    <template #item='{ item: { icon, label } }'>
      <MenuItem
        :class-icon="['mt-0 text-sm', icon === 'delete' ? 'text-red-300' : '']"
        :class-item="['mt-1', icon === 'delete' ? 'text-red-300' : '']"
        :icon='icon'
        :label='label'/>
    </template>
  </Menu>

  <EmailConfigurationForm
    v-if='emailConfigurationFormVisible'
    :item='emailConfiguration'
    :visible-dialog='emailConfigurationFormVisible'
    @hide-dialog='hideEmailConfigurationFormDialog'
    @reload='reload'/>
</template>

<script lang='ts' setup>
import { assign, camelCase, cloneDeep, get, toLower } from 'lodash';
import Column from 'primevue/column';
import DataTable, { type DataTableSortEvent } from 'primevue/datatable';
import { useConfirm } from 'primevue/useconfirm';
import { inject, onMounted, reactive, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import {
  deleteEmailConfigurationGraphql,
  getEmailConfigurationGraphql,
} from '@/apps/admin/api/graphql/email-configuration-graphql-api';
import type { EmailConfigurationEdge, EmailConfigurationInterface, } from '@/apps/admin/model/email-configuration';
import { EmailConfiguration } from '@/apps/admin/model/email-configuration';
import EmailConfigurationForm from '@/apps/admin/views/email-configuration/EmailConfigurationForm.vue';
import MenuItem from '@/common/components/custom/MenuItem.vue';
import { DEFAULT_DATATABLE_CONFIG, DEFAULT_PAGE_SIZE, } from '@/common/constants';
import { toastErrorData, toastSuccess, } from '@/common/helpers/custom-toast-service';
import { Direction, type Pageable } from '@/common/model/query';

const { t } = useI18n() || {};
const searchTerm = inject('searchTerm', ref(''));
const searchTermUpdate = inject('updateSearchTerm', (value: string) => void {});
const pageable = reactive<Pageable>({
  page: 0,
  size: DEFAULT_PAGE_SIZE,
  sort: [
    {
      property: 'server',
      direction: Direction.ASC,
    },
  ],
});
const searchParams = reactive({
  keyword: '',
  pageable: pageable,
});

const searchKeyword = ref('');
const totalRecords = ref(0);
const getEmailConfigurationLoading = ref(true);
const emailConfigurations = ref<any[]>([]);
const dataTable = ref(null);
const canLoadMore = ref(true);
const isLoadMore = ref(true);
const loadingMore = ref(false);
const selectedRow = ref();
const {
  onResult: getEmailConfigurationResult,
  onError: getEmailConfigurationError,
  refetch: getEmailConfigurationRefetch,
  variables: getEmailConfigurationVariable,
} = getEmailConfigurationGraphql(searchParams);

getEmailConfigurationResult((result) => {
  const {
    totalCount,
    edges
  } = get(result, 'data.emailConfigurations', {
    totalCount: 0,
    edges: [],
  });
  totalRecords.value = totalCount;
  if (isLoadMore.value) {
    emailConfigurations.value = [
      ...emailConfigurations.value,
      ...edges.map((edge: EmailConfigurationEdge) => ({ ...edge.node })),
    ];
  } else {
    emailConfigurations.value = edges.map((edge: EmailConfigurationEdge) => ({ ...edge.node, }));
  }
  canLoadMore.value = edges.length >= DEFAULT_PAGE_SIZE;
  loadingMore.value = false;
  isLoadMore.value = false;
});

function scrollEvent(event: any) {
  const {
    scrollTop,
    scrollHeight,
    clientHeight
  } = event.target;
  if (
    scrollTop + clientHeight + 1 >= scrollHeight
    && !loadingMore.value
    && canLoadMore.value
  ) {
    isLoadMore.value = true;
    loadingMore.value = true;
    searchParams.pageable.page += 1;
  }
}

function addScrollEventListener(selector: string) {
  const scrollableContainer = document.querySelector(selector);
  if (scrollableContainer) {
    scrollableContainer.addEventListener('scroll', scrollEvent);
  }
}

onMounted(() => {
  addScrollEventListener('.p-datatable-wrapper');
});

getEmailConfigurationError((error) => {
  getEmailConfigurationLoading.value = false;
  toastErrorData({
    prefix: 'admin.emailConfiguration.errors',
    error,
  });
});

function searchDatatable() {
  assign(searchParams, {
    keyword: searchKeyword.value,
    pageable: { page: 0 },
  });

  reload();
}

function reload() {
  searchParams.pageable.page = 0;
  assign(emailConfiguration.value, new EmailConfiguration());
  getEmailConfigurationRefetch(searchParams);
}

function onPage(event: { page: number; rows: number }) {
  const {
    page,
    rows
  } = event;
  assign(pageable, {
    page,
    size: rows,
  });
  assign(searchParams, pageable);
  reload();
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
        direction: sortOrder === 1 ? 'ASC' : 'DESC',
      },
    ],
  });
  assign(searchParams, pageable);
  reload();
}

function createEmailConfiguration() {
  emailConfigurationFormVisible.value = true;
}

function editEmailConfiguration() {
  emailConfigurationFormVisible.value = true;
}

function hideEmailConfigurationFormDialog() {
  emailConfigurationFormVisible.value = false;
  assign(emailConfiguration.value, new EmailConfiguration());
  searchParams.keyword = '';
  searchTermUpdate('');
}

const menuAction = ref();
const menuActions = [
  {
    label: t('common.edit'),
    icon: 'edit',
    command: () => {
      editEmailConfiguration();
    },
  },
  {
    label: t('common.delete'),
    icon: 'delete',
    command: () => {
      deleteEmailConfiguration();
    },
  },
];

function toggleActionMenu({
  event,
  data,
}: {
  event: Event;
  data: EmailConfigurationInterface;
}) {
  menuAction.value.toggle(event);
  emailConfiguration.value = cloneDeep(data);
  selectedRow.value = data;
}

const emailConfiguration = ref<EmailConfigurationInterface>(
  new EmailConfiguration(),
);
const emailConfigurationFormVisible = ref(false);

const {
  mutate: deleteEmailConfigurationMutate,
  onDone: deleteEmailConfigurationDone,
  onError: deleteEmailConfigurationError,
} = deleteEmailConfigurationGraphql();

const confirm = useConfirm();

function deleteEmailConfiguration() {
  confirm.require({
    message: t('common.confirmDelete', {
      itemType: t('admin.emailConfiguration.objectName'),
      itemName: emailConfiguration.value.name,
    }),
    header: t('common.confirm'),
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: t('common.delete'),
    acceptClass: 'p-button-danger',
    accept: () => {
      deleteEmailConfigurationMutate({ id: emailConfiguration.value.id });
    },
  });
}

deleteEmailConfigurationDone(() => {
  toastSuccess({
    message: t('common.result.message.deleted', {
      itemType: t('admin.emailConfiguration.objectName'),
      itemName: emailConfiguration.value.name,
    }),
  });
  confirm.close();
  reload();
});

deleteEmailConfigurationError((error) => {
  toastErrorData({ error });
});

watch(searchTerm, (newValue) => {
  emailConfigurations.value = [];
  searchParams.keyword = newValue;
  searchParams.pageable.page = 0;
  getEmailConfigurationVariable.value = searchParams;
});
</script>

<script lang='ts'>
export default { name: 'EmailConfigurationManager' };
</script>
