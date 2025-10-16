<template>
  <div class='formgrid grid'>
    <FormInputText
      v-model='modelValue.phoneNumber'
      class='col-3'
      :label="t('hrm.profile.contact.phoneNumber')"
      name='contact.phoneNumber'/>
    <FormInputText
      v-model='modelValue.landline'
      class='col-3'
      :label="t('hrm.profile.contact.landline')"
      name='contact.landline'/>
    <FormInputText
      v-model='modelValue.personToReport'
      class='col-6'
      :label="t('hrm.profile.contact.personToReport')"
      name='contact.personToReport'/>
    <FormInputText
      v-model='modelValue.email'
      class='col-6'
      :label="t('hrm.profile.contact.email')"
      name='contact.email'/>
    <FormInputDropdown
      v-model='modelValue.relationship'
      class='col-6'
      :label="t('hrm.profile.contact.relationship')"
      name='contact.relationship'
      :options='relationships'/>
    <FormInputText
      v-model='modelValue.emailIssuingUnit'
      class='col-6'
      :label="t('hrm.profile.contact.emailIssuingUnit')"
      name='contact.emailIssuingUnit'/>
    <FormInputText
      v-model='modelValue.phonePersonToReport'
      class='col-6'
      :label="t('hrm.profile.contact.phonePersonToReport')"
      name='contact.phonePersonToReport'/>
    <FormInputText
      v-model='modelValue.currentAddress'
      class='col-6'
      :label="t('hrm.profile.contact.currentAddress')"
      name='contact.currentAddress'/>
    <FormInputText
      v-model='modelValue.addressPersonToReport'
      class='col-6'
      :label="t('hrm.profile.contact.addressPersonToReport')"
      name='contact.addressPersonToReport'/>
    <FormAutoComplete
      v-model='modelValue.currentResidence'
      class='col-6'
      :label="t('hrm.profile.contact.currentResidence')"
      name='contact.currentResidence'
      :suggestions='permanentResidentSuggestions'
      @complete='getPermanentResidentSuggestions'/>
    <FormInputText
      v-model='modelValue.zamoraId'
      class='col-6'
      :disabled='true'
      :label="t('hrm.profile.contact.zamoraId')"
      name='contact.zamoraId'/>

  </div>
</template>

<script lang='ts' setup>
import type { AutoCompleteCompleteEvent } from 'primevue/autocomplete';
import { onMounted, type PropType, reactive, type Ref, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { searchAddress } from '@/apps/hrm/api/graphql/province';
import FormAutoComplete from '@/apps/hrm/components/form/FormAutoComplete.vue';
import FormInputDropdown from '@/apps/hrm/components/form/FormInputDropdown.vue';
import FormInputText from '@/apps/hrm/components/form/FormInputText.vue';
import { CATEGORY_TYPE } from '@/apps/hrm/constants/category';
import { correctModel, fetchCategoryMappingName } from '@/apps/hrm/helpers/utils';
import type { EmployeeContact } from '@/apps/hrm/model/employee';
import type { Province } from '@/apps/hrm/model/province';

const { t } = useI18n();

const model = defineModel({ type: Object as PropType<EmployeeContact> });
const modelValue = reactive<EmployeeContact>(correctModel(model.value || {}));

const permanentResidentSuggestions = ref<string[]>([]);

function getPermanentResidentSuggestions(event: AutoCompleteCompleteEvent) {
  getAddressSuggestions(event, permanentResidentSuggestions);
}

function getAddressSuggestions(event: AutoCompleteCompleteEvent, suggestions: Ref<string[]>) {
  searchAddress(event.query).onResult((res) => {
    suggestions.value = ((res.data.searchAddress || []) as Province[])
      .map((province) => `${province.wardName} - ${province.cityName}`);
  });
}

const relationships = ref([]);
onMounted(() => {
  fetchCategoryMappingName(CATEGORY_TYPE.RELATIONSHIP, relationships);
});
</script>

<style scoped></style>
