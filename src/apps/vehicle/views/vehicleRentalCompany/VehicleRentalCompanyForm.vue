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
              t(`vehicle.menu.vehicleRentalCompanyManager`)

          }}
        </div>
      </div>
    </template>
    <form
      ref='form'>
      <div class='formgrid grid mb-4 w-full'>
        <div class='col-6 field'>
          <label
            v-required
            class='font-bold'>{{
              t(`vehicle.vehicleRentalCompany.code`)
            }}</label>
          <InputText
            v-model='data.code'
            class='p-component p-inputtext w-full'
            maxlength='255'
            name='code'/>
          <ValidateErrorMessage :errors='v$.code.$errors'/>
        </div>
        <div class='col-6 field'>
          <label
            v-required
            class='font-bold'>{{
              t(`vehicle.vehicleRentalCompany.name`)
            }}</label>
          <InputText
            v-model='data.name'
            class='p-component p-inputtext w-full'
            maxlength='255'
            name='name'/>
          <ValidateErrorMessage :errors='v$.name.$errors'/>
        </div>

        <div class='col-6 field'>
          <label
            class='font-bold'>{{
              t(`vehicle.vehicleRentalCompany.address`)
            }}</label>
          <InputText
            v-model='data.address'
            class='p-component p-inputtext w-full'
            maxlength='255'
            name='address'/>
        </div>
        <div class='col-6 field'>
          <label
            class='font-bold'>{{
              t(`vehicle.vehicleRentalCompany.phone`)
            }}</label>
          <InputText
            v-model='data.phone'
            class='p-component p-inputtext w-full'
            maxlength='255'
            name='phone'/>
        </div>

        <div class='col-6 field'>
          <label
            class='font-bold'>{{
              t(`vehicle.vehicleRentalCompany.email`)
            }}</label>
          <InputText
            v-model='data.email'
            class='p-component p-inputtext w-full'
            maxlength='255'
            name='email'/>
        </div>
        <div class='col-6 field'>
          <label
            class='font-bold'>{{
              t(`vehicle.vehicleRentalCompany.website`)
            }}</label>
          <InputText
            v-model='data.website'
            class='p-component p-inputtext w-full'
            maxlength='255'
            name='website'/>
        </div>

        <div class='col-6 field'>
          <label
            class='font-bold'>{{
              t(`vehicle.vehicleRentalCompany.taxCode`)
            }}</label>
          <InputText
            v-model='data.taxCode'
            class='p-component p-inputtext w-full'
            maxlength='255'
            name='taxCode'/>
        </div>
        <div class='col-6 field'>
          <label
            class='font-bold'>{{
              t(`vehicle.vehicleRentalCompany.contactPerson`)
            }}</label>
          <InputText
            v-model='data.contactPerson'
            class='p-component p-inputtext w-full'
            maxlength='255'
            name='contactPerson'/>
        </div>

        <div class='col-6 field'>
          <label
            class='font-bold'>{{
              t(`vehicle.vehicleRentalCompany.contactPhone`)
            }}</label>
          <InputText
            v-model='data.contactPhone'
            class='p-component p-inputtext w-full'
            maxlength='255'
            name='contactPhone'/>
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
</template>

<script setup lang='ts'>

import { useVuelidate } from '@vuelidate/core';
import { helpers, required } from '@vuelidate/validators';
import { cloneDeep } from 'lodash';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { getVehicleRentalCompanyById, saveVehicleRentalCompany } from '@/apps/vehicle/api/graphql/vehicleRentalCompany';
import type { VehicleRentalCompany } from '@/apps/vehicle/model/vehicleRentalCompany';
import { DEFAULT_SIDEBAR_CONFIG } from '@/common/constants';
import { toastSuccess } from '@/common/helpers/custom-toast-service';

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
const data = ref<VehicleRentalCompany>({} as VehicleRentalCompany);

const validateRules = {
  code: {
    required: helpers.withMessage(
      t('vehicle.vehicleRentalCompany.requiredCode'),
      required,
    ),
  },
  name: {
    required: helpers.withMessage(
      t('vehicle.vehicleRentalCompany.requiredName'),
      required,
    ),
  },
};
const v$ = useVuelidate(validateRules, data);

if (props.id) {
  const { onResult: getVehicleRentalCompanyByIdOnResult } = getVehicleRentalCompanyById(props.id);
  getVehicleRentalCompanyByIdOnResult((res) => {
    data.value = cloneDeep(res.data.getVehicleRentalCompanyById);
  });
}

const {
  mutate,
  onDone
} = saveVehicleRentalCompany();

const submit = () => {
  isDisable.value = true;
  v$.value
    .$validate()
    .then((isValid) => {
      if (isValid && data.value) {
        mutate({ vehicleRentalCompany: { ...data.value }, });
      }
    })
    .then(() => isDisable.value = false);
};

onDone(() => {
  toastSuccess({ message: t('Lưu thành công.') });
  emits('hide-dialog');
});
</script>

<style scoped>

</style>