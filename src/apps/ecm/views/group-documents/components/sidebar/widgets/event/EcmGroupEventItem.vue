<template>
  <div class='flex flex-column row-gap-2'>
    <span class='font-bold'>{{ capitalize(moment(day).format("dddd, DD/MM/YYYY")) }}</span>

    <div class='flex flex-column row-gap-2'>
      <div
        v-for='event in events'
        :key='event.id'
        class='border-1 border-round cursor-pointer flex flex-column hover:surface-200 p-2 pr-5 relative row-gap-2 surface-100 surface-border'>

        <div
          class='align-items-center column-gap-3 flex flex-row sm:flex-wrap sm:row-gap-2 w-full'
          @click.self='EventBus.emit("ecm-group-change-event-viewer-type", {type: "EcmGroupEventInfo", item: event})'>
          <span class='line-number-2 word-break-break-word'>{{ event.name }}</span>

          <div class='align-items-center column-gap-2 flex flex-row'>
            <AppGroupAvatar
              avatar-size='1.75'
              :user-ids='event.participants'/>
          </div>
        </div>

        <div class='column-gap-3 flex flex-row flex-wrap w-full'>
          <span>
            {{ t("ecm.group.eventWidget.atTime", {time: event.toAt ? `${event.fromAt} - ${event.toAt}`: event.fromAt}) }}
          </span>
          <span class='line-number-2'>
            {{ t("ecm.group.eventWidget.atLocation", {location: event.location}) }}
          </span>
          <span>
            <AppIcon
              v-if='event.attachments?.length>0'
              name='attachment'
              size='1.5'
              text/>
          </span>
        </div>

        <div
          v-if='!viewOnly'
          class='absolute flex flex-column right-0 row-gap-2 top-0'>
          <ButtonIcon
            v-if='event.isDeleted'
            v-tooltip='t("ecm.group.eventWidget.restore")'
            icon='replay'
            text
            @click.prevent='EventBus.emit("ecm-group-restore-event", event.id)'/>

          <ButtonIcon
            v-tooltip='t(`ecm.group.eventWidget.${event.isDeleted ? "remove" : "delete"}`)'
            icon='close'
            text
            @click.prevent='EventBus.emit(event.isDeleted ? "ecm-group-remove-event" : "ecm-group-delete-event", event.id)'/>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang='ts'>
import { capitalize, type PropType } from 'vue';
import { useI18n } from 'vue-i18n';

import AppGroupAvatar from '@/common/components/app/AppGroupAvatar.vue';
import EventBus from '@/common/helpers/event-bus';
import useMoment from '@/common/helpers/mixins/use-moment';
import type { Event } from '@/common/model/widget/event';

defineProps({
  day: {
    type: String,
    default: ''
  },
  events: {
    type: Array as PropType<Event[]>,
    default: () => []
  },
  viewOnly: {
    type: Boolean,
    default: false
  }
});

const { t } = useI18n();
const { moment } = useMoment();

</script>

<script lang='ts'>
export default { name: 'EcmGroupEventItem' };
</script>