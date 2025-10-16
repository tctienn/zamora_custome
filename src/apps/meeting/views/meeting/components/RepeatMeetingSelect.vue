<template>
  <div
    v-if='repeatType==RepeatMeeting.WEEKLY_REPEAT||repeatType==RepeatMeeting.MONTHLY_REPEAT'
    class='flex justify-content-between mb-2'>
    <label class='font-bold'>
      {{ label }}
    </label>
    <AppIcon
      v-tooltip.top="'Xoá toàn bộ'"
      class='cursor-pointer'
      name='close'
      size='1.2rem'
      text
      @click='reset'>
    </AppIcon>
  </div>
  <div
    v-if='repeatType==RepeatMeeting.WEEKLY_REPEAT'
    class='grid mt-1 p-component'
    @mousedown='startSelection'
    @mouseup='endSelection'>
    <div
      v-for='(option,idx) in optionsWeekly'
      :key='option.value'
      :class="`border-round-sm col flex justify-content-center align-items-center text-sm ${optionsWeekly[idx].checked?'bg-primary':'' } cell`"
      @mousedown='chooseWeekDay(idx)'
      @mouseover='selectCell($event,optionsWeekly[idx])'>
      {{ optionsWeekly[idx].label }}
    </div>
  </div>
  <div
    v-if='repeatType==RepeatMeeting.MONTHLY_REPEAT'
    class='grid mt-1 p-component'
    @mousedown='startSelection'
    @mouseup='endSelection'>
    <div
      v-for='(_,idxMonth) in optionsMonthly'
      :key='idxMonth'
      class='flex flex-row'>
      <div
        v-for='(option,idx) in optionsMonthly[idxMonth]'
        :key='option.value'
        :class="`border-round-sm flex justify-content-center align-items-center col text-sm ${optionsMonthly[idxMonth][idx].checked?'bg-primary':'' } cell`"
        @mousedown='chooseMonthDay(idxMonth,idx)'
        @mouseover='selectCell($event,optionsMonthly[idxMonth][idx])'>
        {{ optionsMonthly[idxMonth][idx].value }}
      </div>
    </div>

  </div>
</template>

<script setup lang='ts'>

import { computed, type PropType, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { RepeatMeeting } from '@/apps/meeting/model/meeting';

const props = defineProps({
  repeatType: {
    type: String as PropType<RepeatMeeting>,
    required: true
  },
});
watch(() => props.repeatType, () => {
  cron.value = undefined;
  isSelecting.value = false;
});
const { t } = useI18n();
const cron = defineModel<string>();
const label = computed<string>(() => {
  if (props.repeatType == RepeatMeeting.WEEKLY_REPEAT) {
    return t('meeting.common.repeat.weeklyChoose');
  } else if (props.repeatType == RepeatMeeting.MONTHLY_REPEAT) {
    return t('meeting.common.repeat.monthlyChoose');
  } else if (props.repeatType == RepeatMeeting.YEARLY_REPEAT) {
    return t('meeting.common.repeat.yearlyChoose');
  } else {
    return '';
  }
}
);

const weekChoosenOptions = () => {
  return optionsWeekly.value.filter(e => e.checked == true).map(e => e.value).join(',');
};
const monthChoosenOptions = () => {
  let arrayRs: string[] = optionsMonthly.value.map(e => e.filter(e => e.checked == true).map(e => e.value).join(','));
  return arrayRs.filter(e => e.length != 0).join(',') || '';
};

const optionsWeekly = ref([
  {
    label: t('common.weekday.monday'),
    value: 1,
    checked: false,
  },
  {
    label: t('common.weekday.tuesday'),
    value: 2,
    checked: false,
  },
  {
    label: t('common.weekday.wednesday'),
    value: 3,
    checked: false,
  },
  {
    label: t('common.weekday.thursday'),
    value: 4,
    checked: false,
  },
  {
    label: t('common.weekday.friday'),
    value: 5,
    checked: false,
  },
  {
    label: t('common.weekday.saturday'),
    value: 6,
    checked: false,
  },
  {
    label: t('common.weekday.sunday'),
    value: 7,
    checked: false,
  }
]);

function chooseWeekDay(idx: number) {
  optionsWeekly.value[idx].checked = !optionsWeekly.value[idx].checked;
  cron.value = weekChoosenOptions();
}

function generate2DArray(): { value: number, checked: boolean }[][] {
  const days = Array.from({ length: 31 }, (_, i) => ({
    value: i + 1,
    checked: false
  }));

  const result: { value: number, checked: boolean }[][] = [];

  for (let i = 0; i < days.length; i += 7) {
    result.push(days.slice(i, i + 7)); // Slice the array into chunks of 7 elements
  }

  return result;
}

const optionsMonthly = ref(generate2DArray());

function chooseMonthDay(idxMonth: number, idx: number) {
  optionsMonthly.value[idxMonth][idx].checked = !optionsMonthly.value[idxMonth][idx].checked;
  cron.value = monthChoosenOptions();
}

const isSelecting = ref(false);
const startSelection = (event: MouseEvent) => {
  isSelecting.value = true;
};

const endSelection = (event: MouseEvent) => {
  isSelecting.value = false;
};

const selectCell = (cellElement: MouseEvent, data: { value: number, checked: boolean }) => {
  if (isSelecting.value) {
    data.checked = true;
  }
};

function reset() {
  if (props.repeatType == RepeatMeeting.WEEKLY_REPEAT) {
    for (let idx = 0; idx < optionsWeekly.value.length; idx++) {
      optionsWeekly.value[idx].checked = false;
    }
  } else {
    for (let idxMonth = 0; idxMonth < optionsMonthly.value.length; idxMonth++) {
      for (let idx = 0; idx < optionsMonthly.value[idxMonth].length; idx++) {
        optionsMonthly.value[idxMonth][idx].checked = false;
      }
    }
  }
}

function cronToArray() {
  if (props.repeatType == RepeatMeeting.WEEKLY_REPEAT) {
    let dayOfWeek = cron.value?.substring(10).split(',') || [];
    for (let day of dayOfWeek) {
      optionsWeekly.value[Number(day)].checked = true;
    }
  } else {
    let dayOfMonth = cron.value?.substring(6, cron.value?.length - 4).split(',') || [];
    for (let day of dayOfMonth) {
      optionsMonthly.value[Math.floor(Number(day) / 7)][Number(day) % 7 - 1].checked = true;
    }
  }
}

cronToArray();
</script>

<script lang='ts'>
export default { name: 'RepeatMeetingSelect' };
</script>

<style scoped>
.day-selector {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.cell:hover {
  border: 2px solid #3498db;
  cursor: pointer
}

.cell {
  border: 2px solid transparent;
  min-width: 3.5rem;
  min-height: 2rem;
  user-select: none;
}
</style>
