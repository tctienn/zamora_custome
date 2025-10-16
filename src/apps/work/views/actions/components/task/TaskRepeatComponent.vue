<template>
  <div>
    <div class='field flex'>
      <label
        class='mr-3'
        for='repeat'>
        {{ t('work.repeat') }}
      </label>
      <Checkbox
        :binary='true'
        :disabled='!editable'
        input-id='repeat'
        :model-value='isRepeat'
        name='isRepeat'
        @input='updateIsRepeat'/>
    </div>
    <div
      v-if='isRepeat'
      class='formgrid grid'>
      <div
        class='field mt-2 p-float-label'
        :class='small ? "col-12" : "md:col-4"'>
        <Dropdown
          id='type'
          :disabled='!editable'
          :model-value='repeatConfig.type'
          option-label='label'
          option-value='value'
          :options='repeatOptions'
          :show-clear='true'
          @update:model-value='updateRepeatType'/>
        <label for='type'>{{ t('work.repeatConfig.type') }}</label>
      </div>
      <div
        class='field mt-2 p-float-label'
        :class='small ? "col-12" : "md:col-4"'>
        <Calendar
          id='createTime'
          :disabled='!editable'
          :model-value='repeatConfig.createTimeConfig'
          time-only
          @update:model-value='updateCreateTime'/>
        <label for='createTime'>{{ t('work.repeatConfig.createTime') }}</label>
      </div>
      <div
        class='field mt-2 p-float-label'
        :class='small ? "col-12" : "md:col-4"'>
        <Calendar
          id='endRepeatDate'
          :disabled='!editable'
          :model-value='repeatConfig.endRepeatDate'
          @update:model-value='updateEndRepeatDate'/>
        <label for='endRepeatDate'>{{ t('work.repeatConfig.endRepeat') }}</label>
      </div>

      <div
        v-if='repeatConfig.type === RepeatType[RepeatType.WEEKLY]'
        class='col-12 flex flex-wrap gap-3'>
        <div class='align-items-center flex'>
          <Checkbox
            :disabled='!editable'
            input-id='mon'
            :model-value='repeatConfig.daysOfWeek'
            name='daysOfWeek'
            value='MONDAY'
            @update:model-value='updateDaysOfWeek'/>
          <label
            class='ml-2'
            for='mon'>{{ t('work.repeatConfig.daysOfWeek.mon') }}</label>
        </div>

        <div class='align-items-center flex'>
          <Checkbox
            :disabled='!editable'
            input-id='tue'
            :model-value='repeatConfig.daysOfWeek'
            name='daysOfWeek'
            value='TUESDAY'
            @update:model-value='updateDaysOfWeek'/>
          <label
            class='ml-2'
            for='tue'>{{ t('work.repeatConfig.daysOfWeek.tue') }}</label>
        </div>
        <div class='align-items-center flex'>
          <Checkbox
            :disabled='!editable'
            input-id='wed'
            :model-value='repeatConfig.daysOfWeek'
            name='daysOfWeek'
            value='WEDNESDAY'
            @update:model-value='updateDaysOfWeek'/>
          <label
            class='ml-2'
            for='wed'>{{ t('work.repeatConfig.daysOfWeek.wed') }}</label>
        </div>
        <div class='align-items-center flex'>
          <Checkbox
            :disabled='!editable'
            input-id='thu'
            :model-value='repeatConfig.daysOfWeek'
            name='daysOfWeek'
            value='THURSDAY'
            @update:model-value='updateDaysOfWeek'/>
          <label
            class='ml-2'
            for='thu'>{{ t('work.repeatConfig.daysOfWeek.thu') }}</label>
        </div>
        <div class='align-items-center flex'>
          <Checkbox
            :disabled='!editable'
            input-id='fri'
            :model-value='repeatConfig.daysOfWeek'
            name='daysOfWeek'
            value='FRIDAY'
            @update:model-value='updateDaysOfWeek'/>
          <label
            class='ml-2'
            for='fri'>{{ t('work.repeatConfig.daysOfWeek.fri') }}</label>
        </div>
        <div class='align-items-center flex'>
          <Checkbox
            :disabled='!editable'
            input-id='sat'
            :model-value='repeatConfig.daysOfWeek'
            name='daysOfWeek'
            value='SATURDAY'
            @update:model-value='updateDaysOfWeek'/>
          <label
            class='ml-2'
            for='sat'>{{ t('work.repeatConfig.daysOfWeek.sat') }}</label>
        </div>
        <div class='align-items-center flex'>
          <Checkbox
            :disabled='!editable'
            input-id='sun'
            :model-value='repeatConfig.daysOfWeek'
            name='daysOfWeek'
            value='SUNDAY'
            @update:model-value='updateDaysOfWeek'/>
          <label
            class='ml-2'
            for='sun'>{{ t('work.repeatConfig.daysOfWeek.sun') }}</label>
        </div>
      </div>
      <div
        v-if='repeatConfig.type === RepeatType[RepeatType.DAYS_IN_MONTH]'
        class='col-12 md:col-6 month-wrapper'>
        <template
          v-for='day of Array.from(Array(31).keys())'
          :key='day'>
          <Chip
            class='cursor-pointer m-auto'
            :class='{"bg-primary": alreadyInDaysOfMonth(day + 1)}'
            :label='(day + 1).toString()'
            @click='updateDaysOfMonth(day + 1)'/>
        </template>
      </div>
    </div>
  </div>

