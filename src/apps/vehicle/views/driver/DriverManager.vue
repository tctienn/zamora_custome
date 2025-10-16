<template>
  <Toolbar class='mb-2 p-0'>
    <template #start>
      <div class='align-items-center flex gap-2'>
        <div class='font-bold ml-3'>
          {{ t(`media.common.list`) }} {{ t(`vehicle.menu.driverManager`) }}
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
    :pt="{
      wrapper: {
        class: 'h-full surface-overlay',
      },
    }"
    row-hover
    selection-mode='single'
    :value='data'>
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
      field='fullname'
      :header='t(`vehicle.driver.fullname`)'></Column>

    <Column
      class='text-center'
      field='driverSource'
      :header='t(`vehicle.driver.driverSource`)'>
      <template #body='{ data: {driverSource} }'>
        <span>
          {{ t(`vehicle.driver.${driverSource}`) }}
        </span>
      </template>
    </Column>

    <Column
      class='text-center'
      field='gender'
      :header='t(`vehicle.driver.gender`)'>
      <template #body='{ data: {gender} }'>
        <span>
          {{ gender ? 'Nam' : 'Nữ' }}
        </span>
      </template>

    </Column>

    <Column
      class='text-center'
      field='phone'
      :header='t(`vehicle.driver.phone`)'></Column>

    <Column
      class='text-center'
      :header='t(`vehicle.driver.organization`)'
      style='width: 20rem'>
      <template #body='{ data: {driverSource, organizationIds, vehicleRentalCompanyId} }'>
        <span v-if='driverSource===DriverSource.INTERNAL'>
          {{ findOrganizationsByIds(organizationIds)?.join(', ') || '' }}
        </span>
        <span v-else>{{ getVehicleRentalCompany(vehicleRentalCompanyId) }}</span>
      </template>
    </Column>

    <Column
      class='text-center'
      field='driverType'
      :header='t(`vehicle.driver.driverType`)'>
      <template #body='{ data: {driverType} }'>
        <span>
          {{ t(`vehicle.driver.${driverType}`) }}
        </span>
      </template>
    </Column>

    <Column
      class='text-center'
      field='status'
      :header='t("vehicle.common.status")'>
      <template #body='{ data: { status } }'>
        <span
          class='status-badge'
          :class="`status-${status ? 'active' : 'deactivate'}`">{{
            t(
              `common.statuses.${status ? 'active' : 'deactivate'}`,
            )
          }}</span>
      </template>
    </Column>

    <Column
      class='text-center'
      :header="t('common.action')"
      style='width: 10rem'>
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
    :model='menuActions'
    :popup='true'>
  </Menu>

  <DriverForm
    v-if='showForm'
    :id='selectedRow?.id'
    :visible-dialog='showForm'
    @hide-dialog='hideDialogFn'/>
</template>

<script setup lang='ts'>
import { get } from 'lodash';
import Column from 'primevue/column';
import { useConfirm } from 'primevue/useconfirm';
import { inject, nextTick, onMounted, reactive, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { getAllOrganizationGraphql } from '@/apps/admin/api/graphql/organization-graphql-api';
import { deleteDriver, searchDriverByKeyword } from '@/apps/vehicle/api/graphql/driver';
import { getAllVehicleRentalCompany } from '@/apps/vehicle/api/graphql/vehicleRentalCompany';
import { type Driver, DriverSource } from '@/apps/vehicle/model/driver';
import type { VehicleRentalCompany } from '@/apps/vehicle/model/vehicleRentalCompany';
import DriverForm from '@/apps/vehicle/views/driver/DriverForm.vue';
import { DEFAULT_DATATABLE_CONFIG, DEFAULT_PAGE_SIZE } from '@/common/constants';
import { toastSuccess } from '@/common/helpers/custom-toast-service';

const pageable = reactive({
  page: 0,
  size: 200,
  sort: [
    {
      property: 'createdTime',
      direction: 'DESC',
    },
  ],
});
const searchParams = reactive({
  keyword: '',
  pageable: pageable,
});
const { t } = useI18n();
const searchTerm = inject('searchTerm', ref(''));
const showForm = ref(false);
const data = ref<Driver[]>([]);
const selectedRow = ref<Driver>();
const canLoadMore = ref(true);
const isLoadMore = ref(true);
const menuRef = ref();
const confirm = useConfirm();

function showFormCreate() {
  selectedRow.value = undefined;
  showForm.value = true;
}

watch(searchTerm, (newValue) => {
  searchParams.keyword = newValue;
  searchDriverByKeyword(searchParams);
});

function toggleActionMenu(event: Event, data: Driver) {
  menuRef.value.toggle(event);
  selectedRow.value = data;
}

const hideDialogFn = () => {
  showForm.value = false;
  searchDriverByKeywordRefetch();
};

const organizations = ref([]);
const { onResult: getAllOrganizationResult } = getAllOrganizationGraphql();
getAllOrganizationResult((response) => {
  organizations.value = get(response, 'data.allOrganizationPublic', []);
});

function findOrganizationsByIds(ids: string[]) {
  return organizations.value.filter((item: any) => ids.includes(item.id))?.map((item: any) => item?.name);
}

const {
  onResult: searchDriverByKeywordResult,
  refetch: searchDriverByKeywordRefetch
} =
  searchDriverByKeyword(searchParams);

searchDriverByKeywordResult((res) => {
  const { edges } = get(res, 'data.searchDriverByKeyword', { edges: [], });
  if (isLoadMore.value) {
    data.value = [
      ...data.value,
      ...edges.map((edge: any) => ({ ...edge.node })),
    ];
  } else {
    data.value = edges.map((edge: any) => ({ ...edge.node }));
  }
  canLoadMore.value = edges.length >= DEFAULT_PAGE_SIZE;
  isLoadMore.value = false;
});

const vehicleRentalCompanies = ref<VehicleRentalCompany[]>([]);
const { onResult } = getAllVehicleRentalCompany();
onResult((res) => {
  vehicleRentalCompanies.value = res.data.getAllVehicleRentalCompany;
});

function getVehicleRentalCompany(id: string) {
  return vehicleRentalCompanies.value.find((o: VehicleRentalCompany) => o.id === id)?.name;
}

const menuActions = [
  {
    key: 'edit',
    label: t('common.edit'),
    icon: 'pi pi-pencil',
    command: () => {
      showForm.value = true;
    },
  },
  {
    key: 'delete',
    label: t('common.delete'),
    icon: 'pi pi-trash',
    command: () => {
      confirmDelete();
    },
  },
];

const confirmDelete = () => {
  confirm.require({
    message: t('common.confirmDelete', { itemName: selectedRow.value?.fullname, }),
    header: t('common.delete'),
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: t('common.delete'),
    acceptClass: 'p-button-danger',
    rejectLabel: t('common.cancel'),
    accept: () => {
      handleDelete();
    },
  });
};

const {
  mutate: deleteDriverMutate,
  onDone: deleteDriverOnDone
} =
  deleteDriver();

const handleDelete = () => {
  deleteDriverMutate({ id: selectedRow.value?.id });
};

deleteDriverOnDone(() => {
  toastSuccess({ message: t('Xóa thành công') });
  searchDriverByKeywordRefetch();
});

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
</script>

<style scoped>

</style>