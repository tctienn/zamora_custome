<template>
  <Chart
    :data='chartData'
    :options='chartOptions'
    style='width: 40%'
    type='doughnut'/>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { useDocumentRolesStore } from '@/apps/document/store/document-role';

const props = defineProps({
  docInTotal: {
    type: Number,
    default: 0,
  },
  docOutTotal: {
    type: Number,
    default: 0,
  },
});
const { t } = useI18n();
const chartData = ref();
const chartOptions = ref();

onMounted(() => {
  chartOptions.value = setChartOptions();
  chartData.value = setChartData();
});

watch([() => props.docInTotal, () => props.docOutTotal], () => {
  chartData.value = setChartData();
});

const { userDeptRole } = storeToRefs(useDocumentRolesStore());

const setChartData = () => {
  if (userDeptRole.value.roleId != 'VAN_THU') {
    return {
      labels: [
        t('document.menu.documentDocIn'),
        t('document.menu.docForSignature'),
        t('document.menu.documentSubmit'),
      ],
      datasets: [
        {
          data: [props.docInTotal, props.docOutTotal, 0],
          backgroundColor: [
            '#FF8B4E',
            '#0d96fa',
            '#FF8B4E',
          ],
          hoverBackgroundColor: [
            '#e67e42', // Darker shade of FF8B4E for hover
            '#0c85e0', // Darker shade of 0d96fa for hover
            '#e67e42', // Darker shade of FF8B4E for hover
          ],
        },
      ],
    };
  } else {
    return {
      labels: [
        t('document.menu.documentDocIn'),
        t('document.menu.docForSignature'),
      ],
      datasets: [
        {
          data: [props.docInTotal, props.docOutTotal, 0],
          backgroundColor: [
            '#FF8B4E',
            '#0d96fa',
          ],
          hoverBackgroundColor: [
            '#e67e42', // Darker shade of FF8B4E for hover
            '#0c85e0', // Darker shade of 0d96fa for hover
          ],
        },
      ],
    };
  }
};

const setChartOptions = () => {
  const documentStyle = getComputedStyle(document.documentElement);
  const textColor = documentStyle.getPropertyValue('--text-color');

  return {
    plugins: {
      responsive: true,
      legend: {
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
