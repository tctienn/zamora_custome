<template>
  <Toolbar class='mb-2 p-0'>
    <template #start>
      <div class='align-items-center flex gap-2'>
        <div class='font-bold ml-3'>
          {{ t(`media.common.list`) }} {{ t(`book-ticket.bookFlight.titleForm`) }}
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

  <TabView
    v-model:activeIndex='activeStatus'
    @tab-change='tabChange'>
    <TabPanel
      v-for='(tab, index) in tabMenus'
      :key='index'
      class='hover:surface-hover'>
      <template #header>
        <div class='align-items-center flex gap-2'>
          <span class='line-height-3 white-space-nowrap'>{{ tab.label }}</span>
          <Badge
            v-if='tab.count > 0'
            :style='`background-color: ${tab.color}`'
            :value='tab.count'/>
        </div>
      </template>
    </TabPanel>
  </TabView>

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
    :value='bookFlight'
    @sort='onSortChange'>
    <Column
      class='text-center'
      header='TT'
      style='width: 4%; padding: 0;'>
      <template #body='slotProps'>
        <div
          class='align-items-center flex items-center justify-content-center'>
          {{ slotProps.index + 1 }}
        </div>
      </template>
    </Column>

    <Column
      class='col-1 px-2'
      field='requestNumber'
      :header='t(`book-ticket.bookFlight.requestNumber`)'>
    </Column>
    <Column
      class='col-1'
      field='createdDate'
      :header='t(`book-ticket.bookFlight.createdDate`)'>
      <template #body='{data: {createdDate}}'>
        {{ createdDate ? moment(createdDate).format('DD/MM/YYYY') : '' }}
      </template>
    </Column>

    <Column
      class='p-1'
      :header='t("book-ticket.bookFlight.fullName")'>
      <template #body='{data :{officerId}}'>
        <AppUser
          v-if='officerId'
          avatar-size='2.5'
          is-highlight
          name-visible
          overlay-visible
          :user-id='officerId'>
        </AppUser>
      </template>
    </Column>
    <Column
      class='p-0 py-1'
      field='officerId'
      :header='t("book-ticket.bookFlight.departmentName")'
      style='width: 10%; padding: 0;'>
      <template #body='{ data: { officerId } }'>
        <p style='white-space: pre-line'>
          {{ formatDepartment(officerId) }}
        </p>
      </template>
    </Column>
    <Column
      class='col-1 p-0 text-center'
      field='flightType'
      :header='t("book-ticket.bookFlight.flightType")'>
      <template #body='{data: { flightType }}'>
        <p>{{ t(`book-ticket.bookFlight.flightTypeOption.${flightType}`) }}</p>
      </template>
    </Column>
    <Column
      class='col-1 text-center'
      data-type='date'
      field='flightDate'
      :header='t(`book-ticket.bookFlight.table.flightDate`)'
      :sortable='true'>
      <template #body='{data: {flightDate}}'>
        {{ formatDate(flightDate,'DD/MM/YYYY') }}
      </template>
    </Column>
    <Column
      class='col-1 px-2'
      field='departureAirportName'
      :header='t(`book-ticket.bookFlight.table.departureAirportId`)'>
    </Column>
    <Column
      class='col-1'
      field='returnFlightDate'
      :header='t(`book-ticket.bookFlight.table.returnFlightDate`)'
      :sortable='true'>
      <template #body='{data: {returnFlightDate}}'>
        {{ formatDate(returnFlightDate,'DD/MM/YYYY') }}
      </template>
    </Column>
    <Column
      class='col-1 px-2'
      field='airportDepartureReturnName'
      :header='t(`book-ticket.bookFlight.table.airportDepartureReturnId`)'>
    </Column>
    <Column
      class='p-1'
      :header='t("book-ticket.bookFlight.createdBy")'>
      <template #body='{data :{createdBy}}'>
        <div class='flex justify-content-center'>
          <AppUser
            v-if='createdBy'
            avatar-size='2.5'
            is-highlight
            overlay-visible
            :user-id='createdBy'>
          </AppUser>
        </div>
      </template>
    </Column>

    <Column
      class='p-2'
      field='status'
      :header='t(`vehicle.bookingCar.status`)'>
      <template #body='{ data: { status } }'>
        <div class='flex justify-content-center'>
          <Badge
            v-if='status'
            class='capitalize font-semibold py-0 status-badge'
            :style='{ backgroundColor: getColorByStatus(status), color: getTextColorByStatus(status) }'
            :value='t(`book-ticket.bookFlight.statusOption.${status}`)'></Badge>
        </div>
      </template>
    </Column>
    <Column
      class='px-1 text-center'
      style='width: 2%'>
      <template #body='{ data }'>
        <ButtonIcon
          v-tooltip.left="t('common.action')"
          class='text-color'
          icon='more_vert'
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

  <BookFlightForm
    v-if='showForm'
    :id='selectedRow?.id'
    :is-detail='isDetail'
    :visible-dialog='showForm'
    @hide-dialog='hideDialogFn'/>
