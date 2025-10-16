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

interface CountDocByType {
  docTypeId: string;
  docTypeName: string;
  count: number;
}

const props = defineProps({
  docInData: {
    type: Array as () => CountDocByType[],
    default: () => [],
  },
  docOutData: {
    type: Array as () => CountDocByType[],
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
    map.set(item.docTypeName, item.count);
  });
  return map;
});

const docOutMap = computed(() => {
  const map = new Map<string, number>();
  props.docOutData?.forEach(item => {
    map.set(item.docTypeName, item.count);
  });
  return map;
});

// Tạo danh sách các loại văn bản duy nhất
const allTypes = computed(() => {
  const types = new Set<string>();
  props.docInData?.forEach(item => types.add(item.docTypeName));
  props.docOutData?.forEach(item => types.add(item.docTypeName));
  return Array.from(types);
});

const chartData = computed(() => {
  const documentStyle = getComputedStyle(document.documentElement);
  
  return {
    labels: allTypes.value,
    datasets: [
      {
        label: 'Văn bản đến',
        data: allTypes.value.map(type => docInMap.value.get(type) || 0),
        backgroundColor: documentStyle.getPropertyValue('--blue-400'),
        borderColor: documentStyle.getPropertyValue('--blue-400'),
        borderWidth: 1,
      },
      {
        label: 'Văn bản đi',
        data: allTypes.value.map(type => docOutMap.value.get(type) || 0),
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
        return Math.max(maxCount, 10);
      })(),
      ticks: { 
        stepSize: (() => {
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
  maxCount = Math.max(maxCount, 10);
  
  const newStepSize = calculateStepSize(maxCount);
  
  if (chartOptions.value.scales.y.ticks.stepSize !== newStepSize 
      || chartOptions.value.scales.y.max !== maxCount) {
    chartOptions.value.scales.y.ticks.stepSize = newStepSize;
    chartOptions.value.scales.y.max = maxCount;
  }
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