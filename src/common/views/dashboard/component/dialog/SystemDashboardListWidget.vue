<template>
  <div class='flex flex-column flex-grow-1 py-2 row-gap-3'>
    <span class='font-bold text-lg'>{{ t('dashboardWidget.listWidget') }}</span>

    <div class='relative'>
      <ButtonIcon
        class='-translate-y-50 absolute mx-2 right-0 top-50'
        icon='search'
        icon-size='2'
        rounded
        text/>
      <InputText
        v-model='searchKeyword'
        class='pr-6 w-full'/>
    </div>

    <div class='h-30rem overflow-y-auto'>
      <Accordion
        :active-index='[...Array(Object.keys(widgets).length).keys()]'
        :multiple='true'>
        <AccordionTab
          v-for='app in Object.keys(widgets)'
          :key='app'
          :header='getAppName(app)'>
          <template
            v-for='widget in widgets[app]'
            :key='widget.code'>
            <div
              v-if='convertAlias(t(`dashboardWidget.widgets.${camelCase(widget.code)}`)).includes(convertAlias(searchKeyword))'
              class='align-items-center column-gap-2 flex flex-row'
              :class='checkSelectedWidget(widget) ? "opacity-50" : "cursor-pointer"'
              :draggable='!checkSelectedWidget(widget)'
              @dragstart='emits("drag-widget", widget)'>
              <AppIcon
                :name='WIDGET_CONFIGS[camelCase(widget.code)]?.icon'
                size='2'/>
              <span class='word-break-break-word'>
                {{ t(`dashboardWidget.widgets.${ camelCase(widget.code) }`) }}
              </span>
            </div>
          </template>
        </AccordionTab>
      </Accordion>
    </div>
  </div>
</template>

<script setup lang='ts'>
import { camelCase, find, groupBy, map } from 'lodash';
import { computed, type PropType, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { WIDGET_CONFIGS } from '@/common/constants/widget';
import { convertAlias } from '@/common/helpers/utils';
import type { Widget } from '@/common/model';
import { useMenuStore } from '@/common/store/menu';

const props = defineProps({
  mainDashboardWidgets: {
    type: Array as PropType<number[] | Widget[]>,
    default: () => []
  },
  sidebarDashboardWidgets: {
    type: Array as PropType<number[] | Widget[]>,
    default: () => []
  },
  configuredWidgets: {
    type: Array as PropType<Widget[]>,
    default: () => []
  },
});

const emits = defineEmits(['drag-widget']);
const { configuredApps } = useMenuStore();

const { t } = useI18n();

const searchKeyword = ref('');

const widgets = computed<{
  [key: string]: Widget[]
}>(() => groupBy(props.configuredWidgets.filter(w => !configuredApps
  || w.app === 'DASHBOARD'
  || configuredApps.find(a => a.code == w.app)), 'app'));

function getAppName(app: string) {
  return app === 'OTHER' ? t('widget.other') : find(configuredApps, ['code', app])?.name ?? app;
}

function checkSelectedWidget(widget: Widget) {
  return map([...props.mainDashboardWidgets, ...props.sidebarDashboardWidgets], 'code').includes(widget.code);
}
</script>

<script lang='ts'>
export default { name: 'SystemDashboardListWidget' };
</script>