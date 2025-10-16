<template>
  <div>
    <TaskManagerHeader
      v-model:search-date='searchDate'
      v-model:view-type='viewType'
      v-model:visible-form='visibleForm'
      :header="'Quản lý công việc'"
      :loading='listDataLoading'
      @reload='reload'>
      <template #addButton>
        <div></div>
      </template>
      <template #reloadButton>
        <div></div>
      </template>
      <template #selectedButton>
        <div></div>
      </template>
    </TaskManagerHeader>
    <div style='height:calc(100vh - 12rem)'>
      <TabView
        v-model:active-index='activeIndex'
        lazy
        :pt="{
          root:{
            class:'h-full'
          },
          panelContainer:{
            style:{
              height:'calc(100% - 5rem)'
            }
          },

        }">
        <TabPanel
          content-class='h-full'
          :header='"Phòng ban"'
          :pt="{
            content:{
              class:'h-full'
            }
          }">
          <ManagerViewOrg
            v-model:search-date='searchDate'
            v-model:view-type='viewType'
            v-model:visible-form='visibleForm'/>

        </TabPanel>

        <TabPanel
          :header='"Team"'>

        </TabPanel>
      </TabView>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

import ManagerViewOrg from '@/apps/work/views/manager/manageOrg/ManagerViewOrg.vue';
import TaskManagerHeader from '@/apps/work/views/task/manager/TaskManagerHeader.vue';
import type { ViewType } from '@/apps/work/views/task/manager/type';

const activeIndex = ref<number>();
const searchDate = ref<Date>(new Date());
const viewType = ref<ViewType>('list');
const visibleForm = ref<boolean>(false);

const listDataLoading = ref<boolean>(false);

function reload() {

}
</script>

<style scoped>
:deep(.p-tabmenu .p-tabmenu-nav .p-tabmenuitem .p-menuitem-link) {
  padding: 0.75rem 1rem !important;
}
</style>