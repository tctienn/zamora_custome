<template>
  <div
    class='flex h-full justify-content-center'>
    <div style=' width: 60%'>
      <div class='border-round-sm card'>
        <h4 class='mb-1'>Loại ca</h4>
        <div class='flex'>
          <div class='col-2 field'><label>{{ t('work.configWorkingTime.shiftType') }}</label>
          </div>
          <div class='col-3 field'>
            <div>
              <Dropdown
                v-model='workShift'
                class='w-full'
                :empty-message='t("common.selectEmpty")'
                option-label='label'
                option-value='value'
                :options='getWorkShift()'
                :placeholder='t("common.status")'
                @change='chooseWorkShift(workShift)'/>
            </div>
          </div>
        </div>
      </div>

      <div class='border-round-sm card'>
        <div class='align-items-center flex flex-wrap justify-content-between'>
          <span class='block p-input-icon-right'><h4>{{ t('work.configWorkingTime.workTime') }}</h4></span>
          <span class='block p-input-icon-left'>
            <ButtonIcon
              v-show='visibleBtnAddWorkingTime'
              v-tooltip='t("work.configWorkingTime.addWorkTime")'
              class='p-1'
              icon='add_circle'
              rounded
              text
              @click='addWorkingTime'/>
          </span>
        </div>

        <div
          v-for='(item, index) in workingTimes'
          :key='index'
          class='grid'>
          <div class='col-3'>
            <InputText
              v-model='item.id'
              v-disable
              hidden/>
            <InputText
              v-model='item.shiftName'
              @blur='calculateLabour(item, index)'/>
          </div>
          <div class='col-3'>
            <Calendar
              v-model='item.start'
              time-only
              @blur='calculateLabour(item, index)'/>
          </div>
          <div class='col-3'>
            <Calendar
              v-model='item.end'
              time-only
              @blur='calculateLabour(item, index)'/>
          </div>
          <div class='col-2'>
            <InputNumber
              v-model='item.labour'
              class='w-full'
              disabled/>
          </div>
          <div class='col-1'>
            <ButtonIcon
              v-tooltip='t("work.create")'
              class='pt-2'
              icon='delete'
              rounded
              text
              @click='deleteWorkingTime(index, item.id)'/>
          </div>
        </div>
      </div>

      <div class='border-round-sm card'>
        <h4 class='mb-1'>{{ t('work.configWorkingTime.schedule') }}</h4>
        <div class='flex'>
          <div class='col-2 field'><label>{{ t('work.configWorkingTime.monday') }}</label>
          </div>
          <div class='col-6 field'>
            <InputText
              v-model='workSchedule.idMonday'
              disabled
              hidden/>
            <Dropdown
              v-model='workSchedule.mondayStatus'
              class='w-full'
              :empty-message='t("common.selectEmpty")'
              option-label='shiftName'
              option-value='shiftName'
              :options='statusSchedule'
              :placeholder='t("common.status")'
              @change='chooseStatusMonday(statusSchedule)'/>
          </div>
          <div class='col-3 field'>
            <div>
              <InputNumber
                v-model='workSchedule.mondayLabour'
                disabled/>
            </div>
          </div>
        </div>
        <div class='flex'>
          <div class='col-2 field'><label>{{ t('work.configWorkingTime.tuesday') }}</label>
          </div>
          <div class='col-6 field'>
            <InputText
              v-model='workSchedule.idTuesday'
              disabled
              hidden/>
            <Dropdown
              v-model='workSchedule.tuesdayStatus'
              class='w-full'
              :empty-message='t("common.selectEmpty")'
              :filter='true'
              option-label='shiftName'
              option-value='shiftName'
              :options='statusSchedule'
              :placeholder='t("common.status")'
              @change='chooseStatusTuesday(statusSchedule)'/>
          </div>
          <div class='col-3 field'>
            <div>
              <InputNumber
                v-model='workSchedule.tuesdayLabour'
                disabled/>
            </div>
          </div>
        </div>
        <div class='flex'>
          <div class='col-2 field'><label>{{ t('work.configWorkingTime.wednesday') }}</label>
          </div>
          <div class='col-6 field'>
            <InputText
              v-model='workSchedule.idWednesday'
              disabled
              hidden/>
            <Dropdown
              v-model='workSchedule.wednesdayStatus'
              class='w-full'
              :empty-message='t("common.selectEmpty")'
              :filter='true'
              option-label='shiftName'
              option-value='shiftName'
              :options='statusSchedule'
              :placeholder='t("common.status")'
              @change='chooseStatusWednesday(statusSchedule)'/>
          </div>
          <div class='col-3 field'>
            <div>
              <InputNumber
                v-model='workSchedule.wednesdayLabour'
                disabled/>
            </div>
          </div>
        </div>
        <div class='flex'>
          <div class='col-2 field'><label>{{ t('work.configWorkingTime.thursday') }}</label>
          </div>
          <div class='col-6 field'>
            <InputText
              v-model='workSchedule.idThursday'
              disabled
              hidden/>
            <Dropdown
              v-model='workSchedule.thursdayStatus'
              class='w-full'
              :empty-message='t("common.selectEmpty")'
              :filter='true'
              option-label='shiftName'
              option-value='shiftName'
              :options='statusSchedule'
              :placeholder='t("common.status")'
              @change='chooseStatusThursday(statusSchedule)'/>
          </div>
          <div class='col-3 field'>
            <div>
              <InputNumber
                v-model='workSchedule.thursdayLabour'
                disabled/>
            </div>
          </div>
        </div>
        <div class='flex'>
          <div class='col-2 field'><label>{{ t('work.configWorkingTime.friday') }}</label>
          </div>
          <div class='col-6 field'>
            <InputText
              v-model='workSchedule.idFriday'
              disabled
              hidden/>
            <Dropdown
              v-model='workSchedule.fridayStatus'
              class='w-full'
              :empty-message='t("common.selectEmpty")'
              :filter='true'
              option-label='shiftName'
              option-value='shiftName'
              :options='statusSchedule'
              :placeholder='t("common.status")'
              @change='chooseStatusFriday(statusSchedule)'/>
          </div>
          <div class='col-3 field'>
            <div>
              <InputNumber
                v-model='workSchedule.fridayLabour'
                disabled/>
            </div>
          </div>
        </div>
        <div class='flex'>
          <div class='col-2 field'><label>{{ t('work.configWorkingTime.saturday') }}</label>
          </div>
          <div class='col-6 field'>
            <InputText
              v-model='workSchedule.idSaturday'
              disabled
              hidden/>
            <Dropdown
              v-model='workSchedule.saturdayStatus'
              class='w-full'
              :empty-message='t("common.selectEmpty")'
              :filter='true'
              option-label='shiftName'
              option-value='shiftName'
              :options='statusSchedule'
              :placeholder='t("common.status")'
              @change='chooseStatusSaturday(statusSchedule)'/>
          </div>
          <div class='col-3 field'>
            <div>
              <InputNumber
                v-model='workSchedule.saturdayLabour'
                disabled/>
            </div>
          </div>
        </div>
        <div class='flex'>
          <div class='col-2 field'><label>{{ t('work.configWorkingTime.sunday') }}</label>
          </div>
          <div class='col-6 field'>
            <InputText
              v-model='workSchedule.idSunday'
              disabled
              hidden/>
            <Dropdown
              v-model='workSchedule.sundayStatus'
              class='w-full'
              :empty-message='t("common.selectEmpty")'
              :filter='true'
              option-label='shiftName'
              option-value='shiftName'
              :options='statusSchedule'
              :placeholder='t("common.status")'
              @change='chooseStatusSunday(statusSchedule)'/>
          </div>
          <div class='col-3 field'>
            <div>
              <InputNumber
                v-model='workSchedule.sundayLabour'
                disabled/>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang='ts' setup>

