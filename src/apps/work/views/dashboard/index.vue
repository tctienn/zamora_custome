<template>
  <TabMenu
    v-model:activeIndex='activeIndex'
    class='mb-3'
    :model='tabs' />

  <!-- Component hiển thị -->
  <component :is='tabs[activeIndex].component' />
</template>

<script lang="ts" setup>
import { defineAsyncComponent, ref } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const activeIndex = ref(0);

// Dynamic imports
const tabs = ref([
  {
    label: t('work.dashboard.tab1'),
    component: defineAsyncComponent(() => import('./component/MySummary.vue')),
  },
  {
    label: t('work.dashboard.tab2'),
    component: defineAsyncComponent(() => import('./component/DepartmentSummary.vue')),
  },
  {
    label: t('work.dashboard.tab3'),
    component: defineAsyncComponent(() => import('./component/CompanySummary.vue')),
  },
]);
</script>
