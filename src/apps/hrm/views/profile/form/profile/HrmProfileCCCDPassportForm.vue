<template>
  <div class='formgrid grid'>
    <div class='col-6 mt-3'>
      <div class='grid'>
        <FormInputText
          v-model='modelReactive.cccdNumber'
          class='col-6'
          :error="errors.code === InvalidEmployeeType.CCCD ? t('hrm.employeeDocument.errors.' + errors.message) : ''"
          :label="t('hrm.profile.CCCDPassport.cccdNumber')"
          name='cccdPassport.cccdNumber'/>
        <FormInputCalendar
          v-model='modelReactive.issueDate'
          class='col-6'
          :label="t('hrm.profile.CCCDPassport.issueDate')"
          name='cccdPassport.issueDate'/>
        <FormInputDropdown
          v-model='modelReactive.issuePlace'
          class='col-12'
          :label="t('hrm.profile.CCCDPassport.issuePlace')"
          name='cccdPassport.issuePlace'
          :options='issuingPlaces'/>
      </div>
    </div>

    <FormInputImg
      v-model='modelReactive.frontPhotoCCCD'
      class='col-3'
      is-img-changed='cccdPassport.isFrontPhotoCCCDChange'
      :label="t('hrm.profile.CCCDPassport.frontPhotoCCCD')"
      name='cccdPassport.frontPhotoCCCD'/>
    <FormInputImg
      v-model='modelReactive.backPhotoCCCD'
      class='col-3'
      is-img-changed='cccdPassport.isBackPhotoCCCDChange'
      :label="t('hrm.profile.CCCDPassport.backPhotoCCCD')"
      name='cccdPassport.backPhotoCCCD'/>

    <div class='col-6 mt-3'>
      <div class='grid'>
        <FormInputCalendar
          v-model='modelReactive.expirationDateCCCD'
          class='col-6'
          :label="t('hrm.profile.CCCDPassport.expirationDateCCCD')"
          name='cccdPassport.expirationDateCCCD'/>
        <FormInputDropdown
          v-model='modelReactive.passportType'
          class='col-6'
          :label="t('hrm.profile.CCCDPassport.passportType')"
          name='cccdPassport.passportType'
          :options='passportTypes'/>
        <FormInputText
          v-model='modelReactive.passportNumber'
          class='col-6'
          :label="t('hrm.profile.CCCDPassport.passportNumber')"
          name='cccdPassport.passportNumber'/>
        <FormInputCalendar
          v-model='modelReactive.expirationDatePassport'
          class='col-6'
          :label="t('hrm.profile.CCCDPassport.expirationDatePassport')"
          name='cccdPassport.expirationDatePassport'/>
      </div>
    </div>

    <FormInputImg
      v-model='modelReactive.passportPhoto'
      class='col-3'
      is-img-changed='cccdPassport.isPassportPhotoChange'
      :label="t('hrm.profile.CCCDPassport.passportPhoto')"
      name='cccdPassport.passportPhoto'/>
  </div>
</template>

<script lang='ts' setup>
import { inject, onMounted, type PropType, reactive, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import FormInputCalendar from '@/apps/hrm/components/form/FormInputCalendar.vue';
import FormInputDropdown from '@/apps/hrm/components/form/FormInputDropdown.vue';
import FormInputImg from '@/apps/hrm/components/form/FormInputImg.vue';
import FormInputText from '@/apps/hrm/components/form/FormInputText.vue';
import { CATEGORY_TYPE } from '@/apps/hrm/constants/category';
import { correctModel, fetchCategoryMappingName } from '@/apps/hrm/helpers/utils';
import { InvalidEmployeeType } from '@/apps/hrm/model/contract';
import type { EmployeeCCCDPassport, errorType } from '@/apps/hrm/model/employee';

const { t } = useI18n();
const model = defineModel({ type: Object as PropType<EmployeeCCCDPassport> });
const modelReactive = reactive<EmployeeCCCDPassport>(correctModel(model.value || {}));
const errors = inject('apiError', ref<errorType>({
  code: '',
  message: '',
}));

watch(model, (value) => {
  Object.assign(modelReactive, correctModel(value || {}));
});

const passportTypes = ref<string[]>([]);
const issuingPlaces = ref<string[]>([]);

onMounted(() => {
  fetchCategoryMappingName(CATEGORY_TYPE.PASSPORT_TYPE, passportTypes);
  fetchCategoryMappingName(CATEGORY_TYPE.ISSUING_PLACE, issuingPlaces);
});

</script>

<style scoped></style>
