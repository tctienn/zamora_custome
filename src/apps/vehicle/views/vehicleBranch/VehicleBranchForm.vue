<template>
  <Dialog
    v-model:visible='visibleForm'
    v-bind='DEFAULT_DIALOG_CONFIG'
    :header="
      isDetail
        ? t('vehicle.vehicleBranch.titleForm')
        : t(`vehicle.common.${id ? 'update' : 'create'}`) +
          ' ' +
          t('vehicle.vehicleBranch.titleForm')
    "
    @hide="emits('hide-dialog')">
    <div>
      <form ref='form'>
        <div class='formgrid grid mb-4'>
          <div class='col-6 field'>
            <label
              v-required
              class='font-bold'>{{
                t(`vehicle.vehicleBranch.code`)
              }}</label>
            <div v-if='!isDetail'>
              <InputText
                v-model='vehicleBranch.code'
                class='p-component p-inputtext w-full'
                maxlength='255'
                name='code'/>
              <ValidateErrorMessage :errors='v$.code.$errors'/>
            </div>
            <div v-else>
              {{ vehicleBranch.code }}
            </div>
          </div>
          <input
            v-model='vehicleBranch.id'
            hidden=''/>

          <div class='col-6 field'>
            <label
              v-required
              class='font-bold'>{{
                t(`vehicle.vehicleBranch.name`)
              }}</label>
            <div v-if='!isDetail'>
              <InputText
                v-model='vehicleBranch.name'
                class='p-component p-inputtext w-full'
                maxlength='255'
                name='name'/>
              <ValidateErrorMessage :errors='v$.name.$errors'/>
            </div>
            <div v-else>
              {{ vehicleBranch.name }}
            </div>
          </div>

          <div class='col-4 field'>
            <label
              class='font-bold'>Logo</label>
            <div v-if='!isDetail'>
              <div
                v-if='!logo'
                class='align-items-center border-round cursor-pointer flex font-bold h-8rem justify-content-center surface-200 w-full'
                @click='imgRef?.click()'>
                {{ $t('common.upload') }}
              </div>
              <div
                v-else
                class='relative w-full'>
                <img
                  alt='Image'
                  class='cursor-pointer img max-h-64 object-contain w-full'
                  :src='logo as string'
                  @click='imgRef?.click()'/>
              </div>
              <input
                hidden
                name='isChangedLogo'
                :value='vehicleBranch.isChangedLogo'/>
              <input
                ref='imgRef'
                accept='image/*'
                hidden
                name='logo'
                type='file'
                @change='changeLogo'/>
            </div>
            <div v-else>
            </div>
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
            v-if='!isDetail'
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
import { cloneDeep } from 'lodash';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { getVehicleBranchById, } from '@/apps/vehicle/api/graphql/vehicle-branch';
import { createVehicleBranch, updateVehicleBranch } from '@/apps/vehicle/api/rest/vehicle';
import type { IVehicleBranch } from '@/apps/vehicle/model/vehicleBranch';
import { DEFAULT_DIALOG_CONFIG } from '@/common/constants';
import { toastError, toastSuccess } from '@/common/helpers/custom-toast-service';
import { generateAvatarUrl } from '@/common/helpers/file-utils';

const props = defineProps({
  isDetail: {
    type: Boolean,
    default: false,
  },
  isSidebar: {
    type: Boolean,
    default: true,
  },
  visibleDialog: {
    type: Boolean,
    default: false,
  },
  id: {
    type: String,
    default: null,
  },
});
const emits = defineEmits(['hide-dialog', 'refresh']);
const imgRef = ref<HTMLInputElement>();
const isDisable = ref(false);
const { t } = useI18n();
const form = ref<HTMLFormElement>();
const visibleForm = ref(props.visibleDialog);
const vehicleBranch = ref<IVehicleBranch>({} as IVehicleBranch);

const validateRules = {
  name: {
    required: helpers.withMessage(
      t('vehicle.vehicleBranch.error.requiredName'),
      required,
    ),
  },
  code: {
    required: helpers.withMessage(
      t('vehicle.vehicleBranch.error.requiredCode'),
      required,
    ),
  },
};

const v$ = useVuelidate(validateRules, vehicleBranch);

function changeLogo(e: Event) {
  const target = e.target as HTMLInputElement;
  const file = target.files?.[0];

  if (file) {
    vehicleBranch.value.isChangedLogo = true;
    createImage(file);
  }
}

const logo = ref();

function createImage(file: File) {
  const reader = new FileReader();

  reader.onload = (e) => {
    logo.value = e.target?.result;
  };
  reader.readAsDataURL(file);
}

if (props.id) {
  const { onResult: vehicleBranchOnResult } = getVehicleBranchById(props.id);
  vehicleBranchOnResult((res) => {
    vehicleBranch.value = cloneDeep(res.data.getVehicleBranchById);
    logo.value = generateAvatarUrl(res.data.getVehicleBranchById.logo.path);
  });
} else {
  vehicleBranch.value.isChangedLogo = false;
}

const clearData = () => {
  vehicleBranch.value.id = null;
  vehicleBranch.value.name = null;
  vehicleBranch.value.code = null;
  logo.value = null;
  if (imgRef.value) {
    imgRef.value.value = '';
  }
  v$.value.$reset();
};

const saveAndContinue = () => {
  isDisable.value = true;
  v$.value
    .$validate()
    .then((isValid) => {
      if (isValid && form.value) {
        const formData = new FormData(form.value);
        if (props.id) {
          formData.append('id', props.id);
          updateVehicleBranch(formData)
            .then(() => {
              toastSuccess({ message: t('Lưu thành công.') });
              clearData();
              emits('refresh');
            })
            .catch((reson) =>
              toastError({ message: t(`vehicle.common.${reson.code.toString()}`), }),
            );
        } else {
          createVehicleBranch(formData)
            .then(() => {
              toastSuccess({ message: t('Lưu thành công.') });
              clearData();
              emits('refresh');
            })
            .catch((reson) =>
              toastError({ message: t(`vehicle.common.${reson.code.toString()}`), }),
            );
        }
      }
    })
    .then(() => isDisable.value = false);
};

const submitForm = () => {
  isDisable.value = true;
  v$.value
    .$validate()
    .then((isValid) => {
      if (isValid && form.value) {
        const formData = new FormData(form.value);
        if (props.id) {
          formData.append('id', props.id);
          updateVehicleBranch(formData)
            .then(() => {
              toastSuccess({ message: t('Lưu thành công.') });
              emits('hide-dialog');
            })
            .catch((reson) =>
              toastError({ message: t(`vehicle.common.${reson.code.toString()}`), }),
            );
        } else {
          createVehicleBranch(formData)
            .then(() => {
              toastSuccess({ message: t('Lưu thành công.') });
              emits('hide-dialog');
            })
            .catch((reson) =>
              toastError({ message: t(`vehicle.common.${reson.code.toString()}`), }),
            );
        }
      }
    })
    .then(() => isDisable.value = false);
};
</script>

<style lang='scss' scoped>
.img {
  max-height: 120px;
  object-fit: contain;
}
</style>
