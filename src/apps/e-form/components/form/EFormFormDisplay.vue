<template>
  <div class='e-form-display'>
    <EFormElementWrapper
      v-for='(element, index) in (config?.elements || [])'
      v-show="!getElementState(element.config?.name || '').hidden"
      :key='index'
      :edit-mode='false'
      :element='element'
      :total-columns='totalColumns'>
      <DynamicEFormElement
        :disabled="getElementState(element.config?.name || '').disabled"
        :error='element.config.name ? (v$[element.config.name]?.$error ? v$[element.config.name]?.$errors[0]?.$message : "") : ""'
        :mode='editMode? ElementMode.EDIT : ElementMode.VIEW'
        :model-value='getModelValueByConfig(element.config)'
        :required='element.config.validations?.some(v => v.type === "required")'
        :type='element.type'
        v-bind='omit(element.config, "type")'
        @update:model-value='updateModelValueByConfig(element.config, $event)'/>
    </EFormElementWrapper>
  </div>
</template>

<script lang='ts' setup>
import { useVuelidate, type Validation, type ValidationRuleWithParams } from '@vuelidate/core';
import { helpers, required } from '@vuelidate/validators';
import { omit } from 'lodash';
import { computed, type PropType, reactive, type Ref, watch } from 'vue';

import DynamicEFormElement from '@/apps/e-form/components/DynamicEFormElement.vue';
import { ElementMode } from '@/apps/e-form/components/element';
import EFormElementWrapper from '@/apps/e-form/components/form/EFormElementWrapper.vue';
import type { ConditionConfig, EFormConfigModel, ElementGeneralConfig } from '@/apps/e-form/model/form-config';
import {
  dateAfter,
  dateBefore,
  maxLengthCustom,
  maxValueCustom,
  minLengthCustom,
  minValueCustom,
  regexCustom
} from '@/common/helpers/customValidators';

const props = defineProps({
  totalColumns: {
    type: Number,
    default: 12,
  },
  editMode: {
    type: Boolean,
    default: false,
  },
  data: {
    type: Object as PropType<Record<string, any>>,
    default: () => ({})
  }
});

const config = defineModel({
  type: Object as PropType<EFormConfigModel>,
  default: {},
});

const dataReactive = reactive(props.data);

watch(() => props.data, (value) => {
  Object.assign(dataReactive, value);
});

const rules = computed(() => {
  const result: Record<string, { [key: string]: ValidationRuleWithParams }[]> = {};

  (config.value?.elements || []).forEach(element => {
    const name = element.config.name;
    const validations = element.config.validations || [];
    const fieldRules: { [key: string]: ValidationRuleWithParams }[] = [];

    validations.forEach(rule => {
      switch (rule.type) {
      case 'required':
        fieldRules.push(
          { required: helpers.withMessage(rule.errorMessage || 'Bắt buộc', required) });
        break;
      case 'minLength':
        fieldRules.push(
          { minLength: minLengthCustom(rule.value, rule.errorMessage) }
        );
        break;
      case 'maxLength':
        fieldRules.push(
          { maxLength: maxLengthCustom(rule.value, rule.errorMessage) }
        );
        break;
      case 'min':
        fieldRules.push(
          { min: minValueCustom(rule.value, rule.errorMessage) }
        );
        break;
      case 'max':
        fieldRules.push(
          { max: maxValueCustom(rule.value, rule.errorMessage) }
        );
        break;
      case 'regex':
        fieldRules.push(
          { regex: regexCustom(rule.value, rule.errorMessage) }
        );
        break;
      case 'sameAs':
        fieldRules.push(
          {
            sameAs: helpers.withMessage(
              rule.errorMessage || `Phải giống với ${rule.value}`,
              helpers.withParams({ sameAs: rule.value },
                (value, siblingState, vm) => siblingState === dataReactive[rule.value])
            )
          }
        );
        break;
      case 'before':
        fieldRules.push({ before: dateBefore(rule.value, rule.errorMessage) });
        break;
      case 'after':
        fieldRules.push({ after: dateAfter(rule.value, rule.errorMessage) });
        break;
      }
    });

    if (name) {
      result[name] = fieldRules;
    }
  });

  return result;
});

const v$: Ref<Validation> = useVuelidate(rules, dataReactive);

function getModelValueByConfig(c: ElementGeneralConfig | undefined) {
  const name = c?.name;
  if (name) {
    return dataReactive[name];
  }
}

function updateModelValueByConfig(c: ElementGeneralConfig | undefined, value: any) {
  const name = c?.name;
  if (name) {
    dataReactive[name] = value;
  }
}

function evaluateCondition(condition: ConditionConfig): boolean {
  if ('logic' in condition) {
    const results = condition.conditions.map(evaluateCondition);
    return condition.logic === 'AND'
      ? results.every(Boolean)
      : results.some(Boolean);
  } else {
    if (!condition.target) {
      return true;
    }
    const value = dataReactive[condition.target];
    switch (condition.operator) {
    case 'exists':
      return value !== undefined && value !== null && value !== '';
    case 'equals':
      return value == condition.value;
    case 'notEquals':
      return value != condition.value;
    case 'greaterThan':
      return value > condition.value;
    case 'lessThan':
      return value < condition.value;
    default:
      return false;
    }
  }
}

function getElementState(name: string) {
  const rules = config.value.relationships?.[name] || [];
  let hidden = false;
  let disabled = false;

  for (const rule of rules) {
    const valid = evaluateCondition(rule.condition);
    switch (rule.type) {
    case 'show':
      hidden = hidden || !valid;
      break;
    case 'hide':
      hidden = hidden || valid;
      break;
    case 'enable':
      disabled = disabled || !valid;
      break;
    case 'disable':
      disabled = disabled || valid;
      break;
    }
  }

  return {
    hidden,
    disabled
  };
}
</script>

<style scoped>
.e-form-display {
  display: grid;
  grid-template-columns: repeat(v-bind(totalColumns), 1fr);
  gap: 0 0.5rem;
}
</style>