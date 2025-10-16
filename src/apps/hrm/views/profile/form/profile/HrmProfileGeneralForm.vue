<template>
  <div class='formgrid grid'>
    <div class='col-6 flex group'>
      <div class='avt-block col-6 px-0'>
        <img
          v-if='!previewAvatar'
          alt='Profile Image'
          class='cursor-pointer w-full'
          src='@/common/assets/images/avatar-default.png'
          @click='avatarRef?.click()'/>
        <img
          v-else
          alt='Profile Image'
          class='cursor-pointer object-fit-contain w-full'
          :src='previewAvatar as string'
          style='max-height: 16rem'
          @click='avatarRef?.click()'>
        <input
          hidden
          name='general.isAvatarChange'
          :value='isAvatarChange'/>
        <input
          ref='avatarRef'
          accept='image/*'
          hidden
          name='general.avatar'
          type='file'
          @change='changeProfileImage'/>
        <Button
          aria-label='Cancel'
          class='absolute opacity-0 remove-btn right-1 top-1 transition-opacity z-10'
          icon='pi pi-times'
          severity='danger'
          size='small'
          @click.stop='removeAvatar'/>
      </div>
      <div class='col-6 flex flex-column pr-0'>
        <FormInputText
          v-model='model.code'
          bg-highlight
          :disabled='isEditBySelf'
          :error="errors?.code === InvalidEmployeeType.EMPLOYEECODE ? t('hrm.employeeDocument.errors.' + errors?.message) : ''"
          :label='t("hrm.profile.general.code")'
          name='general.code'
          required/>
        <input
          v-if='isEditBySelf'
          v-model='model.code'
          hidden
          name='general.code'
          type='text'/>
        <FormInputText
          v-model='model.managerCode'
          bg-highlight
          :disabled='isEditBySelf'
          :label='t("hrm.profile.general.managerCode")'
          name='general.managerCode'/>
        <input
          v-if='isEditBySelf'
          v-model='model.managerCode'
          hidden
          name='general.managerCode'
          type='text'/>
        <FormInputText
          v-model='model.timeKeepingCode'
          bg-highlight
          :disabled='isEditBySelf'
          :label='t("hrm.profile.general.timeKeepingCode")'
          name='general.timeKeepingCode'/>
        <input
          v-if='isEditBySelf'
          v-model='model.timeKeepingCode'
          hidden
          name='general.timeKeepingCode'
          type='text'/>
      </div>
    </div>

    <div class='col-6 flex flex-column'>
      <FormInputText
        v-model='model.fullName'
        :disabled='isEditBySelf'
        :error='v$?.$errors?.find((error) => error.$property === "fullName")?.$message?.toString()'
        :label='t("hrm.profile.general.fullName")'
        name='general.fullName'
        required/>
      <input
        v-if='isEditBySelf'
        v-model='model.fullName'
        hidden
        name='general.fullName'
        type='text'/>

      <div class='flex'>
        <div class='col-6 pl-0'>
          <FormInputText
            v-model='model.otherName'
            :label='t("hrm.profile.general.otherName")'
            name='general.otherName'/>
        </div>

        <div class='col-6 pr-0'>
          <FormInputNumber
            v-model='orderNumber'
            :label='t("hrm.profile.general.orderNumber")'
            name='orderNumber'/>
        </div>
      </div>
      <div class='formgrid grid'>
        <FormInputCalendar
          v-model='model.birthDay'
          class='col-6'
          :disabled='isEditBySelf'
          :error='v$?.$errors?.find((error) => error.$property === "birthDay")?.$message?.toString()'
          :label='t("hrm.profile.general.birthDay")'
          name='general.birthDay'
          required/>
        <input
          v-if='isEditBySelf'
          v-model='model.birthDay'
          hidden
          name='general.birthDay'
          type='text'/>
        <FormInputDropdown
          v-model='model.gender'
          class='col-6'
          :disabled='isEditBySelf'
          :error='v$?.$errors?.find((error) => error.$property === "gender")?.$message?.toString()'
          :label='t("hrm.profile.general.gender")'
          name='general.gender'
          option-label='label'
          option-value='value'
          :options='genderOptions'
          required/>
        <input
          v-if='isEditBySelf'
          v-model='model.gender'
          hidden
          name='general.gender'
          type='text'/>
      </div>
    </div>
  </div>
  <div class='formgrid grid'>
    <FormAutoComplete
      v-model='model.birthPlace'
      class='col-6'
      :label='t("hrm.profile.general.birthPlace")'
      name='general.birthPlace'
      :suggestions='birthPlaceSuggestions'
      @complete='getBirthPlaceSuggestions'/>
    <FormAutoComplete
      v-model='model.homeTown'
      class='col-6'
      :label='t("hrm.profile.general.homeTown")'
      name='general.homeTown'
      :suggestions='homeTownSuggestions'
      @complete='getHomeTownSuggestions'/>
    <FormInputText
      v-model='model.permanentResidentStreet'
      class='col-6'
      :label='t("hrm.profile.general.permanentResidentStreet")'
      name='general.permanentResidentStreet'/>
    <FormAutoComplete
      v-model='model.permanentResident'
      class='col-6'
      :label='t("hrm.profile.general.permanentResident")'
      name='general.permanentResident'
      :suggestions='permanentResidentSuggestions'
      @complete='getPermanentResidentSuggestions'/>
    <FormInputDropdown
      v-model='model.nationality'
      class='col-3'
      :label="t('hrm.profile.general.nationality')"
      name='general.nationality'
      :options='nationalities'/>
    <FormInputDropdown
      v-model='model.nation'
      class='col-3'
      :label="t('hrm.profile.general.nation')"
      name='general.nation'
      :options='ethnicities'/>
    <FormInputCalendar
      v-model='model.joinDate'
      class='col-3'
      :error='v$?.$errors?.find((error) => error.$property === "joinDate")?.$message?.toString()'
      :label='t("hrm.profile.general.joinDate")'
      name='general.joinDate'
      required/>
    <FormInputCalendar
      v-model='model.startDate'
      class='col-3'
      :label='t("hrm.profile.general.startDate")'
      name='general.startDate'/>
    <FormInputDropdown
      v-model='model.religion'
      class='col-3'
      :label='t("hrm.profile.general.religion")'
      name='general.religion'
      :options='religions'/>
    <FormInputDropdown
      v-model='model.maritalStatus'
      class='col-3'
      :label='t("hrm.profile.general.maritalStatus")'
      name='general.maritalStatus'
      option-label='label'
      option-value='value'
      :options='maritalStatusOptions'/>
    <FormInputDropdown
      v-model='model.militaryService'
      class='col-3'
      :label='t("hrm.profile.general.militaryService")'
      name='general.militaryService'
      option-label='label'
      option-value='value'
      :options='militaryServiceOptions'/>
    <FormInputText
      v-model='model.profileCode'
      bg-highlight
      class='col-3'
      :disabled='isEditBySelf'
      :label='t("hrm.profile.general.profileCode")'
      name='general.profileCode'/>
    <input
      v-if='isEditBySelf'
      v-model='model.profileCode'
      hidden
      name='general.profileCode'
      type='text'/>
    <FormAutoComplete
      class='col-6'
      :label="t('hrm.profile.general.hobby')"
      :model-value='model.hobby'
      name='general.hobby'
      :suggestions='hobbies'
      @blur='setHobby'
      @complete='getHobbiesSuggestions'
      @item-select='pushHobby'/>
    <FormInputCheckbox
      v-model='model.isMember'
      class='col-3'
      :label='t("hrm.profile.general.isMember")'
      name='general.isMember'/>
    <FormInputCheckbox
      v-model='model.isParty'
      class='col-3'
      :label='t("hrm.profile.general.isParty")'
      name='general.isParty'/>
  </div>
