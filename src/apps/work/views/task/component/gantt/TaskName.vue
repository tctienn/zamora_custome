<template>
  <div>
    <div
      class='cursor-pointer hover:text-blue-400 overflow-auto text-overflow-ellipsis'
      @click='workNameClick'>
      {{ task?.name || '' }}
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { PropType } from 'vue';

import type { Task } from '@/apps/work/model/task';
import EventBus from '@/common/helpers/event-bus';

const props = defineProps({
  task: {
    type: Object as PropType<Task>,
    default: undefined
  }
});

function workNameClick() {
  EventBus.emit('showTaskDetail', { id: props.task?.id });
}
</script>

<style scoped>

</style>