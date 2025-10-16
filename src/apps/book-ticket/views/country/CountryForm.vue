<template>
  <component
    :is="isSidebar && !isDetail ? 'Sidebar' : 'Dialog'"
    v-model:visible='visibleForm'
    v-bind='DEFAULT_SIDEBAR_CONFIG'
    :header="
      isDetail
        ? t('book-ticket.country.titleForm')
        : t(`book-ticket.common.${id ? 'update' : 'create'}`) +
          ' ' +
          t('book-ticket.country.titleForm')
    "
    :position="isSidebar && !isDetail ? 'right' : undefined"
    @hide="emits('hide-dialog')">
    <div>
      <form
        ref='form'>
        <div class='formgrid grid mb-4'>
          <div class='col-12 field'>
            <label>{{
              t(`book-ticket.country.code`)
            }}<span
              v-if='!isDetail'
              class='ml-2 text-red-500'>*</span></label>
            <div v-if='!isDetail'>
              <InputText
                v-model='country.code'
                class='p-component p-inputtext w-full'
                maxlength='255'
                name='code'/>
              <ValidateErrorMessage :errors='v$.code.$errors'/>
            </div>
            <div v-else>
              {{ country.code }}
            </div>
          </div>
          <div class='col-12 field'>
            <label>{{
              t(`book-ticket.country.name`)
            }}<span
              v-if='!isDetail'
              class='ml-2 text-red-500'>*</span></label>
            <div v-if='!isDetail'>
              <InputText
                v-model='country.name'
                class='p-component p-inputtext w-full'
                maxlength='255'
                name='name'/>
              <ValidateErrorMessage :errors='v$.name.$errors'/>
            </div>
            <div v-else>
              {{ country.name }}
            </div>
          </div>
          <div class='col-12 field'>
            <label>{{
              t(`book-ticket.country.sortOrder`)
            }}</label>
            <div v-if='!isDetail'>
              <InputNumber
                v-model='country.sortOrder'
                class='w-full'
                maxlength='255'
                name='sortOrder'/>
            </div>
            <div v-else>
              {{ country.sortOrder }}
            </div>
          </div>
          <div class='col-12 field'>
            <label>{{ t(`book-ticket.common.default`) }}</label>
            <div class='align-items-center flex gap-2 mt-2'>
              <InputSwitch v-model='country.isDefault'/>
            </div>
          </div>
          <div class='col-12 field'>
            <div class='align-content-center align-items-center flex justify-content-between mb-2 vertical-align-middle'>
              <label
                class='font-semibold text-xl uppercase'
                for='attach'>{{ t('book-ticket.country.cityList') }}</label>
              <div v-if='!isDetail'>
                <ButtonIcon
                  icon='add_circle'
                  icon-size='1.5'
                  rounded
                  text
                  @click='handleShowCityModal'/>
              </div>
            </div>
            <CityList
              v-model:citys='citys'
              class='mt-2'
              :is-detail='isDetail'/>
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
      <CityForm
        v-if='showFormCity'
        v-model:visible-dialog='showFormCity'
        :city = 'city'
        @submit='handleSubmitCountryContact' />
    </div>
  </component>
</template>

<script setup lang='ts'>
import useVuelidate from '@vuelidate/core';
import { helpers, required } from '@vuelidate/validators';
import { get, omit } from 'lodash';
import { provide, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { DEFAULT_SIDEBAR_CONFIG } from '@/common/constants';
import { toastError, toastSuccess } from '@/common/helpers/custom-toast-service';

import { getCountryById, getNextCountrySortOrder, saveCountry } from '../../api/graphql/country';
import type { ICity, ICountry } from '../../model/country';
import CityForm from './component/CityForm.vue';
import CityList from './component/CityList.vue';

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
const country = ref<ICountry>({} as ICountry);
const citys = ref<ICity[]>([]);
const city = ref<ICity>({} as ICity);
const showFormCity = ref<boolean>(false);
const isSubmitting = ref<boolean>(false);

const validateRules = {
  code: {
    required: helpers.withMessage(
      t('book-ticket.country.required.code'),
      required,
    ),
  },
  name: {
    required: helpers.withMessage(
      t('book-ticket.country.required.name'),
      required,
    ),
  },
};
const v$ = useVuelidate(validateRules, country);

if (props.id) {
  const { onResult: getCountryByIdOnResult } = getCountryById(props.id);
  getCountryByIdOnResult((res) => {
    const value = get(res, 'data.getDetailCountryById');
    console.log(value);
    country.value = { ...value };
    if(value.listCity){
      citys.value = value.listCity.map((city :ICity) =>
        omit(city, ['cityId'])
      );
    }
  });
}else{
  const { onResult } = getNextCountrySortOrder();
  onResult(res =>{
    console.log(res);
    country.value.sortOrder = res.data.getNextCountrySortOrder;
  });
}

const handleShowCityModal = (data?: ICity)=>{
  if(data) {
    city.value = data;
  }
  showFormCity.value = true;
};

provide('handleShowCityModal', handleShowCityModal);

const handleSubmitCountryContact = (data: ICity) => {
  const isDuplicate = citys.value.some((item) => {
    if (item === city.value) {
      return false;
    }
    return item.cityName.trim().toLowerCase() === data.cityName.trim().toLowerCase();
  });

  if (isDuplicate) {
    toastError({ message: t('book-ticket.country.cityNameDuplicate') });
    return;
  }
  const index = citys.value.findIndex(item => item === city.value);
  if (index !== -1) {
    citys.value[index] = data;
  } else {
    citys.value.push(data);
  }
  showFormCity.value = false;
};

const {
  mutate,
  onDone,
  onError,
} = saveCountry();

const submit = () => {
  v$.value
    .$validate()
    .then((isValid) => {
      if (isValid && country.value) {
        isSubmitting.value = true;
        country.value.listCity = citys.value;
        mutate({ input: { ...country.value }, });
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