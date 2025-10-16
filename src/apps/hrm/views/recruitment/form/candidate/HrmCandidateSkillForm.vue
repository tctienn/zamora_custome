<template>
  <div class='formgrid grid'>
    <div class='col-12 field'><p class='font-bold'>{{ t('hrm.candidate.skill.title')}}</p></div>
    <div class='col-6 field'>
      <label>{{ t('hrm.candidate.skill.hardSkill') }}</label>
      <AppEditor
        v-model='candidateValue.hardSkill'
        editor-style='height: 10rem;'
        :label="t('hrm.candidate.skill.hardSkill')"
        name='hardSkill'/>
      <input
        v-model='candidateValue.hardSkill'
        hidden
        name='hardSkill'>
    </div>
    <div class='col-6 field'>
      <label>{{ t('hrm.candidate.skill.softSkill') }}</label>
      <AppEditor
        v-model='candidateValue.softSkill'
        editor-style='height: 10rem;'
        :label="t('hrm.candidate.skill.softSkill')"
        name='softSkill'/>
      <input
        v-model='candidateValue.softSkill'
        hidden
        name='softSkill'>
    </div>
  </div>
</template>

<script lang='ts' setup>
import type { PropType } from 'vue';
import { useI18n } from 'vue-i18n';

import type { Candidate } from '@/apps/hrm/model/candidate';
import AppEditor from '@/common/components/custom/AppEditor.vue';
const { t } = useI18n();
const candidateValue = defineModel('candidate', {
  type: Object as PropType<Candidate>,
  default: {} as Candidate, 
});
</script>