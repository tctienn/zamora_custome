<template>
  <div
    v-if='task?.evaluation'
    class='flex flex-column row-gap-2'>
    <h5>{{ t('work.task.workEvaluating') }}</h5>
    <div class='p-fluid'>
      <div class='align-items-center flex'>
        <div class='col-2 font-bold'>
          <label>{{ t('work.task.result') }}</label>
        </div>
        <div class='col-10'>
          <label>{{ task.evaluation?.ok ? t('work.task.obtain') : t('work.task.notAchieved') }}</label>
        </div>
      </div>
      <div class='align-items-center flex'>
        <div class='col-2  font-bold'>
          <label>{{ t('work.task.content') }}</label>
        </div>
        <div class='col-10'>
          <label>{{ task.evaluation?.description }}</label>
        </div>
      </div>
      <div class='align-items-center flex'>
        <div class='col-2 font-bold'>
          <label>{{ t('work.task.point') }}</label>
        </div>
        <div class='col-3'>
          <label>{{ task.evaluation?.point }}</label>
        </div>

        <div class='col-3  font-bold'>
          <label>({{ t('work.task.maximumScore') }})</label>
        </div>
      </div>
    </div>
    <Divider/>
  </div>
</template>

<script lang='ts' setup>
import { storeToRefs } from 'pinia';
import { useI18n } from 'vue-i18n';

import { useTaskDetailStore } from '@/apps/work/store/taskDetail';

const { t } = useI18n();
const taskDetailStore = useTaskDetailStore();
const { task } = storeToRefs(taskDetailStore);
</script>

<script lang='ts'>
export default { name: 'WorkEvaluatingDetails' };
</script>

<style lang='scss' scoped>
:deep(.left-information-panel) {
  &::-webkit-scrollbar {
    display: none;
  }
}
</style>