<template>
  <Dialog
    v-model:visible='visible'
    :breakpoints="{
      '1024px': '50rem',
      '1440px': '75rem'
    }"
    :header='t("common.preview")'
    modal
    position='top'
    style='width: 50rem'>
    <EFormFormDisplay
      edit-mode
      :model-value='config'/>
    <template #footer>
      <Button
        label='Check validation'
        @click='validate'/>
    </template>
  </Dialog>
</template>

<script lang='ts' setup>
import { useVuelidate, type Validation } from '@vuelidate/core';
import type { PropType, Ref } from 'vue';
import { useI18n } from 'vue-i18n';

import EFormFormDisplay from '@/apps/e-form/components/form/EFormFormDisplay.vue';
import type { EFormConfigModel } from '@/apps/e-form/model/form-config';

const config = defineModel<EFormConfigModel>({
  type: Object as PropType<EFormConfigModel>,
  default: () => ({ elements: [] })
});

const visible = defineModel('visible', {
  type: Boolean,
  default: false
});

const { t } = useI18n();
const v$: Ref<Validation> = useVuelidate();
const validate = () => {
  v$.value.$touch();
  return !v$.value.$invalid;

};
</script>

<style scoped>

</style>