<template>
  <TabMenu
    v-model:active-index='activeIndex'
    class='border-1 border-300 border-round-sm flex p-1 surface-0'
    :model='menus'
    style='min-height: 45px'>
    <template #item='{item}'>
      <div
        v-ripple
        class='flex gap-2 p-menuitem-link p-ripple px-3 py-2'>
        <a style='height: 1.5rem'>{{ item.label }}</a>
      </div>
    </template>
  </TabMenu>
  <div class='mt-2'>
    <QuickSurveyView v-if='activeIndex===0'/>
  </div>
</template>

<script setup lang='ts'>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

import QuickSurveyView from '@/apps/media/views/survey/QuickSurveyView.vue';

const { t } = useI18n();
const activeIndex = ref(0);
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
</script>

<style scoped>

</style>