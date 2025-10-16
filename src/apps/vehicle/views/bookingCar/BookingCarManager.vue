<template>
  <Toolbar
    class='mb-2 p-0'
    style='height: 46px'>
    <template #start>
      <div class='align-items-center flex gap-2'>
        <div class='font-bold ml-3'>
          {{ t(`media.common.list`) }} {{ t(`vehicle.bookingCar.titleForm`) }}
        </div>
      </div>
    </template>
    <template #end>
      <div
        class='btn-group-toolbar flex gap-1 mr-1 my-1'>
        <Button
          v-if='activeStatus <= 1'
          class='btn-create focus:shadow-none font-medium p-2'
          icon='pi pi-plus'
          :label='t("common.create")'
          @click='showFormCreate'>
        </Button>
        <Button
          v-if='activeStatus > 1'
          class='btn-create focus:shadow-none font-medium p-2'
          icon='pi pi-plus'
          :label="t('vehicle.bookingCar.order')"
          @click='showVehicleDispatchOrder'>
        </Button>
        <Button
          class='focus:shadow-none font-normal hover:surface-200'
          :disabled='selectedRow?.status !== BookingCarStatus.DU_THAO'
          icon='pi pi-send'
          label='Chuyển xử lý'
          severity='secondary'
          @click='startWorkFlow'></Button>
        <Button
          v-if="roles?.includes('CAR_TTTX')"
          class='focus:shadow-none font-normal hover:surface-200'
          :disabled='selectedRow?.status !== BookingCarStatus.DA_PHE_DUYET'
          icon='pi pi-file-edit'
          label='Lập lệnh'
          severity='secondary'
          @click='showVehicleDispatchOrder'></Button>
        <Button
          class='focus:shadow-none font-normal hover:surface-200'
          icon='pi pi-file-export'
          label='Export'
          severity='secondary'></Button>
      </div>
    </template>
  </Toolbar>

  <TabView
    v-model:activeIndex='activeStatus'>
    <TabPanel
      v-for='(tab, index) in tabMenus'
      :key='index'
      class='hover:surface-hover'>
      <template #header>
        <div
          class='align-items-center flex gap-2'
          @click='tabChange(tab)'>
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
    v-bind="{
      ...DEFAULT_DATATABLE_CONFIG,
      'scroll-height': 'calc(100vh - 11rem)',
    }"
    v-model:selection='selectedRow'
    :pt="{
      wrapper: {
        class: 'h-full surface-overlay',
      },
    }"
    row-hover
    selection-mode='single'
    :total-records='totalRecords'
    :value='bookingCar'
    @row-dblclick='showDetail'>
    <Column
      class='text-center'
      header='TT'
      style='width: 4rem'>
      <template #body='slotProps'>
        <div
          class='align-items-center flex items-center justify-content-center'>
          {{ slotProps.index + 1 }}
        </div>
      </template>
    </Column>
    <Column
      :header='t(`vehicle.bookingCar.numTicket`)'>
      <template #body='{ data }'>
        <div
          class='align-items-center flex gap-1'>
          <AppIcon
            v-if='data.priority === TaskPriority.HIGH'
            v-tooltip.top="'Ưu tiên cao'"
            class='text-red-500'
            fill
            name='flag'
            size='1.5'/>
          {{ data.numTicket }}
        </div>
      </template>
    </Column>
    <Column
      class='text-center'
      field='createdDate'
      :header='t(`vehicle.bookingCar.createdDate`)'>
      <template #body='{ data: { createdDate } }'>
        {{ moment(createdDate).format('DD/MM/YYYY') }}
      </template>
    </Column>
    <Column
      field='users'
      :header='t(`vehicle.bookingCar.users`)'>
      <template #body='{ data: { userId } }'>
        <div v-if='userId'>
          <AppUser
            is-highlight
            name-visible
            :user-id='userId'/>
        </div>
      </template>
    </Column>
    <Column
      field='users'
      :header='t(`vehicle.bookingCar.dept`)'
      style='width: 15%'>
      <template #body='{ data: { userId } }'>
        <div v-if='userId'>
          {{
            usersMoreInfo[userId]?.departments
              ?.map((department: any) => department.name)
              .join(', ')
          }}
        </div>
      </template>
    </Column>
    <Column
      field='onSitePlace'
      :header='t(`vehicle.bookingCar.onSitePlace`)'></Column>
    <Column
      class='text-center'
      field='departureDate'
      :header='t(`vehicle.bookingCar.departureDate`)'>
      <template #body='{ data: { departureDate } }'>
        {{
          moment(departureDate)
            .format('dddd, HH:mm DD/MM/YYYY')
            .replace(/^\w/, (c) => c.toUpperCase())
        }}
      </template>
    </Column>
    <Column
      class='text-center'
      field='expectedReturnDate'
      :header='t(`vehicle.bookingCar.expectedReturnDate`)'>
      <template #body='{ data: { expectedReturnDate } }'>
        {{
          expectedReturnDate && moment(expectedReturnDate)
            .format('dddd, HH:mm DD/MM/YYYY')
            .replace(/^\w/, (c) => c.toUpperCase())
        }}
      </template>
    </Column>
    <Column
      field='userBooking'
      :header='t(`vehicle.bookingCar.userBooking`)'>
      <template #body='{ data: { userBooking } }'>
        <div
          v-if='userBooking'
          class='flex justify-content-center'>
          <AppUser
            :user-id='userBooking'/>
        </div>
      </template>
    </Column>
    <Column
      field='status'
      :header='t(`vehicle.bookingCar.status`)'>
      <template #body='{ data: { status } }'>
        <div class='flex justify-content-center'>
          <Badge
            v-if='status'
            class='py-0 status-badge text-black-alpha-60 text-white'
            :style='{backgroundColor: getBgc(status)}'
            :value='t(`vehicle.bookingCar.${status}`)'></Badge>
        </div>
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
          @click='toggleActionMenu($event, data)'/>
      </template>
    </Column>
  </DataTable>

  <Menu
    ref='menuRef'
    :model='getMenus(selectedRow?.status)'
    :popup='true'>
  </Menu>
  <BookingCarForm
    v-if='showForm'
    :id='selectedRow?.id'
    :is-detail='isDetail'
    :visible-dialog='showForm'
    @hide-dialog='hideDialogFn'/>
  <VehicleDispatchOrder
    v-if='showFormDispatchOrder'
    :id='selectedRow?.id'
    :visible-dialog='showFormDispatchOrder'
    @hide-dialog='hideDialogFn'/>

  <NextFlowForm
    v-if='showNextFlowForm'
    :id='selectedRow?.id || undefined'
    :flow-id='selectedRow?.flowId || undefined'
    :visible-dialog='showNextFlowForm'
    @hide-dialog='hideDialogFn'/>

  <TotalDialog
    v-if='showTotalDialog'
    :actual-departure-time='selectedRow?.actualDepartureTime'
    :actual-time-ended='selectedRow?.actualTimeEnded'
    :license-plate='selectedRow?.licensePlate'
    :visible-dialog='showTotalDialog'
    @hide-dialog='showTotalDialog = false'/>