import { cloneDeep, floor, isEmpty } from 'lodash';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { findScheduleByShiftTypeGraphql, saveScheduleGraphql } from '@/apps/work/api/graphql/schedule-api';
import { deleteShiftGraphql, findByShiftTypeGraphql, saveShiftGraphql } from '@/apps/work/api/graphql/shift-api';
import type { WorkingTime, WorkSchedule } from '@/apps/work/model/wokingTime';
import ButtonIcon from '@/common/components/custom/ButtonIcon.vue';
import { toastError, toastSuccess } from '@/common/helpers/custom-toast-service';
import { getWorkShift } from '@/common/helpers/utils';

const { t } = useI18n();
const workShift = ref();
const workingTimes = ref([] as WorkingTime[]);
let statusSchedule: WorkingTime[] = [];
const workSchedule = ref({} as WorkSchedule);
const indexOfWorkingTimes = ref(0);
const {
  onResult: findByShiftTypeResult,
  load: findByShiftTypeLoad,
  refetch: findByShiftTypeRefetch
} = findByShiftTypeGraphql();
const {
  onResult: findScheduleResult,
  load: findScheduleLoad,
  refetch: findScheduleRefetch
} = findScheduleByShiftTypeGraphql();

const visibleBtnAddWorkingTime = ref(false);
let totalLabour = ref(0);
const {
  mutate: deleteShiftMutate,
  onDone: deleteShiftOnDone,
  onError: deleteShiftOnError
} = deleteShiftGraphql();

