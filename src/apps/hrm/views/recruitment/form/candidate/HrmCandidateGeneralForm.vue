<template>
  <div class='formgrid grid'>

    <div class='col-9'>
      <div class='formgrid grid'>
        <FormInputDropdown
          v-model='candidateModel.recruitmentCampaignId'
          class='col-12'
          :error='v$?.$errors?.find((error) => error.$property === "recruitmentCampaignId")?.$message?.toString()'
          :label="t('hrm.candidate.general.recruitmentCampaignId')"
          name='recruitmentCampaignId'
          option-label='name'
          option-value='id'
          :options='campaigns'
          required/>
        <FormInputDropdown
          v-model='positionCode'
          class='col-12'
          disabled
          :label="t('hrm.candidate.general.positionName')"
          option-label='value'
          option-value='id'
          :options='jobTitles'/>
        <FormInputText
          v-model='candidateModel.candidateCode'
          class='col-6'
          :error='v$?.$errors?.find((error) => error.$property === "candidateCode")?.$message?.toString()'
          :label="t('hrm.candidate.general.candidateCode')"
          name='candidateCode'
          required/>

        <div class='col-6 field'>
          <label>{{
            t(`hrm.candidate.general.recruitmentSource`)
          }}</label>
          <div class='flex flex-wrap gap-6 mt-2'>
            <div class='align-items-center flex'>
              <RadioButton
                v-model='candidateModel.recruitmentSource'
                input-id='internal'
                name='recruitmentSource'
                :value='RecruitmentSourceType.INTERNAL'/>
              <label
                class='ml-2'
                for='internal'>{{
                  t(`hrm.candidate.general.INTERNAL`)
                }}</label>
            </div>
            <div class='align-items-center flex'>
              <RadioButton
                v-model='candidateModel.recruitmentSource'
                input-id='external'
                name='recruitmentSource'
                :value='RecruitmentSourceType.EXTERNAL'/>
              <label
                class='ml-2'
                for='external'>{{
                  t(`hrm.candidate.general.EXTERNAL`)
                }}</label>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class='col-3'>
      <div class='avt-block px-0'>
        <img
          v-if='!previewAvatar'
          alt='Profile Image'
          class='cursor-pointer w-full'
          src='@/common/assets/images/avatar-default.png'
          style='max-height: 20rem'
          @click='avatarRef?.click()'/>
        <img
          v-else
          alt='Profile Image'
          class='cursor-pointer object-fit-contain w-full'
          :src='previewAvatar as string'
          style='max-height: 20rem'
          @click='avatarRef?.click()'>
        <input
          ref='avatarRef'
          accept='image/*'
          hidden
          name='avatarImg'
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
    </div>
    <div class='col-12 field'><p class='font-bold'>{{ t('hrm.candidate.general.title')}}</p></div>

    <FormInputText
      v-model='candidateModel.fullName'
      class='col-6'
      :label="t('hrm.candidate.general.fullName')"
      name='fullName'/>
    <FormInputCalendar
      v-model='candidateModel.dateOfBirth'
      class='col-6'
      :label="t('hrm.candidate.general.dateOfBirth')"
      name='dateOfBirth'/>
    <div class='col-6 field'>
      <label v-required>{{
        t(`hrm.recruitment.general.gender`)
      }} </label>
      <div class='flex flex-wrap gap-6 mt-2'>
        <div class='align-items-center flex'>
          <RadioButton
            v-model='candidateModel.gender'
            input-id='gender1'
            name='gender'
            :value='GenderType.MALE'/>
          <label
            class='ml-2'
            for='gender1'>{{
              t(`hrm.recruitment.general.MALE`)
            }}</label>
        </div>
        <div class='align-items-center flex'>
          <RadioButton
            v-model='candidateModel.gender'
            input-id='gender2'
            name='gender'
            :value='GenderType.FEMALE'/>
          <label
            class='ml-2'
            for='gender2'>{{
              t(`hrm.recruitment.general.FEMALE`)
            }}</label>
        </div>
      </div>
      <ValidateErrorMessage :errors='v$.gender.$errors'/>
    </div>

    <div class='col-6 field'>
      <label>{{
        t(`hrm.candidate.general.isMemberOfCommunistParty`)
      }}</label>
      <div class='flex flex-wrap gap-6 mt-2'>
        <div class='align-items-center flex'>
          <RadioButton
            v-model='candidateModel.isMemberOfCommunistParty'
            input-id='gender1'
            name='isMemberOfCommunistParty'
            :value='true'/>
          <label
            class='ml-2'
            for='gender1'>{{
              t(`hrm.candidate.general.yes`)
            }}</label>
        </div>
        <div class='align-items-center flex'>
          <RadioButton
            v-model='candidateModel.isMemberOfCommunistParty'
            input-id='gender2'
            name='isMemberOfCommunistParty'
            :value='false'/>
          <label
            class='ml-2'
            for='gender2'>{{
              t(`hrm.candidate.general.no`)
            }}</label>
        </div>
      </div>
    </div>

    <FormInputText
      v-model='candidateModel.placeOfPermanentResidenceRegistration'
      class='col-12'
      :label="t('hrm.candidate.general.placeOfPermanentResidenceRegistration')"
      name='placeOfPermanentResidenceRegistration'/>
    <FormInputText
      v-model='candidateModel.citizenID'
      class='col-6'
      :label="t('hrm.candidate.general.citizenID')"
      name='citizenID'/>

    <FormInputDropdown
      v-model='candidateModel.ethnicityCode'
      class='col-6'
      :label="t('hrm.candidate.general.ethnicityCode')"
      name='ethnicityCode'
      option-label='value'
      option-value='id'
      :options='ethnicitys'/>

    <FormInputCalendar
      v-model='candidateModel.dateOfIssue'
      class='col-6'
      :label="t('hrm.candidate.general.dateOfIssue')"
      name='dateOfIssue'/>

    <FormInputDropdown
      v-model='candidateModel.nationalityCode'
      class='col-6'
      :label="t('hrm.candidate.general.nationalityId')"
      name='nationalityCode'
      option-label='value'
      option-value='id'
      :options='nationalitys'/>

    <FormInputText
      v-model='candidateModel.placeOfIssue'
      class='col-6'
      :label="t('hrm.candidate.general.placeOfIssue')"
      name='placeOfIssue'/>

    <FormInputDropdown
      v-model='candidateModel.maritalStatus'
      class='col-6'
      :label="t('hrm.candidate.general.maritalStatus')"
      name='maritalStatus'
      option-label='label'
      option-value='value'
      :options='maritalStatusOptions'/>
    <FormInputText
      v-model='candidateModel.phoneNumber'
      class='col-6'
      :label="t('hrm.candidate.general.phoneNumber')"
      name='phoneNumber'/>
    <FormInputText
      v-model='candidateModel.email'
      class='col-6'
      :label="t('hrm.candidate.general.email')"
      name='email'/>
    <FormInputText
      v-model='candidateModel.websiteLink1'
      class='col-6'
      :label="t('hrm.candidate.general.websiteLink')"
      name='websiteLink1'/>
    <FormInputText
      v-model='candidateModel.websiteLink2'
      class='col-6'
      :label="t('hrm.candidate.general.websiteLink')"
      name='websiteLink2'/>
    <FormInputText
      v-model='candidateModel.address'
      class='col-12'
      :error='v$?.$errors?.find((error) => error.$property === "address")?.$message?.toString()'
      :label="t('hrm.candidate.general.address')"
      name='address'
      required/>
    <div class='col-12 field'><p class='font-bold'>{{ t('hrm.candidate.general.careerGoals')}}</p></div>
    <FormInputTextArea
      v-model='candidateModel.careerGoals'
      class='col-12'
      :label="t('')"
      name='careerGoals'/>
  </div>
