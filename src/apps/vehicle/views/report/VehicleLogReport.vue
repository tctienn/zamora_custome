<template>
  <Toolbar class='mb-2 p-0'>
    <template #start>
      <div class='align-items-center flex gap-2'>
        <div class='font-bold ml-3'>
          {{ t(`vehicle.menu.vehicleLogReport`) }}
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
    :value='vehicleLog'
    @sort='onSort($event)'>
    <Column
      class='text-center'
      header='TT'
      style='width: 5vw'>
      <template #body='slotProps'>
        <div
          class='align-items-center flex items-center justify-content-center'>
          {{ slotProps.index + 1 }}
        </div>
      </template>
    </Column>

    <Column
      field='driver'
      :header='t(`vehicle.vehicleLog.driver`)'
      style='width: 15vw'>
      <template #body='{ data: { driver } }'>
        <div v-if='driver'>
          {{ usersMoreInfo[driver]?.fullName }}
        </div>
      </template>
    </Column>

    <Column
      class='text-center'
      :header='t(`vehicle.vehicleLog.trip`)'
      style='width: 15vw'>
      <template #body='{ data: { departurePoint, destination } }'>
        {{ departurePoint }} - {{ destination }}
      </template>
    </Column>

    <Column
      field='onSitePlace'
      :header='t(`vehicle.vehicleLog.onSitePlace`)'
      style='width: 15vw'></Column>

    <Column
      class='text-center'
      field='date'
      :header='t(`vehicle.vehicleLog.date`)'
      style='width: 15vw'>
      <template #body='{ data: { departureDate, expectedReturnDate } }'>
        {{
          moment(departureDate)
            .format('dddd, HH:mm DD/MM/YYYY')
            .replace(/^\w/, (c) => c.toUpperCase())
        }}
        -
        {{
          moment(expectedReturnDate)
            .format('dddd, HH:mm DD/MM/YYYY')
            .replace(/^\w/, (c) => c.toUpperCase())
        }}
      </template>
    </Column>

    <Column
      field='kmInitial'
      :header='t(`vehicle.vehicleDispatchOrder.kmInitial`)'
      style='width: 10vw'></Column>
    <Column
      field='kmEnd'
      :header='t(`vehicle.vehicleDispatchOrder.kmEnd`)'
      style='width: 10vw'></Column>
    <Column
      field='kmReality'
      :header='t(`vehicle.vehicleLog.kmReality`)'
      style='width: 10vw'></Column>

    <Column
      field='costReality'
      :header='t(`vehicle.vehicleDispatchOrder.costReality`)'
      style='width: 10vw'></Column>

    <Column
      field='users'
      :header='t(`vehicle.vehicleDispatchOrder.users`)'
      style='width: 20vw'>
      <template #body='{ data: { users } }'>
        {{
          users.map((user: string) => usersMoreInfo[user]?.fullName).join(', ')
        }}
      </template>
    </Column>

    <Column
      field='review'
      :header='t(`vehicle.vehicleDispatchOrder.review`)'
      style='width: 10vw'></Column>

    <Column
      field='note'
      :header='t(`vehicle.vehicleDispatchOrder.note`)'
      style='width: 15vw'></Column>
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
import { getAllVehicle } from '@/apps/vehicle/api/graphql/vehicle';
import { searchVehicleLog } from '@/apps/vehicle/api/graphql/vehicle-dispatch-order';
import { exportExcelReportVehicleLog } from '@/apps/vehicle/api/rest/vehicle-dispatch-order';
import type { IVehicleDispatchOrder, VehicleDispatchOrderEdge, } from '@/apps/vehicle/model/vehicleDispatchOrder';
import { DateTimeFormat, DEFAULT_DATATABLE_CONFIG, DEFAULT_PAGE_SIZE, } from '@/common/constants';
import useMoment from '@/common/helpers/mixins/use-moment';
import { useGlobalSearchStore } from '@/common/store/search';

const { t } = useI18n();
const searchTerm = inject('searchTerm', ref(''));

watch(searchTerm, (newValue) => {
  pageable.page = 0;
  vehicleLog.value = [];
  searchParams.searchModel = { keyword: newValue };
  searchVehicleLogRefetch(searchParams);
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
const vehicleLog = ref<IVehicleDispatchOrder[]>([]);
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
  onResult: searchVehicleLogResult,
  refetch: searchVehicleLogRefetch
} =
  searchVehicleLog(searchParams);

function reload() {
  searchParams.pageable.page = 0;
  searchParams.searchModel = {};
  searchVehicleLogRefetch(searchParams);
}

searchVehicleLogResult((res) => {
  const {
    totalCount,
    edges
  } = get(res, 'data.searchVehicleLog', {
    totalCount: 0,
    edges: [],
  });
  totalRecords.value = totalCount;
  if (isLoadMore.value) {
    vehicleLog.value = [
      ...vehicleLog.value,
      ...edges.map((edge: VehicleDispatchOrderEdge) => ({ ...edge.node })),
    ];
  } else {
    vehicleLog.value = edges.map((edge: VehicleDispatchOrderEdge) => ({ ...edge.node, }));
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
  vehicleLog.value = [];
  searchParams.searchModel = {
    ...model.value,
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
  searchVehicleLogRefetch(searchParams);
});

const vehicles = ref();
const { onResult: getAllVehicleResult } = getAllVehicle();
getAllVehicleResult((res) => {
  vehicles.value = res.data.getAllVehicle;
});

setFields({
  departureDate: {
    label: 'Từ ngày',
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
  licensePlate: {
    label: 'Xe sử dụng',
    type: String,
    component: markRaw(Dropdown),
    col: 6,
    props: {
      showClear: true,
      options: vehicles,
      optionLabel: 'licensePlate',
      optionValue: 'licensePlate',
    },
  },
});

const exportDialogVisible = ref(false);
const exportOptions = computed(() => {
  const fileName = 'Nhật trình xe';
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
      exportFunction: () => {
      },
      icon: '/images/file-types/word-logo.png',
    },
    {
      label: t('document.exportDoc.exportExcel'),
      fileName: fileName + '.xlsx',
      exportFunction: exportExcelReportVehicleLog,
      icon: '/images/file-types/excel-logo.png',
    },
  ];
});

function hideExportDialogVisibleDialog() {
  exportDialogVisible.value = false;
}
</script>

<style scoped></style>
