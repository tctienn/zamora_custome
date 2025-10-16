<template>
  <Dialog
    v-model:visible='visibleForm'
    v-bind='DEFAULT_DIALOG_CONFIG'
    :header="t(`vehicle.common.${id ? 'update' : 'create'}`) +
      ' ' +
      t('vehicle.vehicleModel.titleForm')
    "
    @hide="emits('hide-dialog')">
    <div>
      <form ref='form'>
        <div class='formgrid grid mb-4'>
          <div class='col-6 field'>
            <label
              v-required
              class='font-bold'>{{
                t(`vehicle.vehicleModel.code`)
              }}</label>
            <InputText
              v-model='vehicleModel.code'
              class='p-component p-inputtext w-full'
              maxlength='255'
              name='code'/>
            <ValidateErrorMessage :errors='v$.code.$errors'/>
          </div>
          <input
            v-model='vehicleModel.id'
            hidden/>
          <div class='col-6 field'>
            <label
              v-required
              class='font-bold'>{{
                t(`vehicle.vehicleModel.name`)
              }}</label>
            <InputText
              v-model='vehicleModel.name'
              class='p-component p-inputtext w-full'
              maxlength='255'
              name='name'/>
            <ValidateErrorMessage :errors='v$.name.$errors'/>
          </div>

          <div class='col-6 field'>
            <label
              class='font-bold'>{{
                t(`vehicle.vehicleBranch.titleForm`)
              }}</label>
            <Dropdown
              v-model='vehicleModel.vehicleBranch'
              class='p-component w-full'
              name='vehicleBranch'
              option-label='name'
              option-value='name'
              :options='vehicleBranches'>
            </Dropdown>
          </div>
        </div>
        <div
          class='border-primary-100 border-top-1 bottom-0 fixed flex gap-2 justify-content-center p-3 py-2 surface-overlay'
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
            @click='submitForm'/>
          <Button
            :disabled='isDisable'
            icon='pi pi-plus'
            :label='t("common.saveAndContinue")'
            @click='saveAndContinue'/>
        </div>
      </form>
    </div>
  </Dialog>
</template>

<script setup lang='ts'>
import { useVuelidate } from '@vuelidate/core';
import { helpers, required } from '@vuelidate/validators';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { getAllVehicleBranch, getVehicleModelById, saveVehicleModel } from '@/apps/vehicle/api/graphql/vehicle-branch';
import type { IVehicleBranch, IVehicleModel } from '@/apps/vehicle/model/vehicleBranch';
import { DEFAULT_DIALOG_CONFIG } from '@/common/constants';
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
  vehicleBranch: {
    type: String,
    default: null,
  },
});
const emits = defineEmits(['hide-dialog', 'refresh']);
const isDisable = ref(false);
const { t } = useI18n();
const form = ref<HTMLFormElement>();
const visibleForm = ref(props.visibleDialog);
const vehicleModel = ref<IVehicleModel>({} as IVehicleModel);

const validateRules = {
  name: {
    required: helpers.withMessage(
      t('vehicle.vehicleModel.error.requiredName'),
      required,
    ),
  },
  code: {
    required: helpers.withMessage(
      t('vehicle.vehicleModel.error.requiredCode'),
      required,
    ),
  },
};

const v$ = useVuelidate(validateRules, vehicleModel);

if (props.id) {
  const { onResult: vehicleModelOnResult } = getVehicleModelById(props.id);
  vehicleModelOnResult((res) => {
    vehicleModel.value = { ...res.data.getVehicleModelById };
  });
} else {
  vehicleModel.value.vehicleBranch = props.vehicleBranch;
}

const { mutate } = saveVehicleModel();
const vehicleBranches = ref<IVehicleBranch[]>([]);
const { onResult: getAllVehicleBranchResult } =
  getAllVehicleBranch();

getAllVehicleBranchResult((res) => {
  vehicleBranches.value = res.data.getAllVehicleBranch;
});

const clearData = () => {
  vehicleModel.value.id = null;
  vehicleModel.value.name = null;
  vehicleModel.value.code = null;
  v$.value.$reset();
};

const saveAndContinue = () => {
  isDisable.value = true;
  v$.value
    .$validate()
    .then((isValid) => {
      if (isValid && vehicleModel.value) {
        mutate({ vehicleModelInput: { ...vehicleModel.value } }).then(() => {
          toastSuccess({ message: t('Lưu thành công.') });
          clearData();
          emits('refresh');
        });
      }
    })
    .then(() => isDisable.value = false);
};

const submitForm = () => {
  isDisable.value = true;
  v$.value
    .$validate()
    .then((isValid) => {
      if (isValid && vehicleModel.value) {
        mutate({ vehicleModelInput: { ...vehicleModel.value } }).then(() => {
          toastSuccess({ message: t('Lưu thành công.') });
          emits('hide-dialog');
        });
      }
    })
    .then(() => isDisable.value = false);
};
</script>

<style lang='scss' scoped></style>
