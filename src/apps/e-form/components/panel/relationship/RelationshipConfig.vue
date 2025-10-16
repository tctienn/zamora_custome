<template>
  <FormConfigSidebar header='Relationship Config'>
    <div
      v-for='reKey in Object.keys(relationshipsReactive)'
      :key='reKey'
      class='bg-black-alpha-20 border-round mb-2 p-2'>
      <div class='align-items-center flex gap-2 input-wrapper'>
        <label>Element:</label>
        <select
          :value='reKey'
          @change='updateRelationshipKey(reKey, ($event.target as HTMLSelectElement)?.value || "")'>
          <option
            v-for='(el, index) in getAvailableElements(reKey)'
            :key='index'
            :value='el.config.name'>{{ el.config.name }} ({{ el.config.label }} - {{ el.type }})
          </option>
        </select>

        <i
          class='cursor-pointer ml-auto pi pi-trash text-red-400'
          title='Remove Element'
          @click='() =>removeElement(reKey)'></i>

      </div>
      <RelationshipRule
        v-for='(rule, idx) in relationshipsReactive[reKey]'
        :key='idx'
        :can-select-more-rules='relationshipsReactive[reKey].length === 1'
        :elements='elements'
        :rule='rule'
        @remove='removeRule(reKey, idx)'
        @update:condition='(c) => updateRule(reKey, idx, c)'
        @update:rule-key='(k: string) => updateRuleKey(reKey, idx, k as "show" | "hide" | "enable" | "disable")'/>
      <Button
        v-if='canAddRule(reKey)'
        class='mt-2'
        icon='pi pi-plus'
        label='Add Rule'
        size='small'
        @click='addRule(reKey)'>
      </Button>
    </div>
    <Button
      :class='{"p-disabled": availableKeys.length === 0}'
      icon='pi pi-plus'
      label='Add Element'
      size='small'
      @click='addElement'>
    </Button>
  </FormConfigSidebar>
</template>

<script lang='ts' setup>

import { computed, type PropType, reactive, watch } from 'vue';

import FormConfigSidebar from '@/apps/e-form/components/panel/FormConfigSidebar.vue';
import RelationshipRule from '@/apps/e-form/components/panel/relationship/RelationshipRule.vue';
import { type ConditionConfig, type ElementConfig, type RelationshipsConfig } from '@/apps/e-form/model/form-config';

const props = defineProps({
  elements: {
    type: Array as PropType<ElementConfig[]>,
    default: () => []
  },
  relationships: {
    type: Object as PropType<RelationshipsConfig>,
    default: () => ({})
  }
});

const emits = defineEmits<{
  (e: 'update:relationships', relationships: RelationshipsConfig): void
}>();

const relationshipsReactive = reactive<RelationshipsConfig>(props.relationships);
watch(relationshipsReactive, (newValue) => {
  emits('update:relationships', newValue);
});
watch(() => props.relationships, (newValue) => {
  Object.assign(relationshipsReactive, newValue);
}, { immediate: true });

const availableKeys = computed(() => props.elements.map(el => el.config.name).filter(l => l && !relationshipsReactive[l]));

function getAvailableElements(includeKey: string) {
  return props.elements.filter(e => e.config.name === includeKey || !relationshipsReactive[e.config.name || '']);
}

function updateRelationshipKey(oldKey: string, newKey: string) {
  if (oldKey !== newKey) {
    relationshipsReactive[newKey] = relationshipsReactive[oldKey];
    delete relationshipsReactive[oldKey];
  }
}

function addElement() {
  const newKey = availableKeys.value[0];
  if (newKey) {
    relationshipsReactive[newKey] = [];
  }
}

function removeElement(element: string) {
  if (relationshipsReactive[element]) {
    delete relationshipsReactive[element];
  }
}

function canAddRule(element: string) {
  const rules = relationshipsReactive[element] || [];
  const hasVisibility = rules.some(r => r.type === 'show' || r.type === 'hide');
  const hasState = rules.some(r => r.type === 'enable' || r.type === 'disable');

  return !(hasVisibility && hasState);
}

function addRule(element: string) {
  if (!relationshipsReactive[element]) {
    return;
  }
  const rules = relationshipsReactive[element] || [];

  const hasVisibility = rules.some(r => r.type === 'show' || r.type === 'hide');
  const hasState = rules.some(r => r.type === 'enable' || r.type === 'disable');

  const allowedTypes: ('show' | 'hide' | 'enable' | 'disable')[] = [];
  if (!hasVisibility) {
    allowedTypes.push('show');
  }
  if (!hasState) {
    allowedTypes.push('enable');
  }
  const defaultType = allowedTypes[0];
  if (defaultType) {
    relationshipsReactive[element].push({
      type: defaultType,
      condition: {
        target: '',
        operator: 'exists'
      }
    });
  }
}

function removeRule(element: string, index: number) {
  relationshipsReactive[element].splice(index, 1);
}

function updateRule(element: string, index: number, condition: ConditionConfig) {
  relationshipsReactive[element][index].condition = condition;
}

function updateRuleKey(element: string, index: number, key: 'show' | 'hide' | 'enable' | 'disable') {
  relationshipsReactive[element][index].type = key;
}
</script>

<style scoped>
select {
  padding: 6px;
}

.input-wrapper {
  display: block;
  margin-top: 4px;
  margin-bottom: 12px;
}
</style>