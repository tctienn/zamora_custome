<template>
  <div class='bg-gray-100 flex justify-content-between pl-3'>
    <div class='flex gap-2 pl-1 py-2'>
      <div class='align-content-center font-bold'>{{ questionClone.orderNumber }}.</div>
      <p
        class='align-content-center font-bold'
        :contenteditable='isOwner && isCreate'
        @focusout='updateQuestion'>{{ questionClone.label }}</p>
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
  <div class='flex flex-column gap-3 pl-3 py-2'>
    <div
      v-for='a in questionClone.options'
      :key='a.id'>
      <div class='flex gap-2'>
        <RadioButton
          v-model='answer'
          :disabled='isOwner'
          :input-id='a.id'
          :name='a.questionId'
          :value='omit(a,"__typename","orderNumber", "text")'>
        </RadioButton>
        <p>{{ a.label }}</p>
      </div>
    </div>

    <Textarea
      v-if='answer?.otherOpinion'
      v-model='text'
      :value='answer.otherOpinion ? text : null'/>
  </div>

</template>

<script lang="ts" setup>
import { cloneDeep, omit } from 'lodash';
import { type PropType, ref, watch } from 'vue';

import type { Answer, Question } from '@/apps/document/model/doc/doc-submit-input';
import ButtonIcon from '@/common/components/custom/ButtonIcon.vue';

const props = defineProps({
  question: {
    type: Object as PropType<Question>,
    default: {} as Question
  },
  answerProp: {
    type: Object as PropType<Answer>,
    default: {} as Answer
  }
});

const emits = defineEmits(['delete-question', 'update-question', 'update-answer', 'old-answer']);
const tempNewAnswer = ref<Answer>({} as Answer);
const tempOldAnswer = ref<Answer>({} as Answer);
const isOwner = defineModel<boolean>('isOwner', { default: false });
const isCreate = defineModel<boolean>('isCreate', { default: false });

const questionClone = ref(cloneDeep(props.question));
const answer = ref<any>(omit(props.answerProp, 'text', '__typename'));
const text = ref(props.answerProp?.text ?? '');

function deleteQuestion() {
  emits('delete-question', questionClone.value);
}

function updateQuestion(event: Event) {
  const data = event.target as HTMLElement;
  emits('update-question', {
    ...questionClone.value,
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
</script>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({ name: 'AnswerQuestionTemplate' });
</script>

<style scoped>

</style>