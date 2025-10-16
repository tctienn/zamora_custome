<template>
  <div class='border border-1 border-300 border-round-sm mt-3 p-2 w-20rem'>
    <p class='font-semibold text-xl'>Thông tin chấm công</p>
    <div
      v-for='(attendance, index) in data'
      :key='index'
      class='border-1 border-round-sm border-solid flex flex-column gap-2 mb-3 p-2'>
      <div>
        {{ attendance?.shiftName }}
      </div>
      <div v-if='attendance?.workingDay'>
        {{ t('hrm.attendance.detail.workingDay') }}:
        {{ attendance?.workingDay }}
      </div>
      <div v-if='attendance?.checkIn'>
        {{ t('hrm.attendance.detail.checkIn') }}:
        {{ moment(attendance?.checkIn).format(DateTimeFormat.DATE_TIME_READABLE) }}
      </div>
      <div v-if='attendance?.checkOut'>
        {{ t('hrm.attendance.detail.checkOut') }}:
        {{ moment(attendance?.checkOut).format(DateTimeFormat.DATE_TIME_READABLE) }}
      </div>
      <div v-if='attendance?.location'>
        {{ t('hrm.attendance.detail.location') }}:
        {{ attendance?.location }}
      </div>
      <div v-if='attendance?.type'>
        {{ t('hrm.attendance.detail.type') }}:
        {{ t('hrm.attendance.detail.typeOptions.' + camelCase(attendance?.type)) }}
      </div>
    </div>
  </div>
</template>

<script lang='ts' setup>

import { camelCase } from 'lodash';
import { onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { attendances } from '@/apps/hrm/api/graphql/attendance';
import type { Attendance } from '@/apps/hrm/model/attendance';
import { DateTimeFormat } from '@/common/constants';
import useMoment from '@/common/helpers/mixins/use-moment';

const props = defineProps({
  employee: {
    type: String,
    default: undefined,
  },
  date: {
    type: String,
    default: '',
  },
});

const { t } = useI18n();
const { moment } = useMoment();
const data = ref<Attendance[]>([]);

const {
  onResult,
  refetch,
  load
} = attendances();

onMounted(() => {
  const variables = {
    employeeId: props.employee,
    date: props.date,
  };
  load(null, variables) || refetch(variables);
});

watch(() => props.date, (value) => {
  const variables = {
    employeeId: props.employee,
    date: value,
  };
  refetch(variables);
}, { immediate: true });

onResult((res) => {
  data.value = res.data.attendances;
});

</script>