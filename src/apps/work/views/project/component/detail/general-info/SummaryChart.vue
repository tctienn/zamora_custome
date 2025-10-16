<template>
  <div class='h-full py-3'>
    <div
      id='participantBarChart'
      class='h-full relative'>
      <Chart
        class='h-full ml-3'
        :data='chartDataBar'
        :options='chartOptionsBar'
        :plugins='[plugin]'
        type='bar'/>
    </div>
  </div>
</template>

<script lang='ts' setup>

import type { ChartOptions } from 'chart.js';
import { storeToRefs } from 'pinia';
import { computed, onMounted, type PropType, ref, shallowRef, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { useUserMoreInfoStore } from '@/apps/admin/store/usersMoreInfo';
import type { ParticipantStatistic } from '@/apps/work/views/project/component/detail/general-info/type';
import { useAvatarBarChart } from '@/common/helpers/chart-plugins/avatar-bar-chart';
import { extractAvatarBackgroundColor } from '@/common/helpers/utils';

const props = defineProps({
  participant: {
    type: Array as PropType<ParticipantStatistic[]>,
    default: () => []
  }
});

const { t } = useI18n();
const { plugin } = useAvatarBarChart();
const { usersMoreInfo } = storeToRefs(useUserMoreInfoStore());

const chartDataBar = shallowRef();

const updateChartDataBar = () => {
  const sortedData = [...props.participant]
    .sort((a, b) => b.taskCount - a.taskCount)
    .map(e => {
      const fullName = usersMoreInfo.value[e.participantId]?.fullName || '';
      return {
        label: fullName,
        participantId: e.participantId,
        taskCount: e.taskCount,
        backgroundColor: extractAvatarBackgroundColor(fullName)
      };
    });

  chartDataBar.value = {
    labels: sortedData.map(e => e.label),
    participantId: sortedData.map(e => e.participantId),
    datasets: [
      {
        data: sortedData.map(e => e.taskCount),
        backgroundColor: sortedData.map(e => e.backgroundColor),
      }
    ]
  };
};

// Watch once, and update when needed
watch(() => props.participant, updateChartDataBar, {
  deep: true,
  immediate: true
});

const chartOptionsBar = ref();

const setChartOptionsBar = (): ChartOptions => {
  const documentStyle = getComputedStyle(document.documentElement);
  const textColor = documentStyle.getPropertyValue('--text-color');
  const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
  const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

  return {
    plugins: {
      avatarBarChart: {
        idFieldName: 'participantId',
        containerId: 'participantBarChart'
      },
      legend: {
        labels: { color: textColor },
        display: false
      },
      tooltip: { enabled: false, },
      title: { display: false }
    },
    scales: {
      x: {
        ticks: { color: textColorSecondary },
        grid: { color: surfaceBorder }
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          font: {
            family: 'Inter, sans-serif',
            weight: 'bold'
          },
          text: 'Công việc'
        },
        ticks: {
          color: textColorSecondary,
          stepSize: 1,
        },
        grid: { color: surfaceBorder }
      }
    }
  };
};

onMounted(() => {
  chartOptionsBar.value = setChartOptionsBar();
});
</script>

<style scoped>

</style>