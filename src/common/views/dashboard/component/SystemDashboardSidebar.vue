<template>
  <div class='flex flex-row justify-content-between widget-sidebar'>
    <div
      class='flex-grow-1 w-0 widget-content'
      :class='expandedSidebar ? "md:w-15rem lg:w-21rem" : ""'>
      <component
        :is='`${upperFirst(camelCase(selectedWidget.code))}Widget`'
        v-if='expandedSidebar && selectedWidget'
        :widget='selectedWidget'/>
    </div>

    <SystemDashboardSidebarMenu
      :expanded-sidebar='expandedSidebar'
      :selected-widget='selectedWidget'
      :sidebar-widgets='sidebarWidgets'
      @select-widget='selectWidget'
      @toggle-expand-sidebar='toggleExpandSidebar'/>
  </div>
</template>

<script setup lang='ts'>
import { camelCase, upperFirst } from 'lodash';
import { type PropType, provide, ref, watch } from 'vue';

import type { WidgetInstance } from '@/common/model';
import SystemDashboardSidebarMenu from '@/common/views/dashboard/component/SystemDashboardSidebarMenu.vue';

const props = defineProps({
  sidebarWidgets: {
    type: Array as PropType<WidgetInstance[]>,
    default: () => []
  }
});

provide('is-sidebar-widget', true);

const expandedSidebar = ref(props.sidebarWidgets?.length > 0);
const selectedWidget = ref<WidgetInstance>(props.sidebarWidgets[0] ?? {});

watch(() => props.sidebarWidgets, () => {
  selectedWidget.value = props.sidebarWidgets[0] ?? {};
  expandedSidebar.value = props.sidebarWidgets?.length > 0;
});

function toggleExpandSidebar(widget: WidgetInstance) {
  expandedSidebar.value = !expandedSidebar.value;
  selectedWidget.value = expandedSidebar.value ? widget : {} as WidgetInstance;
}

function selectWidget(widget: WidgetInstance) {
  expandedSidebar.value = true;
  selectedWidget.value = widget;
}
</script>

<script lang='ts'>
import * as Widgets from '@/common/views/dashboard/widgets';

export default {
  name: 'SystemDashboardSidebar',
  components: { ...Widgets }
};
</script>