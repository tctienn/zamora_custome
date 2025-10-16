<template>
  <slot name='header'></slot>
  <div class='empty-preview-container surface-0'>
    <!-- Centered empty state content -->
    <div class='empty-content-center'>
      <i class='mb-3 pi pi-file-o text-6xl text-color-secondary'></i>
      <div class='font-semibold text-2xl text-color-secondary'>
        {{ t('document.doc.emptyPreview') }}
      </div>
      <div class='mt-2 text-color-secondary text-sm'>
        {{ t('document.doc.selectDocumentToView') || 'Chọn một văn bản để xem chi tiết' }}
      </div>
    </div>
  </div>
</template>

<script lang='ts' setup>
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
</script>

<style scoped>
.empty-preview-container {
  display: flex;
  align-items: center;
  justify-content: center;
  height: calc(100vh - 11.2rem);
  width: 100%;
}

.empty-content-center {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 2rem;
}
</style>
