<template>
  <slot
    :class='`status-badge ${classDefault}` '
    :diff='diffValue'
    :text='textDefault'>
    <span
      v-if='diffValue !=undefined'
      class='status-badge'
      :class='classDefault'>
      {{ textDefault }}
    </span>
  </slot>
</template>

<script lang='ts' setup>
import { storeToRefs } from 'pinia';
import { computed, type PropType } from 'vue';

import { StatusType } from '@/apps/work/model/configWorkStatus';
import { useTaskStore } from '@/apps/work/store/task';
import useMoment from '@/common/helpers/mixins/use-moment';

const props = defineProps({
  start: {
    type: [String, Date] as PropType<string | Date>,
    default: undefined
  },
  end: {
    type: [String, Date] as PropType<string | Date>,
    default: undefined
  },
  unit: {
    type: String as PropType<'days'>,
    default: 'days'
  },
  onTimeText: {
    type: Function as PropType<(data: number, defaultText: string) => string>,
    default: () => 'Hôm nay'
  },
  onGoingText: {
    type: Function as PropType<(data: number, defaultText: string) => string>,
    default: (data: number) => `Còn ${data} ngày`
  },
  overdueText: {
    type: Function as PropType<(data: number, defaultText: string) => string>,
    default: (data: number) => `Quá ${data} ngày`
  },
  isComplete: {
    type: Boolean,
    default: false
  }
});
const { moment } = useMoment();
const {
  mapStatuses,
  statuses,
  filterStatusId,
  mapStatusesCount
} = storeToRefs(useTaskStore());

// const diff = computed(() => {
//   const start = moment(props.start);
//   const end = moment(props.end);
//   return end.isValid() ? end.diff(start, props.unit) : undefined;
// });

const diffValue = computed(() => {
  const start = moment(props.start);
  const end = moment(props.end);

  if (!end.isValid() || !start.isValid()) {
    return undefined;
  }

  const diffHours = end.diff(start, 'hours');
  const diffDays = end.diff(start, 'days', true); // lấy số ngày với phần thập phân

  return {
    hours: diffHours,
    days: Math.floor(diffDays),
    isInHour: Math.abs(diffDays) < 1
  };
});

const classDefault = computed(() => {
  if (!diffValue.value) {
    return '';
  }
  const value = diffValue.value.isInHour ? diffValue.value.hours : diffValue.value.days;

  if (value == 0) {
    return 'on-time';
  }
  if (value > 0) {
    return 'on-going';
  }
  return 'overdue';
});

const textDefault = computed(() => {
  if (!diffValue.value) {
    return '';
  }

  const {
    isInHour,
    hours,
    days
  } = diffValue.value;
  const value = isInHour ? hours : days;

  if (value === 0) {
    return props.isComplete ? 'Đúng hạn' : props.onTimeText(value, 'Hôm nay');
  } else if (value > 0) {
    return isInHour
      ? `Còn ${value} giờ`
      : props.onGoingText(value, `Còn ${value} ngày`);
  } else {
    const absValue = Math.abs(value);
    return isInHour
      ? `Quá ${absValue} giờ`
      : props.overdueText(absValue, `Quá ${absValue} ngày`);
  }
});
</script>

<style scoped>
.overdue {
  background: var(--red-300);
  color: rgba(255, 255, 255, .87);
}

.on-going, .on-time {
  background: var(--green-300);
  color: rgba(255, 255, 255, .87);
}

</style>