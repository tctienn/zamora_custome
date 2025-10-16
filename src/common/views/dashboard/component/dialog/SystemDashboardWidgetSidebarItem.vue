<template>
  <div
    v-for='(widget, index) in sidebarDashboardWidgets'
    :key='index'
    class='align-items-center h-10rem'>
    <div
      class='align-items-center border-1 border-round-xl flex h-full justify-content-center shadow-1 surface-border widget-dropzone'
      @dragenter='emits("drag-widget-enter", $event)'
      @dragleave='emits("drag-widget-leave", $event)'
      @dragover='$event.preventDefault()'
      @drop='emits("drop-widget", "sidebar", index)'>
      <span
        v-if='isNumber(widget)'
        class='align-items-center flex h-full justify-content-center w-full'>
        {{ widget + 1 }}
      </span>
      <div
        v-else
        class='align-items-center flex flex-column h-full justify-content-between p-2 w-full'>
        <div class='align-self-start column-gap-2 flex flex-row'>
          <AppIcon
            :name='WIDGET_CONFIGS[camelCase(widget.code)].icon'
            size='1.5'/>
          <span class='word-break-break-word'>{{ t(`dashboardWidget.widgets.${camelCase(widget.code)}`) }}</span>
        </div>

        <div class='align-self-start w-full'>
          <Skeleton
            v-for='idx in range( 2)'
            :key='idx'
            animation='none'
            class='align-self-start h-1rem my-2'
            :width='randomSkeleton(50, 90, "%")'></Skeleton>
        </div>

        <ButtonIcon
          v-tooltip='t("common.remove")'
          class='p-1'
          icon='close'
          icon-size='1.5'
          rounded
          severity='danger'
          text
          @click='emits("remove-selected-widget","sidebar", index)'/>
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
  sidebarDashboardWidgets: {
    type: Array as PropType<number[] | Widget[]>,
    default: () => []
  }
});

const emits = defineEmits(['remove-selected-widget', 'drag-widget-enter', 'drag-widget-leave', 'drop-widget']);

const { t } = useI18n();

</script>

<script lang='ts'>
export default { name: 'SystemDashboardWidgetSidebarItem' };
</script>