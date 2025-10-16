<template>
  <div class='flex flex-column h-full overflow-hidden'>
    <EcmGroupWidgetHeader
      :left-button='headerButton'
      :title='t("ecm.group.eventWidget.deletedEvents")'/>

    <div class='flex flex-column mt-3 overflow-hidden row-gap-3'>
      <EcmGroupEventFilter :filter-type-visible='false' />

      <div class='flex flex-column overflow-y-auto row-gap-3'>
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
  deletedEvents: {
    type: Array as PropType<Event[]>,
    default: () => []
  }
});

const groupedEvents = computed(() => groupBy(props.deletedEvents, 'date'));

const { t } = useI18n();

const headerButton = {
  icon: 'arrow_back',
  label: t('common.back'),
  command: () => {
    EventBus.emit('ecm-group-change-event-viewer-type', { type: 'EcmGroupEventWidget' });
  }
};
</script>

<script lang='ts'>
export default { name: 'EcmGroupEventWidgetTrash' };
</script>