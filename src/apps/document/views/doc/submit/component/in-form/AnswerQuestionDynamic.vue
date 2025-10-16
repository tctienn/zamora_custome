<template>
  <div class='bg-gray-100 flex justify-content-between mt-2 pl-3'>
    <div class='flex gap-2 pl-1 py-2'>
      <div class='align-content-center font-bold'>{{ question.orderNumber }}.</div>
      <p
        class='align-content-center font-bold'
        :contenteditable='isOwner && isCreate'
        @focusout='updateQuestion'>{{ question.label }}</p>
    </div>
    <div class='flex'>
      <ButtonIcon
        v-if='isOwner && isCreate'
        class='border-none btn-create'
        icon='delete'
        outlined
        @click='deleteQuestion'/>
    </div>
  </div>
  <div class='flex flex-column gap-3 pl-3 pt-2'>
    <div
      v-for='(a) in question.options'
      :key='a.id'>
      <div class='flex justify-content-between'>
        <div class='flex gap-2 pb-2'>
          <RadioButton
            v-model='answer'
            :disabled='isOwner'
            :input-id='a.id'
            :name='a.questionId'
            :value='omit(a,"__typename","orderNumber", "text")'>
          </RadioButton>
          <p
            :id='a.id'
            :contenteditable='isOwner && isCreate'
            @focusout='updateAnswer'>{{ a.label }}</p>
        </div>

        <div class='flex'>
          <ButtonIcon
            v-if='!a.otherOpinion && isOwner && isCreate'
            v-tooltip='"Thiếp lập là ý kiến khác"'
            class='border-none btn-create py-0'
            icon='dynamic_feed'
            outlined
            style='color: #f0c88c'
            @click='setAdviceOther(a.id)'/>

          <AppIcon
            v-if='a.otherOpinion && isOwner && isCreate'
            v-tooltip='"Đã thiết lập là ý kiến khác"'
            class='mr-3'
            name='check'
            size='1.5'/>

          <ButtonIcon
            v-if='isOwner && isCreate'
            v-tooltip='"Xóa lựa chọn"'
            class='border-none btn-create py-0'
            icon='delete'
            outlined
            style='color: #f0c88c'
            @click='removeOption(index)'/>
        </div>
      </div>
    </div>

    <Textarea
      v-if='answer.otherOpinion'
      v-model='text'
      :value='answer.otherOpinion ? text : null'/>

    <div v-if='isOwner && isCreate'>
      <Button
        class='p-0 p-button-text pb-2'
        icon='pi pi-plus'
        label='Thêm câu trả lời'
        @click='addOption'/>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { omit } from 'lodash';
import { v4 as uuidv4 } from 'uuid';
import { type PropType, ref, watch } from 'vue';

import type { Answer, Option, Question } from '@/apps/document/model/doc/doc-submit-input';
import ButtonIcon from '@/common/components/custom/ButtonIcon.vue';

const props = defineProps({
  index: {
    type: Number,
    default: 0
  },
  answerProp: {
    type: Object as PropType<Answer>,
    default: {} as Answer
  }
});
const emits = defineEmits(['delete-question', 'update-question', 'delete-option', 'update-answer', 'old-answer']);
const question = defineModel('question', {
  type: Object as PropType<Question>,
  default: {} as Question
});
const isOwner = defineModel<boolean>('isOwner', { default: false });
const isCreate = defineModel<boolean>('isCreate', { default: false });
const answer = ref<any>(omit(props.answerProp, 'text', '__typename'));
const tempNewAnswer = ref<Answer>({} as Answer);
const tempOldAnswer = ref<Answer>({} as Answer);
const text = ref(props.answerProp?.text ?? '');

function addOption() {
  const length = question.value.options.length;
  question.value.options = [...question.value.options.slice(0, length - 1),
    {
      id: uuidv4(),
      label: 'Tùy chọn',
      questionId: question.value.id ?? '',
      orderNumber: length,
      otherOpinion: false
    },
    ...question.value.options.slice(length - 1, length).map(o => ({
      ...o,
      orderNumber: o.orderNumber + 1
    }))
  ];
}

function removeOption(numberIndex: number) {
  emits('delete-option', question.value.options[numberIndex].id);
  question.value = {
    ...question.value,
    options: question.value.options.filter((q, index) => index != numberIndex)
  };
}

function deleteQuestion() {
  emits('delete-question', question.value);
}

function updateAnswer(event: Event) {
  const data = event.target as HTMLElement;

  const index = question.value.options.findIndex((o: Option) => o.id == data.id);
  question.value.options[index] = {
    ...question.value.options[index],
    label: data.innerText
  };
  emits('update-question', question.value);
}

function updateQuestion(event: Event) {
  const data = event.target as HTMLElement;
  emits('update-question', {
    ...question.value,
    label: data.innerText
  });
}

watch(answer, (newValue, oldValue) => {
  emits('update-answer', newValue);
  emits('old-answer', oldValue);
  tempNewAnswer.value = newValue;
  tempOldAnswer.value = oldValue;
});

watch(text, (value) => {
  emits('update-answer', {
    ...tempNewAnswer.value,
    text: value
  });
});

function setAdviceOther(id: string) {
  question.value = {
    ...question.value,
    options: question.value.options.map((option) => {
      return {
        ...option,
        otherOpinion: option.id === id
      };
    })
  };
}
</script>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({ name: 'AnswerQuestionDynamic' });
</script>

<style scoped>

</style>