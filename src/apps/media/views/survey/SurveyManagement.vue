<template>
  <Toolbar class='align-content-center h-3rem mb-2 px-2 py-0 surface-0'>
    <template #start>
      <div class='align-items-center flex gap-2 h-3rem'>
        <div class='font-bold'>
          Quản trị khảo sát
        </div>
      </div>
    </template>
  </Toolbar>
  <div class='align-items-center border-1 border-300 border-round-sm flex justify-content-between mb-2 p-2 surface-0'>
    <TabMenu
      v-model:active-index='activeIndex'
      :model='menus'>
      <template #item='{item}'>
        <div
          v-ripple
          class='flex gap-2 p-menuitem-link p-ripple px-3 py-2'>
          <a style='height: 1.5rem'>{{ item.label }}</a>
        </div>
      </template>
    </TabMenu>
    <div>
      <Button
        class='border-round-sm btn-create focus:shadow-none font-medium p-2'
        icon='pi pi-plus'
        :label='t("common.create")'
        @click='openForm()'>
      </Button>

    </div>
  </div>

  <QuickSurveyManagement
    v-if='activeIndex === 0'
    :show-quick-survey-form='showQuickSurveyForm'/>

</template>

<script setup lang='ts'>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

import QuickSurveyManagement from '@/apps/media/views/survey/QuickSurveyManagement.vue';

const { t } = useI18n();
const activeIndex = ref(0);

const showQuickSurveyForm = ref(false);

const menus = [
  {
    label: t('media.survey.quickSurvey'),
    code: 'quick-survey',
  },
  {
    label: t('media.survey.surveyForm'),
    code: 'survey-form',
  }
];
const openForm = () => {
  if (activeIndex.value === 0) {
    showQuickSurveyForm.value = !showQuickSurveyForm.value;
  }

};
</script>

<style scoped>

</style>