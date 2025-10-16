<template>
  <Stepper orientation='vertical'>
    <StepperPanel
      v-for='history in histories'
      :key='history.nodeId'
      :header='history.nodeName'>
      <div class='flex flex-column gap-2'>
        <div class='bg-black-alpha-40 border-round gap-2 grid-nogutter p-2 task-wrapper'>
          <MiniTaskDetail
            v-for='task in history.tasks'
            :key='task.id'
            :task='task'/>
        </div>
        <div
          v-if='history.tasks.every(task=>task.status===WorkStatus.COMPLETED) && Object.keys(groupTaskInHistory(history)).length'>
          {{ t('work-flow.task.result') }}:
          <div
            v-for='result of Object.keys(groupTaskInHistory(history))'
            :key='result'>
            {{ groupTaskInHistory(history)[result][0]?.resultLabel }} -
            {{ groupTaskInHistory(history)[result].length }}/{{ history.tasks.length }}
          </div>
        </div>
      </div>

    </StepperPanel>
  </Stepper>
</template>

<script lang='ts' setup>
import { groupBy, omit } from 'lodash';
import { type PropType } from 'vue';
import { useI18n } from 'vue-i18n';

import { type StepHistory, WorkStatus } from '@/apps/work-flow/model/process/work';
import MiniTaskDetail from '@/apps/work-flow/views/process/detail/task/MiniTaskDetail.vue';

const props = defineProps({
  histories: {
    type: Array as PropType<StepHistory[]>,
    default: () => []
  }
});
const { t } = useI18n();

function groupTaskInHistory(history: StepHistory) {
  return omit(groupBy(history.tasks, 'result'), 'null');
}

</script>

<style scoped>
.task-wrapper {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(30rem, 1fr));
}
</style>