</template>

<script setup lang='ts'>
import { get } from 'lodash';
import moment from 'moment';
import { storeToRefs } from 'pinia';
import type { DataTableSortEvent } from 'primevue/datatable';
import type { MenuItem } from 'primevue/menuitem';
import { useConfirm } from 'primevue/useconfirm';
import { inject, nextTick, onMounted, reactive, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import type { Department } from '@/apps/admin/model/User';
import { useUserMoreInfoStore } from '@/apps/admin/store/usersMoreInfo';
import { DEFAULT_DATATABLE_CONFIG, DEFAULT_PAGE_SIZE, } from '@/common/constants';
import { toastSuccess } from '@/common/helpers/custom-toast-service';
import { formatDate } from '@/common/helpers/utils';

import { deleteBookFlight, getCountAllBookingFlightStatus, searchBookFlight } from '../../api/graphql/book-flight';
import type { IBookFlight } from '../../model/bookFlight';
import BookFlightForm from './BookFlightForm.vue';

const { t } = useI18n();
const store = useUserMoreInfoStore();
const { usersMoreInfo } = storeToRefs(store);
const searchTerm = inject('searchTerm', ref(''));
const showForm = ref<boolean>(false);
const bookFlight = ref<IBookFlight[]>([]);
const selectedRow = ref<IBookFlight>();
const totalRecord = ref<number>();
const isDetail = ref<boolean>(false);
const confirm = useConfirm();
const canLoadMore = ref<boolean>(true);
const isLoadMore = ref<boolean>(true);
const isLoading = ref<boolean>(true);
const activeStatus = ref(0);
const STATUS = ['', 'DRAFT', 'WAITING_FOR_APPROVAL', 'APPROVED', 'COMPLETED'];
const menuRef = ref();
const sortField = ref();
const sortOrder = ref();
const pageable = reactive({
  page: 0,
  size: DEFAULT_PAGE_SIZE
});

const searchInput = reactive({
  textSearch: '',
  status: '',
  sortBy: '',
  sortDirection: ''
});
const searchParams = reactive({
  searchInput: searchInput,
  pageable: pageable,
});
const {
  onResult: getBookFlightResult,
  refetch: getBookFlightRefetch,
  onError: getBookFlightError
} =
  searchBookFlight(searchParams);

watch(searchTerm, (newValue) => {
  searchParams.searchInput.textSearch = newValue;
  isLoading.value = true;
  getBookFlightRefetch(searchParams);
});

const {
  onResult: countBookingFlightResult,
  refetch: countBookingFlightRefetch,
} = getCountAllBookingFlightStatus();

const {
  mutate: deleteBookFlightMutate,
  onDone: deleteBookFlightOnDone
} =
  deleteBookFlight();

function showFormCreate() {
  selectedRow.value = undefined;
  showForm.value = true;
}

getBookFlightResult((res) => {
  const {
    totalRecords,
    content
  } = get(res, 'data.searchBookingFlight', {
    totalRecords: 0,
    content: [],
  });
  
  totalRecord.value = totalRecords;
  if (isLoadMore.value) {
    bookFlight.value = [
      ...bookFlight.value,
      ...content,
    ];
  } else {
    bookFlight.value = content;
  }
  canLoadMore.value = content.length >= DEFAULT_PAGE_SIZE;
  isLoadMore.value = false;
  isLoading.value = false;
});

countBookingFlightResult((res) => {
  const statusCount = res.data.getCountAllBookingFlightStatus;
  const statusMap: Record<string, number> = {
    '': statusCount.all,
    DRAFT: statusCount.draft,
    WAITING_FOR_APPROVAL: statusCount.waitingForApproval,
    APPROVED: statusCount.approved,
    COMPLETED: statusCount.completed,
  };

  tabMenus.value = tabMenus.value.map(menu => ({
    ...menu,
    count: statusMap[menu.code] ?? 0
  }));
});

getBookFlightError(()=>{
  isLoading.value = false;
});

function toggleActionMenu(event: Event, data: IBookFlight) {
  menuRef.value.toggle(event);
  selectedRow.value = data;
}

const hideDialogFn = () => {
  isDetail.value = false;
  showForm.value = false;
  getBookFlightRefetch();
};

function reload() {
  searchParams.searchInput.textSearch = '';
  searchParams.searchInput.status = '';
  searchParams.searchInput.sortBy = '';
  searchParams.searchInput.sortDirection = '';
  searchParams.pageable.page = 0;
  isLoading.value = true;
  getBookFlightRefetch(searchParams);
  countBookingFlightRefetch();
}

const tabChange = () => {
  searchParams.searchInput.status = STATUS[activeStatus.value] || '';
  getBookFlightRefetch(searchParams);
};

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
    key: 'detail',
    label: t('common.viewMore'),
    icon: 'visibility',
    command: () => {
      isDetail.value = true;
      showForm.value = true;
    },
  },
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
  const officerName = selectedRow.value ? selectedRow?.value.officerId : '';
  confirm.require({
    message: t('common.confirmDelete', {
      itemType: 'phiếu đặt vé',
      itemName: `${usersMoreInfo.value[officerName]?.fullName} - ${selectedRow.value?.requestNumber}`
    }),
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
  deleteBookFlightMutate({ id: selectedRow.value?.id });
};

deleteBookFlightOnDone(() => {
  toastSuccess({ message: t('Xóa thành công') });
  reload();
});

function onSortChange(event: DataTableSortEvent) {
  console.log(event);
  sortField.value = event.sortField;
  sortOrder.value = event.sortOrder;
  searchParams.searchInput.sortBy = sortField.value;
  searchParams.searchInput.sortDirection = sortOrder.value === 1 ? 'ASC' : 'DESC';
  isLoading.value = true;
  getBookFlightRefetch(searchParams);
}

const formatDepartment = (id: string)=> {
  const departmentName = usersMoreInfo.value[id]?.departments
    ?.map((department: Department) => department.name.toLowerCase()
      .replace(/(^|\s|\.)(\S)/g, (match) => match.toUpperCase()))
    .join('\n');
  return departmentName || '';
};

const tabMenus = ref<
  MenuItem & { code: string; label: string; count: number; color: string }[]
>([
  {
    code: '',
    label: 'Tất cả',
    count: 0,
    color: '',
  },
  {
    code: STATUS[1],
    label: t('book-ticket.bookFlight.statusOption.DRAFT'),
    count: 0,
    color: '#B5B5B5',
  },
  {
    code: STATUS[2],
    label: t('book-ticket.bookFlight.statusOption.WAITING_FOR_APPROVAL'),
    count: 0,
    color: '#F36F24',
  },
  {
    code: STATUS[3],
    label: t('book-ticket.bookFlight.statusOption.APPROVED'),
    count: 0,
    color: '#94C748',
  },
  {
    code: STATUS[4],
    label: t('book-ticket.bookFlight.statusOption.COMPLETED'),
    count: 0,
    color: '#BF7CD3',
  },
]);

function getColorByStatus(status: string): string {
  const found = tabMenus.value.find(tab => tab.code === status);
  return found?.color || '#D9D9D9';
}

function getTextColorByStatus(status: string): string {
  return status === 'DRAFT' ? '#495057' : '#FFFFFF';
}
</script>

<style scoped>
::v-deep(.p-column-header-content) {
  display: inline-block;
}
</style>