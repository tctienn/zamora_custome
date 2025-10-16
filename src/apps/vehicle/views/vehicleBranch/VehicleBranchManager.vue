<template>
  <Toolbar class='mb-2 p-0'>
    <template #start>
      <div class='align-items-center flex gap-2'>
        <div class='font-bold ml-3'>
          {{ t(`vehicle.vehicleBranch.titlePage`) }}
        </div>
      </div>
    </template>
    <template #end>
      <div class='btn-group-toolbar flex gap-1 mr-1 my-1'>
        <SplitButton
          :model='items'
          @click='showFormCreate'>
          <span class='align-items-center flex font-medium gap-2'>
            <AppIcon
              name='add'
              size='1.3'/>
            <span>{{ t('common.create') }}</span>
          </span>
        </SplitButton>
      </div>
    </template>
  </Toolbar>

  <div class='grid grid-nogutter h-full'>
    <div class='branch col-6 pr-2'>
      <DataTable
        v-bind='DEFAULT_DATATABLE_CONFIG'
        v-model:selection='selectedRow'
        :pt="{
          wrapper: {
            class: 'h-full surface-overlay',
          },
          bodyrow: {
            style: 'height: 52px',
          },
        }"
        row-hover
        selection-mode='single'
        :total-records='totalRecords'
        :value='vehicleBranch'>
        <Column
          class='text-center'
          header='TT'
          style='width: 5rem'>
          <template #body='slotProps'>
            <div
              class='align-items-center flex items-center justify-content-center'>
              {{ slotProps.index + 1 }}
            </div>
          </template>
        </Column>

        <Column
          header='Logo'
          style='width: 10rem'>
          <template #body='{ data }'>
            <div class='flex justify-content-center'>
              <img
                v-if='data.logo'
                alt=''
                class='border-round h-3rem object-cover w-3rem'
                :src='generateAvatarUrl(data.logo.path)'/>
            </div>
          </template>
        </Column>

        <Column
          field='code'
          :header='t(`vehicle.vehicleBranch.code`)'
          header-class='header-left'
          style='width: 12rem'></Column>

        <Column
          field='name'
          :header='t(`vehicle.vehicleBranch.name`)'
          header-class='header-left'
          style='width: 10rem'></Column>

        <Column
          class='text-center'
          field='countVehicleModel'
          :header='t(`vehicle.vehicleBranch.countVehicleModel`)'
          style='width: 15rem'></Column>

        <Column>
          <template #body='{ data }'>
            <div class='flex gap-2 group-btn justify-content-end mr-5'>
              <ButtonIcon
                v-tooltip.top='"Thêm dòng xe"'
                icon='add_circle_outline'
                icon-size='1.5'
                rounded
                text
                @click='addVehicleModel(data)'/>
              <ButtonIcon
                v-tooltip.top='"Sửa"'
                icon='edit'
                icon-size='1.5'
                rounded
                text
                @click='editVehicleBranch(data)'/>
              <ButtonIcon
                v-tooltip.top='t("common.delete")'
                class='text-red-400'
                icon='delete'
                icon-size='1.5'
                rounded
                text
                @click='confirmDeleteVehicleBranch(data)'/>
            </div>
          </template>
        </Column>
      </DataTable>
    </div>
    <div class='col-6 pl-2'>
      <DataTable
        v-bind='DEFAULT_DATATABLE_CONFIG'
        v-model:selection='selectedRowVehicleModel'
        :pt="{
          wrapper: {
            class: 'h-full surface-overlay',
          },
        }"
        row-hover
        :value='vehicleModels'>
        <Column
          class='text-center'
          header='TT'
          style='width: 5rem'>
          <template #body='slotProps'>
            <div
              class='align-items-center flex items-center justify-content-center'>
              {{ slotProps.index + 1 }}
            </div>
          </template>
        </Column>

        <Column
          field='code'
          :header='t(`vehicle.vehicleModel.code`)'
          header-class='header-left'
          style='width: 15rem'></Column>

        <Column
          field='name'
          :header='t(`vehicle.vehicleModel.name`)'
          header-class='header-left'
          style='width: 20rem'></Column>

        <Column>
          <template #body='{ data }'>
            <div class='flex gap-2 group-btn justify-content-end mr-5'>
              <ButtonIcon
                v-tooltip.top='"Sửa"'
                icon='edit'
                icon-size='1.5'
                rounded
                text
                @click='editVehicleModel(data)'/>
              <ButtonIcon
                v-tooltip.top='t("common.delete")'
                class='text-red-400'
                icon='delete'
                icon-size='1.5'
                rounded
                text
                @click='confirmDeleteVehicleModel(data)'/>
            </div>
          </template>
        </Column>
      </DataTable>
    </div>
  </div>
  <VehicleBranchForm
    v-if='showForm'
    :id='selectedRow?.id || undefined'
    :is-detail='isDetail'
    :visible-dialog='showForm'
    @hide-dialog='hideDialogFn'
    @refresh='reload'/>
  <VehicleModeForm
    v-if='showFormVehicleModel'
    :id='selectedRowVehicleModel?.id || undefined'
    :vehicle-branch='selectedRow?.name || undefined'
    :visible-dialog='showFormVehicleModel'
    @hide-dialog='hideDialogFn'
    @refresh='reload'/>
</template>

