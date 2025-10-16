<template>
  <div
    class='column-gap-2 flex flex-row flex-shrink-0 justify-content-between ml-auto widget-sidebar'
    :class='expandedSidebar ? "lg:w-25rem w-17rem" : ""'>
    <div
      class='border-round flex-grow-1 h-full surface-border surface-hover w-0 widget-content'
      :class='expandedSidebar ? "border-1 p-2" : "p-0"'>
      <component
        :is='widgetComponent'
        v-if='widgetComponent && expandedSidebar'
        @select-widget='selectWidget'/>
    </div>

    <EcmGroupSidebarMenu
      :expanded-sidebar='expandedSidebar'
      :widget-component='widgetComponent'
      @select-widget='selectWidget'
      @toggle-expand-sidebar='toggleExpandSidebar'/>
  </div>
</template>

<script setup lang='ts'>
import { provide, ref, watch } from 'vue';

import EcmGroupSidebarMenu from '@/apps/ecm/views/group-documents/components/sidebar/EcmGroupSidebarMenu.vue';

const emits = defineEmits(['toggle-sidebar']);
const expandedSidebar = ref(true);
const widgetComponent = ref('EcmGroupMainSidebar');

function toggleExpandSidebar(component: string) {
  expandedSidebar.value = !expandedSidebar.value;
  widgetComponent.value = expandedSidebar.value ? component : '';
}

function selectWidget(widget: { label: string, icon: string, key: string, component: string }) {
  expandedSidebar.value = true;
  widgetComponent.value = widget.component;
}

function backToMainSidebar() {
  widgetComponent.value = 'EcmGroupMainSidebar';
}

provide('back-main-sidebar', backToMainSidebar);

watch(() => expandedSidebar.value, () => {
  emits('toggle-sidebar', expandedSidebar.value);
});
</script>

<script lang='ts'>
import EcmGroupMainSidebar from '@/apps/ecm/views/group-documents/components/sidebar/widgets/EcmGroupWidgetSummary.vue';
import EcmGroupEvent
  from '@/apps/ecm/views/group-documents/components/sidebar/widgets/event/EcmGroupEvent.vue';
import EcmGroupNote from '@/apps/ecm/views/group-documents/components/sidebar/widgets/note/EcmGroupNote.vue';
import EcmGroupTopic from '@/apps/ecm/views/group-documents/components/sidebar/widgets/topic/EcmGroupTopic.vue';

export default {
  name: 'EcmGroupSidebar',

  components: {
    EcmGroupMainSidebar,
    EcmGroupEvent,
    EcmGroupTopic,
    EcmGroupNote,
  }
};
</script>