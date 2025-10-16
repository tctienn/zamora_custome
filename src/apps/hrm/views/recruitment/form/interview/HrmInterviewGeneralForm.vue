<template>
  <div class='formgrid grid'>
    <FormInputDropdown
      v-model='interviewModel.recruitmentCampaignId'
      class='col-12'
      :error='v$?.$errors?.find((error) => error.$property === "recruitmentCampaignId")?.$message?.toString()'
      :label="t('hrm.candidate.general.recruitmentCampaignId')"
      name='recruitmentCampaignId'
      option-label='name'
      option-value='id'
      :options='campaigns'
      required/>
    <FormInputDropdown
      v-model='interviewModel.interviewRoundCode'
      class='col-12'
      :label="t('hrm.interview.general.interviewRoundCode')"
      name='interviewRoundCode'
      option-label='value'
      option-value='id'
      :options='rounds'
      required/>
    <FormInputText
      v-model='interviewModel.interviewName'
      class='col-12'
      :error='v$?.$errors?.find((error) => error.$property === "interviewName")?.$message?.toString()'
      :label="t('hrm.interview.general.interviewName')"
      name='interviewName'
      required/>
    <FormInputCalendar
      v-model='interviewModel.interviewDateFrom'
      class='col-6'
      :label="t('hrm.interview.general.interviewDateFrom')"
      name='interviewDateFrom'/>
    <FormInputCalendar
      v-model='interviewModel.interviewDateTo'
      class='col-6'
      :label="t('hrm.interview.general.interviewDateTo')"
      name='interviewDateTo'/>
    <div class='col-6 field'>
      <label>{{ t('hrm.interview.general.interviewTimeFrom') }}</label>
      <Calendar
        v-model='interviewModel.interviewTimeFrom'
        icon-display='input'
        name='interviewTimeFrom'
        show-icon
        time-only/>
    </div>
    <div class='col-6 field'>
      <label>{{ t('hrm.interview.general.interviewTimeTo') }}</label>
      <Calendar
        v-model='interviewModel.interviewTimeTo'
        icon-display='input'
        name='interviewTimeTo'
        show-icon
        time-only/>
    </div>

    <div class='col-12 field'>
      <label
        v-required>
        {{ t('hrm.interview.general.judgesScoringId') }}
      </label>
      <NamedMultiSelectUser
        v-model:list-user='interviewModel.judgesScoringId'
        class='p-component'
        name='judgesScoringId'
        :show-button-add = 'false'/>
      <ValidateErrorMessage :errors='v$.judgesScoringId.$errors'/>
    </div>
    <div class='col-6 field'>
      <label>
        {{ t('hrm.interview.general.judgesEvaluatingId') }}
      </label>
      <NamedMultiSelectUser
        v-model:list-user='interviewModel.judgesEvaluatingId'
        class='p-component'
        name='judgesEvaluatingId'
        :show-button-add = 'false'/>
    </div>
    <div class='col-6 field'>
      <label v-required>{{ t('hrm.interview.general.secretaryId') }}</label>
      <NamedSelectUser
        v-model='interviewModel.secretaryId'
        :button-select-user='false'
        class='w-full'
        name='secretaryId'
        style='height: 40px'/>
      <ValidateErrorMessage :errors='v$.secretaryId.$errors'/>
    </div>
    <FormInputDropdown
      v-model='interviewModel.scoringFormCode'
      class='col-12'
      :label="t('hrm.interview.general.scoringFormCode')"
      name='scoringFormCode'
      option-label='value'
      option-value='id'
      :options='scoringForms'
      required/>
    <FormInputText
      v-model='interviewModel.interviewRoom'
      class='col-12'
      :label="t('hrm.interview.general.interviewRoom')"
      name='interviewRoom'/>
  </div>
</template>

<script lang='ts' setup>

import { useVuelidate, type Validation } from '@vuelidate/core';
import { helpers, required } from '@vuelidate/validators';
import { clone } from 'lodash';
import { onMounted, type PropType, reactive, type Ref, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { searchRecruitmentCampaign } from '@/apps/hrm/api/graphql/campaign';
import FormInputCalendar from '@/apps/hrm/components/form/FormInputCalendar.vue';
import FormInputDropdown from '@/apps/hrm/components/form/FormInputDropdown.vue';
import FormInputText from '@/apps/hrm/components/form/FormInputText.vue';
import { type Candidate } from '@/apps/hrm/model/candidate';
import type { Campaign } from '@/apps/hrm/model/compaign';
import type { Interview } from '@/apps/hrm/model/interview';
import NamedMultiSelectUser from '@/common/components/custom/NamedMultiSelectUser.vue';
import NamedSelectUser from '@/common/components/custom/NamedSelectUser.vue';

const { t } = useI18n();

const interviewValue = defineModel('interview', {
  type: Object as PropType<Interview>,
  default: { } as Candidate, 
});

const interviewModel = reactive(correctModel(interviewValue.value));

watch(interviewValue, (value) => {
  console.log(value);
  Object.assign(interviewModel, correctModel(value));
}, { deep: true });

watch(interviewModel, (newVal) => {
  interviewValue.value = clone(newVal);
  console.log(interviewModel);
  
}, { deep: true });

function correctModel(value: Interview) {
  const candidate = clone(value);
  return candidate;
}
const rules = {
  recruitmentCampaignId: {
    required: helpers.withMessage(t('common.validate.required', { item: t('hrm.interview.general.recruitmentCampaignId') }), required),
    $autoDirty: true
  },
  interviewName: {
    required: helpers.withMessage(t('common.validate.required', { item: t('hrm.interview.general.interviewName') }), required),
    $autoDirty: true
  },
  judgesScoringId: {
    required: helpers.withMessage(t('common.validate.required', { item: t('hrm.interview.general.judgesScoringId') }), required),
    $autoDirty: true
  },
  secretaryId: {
    required: helpers.withMessage(t('common.validate.required', { item: t('hrm.interview.general.secretaryId') }), required),
    $autoDirty: true
  },
};

const v$: Ref<Validation> = useVuelidate(rules, interviewModel);

const rounds = ref([]);
const scoringForms = ref([]);
const campaigns = ref<Campaign[]>([]);

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
});

</script>

<style scoped>
::v-deep(.p-calendar) {
  width: 100%;
}
</style>
