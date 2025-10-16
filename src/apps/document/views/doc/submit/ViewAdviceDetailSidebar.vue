<template>
  <Sidebar
    v-bind='DEFAULT_DIALOG_CONFIG'
    v-model:visible='visible'
    header=' '
    position='right'
    style='width: 50%; height: 100%'
    @hide="emits('hide-dialog')">
    <div class='content'>
      <div class='flex justify-content-between'>
        <h3>Báo cáo tổng hợp ý kiến</h3>
        <ButtonGroup>
          <ButtonIcon
            v-tooltip.top='"Danh sách"'
            icon='menu'
            :outlined='!showChart'
            @click='showChartFn(true)'/>
          <ButtonIcon
            v-tooltip.top='"Biểu đồ"'
            icon='donut_large'
            :outlined='showChart'
            @click='showChartFn(false)'/>
        </ButtonGroup>
      </div>

      <div
        class='overflow-auto'
        style='height: calc(100vh - 10rem)'>
        <div
          v-if='showChart'
          class='body'>
          <div
            v-for='question in questions'
            :key='question.id'>
            <p
              class='font-semibold'
              style='color: #0F6CBD'>{{ question?.orderNumber }}. {{ question.label }}</p>
            <ul>
              <li
                v-for='answer in question.answers'
                :key='answer.id'>
                {{ getUserPosition(answer.userId) }} <b>{{ answer.userName }}</b>: {{ answer.label }}
              </li>
            </ul>

            <p class='font-bold'>% Tỷ lệ</p>
            <ul>
              <li
                v-for='result in question.options'
                :key='result.label'>{{ result.label }}: <b>{{
                  question?.totalResult?.find((tt: any) => tt.label == result.label)?.count ?? 0
                }}/{{ question?.totalAnswer }}</b> người,
                chiếm tỷ lệ
                <b>{{
                  Math.round((question?.totalResult?.find((tt: any) => tt.label == result.label)?.count ?? 0) / (question?.totalAnswer == 0 ? 1 : question?.totalAnswer) * 100)
                }}%</b>
              </li>

            </ul>
          </div>
        </div>

        <div
          v-if='!showChart'
          class='body'>
          <div class='flex flex-column'>
            <div
              v-for='c in chartsComputed'
              :key='c.question.id'>
              <div class='flex'>
                <div class='col-8'>
                  <p
                    class='font-semibold'
                    style='color: #0F6CBD'>{{ c.question?.orderNumber }}. {{ c.question.label }}</p>
                  <Chart
                    class='md:w-20rem w-full'
                    :data='c.data'
                    :options='c.options'
                    type='doughnut'
                    @click='getDataChart(c.question)'/>
                </div>

                <div class='col'>
                  <div
                    v-if='currentIdQuestion == c.question.id && otherOpinion?.length > 0'
                    class='pt-7'>
                    <h4>Danh sách ý kiến khác</h4>
                    <ul class='flex flex-column gap-2'>
                      <li
                        v-for='a in otherOpinion'
                        :key='a.id'
                        class='bg-black-alpha-10 p-2'> {{ getUserPosition(a?.userId) }} <b>{{ a?.userName }}</b>
                        <div>
                          {{ a.text }}
                        </div>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Sidebar>
</template>

<script lang="ts" setup>
import { storeToRefs } from 'pinia';
import { computed, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import type { UserMoreInfo } from '@/apps/admin/model/User';
import { useUserMoreInfoStore } from '@/apps/admin/store/usersMoreInfo';
import { getAnswersQuestionByDocId } from '@/apps/document/api/graphql/question';
import type { Question } from '@/apps/document/model/doc/doc-submit-input';
import { useDocumentRolesStore } from '@/apps/document/store/document-role';
import { DEFAULT_DIALOG_CONFIG } from '@/common/constants';

const props = defineProps({
  visibleDialog: {
    type: Boolean,
    default: false
  },
  docId: {
    type: String,
    required: true,
  }
});
const emits = defineEmits(['hide-dialog']);
const { t } = useI18n();
const { userDeptRole } = useDocumentRolesStore();
const otherOpinion = ref();
const questions = ref<any[]>([]);
const currentIdQuestion = ref();
const store = useUserMoreInfoStore();
const { usersMoreInfo } = storeToRefs(store);

const chartsComputed = computed(() => questions.value.map(q => ({
  question: q,
  data: setChartData(q),
  options: setChartOptions(),
})));
const visible = ref(props.visibleDialog);

const showChart = ref(true);
const chartOptions = ref();
onMounted(() => {
  chartOptions.value = setChartOptions();
});

getAnswersQuestionByDocId(props.docId, userDeptRole).onResult((res) => {
  questions.value = res.data.getAnswersQuestionByDocId;
  questions.value = questions.value.map((q: Question) => ({
    ...q,
    totalAnswer: q.answers?.length ?? 0,
    totalResult: mergeValueFn(q.answers)
  }));
});

const getRandomColor = () => {
  return `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`;
};

function setChartData(question: any) {
  const backgroundColors = question.totalResult.map(() => getRandomColor());
  const hoverColors = backgroundColors.map((color: any) => lightenColor(color, 20));
  return {
    labels: question.totalResult?.map((a: any) => a.label),
    datasets: [
      {
        data: question.totalResult?.map((a: any) => a.count),
        backgroundColor: backgroundColors,
        hoverBackgroundColor: hoverColors
      }
    ]
  };
}

const setChartOptions = () => {
  const documentStyle = getComputedStyle(document.documentElement);
  const textColor = documentStyle.getPropertyValue('--text-color');

  return {
    plugins: {
      legend: {
        labels: {
          cutout: '60%',
          color: textColor,
          pointStyle: 'circle',
          usePointStyle: true,
        },
        position: 'right',
        align: 'center',
      }
    }
  };
};

function showChartFn(show: boolean) {
  showChart.value = show;
}

function mergeValueFn(items?: any[]) {
  if (items) {
    return Object.values(
      items.reduce((acc, item) => {
        if (!acc[item.label]) {
          acc[item.label] = {
            label: item.label,
            count: 1
          }; // Nếu chưa có label, khởi tạo với count = 1
        } else {
          acc[item.label].count += 1; // Nếu đã có, cộng dồn count
        }
        return acc;
      }, {} as Record<string, MergedItem>) // Dùng Record để map label -> MergedItem
    );
  }
  return [{
    label: '',
    count: 0
  }];
}

type MergedItem = {
  label: string;
  count: number;
};

const lightenColor = (color: any, percent: any) => {
  const num = parseInt(color.slice(1), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) + amt;
  const G = (num >> 8 & 0x00ff) + amt;
  const B = (num & 0x0000ff) + amt;

  return `#${(
    0x1000000
      + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000
      + (G < 255 ? G < 1 ? 0 : G : 255) * 0x100
      + (B < 255 ? B < 1 ? 0 : B : 255)
  )
    .toString(16)
    .slice(1)}`;
};

function getDataChart(data: any) {
  currentIdQuestion.value = data.id;
  otherOpinion.value = data.answers.filter((a: any) => a.label == 'Ý kiến khác');
}

function getUserPosition(id: string) {
  return usersMoreInfo.value[id]?.positionName ?? '';
}
</script>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({ name: 'ViewAdviceDetailSidebar' });
</script>

<style scoped>

</style>