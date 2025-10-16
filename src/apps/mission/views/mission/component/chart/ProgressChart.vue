<template>
  <Sidebar
    v-model:visible='visibleForm'
    v-bind='DEFAULT_SIDEBAR_CONFIG'
    :header="t('Thống kê tiến độ nhiệm vụ')"
    :style="{ width: '90vw' }"
    @hide="emits('hide-dialog')">
    <div
      class='p-4'
      style='max-height: 700px; overflow-y: auto;'>
      <div class='flex gap-3'>
        <div class='align-items-center flex gap-1'>
          <Badge 
            class='align-items-center border-round-full flex h-1rem justify-content-center w-1rem' 
            severity='info'/>
          <span>Tạo mới</span>
        </div>
        <div class='align-items-center flex gap-1'>
          <Badge 
            class='align-items-center border-round-full flex h-1rem justify-content-center w-1rem' 
            severity='warn'/>
          <span>Đang thực hiện</span>
        </div>
        <div class='align-items-center flex gap-1'>
          <Badge 
            class='align-items-center border-round-full flex h-1rem justify-content-center w-1rem' 
            severity='success'/>
          <span>Hoàn thành</span>
        </div>
        <div class='align-items-center flex gap-1'>
          <Badge 
            class='align-items-center border-round-full flex h-1rem justify-content-center w-1rem' 
            severity='warning'/>
          <span>Chờ gia hạn</span>
        </div>
      </div>
      <VueApexCharts
        :height='600'
        :options='chartOptions'
        :series='series'
        type='rangeBar' />
    </div>
  </Sidebar>
</template>

<script setup lang="ts">
import { get, upperCase } from 'lodash';
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import VueApexCharts from 'vue3-apexcharts';

import { getMissionActivityJobProgress } from '@/apps/mission/api/graphql/mission';
import { DEFAULT_SIDEBAR_CONFIG } from '@/common/constants';

const props = defineProps({
  visibleDialog: {
    type: Boolean,
    default: false,
  },
  id: {
    type: String,
    default: null,
  },
});

const emits = defineEmits(['hide-dialog']);
const { t } = useI18n();
const visibleForm = ref(props.visibleDialog);
const apiData = ref();
if (props.id) {
  const { onResult } = getMissionActivityJobProgress(props.id);
  onResult((res) => {
    apiData.value = get(res, 'data.getMissionActivityJobProgress');
    console.log(apiData.value);
    
  });
}

const missionStatusColors = {
  'NEW': '#3B82F6', 
  'IN_PROGRESS': '#213C7A', 
  'COMPLETED': '#4CAF50', 
  'WAITING_FOR_APPROVAL_EXTENSION_DEADLINE_REQUEST': '#FF9800'
};

const series = computed(() => {
  if (!apiData.value) {
    return [{ data: [] }];
  }

  const chartData = [
    {
      x: apiData.value.missionName,
      y: [new Date(apiData.value.startDate).getTime(), new Date(apiData.value.endDate).getTime()],
      fillColor: missionStatusColors[apiData.value.missionStatus as keyof typeof missionStatusColors],
      type: 'mission',
    },
    ...(apiData.value.activityProgress ?? []).flatMap((activity: any) => [
      {
        x: activity.activityName,
        y: [new Date(activity.startDate).getTime(), new Date(activity.endDate).getTime()],
        fillColor: missionStatusColors[activity.activityStatus as keyof typeof missionStatusColors],
        type: 'activity',
      },
      ...(activity.jobProgress ?? []).map((job: any) => ({
        x: job.jobName,
        y: [new Date(job.startDate).getTime(), new Date(job.endDate).getTime()],
        fillColor: missionStatusColors[job.jobStatus as keyof typeof missionStatusColors],
        type: 'task',
        handlerDepartmentName: job.handlerDepartmentName,
        handlerName: job.handlerName
      })),
    ]),
  ];

  return [{ data: chartData }];
});

watch(series, (newSeries) => {
  console.log('series updated:', newSeries);
  console.log('yAxisLabelColors:', yAxisLabelColors.value);
});
const yAxisLabelColors = computed(() => {
  const data = series.value[0].data;
  return data.map((item: any) => {
    if (item.type === 'mission') {
      return '#231F73';
    }
    if (item.type === 'activity') {
      return '#1E3A8A';
    }
    if (item.type === 'task') {
      return '#000000';
    }
    return '#1E3A8A';
  });
});

