<template>
  <div class='border-round flex flex-column h-fit mt-2 p-2 row-gap-2 surface-100'>
    <div class='text-center'>
      <ButtonIcon
        class='toggle-sidebar-button'
        :icon='expandedSidebar ? "keyboard_double_arrow_right": "keyboard_double_arrow_left"'
        icon-size='1.5'
        rounded
        text
        @click='emits("toggle-expand-sidebar", sidebarWidgets[0] ?? {})'>
      </ButtonIcon>
    </div>

    <Divider class='border-primary m-0'/>

    <div
      v-for='widget in sidebarWidgets'
      :key='widget.code'
      class='relative'>
      <ButtonIcon
        v-tooltip='t(`dashboardWidget.widgets.${camelCase(widget.code)}`)'
        class='p-2 text-center'
        :icon='WIDGET_CONFIGS[camelCase(widget.code)].icon'
        icon-size='1.5'
        :severity='selectedWidget.code === widget.code ? "primary" : "secondary"'
        text
        @click='emits("select-widget", widget)'/>
      <AppIcon
        v-if='selectedWidget.code === widget.code'
        class='-ml-2 absolute left-0 my-auto'
        name='chevron_left'
        size='1.5'
        style='top: 25%'></AppIcon>
    </div>
  </div>
</template>

<script setup lang='ts'>
import { camelCase } from 'lodash';
import { type PropType } from 'vue';
import { useI18n } from 'vue-i18n';

import { WIDGET_CONFIGS } from '@/common/constants/widget';
import type { WidgetInstance } from '@/common/model';

defineProps({
  expandedSidebar: {
    type: Boolean,
    default: false
  },
  sidebarWidgets: {
    type: Array as PropType<WidgetInstance[]>,
    default: () => []
  },
  selectedWidget: {
    type: Object as PropType<WidgetInstance>,
    default: {} as WidgetInstance
  }
});

const emits = defineEmits(['toggle-expand-sidebar', 'select-widget']);

const { t } = useI18n();

</script>

<script lang="ts">
export default { name: 'SystemDashboardSidebarMenu' };
</script>