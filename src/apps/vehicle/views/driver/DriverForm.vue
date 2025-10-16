<template>
  <Sidebar
    v-model:visible='visibleForm'
    v-bind='DEFAULT_SIDEBAR_CONFIG'
    :show-close-icon='false'
    @hide="emits('hide-dialog')">
    <template #header>
      <div class='align-items-center flex justify-content-between w-full'>
        <div class='align-items-center flex gap-2 p-sidebar-header-content'>
          <Button
            icon='pi pi-arrow-left'
            severity='danger'
            @click="emits('hide-dialog')"/>
          {{
            t(`vehicle.common.${id ? 'update' : 'create'}`) +
              ' ' +
              t('vehicle.driver.titleForm')
          }}
        </div>
      </div>
    </template>
    <form
      ref='form'>
      <div class='formgrid grid mb-4 w-full'>
        <div class='col-6 field'>
          <label
            class='font-bold'>{{
              t(`vehicle.driver.driverSource`)
            }}</label>
          <div class='flex flex-wrap gap-7 p-2'>
            <div class='align-items-center flex'>
              <RadioButton
                v-model='driverSource'
                input-id='ingredient1'
                :value='DriverSource.INTERNAL'/>
              <label
                class='ml-2'
                for='ingredient1'>{{ t(`vehicle.driver.INTERNAL`) }}</label>
            </div>
            <div class='align-items-center flex'>
              <RadioButton
                v-model='driverSource'
                input-id='ingredient2'
                :value='DriverSource.OUTSOURCED'/>
              <label
                class='ml-2'
                for='ingredient2'>{{ t(`vehicle.driver.OUTSOURCED`) }}</label>
            </div>
          </div>
        </div>

        <div class='col-6 field'></div>

        <div class='col-5 field'>
          <label
            v-required
            class='font-bold'>{{
              t(`vehicle.driver.fullname`)
            }}</label>
          <NamedSelectUser
            v-if='driverSource===DriverSource.INTERNAL'
            v-model='user'
            :button-select-user='false'
            class='w-full'
            name='fullname'
            style='height: 40px'/>
          <InputText
            v-else
            v-model='driver.fullname'
            class='p-component p-inputtext w-full'
            maxlength='255'
            name='fullname'/>
          <ValidateErrorMessage :errors='v$.fullname.$errors'/>
        </div>

        <div class='col-1'></div>

        <div class='col-5 field'>
          <label
            class='font-bold'>{{
              t(`vehicle.driver.gender`)
            }}</label>
          <div class='flex flex-wrap gap-7 p-2'>
            <div class='align-items-center flex'>
              <RadioButton
                v-model='gender'
                :disabled='driverSource===DriverSource.INTERNAL'
                input-id='ingredient5'
                :value='true'/>
              <label
                class='ml-2'
                for='ingredient5'>Nam</label>
            </div>
            <div class='align-items-center flex'>
              <RadioButton
                v-model='gender'
                :disabled='driverSource===DriverSource.INTERNAL'
                input-id='ingredient6'
                :value='false'/>
              <label
                class='ml-2'
                for='ingredient6'>Nữ</label>
            </div>
          </div>
        </div>

        <div class='col-5 field'>
          <label
            v-required
            class='font-bold'>{{
              t(`vehicle.driver.phone`)
            }}</label>
          <InputText
            v-model='driver.phone'
            class='p-component p-inputtext w-full'
            :disabled='driverSource===DriverSource.INTERNAL'
            maxlength='255'
            name='phone'/>
          <ValidateErrorMessage :errors='v$.phone.$errors'/>
        </div>

        <div class='col-12 field'>
          <label
            class='font-bold'>{{
              driverSource === DriverSource.INTERNAL ? t(`vehicle.driver.organization`) : t(`vehicle.menu.vehicleRentalCompanyManager`)
            }}</label>
          <TreeSelect
            v-if='driverSource===DriverSource.INTERNAL'
            v-model='organization'
            class='mt-1 w-full'
            disabled
            :empty-message="t('common.selectEmpty')"
            :filter='true'
            input-id='organizationParent'
            :options='organizations'
            selection-mode='multiple'>
            <template
              #value='{ value }: { value: TreeNode[]; placeholder: String }'>
              <div
                v-if='value.length > 0'
                class='flex gap-2'>
                <div
                  v-for='v of value'
                  :key='v.key'>
                  <Chip :label='v.label'/>
                </div>
              </div>
              <div v-else>
                {{ t('admin.organization.parent') }}
              </div>
            </template>
          </TreeSelect>

          <Dropdown
            v-else
            v-model='driver.vehicleRentalCompanyId'
            class='p-component w-full'
            option-label='name'
            option-value='id'
            :options='vehicleRentalCompanies'>
          </Dropdown>
        </div>

        <div class='col-5 field'>
          <label
            class='font-bold'>{{
              t(`vehicle.driver.driverLicense`)
            }}</label>
          <Dropdown
            v-model='driver.driverLicense'
            class='p-component w-full'
            :options='driverLicenses'>
          </Dropdown>
        </div>

        <div class='col-5 field'>
          <label>{{
            t(`vehicle.driver.driverLicenseExpiryDate`)
          }}</label>
          <Calendar
            v-model='driver.driverLicenseExpiryDate'
            class='w-full'
            icon-display='input'
            show-icon/>
        </div>

        <div class='col-7 field'>
          <label
            class='font-bold'>{{
              t(`vehicle.driver.driverType`)
            }}</label>
          <div class='flex flex-wrap gap-7 p-2'>
            <div class='align-items-center flex'>
              <RadioButton
                v-model='driverType'
                input-id='ingredient3'
                :value='DriverType.DRIVER_FOR_DIRECTORS'/>
              <label
                class='ml-2'
                for='ingredient3'>{{ t(`vehicle.driver.DRIVER_FOR_DIRECTORS`) }}</label>
            </div>
            <div class='align-items-center flex'>
              <RadioButton
                v-model='driverType'
                input-id='ingredient4'
                :value='DriverType.GENERAL'/>
              <label
                class='ml-2'
                for='ingredient4'>{{ t(`vehicle.driver.GENERAL`) }}</label>
            </div>
          </div>
        </div>

        <div class='col-12 mb-4'>
          <div class='align-items-center flex justify-content-between'>
            <label class='font-bold'>Danh sách xe đang quản lý</label>
            <ButtonIcon
              icon='add_circle'
              icon-size='1.5'
              rounded
              text
              @click='showVehicleDialog = true'/>
          </div>

          <DataTable
            class='mt-2'
            :show-gridlines='true'
            :value='vehiclesFilter'>
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
              class='text-center'
              field='licensePlate'
              header='Biển số'></Column>
            <Column
              class='text-center'
              header='Hãng xe/Dòng xe'>
              <template #body='{data}'>
                {{ data.vehicleBranch }}/{{ data.vehicleType }}
              </template>
            </Column>
            <Column
              class='text-center'
              field='numberOfSeats'
              header='Số chỗ ngồi'></Column>
            <Column
              class='text-center'
              field='yearOfManufacture'
              header='Năm SX'></Column>
            <Column
              class='text-center'
              style='width: 5%'>
              <template #body='{data}'>
                <ButtonIcon
                  v-tooltip.top="t('common.delete')"
                  class='text-red-300'
                  icon='delete'
                  icon-size='1.4'
                  rounded
                  text
                  @click='deleteVehicle(data.id)'/>
              </template>
            </Column>
          </DataTable>
        </div>

        <div class='align-items-center col-12 flex gap-8'>
          <div class='field'>
            <label class='font-bold'>{{ t('vehicle.common.status') }}</label>
            <div>
              <NamedDropdown
                v-model='driver.status'
                class='w-20rem'
                name='status'
                option-label='label'
                option-value='value'
                :options='statuses'/>
            </div>
          </div>

          <div class='field'>
            <label class='font-bold'>{{ t(`vehicle.common.norder`) }}</label>
            <div>
              <InputNumber
                v-model='driver.norder'
                input-id='integeronly'/>
              <input
                v-model='driver.norder'
                hidden
                name='norder'/>
            </div>
          </div>
        </div>
      </div>

      <div
        class='border-primary-100 border-top-1 bottom-0 fixed flex gap-2 justify-content-center p-3 py-1 surface-overlay'
        style='width: 96%'>
        <Button
          class='p-button-plain'
          icon='pi pi-times'
          :label="t('common.close')"
          severity='danger'
          @click="emits('hide-dialog')"/>
        <Button
          :disabled='isDisable'
          icon='pi pi-save'
          :label="t('common.save')"
          @click='submit'/>
      </div>
    </form>
  </Sidebar>

  <ListVehicleDialog
    v-if='showVehicleDialog'
    :selected-vehicle-ids='listIdVehicle'
    :visible-dialog='showVehicleDialog'
    @hide-dialog='hideDialogFn'
    @selected-vehicles='listIdVehicle = $event'/>
