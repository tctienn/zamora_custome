<template>
  <div>
    <TaskLogTile
      v-for='(value, index) in Object.entries(groupByTime)'
      :key='value[0]'
      class='mb-3'
      :date='new Date(value[0])'
      :details='value[1]'
      :is-last-date='index === Object.entries(groupByTime).length - 1'>
    </TaskLogTile>
  </div>
</template>

<script lang='ts' setup>
import { groupBy } from 'lodash';
import { computed, reactive, ref, watch } from 'vue';

import { findAllHistoryByTaskIdGraphql } from '@/apps/work/api/graphql/task-history-api';
import type { TaskLog } from '@/apps/work/model/workLog';
import TaskLogTile from '@/apps/work/views/task/component/detail/activity/TaskLogTile.vue';
import { DEFAULT_PAGE } from '@/common/constants';
import { Direction, type Pageable } from '@/common/model/query';

const props = defineProps({
  taskId: {
    type: String,
    default: undefined
  }
});
const page = reactive<Pageable>({
  ...DEFAULT_PAGE,
  sort: [{
    property: 'createdTime',
    direction: Direction.DESC
  }]
});

const taskLog = ref<TaskLog[]>([]);
watch(() => props.taskId, value => {
  const { onResult: activityOnResult } = findAllHistoryByTaskIdGraphql(value || '');
  activityOnResult(res => {
    taskLog.value = res.data?.findAllHistoryByTaskId;
  }
  );
}, { immediate: true });

function extractDate(dateTime: string): string {
  return dateTime.split('T')[0]; // Split by 'T' and return the date part
}

const groupByTime = computed(() => {
  return groupBy(taskLog.value, log => extractDate(log.createdTime.toString()));
});
</script>

<style scoped>

</style>