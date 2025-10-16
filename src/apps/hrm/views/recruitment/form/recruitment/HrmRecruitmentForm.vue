<template>
  <form ref='formRef'>
    <HrmRecruitmentGeneralForm v-model='model'/>
  </form>
</template>

<script lang='ts' setup>

import { type PropType, ref } from 'vue';

import { saveRecruiltment } from '@/apps/hrm/api/rest/recruitment';
import type { Recruitment } from '@/apps/hrm/model/recruitment';
import HrmRecruitmentGeneralForm from '@/apps/hrm/views/recruitment/form/recruitment/HrmRecruitmentGeneralForm.vue';

import { appendAttachedFilesToFormData } from '../../helpers/utils';
const model = defineModel({
  type: Object as PropType<Recruitment>,
  default: {} as Recruitment,
});
const formRef = ref<HTMLFormElement>();

function submitForm() {
  if (formRef.value) {
    const data = new FormData(formRef.value);
    appendAttachedFilesToFormData(data, model.value.files);
    if (model.value.id) {
      data.append('id', model.value.id);
    }
    return saveRecruiltment(data);
  } else {
    return Promise.reject();
  }
}

defineExpose({ submitForm });
</script>

<style scoped>

</style>
