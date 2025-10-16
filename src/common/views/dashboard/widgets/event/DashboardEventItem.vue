<template>
  <div class='flex flex-column m-0 row-gap-2'>
    <span class='font-bold'>{{ capitalize(moment(day).format('dddd, DD/MM/YYYY')) }}</span>

    <div class='flex flex-column row-gap-2'>
      <div
        v-for='event in events'
        :key='event.id'
        class='border-round flex flex-column p-2 relative surface-300'>
        <div class='font-bold'> {{ event.name }}</div>
        <div>
          {{ t('widget.event.time') }}: {{ event.fromAt }}
          <template v-if='event.toAt'>
            - {{ event.toAt }}
          </template>
        </div>

        <div
          v-if='event.host'
          class='align-items-center flex gap-2'>
          {{ t('widget.event.host') }}:
          <AppUser
            avatar-only
            avatar-size='1.5'
            overlay-visible
            :user-id='event.host'/>
        </div>
        <div
          v-if='event.participants?.length'
          class='align-items-center flex gap-2'>
          {{ t('widget.event.participant') }}:
          <AppGroupAvatar
            avatar-size='1.5'
            :user-ids='event.participants'/>
        </div>
        <div v-if='event.location'>
          {{ t('widget.event.location') }}:
          {{ event.location }}
        </div>

        <span v-if='event.type === EventType[EventType.GROUP]'>
          ({{ t(`common.${ camelCase(event.type.toString()) }`) }}
          <router-link
            class='align-self-end font-bold underline'
            target='_blank'
            :to='{name: "EcmGroupMainPage", params: {id: event.subjectId}}'>{{ event.subjectName }}
          </router-link>
          )
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang='ts'>
import { camelCase } from 'lodash';
import { capitalize, type PropType } from 'vue';
import { useI18n } from 'vue-i18n';

import AppGroupAvatar from '@/common/components/app/AppGroupAvatar.vue';
import AppUser from '@/common/components/app/AppUser.vue';
import useMoment from '@/common/helpers/mixins/use-moment';
import { type Event, EventType } from '@/common/model/widget/event';

defineProps({
  events: {
    type: Array as PropType<Event[]>,
    default: () => []
  },
  day: {
    type: String,
    default: ''
  }
});
const { moment } = useMoment();
const { t } = useI18n();

</script>

<script lang='ts'>
export default { name: 'DashboardEventItem' };
</script>