</template>

<script lang='ts' setup>

import { useVuelidate, type Validation } from '@vuelidate/core';
import { helpers, required } from '@vuelidate/validators';
import { camelCase, clone } from 'lodash';
import { computed, onMounted, type PropType, reactive, type Ref, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { searchRecruitmentCampaign } from '@/apps/hrm/api/graphql/campaign';
import FormInputCalendar from '@/apps/hrm/components/form/FormInputCalendar.vue';
import FormInputDropdown from '@/apps/hrm/components/form/FormInputDropdown.vue';
import FormInputText from '@/apps/hrm/components/form/FormInputText.vue';
import FormInputTextArea from '@/apps/hrm/components/form/FormInputTextArea.vue';
import { CATEGORY_TYPE } from '@/apps/hrm/constants/category';
import { fetchCategoryMappingNameWithId } from '@/apps/hrm/helpers/utils';
import { type Candidate, RecruitmentSourceType } from '@/apps/hrm/model/candidate';
import type { Campaign } from '@/apps/hrm/model/compaign';
import { MaritalStatus } from '@/apps/hrm/model/employee';
import { GenderType } from '@/apps/hrm/model/recruitment';
import { generateAvatarUrl } from '@/common/helpers/file-utils';

const { t } = useI18n();

const candidateValue = defineModel('candidate', {
  type: Object as PropType<Candidate>,
  default: { } as Candidate, 
});

const candidateModel = reactive(correctModel(candidateValue.value));

watch(candidateValue, (value) => {
  console.log(value);
  Object.assign(candidateModel, correctModel(value));
}, { deep: true });

watch(candidateModel, (newVal) => {
  candidateValue.value = clone(newVal);
  console.log(candidateModel);
  
}, { deep: true });

function correctModel(value: Candidate) {
  const candidate = clone(value);
  return candidate;
}
const rules = {
  recruitmentCampaignId: {
    required: helpers.withMessage(t('common.validate.required', { item: t('hrm.candidate.general.recruitmentCampaignId') }), required),
    $autoDirty: true
  },
  candidateCode: {
    required: helpers.withMessage(t('common.validate.required', { item: t('hrm.candidate.general.candidateCode') }), required),
    $autoDirty: true
  },
  address: {
    required: helpers.withMessage(t('common.validate.required', { item: t('hrm.candidate.general.address') }), required),
    $autoDirty: true
  },
  gender: {
    required: helpers.withMessage(t('common.validate.required', { item: t('hrm.candidate.general.gender') }), required),
    $autoDirty: true
  }
};

const v$: Ref<Validation> = useVuelidate(rules, candidateModel);

const ethnicitys = ref([]);
const nationalitys = ref([]);
const jobTitles = ref([]);
const positionCode = ref();
const campaigns = ref<Campaign[]>([]);
const maritalStatusOptions = Object.keys(MaritalStatus).map((key) => ({
  label: t('hrm.profile.general.maritalStatusOptions.' + camelCase(key)),
  value: key
}));
const recruitmentCampaignId = computed(()=> candidateModel.recruitmentCampaignId);
const previewAvatar = ref<string | ArrayBuffer | null | undefined>(candidateValue.value.avatarImg);
const avatarRef = ref<HTMLInputElement>();

watch(() => candidateValue.value.avatarImg, (value) => {
  previewAvatar.value = generateAvatarUrl(value);
}, { immediate: true });

function changeProfileImage(e: Event) {
  const target = e.target as HTMLInputElement;
  const file = target.files?.[0];
  if (file) {
    createImage(file);
  } else {
    previewAvatar.value = null;
  }
}

function createImage(file: File) {
  const reader = new FileReader();

  reader.onload = (e) => {
    previewAvatar.value = e.target?.result;
  };
  reader.readAsDataURL(file);
}

function removeAvatar() {
  previewAvatar.value = null;
  if (avatarRef.value) {
    avatarRef.value.value = '';
  }
}
watch([recruitmentCampaignId, campaigns], ([id, list]) => {
  if (id && list.length) {
    const value = campaigns.value.find((a) => a.id === id);
    if(value){
      positionCode.value = value.positionCode;
    }
  }
}, { deep: true });

onMounted(() => {
  searchRecruitmentCampaign({
    searchRecruitmentCampaignProposalReq: {},
    pageable: {
      page: 0,
      size: 9999
    }
  }).onResult((res)=>{
    campaigns.value = res.data.searchRecruitmentCampaign.content;
  });
  fetchCategoryMappingNameWithId(CATEGORY_TYPE.JOB_TITLE, jobTitles, {
    labelProp: 'name',
    idProp: 'code'
  });
  fetchCategoryMappingNameWithId(CATEGORY_TYPE.ETHNICITY, ethnicitys, {
    labelProp: 'name',
    idProp: 'code'
  });

  fetchCategoryMappingNameWithId(CATEGORY_TYPE.NATIONALITY, nationalitys, {
    labelProp: 'name',
    idProp: 'code'
  });
});

</script>

<style scoped>
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
