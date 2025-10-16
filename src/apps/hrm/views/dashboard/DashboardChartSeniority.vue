<template>
  <div class='h-full'>
    <div
      style='font-size: 18px;
                font-weight: bold;
                color: #1A4F9C;
                text-align: center;'>
      Thâm niên công tác cao nhất (ĐÃ DI CHUYỂN)
    </div>
    <div class='flex justify-content-center'>
      <p>Chart đã được di chuyển đến DashboardChartPositionStatistics</p>
    </div>
  </div>
</template>

<script lang='ts' setup>
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