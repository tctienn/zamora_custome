<template>
  <Dropdown
    v-model='daysBefore'
    class='p-0'
    :options='days'
    :pt="{
      root: {
        class: 'card border-none',
      },
      input: {
        class: 'p-0',
      },
      trigger: {
        style: 'display: none',
      },
    }">
    <template #value>
      <CardCounter
        :bgc='bgc'
        class='h-full p-0'
        :count='count'
        type='deadline'/>
    </template>
    <template #option='{ option }'>
      {{ t("document.dashboard.beforeDays", { days: option }) }}
    </template>
  </Dropdown>
</template>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n';

import CardCounter from '@/apps/document/views/dashboard/components/card/CardCounter.vue';

defineProps({
  count: {
    type: Number,
    required: true,
  },
  bgc: {
    type: String,
    default: null,
  },
});

const daysBefore = defineModel('daysBefore', {
  type: Number,
  default: 1,
});

const { t } = useI18n();
const days = Array.from({ length: 5 }, (_, i) => i + 1);
</script>

<style scoped></style>
