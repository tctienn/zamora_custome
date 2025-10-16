<template>
  <Dialog
    v-model:visible='visibleForm'
    v-bind='DEFAULT_DIALOG_CONFIG'
    :header="t(`book-ticket.common.${city ? 'update' : 'create'}`) +
      ' ' +
      t('book-ticket.country.cityList')
    "
    style='max-height: 70vh; width: 640px;'
    @hide='handleClose'>
    <form @submit.prevent='handleSubmit'>
      <div class='formgrid grid mb-4'>
        <div class='col-12 field'>
          <label
            v-required>
            {{ t('book-ticket.country.city.name') }}
          </label>
          <div>
            <InputText
              v-model='cityLocal.cityName'
              class='p-component p-inputtext w-full'
              maxlength='255'
              name='cityName'/>
            <ValidateErrorMessage :errors='vi$.cityName.$errors'/>
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
          @click='handleClose'/>
        <Button
          icon='pi pi-save'
          :label="t('common.save')"
          type='submit'/>
      </div>
    </form>
  </Dialog>
</template>

<script lang="ts" setup>
import useVuelidate from '@vuelidate/core';
import { helpers, required } from '@vuelidate/validators';
import { cloneDeep } from 'lodash';
import type { PropType } from 'vue';
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import type { ICity } from '@/apps/book-ticket/model/country';
import { DEFAULT_DIALOG_CONFIG } from '@/common/constants';

const props = defineProps({
  visibleDialog: {
    type: Boolean,
    default: false,
  },
  city: {
    type: Object as PropType<ICity>,
    default: () => ({})
  }
});
const emits = defineEmits(['update:visibleDialog', 'submit']);
const { t } = useI18n();

const visibleForm = computed({
  get: () => props.visibleDialog,
  set: (val) => emits('update:visibleDialog', val),
});

const cityLocal = ref<ICity>({} as ICity);
watch(
  () => props.city,
  (newVal) => {
    cityLocal.value = cloneDeep(newVal);
  },
  { immediate: true }
);

const rules = { cityName: { required: helpers.withMessage(t('book-ticket.country.required.cityName'), required) }, };
const vi$ = useVuelidate(rules, cityLocal);

const handleSubmit = async () => {
  const isValid = await vi$.value.$validate();
  if (!isValid) {
    return;
  }
  emits('submit', cityLocal.value);
  handleClose();
};

const handleClose = () => {
  emits('update:visibleDialog', false);
  vi$.value.$reset();
};
</script>