<template>
  <Divider />
  <div class='grid p-2'>
    <div class='col-3'>
      <div
        class='font-bold text-lg'
        :class="{
          'text-blue-500': moment(props.data[0]?.key).isSame(moment(), 'day'),
        }">
        {{ getDayOfWeek(props.data[0]?.key) }}
      </div>
      <div class='mt-2 text-base'>
        Ngày {{ moment(props.data[0]?.key).format("DD/MM/YYYY") }}
      </div>
    </div>
    <div class='col-9'>
      <div
        v-for='(item, i) in props.data'
        :key='i'
        class='border-800 border-left-2 mb-2'>
        <div
          v-if='item.content'
          class='ml-3'>
          <div class='align-items-center flex gap-4'>
            <div class='font-bold text-lg'>
              {{ item.content }}
            </div>
            <div
              v-if='
                item?.meetingType && item?.meetingType !== MeetingType.OFFLINE
              '
              class='cursor-pointer'
              style='margin-top: 3px'>
              <AppIcon
                fill
                name='videocam'
                size='1.5'
                style='color: #0d99ff'
                text/>
            </div>
          </div>

          <div
            class='align-items-center flex justify-content-between mt-2 text-600'>
            <div>
              <div class='align-items-center flex gap-2'>
                <AppIcon
                  name='schedule'
                  size='1.5'
                  text />
                <label class='font-bold'>{{ moment(item.startTime).format("HH:mm") }} -
                  {{ moment(item.endTime).format("HH:mm") }}</label>
              </div>
              <div class='align-items-center flex gap-2'>
                <AppIcon
                  name='location_on'
                  size='1.5'
                  text />
                <label class='font-bold'>{{ item.meetingRoom?.name }}</label>
              </div>
            </div>
            <div class='flex justify-content-center'>
              <AppUser
                overlay-visible
                :user-id='item.hostId' />
            </div>
            <div class='flex justify-content-center'>
              <AppGroupAvatar
                avatar-size='2.5'
                :number-avatar-display='2'
                :user-ids='item.attendees?.map((x: any) => x.userId)'/>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { PropType } from 'vue';

import { MeetingType } from '@/apps/meeting/model/meeting';
import AppGroupAvatar from '@/common/components/app/AppGroupAvatar.vue';
import AppIcon from '@/common/components/app/AppIcon.vue';
import useMoment from '@/common/helpers/mixins/use-moment';

const props = defineProps({
  data: {
    type: Array as PropType<any[]>,
    default: () => [],
  },
});
const { moment } = useMoment();

function getDayOfWeek(dateString: number) {
  const days = [
    'Chủ Nhật',
    'Thứ Hai',
    'Thứ Ba',
    'Thứ Tư',
    'Thứ Năm',
    'Thứ Sáu',
    'Thứ Bảy',
  ];
  const date = new Date(dateString);
  return days[date.getDay()];
}
</script>

<style scoped>
:deep(.col-3) {
  padding: 0.5rem;
}

:deep(.col-9) {
  padding: 0.5rem;
}
</style>
