<template>
  <div class='border-round card p-2'>
    <div class='font-bold text-primary text-xl'>
      {{ t('vehicle.dashboard.summaryCarBookingsByUnit') }}
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
import { get } from 'lodash';
import { onMounted, type PropType, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { getAllOrganizationGraphql } from '@/apps/admin/api/graphql/organization-graphql-api';

const props = defineProps({
  data: {
    type: Object as PropType<any>,
    default: () => ({})
  },
});

const { t } = useI18n();

onMounted(() => {
  chartData.value = setChartData();
  chartOptions.value = setChartOptions();
});

const chartData = ref();
const chartOptions = ref();

const setChartData = () => {
  const documentStyle = getComputedStyle(document.documentElement);

  const labels = Object.keys(props.data).map((id) => {
    const org = listOrganizations.value?.find((o: any) => o.id === id);
    return org ? org.name : id;
  });
  const values = Object.values(props.data);

  return {
    labels,
    datasets: [
      {
        label: 'Số lượng chuyến đi',
        backgroundColor: documentStyle.getPropertyValue('--cyan-500'),
        borderColor: documentStyle.getPropertyValue('--cyan-500'),
        data: values
      },
    ]
  };
};

const listOrganizations = ref();
const { onResult: getAllOrganizationResult } = getAllOrganizationGraphql();
getAllOrganizationResult((response) => {
  listOrganizations.value = get(response, 'data.allOrganizationPublic', []);
});

const setChartOptions = () => {
  const documentStyle = getComputedStyle(document.documentElement);
  const textColor = documentStyle.getPropertyValue('--text-color');
  const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
  const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

  return {
    indexAxis: 'y',
    maintainAspectRatio: false,
    aspectRatio: 0.8,
    plugins: { legend: { labels: { color: textColor } } },
    scales: {
      x: {
        ticks: {
          color: textColorSecondary,
          font: { weight: 500 },
          callback: (val: string | number): string | string[] => {
            const label = String(val);
            return label.length > 15
              ? label.match(/.{1,15}/g) ?? label
              : label;
          },
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