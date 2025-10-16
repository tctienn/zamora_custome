<template>
  <div class='align-items-center flex flex-wrap justify-content-between mb-2'>
    <span class='font-bold text-primary text-xl'>{{
      t('document.bookNumReserve.bookNumReserveList')
    }}</span>
    <div class='block p-input-icon-left'>
      <div class='actions flex gap-2'>
        <ButtonIcon
          class='btn-create'
          icon='add'
          :label="t('common.create')"
          @click='showBookNumReserveForm'/>
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
    :value='bookNumReserves'
    v-bind='DEFAULT_DATATABLE_CONFIG'>
    <template #empty>
      <span class='block font-bold text-600 text-center'>{{
        t('common.emptyRecords', {
          itemType: toLower(t('document.bookNumReserve.objectName')),
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
      field='bookDate'
      :header="t('document.bookNumReserve.registerDate')">
      <template #body='{ data: { bookDate } }'>
        {{ moment(bookDate).format('DD/MM/YYYY') }}
      </template>
    </Column>

    <Column
      field='bookId'
      :header="t('document.bookNumReserve.bookName')">
      <template #body='{ data }'>
        {{ findNameById(data.bookId, books) }}
      </template>
    </Column>

    <Column
      field='bookType'
      :header="t('document.bookNumReserve.bookType')">
      <template #body='{ data }'>
        {{ findNameById(data.bookType, docTypes) }}
      </template>
    </Column>

    <Column
      field='bookNumber'
      :header="t('document.bookNumReserve.bookNum')"
      style='width: 30%'>
      <template #body='{ data }'>
        <div class='flex gap-2 justify-content-center'>
          <div
            v-for='(num, index) in data?.bookNumberUsed'
            :key='index'
            class='num-used'>
            {{ num }}
          </div>
          <div
            v-for='(num, index) in [
              ...(data.bookNumber?.filter(
                (x: string) => !data.bookNumberUsed?.includes(x),
              ) || []),
              ...(data.bookNumberUsed?.filter(
                (x: string) => !data.bookNumber?.includes(x),
              ) || []),
            ]'
            :key='index'
            class='num-not-used'>
            {{ num }}
          </div>
        </div>
      </template>
    </Column>

    <Column
      field='requestUserId'
      :header="t('document.bookNumReserve.registerUser')">
      <template #body='{ data }'>
        <div class='flex justify-content-center'>
          <AppUser
            avatar-size='2.5'
            info-visible
            :infos="['positionName', 'organizationName']"
            name-visible
            :user-id='data?.requestUserId'/>
        </div>
      </template>
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

  <BookNumReserveForm
    v-if='bookNumReserveFormVisible'
    :id='selectedRow?.id'
    :visible-dialog='bookNumReserveFormVisible'
    @hide-dialog='hideBookNumReserveFormDialog'
    @reload='reload'/>
</template>

<script setup lang='ts'>
import { get, toLower } from 'lodash';
import Column from 'primevue/column';
import { useConfirm } from 'primevue/useconfirm';
import { inject, onMounted, reactive, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { getAllBook } from '@/apps/document/api/graphql/book';
import { deleteBookNumReserve, searchBookNumReserve, } from '@/apps/document/api/graphql/book-num-reserve';
import { getAllDocType } from '@/apps/document/api/graphql/doc-type';
import type { BookInterface } from '@/apps/document/model/book';
import type { BookNumReserveEdge, BookNumReserveInterface, } from '@/apps/document/model/bookNumReserve';
import BookNumReserveForm from '@/apps/document/views/admin/component/BookNumReserveForm.vue';
import { DEFAULT_DATATABLE_CONFIG, DEFAULT_PAGE_SIZE, } from '@/common/constants';
import { toastSuccess } from '@/common/helpers/custom-toast-service';
import useMoment from '@/common/helpers/mixins/use-moment';
import { Direction, type Pageable } from '@/common/model/query';

const { t } = useI18n() || {};
const bookNumReserves = ref<BookNumReserveInterface[]>([]);
const bookNumReserveFormVisible = ref(false);
const canLoadMore = ref(true);
const isLoadMore = ref(true);
const loadingMore = ref(false);
const selectedRow = ref();
const searchTerm = inject('searchTerm', ref(''));
const searchTermUpdate = inject('updateSearchTerm', (value: string) => void {});
const books = ref<BookInterface[]>([]);
const docTypes = ref();
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
  onResult: searchBookNumReserveResult,
  refetch: searchBookNumReserveRefetch,
} = searchBookNumReserve(searchParams);

searchBookNumReserveResult((res) => {
  const {
    totalCount,
    edges
  } = get(res, 'data.searchBookNumReserve', {
    totalCount: 0,
    edges: [],
  });
  totalRecords.value = totalCount;
  if (isLoadMore.value) {
    bookNumReserves.value = [
      ...bookNumReserves.value,
      ...edges.map((edge: BookNumReserveEdge) => ({ ...edge.node })),
    ];
  } else {
    bookNumReserves.value = edges.map((edge: BookNumReserveEdge) => ({ ...edge.node, }));
  }

  canLoadMore.value = edges.length >= DEFAULT_PAGE_SIZE;
  loadingMore.value = false;
  isLoadMore.value = false;
});

function findNameById(id: string, arr: any) {
  return arr?.find((item: any) => item.id === id)?.name;
}

function toggleActionMenu({
  event,
  data,
}: {
  event: Event;
  data: BookNumReserveInterface;
}) {
  menuAction.value.toggle(event);
  selectedRow.value = data;
}

function showBookNumReserveForm() {
  bookNumReserveFormVisible.value = true;
}

function reload() {
  searchParams.keyword = '';
  searchParams.pageable.page = 0;
  selectedRow.value = undefined;
  searchBookNumReserveRefetch();
}

function hideBookNumReserveFormDialog() {
  bookNumReserveFormVisible.value = false;
  searchParams.keyword = '';
  searchTermUpdate('');
  selectedRow.value = undefined;
  reload();
}

const menuAction = ref();
const menuActions = [
  {
    label: t('common.edit'),
    icon: 'edit',
    command: () => {
      bookNumReserveFormVisible.value = true;
    },
  },
  {
    label: t('common.delete'),
    icon: 'delete',
    command: () => {
      handleDeleteBookNumReserve();
    },
  },
];

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

const { onResult: getBookResult } = getAllBook();
const { onResult: getDocTypeResult } = getAllDocType();
getBookResult((res) => {
  books.value = res.data.getAllBook.map((item: BookInterface) => ({
    name: item.bookName,
    id: item.id,
  }));
});

getDocTypeResult((res) => {
  docTypes.value = res.data.getAllDocType;
});

const {
  mutate: deleteBookNumReserveMutate,
  onDone: deleteBookNumReserveDone
} =
  deleteBookNumReserve();
const confirm = useConfirm();

function handleDeleteBookNumReserve() {
  confirm.require({
    message: t('document.bookNumReserve.confirmDelete'),
    header: t('common.confirm'),
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: t('common.delete'),
    acceptClass: 'p-button-danger',
    accept: () => {
      deleteBookNumReserveMutate({ id: selectedRow.value.id });
    },
  });
}

deleteBookNumReserveDone(() => {
  toastSuccess({ message: t('document.bookNumReserve.deleteDone') });
  reload();
});
</script>

<style scoped>
.num-not-used {
  border-radius: 30%;
  width: max-content;
  padding: 15px 10px;
  height: 20px;
  background: #f36f24;
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
}

.num-used {
  border-radius: 30%;
  width: max-content;
  padding: 15px 10px;
  height: 20px;
  background: #94c748;
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
