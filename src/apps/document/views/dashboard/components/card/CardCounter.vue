<template>
  <div
    class='align-items-center border-round card flex flex-column gap-2 justify-content-center m-0 p-0 px-1'
    :class='bgc'>
    <div class='align-items-center flex gap-2 justify-content-center'>
      <div class='font-bold text-black-alpha-70'>{{ title }}</div>
    </div>
    <div
      class='font-bold text-xl'
      :class='getColorClass()'>
      {{ count }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, type PropType } from 'vue';
import { useI18n } from 'vue-i18n';

const props = defineProps({
  type: {
    type: String as PropType<'overdue' | 'deadline'>,
    required: true,
  },
  count: {
    type: Number,
    required: true,
  },
  bgc: {
    type: String,
    default: null,
  },
});
const title = computed(() => {
  switch (props.type) {
  case 'overdue':
    return t('document.dashboard.overdue');
  case 'deadline':
    return t('document.dashboard.deadline');
  default:
    return '';
  }
});
const { t } = useI18n();

function getColorClass() {
  return {
    'text-red-500': props.type === 'overdue',
    'text-yellow-500': props.type === 'deadline',
  };
}
</script>

<style scoped></style>
