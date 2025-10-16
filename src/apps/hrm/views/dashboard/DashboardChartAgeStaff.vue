<template>
  <div class='h-full'>
    <div class='flex justify-content-center'>
      <DashboardChartAge :organization-id='organizationId'/>
    </div>
  </div>
</template>

<script lang='ts' setup>
import DashboardChartAge from './DashboardChartAge.vue';

defineProps<{
  organizationId?: string | null;
}>();
</script>

<style scoped>
:deep(canvas) {
  height: 100%;
}

:deep(.p-chart) {
  height: 250px
}
</style>