<template>
  <div class='formgrid grid'>
    <FormInputText
      v-model='campaignModel.code'
      class='col-6'
      :error='vCampaign$?.$errors?.find((error) => error.$property === "code")?.$message?.toString()'
      :label="t('hrm.campaign.general.code')"
      name='code'
      required/>
    <FormInputDropdown
      v-model='campaignModel.recruitmentProposalId'
      class='col-6'
      :error='vCampaign$?.$errors?.find((error) => error.$property === "recruitmentProposalId")?.$message?.toString()'
      :label="t('hrm.campaign.general.recruitmentProposalId')"
      name='recruitmentProposalId'
      option-label='name'
      option-value='id'
      :options='recruitments'
      required/>
    <FormInputText
      v-model='campaignModel.name'
      class='col-12'
      :error='vCampaign$?.$errors?.find((error) => error.$property === "name")?.$message?.toString()'
      :label="t('hrm.campaign.general.name')"
      name='name'
      required/>
    <div class='col-6 field'>
      <label
        v-required>
        {{ t('hrm.campaign.general.personInChargeId') }}
      </label>
      <NamedMultiSelectUser
        v-model:list-user='campaignModel.personInChargeId'
        class='p-component'
        name='personInChargeId'
        :show-button-add = 'false'/>
      <ValidateErrorMessage :errors='vCampaign$.personInChargeId.$errors'/>
    </div>
    <div class='col-6 field'>
      <label>
        {{ t('hrm.campaign.general.personFollowerId') }}
      </label>
      <NamedMultiSelectUser
        v-model:list-user='campaignModel.personFollowerId'
        class='p-component'
        name='personFollowerId'
        :show-button-add = 'false'/>
    </div>
    <FormInputNumber
      v-model='model.numberOfRecruits'
      class='col-6'
      disabled
      :error='vRecruitment$?.$errors?.find((error) => error.$property === "numberOfRecruits")?.$message?.toString()'
      :label="t('hrm.recruitment.general.numberOfRecruits')"
      required/>
    <FormInputNumber
      v-model='campaignModel.expectedCosts'
      class='col-6'
      :label="t('hrm.campaign.general.expectedCosts')"
      name='expectedCosts'/>
    <FormInputCalendar
      v-model='model.fromTime'
      class='col-6'
      disabled
      :label="t('hrm.campaign.general.fromTime')"
      :min-date='new Date().toISOString()'/>
    <FormInputCalendar
      v-model='model.toTime'
      class='col-6'
      disabled
      :error='vRecruitment$?.$errors?.find((error) => error.$property === "toTime")?.$message?.toString()'
      :label="t('hrm.campaign.general.toTime')"
      :min-date='new Date().toISOString()'
      required/>
    <div class='col-12 field'><p class='font-bold'>{{ t('hrm.campaign.general.positionTitle') + ':' }}</p></div>
    <FormInputDropdown
      v-model='model.positionCode'
      class='col-6'
      disabled
      :error='vRecruitment$?.$errors?.find((error) => error.$property === "positionCode")?.$message?.toString()'
      :label="t('hrm.recruitment.general.position')"
      option-label='value'
      option-value='id'
      :options='jobTitles'
      required/>
    <FormInputDropdown
      v-model='model.titleCode'
      class='col-6'
      disabled
      :label="t('hrm.recruitment.general.title')"
      option-label='value'
      option-value='id'
      :options='positions'/>

    <FormInputDropdown
      v-model='campaignModel.workTypeCode'
      class='col-6'
      :label="t('hrm.campaign.general.workTypeCode')"
      name='workTypeCode'
      option-label='value'
      option-value='id'
      :options='workType'/>

    <FormInputDropdown
      v-model='campaignModel.workLocationCode'
      class='col-6'
      :label="t('hrm.campaign.general.workLocationCode')"
      name='workLocationCode'
      option-label='value'
      option-value='id'
      :options='workLocation'/>

    <FormInputNumber
      v-model='campaignModel.salaryFrom'
      class='col-6'
      :label="t('hrm.campaign.general.salaryFrom')"
      name='salaryFrom'/>
    <FormInputNumber
      v-model='campaignModel.salaryTo'
      class='col-6'
      :label="t('hrm.campaign.general.salaryTo')"
      name='salaryTo'/>

    <div class='col-12 field'><p class='font-bold'>{{ t('hrm.recruitment.general.candidateRequirements') + ':' }}</p></div>
    <div class='col-6 field'>
      <label>{{
        t(`hrm.recruitment.general.gender`)
      }}</label>
      <div class='flex flex-wrap gap-6 mt-2'>
        <div class='align-items-center flex'>
          <RadioButton
            v-model='model.gender'
            disabled
            input-id='gender1'
            :value='GenderType.MALE'/>
          <label
            class='ml-2'
            for='gender1'>{{
              t(`hrm.recruitment.general.MALE`)
            }}</label>
        </div>
        <div class='align-items-center flex'>
          <RadioButton
            v-model='model.gender'
            disabled
            input-id='gender2'
            :value='GenderType.FEMALE'/>
          <label
            class='ml-2'
            for='gender2'>{{
              t(`hrm.recruitment.general.FEMALE`)
            }}</label>
        </div>
        <div class='align-items-center flex'>
          <RadioButton
            v-model='model.gender'
            disabled
            input-id='gender3'
            :value='GenderType.OTHER'/>
          <label
            class='ml-2'
            for='gender3'>{{
              t(`hrm.recruitment.general.OTHER`)
            }}</label>
        </div>
      </div>
    </div>
    <FormInputDropdown
      v-model='model.majorCode'
      class='col-6'
      disabled
      is-multi-select
      :label="t('hrm.recruitment.general.major')"
      option-label='value'
      option-value='id'
      :options='specializeds'/>
    <FormInputDropdown
      v-model='model.levelCode'
      class='col-6'
      disabled
      is-multi-select
      :label="t('hrm.recruitment.general.level')"
      option-label='value'
      option-value='id'
      :options='levels'/>
    <FormInputDropdown
      v-model='model.foreignLanguageCode'
      class='col-6'
      disabled
      is-multi-select
      :label="t('hrm.recruitment.general.foreignLanguage')"
      option-label='value'
      option-value='id'
      :options='languageLevels'/>
    <FormInputDropdown
      v-model='model.experienceCode'
      class='col-6'
      disabled
      is-multi-select
      :label="t('hrm.recruitment.general.experience')"
      option-label='value'
      option-value='id'
      :options='experiences'/>
    <FormInputNumber
      v-model='model.ageFrom'
      class='col-3'
      disabled
      :label="t('hrm.recruitment.general.ageFrom')"/>
    <FormInputNumber
      v-model='model.ageTo'
      class='col-3'
      disabled
      :label="t('hrm.recruitment.general.ageTo')"/>
    <FormInputText
      v-model='model.heightFrom'
      class='col-3'
      disabled
      :label="t('hrm.recruitment.general.heightFrom')"/>
    <FormInputText
      v-model='model.heightTo'
      class='col-3'
      disabled
      :label="t('hrm.recruitment.general.heightTo')"/>
    <FormInputText
      v-model='model.weightFrom'
      class='col-3'
      disabled
      :label="t('hrm.recruitment.general.weightFrom')"/>
    <FormInputText
      v-model='model.weightTo'
      class='col-3'
      disabled
      :label="t('hrm.recruitment.general.weightTo')"/>

    <FormInputTextArea
      v-model='model.description'
      class='col-12'
      disabled
      :label="t('hrm.recruitment.general.jobDescription')"/>

    <div class='align-content-center align-items-center col-12 flex justify-content-between mb-2 vertical-align-middle'>
      <label
        class='font-bold'
        for='attach'>{{ t('hrm.recruitment.general.attachments') }}</label>
      <Button
        class='p-button-plain'
        icon='pi pi-plus'
        severity='secondary'
        size='small'
        @click='showAddFileDialog=true'/>
    </div>
    <AttachmentFileList
      v-model:receiving-docs='campaignModel.files'
      class='col-12'
      :on-delete='handleDeleteFileAttachment'/>
    <AddFileModal
      v-if='showAddFileDialog'
      v-model:visible-dialog='showAddFileDialog'
      @submit='handleSubmitFile' />
  </div>
