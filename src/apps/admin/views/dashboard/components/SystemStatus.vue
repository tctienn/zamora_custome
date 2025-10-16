<template>
  <div class='border-round-sm card h-full shadow-none'>
    <div class='border-bottom-1 font-bold p-3 surface-border'>
      {{ t('admin.dashboard.dashboard.systemStatus') }}
    </div>
    <div class='p-3'>
      <div class='mb-3'>
        <div class='flex justify-content-between mb-2'>
          <span>{{ t('admin.dashboard.dashboard.cpuUsage') }}</span>
          <span>45%</span>
        </div>
        <div class='bg-gray-200 border-round h-1rem w-full'>
          <div
            class='bg-primary-500 border-round h-full'
            style='width: 45%'></div>
        </div>
      </div>
      <div class='mb-3'>
        <div class='flex justify-content-between mb-2'>
          <span>{{ t('admin.dashboard.dashboard.memoryUsage') }}</span>
          <span>65%</span>
        </div>
        <div class='bg-gray-200 border-round h-1rem w-full'>
          <div
            class='bg-orange-500 border-round h-full'
            style='width: 65%'></div>
        </div>
      </div>
      <div>
        <div class='flex justify-content-between mb-2'>
          <span>{{ t('admin.dashboard.dashboard.diskUsage') }}</span>
          <span>30%</span>
        </div>
        <div class='bg-gray-200 border-round h-1rem w-full'>
          <div
            class='bg-green-500 border-round h-full'
            style='width: 30%'></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
</script>

<style scoped>
.card {
  background-color: var(--surface-card);
}
</style>