</template>

<script setup lang='ts'>

import { useVuelidate } from '@vuelidate/core';
import { helpers, required } from '@vuelidate/validators';
import { cloneDeep, get } from 'lodash';
import { storeToRefs } from 'pinia';
import Column from 'primevue/column';
import type { TreeNode } from 'primevue/treenode';
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { getAllOrganizationGraphql } from '@/apps/admin/api/graphql/organization-graphql-api';
import type { OrganizationInterface } from '@/apps/admin/model/organization';
import { useUserMoreInfoStore } from '@/apps/admin/store/usersMoreInfo';
import { getDriverById, maxNOrder, saveDriver } from '@/apps/vehicle/api/graphql/driver';
import { getAllVehicle } from '@/apps/vehicle/api/graphql/vehicle';
import { getAllVehicleRentalCompany } from '@/apps/vehicle/api/graphql/vehicleRentalCompany';
import { type Driver, DriverSource, DriverType } from '@/apps/vehicle/model/driver';
import type { IVehicle } from '@/apps/vehicle/model/vehicle';
import type { VehicleRentalCompany } from '@/apps/vehicle/model/vehicleRentalCompany';
import ListVehicleDialog from '@/apps/vehicle/views/driver/ListVehicleDialog.vue';
import NamedDropdown from '@/common/components/custom/NamedDropdown.vue';
import NamedSelectUser from '@/common/components/custom/NamedSelectUser.vue';
import { DateTimeFormat, DEFAULT_SIDEBAR_CONFIG } from '@/common/constants';
import { toastSuccess } from '@/common/helpers/custom-toast-service';
import useMoment from '@/common/helpers/mixins/use-moment';
import { listToTree } from '@/common/helpers/utils';

