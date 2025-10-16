<template>
  <Dialog
    v-model:visible='visibleForm'
    v-bind='DEFAULT_DIALOG_CONFIG'
    :header="
      isDetail
        ? t('vehicle.locationPoint.titleForm')
        : t(`vehicle.common.${id ? 'update' : 'create'}`) +
          ' ' +
          t('vehicle.locationPoint.titleForm')
    "
    @hide="emits('hide-dialog')">
    <div>
      <form ref='form'>
        <div class='formgrid grid mb-4'>
          <input
            v-model='locationPoint.id'
            hidden='' />
          <div class='col-6 field'>
            <label
              v-required
              class='font-bold'>{{
                t(`vehicle.locationPoint.name`)
              }}</label>
            <div v-if='!isDetail'>
              <InputText
                v-model='locationPoint.name'
                class='p-component p-inputtext w-full'
                maxlength='255'
                name='name'/>
              <ValidateErrorMessage :errors='v$.name.$errors' />
            </div>
            <div v-else>
              {{ locationPoint.name }}
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
        </div>
      </form>
    </div>
  </Dialog>
</template>

<script setup lang="ts">
import { useVuelidate } from '@vuelidate/core';
import { helpers, required } from '@vuelidate/validators';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

import {
  getLocationPointById,
  saveLocationPoint,
} from '@/apps/vehicle/api/graphql/location-point';
import type { ILocationPoint } from '@/apps/vehicle/model/locationPoint';
import { DEFAULT_DIALOG_CONFIG } from '@/common/constants';
import { toastSuccess } from '@/common/helpers/custom-toast-service';

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
const emits = defineEmits(['hide-dialog']);
const isDisable = ref(false);
const { t } = useI18n();
const form = ref<HTMLFormElement>();
const visibleForm = ref(props.visibleDialog);
const locationPoint = ref<ILocationPoint>({} as ILocationPoint);

const validateRules = {
  name: {
    required: helpers.withMessage(
      t('vehicle.locationPoint.error.requiredName'),
      required,
    ),
  },
};

const v$ = useVuelidate(validateRules, locationPoint);

if (props.id) {
  const { onResult: locationPointOnResult } = getLocationPointById(props.id);
  locationPointOnResult((res) => {
    locationPoint.value = { ...res.data.getLocationPointById };
  });
}

const { mutate } = saveLocationPoint();

const submitForm = () => {
  isDisable.value = true;
  v$.value
    .$validate()
    .then((isValid) => {
      if (isValid && locationPoint.value) {
        mutate({ locationPointInput: { ...locationPoint.value } }).then(() => {
          toastSuccess({ message: t('done') });
          emits('hide-dialog');
        });
      }
    })
    .then(() => isDisable.value = false);
};
</script>

<style lang="scss" scoped></style>
