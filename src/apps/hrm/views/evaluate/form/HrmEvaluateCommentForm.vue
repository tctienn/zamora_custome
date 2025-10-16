<template>
  <div class='formgrid grid'>
    <div class='col-12 mb-2'><p>{{ t('hrm.evaluate.general.note')}}</p></div>
    <FormInputTextArea
      v-model='modelValue.note'
      class='col-12 mb-0 pt-1'
      :label="t('')"/>
  </div>
</template>

<script lang='ts' setup>
import type { PropType } from 'vue';
import { useI18n } from 'vue-i18n';

import FormInputTextArea from '@/apps/hrm/components/form/FormInputTextArea.vue';
import type { Evaluate } from '@/apps/hrm/model/evaluate';
const { t } = useI18n();
const modelValue = defineModel({
  type: Object as PropType<Evaluate>,
  default: {} as Evaluate,
});
</script>

<style scoped>
</style>