function addWorkingTime() {
  let wt = [...workingTimes.value];
  wt.push({
    id: '',
    shiftType: workShift.value,
    shiftName: '',
    start: new Date(),
    end: new Date(),
    labour: 0
  });
  workingTimes.value = wt;
}

const {
  mutate: saveScheduleMutation,
  onDone: saveScheduleDone
} = saveScheduleGraphql();
const {
  mutate: saveShiftMutate,
  onDone: saveShiftDone,
  onError: saveShiftOnError
} = saveShiftGraphql();

function calculateLabour(workingTime: WorkingTime, index: number) {
  if (workingTime.start != null && workingTime.end != null) {
    const start = workingTime.start.toLocaleTimeString();
    const end = workingTime.end.toLocaleTimeString();
    const subtraction = workingTime.end.getTime() - workingTime.start.getTime();
    const labour = subtraction / (8 * 60 * 60 * 1000);

    let abc = [...workingTimes.value];
    abc[index] = {
      ...abc[index],
      labour: floor(labour, 2)
    };
    workingTimes.value = abc;

    if (!isEmpty(workingTime.shiftName)) {
      saveShiftMutate({
        shiftInput: {
          ...workingTime,
          start: start,
          end: end,
          labour: floor(labour, 2)
        }
      });
    }
  }
}

saveShiftOnError((err) => {
  findByShiftTypeLoad(undefined, { shiftType: workShift });
  toastError({ message: t('work.configWorkingTime.message.' + err.graphQLErrors[0].extensions.errorCode) });
});

function deleteWorkingTime(index: number, id: string) {
  indexOfWorkingTimes.value = index;
  if (!isEmpty(id)) {
    deleteShiftMutate({ id: id });
  } else {
    let wt = cloneDeep(workingTimes.value);
    wt.splice(indexOfWorkingTimes.value, 1);
    workingTimes.value = cloneDeep(wt);
    statusSchedule = [];
  }
}

findByShiftTypeResult((res) => {
  totalLabour.value = 0;
  const currentDate = new Date();
  workingTimes.value = res.data.findByShiftType.map((s: WorkingTime) => {
    totalLabour.value += s.labour;
    return {
      ...s,
      start: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(),
        parseInt(s.start.toString().split(':')[0]), parseInt(s.start.toString().split(':')[1])),
      end: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(),
        parseInt(s.end.toString().split(':')[0]), parseInt(s.end.toString().split(':')[1])),
    };
  });
  statusSchedule = cloneDeep(workingTimes.value);
  addStatusScheduleIsFull();
});

function addStatusScheduleIsFull() {
  if (statusSchedule.find(s => s.shiftType === 'FULL') != undefined) {
    statusSchedule.splice(statusSchedule.indexOf(statusSchedule.find(s => s.shiftType === 'FULL')!), 1);
  }

  statusSchedule.push({
    id: '',
    shiftType: 'FULL',
    shiftName: t('work.configWorkingTime.all'),
    start: new Date(),
    end: new Date(),
    labour: floor(totalLabour.value, 2)
  });
}

