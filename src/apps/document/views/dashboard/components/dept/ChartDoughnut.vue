<template>
  <Chart
    :data='chartData'
    :options='chartOptions'
    style='width: 60%'
    type='doughnut'/>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

const props = defineProps({
  processed: {
    type: Number,
    default: 0,
  },
  processing: {
    type: Number,
    default: 0,
  },
});
const { t } = useI18n();
const chartData = ref();
const chartOptions = ref();
onMounted(() => {
  chartData.value = setChartData();
  chartOptions.value = setChartOptions();
});

watch([() => props.processed, () => props.processing], () => {
  chartData.value = setChartData();
});

const setChartData = () => {
  const documentStyle = getComputedStyle(document.body);

  return {
    labels: [
      t('document.dashboard.processing'),
      t('document.dashboard.processed'),
    ],
    datasets: [
      {
        data: [props.processing, props.processed],
        backgroundColor: [
          documentStyle.getPropertyValue('--orange-400'),
          documentStyle.getPropertyValue('--blue-400'),
        ],
        hoverBackgroundColor: [
          documentStyle.getPropertyValue('--orange-300'),
          documentStyle.getPropertyValue('--blue-300'),
        ],
      },
    ],
  };
};

const setChartOptions = () => {
  const documentStyle = getComputedStyle(document.documentElement);
  const textColor = documentStyle.getPropertyValue('--text-color');

  return {
    plugins: {
      responsive: true,
      legend: {
        position: '',
        labels: {
          cutout: '60%',
          color: textColor,
        },
      },
    },
  };
};
</script>

<style scoped></style>
