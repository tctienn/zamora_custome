<template>
  <div class='grid'>
    <Card class='col-12 pl-0'>
      <template #title>{{ t('hrm.contract.general.title') }}</template>
      <template #content>
        <div class='grid'>
          <InfoRow
            :label="t('hrm.recruitment.general.proposalName')"
            :value='model.name'/>
          <InfoRow
            :label="t('hrm.recruitment.general.reason')"
            :value='model.reasonName'/>
          <InfoRow
            :label="t('hrm.recruitment.general.position')"
            :value='model.positionName'/>
          <InfoRow
            :label="t('hrm.recruitment.general.title')"
            :value='model.titleName'/>
          <InfoRow
            col='col-12'
            :label="t('hrm.contract.general.organization')"
            :value='model.departmentName'/>
          <InfoRow
            :label="t('hrm.recruitment.general.fromTime')"
            :value="formatDate(model.fromTime,'DD/MM/YYYY')"/>
          <InfoRow
            :label="t('hrm.recruitment.general.toTime')"
            :value="formatDate(model.toTime,'DD/MM/YYYY')"/>
          <InfoRow
            col='col-3'
            :label="t('hrm.recruitment.general.currentNumberOfEmployees')"
            :value='model.currentNumberOfEmployees'/>
          <InfoRow
            col='col-3'
            :label="t('hrm.recruitment.general.boundaryQuantity')"
            :value='model.boundaryQuantity'/>
          <InfoRow
            col='col-3'
            :label="t('hrm.recruitment.general.numberOfRecruits')"
            :value='model.numberOfRecruits'/>
          <InfoRow
            col='col-3'
            :label="t('hrm.recruitment.general.isRecruitUntilIsEnough')"
            :value="model.isRecruitUntilIsEnough ? 'Có' : 'Không'"/>
          <InfoRow
            :label="t('hrm.recruitment.general.position')"
            :value='model.positionName'/>
          <InfoRow
            :label="t('hrm.recruitment.general.title')"
            :value='model.titleName'/>
        </div>
      </template>
    </Card>
    <Card class='col-12 pl-0'>
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
            v-model:receiving-docs='model.files'
            class='col-12'
            :is-detail='true'/>
        </div>
      </template>
    </Card>
  </div>
</template>

<script lang='ts' setup>

import type { PropType } from 'vue';
import { useI18n } from 'vue-i18n';

import AttachmentFileList from '@/apps/book-ticket/views/bookFlight/component/AttachmentFileList.vue';
import type { Recruitment } from '@/apps/hrm/model/recruitment';
import InfoRow from '@/apps/hrm/views/recruitment/detail/recruitment/InfoRow.vue';
import { formatDate } from '@/common/helpers/utils';

const model = defineModel({
  type: Object as PropType<Recruitment>,
  default: {} as Recruitment,
});
const { t } = useI18n();

</script>

<style scoped>
:deep(.p-card-content) {
  padding-bottom: 0;
}
</style>
