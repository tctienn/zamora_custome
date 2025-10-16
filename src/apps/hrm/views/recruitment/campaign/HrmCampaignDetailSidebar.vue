<template>
  <Sidebar
    v-model:visible='visible'
    :block-scroll='true'
    :dismissable='false'
    position='right'
    :pt="{
      header: {
        class: 'border-bottom-1 border-300',
      },
    }"
    :show-close-icon='false'
    style='width: 70rem'>
    <template #header>
      <div class='align-items-center flex justify-content-between w-full'>
        <div class='align-items-center flex gap-2'>
          <Button
            icon='pi pi-arrow-left'
            severity='danger'
            @click='hideForm'/>
          <div class='p-sidebar-header-content'>
            {{ t(`hrm.campaign.title`) }}
          </div>
        </div>
      </div>
    </template>
    <HrmCampaignDetail
      ref='formRef'
      v-model:campaign='campaign'
      class='mt-2'/>
  </Sidebar>
</template>

<script lang='ts' setup>
import { inject, type PropType, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import type { Campaign } from '@/apps/hrm/model/compaign';
import HrmCompaignForm from '@/apps/hrm/views/recruitment/form/campaign/HrmCampaignForm.vue';

import HrmCampaignDetail from '../detail/campaign/HrmCampaignDetail.vue';

const { t } = useI18n();
const visible = defineModel('visible', { type: Boolean });
const campaign = defineModel('campaign', { type: Object as PropType<Campaign> });

const formRef = ref<InstanceType<typeof HrmCompaignForm>>();
const resetData = inject('resetData', () => void {});
function hideForm() {
  visible.value = false;
  resetData();
}
</script>

<style scoped>

</style>
