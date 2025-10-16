<template>
  <div class='border-round card p-2'>
    <div class='font-bold text-primary text-xl'>
      {{ t('vehicle.dashboard.summaryDriverPerformance') }}
    </div>
    <div
      class='border-bottom-1 surface-border'
      style='margin: 0.5rem -0.5rem'></div>
    <Chart
      class='h-30rem'
      :data='chartData'
      :options='chartOptions'
      type='bar'/>
  </div>
</template>

<script setup lang='ts'>
import { storeToRefs } from 'pinia';
import { onMounted, type PropType, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { useUserMoreInfoStore } from '@/apps/admin/store/usersMoreInfo';

const props = defineProps({
  data: {
    type: Array as PropType<any[]>,
    default: () => []
  },
});
const { t } = useI18n();

onMounted(() => {
  chartData.value = setChartData();
  chartOptions.value = setChartOptions();
});

const chartData = ref();
const chartOptions = ref();
const store = useUserMoreInfoStore();
const { usersMoreInfo } = storeToRefs(store);

const setChartData = () => {
  const documentStyle = getComputedStyle(document.documentElement);

  return {
    labels: props.data.map((item: any) => usersMoreInfo.value[item.driver]?.fullName),
    datasets: [
      {
        label: 'Số lượng chuyến',
        backgroundColor: documentStyle.getPropertyValue('--cyan-500'),
        borderColor: documentStyle.getPropertyValue('--cyan-500'),
        data: props.data.map((item: any) => item.bookingCount)
      },
      {
        label: 'Số km',
        backgroundColor: documentStyle.getPropertyValue('--gray-500'),
        borderColor: documentStyle.getPropertyValue('--gray-500'),
        data: props.data.map((item: any) => item.totalKm)
      }
    ]
  };
};
const setChartOptions = () => {
  const documentStyle = getComputedStyle(document.documentElement);
  const textColor = documentStyle.getPropertyValue('--text-color');
  const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
  const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

  return {
    maintainAspectRatio: false,
    aspectRatio: 0.8,
    plugins: { legend: { labels: { color: textColor } } },
    scales: {
      x: {
        ticks: {
          color: textColorSecondary,
          font: { weight: 500 }
        },
        grid: {
          display: false,
          drawBorder: false
        }
      },
      y: {
        ticks: { color: textColorSecondary },
        grid: {
          color: surfaceBorder,
          drawBorder: false
        }
      }
    }
  };
};

watch(
  [() => props.data],
  () => {
    chartData.value = setChartData();
  },
  {
    deep: true,
    immediate: true
  }
);
</script>

<style scoped>

</style>