</template>

<script lang='ts' setup>
import { get, throttle } from 'lodash';
import { storeToRefs } from 'pinia';
import Column from 'primevue/column';
import type { MenuItem } from 'primevue/menuitem';
import { useConfirm } from 'primevue/useconfirm';
import { computed, inject, nextTick, onMounted, reactive, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { currentUser } from '@/apps/admin/api/graphql/admin-customer-tenant';
import { useUserMoreInfoStore } from '@/apps/admin/store/usersMoreInfo';
import {
  countBookingCarByStatus,
  deleteBookingCar,
  searchBookingCar,
  setTimeActualOfTheTrip,
} from '@/apps/vehicle/api/graphql/booking-car';
import { type BookingCarEdge, BookingCarStatus, type IBookingCar, } from '@/apps/vehicle/model/bookingCar';
import BookingCarForm from '@/apps/vehicle/views/bookingCar/BookingCarForm.vue';
import NextFlowForm from '@/apps/vehicle/views/bookingCar/component/NextFlowForm.vue';
import TotalDialog from '@/apps/vehicle/views/bookingCar/component/TotalDialog.vue';
import VehicleDispatchOrder from '@/apps/vehicle/views/bookingCar/component/VehicleDispatchOrder.vue';
import { TaskPriority } from '@/apps/work/model/work';
import AppUser from '@/common/components/app/AppUser.vue';
import { DateTimeFormat, DEFAULT_DATATABLE_CONFIG, DEFAULT_PAGE_SIZE, } from '@/common/constants';
import { toastSuccess } from '@/common/helpers/custom-toast-service';
import useMoment from '@/common/helpers/mixins/use-moment';
import { useGlobalSearchStore } from '@/common/store/search';

const { t } = useI18n();
const searchTerm = inject('searchTerm', ref(''));

const STATUS = [null, 'DU_THAO', 'CHO_XU_LY', 'DA_PHE_DUYET', 'DA_LAP_LENH', 'DA_NHAN_LENH', 'HOAN_THANH'];
const activeStatus = ref(0);
const store = useUserMoreInfoStore();
const { usersMoreInfo } = storeToRefs(store);
store.fetchAllUsers();
watch(searchTerm, (newValue) => {
  pageable.page = 0;
  bookingCar.value = [];
  searchParams.searchModel = {
    keyword: newValue,
    status: STATUS[activeStatus.value],
  };
  getBookingCarRefetch(searchParams);
});
const { moment } = useMoment();
const pageable = reactive({
  page: 0,
  size: DEFAULT_PAGE_SIZE,
  sort: [
    {
      property: 'createdTime',
      direction: 'DESC',
    },
  ],
});
const showForm = ref(false);
const showNextFlowForm = ref(false);
const bookingCar = ref<IBookingCar[]>([]);
const selectedRow = ref<IBookingCar>();
const canLoadMore = ref(true);
const isLoadMore = ref(true);
const totalRecords = ref();
const menuRef = ref();
const showTotalDialog = ref(false);
const isDetail = ref(false);
const confirm = useConfirm();
const { onResult: currentUserResult } =
  currentUser();

const roles = ref();

currentUserResult((res) => {
  roles.value = get(res, 'data.currentUser.roles', []);
});

const allTabMenus = ref<
  MenuItem & { code: string | null; label: string; count: number; color: string }[]
>([
  {
    code: null,
    label: 'Tất cả',
    count: 0,
    color: '',
  },
  {
    code: STATUS[1],
    label: t(`vehicle.bookingCar.${STATUS[1]}`),
    count: 0,
    color: '',
  },
  {
    code: STATUS[2],
    label: t(`vehicle.bookingCar.${STATUS[2]}`),
    count: 0,
    color: '',
  },
  {
    code: STATUS[3],
    label: t(`vehicle.bookingCar.${STATUS[3]}`),
    count: 0,
    color: '',
  },
  {
    code: STATUS[4],
    label: t(`vehicle.bookingCar.${STATUS[4]}`),
    count: 0,
    color: '',
  },
  {
    code: STATUS[5],
    label: t(`vehicle.bookingCar.${STATUS[5]}`),
    count: 0,
    color: '',
  },
  {
    code: STATUS[6],
    label: t(`vehicle.bookingCar.${STATUS[6]}`),
    count: 0,
    color: '',
  },
]);

const tabMenus = computed(() => {
  if (roles.value?.includes('CAR_LDP') || roles.value?.includes('CAR_QLDX')) {
    return allTabMenus.value.filter(m => [STATUS[2], STATUS[3]].includes(m.code as string));
  }
  if (roles.value?.includes('CAR_TTTX')) {
    return allTabMenus.value.filter(m => [STATUS[2], STATUS[4]].includes(m.code as string));
  }
  if (roles.value?.includes('CAR_LX')) {
    return allTabMenus.value.filter(m => [STATUS[2], STATUS[5], STATUS[6]].includes(m.code as string));
  }
  return allTabMenus.value.filter(m => [null, STATUS[1]].includes(m.code as string));
});

const searchParams = reactive({
  searchModel: {},
  pageable: pageable,
});
searchParams.searchModel = { status: tabMenus.value[0].code };

const startWorkFlow = () => {
  showNextFlowForm.value = true;
};

const tabChange = (tab: any) => {
  bookingCar.value = [];
  getBookingCarRefetch({
    ...searchParams,
    searchModel: {
      ...searchParams.searchModel,
      status: tab.code,
    },
    pageable: {
      ...searchParams.pageable,
      page: 0
    }
  });
};

const {
  onResult: countBookingCarByStatusResult,
  refetch: countBookingCarByStatusRefetch
} =
  countBookingCarByStatus();

countBookingCarByStatusResult((res) => {
  const data = res.data.countBookingCarByStatus;
  tabMenus.value.forEach((tab, index) => {
    tab.count = data[index].count || 0;
    tab.color = getBgc(tab.code as BookingCarStatus);
  });
});

const {
  onResult: getBookingCarResult,
  refetch: getBookingCarRefetch
} =
  searchBookingCar(searchParams);
const {
  mutate: deleteBookingCarMutate,
  onDone: deleteBookingCarOnDone
} =
  deleteBookingCar();

function reload() {
  bookingCar.value = [];
  getBookingCarRefetch({
    ...searchParams,
    searchModel: {
      ...searchParams.searchModel,
      status: tabMenus.value[activeStatus.value].code,
    },
    pageable: {
      ...searchParams.pageable,
      page: 0
    }
  });
  countBookingCarByStatusRefetch();
}

getBookingCarResult((res) => {
  const {
    totalCount,
    edges
  } = get(res, 'data.searchBookingCar', {
    totalCount: 0,
    edges: [],
  });
  totalRecords.value = totalCount;
  if (isLoadMore.value) {
    bookingCar.value = [
      ...bookingCar.value,
      ...edges.map((edge: BookingCarEdge) => ({ ...edge.node })),
    ];
  } else {
    bookingCar.value = edges.map((edge: BookingCarEdge) => ({ ...edge.node }));
  }
  canLoadMore.value = edges.length >= DEFAULT_PAGE_SIZE;
  isLoadMore.value = false;
});

function toggleActionMenu(event: Event, data: IBookingCar) {
  menuRef.value.toggle(event);
  selectedRow.value = data;
}

function showFormCreate() {
  selectedRow.value = undefined;
  showForm.value = true;
}

const showFormDispatchOrder = ref(false);

function showVehicleDispatchOrder() {
  showFormDispatchOrder.value = true;
}

function hideDialogFn() {
  showForm.value = false;
  showFormDispatchOrder.value = false;
  showNextFlowForm.value = false;
  isDetail.value = false;
  selectedRow.value = undefined;
  reload();
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
    scrollableContainer.addEventListener(
      'scrollend',
      throttle(scrollEvent, 2000),
    );
  }
}

