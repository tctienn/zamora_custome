<template>
  <div class='column-gap-2 flex flex-row h-full'>
    <div class='flex flex-column flex-grow-1'>
      <SystemDashboardHeader
        :chart-dashboard-visible='chartDashboardVisible'
        @show-widget-dialog='systemDashboardWidgetDialogVisible = true'
        @toggle-chart-widget='(visible) => chartDashboardVisible = visible'/>

      <!--      <SystemDashboardChartWidget :visible='chartDashboardVisible'/>-->

      <SystemDashboardMain :main-widgets='mainDashboardWidgets'/>
    </div>

    <SystemDashboardSidebar
      v-if='sidebarDashboardWidgets.length'
      :sidebar-widgets='sidebarDashboardWidgets'/>
  </div>

  <SystemDashboardWidgetDialog
    v-if='systemDashboardWidgetDialogVisible'
    :configured-widgets='configuredWidgets'
    :dialog-visible='systemDashboardWidgetDialogVisible'
    :main-widgets='mainDashboardWidgets'
    :sidebar-widgets='sidebarDashboardWidgets'
    @hide-dialog='systemDashboardWidgetDialogVisible = false'
    @reload-widget='reloadWidget'/>
</template>

<script setup lang='ts'>

import { find, forEach, get, orderBy } from 'lodash';
import { ref } from 'vue';

import { getUserWidgetGraphql, getWidgetsGraphql } from '@/common/api/graphql/widget-graphql-api';
import type { Widget, WidgetInstance } from '@/common/model';
import SystemDashboardWidgetDialog from '@/common/views/dashboard/component/dialog/SystemDashboardWidgetDialog.vue';
import SystemDashboardHeader from '@/common/views/dashboard/component/SystemDashboardHeader.vue';
import SystemDashboardMain from '@/common/views/dashboard/component/SystemDashboardMain.vue';
import SystemDashboardSidebar from '@/common/views/dashboard/component/SystemDashboardSidebar.vue';

const systemDashboardWidgetDialogVisible = ref(false);
const chartDashboardVisible = ref(true);
const configuredWidgets = ref<Widget[]>([]);
const mainDashboardWidgets = ref<WidgetInstance[]>([]);
const sidebarDashboardWidgets = ref<WidgetInstance[]>([]);

const { onResult: getWidgetsResult } = getWidgetsGraphql();
const { onResult: getUserWidgetResult, refetch: getUserWidgetRefetch, load: getUserWidgetLoad } = getUserWidgetGraphql();

getWidgetsResult((response) => {
  configuredWidgets.value = get(response, 'data.widgets', []);
  getUserWidgetLoad();
});

getUserWidgetResult((response) => {
  const {
    mainWidgets,
    sidebarWidgets
  } = get(response, 'data.userWidget') || {
    mainWidgets: [],
    sidebarWidgets: []
  };

  mainDashboardWidgets.value = orderBy(mapWidgetInstance(mainWidgets), ['order']);
  sidebarDashboardWidgets.value = orderBy(mapWidgetInstance(sidebarWidgets), ['order']);
});

function mapWidgetInstance(instances: WidgetInstance[]) {
  let widgetInstances: WidgetInstance[] = [];
  forEach(instances, (instance) => {
    const widget = find(configuredWidgets.value, { code: instance.code });
    if (widget) {
      widgetInstances.push({
        code: widget.code,
        order: instance.order,
        recordNumber: widget.recordNumber
      });
    }
  });

  return widgetInstances;
}

function reloadWidget() {
  getUserWidgetRefetch();
}
</script>

<script lang='ts'>
export default { name: 'SystemDashboard' };
</script>