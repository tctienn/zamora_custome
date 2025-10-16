<template>
  <Dialog
    v-model:visible='visibleForm'
    v-bind='DEFAULT_DIALOG_CONFIG'
    :header='quickSurvey?.questionContent'
    style='width: 35rem'
    @hide="emits('hide-dialog')">
    <div class='flex flex-column gap-2 mb-6'>
      <div class='align-items-center flex justify-content-between mb-2'>
        <div class='align-items-center flex gap-2'>
          <AppIcon
            name='schedule'
            size='1.5'
            text/>
          {{ quickSurvey?.createdDate && moment(quickSurvey?.createdDate).format('DD/MM/YYYY') }}
        </div>
        <div class='text-blue-500'>
          {{ countTotalVotes() }} người đã tham gia bình chọn
        </div>
      </div>
      <div
        v-for='item in options'
        :key='item.id'
        class='mb-1 overflow-hidden relative rounded-md surface-ground w-full'>
        <div
          class='absolute h-full left-0 top-0'
          :style='{ width: `${(getOptionCount(item.id) / quickSurvey.participants?.length) * 100}%`, backgroundColor: "#B3DF97" }'></div>
        <div class='align-items-center flex gap-2 p-2 relative'>
          <RadioButton
            v-model='chooseOption'
            :input-id='item.id'
            :value='item.id'/>
          <label
            class='font-medium w-full'
            :for='item.id'>
            {{ item.content }}
          </label>
        </div>
      </div>
    </div>

    <div
      class='border-primary-100 border-top-1 bottom-0 fixed flex gap-2 justify-content-center p-3 py-2 surface-overlay'
      style='width: 92%'>
      <Button
        icon='pi pi-save'
        label='Bình chọn'
        @click='submitForm'/>
    </div>
  </Dialog>
</template>

<script setup lang='ts'>

import { computed, type PropType, ref } from 'vue';

import { getOptionsQuickSurvey, getQuickSurveyById, getSurveyVoteByMe, voteSurvey } from '@/apps/media/graphql/survey';
import type { QuickSurvey } from '@/apps/media/model/survey';
import AppIcon from '@/common/components/app/AppIcon.vue';
import { DEFAULT_DIALOG_CONFIG } from '@/common/constants';
import useMoment from '@/common/helpers/mixins/use-moment';

const props = defineProps({
  visibleDialog: {
    type: Boolean,
    default: false,
  },
  id: {
    type: String,
    default: null,
  },
  listCount: {
    type: Array as PropType<any>,
    default: () => []
  }
});

const emits = defineEmits(['hide-dialog']);

const computedListCount = computed(() => {
  return props.listCount || [];
});

const chooseOption = ref();
const { moment } = useMoment();
const visibleForm = ref(props.visibleDialog);
const options = ref();
const quickSurvey = ref<QuickSurvey>({} as QuickSurvey);

if (props.id) {
  getQuickSurveyById(props.id).onResult((res) => {
    quickSurvey.value = res.data.getQuickSurveyById;
  });
  getOptionsQuickSurvey(props.id).onResult((res) => {
    options.value = res.data.getOptionsQuickSurvey;
  });
  getSurveyVoteByMe(props.id).onResult((res) => {
    chooseOption.value = res.data.getSurveyVoteByMe[0]?.optionId;
  });
}

const {
  mutate,
  onDone
} = voteSurvey();

const submitForm = () => {
  mutate({
    surveyId: props.id,
    optionId: chooseOption.value
  });
};

onDone(() => {
  emits('hide-dialog');
});

const getOptionCount = (id: string) => {
  return computedListCount.value.find((item: any) => item.optionId === id)?.listUser.length || 0;
};

function countTotalVotes() {
  let totalVotes = 0;
  for (const result of computedListCount.value) {
    if (result.listUser && Array.isArray(result.listUser)) {
      totalVotes += result.listUser.length;
    }
  }
  return totalVotes;
}
</script>

<style scoped>

</style>