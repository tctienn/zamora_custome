<template>
  <TabView
    v-model:active-index='activeIndex'
    class='h-full'
    :pt="{
      root:{
        class:'p-0'
      },
      navContainer:{
        class:['static'],
      },
      panelContainer:{
        class:['p-0'],
      }
    }"
    @tab-change='tabChange'>
    <TabPanel
      class='h-full'>
      <template #header>
        <span class='align-items-center flex font-semibold gap-2 text-lg'>
          <i
            class='pi pi-comments'
            style='font-size: 1.3rem'></i>Trao đổi
        </span>
      </template>
      <ProjectCommentTabContent :project-id='projectId'>
      </ProjectCommentTabContent>
    </TabPanel>

    <TabPanel>
      <template #header>
        <span class='align-items-center flex font-semibold gap-2 text-lg'>Tài liệu
        </span>
      </template>
      <ProjectCommentTabFiles
        ref='tabFilesRef'
        :project-id='projectId'
        @scroll-to-comment='scrollToComment'>
      </ProjectCommentTabFiles>
    </TabPanel>

  </TabView>

</template>

<script lang="ts" setup>
import type { TabViewChangeEvent } from 'primevue/tabview';
import { nextTick, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import ProjectCommentTabContent from '@/apps/work/views/project/component/comment/ProjectCommentTabContent.vue';
import ProjectCommentTabFiles from '@/apps/work/views/project/component/comment/ProjectCommentTabFiles.vue';
import EventBus from '@/common/helpers/event-bus';

const props = defineProps({
  projectId: {
    type: String,
    default: undefined
  }
});
const { t } = useI18n();
const activeIndex = ref<number>(0);
const tabFilesRef = ref<InstanceType<typeof ProjectCommentTabFiles> | null>(null);

function scrollToComment(id: string) {
  activeIndex.value = 0;
  nextTick(() => {
    EventBus.emit('scrollToCommentId', id);
  });
}

function tabChange(event: TabViewChangeEvent) {
  if (event.index == 1) {
    tabFilesRef.value?.reloadFile();
  }
}
</script>

<style scoped>

</style>