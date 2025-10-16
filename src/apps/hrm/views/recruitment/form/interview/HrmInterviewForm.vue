<template>
  <form ref='formRef'>
    <Accordion
      :active-index='[0, 1, 2]'
      multiple>
      <AccordionTab :header='t("hrm.interview.general.title")'>
        <HrmInterviewGeneralForm
          v-model:interview='interview'/>
      </AccordionTab>
      <AccordionTab :header='t("hrm.interview.fileTitle")'>
        <HrmInterviewFilesForm
          v-model:files='interview.files'/>
      </AccordionTab>
    </Accordion>
  </form>
</template>

<script lang='ts' setup>
import moment from 'moment';
import { type PropType, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { saveCandidate } from '@/apps/hrm/api/rest/candidate';
import type { Interview } from '@/apps/hrm/model/interview';

import { appendAttachedFilesToFormData } from '../../helpers/utils';
import HrmInterviewFilesForm from './HrmInterviewFilesForm.vue';
import HrmInterviewGeneralForm from './HrmInterviewGeneralForm.vue';

const { t } = useI18n();

const interview = defineModel('interview', {
  type: Object as PropType<Interview>,
  default: {} as Interview, 
});

console.log(interview.value);

const formRef = ref<HTMLFormElement>();
function submitForm() {
  console.log(interview.value);
  
  if (formRef.value) {
    const data = new FormData(formRef.value);
    data.append('interviewTimeFrom', interview.value.interviewTimeFrom ? moment(interview.value.interviewTimeFrom).format('HH:mm') : '');
    data.append('interviewTimeTo', interview.value.interviewTimeTo ? moment(interview.value.interviewTimeTo).format('HH:mm') : '');
    appendAttachedFilesToFormData(data, interview.value.files);
    if (interview.value.id) {
      data.append('id', interview.value.id);
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