const getBgc = (status: BookingCarStatus) => {
  switch (status) {
  case BookingCarStatus.DU_THAO:
    return '#D9D9D9';
  case BookingCarStatus.CHO_XU_LY:
    return '#3E84F6';
  case BookingCarStatus.DA_PHE_DUYET:
    return '#33C9DC';
  case BookingCarStatus.DA_LAP_LENH:
    return '#FFCD38';
  case BookingCarStatus.DA_NHAN_LENH:
    return '#51B7AE';
  case BookingCarStatus.HOAN_THANH:
    return '#6DD230';
  case BookingCarStatus.HUY:
    return '#FF4406';
  default:
    return '';
  }
};

onMounted(() => {
  nextTick(() => {
    addScrollEventListener('.p-datatable-wrapper');
  });
});

const showDetail = (event: any) => {
  selectedRow.value = event.data;
  isDetail.value = true;
  showForm.value = true;
};

const confirmDeleteMedia = () => {
  confirm.require({
    message: t('common.confirmDelete', { itemName: selectedRow.value?.numTicket, }),
    header: t('common.delete'),
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: t('common.delete'),
    acceptClass: 'p-button-danger',
    rejectLabel: t('common.cancel'),
    accept: () => {
      handleDeleteBookingCar();
    },
  });
};