</template>

<script lang='ts' setup>

import { useVuelidate, type Validation } from '@vuelidate/core';
import { helpers, required } from '@vuelidate/validators';
import { clone } from 'lodash';
import { storeToRefs } from 'pinia';
import { computed, onMounted, type PropType, reactive, type Ref, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { useUserMoreInfoStore } from '@/apps/admin/store/usersMoreInfo';
import type { IAttachmentFile } from '@/apps/book-ticket/model/bookFlight';
import AddFileModal from '@/apps/book-ticket/views/bookFlight/component/AddFileModal.vue';
import AttachmentFileList from '@/apps/book-ticket/views/bookFlight/component/AttachmentFileList.vue';
import { deleteRecruitmentCampaignAttachmentById } from '@/apps/hrm/api/graphql/campaign';
import { searchRecruitmentProposal } from '@/apps/hrm/api/graphql/recruitment';
import FormInputCalendar from '@/apps/hrm/components/form/FormInputCalendar.vue';
import FormInputDropdown from '@/apps/hrm/components/form/FormInputDropdown.vue';
import FormInputNumber from '@/apps/hrm/components/form/FormInputNumber.vue';
import FormInputText from '@/apps/hrm/components/form/FormInputText.vue';
import FormInputTextArea from '@/apps/hrm/components/form/FormInputTextArea.vue';
import { CATEGORY_TYPE } from '@/apps/hrm/constants/category';
import { fetchCategoryMappingNameWithId } from '@/apps/hrm/helpers/utils';
import type { Campaign } from '@/apps/hrm/model/compaign';
import { GenderType, type Recruitment } from '@/apps/hrm/model/recruitment';
import NamedMultiSelectUser from '@/common/components/custom/NamedMultiSelectUser.vue';
import useMoment from '@/common/helpers/mixins/use-moment';

const { t } = useI18n();
const { moment } = useMoment();
const store = useUserMoreInfoStore();
const { allUsers } = storeToRefs(store);
const leadershipUserIds = computed(() => {
  return allUsers.value.filter((info) => info.roles?.includes('LANH_DAO'));
});
console.log(leadershipUserIds.value);
const modelValue = defineModel({
  type: Object as PropType<Recruitment>,
  default: {} as Recruitment,
});

const campaignValue = defineModel('campaign', {
  type: Object as PropType<Campaign>,
  default: {} as Campaign, 
});

const campaignModel = reactive(correctModel<Campaign>(campaignValue.value));
const model = reactive(correctModel<Recruitment>(modelValue.value));
const { mutate: deleteAttachment } = deleteRecruitmentCampaignAttachmentById();

watch(modelValue, (value) => {
  Object.assign(model, correctModel<Recruitment>(value));
}, { deep: true });

watch(model, (newVal) => {
  modelValue.value = clone(newVal);
}, { deep: true });

watch(campaignValue, (value) => {
  console.log(campaignValue);
  
  Object.assign(campaignModel, correctModel<Campaign>(value));
}, { deep: true });

watch(campaignModel, (newVal) => {
  campaignValue.value = clone(newVal);
}, { deep: true });

function correctModel<T extends { files?: IAttachmentFile[] }>(value: T): T {
  const model = clone(value);
  if (!model.files) {
    model.files = [];
  }
  Object.keys(value).forEach((key) => {
    const element = value[key as keyof T];
    if (['day', 'Day', 'date', 'Date'].some((keyword) => key.includes(keyword)) && element) {
      Object.assign(model, { [key]: moment(element as string).toDate() });
    }
  });
  return model;
}

const toTimeAfterFromTime = helpers.withMessage(
  t('hrm.recruitment.general.validator.mustBeAfter', {
    item: t('hrm.recruitment.general.toTime'),
    after: t('hrm.recruitment.general.fromTime') 
  }),
  (value: Date | null) => {
    if (!value) {
      return true;
    }
    if (!model.fromTime) {
      return true;
    }
    return value >= model.fromTime;
  }
);

const rulesRecruiltment = {
  positionCode: {
    required: helpers.withMessage(t('common.validate.required', { item: t('hrm.recruitment.general.position') }), required),
    $autoDirty: true
  },
  numberOfRecruits: {
    required: helpers.withMessage(t('common.validate.required', { item: t('hrm.recruitment.general.numberOfRecruits') }), required),
    $autoDirty: true
  },
  toTime: {
    required: helpers.withMessage(t('common.validate.required', { item: t('hrm.recruitment.general.toTime') }), required),
    toTimeAfterFromTime, 
    $autoDirty: true
  }
};

const rulesCampaign = {
  name: {
    required: helpers.withMessage(t('common.validate.required', { item: t('hrm.campaign.general.name') }), required),
    $autoDirty: true,
  },
  code: {
    required: helpers.withMessage(t('common.validate.required', { item: t('hrm.campaign.general.code') }), required),
    $autoDirty: true
  },
  recruitmentProposalId: {
    required: helpers.withMessage(t('common.validate.required', { item: t('hrm.campaign.general.recruitmentProposalId') }), required),
    $autoDirty: true
  },
  personInChargeId: {
    required: helpers.withMessage(t('common.validate.required', { item: t('hrm.campaign.general.personInChargeId') }), required),
    $autoDirty: true
  }
};
const vCampaign$: Ref<Validation> = useVuelidate(rulesCampaign, campaignModel);
const vRecruitment$: Ref<Validation> = useVuelidate(rulesRecruiltment, model);

const levels = ref([]);
const specializeds = ref([]);
const reasons = ref([]);
const languageLevels = ref([]);
const experiences = ref([]);
const jobTitles = ref([]);
const positions = ref([]);
const workType = ref([]);
const recruitments = ref<Recruitment[]>([]);
const workLocation = ref([]);
const showAddFileDialog = ref<boolean>(false);
const recruitmentProposalId = computed(()=> campaignModel.recruitmentProposalId);

function splitCodes(str?: string) {
  return str ? str.split(',').map((code) => code.trim()) : [];
}
watch([recruitmentProposalId, recruitments], ([id, list]) => {
  if (id && list.length) {
    const value = recruitments.value.find((a) => a.id === id);
    if(value){
      Object.assign(model, {
        ...value,
        fromTime: value.fromTime ? new Date(value.fromTime) : null,
        toTime: value.toTime ? new Date(value.toTime) : null,
        levelCode: splitCodes(value.levelCode),
        majorCode: splitCodes(value.majorCode),
        experienceCode: splitCodes(value.experienceCode),
        foreignLanguageCode: splitCodes(value.foreignLanguageCode),
      });
    }
  }
}, { deep: true });

onMounted(() => {
  searchRecruitmentProposal({
    searchRecruitmentProposalReq: {},
    pageable: {
      page: 0,
      size: 9999
    }
  }).onResult((res)=>{
    recruitments.value = res.data.searchRecruitmentProposal.content;
  });
  fetchCategoryMappingNameWithId(CATEGORY_TYPE.REASON, reasons, {
    labelProp: 'name',
    idProp: 'code'
  });
  fetchCategoryMappingNameWithId(CATEGORY_TYPE.JOB_POSITION, positions, {
    labelProp: 'name',
    idProp: 'code'
  });
  fetchCategoryMappingNameWithId(CATEGORY_TYPE.JOB_TITLE, jobTitles, {
    labelProp: 'name',
    idProp: 'code'
  });

  fetchCategoryMappingNameWithId(CATEGORY_TYPE.MAJOR, specializeds, {
    labelProp: 'name',
    idProp: 'code'
  });

  fetchCategoryMappingNameWithId(CATEGORY_TYPE.EDUCATION_LEVEL, levels, {
    labelProp: 'name',
    idProp: 'code'
  });

  fetchCategoryMappingNameWithId(CATEGORY_TYPE.FOREIGN_LANGUAGE_LEVEL, languageLevels, {
    labelProp: 'name',
    idProp: 'code'
  });
  fetchCategoryMappingNameWithId(CATEGORY_TYPE.EXPERIENCE, experiences, {
    labelProp: 'name',
    idProp: 'code'
  });
  fetchCategoryMappingNameWithId(CATEGORY_TYPE.WORK_TYPE, workType, {
    labelProp: 'name',
    idProp: 'code'
  });
  fetchCategoryMappingNameWithId(CATEGORY_TYPE.WORK_LOCATION, workLocation, {
    labelProp: 'name',
    idProp: 'code'
  });
});

const handleSubmitFile = (fileData: IAttachmentFile) => {
  if (!campaignModel.files) {
    campaignModel.files = [];
  }
  campaignModel.files.push(fileData);
};

const handleDeleteFileAttachment = async (id: string) => {
  await deleteAttachment({ attachmentId: id });
  ;
};

</script>

<style scoped>

</style>
