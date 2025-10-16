<template>
  <Toolbar class='mb-2 p-0'>
    <template #start>
      <div class='align-items-center flex gap-2'>
        <div class='font-bold ml-3'>
          {{ t(`vehicle.menu.bookingCarReport`) }}
        </div>
      </div>
    </template>
    <template #end>
      <div class='btn-group-toolbar flex gap-1 mr-1 my-1'>
        <Button
          class='btn-create focus:shadow-none font-medium p-2'
          icon='pi pi-file-export'
          label='Kết xuất'
          @click='exportDialogVisible = true'>
        </Button>
      </div>
    </template>
  </Toolbar>

  <DataTable
    :pt="{
      wrapper: {
        class: 'h-full surface-overlay',
      },
    }"
    v-bind='DEFAULT_DATATABLE_CONFIG'
    row-hover
    :show-gridlines='true'
    :total-records='totalRecords'
    :value='bookingCar'
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
      field='numTicket'
      :header='t(`vehicle.bookingCar.numTicket`)'></Column>

    <Column
      class='text-center'
      field='createdDate'
      :header='t(`vehicle.bookingCar.createdDate`)'>
      <template #body='{ data: { createdDate } }'>
        {{ moment(createdDate).format('DD/MM/YYYY') }}
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
          moment(expectedReturnDate)
            .format('dddd, HH:mm DD/MM/YYYY')
            .replace(/^\w/, (c) => c.toUpperCase())
        }}
      </template>
    </Column>

    <Column
      field='userBooking'
      :header='t(`vehicle.bookingCar.userBooking`)'>
      <template #body='{ data: { userBooking } }'>
        <div v-if='userBooking'>
          {{ usersMoreInfo[userBooking]?.fullName }}
        </div>
      </template>
    </Column>

    <Column
      field='userId'
      :header='t(`vehicle.bookingCar.users`)'
      style='width: 20%'>
      <template #body='{ data: { userId } }'>
        <div v-if='userId'>
          {{ usersMoreInfo[userId]?.fullName }}
        </div>
      </template>
    </Column>

    <Column
      class='text-center'
      field='status'
      :header='t(`vehicle.bookingCar.status`)'>
      <template #body='{ data: { status } }'>
        {{ optionStatus.find((item) => item.code === status)?.label }}
      </template>
    </Column>
  </DataTable>
  <ExportDialog
    v-if='exportDialogVisible'
    v-model:visibleDialog='exportDialogVisible'
    :export-options='exportOptions'
    :search='searchParams.searchModel'
    @hide-dialog='hideExportDialogVisibleDialog'/>
</template>

<script lang='ts' setup>
import { assign, get } from 'lodash';
import { storeToRefs } from 'pinia';
import Column from 'primevue/column';
import type { DataTableSortEvent } from 'primevue/datatable';
import Dropdown from 'primevue/dropdown';
import { computed, inject, markRaw, nextTick, onMounted, reactive, ref, watch, } from 'vue';
import { useI18n } from 'vue-i18n';

import { useUserMoreInfoStore } from '@/apps/admin/store/usersMoreInfo';
import ExportDialog from '@/apps/document/views/doc/component/ExportDialog.vue';
import { searchBookingCar } from '@/apps/vehicle/api/graphql/booking-car';
import { exportExcelReportBookingCar, exportWordReportBookingCar, } from '@/apps/vehicle/api/rest/booking-car';
import type { BookingCarEdge, IBookingCar, } from '@/apps/vehicle/model/bookingCar';
import { DateTimeFormat, DEFAULT_DATATABLE_CONFIG, DEFAULT_PAGE_SIZE, } from '@/common/constants';
import useMoment from '@/common/helpers/mixins/use-moment';
import { useGlobalSearchStore } from '@/common/store/search';

const { t } = useI18n();
const searchTerm = inject('searchTerm', ref(''));

watch(searchTerm, (newValue) => {
  pageable.page = 0;
  bookingCar.value = [];
  searchParams.searchModel = { keyword: newValue };
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
const bookingCar = ref<IBookingCar[]>([]);
const canLoadMore = ref(true);
const isLoadMore = ref(true);
const totalRecords = ref();

const store = useUserMoreInfoStore();
const { usersMoreInfo } = storeToRefs(store);

const searchParams = reactive({
  searchModel: {},
  pageable: pageable,
});

const {
  onResult: getBookingCarResult,
  refetch: getBookingCarRefetch
} =
  searchBookingCar(searchParams);

function reload() {
  searchParams.pageable.page = 0;
  searchParams.searchModel = {};
  getBookingCarRefetch(searchParams);
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

const optionStatus = [
  {
    code: 'DU_THAO',
    label: 'Dự thảo',
  },
  {
    code: 'CHO_XU_LY',
    label: 'Chờ xử lý',
  },
  {
    code: 'DANG_XU_LY',
    label: 'Đang xử lý',
  },
  {
    code: 'DA_PHE_DUYET',
    label: 'Đã phê duyệt',
  },
];

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
  status: {
    label: t('vehicle.bookingCar.status'),
    type: String,
    component: markRaw(Dropdown),
    col: 6,
    props: {
      showClear: true,
      options: optionStatus,
      optionLabel: 'label',
      optionValue: 'code',
    },
  },
});
const exportDialogVisible = ref(false);
const exportOptions = computed(() => {
  const fileName = 'Thống kê phiếu đặt xe';
  return [
    {
      label: t('document.exportDoc.exportPdf'),
      fileName: fileName + '.pdf',
      exportFunction: () => {
      },
      icon: '/images/file-types/pdf-logo.png',
    },
    {
      label: t('document.exportDoc.exportWord'),
      fileName: fileName + '.docx',
      exportFunction: exportWordReportBookingCar,
      icon: '/images/file-types/word-logo.png',
    },
    {
      label: t('document.exportDoc.exportExcel'),
      fileName: fileName + '.xlsx',
      exportFunction: exportExcelReportBookingCar,
      icon: '/images/file-types/excel-logo.png',
    },
  ];
});

function hideExportDialogVisibleDialog() {
  exportDialogVisible.value = false;
}
</script>

<style scoped></style>