const chartOptions = computed(() => ({
  chart: {
    type: 'rangeBar',
    height: 600,
    toolbar: { show: true },
    locales: [{
      name: 'vi',
      options: {
        months: [
          'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
          'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
        ],
        shortMonths: [
          'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
          'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
        ],
        days: [
          'Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'
        ],
        shortDays: ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'],
        toolbar: {
          exportToSVG: 'Tải SVG',
          exportToPNG: 'Tải PNG',
          exportToCSV: 'Tải CSV',
          menu: 'Menu',
          selection: 'Vùng chọn',
          selectionZoom: 'Zoom vùng chọn',
          zoomIn: 'Phóng to',
          zoomOut: 'Thu nhỏ',
          pan: 'Di chuyển',
          reset: 'Đặt lại zoom',
        },
      }
    }],
    defaultLocale: 'vi'
  },
  plotOptions: {
    bar: {
      horizontal: true,
      barHeight: '45%',
      borderRadius: 10,  
    },
  },
  xaxis: { type: 'datetime', },
  yaxis: {
    labels: {
      offsetX: -10,
      style: {
        colors: yAxisLabelColors.value, // truyền mảng màu đã build sẵn
        fontWeight: 600,
        fontSize: 14
      },
      formatter: function (val: string, opts: any) {
        const item = opts?.w.globals.initialSeries[opts.seriesIndex].data[opts.dataPointIndex];
        if (item?.type === 'mission' || item?.type === 'activity') {
          return upperCase(val);
        }
        return val;
      }
    },
  },
  dataLabels: {
    enabled: true,
    formatter: function (_: any, opts: any) {
      const item = opts.w.globals.initialSeries[opts.seriesIndex].data[opts.dataPointIndex];
      const text = item.x;
      const start = item.y[0];
      const end = item.y[1];
      const duration = end - start;
      if (duration < 1000 * 60 * 60 * 24 * 3) {
        return text.substring(0, 10) + '…';
      }
      return text;
    }
  },
  tooltip: {
    enabled: true,
    shared: false,
    custom: function({ series, seriesIndex, dataPointIndex, w }: any) {
      const item = w.globals.initialSeries[seriesIndex].data[dataPointIndex];
      const start = new Date(item.y[0]).toLocaleDateString('vi-VN');
      const end = new Date(item.y[1]).toLocaleDateString('vi-VN');

      if (item.type === 'mission') {
      // Tooltip cho Nhiệm vụ
        return `
        <div style="padding:6px 10px; border-left: 4px solid #1E3A8A;">
          <div style="margin-bottom:5px"><strong>Tên Nhiệm vụ: </strong>${item.x}</div>
          <div><strong>Thời gian: </strong>${start} - ${end}</div>
        </div>
      `;
      } else if (item.type === 'activity') {
        return `
        <div style="padding:6px 10px; border-left: 4px solid #1E3A8A;">
          <div style="margin-bottom:5px"><strong>Hoạt động: </strong>${item.x}</div>
          <div><strong>Thời gian kết thúc: </strong>${end}</div>
        </div>
      `;
      } else if (item.type === 'task') {
      // Tooltip cho Công việc
        return `
        <div style="padding:6px 10px; border-left: 4px solid #1E3A8A;">
          <div style="margin-bottom:5px"><strong>Công việc: </strong>${item.x}</div>
          <div style="margin-bottom:5px"><strong>Người xử lý chính: </strong>${item.handlerName ?? ''}</div>
          <div style="margin-bottom:5px"><strong>Phòng ban: </strong>${item.handlerDepartmentName ?? ''}</div>
          <div><strong>Hạn xử lý: </strong>${end}</div>
        </div>
      `;
      }

      // Mặc định
      return `
      <div style="padding:6px 10px;">
        <div><strong>${item.x}</strong></div>
        <div>Loại: ${item.type}</div>
        <div>Thời gian: ${start} → ${end}</div>
      </div>
    `;
    }
  },
  custom: { applyCustomColors: true }
}));
</script>

<style scoped>
</style>