<template>
  <div class='flex flex-column gap-2'>
    <HrmEmployeeFormHeader
      class='fixed z-5'
      style='width: 96.5%'
      @change-tab='changeTab($event)'/>
    <form
      ref='formRef'
      class='pt-8'
      @submit.prevent='submitForm'>
      <Accordion
        v-if="tabForm==='summary'"
        :active-index='[0, 1]'
        lazy
        multiple>
        <AccordionTab :header='t("hrm.profile.general.title")'>
          <HrmProfileGeneralForm
            :id='model?.employeeId'
            :model-value='model?.general'
            :order-number='model?.orderNumber'
            :status='model?.status'/>
        </AccordionTab>
        <AccordionTab :header='t("hrm.profile.education.title")'>
          <HrmProfileEducationForm :model-value='model?.education'/>
        </AccordionTab>
        <AccordionTab :header="t('hrm.profile.recruitment.title')">
          <HrmProfileRecruitmentForm :model-value='model?.recruitment'/>
        </AccordionTab>
        <AccordionTab :header="t('hrm.profile.CCCDPassport.title')">
          <HrmProfileCCCDPassportForm :model-value='model?.cccdPassport'/>
        </AccordionTab>
        <AccordionTab :header="t('hrm.profile.bankTax.title')">
          <HrmProfileBankTaxForm :model-value='model?.bankTax'/>
        </AccordionTab>
        <AccordionTab :header="t('hrm.profile.contact.title')">
          <HrmProfileContactForm :model-value='model?.contact'/>
        </AccordionTab>
        <AccordionTab :header="t('hrm.profile.partyUnionArmy.title')">
          <HrmProfilePartyUnionArmyForm :model-value='model?.partyUnionArmy'/>
        </AccordionTab>
        <AccordionTab :header="`8. ${t('hrm.profile.other.title')}`">
          <HrmProfileOtherInfoForm :model-value='model?.otherInfo'/>
        </AccordionTab>
      </Accordion>
      <ReceivingDocTab
        v-if="tabForm==='receptionDocuments'"
        :snapshot-id='model.snapshotId'/>
      <FamilyRelationshipInfoTab
        v-if="tabForm==='familyRelationship'"
        :snapshot-id='model.snapshotId'/>
      <TrainingProcessTab
        v-if="tabForm==='trainingProcess'"
        :employee-id='model.employeeId'
        :snapshot-id='model.snapshotId'/>
      <WorkProcessTab
        v-if="tabForm==='workProcess'"
        :employee-id='model.employeeId'/>
      <HealthTab
        v-if="tabForm==='health'"
        :is-view='false'
        :snapshot-id='model.snapshotId'/>
      <ProfessionalSkills
        v-if="tabForm==='skill'"
        :is-edit='true'
        :snapshot-id='model.snapshotId'/>
    </form>
  </div>

</template>

<script lang='ts' setup>

import { storeToRefs } from 'pinia';
import { computed, onMounted, type PropType, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { employeeSummaryById } from '@/apps/hrm/api/graphql/employee';
import { createEmployee, updateEmployee } from '@/apps/hrm/api/rest/employee';
import type { Employee } from '@/apps/hrm/model/employee';
import ProfessionalSkills from '@/apps/hrm/views/profile/detail/ProfessionalSkills.vue';
import HealthTab from '@/apps/hrm/views/profile/form/health/HealthTab.vue';
import HrmProfileBankTaxForm from '@/apps/hrm/views/profile/form/profile/HrmProfileBankTaxForm.vue';
import HrmProfileCCCDPassportForm from '@/apps/hrm/views/profile/form/profile/HrmProfileCCCDPassportForm.vue';
import HrmProfileContactForm from '@/apps/hrm/views/profile/form/profile/HrmProfileContactForm.vue';
import HrmProfileEducationForm from '@/apps/hrm/views/profile/form/profile/HrmProfileEducationForm.vue';
import HrmProfileGeneralForm from '@/apps/hrm/views/profile/form/profile/HrmProfileGeneralForm.vue';
import HrmProfileOtherInfoForm from '@/apps/hrm/views/profile/form/profile/HrmProfileOtherInfoForm.vue';
import HrmProfilePartyUnionArmyForm from '@/apps/hrm/views/profile/form/profile/HrmProfilePartyUnionArmyForm.vue';
import HrmProfileRecruitmentForm from '@/apps/hrm/views/profile/form/profile/HrmProfileRecruitmentForm.vue';
import ReceivingDocTab from '@/apps/hrm/views/profile/form/receiving-doc/ReceivingDocTab.vue';
import FamilyRelationshipInfoTab from '@/apps/hrm/views/profile/form/relationship/FamilyRelationshipInfoTab.vue';
import TrainingProcessTab from '@/apps/hrm/views/profile/form/training-process/TrainingProcessTab.vue';
import WorkProcessTab from '@/apps/hrm/views/profile/form/work-process/WorkProcessTab.vue';
import HrmEmployeeFormHeader from '@/apps/hrm/views/profile/HrmEmployeeFormHeader.vue';
import useMoment from '@/common/helpers/mixins/use-moment';
import { useHrmProfileStore } from '@/common/store/hrm-profile';
import { useUserStore } from '@/common/store/user';

const { t } = useI18n();
const { moment } = useMoment();
const userData = useUserStore();
const { user } = storeToRefs(userData);
const hrmProfileStore = useHrmProfileStore();

const idCurrentUser = computed(() => user.value.id ? user.value.id : '');
const model = defineModel({
  type: Object as PropType<Employee>,
  default: {} as Employee
});
const formRef = ref<HTMLFormElement>();
const tabForm = ref('summary');

function submitForm() {
  if (formRef.value) {
    const data = new FormData(formRef.value);
    if (model.value.employeeId && model.value.snapshotId) {
      return updateEmployee(model.value.employeeId, model.value.snapshotId, data);
    } else {
      hrmProfileStore.callRefetchCountTree();
      return createEmployee(data);
    }
  } else {
    return Promise.reject();
  }
}

function changeTab(tab: string) {
  tabForm.value = tab;
}

onMounted(() => {
  if (model.value.employeeId) {
    employeeSummaryById(model.value.employeeId).onResult((res) => {
      const employee = res.data?.employeeSummaryById;
      if (idCurrentUser.value === employee?.userId && model.value.contact) {
        model.value.contact.zamoraId = employee?.userId;
      }
    });
  }
});

defineExpose({ submitForm });
</script>

<style scoped>
:deep(.p-accordion .p-accordion-header .p-accordion-header-link) {
  padding: 9px !important;
}
</style>
