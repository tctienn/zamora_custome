<template>
  <Toolbar class='mb-2 p-0'>
    <template #start>
      <div class='align-items-center flex gap-2'>
        <div class='font-bold ml-3'>
          {{ t(`media.common.list`) }} {{ t(`vehicle.menu.vehicleRentalCompanyManager`) }}
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
      field='code'
      :header='t(`vehicle.vehicleRentalCompany.code`)'></Column>
    <Column
      field='name'
      :header='t(`vehicle.vehicleRentalCompany.name`)'></Column>
    <Column
      field='address'
      :header='t(`vehicle.vehicleRentalCompany.address`)'></Column>
    <Column
      field='phone'
      :header='t(`vehicle.vehicleRentalCompany.phone`)'></Column>
    <Column
      field='email'
      :header='t(`vehicle.vehicleRentalCompany.email`)'></Column>
    <Column
      field='website'
      :header='t(`vehicle.vehicleRentalCompany.website`)'></Column>
    <Column
      field='taxCode'
      :header='t(`vehicle.vehicleRentalCompany.taxCode`)'></Column>
    <Column
      field='contactPerson'
      :header='t(`vehicle.vehicleRentalCompany.contactPerson`)'></Column>
    <Column
      field='contactPhone'
      :header='t(`vehicle.vehicleRentalCompany.contactPhone`)'></Column>

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
    <template #item='{ item: { icon, label } }'>
      <MenuItem
        :icon='icon'
        :label='label'/>
    </template>
  </Menu>

  <VehicleRentalCompanyForm
    v-if='showForm'
    :id='selectedRow?.id'
    :visible-dialog='showForm'
    @hide-dialog='hideDialogFn'/>
</template>

<script setup lang='ts'>
import { get } from 'lodash';
import Column from 'primevue/column';
import { useConfirm } from 'primevue/useconfirm';
import { inject, nextTick, onMounted, reactive, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import {
  deleteVehicleRentalCompany,
  searchVehicleRentalCompanyByKeyword
} from '@/apps/vehicle/api/graphql/vehicleRentalCompany';
import type { VehicleRentalCompany } from '@/apps/vehicle/model/vehicleRentalCompany';
import VehicleRentalCompanyForm from '@/apps/vehicle/views/vehicleRentalCompany/VehicleRentalCompanyForm.vue';
import { DEFAULT_DATATABLE_CONFIG, DEFAULT_PAGE_SIZE } from '@/common/constants';
import { toastSuccess } from '@/common/helpers/custom-toast-service';

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
const searchParams = reactive({
  keyword: '',
  pageable: pageable,
});
const { t } = useI18n();
const searchTerm = inject('searchTerm', ref(''));
const showForm = ref(false);
const data = ref<VehicleRentalCompany[]>([]);
const selectedRow = ref<VehicleRentalCompany>();
const canLoadMore = ref(true);
const isLoadMore = ref(true);
const menuRef = ref();
const confirm = useConfirm();

function showFormCreate() {
  selectedRow.value = undefined;
  showForm.value = true;
}

function toggleActionMenu(event: Event, data: any) {
  menuRef.value.toggle(event);
  selectedRow.value = data;
}

const hideDialogFn = () => {
  showForm.value = false;
  searchVehicleRentalCompanyByKeywordRefetch();
};

const {
  onResult: searchVehicleRentalCompanyByKeywordResult,
  refetch: searchVehicleRentalCompanyByKeywordRefetch
} =
  searchVehicleRentalCompanyByKeyword(searchParams);

searchVehicleRentalCompanyByKeywordResult((res) => {
  const { edges } = get(res, 'data.searchVehicleRentalCompanyByKeyword', { edges: [], });
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

const menuActions = [
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
      confirmDelete();
    },
  },
];

const confirmDelete = () => {
  confirm.require({
    message: t('common.confirmDelete', { itemName: selectedRow.value?.name, }),
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
  mutate: deleteVehicleRentalCompanyMutate,
  onDone: deleteVehicleRentalCompanyOnDone
} =
  deleteVehicleRentalCompany();

const handleDelete = () => {
  deleteVehicleRentalCompanyMutate({ id: selectedRow.value?.id });
};

deleteVehicleRentalCompanyOnDone(() => {
  toastSuccess({ message: t('Xóa thành công') });
  searchVehicleRentalCompanyByKeywordRefetch();
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