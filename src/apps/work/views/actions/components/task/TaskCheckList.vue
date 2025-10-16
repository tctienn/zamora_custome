<template>
  <div class='align-items-center flex flex-row gap-2'>
    <slot name='icon'></slot>
    <label
      :class='labelClass'
      for='checklist'>
      {{ t('work.checklist') }}
    </label>
  </div>

  <div class='flex flex-column ml-2 row-gap-2 task-checklist'>
    <ButtonIcon
      v-if='editable'
      class='p-1 w-fit'
      icon='add'
      :label='t("work.addChecklist")'
      text
      @click='addChecklist'>
    </ButtonIcon>
    <div
      v-for='(checklist, index) in modelValue'
      :key='index'
      class='column-gap-3 flex flex-row'>
      <Checkbox
        binary
        :disabled='!editable'
        :model-value='checklist.isComplete'
        @change='updateCheckListCompleted(index)'/>
      <div
        class='div-editable flex-grow-1'
        :class='{"line-through" : checklist.isComplete}'
        :contenteditable='editable'
        @blur='updateCheckListValue($event, index)'
        @keydown.enter='addChecklist'>{{ checklist.name }}
      </div>

      <ButtonIcon
        v-if='editable'
        class='align-self-center p-1 w-auto'
        icon='do_not_disturb_on'
        rounded
        severity='danger'
        text
        @click='removeCheckList(index)'/>
    </div>
  </div>
</template>

<script setup lang='ts'>
import type { PropType } from 'vue';
import { useI18n } from 'vue-i18n';

import type { CheckList } from '@/apps/work/model/task';

const props = defineProps({
  modelValue: {
    type: Array as PropType<CheckList[]>,
    required: true
  },
  editable: {
    type: Boolean,
    default: () => false
  },
  labelClass: {
    type: String,
    default: () => ''
  }
});
const emit = defineEmits(['update:modelValue']);
const { t } = useI18n();

function addChecklist(e: Event) {
  e.preventDefault();
  (e.target as HTMLElement)?.blur();
  const newCheckList: CheckList = {
    name: t('work.checkList.defaultName'),
    isComplete: false
  };
  emit('update:modelValue', [...props.modelValue, newCheckList]);
}

function updateCheckListValue(e: Event, index: number) {
  const checkListValue = (e.target as HTMLElement).textContent;
  emit('update:modelValue', props.modelValue?.map((c, i) => i === index
    ? {
      ...c,
      name: checkListValue
    }
    : c));
}

function updateCheckListCompleted(index: number) {
  emit('update:modelValue', props.modelValue?.map((c, i) => i === index
    ? {
      ...c,
      isComplete: !c.isComplete
    }
    : c));
}

function removeCheckList(index: number) {
  emit('update:modelValue', props.modelValue?.filter((c, i) => i !== index));
}

</script>

<script lang='ts'>
export default { name: 'TaskCheckList' };
</script>

<style lang='scss' scoped>

.div-editable {
  &:focus-visible {
    outline: none;
    border-bottom: 1px solid var(--primary-400);
  }
}
</style>