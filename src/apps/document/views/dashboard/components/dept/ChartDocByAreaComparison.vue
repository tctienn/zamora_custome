<template>
  <div class='chart-container'>
    <Chart
      class='w-full'
      :data='chartData'
      :options='chartOptions'
      type='bar' />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';

import { calculateStepSize } from './chartUtils';

interface CountDocByArea {
  areaId: string;
  areaName: string;
  count: number;
}

const props = defineProps({
  docInData: {
    type: Array as () => CountDocByArea[],
    default: () => [],
  },
  docOutData: {
    type: Array as () => CountDocByArea[],
    default: () => [],
  },
  title: {
    type: String,
    default: '',
  },
});

// Tạo map để dễ tra cứu
const docInMap = computed(() => {
  const map = new Map<string, number>();
  props.docInData?.forEach(item => {
    map.set(item.areaName, item.count);
  });
  return map;
});

const docOutMap = computed(() => {
  const map = new Map<string, number>();
  props.docOutData?.forEach(item => {
    map.set(item.areaName, item.count);
  });
  return map;
});

// Tạo danh sách các lĩnh vực duy nhất
const allAreas = computed(() => {
  const areas = new Set<string>();
  props.docInData?.forEach(item => areas.add(item.areaName));
  props.docOutData?.forEach(item => areas.add(item.areaName));
  return Array.from(areas);
});

// Cập nhật stepSize và max value khi dữ liệu thay đổi
watch([() => props.docInData, () => props.docOutData], () => {
  // Tính toán max value dựa trên dữ liệu
  let maxCount = 0;
  props.docInData?.forEach(item => {
    if (item.count > maxCount) {
      maxCount = item.count;
    }
  });
  props.docOutData?.forEach(item => {
    if (item.count > maxCount) {
      maxCount = item.count;
    }
  });
  // Đảm bảo luôn có giá trị max tối thiểu là 10
  maxCount = Math.max(maxCount, 10);
  
  const newStepSize = calculateStepSize(maxCount);
  
  if (chartOptions.value.scales.y.ticks.stepSize !== newStepSize 
      || chartOptions.value.scales.y.max !== maxCount) {
    chartOptions.value.scales.y.ticks.stepSize = newStepSize;
    chartOptions.value.scales.y.max = maxCount;
  }
});

const chartData = computed(() => {
  const documentStyle = getComputedStyle(document.documentElement);
  
  return {
    labels: allAreas.value,
    datasets: [
      {
        label: 'Văn bản đến',
        data: allAreas.value.map(area => docInMap.value.get(area) || 0),
        backgroundColor: documentStyle.getPropertyValue('--blue-400'),
        borderColor: documentStyle.getPropertyValue('--blue-400'),
        borderWidth: 1,
      },
      {
        label: 'Văn bản đi',
        data: allAreas.value.map(area => docOutMap.value.get(area) || 0),
        backgroundColor: documentStyle.getPropertyValue('--pink-200'),
        borderColor: documentStyle.getPropertyValue('--pink-200'),
        borderWidth: 1,
      },
    ],
  };
});

const chartOptions = ref({
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { position: 'top', }, },
  scales: {
    y: {
      beginAtZero: true,
      min: 0,
      max: (() => {
        // Tính toán max value dựa trên dữ liệu
        let maxCount = 0;
        props.docInData?.forEach(item => {
          if (item.count > maxCount) {
            maxCount = item.count;
          }
        });
        props.docOutData?.forEach(item => {
          if (item.count > maxCount) {
            maxCount = item.count;
          }
        });
        // Đảm bảo luôn có giá trị max tối thiểu là 10
        return Math.max(maxCount, 10);
      })(),
      ticks: { 
        stepSize: (() => {
          // Tính toán max value dựa trên dữ liệu
          let maxCount = 0;
          props.docInData?.forEach(item => {
            if (item.count > maxCount) {
              maxCount = item.count;
            }
          });
          props.docOutData?.forEach(item => {
            if (item.count > maxCount) {
              maxCount = item.count;
            }
          });
          // Đảm bảo luôn có giá trị max tối thiểu là 10
          maxCount = Math.max(maxCount, 10);
          return calculateStepSize(maxCount);
        })()
      },
    },
    x: {
      ticks: {
        autoSkip: false,
        maxRotation: 0,
        minRotation: 0,
      },
    },
  },
});
</script>

<style scoped>
.chart-container {
  position: relative;
  height: 25rem;
  width: 100%;
  overflow: hidden;
}

:deep(.p-chart) {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
}

/* Đảm bảo canvas không vượt ra khỏi container */
:deep(canvas) {
  max-width: 100%;
  max-height: 100%;
}

/* Responsive height adjustments */
@media screen and (max-width: 768px) {
  .chart-container {
    height: 20rem;
  }
}

@media screen and (min-width: 769px) and (max-width: 1024px) {
  .chart-container {
    height: 22rem;
  }
}

@media screen and (min-width: 1025px) {
  .chart-container {
    height: 25rem;
  }
}
</style>