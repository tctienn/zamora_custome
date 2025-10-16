<template>
  <div class='grid'>
    <div
      v-for='(item) of quickSurveys'
      :key='item.id'
      class='col-4'>
      <VotingCard
        :id='item.id'
        class='border-round-sm'
        :list-count='getVoteCounts(item.id)'/>
    </div>
  </div>
</template>

<script setup lang='ts'>

import { get } from 'lodash';
import { inject, onMounted, onUnmounted, reactive, ref, watch } from 'vue';

import { searchQuickSurveyByUserId } from '@/apps/media/graphql/survey';
import type { QuickSurvey } from '@/apps/media/model/survey';
import VotingCard from '@/apps/media/views/survey/components/VotingCard.vue';
import { useVoteQuickSSE } from '@/apps/media/views/survey/sse';
import { MEDIA_URL } from '@/common/api/configService';
import { DEFAULT_PAGE_SIZE } from '@/common/constants';

const searchTerm = inject('searchTerm', ref(''));
const quickSurveys = ref<QuickSurvey[]>([]);
const canLoadMore = ref(true);
const isLoadMore = ref(true);
const pageable = reactive({
  page: 0,
  size: DEFAULT_PAGE_SIZE,
});
const sse = useVoteQuickSSE();
const data = ref<any>([]);

onMounted(() => {
  sse.register(`${MEDIA_URL}/sse/survey`, {
    'update-quick-survey': (e) => {
      const receivedData: any = JSON.parse(e['data']) || {};
      const {
        surveyId,
        voteCounts
      } = receivedData;

      if (!surveyId) {
        return;
      }

      const existingSurvey: any = data.value.find((item: any) => item.surveyId === surveyId);
      if (existingSurvey) {
        existingSurvey.voteCounts = voteCounts;
      } else {
        data.value.push(receivedData);
      }
    },
  });
});

onUnmounted(() => {
  sse.disconnect();
});

const searchParams = reactive({
  keyword: '',
  year: null,
  pageable: pageable,
});

function getVoteCounts(surveyId: string) {
  const surveyData = data.value.find((item: any) => item.surveyId === surveyId);
  return surveyData ? surveyData.voteCounts : [];
}

const {
  onResult: searchQuickSurveyByUserIdResult,
  refetch: searchQuickSurveyByUserIdRefetch
} =
  searchQuickSurveyByUserId(searchParams);

searchQuickSurveyByUserIdResult((res) => {
  const { edges } = get(res, 'data.searchQuickSurveyByUserId', { edges: [], });
  if (isLoadMore.value) {
    quickSurveys.value = [
      ...quickSurveys.value,
      ...edges.map((edge: any) => ({ ...edge.node.quickSurvey })),
    ];
    data.value = [
      ...data.value,
      ...edges.map((edge: any) => ({ ...edge.node.voteResponse })),
    ];
  } else {
    quickSurveys.value = edges.map((edge: any) => ({ ...edge.node.quickSurvey }));
    data.value = edges.map((edge: any) => ({ ...edge.node.voteResponse }));
  }
  canLoadMore.value = edges.length >= DEFAULT_PAGE_SIZE;
  isLoadMore.value = false;
});

watch(searchTerm, (newValue) => {
  searchParams.keyword = newValue;
  pageable.page = 0;
  quickSurveys.value = [];
  searchQuickSurveyByUserIdRefetch(searchParams);
});
</script>

<style scoped>

</style>