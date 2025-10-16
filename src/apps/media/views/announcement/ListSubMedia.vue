<template>
  <Dialog
    v-model:visible='visible'
    :header='
      t(`media.common.${lowerCase(props.mediaType)}.chooseSubAnnouncement`)
    '
    v-bind='DEFAULT_DIALOG_CONFIG'
    @hide="emits('hide-dialog')">
    <div class='align-items-center flex flex-wrap justify-content-between mb-2'>
      <InputText
        v-model='searchKeyword'
        class='overflow-auto w-full'
        :placeholder="t('common.search')"
        @keyup.enter='searchDatatable'/>
    </div>
    <DataTable
      ref='dataTable'
      v-model:selection='selectedAnnouncement'
      data-key='id'
      scroll-height='60vh'
      selection-mode='multiple'
      table-style='min-width: 40rem'
      :value='announcements'
      @page='onPage($event)'>
      <Column
        body-style='text-align: center'
        header-style='text-align: center'
        selection-mode='multiple'></Column>
      <Column
        field='title'
        :header="t('media.common.table.title')"></Column>
      <Column
        body-style='text-align: center'
        field='publishDate'
        :header="t('media.common.table.createdTime')">
        <template #body='{ data: { publishDate } }'>
          {{ formatDate(publishDate) }}
        </template>
      </Column>
    </DataTable>
    <template #footer>
      <div class='flex flex-row gap-2 justify-content-center'>
        <Button
          icon='pi pi-times'
          :label="t('common.close')"
          severity='danger'
          @click="emits('hide-dialog')"/>
        <Button
          :disabled='selectedAnnouncement?.length == 0'
          icon='pi pi-check'
          :label="t('common.save')"
          @click='submitFormFn'/>
      </div>
    </template>
  </Dialog>
</template>

<script lang="ts" setup>
import { assign, get, lowerCase, throttle } from 'lodash';
import moment from 'moment/moment';
import { onMounted, type PropType, reactive, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { getMediasByIdNot } from '@/apps/media/graphql/media';
import { type IMedia, MediaType } from '@/apps/media/model/media';
import { DEFAULT_DIALOG_CONFIG } from '@/common/constants';
import type { NotificationEdge } from '@/common/model/notification';
import { Direction, type Pageable } from '@/common/model/query';

const props = defineProps({
  visibleDialog: {
    type: Boolean,
    default: false,
  },
  announcementId: {
    type: String,
    default: null,
  },
  subList: {
    type: Array as PropType<IMedia[]>,
    default: () => [],
  },
  mediaType: {
    type: String as PropType<MediaType>,
    default: null,
  },
});
const emits = defineEmits(['hide-dialog', 'update:list-announcement']);

const dataTable = ref(null);
const selectedAnnouncement = ref<IMedia[]>(props.subList);
const { t } = useI18n();
const announcements = ref<any[]>([]);
const totalRecords = ref(0);
const searchKeyword = ref();
const visible = ref(props.visibleDialog);
const pageable = reactive<Pageable>({
  page: 0,
  size: 99999,
  sort: [
    {
      property: 'title',
      direction: Direction.DESC,
    },
  ],
});

const searchParams = reactive({
  type: props.mediaType,
  id: props.announcementId,
  searchKeyword: '',
  pageable: pageable,
});
const { refetch, onResult, variables } = getMediasByIdNot(searchParams);

onResult((response) => {
  const { totalCount, edges } = get(response, 'data.getMediasByIdNot', {
    totalCount: 0,
    edges: [],
  });

  announcements.value = [
    ...announcements.value,
    ...edges.map((edge: NotificationEdge) => edge.node),
  ];

  totalRecords.value = totalCount;
});

onMounted(() => {
  addScrollEventListener('.p-datatable-wrapper');
});

function searchDatatable() {
  assign(searchParams, {
    keyword: searchKeyword.value,
    pageable: {
      page: 0,
      size: 99999,
    },
  });
  announcements.value = [];

  variables.value = {
    ...searchParams,
    searchKeyword: searchKeyword.value,
  };
}

function addScrollEventListener(selector: string) {
  const scrollableContainer = document.querySelector(selector);

  if (scrollableContainer) {
    scrollableContainer.addEventListener('scrollend', throttle(scroll, 2000));
  }
}

function onPage(event: { page: number; rows: number }) {
  const { page, rows } = event;
  assign(pageable, {
    page,
    size: rows,
  });
  assign(searchParams, pageable);
  reload();
}

function scroll(e: Event) {
  e.target instanceof HTMLElement
    && e.target.scrollHeight - e.target.scrollTop - 100 <= e.target.clientHeight
    && morAnnouncement();
}

function morAnnouncement() {
  if (announcements.value.length >= totalRecords.value) {
    return;
  }
  pageable.page++;
  reload();
}

function reload() {
  refetch(searchParams);
}

function submitFormFn() {
  emits('hide-dialog');
  emits('update:list-announcement', selectedAnnouncement.value);
}

function formatDate(date: Date) {
  if (date) {
    const m = moment(date);
    return m.format('DD-MM-YYYY HH:mm:ss');
  }
  return '';
}
</script>

<script lang="ts">
export default { name: 'ListSubAnnouncement' };
</script>

<style scoped></style>
