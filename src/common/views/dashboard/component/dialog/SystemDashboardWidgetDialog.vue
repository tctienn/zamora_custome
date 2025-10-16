<template>
  <Dialog
    v-bind='DEFAULT_DIALOG_CONFIG'
    v-model:visible='visible'
    :header="`${t('common.select')} ${t('common.widget').toLowerCase()}`"
    style='width: 75%; max-width: 90%'
    @hide="emits('hide-dialog')">
    <div
      class='column-gap-1 flex flex-row select-none'
      style='max-height: calc(100vh - 20rem)'>
      <div class='col-9 flex gap-4 grid-nogutter overflow-auto p-0'>
        <div class='col-9 flex flex-column row-gap-3'>
          <span class='font-bold text-lg'>{{
            t("dashboardWidget.mainDashboard")
          }}</span>
          <div class='grid'>
            <SystemDashboardWidgetMainItem
              :main-dashboard-widgets='mainDashboardWidgets'
              @drag-widget-enter='dragWidgetEnter'
              @drag-widget-leave='dragWidgetLeave'
              @drop-widget='dropWidget'
              @remove-selected-widget='removeSelectedWidget'/>
          </div>
        </div>

        <div class='col flex flex-column row-gap-3'>
          <span class='font-bold text-lg'>{{
            t("dashboardWidget.sidebarDashboard")
          }}</span>
          <div class='flex flex-column row-gap-3'>
            <SystemDashboardWidgetSidebarItem
              :sidebar-dashboard-widgets='sidebarDashboardWidgets'
              @drag-widget-enter='dragWidgetEnter'
              @drag-widget-leave='dragWidgetLeave'
              @drop-widget='dropWidget'
              @remove-selected-widget='removeSelectedWidget'/>
          </div>
        </div>
      </div>

      <Divider
        class='mx-1'
        layout='vertical' />

      <SystemDashboardListWidget
        :configured-widgets='configuredWidgets'
        :main-dashboard-widgets='mainDashboardWidgets'
        :sidebar-dashboard-widgets='sidebarDashboardWidgets'
        @drag-widget='dragWidget'/>
    </div>

    <template #footer>
      <DialogFooter />
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { cloneDeep, filter, find, forEach, isNumber, map } from 'lodash';
import { type PropType, provide, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { saveUserWidgetGraphql } from '@/common/api/graphql/widget-graphql-api';
import DialogFooter from '@/common/components/dialog/DialogFooter.vue';
import {
  DEFAULT_DIALOG_CONFIG,
  MAIN_DASHBOARD_WIDGET_NUMBER,
  SIDEBAR_DASHBOARD_WIDGET_NUMBER,
} from '@/common/constants';
import { toastSuccess } from '@/common/helpers/custom-toast-service';
import type { Widget, WidgetInstance } from '@/common/model';
import SystemDashboardListWidget from '@/common/views/dashboard/component/dialog/SystemDashboardListWidget.vue';
import SystemDashboardWidgetMainItem from '@/common/views/dashboard/component/dialog/SystemDashboardWidgetMainItem.vue';
import SystemDashboardWidgetSidebarItem from '@/common/views/dashboard/component/dialog/SystemDashboardWidgetSidebarItem.vue';

const props = defineProps({
  dialogVisible: {
    type: Boolean,
    default: false,
  },
  mainWidgets: {
    type: Array as PropType<WidgetInstance[]>,
    default: () => [],
  },
  sidebarWidgets: {
    type: Array as PropType<WidgetInstance[]>,
    default: () => [],
  },
  configuredWidgets: {
    type: Array as PropType<Widget[]>,
    default: () => [],
  },
});
const emits = defineEmits(['hide-dialog', 'reload-widget']);

const visible = ref(props.dialogVisible);

const { t } = useI18n();

const mainDashboardWidgets = ref<number[] | Widget[]>(
  mergePropWidgets(
    [...Array(MAIN_DASHBOARD_WIDGET_NUMBER).keys()],
    props.mainWidgets,
  ),
);
const sidebarDashboardWidgets = ref<number[] | Widget[]>(
  mergePropWidgets(
    [...Array(SIDEBAR_DASHBOARD_WIDGET_NUMBER).keys()],
    props.sidebarWidgets,
  ),
);

function mergePropWidgets(
  dashboardWidgets: number[] | Widget[],
  widgets: WidgetInstance[],
) {
  forEach(dashboardWidgets, (dw) => {
    if (isNumber(dw)) {
      const existWidget = find(widgets, ['order', dw + 1]);
      if (existWidget) {
        dashboardWidgets[dw] = {
          code: existWidget.code,
          app: '',
        };
      }
    }
  });

  return dashboardWidgets;
}

const systemDashboardWidgetDialogFooterButtons = {
  closeButton: {
    icon: 'close',
    label: t('common.close'),
    text: true,
    severity: 'danger',
    type: 'button',
    command: () => emits('hide-dialog'),
  },
  actionButton: {
    icon: 'check',
    label: t('common.save'),
    text: false,
    type: 'button',
    command: () => saveWidgetConfig(),
  },
};
provide('dialogFooterButtons', systemDashboardWidgetDialogFooterButtons);

const selectedWidget = ref<Widget>({} as Widget);

function dragWidget(widget: Widget) {
  selectedWidget.value = widget;
}

function dragWidgetEnter(event: DragEvent) {
  event.preventDefault();
  if (selectedWidget.value) {
    const widgetZone = (event.target as HTMLElement).closest(
      '.widget-dropzone',
    );
    if (widgetZone) {
      widgetZone.classList.remove('surface-border');
      widgetZone.classList.add('border-primary', 'widget-dropzone-highlight');
    }
  }
}

function dragWidgetLeave(event: DragEvent) {
  event.preventDefault();
  if (selectedWidget.value) {
    if (
      event.target
      && (event.target as HTMLElement).classList.contains('widget-dropzone')
    ) {
      (event.target as HTMLElement).classList.add('surface-border');
      (event.target as HTMLElement).classList.remove(
        'border-primary',
        'widget-dropzone-highlight',
      );
    }
  }
}

function dropWidget(type: string, index: number) {
  if (type === 'main') {
    const clonedMainDashboardWidgets = cloneDeep(mainDashboardWidgets.value);
    clonedMainDashboardWidgets[index] = selectedWidget.value;
    mainDashboardWidgets.value = clonedMainDashboardWidgets;
  } else {
    const clonedSidebarDashboardWidgets = cloneDeep(
      sidebarDashboardWidgets.value,
    );
    clonedSidebarDashboardWidgets[index] = selectedWidget.value;
    sidebarDashboardWidgets.value = clonedSidebarDashboardWidgets;
  }

  selectedWidget.value = {} as Widget;
}

function removeSelectedWidget(type: string, index: number) {
  if (type === 'main') {
    const clonedMainDashboardWidgets = cloneDeep(mainDashboardWidgets.value);
    clonedMainDashboardWidgets[index] = index;
    mainDashboardWidgets.value = clonedMainDashboardWidgets;
  } else {
    const clonedSidebarDashboardWidgets = cloneDeep(
      sidebarDashboardWidgets.value,
    );
    clonedSidebarDashboardWidgets[index] = index;
    sidebarDashboardWidgets.value = clonedSidebarDashboardWidgets;
  }
}

function saveWidgetConfig() {
  const { mutate: saveUserWidgetMutate, onDone: saveUserWidgetDone } =
    saveUserWidgetGraphql();
  const mainWidgetInstances = getWidgetInstance(mainDashboardWidgets.value);
  const sidebarWidgetInstances = getWidgetInstance(
    sidebarDashboardWidgets.value,
  );

  saveUserWidgetMutate({
    mainWidgetInstances,
    sidebarWidgetInstances,
  });

  saveUserWidgetDone(() => {
    emits('hide-dialog');
    emits('reload-widget');
    toastSuccess();
  });
}

function getWidgetInstance(widgets: Widget[] | number[]) {
  return filter(
    map(widgets, (widget, index) => {
      if (!isNumber(widget)) {
        return {
          code: (widget as Widget).code,
          order: index + 1,
        };
      }
      return widget;
    }),
    (widget) => !isNumber(widget),
  );
}
</script>

<script lang="ts">
export default { name: 'SystemDashboardWidgetDialog' };
</script>

<style scoped lang="scss">
:deep(.p-accordion) {
  .p-accordion-tab {
    margin-bottom: 2rem;

    .p-accordion-header {
      .p-accordion-header-link.p-accordion-header-action {
        padding: 0.5rem;
        background-color: transparent;
        border: none;
        box-shadow: none;
      }
    }

    .p-toggleable-content {
      .p-accordion-content {
        border: none;
        display: flex;
        flex-direction: column;
        padding: 0.5rem 2rem;
        row-gap: 0.5rem;
      }
    }
  }
}

:deep(.widget-dropzone) {
  &.widget-dropzone-highlight {
    & * {
      pointer-events: none;
    }
  }
}
</style>
