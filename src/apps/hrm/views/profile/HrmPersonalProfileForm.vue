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
        multiple>
        <AccordionTab :header='t("hrm.profile.general.title")'>
          <HrmProfileGeneralForm
            :id='model?.employeeId'
            :is-edit-by-self='true'
            :model-value='model?.general'/>
        </AccordionTab>
        <AccordionTab :header='t("hrm.profile.education.title")'>
          <HrmProfileEducationForm
            :model-value='model?.education'/>
        </AccordionTab>
        <AccordionTab :header="t('hrm.profile.recruitment.title')">
          <HrmProfileRecruitmentForm
            :model-value='model?.recruitment'/>
        </AccordionTab>
        <AccordionTab :header="t('hrm.profile.CCCDPassport.title')">
          <HrmProfileCCCDPassportForm
            :model-value='model?.cccdPassport'/>
        </AccordionTab>
        <AccordionTab :header="t('hrm.profile.bankTax.title')">
          <HrmProfileBankTaxForm
            :model-value='model?.bankTax'/>
        </AccordionTab>
        <AccordionTab :header="t('hrm.profile.contact.title')">
          <HrmProfileContactForm
            :model-value='model?.contact'/>
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
        :is-edit-by-self='props.isEditBySelf'
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
        :is-view='isView'
        :snapshot-id='model.snapshotId'
        :snapshot-status='snapshotStatus'/>
      <ProfessionalSkills
        v-if="tabForm==='skill'"
        :is-edit='true'
        :snapshot-id='model.snapshotId'/>
    </form>
  </div>

</template>

<script lang='ts' setup>

import { storeToRefs } from 'pinia';
import { computed, inject, nextTick, onMounted, type PropType, type Ref, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { employeeSummaryById } from '@/apps/hrm/api/graphql/employee';
import { createPersonalDraft, updateEmployee } from '@/apps/hrm/api/rest/employee';
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
import { PROFILE_STATUS, type ProfileStatus } from '@/common/constants/profile';
import useMoment from '@/common/helpers/mixins/use-moment';
import { useUserStore } from '@/common/store/user';

const props = defineProps({
  isEditBySelf: {
    type: Boolean,
    default: false
  },
  isView: {
    type: Boolean,
    default: false
  },
  snapshotStatus: {
    type: String,
    default: ''
  }
});

const emits = defineEmits(['update:success']);
const { t } = useI18n();
const { moment } = useMoment();
const model = defineModel({
  type: Object as PropType<Employee>,
  default: {} as Employee
});
const formRef = ref<HTMLFormElement>();
const tabForm = ref('summary');
const currentTab = ref('summary'); // For UI display
const currentProfileStatus = inject<Ref<ProfileStatus | null>>('profileStatus', ref(null));
const userData = useUserStore();
const { user } = storeToRefs(userData);
const idCurrentUser = computed(() => user.value ? user.value.id : '');

async function submitForm() {
  // Store current tab to restore later
  const originalTab = tabForm.value;
  
  try {
    // Temporarily set to summary to ensure form is in correct state
    tabForm.value = 'summary';
    
    // Wait for Vue to update the DOM
    await nextTick();
    
    if (!formRef.value) {
      return Promise.reject(new Error('Form reference is not available'));
    }

    // Create FormData from the actual form elements (this preserves the original format)
    const data = new FormData(formRef.value);
    const { employeeId, snapshotId } = model.value;
    const isDraft = currentProfileStatus.value === PROFILE_STATUS.DRAFT;
    
    if (employeeId && snapshotId) {
      const result = isDraft
        ? await updateEmployee(employeeId, snapshotId, data)
        : await createPersonalDraft(data);
      
      // On successful submission, emit events to trigger reload
      emits('update:success', {
        employeeId,
        snapshotId,
        isDraft,
        result
      });
      
      return result;
    }

    return Promise.reject(new Error('Missing employeeId or snapshotId'));
  } finally {
    // Always restore the original tab
    tabForm.value = originalTab;
  }
}

function changeTab(tab: string) {
  tabForm.value = tab;
}

onMounted(() => {
  if(model.value.employeeId) {
    employeeSummaryById(model.value.employeeId).onResult((res) => {
      const employee = res.data?.employeeSummaryById;
      if(idCurrentUser.value === employee?.userId && model.value.contact) {
        model.value.contact.zamoraId = employee?.userId;
      }
    });
  }
});

defineExpose({ submitForm });
</script>

<style scoped>
:deep(.p-accordion .p-accordion-header .p-accordion-header-link) {
  padding: .8rem !important;
}
</style>
