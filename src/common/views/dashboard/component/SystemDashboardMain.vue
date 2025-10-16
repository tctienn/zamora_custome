<template>
  <div class='grid-widget m-0'>
    <component
      :is='`${upperFirst(camelCase(widget.code))}Widget`'
      v-for='widget in fillMissingOrders(mainWidgets)'
      :key='widget.code'
      :widget='widget'>
    </component>
  </div>
</template>

<script setup lang='ts'>
import { camelCase, upperFirst } from 'lodash';
import { type PropType } from 'vue';
import { useI18n } from 'vue-i18n';

import type { WidgetInstance } from '@/common/model';

defineProps({
  mainWidgets: {
    type: Array as PropType<WidgetInstance[]>,
    default: () => []
  }
});

const { t } = useI18n();

function fillMissingOrders(widgets: WidgetInstance[]): WidgetInstance[] {
  const maxOrder = Math.max(...widgets.map((widget) => widget.order));
  const existingOrders = new Set(widgets.map((widget) => widget.order));
  const clonedWidgets = [...widgets];
  for (let i = 1; i <= maxOrder; i++) {
    if (!existingOrders.has(i)) {
      clonedWidgets.push({
        code: 'BLANK',
        order: i,
        recordNumber: 0
      });
    }
  }
  clonedWidgets.sort((a, b) => a.order - b.order);

  return clonedWidgets;
}
</script>

<script lang='ts'>
import * as Widgets from '@/common/views/dashboard/widgets';

export default {
  name: 'SystemDashboardMain',
  components: { ...Widgets }
};
</script>

<style scoped>
.grid-widget {
  display: grid;
  grid-template-columns: repeat(2, minmax(300px, 1fr));
  gap: 1rem;
}
</style>