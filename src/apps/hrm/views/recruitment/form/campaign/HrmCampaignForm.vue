<template>
  <form ref='formRef'>
    <HrmCampaignGeneralForm
      v-model='model'
      v-model:campaign='campaign'/>
  </form>
</template>

<script lang='ts' setup>

import { type PropType, ref } from 'vue';

import { saveCampaign } from '@/apps/hrm/api/rest/campaign';
import type { Campaign } from '@/apps/hrm/model/compaign';
import type { Recruitment } from '@/apps/hrm/model/recruitment';
import HrmCampaignGeneralForm from '@/apps/hrm/views/recruitment/form/campaign/HrmCampaignGeneralForm.vue';

import { appendAttachedFilesToFormData } from '../../helpers/utils';
const model = defineModel({
  type: Object as PropType<Recruitment>,
  default: {} as Recruitment,
});

const campaign = defineModel('campaign', {
  type: Object as PropType<Campaign>,
  default: {} as Campaign, 
});
const formRef = ref<HTMLFormElement>();
function submitForm() {
  if (formRef.value) {
    const data = new FormData(formRef.value);
    console.log(campaign.value);
    
    appendAttachedFilesToFormData(data, campaign.value.files);
    if (campaign.value.id) {
      data.append('id', campaign.value.id);
    }
    return saveCampaign(data);
  } else {
    return Promise.reject();
  }
}

defineExpose({ submitForm });
</script>

<style scoped>

</style>
