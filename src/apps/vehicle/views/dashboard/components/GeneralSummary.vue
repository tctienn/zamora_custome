<template>
  <div class='border-round card p-2 text-white'>
    <div class='font-bold text-primary text-xl'>
      {{ t('vehicle.dashboard.generalSummary') }}
    </div>
    <div
      class='border-bottom-1 surface-border'
      style='margin: 0.5rem -0.5rem'></div>
    <div
      class='flex gap-2 p-1 w-full'>
      <div
        v-for='(data, index) in items'
        :key='index'
        class='align-items-center border-round-sm flex gap-3 justify-content-center p-2 py-2 w-full'
        :style='{ background: data.background }'>
        <AppIcon
          :name='data.icon'
          size='2.3'/>
        <div class='flex flex-column gap-1 text-center'>
          {{ data.label }}
          <div class='font-bold text-2xl'>{{ data.value }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang='ts'>
import { computed, type PropType } from 'vue';
import { useI18n } from 'vue-i18n';

import AppIcon from '@/common/components/app/AppIcon.vue';

const props = defineProps({
  data: {
    type: Object as PropType<any>,
    default: () => ({})
  },
});
const { t } = useI18n();
const items = computed(() => [
  {
    label: 'Tổng số xe',
    icon: 'minor_crash',
    value: props.data?.totalCar ?? 0,
    background: '#F4B2A3',
  },
  {
    label: 'Tổng lệnh đi',
    icon: 'assignment',
    value: props.data?.totalDone ?? 0,
    background: '#CAE2B0',
  },
  {
    label: 'Tổng lệnh huỷ',
    icon: 'cancel',
    value: props.data?.totalCancel ?? 0,
    background: '#F4B2A3',
  },
]);

</script>

<style scoped>

</style>