<script lang='ts' setup>
import Column from 'primevue/column';
import { useConfirm } from 'primevue/useconfirm';
import { inject, reactive, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import {
  deleteVehicleBranch,
  deleteVehicleModel,
  getAllVehicleModelByBranch,
  searchVehicleBranch,
} from '@/apps/vehicle/api/graphql/vehicle-branch';
import type { IVehicleBranch, IVehicleModel, } from '@/apps/vehicle/model/vehicleBranch';
import VehicleBranchForm from '@/apps/vehicle/views/vehicleBranch/VehicleBranchForm.vue';
import VehicleModeForm from '@/apps/vehicle/views/vehicleBranch/VehicleModeForm.vue';
import AppIcon from '@/common/components/app/AppIcon.vue';
import ButtonIcon from '@/common/components/custom/ButtonIcon.vue';
import { DEFAULT_DATATABLE_CONFIG, } from '@/common/constants';
import { toastSuccess } from '@/common/helpers/custom-toast-service';
import { generateAvatarUrl } from '@/common/helpers/file-utils';

const { t } = useI18n();
const searchTerm = inject('searchTerm', ref(''));
const showForm = ref(false);
const showFormVehicleModel = ref(false);
const vehicleBranch = ref<IVehicleBranch[]>([]);
const vehicleModels = ref<IVehicleModel[]>([]);
const selectedRow = ref<IVehicleBranch>();
const selectedRowVehicleModel = ref<IVehicleModel>();
const totalRecords = ref();
const isDetail = ref(false);
const confirm = useConfirm();

const searchParams = reactive({ keyword: '', });

const {
  onResult: searchVehicleBranchResult,
  refetch: searchVehicleBranchRefetch
} =
  searchVehicleBranch(searchParams);

const {
  onResult: getAllVehicleModelResult,
  refetch: getAllVehicleModelRefetch
} =
  getAllVehicleModelByBranch('');

const vehicleBranchName = ref<any>();
watch(selectedRow, newVal => {
  if (newVal) {
    getAllVehicleModelRefetch({ vehicleBranch: newVal.name || '' });
    vehicleBranchName.value = newVal.name;
  }
});
watch(searchTerm, (newValue) => {
  searchParams.keyword = newValue;
  searchVehicleBranchRefetch(searchParams);
});

const {
  mutate: deleteVehicleBranchMutate,
  onDone: deleteVehicleBranchOnDone
} =
  deleteVehicleBranch();

getAllVehicleModelResult((res) => {
  vehicleModels.value = res.data.getAllVehicleModelByBranch;
});

function reload() {
  searchVehicleBranchRefetch();
  getAllVehicleModelRefetch({ vehicleBranch: vehicleBranchName.value });
}

searchVehicleBranchResult((res) => {
  vehicleBranch.value = res.data.searchVehicleBranch;
  if (vehicleBranchName.value) {
    selectedRow.value = vehicleBranch.value.find(item => item.name === vehicleBranchName.value);
  }
});

function showFormCreate() {
  selectedRow.value = undefined;
  showForm.value = true;
}

const editVehicleBranch = (data: any) => {
  selectedRow.value = data;
  showForm.value = true;
};

const editVehicleModel = (data: any) => {
  selectedRowVehicleModel.value = data;
  showFormVehicleModel.value = true;
};

function hideDialogFn() {
  showFormVehicleModel.value = false;
  showForm.value = false;
  isDetail.value = false;
  selectedRow.value = undefined;
  reload();
}

const addVehicleModel = (data: any) => {
  selectedRow.value = data;
  showFormVehicleModel.value = true;
};

const confirmDeleteVehicleBranch = (data: any) => {
  confirm.require({
    message: t('common.confirmDelete', { itemName: data.name }),
    header: t('common.delete'),
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: t('common.delete'),
    acceptClass: 'p-button-danger',
    rejectLabel: t('common.cancel'),
    accept: () => {
      handleDeleteVehicleBranch(data);
    },
  });
};

const handleDeleteVehicleBranch = (data: any) => {
  deleteVehicleBranchMutate({ id: data?.id });
};

deleteVehicleBranchOnDone(() => {
  toastSuccess({ message: t('Xóa thành công') });
  reload();
});

const {
  mutate: deleteVehicleModelMutate,
  onDone: deleteVehicleModelOnDone
} =
  deleteVehicleModel();

const confirmDeleteVehicleModel = (data: any) => {
  confirm.require({
    message: t('common.confirmDelete', { itemName: data.name }),
    header: t('common.delete'),
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: t('common.delete'),
    acceptClass: 'p-button-danger',
    rejectLabel: t('common.cancel'),
    accept: () => {
      handleDeleteVehicleModel(data);
    },
  });
};

const handleDeleteVehicleModel = (data: any) => {
  deleteVehicleModelMutate({ id: data?.id });
};

deleteVehicleModelOnDone(() => {
  toastSuccess({ message: t('Xóa thành công') });
  reload();
});

const items = [
  {
    label: t('common.create') + ' ' + t('vehicle.vehicleBranch.titleForm'),
    icon: '',
    command: () => {
      showForm.value = true;
    }
  },
  {
    label: t('common.create') + ' ' + t('vehicle.vehicleModel.titleForm'),
    icon: '',
    command: () => {
      showFormVehicleModel.value = true;
    }
  },
];
</script>

<style scoped>
:deep(.header-left > .p-column-header-content) {
  justify-content: start !important;
}

:deep(.p-datatable-tbody > tr:hover .group-btn) {
  opacity: 1;
  pointer-events: auto;
}

:deep(.group-btn) {
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s ease;
}

:deep(.branch .p-datatable .p-datatable-tbody > tr > td) {
  padding: 0.3rem 1rem;
}
</style>
