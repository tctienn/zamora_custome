<template>
  <!-- Label -->
  <div
    v-if='field?.config.label'
    class='field'>
    <label>Label</label>
    <InputText
      v-model='field.config.label'
      class='w-full'/>
  </div>

  <!-- Placeholder -->

  <div
    v-if='requiredNames.includes(field.type)'
    class='field'>
    <label>Name</label>
    <InputText
      class='w-full'
      :model-value='field.config.name'
      @update:model-value='updateName'/>
  </div>
  <div
    v-if='hasPlaceholder.includes(field.type)'
    class='field'>
    <label>Placeholder</label>
    <InputText
      v-model='field.config.placeholder'
      class='w-full'/>
  </div>

  <!-- span -->
  <div class='field'>
    <label>Span - cột</label>
    <InputNumber
      v-model='field.config.span'
      class='w-full'
      :max='12'
      :min='1'
      mode='decimal'/>
  </div>

  <div class='field'>
    <label>Validation</label>
    <ValidationRuleForm
      v-model='field.config.validations'
      :rule-types='VALIDATION_RULE_MAPPING[field.type]'/>
  </div>

</template>

<script lang='ts' setup>
import { type PropType } from 'vue';

import ValidationRuleForm from '@/apps/e-form/components/panel/validation/ValidationRuleForm.vue';
import {
  type ElementConfig,
  hasPlaceholder,
  requiredNames,
  VALIDATION_RULE_MAPPING
} from '@/apps/e-form/model/form-config';

const field = defineModel({
  type: Object as PropType<ElementConfig>,
  default: {}
});

function updateName(value: string) {
  field.value.config.name = value.replace(/\s+/g, '');
}
</script>

<style scoped>
</style>
