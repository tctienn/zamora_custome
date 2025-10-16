<template>
  <Sidebar
    v-model:visible='visibleForm'
    v-bind='DEFAULT_SIDEBAR_CONFIG'
    :header="t(`book-ticket.common.${id ? 'update' : 'create'}`) +
      ' ' +
      t('book-ticket.airline.titleForm')
    "
    @hide="emits('hide-dialog')">
    <div>
      <form
        ref='formAirline'
        class='mb-6'>
        <div class='formgrid grid mb-4'>
          <div class='col-12 field'>
            <label>{{
              t(`book-ticket.airline.code`)
            }}<span
              class='ml-2 text-red-500'>*</span></label>
            <div >
              <InputText
                v-model='airline.code'
                class='p-component p-inputtext w-full'
                maxlength='255'
                name='code'/>
              <ValidateErrorMessage :errors='v$.code.$errors'/>
            </div>
          </div>
          <div class='col-12 field'>
            <label>{{
              t(`book-ticket.airline.name`)
            }}<span
              
              class='ml-2 text-red-500'>*</span></label>
            <div >
              <InputText
                v-model='airline.name'
                class='p-component p-inputtext w-full'
                maxlength='255'
                name='name'/>
              <ValidateErrorMessage :errors='v$.name.$errors'/>
            </div>
          </div>
          <div class='col-12 field'>
            <label>{{
              t(`book-ticket.airline.sortOrder`)
            }}</label>
            <div >
              <InputNumber
                v-model='airline.sortOrder'
                class='w-full'
                maxlength='255'
                name='sortOrder'/>
              <input
                v-model='airline.sortOrder'
                hidden
                name='sortOrder'>
            </div>
          </div>
          <div class='col-12 field'>
            <label>{{
              t(`book-ticket.airline.type`)
            }}</label>
            <div >
              <Dropdown
                v-model='airline.type'
                class='p-component w-full'
                filter
                option-label='name'
                option-value='code'
                :options='typeOptions'
                :placeholder="t('book-ticket.airline.placeholder.selectType')"
                show-clear/>
              <input
                v-model='airline.type'
                hidden
                name='type'>
            </div>
          </div>

          <div class='col-4 field'>
            <label>Logo</label>
            <div >
              <div
                v-if='!logo'
                class='align-items-center border-round cursor-pointer flex font-bold h-12rem justify-content-center surface-200 w-full'
                @click='imgRef?.click()'>
                {{ $t('common.upload') }}
              </div>
              <div
                v-else
                class='relative w-full'>
                <div class='cursor-pointer flex h-12rem logo-box'>
                  <img
                    alt='Image'
                    class='img'
                    :src='logo as string'
                    @click='imgRef?.click()'/>
                </div>
                <div
                  class='absolute m-1 right-0 top-0 z-5'
                  @click='handleDeleteLogo'>
                  <AppIcon
                    class='cursor-pointer hover:text-red-600 text-gray-500 transition-colors'
                    fill
                    name='close'
                    size='1.6'/>
                </div>
              </div>
              <input
                ref='imgRef'
                accept='image/*'
                hidden
                name='logoFile.file'
                type='file'
                @change='changeLogo'/>
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
            
            icon='pi pi-save'
            :label="t('common.save')"
            :loading='isSubmitting'
            @click='submit'/>
        </div>
      </form>
    </div>
  </Sidebar>
</template>

<script setup lang='ts'>
import useVuelidate from '@vuelidate/core';
import { helpers, required } from '@vuelidate/validators';
import { get } from 'lodash';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { DEFAULT_SIDEBAR_CONFIG } from '@/common/constants';
import { toastError, toastSuccess } from '@/common/helpers/custom-toast-service';
import { generateAvatarUrl } from '@/common/helpers/file-utils';

import { deleteAirlineLogo, getAirlineById, getNextAirlineSortOrder } from '../../api/graphql/airline';
import { saveAirline } from '../../api/rest/airline';
import { type IAirline, ITypeAirline, type ITypeOption } from '../../model/airline';

const props = defineProps({
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
const airline = ref<IAirline>({} as IAirline);
const isSubmitting = ref<boolean>(false);
const logo = ref();
const formAirline = ref<HTMLFormElement>();
const imgRef = ref<HTMLInputElement>();
const typeOptions = ref<ITypeOption[]>([
  {
    name: t('book-ticket.airline.typeOption.INTERNATIONAL'),
    code: ITypeAirline.INTERNATIONAL 
  },
  {
    name: t('book-ticket.airline.typeOption.DOMESTIC'),
    code: ITypeAirline.DOMESTIC 
  },
  {
    name: t('book-ticket.airline.typeOption.OTHER'),
    code: ITypeAirline.OTHER 
  },
]);

const {
  mutate: deleteLogoMutate,
  onDone: deleteLogotOnDone
} =
  deleteAirlineLogo();

const validateRules = {
  code: {
    required: helpers.withMessage(
      t('book-ticket.airline.required.code'),
      required,
    ),
  },
  name: {
    required: helpers.withMessage(
      t('book-ticket.airline.required.name'),
      required,
    ),
  },
};
const v$ = useVuelidate(validateRules, airline);
if (props.id) {
  const { onResult: getAirlineByIdOnResult } = getAirlineById(props.id);
  getAirlineByIdOnResult((res) => {
    const value = get(res, 'data.getDetailAirlineById');
    airline.value = { ...value };
    logo.value = generateAvatarUrl(value.logoFile.downloadPath);
  });
} else {
  const { onResult } = getNextAirlineSortOrder();
  onResult((res) => {
    airline.value.sortOrder = res.data.getNextAirlineSortOrder;
  });
}

function changeLogo(e: Event) {
  const target = e.target as HTMLInputElement;
  const file = target.files?.[0];

  if (file) {
    createImage(file);
  }
}

function createImage(file: File) {
  const reader = new FileReader();

  reader.onload = (e) => {
    logo.value = e.target?.result;
  };
  reader.readAsDataURL(file);
}

function handleDeleteLogo() {
  if(airline.value.logoFile?.id){
    deleteLogoMutate({ id: airline.value.logoFile?.id });
  }
  logo.value = null;
  airline.value.logoFile = undefined;
  if (imgRef.value) {
    imgRef.value.value = '';
  }
}

const submit = () => {
  v$.value
    .$validate()
    .then((isValid) => {
      if (isValid && formAirline.value) {
        isSubmitting.value = true;
        const formData = new FormData(formAirline.value);
        if (!imgRef.value?.files?.[0]) {
          formData.delete('logoFile.file');
        }
        if(props.id){
          formData.append('id', props.id);
        }
        if(airline.value.logoFile?.id){
          formData.append('logoFile.id', airline.value.logoFile.id);
        }
        saveAirline(formData)
          .then(()=>{
            const handleSuccess = props.id ? t('book-ticket.common.updateSuccess') : t('book-ticket.common.createSuccess');
            toastSuccess({ message: handleSuccess });
            emits('hide-dialog');
          })
          .catch((handleError)=>{
            toastError({ message: t('book-ticket.common.submitError', { err: handleError }) });
          })
          .finally(() => {
            isSubmitting.value = false;
          });
        
      }
    });
};

</script>

<style scoped>

.logo-box {

  border: 1px solid var(--surface-200);
  border-radius: var(--border-radius);
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  transition: box-shadow 0.3s ease;
  overflow: hidden;
  background-color: white;
}
.logo-box:hover {
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
}

.img{
  width: 100%;
  height: 100%;
  object-fit: contain;
}
</style>