const props = defineProps({
  visibleDialog: {
    type: Boolean,
    default: false,
  },
  id: {
    type: String,
    default: null,
  },
});
const emits = defineEmits(['hide-dialog']);
const isDisable = ref(false);
const { t } = useI18n();
const form = ref<HTMLFormElement>();
const visibleForm = ref(props.visibleDialog);
const driver = ref<Driver>({} as Driver);
const driverSource = ref(DriverSource.INTERNAL);
const driverType = ref(DriverType.GENERAL);
const gender = ref(true);
const organizations = ref();
const listIdVehicle = ref<string[]>([]);
const organization = ref();
const user = ref<string>();
const { usersMoreInfo } = storeToRefs(useUserMoreInfoStore());
const showVehicleDialog = ref(false);

const validateRules = {
  fullname: {
    required: helpers.withMessage(
      t('vehicle.driver.requiredFullname'),
      required,
    ),
  },
  phone: {
    required: helpers.withMessage(
      t('vehicle.driver.requiredPhone'),
      required,
    ),
  },
};
const v$ = useVuelidate(validateRules, driver);

if (props.id) {
  const { onResult: getDriverByIdOnResult } = getDriverById(props.id);
  getDriverByIdOnResult((res) => {
    driver.value = cloneDeep(res.data.getDriverById);
    driverSource.value = driver.value.driverSource;
    driverType.value = driver.value.driverType;
    gender.value = driver.value.gender;
    listIdVehicle.value = driver.value.listVehicles;
    user.value = driver.value.userId;
    driver.value.driverLicenseExpiryDate = new Date(driver.value.driverLicenseExpiryDate);
  });
} else {
  driver.value.status = true;
  const { onResult } = maxNOrder();
  onResult((res) => {
    driver.value.norder = res.data.maxNOrderDriver;
  });
}

