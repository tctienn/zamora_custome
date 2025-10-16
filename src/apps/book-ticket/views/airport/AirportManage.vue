<template>
  <Toolbar class='mb-2 p-0'>
    <template #start>
      <div class='align-items-center flex gap-2'>
        <div class='font-bold ml-3'>
          {{ t(`media.common.list`) }} {{ t(`book-ticket.menu.bookTicketAirport`) }}
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
    :value='airport'>
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
      :header='t(`book-ticket.airport.code`)'></Column>
    <Column
      class='col-2'
      field='name'
      :header='t(`book-ticket.airport.name`)'></Column>
    <Column
      class='col-1'
      field='countryName'
      :header='t(`book-ticket.airport.countryId`)'>
    </Column>
    <Column
      class='col-1'
      field='cityName'
      :header='t(`book-ticket.airport.cityId`)'>
    </Column>
    <Column
      class='col-1 text-center'
      field='isDefault'
      :header="t('book-ticket.common.default')">
      <template #body='{ data: { isDefault } }'>
        <AppIcon
          class='my-bold-icon'
          :class="isDefault ? 'text-green-600' : 'text-red-500'"
          :name="isDefault ? 'check' : 'close'"
          size='1.8'/>
      </template>
    </Column>
    <Column
      class='col-1 text-center'
      field='status'
      :header="t('common.status')">
      <template #body='{ data: { status } }'>
        <span
          class='status-badge'
          :class="`status-${status ? 'active' : 'deactivate'}`">{{
            t(`common.statuses.${status ? 'active' : 'deactivate'}`)
          }}</span>
      </template>
    </Column>
    <Column
      class='text-center'
      :header="t('common.action')"
      style='width: 4%'>
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

  <AirportForm
    v-if='showForm'
    :id='selectedRow?.id'
    :is-detail='isDetail'
    :visible-dialog='showForm'
    @hide-dialog='hideDialogFn'/>
</template>

<script setup lang='ts'>
import { get } from 'lodash';
import { useConfirm } from 'primevue/useconfirm';
import { inject, nextTick, onMounted, reactive, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { DEFAULT_DATATABLE_CONFIG, DEFAULT_PAGE_SIZE, } from '@/common/constants';
import { toastSuccess } from '@/common/helpers/custom-toast-service';

import { deleteAirport, searchAirport } from '../../api/graphql/airport';
import type { IAirport } from '../../model/airport';
import AirportForm from './AirportForm.vue';

const { t } = useI18n();
const searchTerm = inject('searchTerm', ref(''));
const showForm = ref<boolean>(false);
const airport = ref<IAirport[]>([]);
const selectedRow = ref<IAirport>();
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
  onResult: getAirportResult,
  refetch: getAirportRefetch,
  onError: getAirportError
} =
  searchAirport(searchParams);

watch(searchTerm, (newValue) => {
  searchParams.searchInput.textSearch = newValue;
  isLoading.value = true;
  getAirportRefetch(searchParams);
});

const {
  mutate: deleteAirportMutate,
  onDone: deleteAirportOnDone
} =
  deleteAirport();

function showFormCreate() {
  selectedRow.value = undefined;
  showForm.value = true;
}

getAirportResult((res) => {
  const {
    totalRecords,
    content
  } = get(res, 'data.searchAirport', {
    totalRecords: 0,
    content: [],
  });

  console.log(totalRecords);
  
  totalRecord.value = totalRecords;
  if (isLoadMore.value) {
    airport.value = [
      ...airport.value,
      ...content,
    ];
  } else {
    airport.value = content;
  }
  canLoadMore.value = content.length >= DEFAULT_PAGE_SIZE;
  isLoadMore.value = false;
  isLoading.value = false;
});

getAirportError(()=>{
  isLoading.value = false;
});

function toggleActionMenu(event: Event, data: IAirport) {
  menuRef.value.toggle(event);
  selectedRow.value = data;
}

const hideDialogFn = () => {
  isDetail.value = false;
  showForm.value = false;
  getAirportRefetch();
};

function reload() {
  searchParams.searchInput.textSearch = '';
  searchParams.pageable.page = 0;
  isLoading.value = true;
  getAirportRefetch(searchParams);
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
    message: t('common.confirmDelete', { itemName: selectedRow.value?.name }),
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
  deleteAirportMutate({ id: selectedRow.value?.id });
};

deleteAirportOnDone(() => {
  toastSuccess({ message: t('Xóa thành công') });
  reload();
});
</script>

<style scoped>
:deep(.p-column-header-content) {
  display: inline-block;
}
</style>