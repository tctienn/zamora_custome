<template>
  <div class='border-round grid grid-nogutter p-2 surface-ground'>
    <div class='col-12 p-1'>
      <label class='font-semibold'>{{ t('work-flow.task.name') }}:</label>
      {{ task.name }}
    </div>
    <div class='col-6 flex flex-column gap-1 p-1'>
      <label class='font-semibold'>{{ t('work-flow.task.assigned') }}:</label>
      <AppUser
        name-visible
        :user-id='task.assignedId'/>
    </div>
    <div class='col-6 flex flex-column gap-1 p-1'>
      <div>
        <label class='font-semibold'>{{ t('work-flow.task.startTime') }}:</label>
        {{ task.startTime ? moment(task.startTime).format('HH:mm:ss DD/MM/YYYY') : '' }}
      </div>
      <div>
        <label class='font-semibold'>{{ t('work-flow.task.endTime') }}:</label>
        {{ task.endTime ? moment(task.endTime).format('HH:mm:ss DD/MM/YYYY') : '' }}
      </div>
    </div>
    <div class='col-6 p-1'>
      <label class='font-semibold'>{{ t('work-flow.task.status') }}:</label>
      {{ t(`work-flow.status.${camelCase(task.status)}`) }}
    </div>
    <div
      v-if='task.result'
      class='col-6 p-1'>
      <label class='font-semibold'>{{ t('work-flow.task.result') }}:</label>
      {{ task.resultLabel ?? task.result }}
    </div>
    <div class='col-12 p-1'>
      <label class='font-semibold'>{{ t('work-flow.task.comment') }}:</label>
      <div>{{ task.comment }}</div>
    </div>
    <div
      v-if='needChooseAction'
      class='align-items-center col-12 flex gap-2 p-1'>
      <div class='align-items-center flex gap-1 text-yellow-500'>
        <AppIcon name='warning'/>
        {{ t('work-flow.task.nextTaskWarning') }}
      </div>

      <Button @click='chooseNextVisible=true'>Choose</Button>
    </div>
  </div>

  <ChooseNextAction
    v-model:visible='chooseNextVisible'
    :current-node-id='task.nodeId'
    :task-id='task.id'
    :work-id='task.workId'
    @reload='emits("reload")'/>
</template>

<script lang='ts' setup>
import { camelCase } from 'lodash';
import { computed, type PropType, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import type { Task } from '@/apps/work-flow/model/process/work';
import ChooseNextAction from '@/apps/work-flow/views/process/detail/task/popup/ChooseNextAction.vue';
import AppIcon from '@/common/components/app/AppIcon.vue';
import AppUser from '@/common/components/app/AppUser.vue';
import useMoment from '@/common/helpers/mixins/use-moment';
import { useUserStore } from '@/common/store/user';

const props = defineProps({
  task: {
    type: Object as PropType<Task>,
    required: true
  }
});
const emits = defineEmits(['reload']);
const { t } = useI18n();
const { moment } = useMoment();
const { user } = useUserStore();
const needChooseAction = computed(() => props.task.needChooseAction && props.task.assignedId === user?.id);

const chooseNextVisible = ref(false);

</script>

<style scoped>

</style>