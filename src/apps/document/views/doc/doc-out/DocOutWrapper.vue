<template>
  <div class='flex flex-column gap-0'>
    <TabMenu
      :model='filteredDocOutMenus'>
      <template #item='{item}'>
        <router-link
          v-ripple
          active-class='text-primary border-primary'
          class='align-items-center border-bottom-2 border-gray-50 border-noround flex font-semibold gap-2 lg:hover:surface-hover px-3 py-2 transition-duration-400'
          :to='item.to'>
          <AppIcon
            :name='item.icon'
            size='1.4'/>
          <span class='line-height-3 white-space-nowrap'>{{ item.label }}</span>
          <Badge
            v-if='item?.count'
            style='background-color: #F36F24'
            :value='item?.count'/>
        </router-link>
      </template>
    </TabMenu>

    <router-view
      :key='route.name || route.path'
      class='mt-2'/>
  </div>
</template>

<script lang='ts' setup>
import Badge from 'primevue/badge';
import TabMenu from 'primevue/tabmenu';
import { onMounted, provide, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import type { DocOutSearch } from '@/apps/document/model/doc/search';
import { useDocOutMenuConfig } from '@/apps/document/views/doc-menus';
import AppIcon from '@/common/components/app/AppIcon.vue';

const router = useRouter();
const route = useRoute();

// Create a minimal search ref to satisfy the useDocOutMenuConfig requirement
const searchModel = ref<DocOutSearch>({});

const {
  filteredDocOutMenus,
  updateCount
} = useDocOutMenuConfig(searchModel);

provide('updateCount', updateCount);

// Function to load all menu counts
async function loadMenuCounts() {
  for (const menu of filteredDocOutMenus.value) {
    if (menu.countFn) {
      const count = await menu.countFn();
      count !== undefined && updateCount(menu.to?.name as string, count);
    }
  }
}

// Function to redirect to first accessible route
async function redirectToFirstAccessible() {
  // Wait for filteredDocOutMenus to be computed and user permissions loaded
  await new Promise(resolve => setTimeout(resolve, 200));
  
  if (filteredDocOutMenus.value.length > 0) {
    const firstAccessibleMenu = filteredDocOutMenus.value[0];
    if (firstAccessibleMenu.to?.name) {
      await router.replace({ name: firstAccessibleMenu.to.name });
      return true;
    }
  }
  return false;
}

// Watch for route changes to handle permission-based redirects and component recreation
watch(route, async (newRoute, oldRoute) => {
  // If user lands on parent route, redirect to first accessible tab
  if (newRoute.name === 'DocumentDocOut') {
    await redirectToFirstAccessible();
  }
  // The :key='route.name' on router-view will force component recreation
  // Each component's watcher with immediate: true will update its count on mount
}, { immediate: true });

onMounted(async () => {
  // Load menu counts initially
  await loadMenuCounts();
});

</script>

<style scoped></style>
