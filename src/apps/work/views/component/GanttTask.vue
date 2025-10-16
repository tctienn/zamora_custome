<template>
  <div class='container'>
    <GanttComponent
      ref='ganttRef'
      class='left-container'
      :columns='columns'
      :max-date='minDate'
      :min-date='maxDate'
      :scales='scales'
      :tasks='dataGantt'>
    </GanttComponent>
  </div>
</template>

<script lang="tsx" setup>
import type { DataToLoad1 } from 'dhtmlx-gantt';
import { computed, ref, watch } from 'vue';

import type { Participant, Task, Task as TaskModel } from '@/apps/work/model/task';
import TaskName from '@/apps/work/views/task/component/gantt/TaskName.vue';
import AppGroupAvatar from '@/common/components/app/AppGroupAvatar.vue';
import ProgressRing from '@/common/components/custom/ProgressRing.vue';
import GanttComponent from '@/common/components/gantt/GanttComponent.vue';
import type { GanttColumnConfig, GanttScaleConfig } from '@/common/components/gantt/type';
import { filterThenMap } from '@/common/helpers/extension/array.extension';

const props = defineProps({
  minDate: {
    type: Date,
    default: undefined
  },
  maxDate: {
    type: Date,
    default: undefined
  }
});

const tasks = defineModel<Task[]>({ default: [] });

const ganttRef = ref<InstanceType<typeof GanttComponent> | null>(null);
const dataGantt = computed<DataToLoad1>(() => ({
  data: tasks.value.map((e, index) => ({
    ...e,
    nOrder: index + 1,
    id: e.id,
    start_date: e.startTime ? new Date(e.startTime?.toString() || '') : undefined,
    end_date: e.dueTime ? new Date(e.dueTime?.toString() || '') : undefined
  }))
}));
const gantt = computed(() => {
  return ganttRef.value?.gantt;
});
watch(dataGantt, (value) => {
  gantt.value?.clearAll();
  gantt.value?.parse(value);
});

const columns: GanttColumnConfig[] = [
  {
    name: 'STT',
    label: 'STT',
    align: 'center',
    width: 50,
    template(task) {
      return `<div class="text-center w-full">${task?.nOrder}</div>`;
    },
  },
  {
    name: 'name',
    label: 'Công việc',
    width: 500,
    templateTSX(task, node) {
      return <TaskName key={'task-name-' + task.id} task={task as TaskModel}/>;
    },
  },
  {
    name: 'participants',
    label: 'Thực hiện',
    align: 'center',
    width: '300',
    templateTSX(task, node) {
      return (
        <AppGroupAvatar
          key={'task-participants-' + task.id}
          numberAvatarDisplay={3}
          userIds=
            {filterThenMap(
                      (task?.participants || []) as Participant[],
                      item => item?.type === 'IMPLEMENTER',
                      item => item.participantId
            )}
          avatarSize="2.5"
        />
      );
    },
  },
  {
    name: 'percent',
    label: 'Tiến độ',
    align: 'center',
    templateTSX(task, node) {
      return <ProgressRing
        key={'task-percent-' + task.id}
        progress={task?.percent || 0}/>;
    },
  }
];

const scales: GanttScaleConfig[] = [
  {
    unit: 'month',
    step: 1,
    format: '%F, %Y',
    css: () => 'font-semibold h-full'
  },
  {
    unit: 'day',
    step: 1,
    format: function (date) {
      const format = gantt.value?.date.date_to_str;
      const date1 = format ? format('%d')(date) : date;
      const date2 = format ? format('%D')(date) : date;

      function isWeekend(date: Date) {
        return date.getDay() == 0 || date.getDay() == 6;
      }

      return `<div style=line-height:15px; >
        <div class="font-semibold text-sm ${isWeekend(date) ? 'weekend' : ''}"  >${date1}</div>
         <div class="text-sm  ${isWeekend(date) ? 'weekend' : ''}">${date2}</div>
         </div>`;
    }
  },
];

</script>

<style scoped>
html, body {
  height: 100%;
  margin: 0;
  padding: 0;
}

.container {
  height: calc(100vh - 15rem);
  width: 100%;
}

.left-container {
  overflow: hidden;
  position: relative;
  height: 100%
}

:deep(.circular-progress-container) {
  height: 100% !important;
}

:deep(.circular-progress) {
  height: 100% !important;
}

:deep(.gantt_tree_content) {
  display: flex
}

:deep(.group-avatar-container) {
  margin: auto
}
</style>