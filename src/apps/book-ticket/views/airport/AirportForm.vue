<template>
  <component
    :is="isSidebar && !isDetail ? 'Sidebar' : 'Dialog'"
    v-model:visible='visibleForm'
    v-bind='DEFAULT_SIDEBAR_CONFIG'
    :header="
      isDetail
        ? t('book-ticket.airport.titleForm')
        : t(`book-ticket.common.${id ? 'update' : 'create'}`) +
          ' ' +
          t('book-ticket.airport.titleForm')
    "
    :position="isSidebar && !isDetail ? 'right' : undefined"
    @hide="emits('hide-dialog')">
    <div>
      <form
        ref='form'>
        <div class='formgrid grid mb-4'>
          <div class='col-12 field'>
            <label>{{
              t(`book-ticket.airport.code`)
            }}<span
              v-if='!isDetail'
              class='ml-2 text-red-500'>*</span></label>
            <div v-if='!isDetail'>
              <InputText
                v-model='airport.code'
                class='p-component p-inputtext w-full'
                maxlength='255'
                name='code'/>
              <ValidateErrorMessage :errors='v$.code.$errors'/>
            </div>
            <div v-else>
              {{ airport.code }}
            </div>
          </div>
          <div class='col-12 field'>
            <label>{{
              t(`book-ticket.airport.name`)
            }}<span
              v-if='!isDetail'
              class='ml-2 text-red-500'>*</span></label>
            <div v-if='!isDetail'>
              <InputText
                v-model='airport.name'
                class='p-component p-inputtext w-full'
                maxlength='255'
                name='name'/>
              <ValidateErrorMessage :errors='v$.name.$errors'/>
            </div>
            <div v-else>
              {{ airport.name }}
            </div>
          </div>
          <div class='col-12 field'>
            <label>{{
              t(`book-ticket.airport.sortOrder`)
            }}</label>
            <div v-if='!isDetail'>
              <InputNumber
                v-model='airport.sortOrder'
                class='w-full'
                maxlength='255'
                name='sortOrder'/>
            </div>
            <div v-else>
              {{ airport.sortOrder }}
            </div>
          </div>
          <div class='col-12 field'>
            <label>{{
              t(`book-ticket.airport.countryId`)
            }}</label>
            <div v-if='!isDetail'>
              <Dropdown
                v-model='airport.countryId'
                class='p-component w-full'
                filter
                option-label='name'
                option-value='id'
                :options='countrys'
                :placeholder="t('book-ticket.airport.placeholder.selectCountry')"
                show-clear/>
            </div>
            <div v-else>
              {{ airport.countryId }}
            </div>
          </div>
          <div class='col-12 field'>
            <label>{{
              t(`book-ticket.airport.cityId`)
            }}</label>
            <div v-if='!isDetail'>
              <Dropdown
                v-model='airport.cityId'
                class='p-component w-full'
                filter
                option-label='cityName'
                option-value='cityId'
                :options='citys'
                :placeholder="t('book-ticket.airport.placeholder.selectCity')"
                show-clear/>
            </div>
            <div v-else>
              {{ airport.cityId }}
            </div>
          </div>
          <div class='col-12 field'>
            <label>{{ t(`book-ticket.common.default`) }}</label>
            <div class='align-items-center flex gap-2 mt-2'>
              <InputSwitch v-model='airport.isDefault'/>
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
            v-if='!isDetail'
            icon='pi pi-save'
            :label="t('common.save')"
            :loading='isSubmitting'
            @click='submit'/>
        </div>
      </form>
    </div>
  </component>
</template>

<script setup lang='ts'>
import useVuelidate from '@vuelidate/core';
import { helpers, required } from '@vuelidate/validators';
import { get } from 'lodash';
import { onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { DEFAULT_SIDEBAR_CONFIG } from '@/common/constants';
import { toastError, toastSuccess } from '@/common/helpers/custom-toast-service';

import { getAirportById, getNextAirportSortOrder, saveAirport } from '../../api/graphql/airport';
import { getAllCountryAndItCity } from '../../api/graphql/country';
import type { IAirport } from '../../model/airport';
import type { ICity, ICountry } from '../../model/country';

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
const { t } = useI18n();
const visibleForm = ref<boolean>(props.visibleDialog);
const airport = ref<IAirport>({} as IAirport);
const citys = ref<ICity[]>([]);
const countrys = ref<ICountry[]>([]);
const allCountryWithCities = ref<ICountry[]>([]);

const isSubmitting = ref<boolean>(false);

const validateRules = {
  code: {
    required: helpers.withMessage(
      t('book-ticket.airport.required.code'),
      required,
    ),
  },
  name: {
    required: helpers.withMessage(
      t('book-ticket.airport.required.name'),
      required,
    ),
  },
};
const v$ = useVuelidate(validateRules, airport);

const updateCityListByCountryId = (countryId?: string) => {
  const selectedCountry = allCountryWithCities.value.find((country) => country.id === countryId);
  citys.value = selectedCountry?.listCity || [];
};

const loadCountryAndCities = async () => {
  const { onResult } = getAllCountryAndItCity();
  onResult((res) => {
    const value = get(res, 'data.getAllCountryAndItCity', []);
    allCountryWithCities.value = value;
    countrys.value = value;
  });
};

const loadAirportDetails = async () => {
  if (props.id) {
    const { onResult: getAirportByIdOnResult } = getAirportById(props.id);
    getAirportByIdOnResult((res) => {
      const value = get(res, 'data.getDetailAirportById');
      airport.value = { ...value };
      updateCityListByCountryId(value.countryId);
    });
  } else {
    const { onResult } = getNextAirportSortOrder();
    onResult((res) => {
      airport.value.sortOrder = res.data.getNextAirportSortOrder;
    });
  }
};

onMounted(async () => {
  await loadCountryAndCities();
  await loadAirportDetails();
});

watch(()=>airport.value.countryId, (newCountryId)=>{
  updateCityListByCountryId(newCountryId);
});

const {
  mutate,
  onDone,
  onError,
} = saveAirport();

const submit = () => {
  v$.value
    .$validate()
    .then((isValid) => {
      if (isValid && airport.value) {
        isSubmitting.value = true;
        mutate({ input: { ...airport.value }, });
      }
    });
};

onDone(() => {
  toastSuccess({ message: props.id ? t('book-ticket.common.updateSuccess') : t('book-ticket.common.createSuccess') });
  emits('hide-dialog');
  isSubmitting.value = false;
});

onError((err) => {
  toastError({ message: t('book-ticket.common.submitError', { err: err }) });
  isSubmitting.value = false;
});

</script>

<style scoped>

</style>