findScheduleResult((res) => {
  if (res.data.findScheduleByShiftType.length > 0) {
    for (const schedule of res.data.findScheduleByShiftType) {
      if (schedule.day == 'MONDAY') {
        workSchedule.value.idMonday = schedule.id;
        workSchedule.value.mondayStatus = schedule.shift;
        workSchedule.value.mondayLabour = schedule.totalLabour;
      } else if (schedule.day == 'TUESDAY') {
        workSchedule.value.idTuesday = schedule.id;
        workSchedule.value.tuesdayStatus = schedule.shift;
        workSchedule.value.tuesdayLabour = schedule.totalLabour;
      } else if (schedule.day == 'THURSDAY') {
        workSchedule.value.idThursday = schedule.id;
        workSchedule.value.thursdayStatus = schedule.shift;
        workSchedule.value.thursdayLabour = schedule.totalLabour;
      } else if (schedule.day == 'SATURDAY') {
        workSchedule.value.idSaturday = schedule.id;
        workSchedule.value.saturdayStatus = schedule.shift;
        workSchedule.value.saturdayLabour = schedule.totalLabour;
      } else if (schedule.day == 'WEDNESDAY') {
        workSchedule.value.idWednesday = schedule.id;
        workSchedule.value.wednesdayStatus = schedule.shift;
        workSchedule.value.wednesdayLabour = schedule.totalLabour;
      } else if (schedule.day == 'FRIDAY') {
        workSchedule.value.idFriday = schedule.id;
        workSchedule.value.fridayStatus = schedule.shift;
        workSchedule.value.fridayLabour = schedule.totalLabour;
      } else if (schedule.day == 'SUNDAY') {
        workSchedule.value.idSunday = schedule.id;
        workSchedule.value.sundayStatus = schedule.shift;
        workSchedule.value.sundayLabour = schedule.totalLabour;
      }
    }
  }
});

function chooseWorkShift(workShift: any) {
  workSchedule.value = {} as WorkSchedule;
  visibleBtnAddWorkingTime.value = true;
  findByShiftTypeLoad(undefined, { shiftType: workShift });
  findScheduleLoad(undefined, { shiftType: workShift });
}

function chooseStatusMonday(statusSchedule: WorkingTime[]) {
  workSchedule.value.mondayLabour = statusSchedule.find(s => workSchedule.value.mondayStatus == s.shiftName)
    == undefined ? 0 : Number(statusSchedule.find(s => workSchedule.value.mondayStatus == s.shiftName)?.labour);
  saveScheduleMutation({
    scheduleInput: {
      id: workSchedule.value.idMonday,
      day: 'MONDAY',
      shiftType: workShift.value,
      shift: workSchedule.value.mondayStatus,
      totalLabour: workSchedule.value.mondayLabour
    }
  });
}

function chooseStatusTuesday(statusSchedule: WorkingTime[]) {
  workSchedule.value.tuesdayLabour = statusSchedule.find(s => workSchedule.value.tuesdayStatus == s.shiftName)
    == undefined ? 0 : Number(statusSchedule.find(s => workSchedule.value.tuesdayStatus == s.shiftName)?.labour);
  saveScheduleMutation({
    scheduleInput: {
      id: workSchedule.value.idTuesday,
      day: 'TUESDAY',
      shiftType: workShift.value,
      shift: workSchedule.value.tuesdayStatus,
      totalLabour: workSchedule.value.tuesdayLabour
    }
  });
}

function chooseStatusWednesday(statusSchedule: WorkingTime[]) {
  workSchedule.value.wednesdayLabour = statusSchedule.find(s => workSchedule.value.wednesdayStatus == s.shiftName)
    == undefined ? 0 : Number(statusSchedule.find(s => workSchedule.value.wednesdayStatus == s.shiftName)?.labour);
  saveScheduleMutation({
    scheduleInput: {
      id: workSchedule.value.idWednesday,
      day: 'WEDNESDAY',
      shiftType: workShift.value,
      shift: workSchedule.value.wednesdayStatus,
      totalLabour: workSchedule.value.wednesdayLabour
    }
  });
}

function chooseStatusThursday(statusSchedule: WorkingTime[]) {
  workSchedule.value.thursdayLabour = statusSchedule.find(s => workSchedule.value.thursdayStatus == s.shiftName)
    == undefined ? 0 : Number(statusSchedule.find(s => workSchedule.value.thursdayStatus == s.shiftName)?.labour);
  saveScheduleMutation({
    scheduleInput: {
      id: workSchedule.value.idThursday,
      day: 'THURSDAY',
      shiftType: workShift.value,
      shift: workSchedule.value.thursdayStatus,
      totalLabour: workSchedule.value.thursdayLabour
    }
  });
}

function chooseStatusFriday(statusSchedule: WorkingTime[]) {
  workSchedule.value.fridayLabour = statusSchedule.find(s => workSchedule.value.fridayStatus == s.shiftName)
    == undefined ? 0 : Number(statusSchedule.find(s => workSchedule.value.fridayStatus == s.shiftName)?.labour);
  saveScheduleMutation({
    scheduleInput: {
      id: workSchedule.value.idFriday,
      day: 'FRIDAY',
      shiftType: workShift.value,
      shift: workSchedule.value.fridayStatus,
      totalLabour: workSchedule.value.fridayLabour
    }
  });
}

