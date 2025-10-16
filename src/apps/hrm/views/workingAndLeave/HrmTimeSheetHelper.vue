<template>
  <i
    class='cursor-pointer pi pi-question-circle text-xl'
    @click='op?.toggle($event)'></i>
  <OverlayPanel ref='op'>
    <div class='flex flex-column gap-2'>
      <div class='font-semibold text-center text-xl w-full'>
        {{ t('hrm.attendance.detail.symbol') }}
      </div>
      <div
        v-for='symbol in symbols'
        :key='symbol.code'
        class='flex gap-2'>
        <div class='font-semibold w-3rem'>
          {{ symbol.code }}
        </div>
        {{ symbol.name }}

      </div>
    </div>
  </OverlayPanel>
</template>

<script lang='ts' setup>

import type OverlayPanel from 'primevue/overlaypanel';
import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { CATEGORY_TYPE } from '@/apps/hrm/constants/category';
import { fetchCategory } from '@/apps/hrm/helpers/utils';
import type { HrmCategory } from '@/apps/hrm/model/category';

const op = ref<OverlayPanel>();
const { t } = useI18n();

const symbols = ref<HrmCategory[]>([]);
onMounted(() => {
  fetchCategory(CATEGORY_TYPE.TIMEKEEPING_SYMBOLS, symbols);
});
</script>

<style scoped>

</style>