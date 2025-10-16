<template>
  <div class='flex flex-row gap-5'>
    <LogDate
      class='w-8rem'
      :date='date'
      :is-last-date='isLastDate'></LogDate>
    <LogDetail
      class='w-full'
      :details='details'></LogDetail>
  </div>
</template>

<script setup lang="ts">

import type { PropType } from 'vue';

import type { ProjectLog } from '@/apps/work/model/projectLog';
import LogDate from '@/apps/work/views/project/component/detail/log/LogDate.vue';
import LogDetail from '@/apps/work/views/project/component/detail/log/LogDetail.vue';

const props = defineProps({
  date: {
    type: Date,
    required: true
  },
  details: {
    type: Array as PropType<ProjectLog[]>,
    required: true
  },
  isLastDate: {
    type: Boolean,
    default: false
  }
});

</script>

<script lang="ts">
export default { name: 'ProjectLogTile' };
</script>

<style scoped>

</style>