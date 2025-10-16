<template>
  <Toolbar class='h-3rem mb-2 px-2 py-0 surface-0'>
    <template #start>
      <div class='align-items-center flex gap-2'>
        <div class='font-bold'>
          {{ t('admin.emailTemplate.tableTitle') }}
        </div>
      </div>
    </template>
    <template #end>
      <div class='align-content-center btn-group-toolbar flex flex-wrap gap-3 h-3rem mr-1 my-auto'>
        <ButtonIcon
          class='btn-create focus:shadow-none font-medium p-2'
          icon='add'
          :label="t('common.create')"
          @click='createEmailTemplate'/>

      </div>
    </template>
  </Toolbar>

  <div class='h-full surface-0'>
    <DataTable
      v-model:selection='selectedRow'
      :total-records='totalRecords'
      :value='emailTemplates'
      v-bind='DEFAULT_DATATABLE_CONFIG'
      @sort='onSort($event)'>
      <template #empty>
        <span class='block font-bold text-600 text-center'>{{
          t('common.emptyRecords', {
            itemType: toLower(t('admin.emailTemplate.objectName')),
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
        field='subject'
        :header="t('admin.emailTemplate.subject')"></Column>

      <Column
        field='type'
        :header="t('admin.emailTemplate.type')">
        <template #body='{ data: { templateType } }'>
          {{ t(`admin.emailTemplate.types.${camelCase(templateType)}`) }}
        </template>
      </Column>

      <Column
        field='isDefault'
        :header="t('common.default')">
        <template #body='{ data: { isDefault } }'>
          <AppIcon
            v-if='isDefault'
            color='var(--primary-color)'
            name='task_alt'/>
        </template>
      </Column>

      <Column
        class='text-center'
        field='status'
        :header="t('common.status')">
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

  <EmailTemplateForm
    v-if='emailTemplateFormVisible'
    :item='emailTemplate'
    :visible-dialog='emailTemplateFormVisible'
    @hide-dialog='hideEmailTemplateFormDialog'
    @reload='reload'/>

  <EmailTemplateForm
    v-if='emailTemplateConfigVisible'
    :item='emailTemplate'
    :visible-dialog='emailTemplateConfigVisible'
    @hide-dialog='hideEmailTemplateFormDialog'
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
  deleteEmailTemplateGraphql,
  getEmailTemplateGraphql,
} from '@/apps/admin/api/graphql/email-template-graphql-api';
import type { EmailTemplateEdge, EmailTemplateInterface, } from '@/apps/admin/model/email-template';
import { EmailTemplate } from '@/apps/admin/model/email-template';
import EmailTemplateForm from '@/apps/admin/views/email-template/EmailTemplateForm.vue';
import MenuItem from '@/common/components/custom/MenuItem.vue';
import { DEFAULT_DATATABLE_CONFIG, DEFAULT_PAGE_SIZE, } from '@/common/constants';
import { toastErrorData, toastSuccess, } from '@/common/helpers/custom-toast-service';
import { Direction, type Pageable } from '@/common/model/query';

const { t } = useI18n() || {};

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
const getEmailTemplateLoading = ref(true);
const emailTemplates = ref<any[]>([]);
const dataTable = ref(null);
const canLoadMore = ref(true);
const isLoadMore = ref(true);
const loadingMore = ref(false);
const selectedRow = ref();
const searchTerm = inject('searchTerm', ref(''));
const searchTermUpdate = inject('updateSearchTerm', (value: string) => void {});

const {
  onResult: getEmailTemplateResult,
  onError: getEmailTemplateError,
  refetch: getEmailTemplateRefetch,
  variables: getEmailTemplateVariable,
} = getEmailTemplateGraphql(searchParams);

getEmailTemplateResult((result) => {
  const {
    totalCount,
    edges
  } = get(result, 'data.emailTemplates', {
    totalCount: 0,
    edges: [],
  });
  totalRecords.value = totalCount;
  if (isLoadMore.value) {
    emailTemplates.value = [
      ...emailTemplates.value,
      ...edges.map((edge: EmailTemplateEdge) => ({ ...edge.node })),
    ];
  } else {
    emailTemplates.value = edges.map((edge: EmailTemplateEdge) => ({ ...edge.node, }));
  }
  canLoadMore.value = edges.length >= DEFAULT_PAGE_SIZE;
  loadingMore.value = false;
  isLoadMore.value = false;
});

getEmailTemplateError((error) => {
  getEmailTemplateLoading.value = false;
  toastErrorData({
    prefix: 'admin.emailTemplate.errors',
    error,
  });
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

function searchDatatable() {
  assign(searchParams, {
    keyword: searchKeyword.value,
    pageable: { page: 0 },
  });

  reload();
}

function reload() {
  searchParams.pageable.page = 0;
  assign(emailTemplate.value, new EmailTemplate());
  getEmailTemplateRefetch(searchParams);
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

function createEmailTemplate() {
  emailTemplateFormVisible.value = true;
}

function editEmailTemplate() {
  emailTemplateFormVisible.value = true;
}

function hideEmailTemplateFormDialog() {
  emailTemplateFormVisible.value = false;
  emailTemplateConfigVisible.value = false;
  assign(emailTemplate.value, new EmailTemplate());
  searchParams.keyword = '';
  searchTermUpdate('');
}

const menuAction = ref();
const menuActions = [
  {
    label: t('common.edit'),
    icon: 'edit',
    command: () => {
      editEmailTemplate();
    },
  },
  {
    label: t('common.delete'),
    icon: 'delete',
    command: () => {
      deleteEmailTemplate();
    },
  },
];

function toggleActionMenu({
  event,
  data,
}: {
  event: Event;
  data: EmailTemplateInterface;
}) {
  menuAction.value.toggle(event);
  emailTemplate.value = cloneDeep(data);
}

const emailTemplate = ref<EmailTemplateInterface>(new EmailTemplate());
const emailTemplateFormVisible = ref(false);
const emailTemplateConfigVisible = ref(false);

const {
  mutate: deleteEmailTemplateMutate,
  onDone: deleteEmailTemplateDone,
  onError: deleteEmailTemplateError,
} = deleteEmailTemplateGraphql();

const confirm = useConfirm();

function deleteEmailTemplate() {
  confirm.require({
    message: t('common.confirmDelete', {
      itemType: t('admin.emailTemplate.objectName'),
      itemName: emailTemplate.value.subject,
    }),
    header: t('common.confirm'),
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: t('common.delete'),
    acceptClass: 'p-button-danger',
    accept: () => {
      deleteEmailTemplateMutate({ id: emailTemplate.value.id });
    },
  });
}

deleteEmailTemplateDone(() => {
  toastSuccess({
    message: t('common.result.message.deleted', {
      itemType: t('admin.email-template.objectName'),
      itemName: emailTemplate.value.subject,
    }),
  });
  confirm.close();
  reload();
});

deleteEmailTemplateError((error) => {
  toastErrorData({ error });
});

watch(searchTerm, (newValue) => {
  emailTemplates.value = [];
  searchParams.keyword = newValue;
  searchParams.pageable.page = 0;
  getEmailTemplateVariable.value = searchParams;
});
</script>

<script lang='ts'>
export default { name: 'EmailTemplateManager' };
</script>
