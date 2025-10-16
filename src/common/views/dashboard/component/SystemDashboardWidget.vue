<template>
  <div
    class='col-12 xl:col'
    :class='{"h-20rem": !isSidebarWidget}'>
    <div
      class='card flex flex-column h-full overflow-hidden'>
      <div class='flex flex-row justify-content-between'>
        <div class='align-items-center bo column-gap-2 flex flex-row'>
          <AppIcon
            class='align-self-start'
            :name='WIDGET_CONFIGS[camelCase(widget.code)]?.icon'
            size='2'/>
          <div class='flex flex-column'>
            <span class='font-bold line-number-1 text-lg'>{{
              t(`dashboardWidget.widgets.${ camelCase(widget.code) }`)
            }}</span>

            <div class='font-italic opacity-80 text-sm'>
              <slot name='sub-header'></slot>
            </div>
          </div>
        </div>

        <div class='align-self-start'>
          <slot name='header-action'></slot>
        </div>
      </div>

      <div class='flex flex-column h-full overflow-y-auto row-gap-2'>
        <slot name='body'></slot>
      </div>

      <slot name='footer'></slot>
    </div>
  </div>
</template>

<script setup lang='ts'>
import { camelCase } from 'lodash';
import { inject, type PropType } from 'vue';
import { useI18n } from 'vue-i18n';

import { WIDGET_CONFIGS } from '@/common/constants/widget';
import type { WidgetInstance } from '@/common/model';

defineProps({
  widget: {
    type: Object as PropType<WidgetInstance>,
    default: {} as WidgetInstance
  }
});

const isSidebarWidget = inject('is-sidebar-widget', false);

const { t } = useI18n();

</script>

<script lang='ts'>
export default { name: 'SystemDashboardWidget' };
</script>