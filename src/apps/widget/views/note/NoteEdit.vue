<template>
  <div>
    <div
      class='div-editable font-bold p-2 text-black-alpha-90 text-lg'
      :contenteditable='editable'
      @blur='updateTitle'>
      {{ modelValue?.title }}
    </div>
    <Textarea
      v-trim
      class='bg-transparent border-none border-noround outline-none resize-none shadow-none text-black-alpha-90 w-full'
      :disabled='!editable'
      :model-value='modelValue.content'
      rows='3'
      @keydown.enter.prevent='handleEnter'
      @update:model-value='updateContent'></Textarea>
    <div class='align-content-end column-gap-1 flex flex-row ml-auto mr-0 w-fit'>
      <ButtonIcon
        v-if='isNew && editable'
        v-tooltip='t("ecm.group.noteWidget.save")'
        icon='add'
        text
        @click='emits("saveNote")'/>
      <ButtonIcon
        v-if='!isNew'
        v-tooltip='t("common.close")'
        icon='close'
        text
        @click='emits("closeEdit")'/>
    </div>
  </div>

</template>

<script setup lang='ts'>
import type { PropType } from 'vue';
import { useI18n } from 'vue-i18n';

import type { Note } from '@/common/model/widget/note';

const props = defineProps({
  modelValue: {
    type: Object as PropType<Note>,
    required: true
  },
  isNew: {
    type: Boolean,
    default: () => false
  },
  editable: {
    type: Boolean,
    default: () => false
  }
});
const emits = defineEmits(['update:modelValue', 'saveNote', 'closeEdit']);
const { t } = useI18n();

function updateTitle(e: Event) {
  emits('update:modelValue', {
    ...props.modelValue,
    title: (e.target as HTMLElement).textContent || ''
  });
}

function updateContent(value: string) {
  emits('update:modelValue', {
    ...props.modelValue,
    content: value
  });
}

function handleEnter(event: KeyboardEvent) {
  if (event.shiftKey && ['Enter', 'NumpadEnter'].includes(event.code)) {
    const value = (event.target as HTMLInputElement).value;
    updateContent(value + '\n');
  } else {
    emits('saveNote');
  }
}

</script>

<script lang='ts'>
export default { name: 'NoteEdit' };
</script>

<style scoped lang='scss'>
.div-editable {
  &:focus-visible {
    outline: none;
    border-bottom: 1px solid var(--primary-400);
  }
}
</style>