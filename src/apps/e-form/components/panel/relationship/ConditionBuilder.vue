<template>
  <div class='condition-node'>
    <div class='align-items-center flex input-wrapper'>
      <select
        v-model='type'
        style='width: unset'>
        <option value='simple'>Simple</option>
        <option value='composite'>Composite (AND/OR)</option>
      </select>
      <i
        class='cursor-pointer ml-auto pi pi-trash text-red-400'
        title='Remove Condition'
        @click='emit("remove-condition")'></i>
    </div>

    <div
      v-if="type === 'simple'"
      class=''>
      <select
        v-model='simple.target'
        class='input-wrapper'>
        <option
          v-for='(el, index) in elements'
          :key='index'
          :value='el.config.name'>{{ el.config.name }} ({{ el.config.label }} - {{ el.type }})
        </option>
      </select>

      <select
        v-model='simple.operator'
        class='input-wrapper'>
        <option value='exists'>exists</option>
        <option value='equals'>equals</option>
        <option value='notEquals'>notEquals</option>
        <option value='greaterThan'>greaterThan</option>
        <option value='lessThan'>lessThan</option>
      </select>

      <input
        v-if='needsValue(simple.operator)'
        v-model='simple.value'
        class='input-wrapper'
        placeholder='Value'/>
    </div>

    <div v-else>
      <select
        v-model='composite.logic'
        class='input-wrapper'
        style='width: unset'>
        <option value='AND'>AND</option>
        <option value='OR'>OR</option>
      </select>

      <div
        class='border-l flex flex-column gap-2 ml-4 pl-2 wrapper'>
        <ConditionBuilder
          v-for='(cond, i) in composite.conditions'
          :key='i'
          v-model:condition='composite.conditions[i]'
          :elements='elements'
          :level='level + 1'
          @remove-condition='() => removeCondition(i)'/>
      </div>

      <button
        class='btn mt-2'
        @click='addCondition'>Add Condition
      </button>
    </div>
  </div>
</template>

<script lang='ts' setup>

import { computed, type PropType } from 'vue';

import type {
  CompositeCondition,
  ConditionConfig,
  ElementConfig,
  SimpleCondition
} from '@/apps/e-form/model/form-config';

const props = defineProps({
  condition: {
    type: Object as PropType<ConditionConfig>,
    default: () => ({
      target: '',
      operator: 'exists'
    })
  },
  elements: {
    type: Array as PropType<ElementConfig[]>,
    default: () => []
  },
  level: {
    type: Number,
    default: 0
  },
});

const emit = defineEmits(['update:condition', 'remove-condition']);

function isSimpleCondition(cond: ConditionConfig): cond is SimpleCondition {
  return 'target' in cond && 'operator' in cond;
}

function isCompositeCondition(cond: ConditionConfig): cond is CompositeCondition {
  return 'logic' in cond && 'conditions' in cond;
}

const type = computed({
  get() {
    return 'logic' in props.condition ? 'composite' : 'simple';
  },
  set(val: string) {
    if (val === 'simple') {
      emit('update:condition', {
        target: props.elements[0].config.name,
        operator: 'exists'
      });
    } else {
      emit('update:condition', {
        logic: 'AND',
        conditions: []
      });
    }
  }
});

const simple = computed({
  get(): SimpleCondition {
    if (isSimpleCondition(props.condition)) {
      return props.condition;
    }
    return {
      target: '',
      operator: 'exists'
    };
  },
  set(val: SimpleCondition) {
    emit('update:condition', val);
  }
});

const composite = computed({
  get(): CompositeCondition {
    if (isCompositeCondition(props.condition)) {
      return props.condition;
    }
    return {
      logic: 'AND',
      conditions: []
    }; // fallback an toàn
  },
  set(val: CompositeCondition) {
    emit('update:condition', val);
  }
});

function addCondition() {
  if (type.value === 'composite') {
    composite.value.conditions.push({
      target: props.elements[0].config.name || '',
      operator: 'exists'
    });
  }
}

function needsValue(operator: string) {
  return operator !== 'exists';
}

function removeCondition(index: number) {
  if (type.value === 'composite') {
    composite.value.conditions.splice(index, 1);
  }
}
</script>

<style scoped>
input, select {
  padding: 6px;
  width: 100%;
}

.input-wrapper {
  display: block;
  margin-top: 4px;
  margin-bottom: 12px;
}

.btn {
  padding: 4px 8px;
  background-color: #10b981;
  color: white;
  border: none;
  cursor: pointer;
}

.wrapper {
  .condition-node {
    position: relative;

    &::before {
      content: '';
      position: absolute;
      top: 0.75rem;
      left: -12px;
      width: 12px;
      border-top: 1px dashed #999;
    }

    &::after {
      content: '';
      position: absolute;
      top: 0;
      margin-top: -0.75rem;
      left: -12px;
      border-left: 1px dashed #999;
      height: calc(100% + 0.75rem);
    }
  }

  /* Ẩn đường dọc cuối nếu là leaf node cuối cùng */

  .condition-node:last-child::after {
    height: 1.5rem;
  }
}
</style>
