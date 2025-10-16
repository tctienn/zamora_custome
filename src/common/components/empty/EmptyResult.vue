<template>
  <div class='align-items-center cloud flex flex-column gap-2 select-none'>
    <div class='p-4'>
      <img
        alt='image placeholder'
        class='max-w-25rem'
        src='@/common/assets/images/cloud.png'
        style='-webkit-user-drag: none'/>
    </div>

    <slot>
      <h3>{{ t('common.noSearchResult') }}</h3>
    </slot>
  </div>
</template>

<script lang='ts' setup>
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
</script>

<style scoped>
.cloud {
  background-image: url('@/common/assets/images/emptyState.svg');
  background-position: center center;
  background-repeat: no-repeat;
}
</style>