const handleDeleteBookingCar = () => {
  deleteBookingCarMutate({ id: selectedRow.value?.id });
};

deleteBookingCarOnDone(() => {
  toastSuccess({ message: t('Xóa thành công') });
  reload();
});

const { setFields } = useGlobalSearchStore();
const {
  submit,
  model
} = storeToRefs(useGlobalSearchStore());

watch(submit, () => {
  pageable.page = 0;
  bookingCar.value = [];
  searchParams.searchModel = {
    ...model.value,
    status: STATUS[activeStatus.value],
    createdDateFrom: model.value.createdDateFrom
      ? moment(model.value.createdDateFrom).format(
        DateTimeFormat.ISO_LOCAL_DATE,
      )
      : null,
    createdDateTo: model.value.createdDateTo
      ? moment(model.value.createdDateTo).format(DateTimeFormat.ISO_LOCAL_DATE)
      : null,
    departureDate: model.value.departureDate
      ? moment(model.value.departureDate).format(
        DateTimeFormat.ISO_LOCAL_DATE_TIME,
      )
      : null,
    expectedReturnDate: model.value.expectedReturnDate
      ? moment(model.value.expectedReturnDate).format(
        DateTimeFormat.ISO_LOCAL_DATE_TIME,
      )
      : null,
  };
  getBookingCarRefetch(searchParams);
});

