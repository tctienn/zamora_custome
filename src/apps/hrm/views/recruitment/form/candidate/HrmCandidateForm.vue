<template>
  <form ref='formRef'>
    <div>
      <HrmCandidateGeneralForm
        v-model:candidate='candidate'/>
    </div>
    <div>
      <HrmCandidateListEducation
        v-model:educations='candidate.candidateEducations'/>
    </div>
    <div class='pt-4'> 
      <HrmCandidateListExperience
        v-model:experiences='candidate.workExperiences'/>
    </div>
    <div class='pt-4'> 
      <HrmCandidateListExtracurricularActivity
        v-model:extracurricularActivitys='candidate.extracuurricularActivities'/>
    </div>
    <div class='pt-4'> 
      <HrmCandidateListCertificates
        v-model:certificates='candidate.certificates'/>
    </div>
    <div class='pt-4'> 
      <HrmCandidateListTitlesAndAward
        v-model:titlesAndAwards='candidate.titlesAndAwards'/>
    </div>
    <div class='pt-4'>
      <HrmCandidateSkillForm
        v-model:candidate='candidate'/>
    </div>
    <div class='pt-4'> 
      <HrmCandidateListReferencePerson
        v-model:referencePersons='candidate.referencePersons'/>
    </div>
    <div class='pt-4'>
      <HrmCandidateHobbyForm
        v-model:candidate='candidate'/>
    </div>
  </form>
</template>

<script lang='ts' setup>

import { type PropType, ref } from 'vue';

import { saveCandidate } from '@/apps/hrm/api/rest/candidate';
import type { Candidate } from '@/apps/hrm/model/candidate';
import HrmCandidateGeneralForm from '@/apps/hrm/views/recruitment/form/candidate/HrmCandidateGeneralForm.vue';

// eslint-disable-next-line max-len
import { createDataCertificates, createDataEducation, createDataExperience, createDataExtracurricularActivity, createDataReferencePersons, createDataTitlesAndAwards } from '../../helpers/utils';
import HrmCandidateListCertificates from '../../list/candidate/HrmCandidateListCertificates.vue';
import HrmCandidateListEducation from '../../list/candidate/HrmCandidateListEducation.vue';
import HrmCandidateListExperience from '../../list/candidate/HrmCandidateListExperience.vue';
import HrmCandidateListExtracurricularActivity from '../../list/candidate/HrmCandidateListExtracurricularActivity.vue';
import HrmCandidateListReferencePerson from '../../list/candidate/HrmCandidateListReferencePerson.vue';
import HrmCandidateListTitlesAndAward from '../../list/candidate/HrmCandidateListTitlesAndAward.vue';
import HrmCandidateHobbyForm from './HrmCandidateHobbyForm.vue';
import HrmCandidateSkillForm from './HrmCandidateSkillForm.vue';

const candidate = defineModel('candidate', {
  type: Object as PropType<Candidate>,
  default: {} as Candidate, 
});

console.log(candidate.value);

const formRef = ref<HTMLFormElement>();
function submitForm() {
  console.log(candidate.value);
  
  if (formRef.value) {
    const data = new FormData(formRef.value);
    createDataEducation(data, candidate.value.candidateEducations);
    createDataExperience(data, candidate.value.workExperiences);
    createDataExtracurricularActivity(data, candidate.value.extracuurricularActivities);
    createDataCertificates(data, candidate.value.certificates);
    createDataTitlesAndAwards(data, candidate.value.titlesAndAwards);
    createDataReferencePersons(data, candidate.value.referencePersons);
    console.log(candidate.value);
    if (candidate.value.id) {
      data.append('id', candidate.value.id);
    }
    return saveCandidate(data);
  } else {
    return Promise.reject();
  }
}

defineExpose({ submitForm });
</script>

<style scoped>

</style>
