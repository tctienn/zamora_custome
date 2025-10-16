<template>
  <Toolbar class='mb-2 p-0'>
    <template #start>
      <div class='align-items-center flex gap-2'>
        <div class='font-bold ml-3'>
          {{ t(`media.common.list`) }}
          {{ t(`vehicle.vehicleDispatchOrder.titleForm`) }}
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
            style='background-color: #f36f24'
            :value='tab.count'/>
        </div>
      </template>
    </TabPanel>
  </TabView>
  <DataTable
    v-bind='DEFAULT_DATATABLE_CONFIG'
    v-model:selection='selectedRow'
    :pt="{
      wrapper: {
        class: 'h-full surface-overlay',
      },
    }"
    row-hover
    :total-records='totalRecords'
    :value='vehicleDispatchOrder'
    @sort='onSort($event)'>
    <Column
      class='text-center'
      header='TT'
      style='width: 5%'>
      <template #body='slotProps'>
        <div
          class='align-items-center flex items-center justify-content-center'>
          {{ slotProps.index + 1 }}
        </div>
      </template>
    </Column>

    <Column
      field='numDispatchOrder'
      :header='t(`vehicle.vehicleDispatchOrder.numDispatchOrder`)'>
      <template #body='{ data }'>
        <div
          class='cursor-pointer'
          @click='showDetail(data)'>
          {{ data.numDispatchOrder }}
        </div>
      </template>
    </Column>

    <Column
      class='text-center'
      field='createdDate'
      :header='t(`vehicle.vehicleDispatchOrder.createdDate`)'>
      <template #body='{ data: { createdDate } }'>
        {{ moment(createdDate).format('DD/MM/YYYY') }}
      </template>
    </Column>

    <Column
      field='userBooking'
      :header='t(`vehicle.vehicleDispatchOrder.userBooking`)'>
      <template #body='{ data: { userBooking } }'>
        <div v-if='userBooking'>
          <AppUser
            name-visible
            :user-id='userBooking'/>
        </div>
      </template>
    </Column>

    <Column
      class='text-center'
      field='departureDate'
      :header='t(`vehicle.vehicleDispatchOrder.departureDate`)'>
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
      :header='t(`vehicle.vehicleDispatchOrder.expectedReturnDate`)'>
      <template #body='{ data: { expectedReturnDate } }'>
        {{
          moment(expectedReturnDate)
            .format('dddd, HH:mm DD/MM/YYYY')
            .replace(/^\w/, (c) => c.toUpperCase())
        }}
      </template>
    </Column>

    <Column
      class='text-center'
      field='users'
      :header='t(`vehicle.vehicleDispatchOrder.users`)'>
      <template #body='{ data: { users } }'>
        <div class='flex justify-content-center'>
          <AppGroupAvatar
            v-if='users'
            avatar-size='2.5'
            :user-ids='users'/>
        </div>
      </template>
    </Column>

    <Column
      field='onSitePlace'
      :header='t(`vehicle.vehicleDispatchOrder.onSitePlace`)'></Column>

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
    :model='activeStatus !== 3 ? menuActions : menuActionsApproved'
    :popup='true'>
    <template #item='{ item: { icon, label } }'>
      <MenuItem
        :icon='icon'
        :label='label'/>
    </template>
  </Menu>

  <VehicleDispatchOrderForm
    v-if='showForm'
    :id='selectedRow?.id'
    :is-detail='isDetail'
    :visible-dialog='showForm'
    @hide-dialog='hideDialogFn'/>
</template>

<script lang='ts' setup>
import { assign, get } from 'lodash';
import { storeToRefs } from 'pinia';
import Column from 'primevue/column';
import type { DataTableSortEvent } from 'primevue/datatable';
import Dropdown from 'primevue/dropdown';
import type { MenuItem } from 'primevue/menuitem';
import { useConfirm } from 'primevue/useconfirm';
import { inject, markRaw, nextTick, onMounted, reactive, ref, watch, } from 'vue';
import { useI18n } from 'vue-i18n';

