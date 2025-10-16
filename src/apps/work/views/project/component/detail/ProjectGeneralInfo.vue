<template>
  <div
    class='flex gap-2 justify-content-between'>
    <div
      class='col-8 overflow-y-auto p-0 surface-0'
      style='height: calc(100vh - 10.8rem)'>
      <ProjectGeneralInfoDetail
        :completed='summaryTaskProject?.completed?.total || 0'
        :on-going='summaryTaskProject?.onGoing?.total || 0'
        :overdue='summaryTaskProject?.overdue || 0'
        :project='project'
        :total-task='summaryTaskProject?.totalTask || 0'/>
      <ProjectGeneralInfoChart
        :project-id='project.id'/>

    </div>
    <ProjectComment
      class='col-4 h-full pb-0'
      :project-id='projectId'>

    </ProjectComment>
  </div>
</template>

<script lang='ts' setup>
import { computed, type PropType, provide, watch } from 'vue';

import { getSummaryTaskProject } from '@/apps/work/api/graphql/project';
import ProjectComment from '@/apps/work/views/project/component/comment/ProjectComment.vue';
import ProjectGeneralInfoChart
  from '@/apps/work/views/project/component/detail/general-info/ProjectGeneralInfoChart.vue';
import ProjectGeneralInfoDetail
  from '@/apps/work/views/project/component/detail/general-info/ProjectGeneralInfoDetail.vue';
import type { SummaryTaskProject } from '@/apps/work/views/project/component/detail/general-info/type';
import type { ProjectInterface } from '@/apps/work/views/project/model';

const props = defineProps({
  projectId: {
    type: String,
    required: true
  },
  project: {
    type: Object as PropType<ProjectInterface>,
    required: true
  }
});

const {
  load,
  result,
  refetch
} = getSummaryTaskProject(props.project?.id || '');
watch(() => props.project?.id, projectId => {
  if (projectId) {
    load(null, { projectId: projectId })
    || refetch({ projectId: projectId });
  }
}, { immediate: true });

const summaryTaskProject = computed<SummaryTaskProject>(() => {
  return result.value?.getSummaryTaskProject;
});

provide('summaryTaskProject', summaryTaskProject);
</script>

<script lang='ts'>
export default { name: 'ProjectGeneralInfo' };
</script>

<style lang='scss' scoped>
:deep(.description) {
  img {
    max-width: 50rem !important;
    max-height: 50rem !important;
    object-fit: cover;
  }
}

</style>