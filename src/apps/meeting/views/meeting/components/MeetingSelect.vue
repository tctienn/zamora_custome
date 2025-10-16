<template>
  <div class='flex gap-2'>
    <Calendar
      class='w-13rem'
      date-format='yy'
      icon-display='input'
      :manual-input='false'
      :model-value='selectedDate'
      show-icon
      view='year'
      @update:model-value='updateDate'/>

    <Calendar
      v-if='display === "month"'
      date-format='MM'
      icon-display='input'
      :manual-input='false'
      :model-value='selectedDate'
      show-button-bar
      show-icon
      view='month'
      @update:model-value='updateDate'/>

    <Dropdown
      v-if="display === 'week'"
      :model-value='week'
      option-label='label'
      option-value='value'
      :options='weeksInYear'
      :pt="{ item: { class: 'pl-2' } }"
      @update:model-value='updateWeek'>
      <template #option='{ option }'>
        <div
          class='flex gap-2 items-center relative'
          :class="{ 'text-blue font-semibold': option.value === week }">
          <AppIcon
            v-if='option.value === week'
            class='absolute'
            name='check'
            size='1.3'/>
          <span class='ml-4'>{{ option.label }}</span>
        </div>
      </template>
    </Dropdown>

  </div>
</template>

<script lang='ts' setup>
import { map } from 'lodash';
import { computed, type PropType, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import AppIcon from '@/common/components/app/AppIcon.vue';
import useMoment from '@/common/helpers/mixins/use-moment';

const props = defineProps({
  display: {
    type: String as PropType<'week' | 'month'>,
    default: 'week'
  },
  year: {
    type: Number,
    default: new Date().getFullYear()
  },
  month: {
    type: Number,
    validator: function (value: number, props) {
      return props.display === 'month' ? value >= 0 && value <= 11 : true;
    },
    default: new Date().getMonth()
  },
  week: {
    type: Number,
    validator: function (value: number, props) {
      return props.display === 'week' ? value >= 0 && value <= 52 : true;
    },
    default: 0
  }
});
const emits = defineEmits(['update:year', 'update:month', 'update:week']);
const { moment } = useMoment();
const { t } = useI18n();

const weeksInYear = computed(() => {
  const w = moment().year(props.year).month(5);
  const weeks = w.weeksInYear();
  return map(Array.from({ length: weeks }), (_, index) => ({
    label: t('common.week') + ' ' + (index + 1) + ' (' + w.weeks(index + 1).weekday(0).format('DD/MM/YYYY') + ' - '
      + w.weeks(index + 1).weekday(6).format('DD/MM/YYYY') + ')',
    value: index + 1
  }));
});

const selectedDate = ref<Date>(new Date(props.year, props.month, 1));

function updateDate(value: Date, week?: number) {
  selectedDate.value = value;
  emits('update:year', value.getFullYear());
  emits('update:month', value.getMonth());
  emits('update:week', week || 1);
}

function updateWeek(value: number) {
  const w = moment().year(props.year).week(value);
  updateDate(w.toDate(), w.week());
}

watch(() => props.year, (value) => {
  selectedDate.value = new Date(value, props.month, 1);
});

watch(() => props.month, (value) => {
  selectedDate.value = new Date(props.year, value, 1);
});
</script>

<style scoped>
.text-blue {
  color: #0d99ff;
}
</style>