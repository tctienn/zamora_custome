<template>
  <Accordion
    :active-index='[0,1,2,3,4,5]'
    lazy
    multiple>
    <AccordionTab :header='t("hrm.profile.general.title")'>
      <ProfileGeneralDetail
        :id='model?.employeeId'
        :model-value='model?.general'
        :status='model?.status'/>
    </AccordionTab>
    <AccordionTab :header='t("hrm.profile.education.title")'>
      <ProfileEducationDetail :model-value='model?.education'/>
    </AccordionTab>
    <AccordionTab :header="t('hrm.profile.recruitment.title')">
      <ProfileRecruitmentDetail :model-value='model?.recruitment'/>
    </AccordionTab>
    <AccordionTab :header="t('hrm.profile.CCCDPassport.title')">
      <ProfileCCCDPassportDetail :model-value='model?.cccdPassport'/>
    </AccordionTab>
    <AccordionTab :header="t('hrm.profile.bankTax.title')">
      <ProfileBankTaxDetail :model-value='model?.bankTax'/>
    </AccordionTab>
    <AccordionTab :header="t('hrm.profile.contact.title')">
      <ProfileContactDetail :model-value='model?.contact'/>
    </AccordionTab>
    <AccordionTab :header="t('hrm.profile.partyUnionArmy.title')">
      <ProfilePartyUnionArmyDetail :model-value='model?.partyUnionArmy'/>
    </AccordionTab>
    <AccordionTab :header="t('hrm.profile.relationship')">
      <ProfileRelationship :snapshot-id='model?.snapshotId'/>
    </AccordionTab>
    <AccordionTab :header="t('hrm.profile.workProcess')">
      <ProfileWorkProcess :snapshot-id='model?.snapshotId'/>
    </AccordionTab>
    <AccordionTab
      :header="`10. ${t('hrm.profile.other.title')}`">
      <ProfileOtherInfoDetail :model-value='model?.otherInfo'/>
    </AccordionTab>
  </Accordion>
</template>

<script setup lang='ts'>
import type { PropType } from 'vue';
import { useI18n } from 'vue-i18n';

import type { Employee } from '@/apps/hrm/model/employee';
import ProfileBankTaxDetail from '@/apps/hrm/views/profile/detail/component/ProfileBankTaxDetail.vue';
import ProfileCCCDPassportDetail from '@/apps/hrm/views/profile/detail/component/ProfileCCCDPassportDetail.vue';
import ProfileContactDetail from '@/apps/hrm/views/profile/detail/component/ProfileContactDetail.vue';
import ProfileEducationDetail from '@/apps/hrm/views/profile/detail/component/ProfileEducationDetail.vue';
import ProfileGeneralDetail from '@/apps/hrm/views/profile/detail/component/ProfileGeneralDetail.vue';
import ProfileOtherInfoDetail from '@/apps/hrm/views/profile/detail/component/ProfileOtherInfoDetail.vue';
import ProfilePartyUnionArmyDetail from '@/apps/hrm/views/profile/detail/component/ProfilePartyUnionArmyDetail.vue';
import ProfileRecruitmentDetail from '@/apps/hrm/views/profile/detail/component/ProfileRecruitmentDetail.vue';
import ProfileRelationship from '@/apps/hrm/views/profile/detail/component/ProfileRelationship.vue';
import ProfileWorkProcess from '@/apps/hrm/views/profile/detail/component/ProfileWorkProcess.vue';

const model = defineModel({
  type: Object as PropType<Employee>,
  default: {} as Employee
});
const { t } = useI18n();
</script>

<style scoped>
:deep(.p-accordion-header-text) {
  color: #0F6CBD;
}

:deep(.p-accordion-tab:last-child) {
  padding-bottom: 18px;
}

:deep(.p-accordion-header-link) {
  padding-top: 10px;
  padding-bottom: 10px;
}
</style>