setFields({
  userBooking: {
    label: 'Người đặt',
    type: String,
    col: 6,
    isChooseUser: true,
  },
  numberUsers: {
    label: 'Số người đi',
    type: Number,
    col: 6,
  },
  createdDateFrom: {
    label: 'Ngày lập phiếu: Từ ngày',
    type: String,
    col: 6,
    isDatePicker: true,
  },
  createdDateTo: {
    label: 'Đến ngày',
    type: String,
    col: 6,
    isDatePicker: true,
  },
  departureDate: {
    label: 'Ngày sử dụng: Từ ngày',
    type: String,
    col: 6,
    isDatePicker: true,
  },
  expectedReturnDate: {
    label: 'Đến ngày',
    type: String,
    col: 6,
    isDatePicker: true,
  },
});

const baseActions = {
  viewDetail: {
    key: 'detail',
    label: t('common.viewDetail'),
    icon: 'pi pi-eye',
    command: () => {
      isDetail.value = true;
      showForm.value = true;
    },
  },
  edit: {
    key: 'edit',
    label: t('common.edit'),
    icon: 'pi pi-pencil',
    command: () => {
      showForm.value = true;
    },
  },
  delete: {
    key: 'delete',
    label: t('common.delete'),
    icon: 'pi pi-trash',
    class: 'delete-action',
    command: () => {
      confirmDeleteMedia();
    },
  },
  transfer: {
    label: 'Chuyển xử lý',
    icon: 'pi pi-send',
    visible: () => selectedRow.value?.status === BookingCarStatus.DU_THAO,
    command: startWorkFlow
  },
  order: {
    key: 'order',
    label: t('vehicle.bookingCar.order'),
    icon: 'pi pi-file-edit',
    command: () => {
      showVehicleDispatchOrder();
    },
  },
  viewTotal: {
    key: 'viewTotal',
    label: t('vehicle.bookingCar.viewTotal'),
    icon: 'pi pi-eye',
    command: () => {
      showTotalDialog.value = true;
    },
  },
  setTimeActualOfTheTrip: {
    key: 'setTimeActualOfTheTrip',
    label: 'Hoàn thành chuyến đi',
    icon: 'pi pi-check',
    command: () => {
      setDoneTrip();
    },
  }
};

const { mutate: setTimeActualOfTheTripMutate } =
  setTimeActualOfTheTrip();

const setDoneTrip = async () => {
  await setTimeActualOfTheTripMutate({ id: selectedRow.value?.id });
  await setTimeActualOfTheTripMutate({ id: selectedRow.value?.id });
  reload();
};

const menuActions = [
  baseActions.viewDetail,
  baseActions.edit,
  baseActions.delete,
  baseActions.transfer
];

const menuActionsView = [baseActions.viewDetail, baseActions.setTimeActualOfTheTrip];

const menuActionsApproved = [
  baseActions.viewDetail,
  baseActions.order
];

const menuActionsDone = [
  baseActions.viewDetail,
  baseActions.viewTotal
];

const getMenus = (status: any) => {
  if (status === BookingCarStatus.DU_THAO) {
    return menuActions;
  }
  if (status === BookingCarStatus.DA_PHE_DUYET && roles.value?.includes('CAR_TTTX')) {
    return menuActionsApproved;
  }
  if (status === BookingCarStatus.HOAN_THANH) {
    return menuActionsDone;
  }
  return menuActionsView;
};

</script>

<style scoped>
:deep(.p-tabview-panels) {
  display: none;
}

:deep(.p-tabview-nav-link) {
  padding: 0.5rem 1rem;
}

:deep(.delete-action .p-menuitem-icon) {
  color: red;
}
</style>
