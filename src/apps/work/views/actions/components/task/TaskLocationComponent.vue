<template>
  <div class='align-items-center flex flex-row gap-2'>
    <slot name='icon'></slot>
    <label
      :class='labelClass'
      for='location'>
      {{ t('work.location') }}
    </label>
  </div>
  
  <div class='flex flex-column ml-2 row-gap-2 task-location'>
    <ButtonIcon
      class='p-1 w-fit'
      icon='add'
      :label='t("work.addLocation")'
      text
      @click='addLocation'>
    </ButtonIcon>
    <div
      v-for='(location, index) in modelValue'
      :key='index'
      class='column-gap-3 flex flex-row'>
      <div
        class='div-editable flex-grow-1'
        contenteditable
        @blur='updateLocationValue($event, index)'
        @keydown.enter='addLocation'>{{ location.name }}</div>

      <ButtonIcon
        class='align-self-center p-1 w-auto'
        icon='do_not_disturb_on'
        rounded
        severity='danger'
        text
        @click='removeLocation(index)'/>
    </div>
  </div>
</template>

<script setup lang='ts'>
import type { PropType } from 'vue';
import { useI18n } from 'vue-i18n';

import type { TaskLocation } from '@/apps/work/model/task';

const props = defineProps({
  modelValue: {
    type: Array as PropType<TaskLocation[]>,
    required: true
  },
  labelClass: {
    type: String,
    default: () => ''
  }
});
const emit = defineEmits(['update:modelValue']);
const { t } = useI18n();
function addLocation(e: Event) {
  e.preventDefault();
  (e.target as HTMLElement)?.blur();
  const newLocation: TaskLocation = { name: t('work.taskLocation.defaultName'), };
  emit('update:modelValue', [...props.modelValue, newLocation]);
}

function updateLocationValue(e: Event, index: number) {
  const locationValue = (e.target as HTMLElement).textContent;
  emit('update:modelValue', props.modelValue?.map((l, i) => i === index
    ? {
      ...l,
      name: locationValue
    }
    : l));
}

function removeLocation(index: number) {
  emit('update:modelValue', props.modelValue?.filter((c, i) => i !== index));
}
</script>

<script lang='ts'>
export default { name: 'TaskLocationComponent' };
</script>

<style lang='scss' scoped>

.div-editable {
  &:focus-visible {
    outline: none;
    border-bottom: 1px solid var(--primary-400);
  }
}
</style>