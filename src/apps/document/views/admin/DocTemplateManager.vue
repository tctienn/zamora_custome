<template>
  <div class='align-items-center flex flex-wrap justify-content-between mb-2'>
    <span class='font-bold text-primary text-xl'>{{
      t('document.docTemplate.docTemplateList')
    }}</span>
    <div class='block p-input-icon-left'>
      <div class='actions flex gap-2'>
        <ButtonIcon
          class='btn-create'
          icon='add'
          :label="t('common.create')"
          @click='showDocTemplateForm'/>
        <ButtonIcon
          icon='restart_alt'
          outlined
          @click='reload'/>
      </div>
    </div>
  </div>

  <DataTable
    v-model:selection='selectedRow'
    class='w-full'
    :total-records='totalRecords'
    :value='docTemplate'
    v-bind='DEFAULT_DATATABLE_CONFIG'>
    <template #empty>
      <span class='block font-bold text-600 text-center'>{{
        t('common.emptyRecords', {
          itemType: toLower(t('document.docTemplate.objectName')),
        })
      }}</span>
    </template>

    <Column
      class='text-center'
      header='#'
      style='max-width: 5%'>
      <template #body='slotProps'>
        {{ slotProps.index + 1 }}
      </template>
    </Column>

    <Column
      class='text-center'
      field='signal'
      :header="t('document.docTemplate.signal')"></Column>

    <Column
      field='docTemplateName'
      :header="t('document.docTemplate.docTemplateName')">
    </Column>

    <Column
      class='text-center'
      field='docTemplateType'
      :header="t('document.docTemplate.docTemplateType')">
      <template #body='{ data }'>
        {{
          data.docTemplateType === 'DOC'
            ? t('document.docTemplate.doc')
            : t('document.docTemplate.contract')
        }}
      </template>
    </Column>

    <Column
      class='text-center'
      field='createdTime'
      :header="t('work.taskImport.createdTime')">
      <template #body='{ data }'>
        {{ moment(data.createdTime).format('DD/MM/YYYY') }}
      </template>
    </Column>

    <Column
      field='createdBy'
      :header="t('work.taskImport.createdBy')">
      <template #body='{ data }'>
        <div class='flex justify-content-center'>
          <AppUser
            avatar-size='2.5'
            info-visible
            :infos="['positionName', 'organizationName']"
            name-visible
            :user-id='data?.createdBy'/>
        </div>
      </template>
    </Column>

    <Column
      field='description'
      :header="t('document.docTemplate.description')"
      style='width: 25%'>
    </Column>

    <Column
      class='text-center'
      :header="t('common.action')"
      header-style='width: 10%'>
      <template #body='{ data }'>
        <ButtonIcon
          v-tooltip.top="t('common.action')"
          class='text-color'
          icon='more_horiz'
          icon-size='1.7'
          rounded
          text
          @click='toggleActionMenu({ event: $event, data: data })'/>
      </template>
    </Column>
  </DataTable>
  <Menu
    ref='menuAction'
    :model='menuActions'
    :popup='true'>
    <template #item='{ item: { icon, label } }'>
      <MenuItem
        :icon='icon'
        :label='label'/>
    </template>
  </Menu>

  <DocTemplateForm
    v-if='docTemplateFormVisible'
    :id='selectedRow?.id'
    :visible-dialog='docTemplateFormVisible'
    @hide-dialog='hideDocTemplateFormDialog'
    @reload='reload'/>
</template>

<script setup lang='ts'>
import { get, toLower } from 'lodash';
import Column from 'primevue/column';
import { useConfirm } from 'primevue/useconfirm';
import { inject, onMounted, reactive, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { deleteDocTemplate, searchDocTemplateByKeyword, } from '@/apps/document/api/graphql/doc-template';
import type { DocTemplateEdge, DocTemplateInterface, } from '@/apps/document/model/docTemplate';
import DocTemplateForm from '@/apps/document/views/admin/component/DocTemplateForm.vue';
import { DEFAULT_DATATABLE_CONFIG, DEFAULT_PAGE_SIZE, } from '@/common/constants';
import { toastSuccess } from '@/common/helpers/custom-toast-service';
import useMoment from '@/common/helpers/mixins/use-moment';
import { Direction, type Pageable } from '@/common/model/query';

const { t } = useI18n() || {};
const docTemplate = ref<DocTemplateInterface[]>([]);
const docTemplateFormVisible = ref(false);
const canLoadMore = ref(true);
const isLoadMore = ref(true);
const loadingMore = ref(false);
const selectedRow = ref();
const searchTerm = inject('searchTerm', ref(''));
const searchTermUpdate = inject('updateSearchTerm', (value: string) => void {});
const { moment } = useMoment();
const pageable = reactive<Pageable>({
  page: 0,
  size: DEFAULT_PAGE_SIZE,
  sort: [
    {
      property: 'createdTime',
      direction: Direction.DESC,
    },
  ],
});
const searchParams = reactive({
  keyword: '',
  pageable: pageable,
});
const totalRecords = ref(0);
const {
  onResult: searchDocTemplateResult,
  refetch: searchDocTemplateRefetch
} =
  searchDocTemplateByKeyword(searchParams);

searchDocTemplateResult((res) => {
  const {
    totalCount,
    edges
  } = get(res, 'data.searchDocTemplateByKeyword', {
    totalCount: 0,
    edges: [],
  });
  totalRecords.value = totalCount;
  if (isLoadMore.value) {
    docTemplate.value = [
      ...docTemplate.value,
      ...edges.map((edge: DocTemplateEdge) => ({ ...edge.node })),
    ];
  } else {
    docTemplate.value = edges.map((edge: DocTemplateEdge) => ({ ...edge.node, }));
  }

  canLoadMore.value = edges.length >= DEFAULT_PAGE_SIZE;
  loadingMore.value = false;
  isLoadMore.value = false;
});

function toggleActionMenu({
  event,
  data,
}: {
  event: Event;
  data: DocTemplateInterface;
}) {
  menuAction.value.toggle(event);
  selectedRow.value = data;
}

function reload() {
  searchParams.keyword = '';
  searchParams.pageable.page = 0;
  selectedRow.value = undefined;
  searchDocTemplateRefetch();
}

const menuAction = ref();
const menuActions = [
  {
    label: t('common.edit'),
    icon: 'edit',
    command: () => {
      docTemplateFormVisible.value = true;
    },
  },
  {
    label: t('common.delete'),
    icon: 'delete',
    command: () => {
      handleDeleteDocTemplate();
    },
  },
];

function showDocTemplateForm() {
  docTemplateFormVisible.value = true;
}

function hideDocTemplateFormDialog() {
  docTemplateFormVisible.value = false;
  reload();
}

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

const {
  mutate: deleteDocTemplateMutate,
  onDone: deleteDocTemplateDone
} =
  deleteDocTemplate();
const confirm = useConfirm();

function handleDeleteDocTemplate() {
  confirm.require({
    message: t('document.docTemplate.confirmDelete'),
    header: t('common.confirm'),
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: t('common.delete'),
    acceptClass: 'p-button-danger',
    accept: () => {
      deleteDocTemplateMutate({ id: selectedRow.value.id });
    },
  });
}

deleteDocTemplateDone(() => {
  toastSuccess({ message: t('document.docTemplate.deleteDone') });
  reload();
});
</script>

<style scoped></style>
