<template>
  <div class='border-round card p-2'>
    <div class='font-bold text-primary text-xl'>
      {{ t('vehicle.dashboard.carExecutesOrderDuringDay') }}
    </div>
    <div
      class='border-bottom-1 surface-border'
      style='margin: 0.5rem -0.5rem'></div>
    <div
      class='grid grid-nogutter w-full'
      style='max-height: 30rem'>
      <div
        v-for='(item, index) in data.busyVehicles'
        :key='index'
        class='align-items-center col-4 flex flex-column gap-1 justify-content-center mb-2'>
        <img
          alt=''
          class='h-7rem object-fit-contain w-full'
          :src='generatePreviewFileUrl(item.images[0]?.path)'/>
        <div>{{ item.licensePlate }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang='ts'>
import type { PropType } from 'vue';
import { useI18n } from 'vue-i18n';

import { generatePreviewFileUrl } from '@/common/helpers/file-utils';

const props = defineProps({
  data: {
    type: Object as PropType<any>,
    default: () => ({})
  },
});
const { t } = useI18n();
</script>

<style scoped>

</style>