</template>

<script setup lang='ts'>
import { camelCase, map } from 'lodash';
import type { PropType } from 'vue';
import { useI18n } from 'vue-i18n';

import type { TaskRepeatConfig } from '@/apps/work/model/task';
import { RepeatType } from '@/apps/work/model/task';
import { mapEnum } from '@/common/helpers/utils';

const props = defineProps({
  isRepeat: {
    type: Boolean,
    required: true,
  },
  repeatConfig: {
    type: Object as PropType<TaskRepeatConfig>,
    required: true,
  },
  editable: {
    type: Boolean,
    default: () => false
  },
  small: {
    type: Boolean,
    default: () => false
  }
});
const emit = defineEmits(['update:isRepeat', 'update:repeatConfig']);
const { t } = useI18n();

const repeatOptions = map(mapEnum(RepeatType), (repeat) => ({
  value: repeat,
  label: t(`work.repeats.${camelCase(repeat)}`)
}));

function updateIsRepeat(value: boolean) {
  emit('update:isRepeat', value);
}

function updateRepeatType(value: RepeatType | string) {
  let repeat = {
    ...props.repeatConfig,
    type: value
  };
  emit('update:repeatConfig', repeat);
}

function updateCreateTime(value: string | Date | string[] | Date[] | undefined) {
  emit('update:repeatConfig', {
    ...props.repeatConfig,
    createTimeConfig: value
  });

}

function updateEndRepeatDate(value: string | Date | string[] | Date[] | undefined) {
  emit('update:repeatConfig', {
    ...props.repeatConfig,
    endRepeatDate: value
  });
}

function updateDaysOfWeek(value: string[]) {
  if (props.editable) {
    emit('update:repeatConfig', {
      ...props.repeatConfig,
      daysOfWeek: value
    });
  }
}

function alreadyInDaysOfMonth(day: number) {
  return props.repeatConfig?.daysOfMonth?.includes(day);
}

function updateDaysOfMonth(day: number) {
  if (props.editable) {
    emit('update:repeatConfig', {
      ...props.repeatConfig,
      daysOfMonth: alreadyInDaysOfMonth(day)
        ? (props.repeatConfig?.daysOfMonth || []).filter(d => d !== day)
        : [...props.repeatConfig?.daysOfMonth || [], day]
    });
  }
}
</script>

<script lang='ts'>
export default { name: 'TaskRepeatComponent' };
</script>

<style scoped>
.month-wrapper {
  display: grid;
  grid-template-columns: auto auto auto auto auto auto auto;
  row-gap: .25rem;
}
</style>