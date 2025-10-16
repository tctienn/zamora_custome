<template>
  <div
    v-if='meeting?.content'
    class='border-left-2 pl-2'
    :class='getBorderColor(meeting)'>
    <div class='font-bold mb-2'>
      {{ meeting?.content }}
    </div>
    <div class='align-items-center flex'>
      <div class='flex flex-column gap-1 w-8'>
        <div class='align-items-center flex'>
          <AppIcon
            class='mr-1'
            name='schedule'
            size='1.5'
            text/>
          <span class='text-600'>{{ moment(meeting?.startTime).format('HH:mm') }} -
            {{ moment(meeting?.endTime).format('HH:mm') }}</span>
        </div>
        <div class='align-items-center flex'>
          <AppIcon
            class='mr-1'
            name='place'
            size='1.5'
            text/>
          <span class='font-semibold'>{{ meeting?.meetingRoom?.name }} </span>
        </div>
      </div>
      <div class='ml-3'>
        <AppGroupAvatar
          avatar-size='2.5'
          :number-avatar-display='3'
          :user-ids='[meeting?.hostId, ...meeting?.attendees?.map((x: any) => x.userId)]'
          :users-highlight='[meeting?.hostId]'/>
      </div>
    </div>
  </div>
</template>

<script lang='ts' setup>
import { computed, type PropType } from 'vue';

import type { MeetingInterface } from '@/apps/meeting/model/meeting';
import AppGroupAvatar from '@/common/components/app/AppGroupAvatar.vue';
import AppIcon from '@/common/components/app/AppIcon.vue';
import useMoment from '@/common/helpers/mixins/use-moment';

const props = defineProps({
  meeting: {
    type: Object as PropType<MeetingInterface>,
    required: true,
  },
});
const { moment } = useMoment();
const meeting = computed(() => props.meeting);

const getBorderColor = (meeting: MeetingInterface): string => {
  const now = new Date();
  const startTime = new Date(meeting.startTime);
  const endTime = meeting.endTime ? new Date(meeting.endTime) : null;

  if (endTime && now > startTime && now < endTime) {
    return 'border-blue-500';
  }
  if (startTime > now && startTime.toDateString() === now.toDateString()) {
    return 'border-orange-500';
  }
  return '';
};
</script>

<style scoped></style>