import { getAllVehicle } from '@/apps/vehicle/api/graphql/vehicle';
import {
  changeDispatchOrderStatus,
  countDispatchOrderByStatus,
  deleteVehicleDispatchOrder,
  searchVehicleDispatchOrderByKeyword,
} from '@/apps/vehicle/api/graphql/vehicle-dispatch-order';
import { exportWordVehicleDispatchOrder } from '@/apps/vehicle/api/rest/vehicle-dispatch-order';
import type { IVehicleDispatchOrder, VehicleDispatchOrderEdge, } from '@/apps/vehicle/model/vehicleDispatchOrder';
import VehicleDispatchOrderForm from '@/apps/vehicle/views/vehicleDispatchOrder/VehicleDispatchOrderForm.vue';
import AppGroupAvatar from '@/common/components/app/AppGroupAvatar.vue';
import AppUser from '@/common/components/app/AppUser.vue';
import { DateTimeFormat, DEFAULT_DATATABLE_CONFIG, DEFAULT_PAGE_SIZE, } from '@/common/constants';
import { toastSuccess } from '@/common/helpers/custom-toast-service';
import { downloadFile } from '@/common/helpers/file-utils';
import useMoment from '@/common/helpers/mixins/use-moment';
import { useGlobalSearchStore } from '@/common/store/search';

const { t } = useI18n();
const searchTerm = inject('searchTerm', ref(''));

const STATUS = ['DU_THAO', 'CHO_XU_LY', 'DANG_XU_LY', 'DA_PHE_DUYET'];
const activeStatus = ref(0);

