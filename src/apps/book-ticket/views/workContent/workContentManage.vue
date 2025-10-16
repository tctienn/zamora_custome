<template>
  <Toolbar class='mb-2 p-0'>
    <template #start>
      <div class='align-items-center flex gap-2'>
        <div class='font-bold ml-3'>
          {{ t(`media.common.list`) }} {{ t(`book-ticket.menu.bookTicketWorkContent`) }}
        </div>
      </div>
    </template>
    <template #end>
      <div class='btn-group-toolbar flex gap-1 mr-1 my-1'>
        <Button
          class='btn-create focus:shadow-none font-medium p-2'
          icon='pi pi-plus'
          :label='t("common.create")'
          @click='showFormCreate'>
        </Button>
      </div>
    </template>
  </Toolbar>

  <DataTable
    v-bind='DEFAULT_DATATABLE_CONFIG'
    v-model:selection='selectedRow'
    :loading = 'isLoading'
    :pt="{
      wrapper: {
        class: 'h-full surface-overlay',
      },
    }"
    row-hover
    :total-records='totalRecord'
    :value='workContent'>
    <Column
      class='text-center'
      header='TT'
      style='width: 2%'>
      <template #body='slotProps'>
        <div
          class='align-items-center flex items-center justify-content-center'>
          {{ slotProps.index + 1 }}
        </div>
      </template>
    </Column>

    <Column
      class='col-1'
      field='code'
      :header='t(`book-ticket.workContent.code`)'></Column>
    <Column
      class='col-2'
      field='content'
      :header='t(`book-ticket.workContent.content`)'></Column>
    <Column
      class='col-1'
      field='timeForm'
      :header='t(`book-ticket.workContent.timeFrom`)'>
      <template #body='{data: {timeFrom}}'>
        {{ timeFrom ? moment(timeFrom).format('DD/MM/YYYY') : '' }}
      </template>
    </Column>
    <Column
      class='col-1'
      field='timeTo'
      :header='t(`book-ticket.workContent.timeTo`)'>
      <template #body='{data: {timeTo}}'>
        {{ timeTo ? moment(timeTo).format('DD/MM/YYYY') : '' }}
      </template>
    </Column>
    <Column
      class='text-center'
      :header="t('common.action')"
      style='width: 2%'>
      <template #body='{ data }'>
        <ButtonIcon
          v-tooltip.top="t('common.action')"
          class='text-color'
          icon='more_horiz'
          icon-size='1.7'
          rounded
          text
          @click='toggleActionMenu($event, data)'/>
      </template>
    </Column>
  </DataTable>

  <Menu
    ref='menuRef'
    :model='menuActions'
    :popup='true'>
    <template #item='{ item: { icon, label } }'>
      <MenuItem
        :icon='icon'
        :label='label'/>
    </template>
  </Menu>

  <WorkContentForm
    v-if='showForm'
    :id='selectedRow?.id'
    :is-detail='isDetail'
    :visible-dialog='showForm'
    @hide-dialog='hideDialogFn'/>
</template>

<script setup lang='ts'>
import { get } from 'lodash';
import moment from 'moment';
import { useConfirm } from 'primevue/useconfirm';
import { inject, nextTick, onMounted, reactive, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { DEFAULT_DATATABLE_CONFIG, DEFAULT_PAGE_SIZE, } from '@/common/constants';
import { toastSuccess } from '@/common/helpers/custom-toast-service';

import { deleteWorkContent, searchWorkContent } from '../../api/graphql/work-content';
import type { IWorkContent } from '../../model/workContent';
import WorkContentForm from './workContentForm.vue';

const { t } = useI18n();
const searchTerm = inject('searchTerm', ref(''));
const showForm = ref<boolean>(false);
const workContent = ref<IWorkContent[]>([]);
const selectedRow = ref<IWorkContent>();
const totalRecord = ref<number>();
const isDetail = ref<boolean>(false);
const confirm = useConfirm();
const canLoadMore = ref<boolean>(true);
const isLoadMore = ref<boolean>(true);
const isLoading = ref<boolean>(true);
const menuRef = ref();
const pageable = reactive({
  page: 0,
  size: DEFAULT_PAGE_SIZE
});

const searchInput = reactive({ textSearch: '' });
const searchParams = reactive({
  searchInput: searchInput,
  pageable: pageable,
});
const {
  onResult: getWorkContentResult,
  refetch: getWorkContentRefetch,
  onError: getWorkContentError
} =
  searchWorkContent(searchParams);

watch(searchTerm, (newValue) => {
  searchParams.searchInput.textSearch = newValue;
  isLoading.value = true;
  getWorkContentRefetch(searchParams);
});

const {
  mutate: deleteWorkContentMutate,
  onDone: deleteWorkContentOnDone
} =
  deleteWorkContent();

function showFormCreate() {
  selectedRow.value = undefined;
  showForm.value = true;
}

getWorkContentResult((res) => {
  const {
    totalRecords,
    content
  } = get(res, 'data.searchWorkContent', {
    totalRecords: 0,
    content: [],
  });

  console.log(totalRecords);
  
  totalRecord.value = totalRecords;
  if (isLoadMore.value) {
    workContent.value = [
      ...workContent.value,
      ...content,
    ];
  } else {
    workContent.value = content;
  }
  canLoadMore.value = content.length >= DEFAULT_PAGE_SIZE;
  isLoadMore.value = false;
  isLoading.value = false;
});

getWorkContentError(()=>{
  isLoading.value = false;
});

function toggleActionMenu(event: Event, data: IWorkContent) {
  menuRef.value.toggle(event);
  selectedRow.value = data;
}

const hideDialogFn = () => {
  isDetail.value = false;
  showForm.value = false;
  getWorkContentRefetch();
};

function reload() {
  searchParams.searchInput.textSearch = '';
  searchParams.pageable.page = 0;
  isLoading.value = true;
  getWorkContentRefetch(searchParams);
}

function scrollEvent(event: Event) {
  const {
    scrollTop,
    scrollHeight,
    clientHeight
  } = event.target as HTMLElement;
  if (scrollTop + clientHeight + 1 >= scrollHeight && canLoadMore.value) {
    isLoadMore.value = true;
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
  nextTick(() => {
    addScrollEventListener('.p-datatable-wrapper');
  });
});

interface MenuAction{
  key: string;
  label: string;
  icon: string;
  command: () => void;
  disabled?: boolean;
};

const menuActions:MenuAction[] = [
  {
    key: 'edit',
    label: t('common.edit'),
    icon: 'edit',
    command: () => {
      showForm.value = true;
    },
  },
  {
    key: 'delete',
    label: t('common.delete'),
    icon: 'delete',
    command: () => {
      confirmDeleteMedia();
    },
  },
];

const confirmDeleteMedia = () => {
  confirm.require({
    message: t('common.confirmDelete', { itemName: selectedRow.value?.content }),
    header: t('common.delete'),
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: t('common.delete'),
    acceptClass: 'p-button-danger',
    rejectLabel: t('common.cancel'),
    accept: () => {
      handleDeleteVehicle();
    },
  });
};

const handleDeleteVehicle = () => {
  deleteWorkContentMutate({ id: selectedRow.value?.id });
};

deleteWorkContentOnDone(() => {
  toastSuccess({ message: t('Xóa thành công') });
  reload();
});
</script>

<style scoped>
:deep(.p-column-header-content) {
  display: inline-block;
}
</style>