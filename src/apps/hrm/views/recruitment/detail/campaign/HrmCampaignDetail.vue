<template>
  <div class='grid'>
    <Card class='col-12 p-0'>
      <template #title>{{ t('hrm.contract.general.title') }}</template>
      <template #content>
        <div class='grid'>
          <InfoRow
            :label="t('hrm.campaign.general.code')"
            :value='campaignModel.code'/>
          <InfoRow
            :label="t('hrm.campaign.general.recruitmentProposalId')"
            :value='model.name'/>
          <InfoRow
            col='col-12'
            :label="t('hrm.campaign.general.name')"
            :value='campaignModel.name'/>
          <InfoRow
            col='col-6'
            :label="t('hrm.campaign.general.personInChargeId')">
            <div>
              <AppUser
                v-for='userId in campaignModel.personInChargeId'
                :key='userId'
                avatar-size='2.5'
                class='mt-2'
                info-visible
                :infos="['positionName', 'departments', 'username']"
                name-visible
                :user-id='userId'/>
            </div>
          </InfoRow>
          <InfoRow
            col='col-6'
            :label="t('hrm.campaign.general.personFollowerId')">
            <div class='mt-2'>
              <AppUser
                v-for='userId in campaignModel.personFollowerId'
                :key='userId'
                avatar-size='2.5'
                class='mt-2'
                info-visible
                :infos="['positionName', 'departments', 'username']"
                name-visible
                :user-id='userId'/>
            </div>
          </InfoRow>
          <InfoRow
            :label="t('hrm.recruitment.general.numberOfRecruits')"
            :value='model.numberOfRecruits'/>
          <InfoRow
            :label="t('hrm.campaign.general.expectedCosts')"
            :value='formatCurrencyWithDigits(campaignModel.expectedCosts)'/>
          <InfoRow
            :label="t('hrm.campaign.general.fromTime')"
            :value="formatDate(model.fromTime,'DD/MM/YYYY')"/>
          <InfoRow
            :label="t('hrm.campaign.general.toTime')"
            :value="formatDate(model.toTime,'DD/MM/YYYY')"/>
        </div>
      </template>
    </Card>
    <Card class='col-12 p-0'>
      <template #title>{{ t('hrm.campaign.general.positionTitle') }}</template>
      <template #content>
        <div class='grid'>
          <InfoRow
            :label="t('hrm.recruitment.general.position')"
            :value='model.positionName'/>
          <InfoRow
            :label="t('hrm.recruitment.general.title')"
            :value='model.titleName'/>
          <InfoRow
            :label="t('hrm.campaign.general.workTypeCode')"
            :value='campaignModel.workTypeName'/>
          <InfoRow
            :label="t('hrm.campaign.general.workLocationCode')"
            :value='campaignModel.workLocationName'/>
          <InfoRow
            :label="t('hrm.campaign.general.salaryFrom')"
            :value='formatCurrencyWithDigits(campaignModel.salaryFrom)'/>
          <InfoRow
            :label="t('hrm.campaign.general.salaryTo')"
            :value='formatCurrencyWithDigits(campaignModel.salaryTo)'/>
        </div>
      </template>
    </Card>
    <Card class='col-12 p-0'>
      <template #title>{{ t('hrm.recruitment.general.candidateRequirements') }}</template>
      <template #content>
        <div class='grid'>
          <InfoRow
            :label='t(`hrm.recruitment.general.gender`)'
            :value='t(`hrm.recruitment.general.${model.gender}`)'/>
          <InfoRow
            :label="t('hrm.recruitment.general.major')"
            :value='model.majorName'/>
          <InfoRow
            :label="t('hrm.recruitment.general.level')"
            :value='model.levelName'/>
          <InfoRow
            :label="t('hrm.recruitment.general.foreignLanguage')"
            :value='model.foreignLanguageName'/>
          <InfoRow
            :label="t('hrm.recruitment.general.experience')"
            :value='model.experienceName'/>
          <InfoRow
            col='col-3'
            :label="t('hrm.recruitment.general.ageFrom')"
            :value='model.ageFrom'/>
          <InfoRow
            col='col-3'
            :label="t('hrm.recruitment.general.ageTo')"
            :value='model.ageTo'/>
          <InfoRow
            col='col-3'
            :label="t('hrm.recruitment.general.heightFrom')"
            :value='model.heightFrom'/>
          <InfoRow
            col='col-3'
            :label="t('hrm.recruitment.general.heightTo')"
            :value='model.heightTo'/>
          <InfoRow
            col='col-3'
            :label="t('hrm.recruitment.general.weightFrom')"
            :value='model.weightFrom'/>
          <InfoRow
            col='col-3'
            :label="t('hrm.recruitment.general.weightTo')"
            :value='model.weightTo'/>
          <InfoRow
            col='col-3'
            :label="t('hrm.recruitment.general.jobDescription')"
            :value='model.description'/>
          <AttachmentFileList
            v-model:receiving-docs='campaignModel.files'
            class='col-12'
            :is-detail='true'/>
        </div>
      </template>
    </Card>
  </div>
</template>

<script lang='ts' setup>

import type { PropType } from 'vue';
import { reactive } from 'vue';
import { useI18n } from 'vue-i18n';

import AttachmentFileList from '@/apps/book-ticket/views/bookFlight/component/AttachmentFileList.vue';
import { getDetailRecruitmentProposalById } from '@/apps/hrm/api/graphql/recruitment';
import type { Campaign } from '@/apps/hrm/model/compaign';
import type { Recruitment } from '@/apps/hrm/model/recruitment';
import InfoRow from '@/apps/hrm/views/recruitment/detail/recruitment/InfoRow.vue';
import AppUser from '@/common/components/app/AppUser.vue';
import { formatCurrencyWithDigits, formatDate } from '@/common/helpers/utils';

const model = reactive<Recruitment>({} as Recruitment);

const campaignModel = defineModel('campaign', {
  type: Object as PropType<Campaign>,
  default: {} as Campaign, 
});

if(campaignModel.value.recruitmentProposalId){
  getDetailRecruitmentProposalById(campaignModel.value.recruitmentProposalId).onResult((res) => {
    const value = res.data.getDetailRecruitmentProposalById;
    Object.assign(model, value);
  });
  
}

const { t } = useI18n();

</script>

<style scoped>
:deep(.p-card-content) {
  padding-bottom: 0;
}
</style>
