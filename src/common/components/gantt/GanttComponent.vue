<template>
  <div ref='ganttContainer'></div>
</template>

<script lang="tsx" setup>
import type { DataToLoad1 } from 'dhtmlx-gantt';
import { gantt } from 'dhtmlx-gantt';
import { type App, defineProps, onBeforeUnmount, onMounted, type PropType, ref, watch } from 'vue';

import type { GanttColumnConfig, GanttScaleConfig } from '@/common/components/gantt/type';
import { configColumns, configExternalRender, configScales, setLocaleVi } from '@/common/components/gantt/utils';

const props = defineProps({
  tasks: {
    type: Object as PropType<DataToLoad1>,
    default: () => ({
      data: [],
      links: []
    })
  },
  minDate: {
    type: Date,
    default: undefined
  },
  maxDate: {
    type: Date,
    default: undefined
  },
  columns: {
    type: Array as PropType<GanttColumnConfig[]>,
    default: () => []
  },
  scales: {
    type: Array as PropType<GanttScaleConfig[]>,
    default: () => []
  }
});
// Create a ref for the Gantt container
const ganttContainer = ref<InstanceType<typeof HTMLElement> | null>(null);
//store to unmount app context
let apps: App[] = [];

gantt.config.show_tasks_outside_timescale = true;
gantt.config.date_format = '%d-%m-%Y';
gantt.config.scale_height = 65;
gantt.config.row_height = 50;
gantt.config.bar_height = 10;
gantt.config.readonly = true;
gantt.config.layout.width =
    gantt.templates.task_text = (start, end, task) => {
      if (!end) {
        return 'Không có ngày kết thúc';
      }
      return '';
    };
gantt.templates.task_class = function (start, end, task) {
  function stringToColorIndex(str: string, maxColors = 50) {
    if (!str) {
      return 1;
    }
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return Math.abs(hash % maxColors) + 1; // Map to 1-50 range
  }

  const colorIndex = stringToColorIndex(task?.name, 50);
  // Return the random CSS class
  return `task-color-${colorIndex}`;
};
//template
gantt.templates.grid_row_class = function (start, end, task) {
  if (task?.end_date) {
    const now = new Date();
    if (now > task.end_date) {
      return 'overdue-row';
    }
  }
};

gantt.templates.task_row_class = function (start, end, task) {
  if (task?.end_date) {
    const now = new Date();
    if (now > task.end_date) {
      return 'overdue-row';
    }
  }
};
//Plugin
gantt.plugins({ marker: true });
const today = new Date();
const dateToStr = gantt.date.date_to_str(gantt.config.task_date);
gantt.addMarker({
  start_date: today,
  css: 'today',
  text: 'Hôm nay',
  title: 'Hôm nay: ' + dateToStr(today)
});
configExternalRender(gantt, apps);

configColumns(props.columns, gantt);
configScales(props.scales, gantt);
setLocaleVi(gantt);

watch([() => props.minDate, () => props.maxDate], ([newMinDate, newMaxDate]) => {
  gantt.config.start_date = newMinDate;
  gantt.config.end_date = newMaxDate;
  gantt.render();
});

onMounted(() => {
  gantt.init(ganttContainer?.value || '<div></div>', props.minDate, props.maxDate);
  gantt.parse(props.tasks);
});

onBeforeUnmount(() => {
  apps.forEach(a => a.unmount());
  apps = [];
});

defineExpose({ gantt });
</script>

<style lang='scss'>
@import "../../../../node_modules/dhtmlx-gantt/codebase/dhtmlxgantt.css";

.task-color-1 {
  background-color: #f87171;
  color: white;
}

.task-color-2 {
  background-color: #60a5fa;
  color: white;
}

.task-color-3 {
  background-color: #34d399;
  color: white;
}

.task-color-4 {
  background-color: #fbbf24;
  color: black;
}

.task-color-5 {
  background-color: #a78bfa;
  color: white;
}

.task-color-6 {
  background-color: #fb7185;
  color: white;
}

.task-color-7 {
  background-color: #38bdf8;
  color: white;
}

.task-color-8 {
  background-color: #22c55e;
  color: white;
}

.task-color-9 {
  background-color: #facc15;
  color: black;
}

.task-color-10 {
  background-color: #c084fc;
  color: white;
}

.task-color-11 {
  background-color: #f43f5e;
  color: white;
}

.task-color-12 {
  background-color: #3b82f6;
  color: white;
}

.task-color-13 {
  background-color: #10b981;
  color: white;
}

.task-color-14 {
  background-color: #eab308;
  color: black;
}

.task-color-15 {
  background-color: #d946ef;
  color: white;
}

.task-color-16 {
  background-color: #f97316;
  color: white;
}

.task-color-17 {
  background-color: #2563eb;
  color: white;
}

.task-color-18 {
  background-color: #14b8a6;
  color: white;
}

.task-color-19 {
  background-color: #a3e635;
  color: black;
}

.task-color-20 {
  background-color: #ec4899;
  color: white;
}

.task-color-21 {
  background-color: #e11d48;
  color: white;
}

.task-color-22 {
  background-color: #6366f1;
  color: white;
}

.task-color-23 {
  background-color: #06b6d4;
  color: white;
}

.task-color-24 {
  background-color: #84cc16;
  color: black;
}

.task-color-25 {
  background-color: #9333ea;
  color: white;
}

.task-color-26 {
  background-color: #dc2626;
  color: white;
}

.task-color-27 {
  background-color: #4f46e5;
  color: white;
}

.task-color-28 {
  background-color: #0891b2;
  color: white;
}

.task-color-29 {
  background-color: #65a30d;
  color: black;
}

.task-color-30 {
  background-color: #7e22ce;
  color: white;
}

.task-color-31 {
  background-color: #ef4444;
  color: white;
}

.task-color-32 {
  background-color: #4338ca;
  color: white;
}

.task-color-33 {
  background-color: #0e7490;
  color: white;
}

.task-color-34 {
  background-color: #ca8a04;
  color: black;
}

.task-color-35 {
  background-color: #be185d;
  color: white;
}

.task-color-36 {
  background-color: #f59e0b;
  color: white;
}

.task-color-37 {
  background-color: #3730a3;
  color: white;
}

.task-color-38 {
  background-color: #155e75;
  color: white;
}

.task-color-39 {
  background-color: #a16207;
  color: white;
}

.task-color-40 {
  background-color: #9d174d;
  color: white;
}

.task-color-41 {
  background-color: #ea580c;
  color: white;
}

.task-color-42 {
  background-color: #312e81;
  color: white;
}

.task-color-43 {
  background-color: #0f766e;
  color: white;
}

.task-color-44 {
  background-color: #854d0e;
  color: white;
}

.task-color-45 {
  background-color: #831843;
  color: white;
}

.task-color-46 {
  background-color: #d97706;
  color: white;
}

.task-color-47 {
  background-color: #1e40af;
  color: white;
}

.task-color-48 {
  background-color: #134e4a;
  color: white;
}

.task-color-49 {
  background-color: #78350f;
  color: white;
}

.task-color-50 {
  background-color: #9b2c2c;
  color: white;
}

.weekend {
  background: #FDF9DC;
  color: #D71E1C;
}

.today {
  background: #0ca30a
}

.overdue-row {
  background: #FEFBEF !important;

  .task-duration {
    color: #FF0606 !important;
  }

  &:hover {
    background: #E6E2D8 !important
  }
}
</style>