const deleteVehicle = (id: any) => {
  listIdVehicle.value = listIdVehicle.value.filter((vehicleId) => vehicleId !== id);
};

const vehicleRentalCompanies = ref<VehicleRentalCompany[]>([]);
const { onResult } = getAllVehicleRentalCompany();
onResult((res) => {
  vehicleRentalCompanies.value = res.data.getAllVehicleRentalCompany;
});

watch(user, newVal => {
  if (newVal) {
    driver.value.fullname = usersMoreInfo.value[newVal]?.fullName;
    driver.value.phone = usersMoreInfo.value[newVal]?.phone;
    gender.value = usersMoreInfo.value[newVal]?.gender === 1;
    organization.value = usersMoreInfo.value[newVal]?.departments?.reduce(
      (acc, dept) => {
        if (dept?.id) {
          acc[dept.id] = true;
        }
        return acc;
      },
      {} as Record<string, boolean>
    ) || {};
  }
});

const vehicles = ref();
const vehiclesFilter = computed(() =>
  vehicles.value?.filter((v: IVehicle) => listIdVehicle.value.includes(v.id))
);
const { onResult: getAllVehicleResult } = getAllVehicle();
getAllVehicleResult((res) => {
  vehicles.value = res.data.getAllVehicle;
});

const {
  mutate,
  onDone
} = saveDriver();

const hideDialogFn = () => {
  showVehicleDialog.value = false;
};
const { moment } = useMoment();
const submit = () => {
  v$.value
    .$validate()
    .then((isValid) => {
      if (isValid && driver.value) {
        mutate({
          driverPayload: {
            ...driver.value,
            userId: user.value,
            driverSource: driverSource.value,
            gender: gender.value,
            driverType: driverType.value,
            listVehicles: listIdVehicle.value,
            driverLicenseExpiryDate: moment(driver.value.driverLicenseExpiryDate).format(DateTimeFormat.ISO_LOCAL_DATE),
            organizationIds: Object.keys(organization.value || []).filter((key) => organization.value[key]),
          },
        });
      }
    })
    .then(() => isDisable.value = false);
};

onDone(() => {
  toastSuccess({ message: t('Lưu thành công.') });
  emits('hide-dialog');
});

const { onResult: getAllOrganizationResult } = getAllOrganizationGraphql();
getAllOrganizationResult((response) => {
  const data = get(response, 'data.allOrganizationPublic', []);
  organizations.value = listToTree(
    data.map((organization: OrganizationInterface) => ({
      key: organization.id,
      label: organization.name,
      data: organization.code,
      parentId: organization.parentCode,
      children: [],
    })),
    {
      id: 'data',
      parentId: 'parentId',
      children: 'children',
    },
  );
});

const statuses = ref([
  {
    value: true,
    label: t('common.statuses.active'),
  },
  {
    value: false,
    label: t('common.statuses.deactivate'),
  },
]);

const driverLicenses = ref([
  'B1', 'B2', 'C', 'D', 'E',
]);
</script>

<style scoped>

</style>