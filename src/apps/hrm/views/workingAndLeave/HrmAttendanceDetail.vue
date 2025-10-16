<template>
  <Sidebar
    v-model:visible='visible'
    position='right'
    :show-close-icon='false'
    style='width: 30rem'>
    <template #header>
      <div class='align-items-center flex justify-content-between w-full'>
        <div class='align-items-center flex font-bold gap-2 text-xl'>
          <Button
            icon='pi pi-arrow-left'
            severity='danger'
            @click='visible = false'></Button>
          {{ t('hrm.attendance.detail.title') }}
        </div>
        <div class='flex gap-1'>
          <Button
            :disabled='!saveAble'
            icon='pi pi-save'
            :label='t("common.save")'
            @click='submit'></Button>

        </div>
      </div>
    </template>
    <div class='flex flex-column gap-3'>
      <div class='align-items-center flex gap-2'>
        <HrmAvatar :avatar='generateAvatarUrl(employee?.avatar)'/>
        <div class='font-semibold'>{{ employee?.fullName }}</div>
        | {{ employee?.code }}
      </div>
      <div>
        {{ t('common.date') }}
        {{ moment(attendance?.date).format(DateTimeFormat.DATE_READABLE) }}
        | {{ attendance?.shiftName }}
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
      <FormInputDropdown
        v-model='attendance.symbol'
        :label='t("hrm.attendance.detail.symbol")'
        :option-label='(data: HrmCategory) => data.code + " (" + data.name + ")"'
        option-value='code'
        :options='symbols'/>
    </div>
  </Sidebar>
</template>

<script lang='ts' setup>
import { camelCase } from 'lodash';
import { computed, inject, onMounted, type PropType, reactive, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { attendanceByShift, setSymbolManual } from '@/apps/hrm/api/graphql/attendance';
import FormInputDropdown from '@/apps/hrm/components/form/FormInputDropdown.vue';
import HrmAvatar from '@/apps/hrm/components/HrmAvatar.vue';
import { CATEGORY_TYPE } from '@/apps/hrm/constants/category';
import { fetchCategory } from '@/apps/hrm/helpers/utils';
import type { Attendance } from '@/apps/hrm/model/attendance';
import type { HrmCategory } from '@/apps/hrm/model/category';
import type { EmployeeShifts } from '@/apps/hrm/model/shift';
import { DateTimeFormat } from '@/common/constants';
import { toastError, toastSuccess } from '@/common/helpers/custom-toast-service';
import { generateAvatarUrl } from '@/common/helpers/file-utils';
import useMoment from '@/common/helpers/mixins/use-moment';

const props = defineProps({
  employee: {
    type: Object as PropType<EmployeeShifts>,
    default: undefined,
  },
  date: {
    type: String,
    default: '',
  },
  shiftCode: {
    type: String,
    default: '',
  },
});
const { t } = useI18n();
const { moment } = useMoment();
const visible = defineModel('visible', {
  type: Boolean,
  default: false,
});
const attendance = reactive<Attendance>({});
const originalAttendance = reactive<Attendance>({});
const saveAble = computed(() => {
  if (!attendance) {
    return false;
  }
  return attendance.symbol && attendance.symbol !== originalAttendance.symbol;
});

const symbols = ref<HrmCategory[]>([]);

const {
  onResult,
  refetch,
  load
} = attendanceByShift();
onResult((res) => {
  if (res.loading) {
    return;
  }
  Object.assign(attendance, res.data.attendanceByShift as Attendance || {});
  Object.assign(originalAttendance, res.data.attendanceByShift as Attendance || {});
});

watch(() => [props.employee?.employeeId, props.date, props.shiftCode], (value) => {
  if (!value[0] || !value[1] || !value[2]) {
    return;
  }
  const variables = {
    employeeId: value[0],
    date: value[1],
    shiftCode: value[2],
  };
  load(null, variables) || refetch(variables);
}, { immediate: true });
const reFetchEmployee = inject('reFetchEmployee', (employeeId: string) => void {});

function submit() {
  const employeeId = props.employee?.employeeId;
  if (!attendance?.symbol || !employeeId) {
    return;
  }
  const variables = {
    employeeId: employeeId,
    date: props.date,
    shiftCode: props.shiftCode,
    symbol: attendance.symbol,
  };
  setSymbolManual().mutate(variables)
    .then(() => {
      toastSuccess();
      visible.value = false;
      reFetchEmployee(employeeId);
    })
    .catch(() => {
      toastError();
    });
}

onMounted(() => {
  fetchCategory(CATEGORY_TYPE.TIMEKEEPING_SYMBOLS, symbols);
});
</script>

<style scoped>

</style>