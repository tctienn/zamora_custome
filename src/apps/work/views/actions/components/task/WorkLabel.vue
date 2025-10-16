<template>
  <div class='gap-1 grid'>
    <Chip
      v-for='(label, index) in modelValue'
      :key='index'
      :label='label.labelTitle'
      :removable='editable'
      :style='`border: 1px solid ${label.labelColor}`'
      @remove='removeLabel(index)'/>

    <AppIcon
      v-if='editable'
      v-tooltip='t("common.create")'
      class='cursor-pointer'
      name='add'
      @click='showAllLabels'/>
  </div>
  <OverlayPanel
    ref='op'
    class='max-w-75'>
    <div
      v-if='options.length'
      class='gap-1 grid'>
      <Chip
        v-for='(label, index) in options'
        :key='index'
        :class='{"bg-gray-400" : alreadyInModel(label), "cursor-pointer": !alreadyInModel(label)}'
        :label='label.labelTitle'
        :style='!alreadyInModel(label) ? `border: 1px solid ${label.labelColor}` : "border: 1px solid transparent"'
        @click='addLabel(label)'/>

    </div>
    <div v-else>{{ t('common.selectEmpty') }}</div>
  </OverlayPanel>
</template>

<script lang='ts' setup>
import type { PropType } from 'vue';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

import type { Label } from '@/apps/work/model/label';
import AppIcon from '@/common/components/app/AppIcon.vue';

const props = defineProps({
  options: {
    type: Array as PropType<Label[]>,
    default: () => []
  },
  modelValue: {
    type: Array as PropType<Label[]>,
    required: true
  },
  editable: {
    type: Boolean,
    default: () => false
  }
});
const emit = defineEmits(['update:modelValue']);

const { t } = useI18n();
const op = ref();

function showAllLabels(e: Event) {
  op.value.show(e);
}

function addLabel(label: Label) {
  if (alreadyInModel(label)) {
    return;
  }
  emit('update:modelValue', [...props.modelValue, label]);
}

function alreadyInModel(label: Label): boolean {
  return props.modelValue?.findIndex(l => JSON.stringify(l) === JSON.stringify(label)) != -1;
}

function removeLabel(index: number) {
  emit('update:modelValue', props.modelValue?.filter((l, i) => i !== index));
}
</script>

<script lang='ts'>
export default { name: 'WorkLabel' };
</script>

<style scoped>
.p-chip {
  font-size: .75rem;
  padding: 0 .25rem;
}

.p-chip :deep(.p-chip-text) {
  margin: 0;
}
</style>