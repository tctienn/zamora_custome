<template>
  <div class='flex flex-column h-full overflow-hidden'>
    <EcmGroupWidgetHeader
      icon='calendar_month'
      :right-button='rightButton'
      :title='t("ecm.group.widgets.event")'
      :title-button='titleButton'/>

    <div class='flex flex-column mt-3 overflow-hidden row-gap-3'>
      <EcmGroupEventFilter :filter-type-visible='false'/>

      <div class='flex flex-column overflow-y-auto pr-1 row-gap-3'>
        <template v-if='Object.keys(groupedEvents).length'>
          <EcmGroupEventItem
            v-for='day in Object.keys(groupedEvents)'
            :key='day'
            :day='day'
            :events='groupedEvents[day]' />
        </template>

        <div
          v-else
          class='flex flex-row justify-content-center'>
          <span>{{ t("ecm.group.eventWidget.noEvents") }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang='ts'>
import { groupBy } from 'lodash';
import { computed, type PropType } from 'vue';
import { useI18n } from 'vue-i18n';

import EcmGroupWidgetHeader from '@/apps/ecm/views/group-documents/components/sidebar/widgets/EcmGroupWidgetHeader.vue';
import EcmGroupEventFilter
  from '@/apps/ecm/views/group-documents/components/sidebar/widgets/event/EcmGroupEventFilter.vue';
import EcmGroupEventItem from '@/apps/ecm/views/group-documents/components/sidebar/widgets/event/EcmGroupEventItem.vue';
import EventBus from '@/common/helpers/event-bus';
import type { Event } from '@/common/model/widget/event';

const props = defineProps({
  activeEvents: {
    type: Array as PropType<Event[]>,
    default: () => []
  }
});

const groupedEvents = computed(() => groupBy(props.activeEvents, 'date'));

const { t } = useI18n();

const titleButton = {
  icon: 'add_circle',
  label: t('ecm.group.eventWidget.create'),
  command: () => {
    EventBus.emit('ecm-group-change-event-viewer-type', {
      type: 'EcmGroupSaveEvent',
      item: {} 
    });
  }
};

const rightButton = {
  icon: 'delete',
  label: t('ecm.group.eventWidget.deletedEvents'),
  command: () => {
    EventBus.emit('ecm-group-change-event-viewer-type', { type: 'EcmGroupEventWidgetTrash' });
  }
};

</script>

<script lang='ts'>
export default { name: 'EcmGroupEventWidget' };
</script>