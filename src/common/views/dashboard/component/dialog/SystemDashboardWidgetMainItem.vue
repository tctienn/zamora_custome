<template>
  <div
    v-for='(widget, index) in mainDashboardWidgets'
    :key='index'
    class='align-items-center col-12 h-15rem md:col-6'>
    <div
      class='border-1 border-round-xl flex h-full justify-content-center shadow-1 surface-border widget-dropzone'
      :class='{"align-items-center": isNumber(widget)}'
      @dragenter='emits("drag-widget-enter", $event)'
      @dragleave='emits("drag-widget-leave", $event)'
      @dragover='$event.preventDefault()'
      @drop='emits("drop-widget", "main", index)'>
      <span
        v-if='isNumber(widget)'
        class='align-items-center flex h-full justify-content-center w-full'>
        {{ widget + 1 }}
      </span>
      <div
        v-else
        class='align-items-center flex flex-column h-full justify-content-between w-full'>
        <div
          class='align-items-center border-bottom-1 column-gap-2 flex flex-row p-2 surface-border w-full'>
          <AppIcon
            :name='WIDGET_CONFIGS[camelCase(widget.code)]?.icon'
            size='1.5'/>
          <span class='word-break-break-word'>{{ t(`dashboardWidget.widgets.${camelCase(widget.code)}`) }}</span>
        </div>

        <div class='align-self-start px-2 w-full'>
          <Skeleton
            v-for='idx in range( 3)'
            :key='idx'
            animation='none'
            class='align-self-start h-1rem my-3'
            :width='randomSkeleton(50, 90, "%")'></Skeleton>
        </div>

        <ButtonIcon
          v-tooltip='t("common.remove")'
          class='my-2 p-1'
          icon='close'
          icon-size='1.5'
          rounded
          severity='danger'
          text
          @click='emits("remove-selected-widget","main", index)'/>
      </div>
    </div>
  </div>
</template>

<script setup lang='ts'>
import { camelCase, isNumber, range } from 'lodash';
import { type PropType } from 'vue';
import { useI18n } from 'vue-i18n';

import { WIDGET_CONFIGS } from '@/common/constants/widget';
import { randomSkeleton } from '@/common/helpers/utils';
import type { Widget } from '@/common/model';

defineProps({
  mainDashboardWidgets: {
    type: Array as PropType<number[] | Widget[]>,
    default: () => []
  }
});

const emits = defineEmits(['remove-selected-widget', 'drag-widget-enter', 'drag-widget-leave', 'drop-widget']);

const { t } = useI18n();

</script>

<script lang='ts'>
export default { name: 'SystemDashboardWidgetMainItem' };
</script>