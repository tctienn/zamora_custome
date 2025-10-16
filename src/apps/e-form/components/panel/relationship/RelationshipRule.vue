<template>
  <div class='relationship-rule'>
    <div class='align-items-center flex gap-2 mb-2'>
      <label>Type:</label>
      <select
        :value='rule.type'
        @change="$emit('update:ruleKey', ($event.target as HTMLSelectElement)?.value || '')">
        <option
          v-for='key in getAvailableRuleKeys(rule.type)'
          :key='key'
          :value='key'>{{ key }}
        </option>
      </select>
      <i
        class='cursor-pointer ml-auto pi pi-trash text-red-400'
        title='Remove Rule'
        @click="$emit('remove')"></i>
    </div>
    <ConditionBuilder
      :condition='rule.condition'
      :elements='elements'
      @remove-condition='removeCondition'
      @update:condition='emits("update:condition", $event)'/>
  </div>
</template>

<script lang='ts' setup>

import type { PropType } from 'vue';

import ConditionBuilder from '@/apps/e-form/components/panel/relationship/ConditionBuilder.vue';
import type { ConditionConfig, ElementConfig, RelationshipActionConfig } from '@/apps/e-form/model/form-config';

const props = defineProps({
  rule: {
    type: Object as PropType<RelationshipActionConfig>,
    required: true
  },
  elements: {
    type: Array as PropType<ElementConfig[]>,
    default: () => []
  },
  canSelectMoreRules: {
    type: Boolean,
    default: false
  }
});
const emits = defineEmits<{
  (e: 'remove'): void
  (e: 'update:condition', condition: ConditionConfig): void
  (e: 'update:ruleKey', key: string): void
}>();

function removeCondition() {
  emits('update:condition', {
    target: '',
    operator: 'exists',
    value: undefined
  });
}

function getAvailableRuleKeys(forType: 'show' | 'hide' | 'enable' | 'disable') {
  const visibilityKeys = ['show', 'hide'];
  const enableKeys = ['enable', 'disable'];
  if (props.canSelectMoreRules) {
    return [...visibilityKeys, ...enableKeys];
  }
  if (visibilityKeys.includes(forType)) {
    return visibilityKeys;
  } else if (enableKeys.includes(forType)) {
    return enableKeys;
  }
  return [];
}
</script>

<style scoped>
select {
  padding: 6px;
}
</style>