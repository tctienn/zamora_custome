<template>
  <div>
    <div class='flex flex-row gap-5'>
      <LogDate
        class='w-8rem'
        :date='date'
        :is-last-date='isLastDate'></LogDate>
      <LogDetail
        class='w-full'
        :details='details'></LogDetail>
    </div>
    <slot></slot>
  </div>
</template>

<script lang="ts" setup>

import type { PropType } from 'vue';

import type { TaskLog } from '@/apps/work/model/workLog';
import LogDate from '@/apps/work/views/project/component/detail/log/LogDate.vue';
import LogDetail from '@/apps/work/views/project/component/detail/log/LogDetail.vue';

const props = defineProps({
  date: {
    type: Date,
    required: true
  },
  details: {
    type: Array as PropType<TaskLog[]>,
    required: true
  },
  isLastDate: {
    type: Boolean,
    default: false
  }
});

</script>

<script lang="ts">
export default { name: 'TaskLogTile' };
</script>

<style scoped>

</style>