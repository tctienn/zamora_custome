<template>
  <div class='get-advice'>
    <div class='flex justify-content-between pl-3'>
      <h5 class='align-content-center font-semibold'>Nội dung ý kiến</h5>
      <div class='flex gap-2 pb-2'>
        <SplitButton
          v-if='isOwner && isCreate'
          label='Tạo nội dung'
          :model='OptionsAdvice'
          @click='chooseQuestionTemplate'/>
      </div>
    </div>

    <input
      v-model='questionToDelete'
      hidden
      name='questionToDelete'/>
    <input
      v-model='optionToDelete'
      hidden
      name='optionToDelete'/>
    <div
      v-for='(question, i) in questionModel'
      :key='question.id'
      class='flex flex-column'>
      <AnswerQuestionTemplate
        v-if='question.isYesNoQuestion'
        v-model:is-create='isCreate'
        v-model:is-owner='isOwner'
        :answer-prop='question.answer'
        :question='question'
        @delete-question='deleteQuestion'
        @old-answer='getOldAnswer'
        @update-answer='getAnswer'
        @update-question='updateQuestion'/>

      <AnswerQuestionDynamic
        v-if='!question.isYesNoQuestion'
        v-model:is-create='isCreate'
        v-model:is-owner='isOwner'
        v-model:question='questionModel[i]'
        :answer-prop='question.answer'
        @delete-option='deleteOption'
        @delete-question='deleteQuestion'
        @old-answer='getOldAnswer'
        @update-answer='getAnswer'
        @update-question='updateQuestion'/>
    </div>
  </div>
</template>

<script lang="ts" setup>

import { cloneDeep } from 'lodash';
import { v4 as uuidv4 } from 'uuid';
import { onMounted, onUnmounted, ref } from 'vue';

import { type Answer, type Question } from '@/apps/document/model/doc/doc-submit-input';
import AnswerQuestionDynamic from '@/apps/document/views/doc/submit/component/in-form/AnswerQuestionDynamic.vue';
import AnswerQuestionTemplate from '@/apps/document/views/doc/submit/component/in-form/AnswerQuestionTemplate.vue';
import EventBus from '@/common/helpers/event-bus';

const OptionsAdvice = [
  {
    label: 'Nội dung với câu trả lời sẵn',
    command: () => {
      const idQuestion = uuidv4();
      const questionClone = cloneDeep(questionModel.value) || [];
      questionClone.push({
        id: idQuestion,
        label: `Nội dung ${questionClone.length + 1}`,
        docId: '',
        orderNumber: questionClone.length + 1,
        options: [
          {
            id: uuidv4(),
            label: 'Đồng ý',
            questionId: idQuestion,
            orderNumber: 1,
            otherOpinion: false,
            text: null
          },
          {
            id: uuidv4(),
            label: 'Không đồng ý',
            questionId: idQuestion,
            orderNumber: 2,
            otherOpinion: false,
            text: null
          },
          {
            id: uuidv4(),
            label: 'Ý kiến khác',
            questionId: idQuestion,
            orderNumber: 3,
            otherOpinion: true,
            text: null
          },
        ],
        isYesNoQuestion: true
      });

      questionModel.value = questionClone;
    }
  },
  {
    label: 'Nội dung và tạo câu trả lời',
    command: () => {
      const idQuestion = uuidv4();
      const questionClone = cloneDeep(questionModel.value) || [];
      questionClone.push({
        id: uuidv4(),
        label: `Nội dung ${questionClone.length + 1}`,
        docId: '',
        orderNumber: questionClone.length + 1,
        options: [],
        isYesNoQuestion: false
      });

      questionModel.value = questionClone;
    }
  }
];

const isCreate = defineModel<boolean>('isCreate', { default: false });
const isOwner = defineModel<boolean>('isOwner', { default: false });
const optionAdvice = ref(OptionsAdvice[0]);
const questionToDelete = ref<string[]>([]);
const optionToDelete = ref<string[]>([]);
const questionModel = defineModel<Question[]>('questionModel', { default: [] as Question[] });
const answersModel = defineModel<Answer[]>('answersModel', { default: [] as Answer[] });

function chooseQuestionTemplate() {
  const idQuestion = uuidv4();
  const questionClone = cloneDeep(questionModel.value) || [];
  questionClone.push({
    id: idQuestion,
    label: `Nội dung ${questionClone.length + 1}`,
    docId: '',
    orderNumber: questionClone.length + 1,
    options: [
      {
        id: uuidv4(),
        label: 'Đồng ý',
        questionId: idQuestion,
        orderNumber: 1,
        otherOpinion: false,
        text: null
      },
      {
        id: uuidv4(),
        label: 'Không đồng ý',
        questionId: idQuestion,
        orderNumber: 2,
        otherOpinion: false,
        text: null
      },
      {
        id: uuidv4(),
        label: 'Ý kiến khác',
        questionId: idQuestion,
        orderNumber: 3,
        otherOpinion: true,
        text: null
      },
    ],
    isYesNoQuestion: true
  });

  questionModel.value = questionClone;
}

EventBus.emit('validate-question-process', !isOwner.value);

function deleteQuestion(data: Question) {
  questionToDelete.value = [...questionToDelete.value || [], data.id];
  questionModel.value = questionModel.value.filter((q: Question) => data.id != q.id);
}

function updateQuestion(data: Question) {
  const questionClone = cloneDeep(questionModel.value);
  const index = questionClone.findIndex((q: Question) => q.id == data.id);
  questionClone[index] = data;
  questionModel.value = questionClone;
}

function deleteOption(idOption: string) {
  optionToDelete.value = [...optionToDelete.value || [], idOption];
}

function getAnswer(data: Answer) {
  let answerTemp = cloneDeep(answersModel.value);
  answerTemp = answerTemp.filter((a) => a.id !== data.id);
  answerTemp.push(data);
  answersModel.value = answerTemp;

  if (questionModel.value.length != answersModel.value.length) {
    EventBus.emit('validate-question-process', true);
  } else {
    EventBus.emit('validate-question-process', false);
  }
}

function getOldAnswer(data: Answer | null) {
  let answerTemp = cloneDeep(answersModel.value);
  answerTemp = answerTemp.filter((e) => e.id != data?.id);
  answersModel.value = answerTemp;

  if (questionModel.value.length != answersModel.value.length) {
    EventBus.emit('validate-question-process', true);
  } else {
    EventBus.emit('validate-question-process', false);
  }
}

onMounted(() => {
  EventBus.on('get-question', (callback: any) => {
    callback(answersModel.value);
  });
});

onUnmounted(() => {
  EventBus.off('get-question', (callback: any) => {
    callback(answersModel.value);
  });
});

</script>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({ name: 'FormQuestion' });

</script>

<style scoped>

</style>