watch(searchTerm, (newValue) => {
  pageable.page = 0;
  vehicleDispatchOrder.value = [];
  searchParams.searchModel = {
    keyword: newValue,
    status: STATUS[activeStatus.value],
  };
  getVehicleDispatchOrderRefetch(searchParams);
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
const vehicleDispatchOrder = ref<IVehicleDispatchOrder[]>([]);
const selectedRow = ref<IVehicleDispatchOrder>();
const canLoadMore = ref(true);
const isLoadMore = ref(true);
const totalRecords = ref();
const menuRef = ref();
const isDetail = ref(false);
const confirm = useConfirm();

const searchParams = reactive({
  searchModel: {},
  pageable: pageable,
});
searchParams.searchModel = { status: STATUS[activeStatus.value] };

const tabChange = () => {
  searchParams.searchModel = { status: STATUS[activeStatus.value] };
  getVehicleDispatchOrderRefetch(searchParams);
};

const tabMenus = ref<
  MenuItem & { code: string; label: string; count: number }[]
>([
  {
    code: STATUS[0],
    label: 'Dự thảo',
    count: 0,
  },
  {
    code: STATUS[1],
    label: 'Chờ xử lý',
    count: 0,
  },
  {
    code: STATUS[2],
    label: 'Đang xử lý',
    count: 0,
  },
  {
    code: STATUS[3],
    label: 'Đã phê duyệt',
    count: 0,
  },
]);

const {
  onResult: getVehicleDispatchOrderResult,
  refetch: getVehicleDispatchOrderRefetch,
} = searchVehicleDispatchOrderByKeyword(searchParams);
const {
  mutate: deleteVehicleDispatchOrderMutate,
  onDone: deleteVehicleDispatchOrderOnDone,
} = deleteVehicleDispatchOrder();

function reload() {
  searchParams.pageable.page = 0;
  searchParams.searchModel = { status: STATUS[activeStatus.value] };
  getVehicleDispatchOrderRefetch(searchParams);
  countDispatchOrderByStatusRefetch();
}

const {
  onResult: countDispatchOrderByStatusResult,
  refetch: countDispatchOrderByStatusRefetch,
} = countDispatchOrderByStatus();

const {
  mutate: changeDispatchOrderStatusMutate,
  onDone: changeDispatchOrderStatusOnDone,
} = changeDispatchOrderStatus();

countDispatchOrderByStatusResult((res) => {
  tabMenus.value.map((item) => item.count = 0);
  res.data.countDispatchOrderByStatus.forEach((item: any) => {
    const tabMenu = tabMenus.value.find((menu) => menu.code === item.status);
    if (tabMenu) {
      tabMenu.count = item.count;
    }
  });
});

getVehicleDispatchOrderResult((res) => {
  const {
    totalCount,
    edges
  } = get(res, 'data.searchVehicleDispatchOrder', {
    totalCount: 0,
    edges: [],
  });
  totalRecords.value = totalCount;
  if (isLoadMore.value) {
    vehicleDispatchOrder.value = [
      ...vehicleDispatchOrder.value,
      ...edges.map((edge: VehicleDispatchOrderEdge) => ({ ...edge.node })),
    ];
  } else {
    vehicleDispatchOrder.value = edges.map(
      (edge: VehicleDispatchOrderEdge) => ({ ...edge.node }),
    );
  }
  canLoadMore.value = edges.length >= DEFAULT_PAGE_SIZE;
  isLoadMore.value = false;
});

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

function toggleActionMenu(event: Event, data: IVehicleDispatchOrder) {
  menuRef.value.toggle(event);
  selectedRow.value = data;
}

function showFormCreate() {
  selectedRow.value = undefined;
  showForm.value = true;
}

function hideDialogFn() {
  showForm.value = false;
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
    scrollableContainer.addEventListener('scroll', scrollEvent);
  }
}

onMounted(() => {
  nextTick(() => {
    addScrollEventListener('.p-datatable-wrapper');
  });
});

const menuActions = [
  {
    key: 'detail',
    label: t('common.viewDetail'),
    icon: 'visibility',
    command: () => {
      showDetail();
    },
  },
  {
    key: 'change-status',
    label: t('vehicle.bookingCar.changeStatus'),
    icon: 'edit',
    command: () => {
      changeDispatchOrderStatusMutate({ id: selectedRow.value?.id });
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
  {
    key: 'download',
    label: t('common.download'),
    icon: 'download',
    command: () => {
      exportWordVehicleDispatchOrder(selectedRow.value?.id).then(
        (value: any) => {
          if (value) {
            downloadFile(value.data, 'Lệnh điều xe.docx');
          }
        },
      );
    },
  },
];

const showDetail = (data?: IVehicleDispatchOrder) => {
  if (data) {
    selectedRow.value = data;
  }
  isDetail.value = true;
  showForm.value = true;
};

const menuActionsApproved = [
  {
    key: 'detail',
    label: t('common.viewDetail'),
    icon: 'visibility',
    command: () => {
      showDetail();
    },
  },
  {
    key: 'download',
    label: t('common.download'),
    icon: 'download',
    command: () => {
      exportWordVehicleDispatchOrder(selectedRow.value?.id).then(
        (value: any) => {
          if (value) {
            downloadFile(value.data, 'Phiếu đặt xe.docx');
          }
        },
      );
    },
  },
];

const vehicles = ref();
const { onResult: getAllVehicleResult } = getAllVehicle();
getAllVehicleResult((res) => {
  vehicles.value = res.data.getAllVehicle;
});

changeDispatchOrderStatusOnDone(() => {
  reload();
});

const confirmDeleteMedia = () => {
  confirm.require({
    message: t('common.confirmDelete', { itemName: selectedRow.value?.numTicket, }),
    header: t('common.delete'),
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: t('common.delete'),
    acceptClass: 'p-button-danger',
    rejectLabel: t('common.cancel'),
    accept: () => {
      handleDeleteVehicleDispatchOrder();
    },
  });
};

const handleDeleteVehicleDispatchOrder = () => {
  deleteVehicleDispatchOrderMutate({ id: selectedRow.value?.id });
};

deleteVehicleDispatchOrderOnDone(() => {
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
  vehicleDispatchOrder.value = [];
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
  getVehicleDispatchOrderRefetch(searchParams);
});

setFields({
  userBooking: {
    label: 'Người đặt',
    type: String,
    col: 6,
    isChooseUser: true,
  },
  driver: {
    label: 'Lái xe',
    type: String,
    col: 6,
    isChooseUser: true,
  },
  createdDateFrom: {
    label: 'Ngày lập lệnh: Từ ngày',
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
  vehicleId: {
    label: 'Xe sử dụng',
    type: String,
    component: markRaw(Dropdown),
    col: 6,
    props: {
      showClear: true,
      options: vehicles,
      optionLabel: 'vehicleType',
      optionValue: 'id',
    },
  },
});
</script>

<style scoped>
:deep(.p-tabview-panels) {
  display: none;
}

:deep(.p-tabview-nav-link) {
  padding: 0.5rem 1rem;
}
</style>
