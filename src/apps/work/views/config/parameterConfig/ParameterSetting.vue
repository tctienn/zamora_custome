<template>
  <Toolbar class='align-content-center h-3rem mb-2 px-2 py-0 surface-0'>
    <template #start>
      <div class='align-items-center flex gap-2 h-3rem'>
        <div class='align-items-center flex font-bold h-3rem text-xl'>
          {{ t("work.parameterConfig.header") }}
        </div>
      </div>
    </template>

  </Toolbar>
  <TabView v-model:active-index='currentTab'>
    <TabPanel header='Công việc'>
      <TaskConfig />
    </TabPanel>

    <TabPanel header='Dự án'>
      <ProjectConfig />
    </TabPanel>
  </TabView>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

import ProjectConfig from '@/apps/work/views/config/parameterConfig/component/ProjectConfig.vue';
import TaskConfig from '@/apps/work/views/config/parameterConfig/component/TaskConfig.vue';

const { t } = useI18n();
const currentTab = ref(0);
</script>

<style scoped>
:deep(.p-accordion-header-link) {
  padding: unset;
  display: flex;
  border: none;
  background: none;
  flex-direction: row-reverse;
  justify-content: space-between;
}

:deep(.p-accordion-content) {
  border: none;
  padding: unset;
}

:deep(.p-accordion) {
  width: 100%;
}

:deep(.p-tabview-panels) {
  padding: unset !important;
}
</style>
