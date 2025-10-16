<template>
  <TabView
    v-model:active-index='activeIndex'
    :pt="{
      root:{
        class:'p-0'
      },
      navContainer:{
        class:['static'],
      },
      panelContainer:{
        class:['p-0',],
      }
    }"
    @tab-change='tabChange'>
    <TabPanel style='height: calc(100vh - 12rem)'>
      <template #header>
        <span class='align-items-center flex font-semibold gap-2 text-lg'>
          <i
            class='pi pi-comments'
            style='font-size: 1.3rem'></i>Trao đổi
        </span>
      </template>
      <TaskCommentTabContent
        style='height: calc(100vh - 13rem)'
        :task-id='taskId'>
      </TaskCommentTabContent>
    </TabPanel>

    <TabPanel>
      <template #header>
        <span class='align-items-center flex font-semibold gap-2 text-lg'>Tài liệu
        </span>
      </template>
      <TaskCommentTabFiles
        ref='tabFiles'
        :task-id='taskId'
        @scroll-to-comment='scrollToComment'>
      </TaskCommentTabFiles>
    </TabPanel>
  </TabView>

</template>

<script lang='ts' setup>

import type { TabViewChangeEvent } from 'primevue/tabview';
import { nextTick, ref } from 'vue';

import TaskCommentTabContent from '@/apps/work/views/task/component/comment/TaskCommentTabContent.vue';
import TaskCommentTabFiles from '@/apps/work/views/task/component/comment/TaskCommentTabFiles.vue';
import EventBus from '@/common/helpers/event-bus';

const props = defineProps({
  taskId: {
    type: String,
    default: undefined
  }
});
const activeIndex = ref<number>(0);
const tabFiles = ref<InstanceType<typeof TaskCommentTabFiles> | null>(null);

function scrollToComment(id: string) {
  activeIndex.value = 0;
  nextTick(() => {
    EventBus.emit('scrollToCommentId', id);
  });
}

function tabChange(event: TabViewChangeEvent) {
  if (event.index == 1) {
    tabFiles.value?.reloadAtt();
  }
}
</script>

<style scoped>

</style>