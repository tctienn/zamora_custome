<template>
  <div class='no-data-container'>
    <i class='mb-4 pi pi-info-circle text-4xl text-primary'></i>
    <h3 class='font-semibold mb-2 text-xl'>{{ t('common.noData') }}</h3>
    <p class='text-gray-600'>{{ message || t('common.noDataMessage') }}</p>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';

defineProps({
  message: {
    type: String,
    default: ''
  }
});

const { t } = useI18n();

</script>

<style scoped>
.no-data-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  text-align: center;
  min-height: 200px;
  background-color: var(--surface-ground);
  border-radius: 8px;
}
</style>
