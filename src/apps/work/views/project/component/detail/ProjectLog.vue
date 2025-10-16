<template>
  <div>
    <ProjectLogTile
      v-for='(value, index) in Object.entries(groupByTime)'
      :key='value[0]'
      class='mb-3'
      :date='new Date(value[0])'
      :details='value[1]'
      :is-last-date='index === Object.entries(groupByTime).length - 1'>
    </ProjectLogTile>
  </div>
</template>

<script setup lang="ts">
import '@/apps/work/views/project/component/detail/ProjectLog.vue';

import { get, groupBy } from 'lodash';
import { computed, ref } from 'vue';

import { getProjectLog } from '@/apps/work/api/graphql/project-log-api';
import type { ProjectLog } from '@/apps/work/model/projectLog';
import ProjectLogTile from '@/apps/work/views/project/component/detail/log/ProjectLogTile.vue';

const props = defineProps({
  projectId: {
    type: String,
    required: true
  }
});

const rs = ref<ProjectLog[]>();
getProjectLog(props.projectId).onResult((data) => {
  rs.value = get(data, 'data.getProjectLog');
});

function extractDate(dateTime: string): string {
  return dateTime.split('T')[0]; // Split by 'T' and return the date part
}

const groupByTime = computed(() => {
  return groupBy(rs.value, log => extractDate(log.createdTime.toString()));
});
</script>

<script lang="ts">
export default { name: 'ProjectLog' };
</script>

<style scoped>

</style>