</template>

<script lang='ts' setup>
import { useVuelidate, type Validation } from '@vuelidate/core';
import { helpers, required } from '@vuelidate/validators';
import { camelCase } from 'lodash';
import { storeToRefs } from 'pinia';
import type { AutoCompleteCompleteEvent, AutoCompleteItemSelectEvent } from 'primevue/autocomplete';
import { inject, onMounted, type PropType, reactive, type Ref, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { useDocumentRolesStore } from '@/apps/document/store/document-role';
import { getAllCategory } from '@/apps/hrm/api/graphql/category';
import { generateAutoIncrementCode } from '@/apps/hrm/api/graphql/parameterConfig';
import { searchAddress } from '@/apps/hrm/api/graphql/province';
import FormAutoComplete from '@/apps/hrm/components/form/FormAutoComplete.vue';
import FormInputCalendar from '@/apps/hrm/components/form/FormInputCalendar.vue';
import FormInputCheckbox from '@/apps/hrm/components/form/FormInputCheckbox.vue';
import FormInputDropdown from '@/apps/hrm/components/form/FormInputDropdown.vue';
import FormInputNumber from '@/apps/hrm/components/form/FormInputNumber.vue';
import FormInputText from '@/apps/hrm/components/form/FormInputText.vue';
import { CATEGORY_TYPE } from '@/apps/hrm/constants/category';
import { AutoIncrementCodeType } from '@/apps/hrm/constants/parameter';
import { fetchCategoryMappingName } from '@/apps/hrm/helpers/utils';
import { InvalidEmployeeType } from '@/apps/hrm/model/contract';
import {
  type EmployeeGeneral,
  type errorType,
  Gender,
  MaritalStatus,
  MilitaryService
} from '@/apps/hrm/model/employee';
import type { Province } from '@/apps/hrm/model/province';
import { generateAvatarUrl } from '@/common/helpers/file-utils';
import useMoment from '@/common/helpers/mixins/use-moment';
import { convertAlias } from '@/common/helpers/utils';

const props = defineProps({
  id: {
    type: String,
    default: null
  },
  status: {
    type: String,
    default: null
  },
  isEditBySelf: {
    type: Boolean,
    default: false
  }
});
const { moment } = useMoment();
const modelValue = defineModel({
  type: Object as PropType<EmployeeGeneral>,
  default: {} as EmployeeGeneral
});

const orderNumber = defineModel('orderNumber', { type: Number });
// inject errors
const errors = inject('apiError', ref<errorType>({
  code: '',
  message: ''
}));

const model = reactive(correctModel(modelValue.value));

watch(modelValue, (value) => {
  Object.assign(model, correctModel(value));
}, { immediate: true });

function correctModel(value: EmployeeGeneral) {
  Object.keys(value).forEach((key) => {
    const element = value[key as keyof EmployeeGeneral];
    if (['day', 'Day', 'date', 'Date'].some((keyword) => key.includes(keyword)) && element) {
      Object.assign(value, { [key]: moment(element as string).toDate() });
    }
  });
  return value;
}

if (!props.id) {
  generateAutoIncrementCode(AutoIncrementCodeType.EMPLOYEE).onResult((res) => {
    model.code = res.data.generateAutoIncrementCode;
  });
}

const { t } = useI18n();

const rules = {
  code: {
    required: helpers.withMessage(t('common.validate.required', { item: t('hrm.profile.general.code') }), required),
    $autoDirty: true,
  },
  fullName: {
    required: helpers.withMessage(t('common.validate.required', { item: t('hrm.profile.general.fullName') }), required),
    $autoDirty: true
  },
  birthDay: {
    required: helpers.withMessage(t('common.validate.required', { item: t('hrm.profile.general.birthDay') }), required),
    $autoDirty: true
  },
  gender: {
    required: helpers.withMessage(t('common.validate.required', { item: t('hrm.profile.general.gender') }), required),
    $autoDirty: true
  },
  joinDate: {
    required: helpers.withMessage(t('common.validate.required', { item: t('hrm.profile.general.joinDate') }), required),
    validDate: helpers.withMessage(
      'Ngày vào ko được lớn hơn ngày hiện tại',
      (value) => {
        if (!value) {
          return true;
        }
        const dateValue = typeof value === 'string' ? new Date(value) : value;
        return dateValue instanceof Date && !isNaN(dateValue.getTime()) && dateValue <= new Date();
      }
    ),
    $autoDirty: true,
  },
};
const v$: Ref<Validation> = useVuelidate(rules, model);
const avatarRef = ref<HTMLInputElement>();
const previewAvatar = ref<string | ArrayBuffer | null | undefined>(modelValue.value.avatar);
const isAvatarChange = ref(false);

watch(() => modelValue.value.avatar, (value) => {
  previewAvatar.value = generateAvatarUrl(value);
  isAvatarChange.value = false;
}, { immediate: true });

const genderOptions = Object.keys(Gender).map((key) => ({
  label: t('hrm.profile.general.genderOptions.' + camelCase(key)),
  value: key
}));
const maritalStatusOptions = Object.keys(MaritalStatus).map((key) => ({
  label: t('hrm.profile.general.maritalStatusOptions.' + camelCase(key)),
  value: key
}));
const militaryServiceOptions = Object.keys(MilitaryService).map((key) => ({
  label: t('hrm.profile.general.militaryServiceOptions.' + camelCase(key)),
  value: key
}));

function createImage(file: File) {
  const reader = new FileReader();

  reader.onload = (e) => {
    previewAvatar.value = e.target?.result;
  };
  reader.readAsDataURL(file);
}

const { userDeptRole } = storeToRefs(useDocumentRolesStore());
if (!model.nationality) {
  getAllCategory(userDeptRole.value, CATEGORY_TYPE.NATIONALITY).onResult((res) => {
    const defaultVal = res.data.getAllCategory.find((item: any) => item.isDefaultValue);
    model.nationality = defaultVal ? defaultVal.name : '';
  });
}
if (!model.nation) {
  getAllCategory(userDeptRole.value, CATEGORY_TYPE.ETHNICITY).onResult((res) => {
    const defaultVal = res.data.getAllCategory.find((item: any) => item.isDefaultValue);
    model.nation = defaultVal ? defaultVal.name : '';
  });
}
if (!model.religion) {
  getAllCategory(userDeptRole.value, CATEGORY_TYPE.RELIGION).onResult((res) => {
    const defaultVal = res.data.getAllCategory.find((item: any) => item.isDefaultValue);
    model.religion = defaultVal ? defaultVal.name : '';
  });
}

function changeProfileImage(e: Event) {
  const target = e.target as HTMLInputElement;
  const file = target.files?.[0];
  isAvatarChange.value = true;

  if (file) {
    createImage(file);
  } else {
    previewAvatar.value = null;
  }
}

const nationalities = ref([]);
const ethnicities = ref([]);
const religions = ref([]);
const hobbies = ref<string[]>([]);
const allHobbies = ref<string[]>([]);

const homeTownSuggestions = ref<string[]>([]);
const birthPlaceSuggestions = ref<string[]>([]);
const permanentResidentSuggestions = ref<string[]>([]);

onMounted(() => {
  fetchCategoryMappingName(CATEGORY_TYPE.NATIONALITY, nationalities);
  fetchCategoryMappingName(CATEGORY_TYPE.ETHNICITY, ethnicities);
  fetchCategoryMappingName(CATEGORY_TYPE.RELIGION, religions);
  fetchCategoryMappingName(CATEGORY_TYPE.FORTE, allHobbies);
});

function getHomeTownSuggestions(event: AutoCompleteCompleteEvent) {
  getAddressSuggestions(event, homeTownSuggestions);
}

function getBirthPlaceSuggestions(event: AutoCompleteCompleteEvent) {
  getAddressSuggestions(event, birthPlaceSuggestions);
}

function getPermanentResidentSuggestions(event: AutoCompleteCompleteEvent) {
  getAddressSuggestions(event, permanentResidentSuggestions);
}

function getHobbiesSuggestions(event: AutoCompleteCompleteEvent) {
  const split = event.query.split(',');
  const keyword = split[split.length - 1].trim();
  hobbies.value = allHobbies.value.filter((hobby) => convertAlias(hobby.toLowerCase()).includes(convertAlias(keyword.toLowerCase())));
}

function pushHobby(event: AutoCompleteItemSelectEvent) {
  const target = event.originalEvent.target as HTMLInputElement;
  const currentString = target.value;
  const split = currentString.split(',').map((item) => item.trim());
  split[split.length - 1] = event.value;
  model.hobby = split.join(', ');
}

function setHobby(event: Event) {
  const target = event.target as HTMLInputElement;
  model.hobby = target.value;
}

function getAddressSuggestions(event: AutoCompleteCompleteEvent, suggestions: Ref<string[]>) {
  searchAddress(event.query).onResult((res) => {
    suggestions.value = ((res.data.searchAddress || []) as Province[])
      .map((province) => `${province.wardName} - ${province.cityName}`);
  });
}

function removeAvatar() {
  previewAvatar.value = null;
  isAvatarChange.value = true;
  if (avatarRef.value) {
    avatarRef.value.value = ''; // reset file input
  }
}
</script>

<style lang='scss'>
.avt-block {
  position: relative;

  .remove-btn {
    top: 0;
    right: 5px;
    width: 20px;
    height: 24px;
  }

  &:hover {
    .remove-btn {
      opacity: 1 !important;
    }
  }
}
</style>
