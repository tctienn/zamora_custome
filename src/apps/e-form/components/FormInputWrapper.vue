<template>
  <div class='field'>
    <label
      :class='{"label-editable": mode === ElementMode.CONFIG}'
      :contenteditable='mode === ElementMode.CONFIG'
      :for='name'
      @focusout='updateLabel'>
      {{ label }}
    </label>
    <span
      v-if='required'
      class='ml-1 text-red-500'>*</span>
    <slot></slot>
    <small
      v-if='error'
      class='text-red-500'>{{ error }}</small>
  </div>
</template>

<script lang='ts' setup>

import type { PropType } from 'vue';

import { ElementMode } from '@/apps/e-form/components/element';

const props = defineProps({
  label: {
    type: String,
    required: true
  },
  mode: {
    type: String as PropType<ElementMode>,
    required: true,
  },
  name: {
    type: String,
    default: ''
  },
  error: {
    type: String,
    default: undefined
  },
  required: {
    type: Boolean,
    default: false
  }
});

const emits = defineEmits(['update:label']);

function updateLabel(event: Event) {
  if (props.mode === ElementMode.CONFIG) {
    const target = event.target as HTMLLabelElement;
    const newLabel = target.innerText.trim();

    if (newLabel !== props.label) {
      emits('update:label', newLabel);
    }
  }
}
</script>

<style scoped>
.label-editable {
  cursor: text;
  outline: none;
}
</style>