function chooseStatusSaturday(statusSchedule: WorkingTime[]) {
  workSchedule.value.saturdayLabour = statusSchedule.find(s => workSchedule.value.saturdayStatus == s.shiftName)
    == undefined ? 0 : Number(statusSchedule.find(s => workSchedule.value.saturdayStatus == s.shiftName)?.labour);
  saveScheduleMutation({
    scheduleInput: {
      id: workSchedule.value.idSaturday,
      day: 'SATURDAY',
      shiftType: workShift.value,
      shift: workSchedule.value.saturdayStatus,
      totalLabour: workSchedule.value.saturdayLabour
    }
  });
}

function chooseStatusSunday(statusSchedule: WorkingTime[]) {
  workSchedule.value.sundayLabour = statusSchedule.find(s => workSchedule.value.sundayStatus == s.shiftName)
    == undefined ? 0 : Number(statusSchedule.find(s => workSchedule.value.sundayStatus == s.shiftName)?.labour);
  saveScheduleMutation({
    scheduleInput: {
      id: workSchedule.value.idSunday,
      day: 'SUNDAY',
      shiftType: workShift.value,
      shift: workSchedule.value.fridayStatus,
      totalLabour: workSchedule.value.fridayLabour
    }
  });
}

saveScheduleDone((res) => {
  const schedule = res.data.saveSchedule;
  if (schedule.day == 'MONDAY') {
    workSchedule.value.idMonday = schedule.id;
    workSchedule.value.mondayStatus = schedule.shift;
    workSchedule.value.mondayLabour = schedule.totalLabour;
  } else if (schedule.day == 'TUESDAY') {
    workSchedule.value.idTuesday = schedule.id;
    workSchedule.value.tuesdayStatus = schedule.shift;
    workSchedule.value.tuesdayLabour = schedule.totalLabour;
  } else if (schedule.day == 'THURSDAY') {
    workSchedule.value.idThursday = schedule.id;
    workSchedule.value.thursdayStatus = schedule.shift;
    workSchedule.value.thursdayLabour = schedule.totalLabour;
  } else if (schedule.day == 'SATURDAY') {
    workSchedule.value.idSaturday = schedule.id;
    workSchedule.value.saturdayStatus = schedule.shift;
    workSchedule.value.saturdayLabour = schedule.totalLabour;
  } else if (schedule.day == 'WEDNESDAY') {
    workSchedule.value.idWednesday = schedule.id;
    workSchedule.value.wednesdayStatus = schedule.shift;
    workSchedule.value.wednesdayLabour = schedule.totalLabour;
  } else if (schedule.day == 'FRIDAY') {
    workSchedule.value.idFriday = schedule.id;
    workSchedule.value.fridayStatus = schedule.shift;
    workSchedule.value.fridayLabour = schedule.totalLabour;
  } else if (schedule.day == 'SUNDAY') {
    workSchedule.value.idSunday = schedule.id;
    workSchedule.value.sundayStatus = schedule.shift;
    workSchedule.value.sundayLabour = schedule.totalLabour;
  }
  toastSuccess({ message: t('work.configWorkingTime.message.addShiftSuccess') });
});

saveShiftDone((res) => {
  workingTimes.value[workingTimes.value.length - 1].id = res.data.saveShift.id;
  findByShiftTypeRefetch();
  toastSuccess({ message: t('work.configWorkingTime.message.addScheduleSuccess') });
  addStatusScheduleIsFull();
  findScheduleRefetch();
});

deleteShiftOnError(() => {
  toastError({ message: t('work.configWorkingTime.message.validateSetSchedule') });
});

deleteShiftOnDone(() => {
  addStatusScheduleIsFull();
  findScheduleRefetch();
  let wt = cloneDeep(workingTimes.value);
  wt.splice(indexOfWorkingTimes.value, 1);
  workingTimes.value = cloneDeep(wt);
  statusSchedule = [];
  toastSuccess({ message: t('work.configWorkingTime.message.deleteShiftSuccess') });
  findScheduleRefetch();
});
</script>

<script lang='ts'>
export default { name: 'ConfigWorkingTimeManage' };
</script>