<template>
  <div
    class='card flex gap-2 m-0'
    :class="type === 'outgoingDoc' ? 'bg-red-50' : 'bg-green-50'">
    <img
      alt='icon'
      class='border-circle h-5rem p-2 w-5rem'
      :class="type === 'outgoingDoc' ? 'bg-red-300' : 'bg-blue-300'"
      :src="
        type === 'outgoingDoc'
          ? '/images/folder-icons/outgoing-doc.svg'
          : '/images/folder-icons/incoming-doc.svg'
      "/>
    <div class='flex flex-column flex-grow-1 gap-2'>
      <h4 class='font-bold m-0 ml-1 text-blue-500'>
        {{ t(`document.dashboard.${ type }`).toUpperCase() }}
      </h4>
      <div class='flex gap-3'>
        <div></div>
        <h1
          class='m-0 text-orange-500'>{{ displayValue }}</h1>
        <div class='flex flex-column flex-grow-1 gap-1'>
          <div class='flex justify-content-between'>
            <div class='text-gray-700'>{{ t('document.menu.docIn.waitingProcess') }}</div>
            <span class='font-bold text-gray-400 text-lg'>{{ countWaitingProcess }}</span>
          </div>
          <div class='flex justify-content-between'>
            <div class='text-gray-700'>{{ t('document.menu.docIn.processing') }}</div>
            <span class='font-bold text-gray-400 text-lg'>{{ countProcessing }}</span>
          </div>
          <div class='flex justify-content-between'>
            <div class='text-gray-700'>{{ t('document.menu.docIn.waitingComment') }}</div>
            <span class='font-bold text-gray-400 text-lg'>{{ countWaitingComment }}</span>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script lang='ts' setup>
import { debounce } from 'lodash';
import { computed, type PropType, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { useAnimateCounter } from '@/apps/document/helpers/composable/utils';

const props = defineProps({
  type: {
    type: String as PropType<'outgoingDoc' | 'incomingDoc'>,
    required: true,
  },
  countWaitingProcess: {
    type: Number,
    default: 0,
  },
  countProcessing: {
    type: Number,
    default: 0,
  },
  countWaitingComment: {
    type: Number,
    default: 0,
  },
});
const { t } = useI18n();
const {
  displayValue,
  animateCounter
} = useAnimateCounter();
const total = computed(() => props.countWaitingProcess + props.countProcessing + props.countWaitingComment);

watch(
  total,
  debounce(() => {
    animateCounter(total.value);
  }, 200)
);
</script>

<style lang='scss' scoped>
</style>
