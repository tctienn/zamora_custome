<template>
  <Toolbar
    class='mb-2 p-0'>
    <template #start>
      <div class='align-items-center flex gap-2'>
        <div class='font-bold ml-3'>
          {{ t('work.parameterConfig.header') }}
        </div>
      </div>
    </template>

  </Toolbar>

  <TabView
    v-model:active-index='currentTab'
    class='h-full surface-overlay'>
    <TabPanel
      :header="t('mission.mission.tabOptions.missions')">
      <MissionConfig/>
      
    </TabPanel>
  </TabView>
</template>

<script setup lang='ts'>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

import MissionConfig from './component/MissionConfig.vue';
const { t } = useI18n();
const currentTab = ref(0);
</script>

<style scoped>
.p-toolbar{
  min-height: 42px;
}
</style>
