<template>
  <div class='flex flex-column gap-3 h-full relative'>
    <Toolbar class='p-2 z-1'>
      <template #start>
        <div class='align-items-center flex gap-2'>
          <Button
            v-tooltip.bottom='t("common.back")'
            :disabled='$router.getRoutes().length === 0'
            icon='pi pi-arrow-left'
            rounded
            text
            @click='$router.back()'/>
          <span class='text-lg'>
            {{ t('work-flow.task.name') }}:
            <span class='font-semibold'>
              {{ task?.name }}
            </span>
          </span>
        </div>

      </template>
      <template #end>
        <div class='flex gap-2'>
          <Button>View Flow</Button>
          <Button severity='warning'>Reassign</Button>
        </div>

      </template>
    </Toolbar>

    <div
      class='grid overflow-y-auto'
      :style='`max-height: ${viewHeight}`'>
      <div class='col-8 flex flex-column gap-2'>
        <div class='border-round grid m-0 p-2 surface-card'>
          <div class='col-6'>
            <div class='font-semibold mb-2'>{{ t('work-flow.work.createdBy') }}</div>
            <AppUser
              name-visible
              :user-id='task?.createdBy'/>
          </div>
          <div class='col-6'>
            <div class='font-semibold mb-2'>{{ t('work-flow.task.status') }}</div>
            <div class='mb-2'>{{ t(`work-flow.status.${camelCase(task?.status)}`) }}</div>
          </div>
          <div class='col-6'>
            <div class='font-semibold mb-2'>{{ t('work-flow.task.startTime') }}</div>
            <div class='mb-2'>{{ moment(task?.startTime).format('HH:mm:ss DD/MM/YYYY') }}</div>
          </div>
          <div class='col-6'>
            <div class='font-semibold mb-2'>{{ t('work-flow.task.endTime') }}</div>
            <div class='mb-2'>{{ task?.endTime ? moment(task?.endTime).format('HH:mm:ss DD/MM/YYYY') : '' }}</div>
          </div>

          <template v-if='task?.status === WorkStatus.COMPLETED'>
            <div class='col-6'>
              <div class='font-semibold mb-2'>{{ t('work-flow.task.result') }}</div>
              <div class='mb-2'>{{ task?.resultLabel }}</div>
            </div>
            <div class='col-6'>
              <div class='font-semibold mb-2'>{{ t('work-flow.task.comment') }}</div>
              <div class='mb-2'>{{ task?.comment }}</div>
            </div>
          </template>
          <div
            v-if='task?.needChooseAction'
            class='align-items-center col-6 flex gap-1 text-yellow-500'>
            <AppIcon name='warning'/>
            {{ t('work-flow.task.nextTaskWarning') }}
          </div>
        </div>

        <div
          v-if='task?.work'
          class='border-round p-2 surface-card'>
          <div class='font-semibold p-2 text-lg'>
            {{ t('work-flow.task.workInfo') }}
          </div>

          <MiniWorkDetail :work='task.work'/>
        </div>
      </div>
      <div class='col-4'>
        <div class='border-round grid m-0 p-2 surface-card'>
          <div class='font-semibold p-2 text-lg'>
            {{ t('work-flow.work.objectInfo') }}
          </div>
          <DynamicObjectInfo
            v-if='task?.objectInfo'
            class='p-2'
            :model-value='task?.objectInfo'/>
        </div>

      </div>

      <div
        class='absolute flex gap-2 justify-content-center w-full'
        style='bottom: 0; left: 0'>
        <template v-if='task?.outcomes'>
          <Button
            v-for='outcome in task.outcomes'
            :key='outcome?.name'
            class='border-none'
            :disabled='outcome?.disable'
            :style='{background: outcome?.color, color: (outcome?.color ? calculateColorBasedOnBackgroundColor(outcome?.color || ""): undefined) }'
            @click='openCompleteTaskDialog(outcome)'>
            {{ outcome.label }}
          </Button>
        </template>
        <Button
          v-if='task?.needChooseAction'
          @click='chooseNextVisible=true'>{{ t('common.choose') }}
        </Button>
      </div>
    </div>
    <CompleteTaskDialog
      v-model:visible='visibleCompleteTask'
      :outcome='currentOutcome'
      :task-id='task?.id'
      @reload='refetch'/>
    <ChooseNextAction
      v-if='task'
      v-model:visible='chooseNextVisible'
      :current-node-id='task?.nodeId'
      :task-id='task?.id'
      :work-id='task?.workId'
      @reload='refetch'/>
  </div>

</template>

<script lang='ts' setup>
import { camelCase } from 'lodash';
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';

import { getTask } from '@/apps/work-flow/api/graphql/task';
import type { Outcome } from '@/apps/work-flow/model/flow';
import { type Task, WorkStatus } from '@/apps/work-flow/model/process/work';
import MiniWorkDetail from '@/apps/work-flow/views/process/detail/MiniWorkDetail.vue';
import DynamicObjectInfo from '@/apps/work-flow/views/process/detail/object/DynamicObjectInfo.vue';
import ChooseNextAction from '@/apps/work-flow/views/process/detail/task/popup/ChooseNextAction.vue';
import CompleteTaskDialog from '@/apps/work-flow/views/process/detail/task/popup/CompleteTaskDialog.vue';
import AppIcon from '@/common/components/app/AppIcon.vue';
import AppUser from '@/common/components/app/AppUser.vue';
import { calculateColorBasedOnBackgroundColor } from '@/common/helpers/color-util';
import useMoment from '@/common/helpers/mixins/use-moment';
import { useUserStore } from '@/common/store/user';

const route = useRoute();
const { t } = useI18n();
const { moment } = useMoment();
const { user } = useUserStore();
const id = computed(() => route.params['id'] as string);
const {
  result,
  refetch
} = getTask(id.value);
const task = computed(() => result.value?.task as Task);
const currentOutcome = ref<Outcome>();
const visibleCompleteTask = ref(false);
const chooseNextVisible = ref(false);

const viewHeight = ref(calculateHeight());
window.onresize = () => viewHeight.value = calculateHeight();

function calculateHeight() {
  const height = window.innerHeight - 190;
  return `${height}px`;
}

function openCompleteTaskDialog(outcome: Outcome) {
  currentOutcome.value = outcome;
  visibleCompleteTask.value = true;
}
</script>

<style scoped>

</style>