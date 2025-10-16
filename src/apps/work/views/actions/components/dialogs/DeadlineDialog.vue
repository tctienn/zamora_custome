<template>
  <Dialog
    v-model:visible='visible'
    :header='headerDialog'
    v-bind='DEFAULT_DIALOG_CONFIG'
    @hide='emits("hide-dialog")'>
    <div
      v-disabled='{disabled: isDetail}'
      class='flex-column mt-1 p-fluid'>
      <div class='align-items-center form grid'>
        <div class='col-2 px-5 py-2'>
          <span class='flex'>
            <p class='w-12'>{{ t('work.deadlineTask.oldDeadline') }}</p>
          </span>
        </div>

        <div class='col-5 px-3 py-2'>
          <span class='align-items-center flex'>
            <label
              class='w-4'
              for='id'>{{ t('work.deadlineTask.startTime') }}</label>
            <Calendar
              v-model='oldDeadline.oldStart'
              date-format='dd/mm/yy'
              disabled/>
          </span>
        </div>

        <div class='col-5 px-3 py-2'>
          <span class='align-items-center flex'>
            <label
              class='w-4'
              for='id'>{{ t('work.deadlineTask.deadline') }}</label>
            <Calendar
              v-model='oldDeadline.oldDeadline'
              date-format='dd/mm/yy'
              disabled/>
          </span>
        </div>
      </div>
      <div class='align-items-center form grid mt-2'>
        <div class='col-2 px-5 py-2'>
          <span class='flex'>
            <p class='w-12'>{{ t('work.deadlineTask.newDeadline') }}</p>
          </span>
        </div>
        <span class='col-2'>
          <p class='w-14'>{{ t('work.deadlineTask.startTime') }}</p>
        </span>
        <div class='col-4 px-3 py-2'>
          <span class='align-items-center flex'>
            <label
              v-required
              class='w-2'
              for='id'>{{ t('common.date') }}</label>
            <Calendar
              v-model='newDeadline.newStart'
              format='DD/MM/YYYY HH:mm'
              placeholder='dd/mm/yyyy HH:mm'
              show-time/>
          </span>
          <ValidateErrorMessage :errors='v$.newStart.$errors'/>
        </div>

        <!--        <div class='col-4 px-3 py-2'>-->
        <!--          <span class='align-items-center flex'>-->
        <!--            <label-->
        <!--              v-required-->
        <!--              class='w-2'-->
        <!--              for='id'>{{ t('common.hour') }}</label>-->
        <!--            <Calendar-->
        <!--              v-model='newDeadline.newStartTime'-->
        <!--              placeholder='hh:mm'-->
        <!--              time-only/>-->
        <!--          </span>-->
        <!--          <ValidateErrorMessage :errors='v$.newStartTime.$errors'/>-->
        <!--        </div>-->
      </div>

      <div class='align-items-center form grid mt-2'>
        <div class='col-2 px-5 py-2'>
          <span class='flex'>
          </span>
        </div>
        <span class='col-2'>
          <p class='w-12'>{{ t('work.deadlineTask.deadline') }}</p>
        </span>
        <div class='col-4 px-3 py-2'>
          <span class='align-items-center flex'>
            <label
              v-required
              class='w-2'
              for='id'>{{ t('common.date') }}</label>
            <Calendar
              v-model='newDeadline.newDeadline'
              format='DD/MM/YYYY HH:mm'
              placeholder='dd/mm/yyyy HH:mm'
              show-time/>
          </span>
          <ValidateErrorMessage :errors='v$.newDeadline.$errors'/>
        </div>

        <!--        <div class='col-4 px-3 py-2'>-->
        <!--          <span class='align-items-center flex'>-->
        <!--            <label-->
        <!--              v-required-->
        <!--              class='w-2'-->
        <!--              for='id'>{{ t('common.hour') }}</label>-->
        <!--            <Calendar-->
        <!--              v-model='newDeadline.newDeadlineTime'-->
        <!--              placeholder='hh:mm'-->
        <!--              time-only/>-->
        <!--          </span>-->
        <!--          <ValidateErrorMessage :errors='v$.newDeadlineTime.$errors'/>-->
        <!--        </div>-->
      </div>

      <div class='align-items-center form grid mt-2'>
        <div class='col-12 ml-3 px-2 py-2'>
          <div class='col field'>
            <label>{{ t('work.deadlineTask.reason') }}</label>
            <Textarea
              v-model='reason'
              v-trim
              :placeholder='t("work.deadlineTask.reason")'
              rows='3'/>
          </div>
        </div>
      </div>

    </div>

    <template #footer>
      <DialogFooter/>
    </template>
  </Dialog>
</template>

<script lang='ts' setup>

import { useVuelidate } from '@vuelidate/core';
import { helpers, required } from '@vuelidate/validators';
import { isEmpty, toLower } from 'lodash';
import { provide, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import ValidateErrorMessage from '@/apps/admin/components/custom/ValidateErrorMessage.vue';
import { changeDeadlineGraphql } from '@/apps/work/api/graphql/deadline-task-api';
import type { TaskDeadlineInput } from '@/apps/work/model/deadlineTask';
import type { Task } from '@/apps/work/model/task';
import DialogFooter from '@/common/components/dialog/DialogFooter.vue';
import { DEFAULT_DIALOG_CONFIG } from '@/common/constants';
import { toastError, toastSuccess } from '@/common/helpers/custom-toast-service';

const props = withDefaults(defineProps<ConfigFormProps>(), {
  visibleDialog: false,
  isDetail: false,
  item: undefined
});
const emits = defineEmits(['hide-dialog', 'reload']);
const { t } = useI18n();

const {
  mutate: saveMutate,
  onDone: saveOnDone
} = changeDeadlineGraphql();

const reason = ref<string>('');

// interface Task {
//   id: string,
//   deadline: string,
//   startTime: string
// }

const newDeadline = ref<{
  newStart: Date | null,
  newDeadline: Date | null,
}>({
  newStart: null,
  newDeadline: null
});

const oldDeadline = ref<{
  oldStart: Date,
  oldDeadline: Date
}>({
  oldStart: new Date(props.item.startTime + ''),
  oldDeadline: new Date(props.item.dueTime + '')
});

interface ConfigFormProps {
  visibleDialog: boolean,
  item: Task,
  isDetail: boolean,
}

const deadlineTaskFormFooterButtons = {
  closeButton: {
    icon: 'close',
    label: t('common.close'),
    text: true,
    severity: 'danger',
    type: 'button',
    command: () => emits('hide-dialog')
  },
  actionButton: props.isDetail ? null : {
    icon: 'check',
    label: t('common.save'),
    text: false,
    type: 'button',
    command: () => saveDeadlineTask()
  }
};
provide('dialogFooterButtons', deadlineTaskFormFooterButtons);

const visible = ref(props.visibleDialog);
const config = ref(props.item);
const isCreate = isEmpty(config.value['id']);
const headerDialog = isCreate
  ? t('common.createItem', { item: toLower(t('work.deadlineTask.objectName')) })
  : t('common.editItemName', {
    item: toLower(t('work.deadlineTask.objectName')),
    name: config.value.id
  });

const validateRules = {
  newDeadline: { required: helpers.withMessage(t('work.deadlineTask.message.newDeadlineDayEmpty'), required) },
  newStart: { required: helpers.withMessage(t('work.deadlineTask.message.newDeadlineDayEmpty'), required) },
};

const v$ = useVuelidate(validateRules, newDeadline);

function saveDeadlineTask() {
  v$.value.$validate().then((isValid) => {
    if (isValid) {
      const deadlineNew = newDeadline.value.newDeadline;
      // deadlineNew.setHours(parseInt(newDeadline.value.newDeadlineTime.split(':')[0]));
      // deadlineNew.setMinutes(parseInt(newDeadline.value.newDeadlineTime.split(':')[1]));
      // deadlineNew.setSeconds(0);
      const startNew = newDeadline.value.newStart;
      // startNew.setHours(parseInt(newDeadline.value.newStartTime.split(':')[0]));
      // startNew.setMinutes(parseInt(newDeadline.value.newStartTime.split(':')[1]));
      // startNew.setSeconds(0);
      if (deadlineNew && startNew && deadlineNew < startNew) {
        toastError({ message: t('work.deadlineTask.message.newDeadlineMustBeAfterStart') });
      } else {
        const task: TaskDeadlineInput = {
          id: '',
          reason: reason.value,
          taskId: props.item.id + '',
          oldDeadline: null,
          isCurrent: true,
          newDeadline: deadlineNew,
          oldStart: null,
          newStart: startNew
        };
        saveMutate({ task: task });
      }
    }
  }).catch((error) => {
    toastError({ message: error });
  });
}

saveOnDone(() => {
  toastSuccess({
    message: t(`common.result.message.${isCreate ? 'created' : 'updated'}`, {
      itemType: t('work.deadlineTask.objectName'),
      itemName: config.value.id
    })
  });
  emits('reload');
  emits('hide-dialog');
});

function getDate(dateTime: string) {
  const now = new Date(dateTime);
  const year = now.getFullYear();
  let month = now.getMonth() + 1 + '';
  let day = now.getDate() + '';
  if (month.toString().length == 1) {
    month = '0' + month;
  }
  if (day.toString().length == 1) {
    day = '0' + day;
  }
  return day + '/' + month + '/' + year;
}

function getDateTime(dateTime: string) {
  const now = new Date(dateTime);
  const year = now.getFullYear();
  let month = now.getMonth() + 1 + '';
  let day = now.getDate() + '';
  if (month.toString().length == 1) {
    month = '0' + month;
  }
  if (day.toString().length == 1) {
    day = '0' + day;
  }

  let hour = now.getHours() + '';
  let minute = now.getMinutes() + '';
  if (hour.toString().length == 1) {
    hour = '0' + hour;
  }
  if (minute.toString().length == 1) {
    minute = '0' + minute;
  }
  return day + '/' + month + '/' + year + ' ' + hour + ':' + minute;
}

function getTime(date: string) {
  const now = new Date(date);
  let hour = now.getHours() + '';
  let minute = now.getMinutes() + '';
  if (hour.toString().length == 1) {
    hour = '0' + hour;
  }
  if (minute.toString().length == 1) {
    minute = '0' + minute;
  }
  return hour + ':' + minute;
}

const dateWithoutSlash = ref<string>('');

// Hàm kiểm tra định dạng giờ hợp lệ
function isValidTime(time: string) {
  const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
  return timeRegex.test(time);
}

function isValidDate(dateString: string) {
  if (!/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateString)) {
    return false;
  }

  const parts = dateString.split('/');
  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  const year = parseInt(parts[2], 10);

  // Check the ranges of month and year
  if (year < 1000 || year > 3000 || month == 0 || month > 12) {
    return false;
  }

  const monthLength = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

  if (year % 400 == 0 || year % 100 != 0 && year % 4 == 0) {
    monthLength[1] = 29;
  }

  return day > 0 && day <= monthLength[month - 1];
}

function convertToDate(dateString: string) {
  if (!dateString) {
    return;
  }
  const parts = dateString.split('/');
  const day = parseInt(parts[0]);
  const month = parseInt(parts[1]) - 1;
  const year = parseInt(parts[2]);
  return new Date(year, month, day);
}

function convertDateTimeToString(dateString: string, timeString: string) {
  const parts = dateString.split('/');
  const d = parseInt(parts[0]);
  const m = parseInt(parts[1]) - 1;
  const y = parseInt(parts[2]);
  const now = new Date(y, m, d);
  const year = now.getFullYear();
  let month = now.getMonth() + 1 + '';
  let day = now.getDate() + '';
  if (month.toString().length == 1) {
    month = '0' + month;
  }
  if (day.toString().length == 1) {
    day = '0' + day;
  }
  let hour = timeString.split(':')[0];
  let minute = timeString.split(':')[1];
  return year + '-' + month + '-' + day + 'T' + hour + ':' + minute + ':' + '00';
}

</script>

<script lang='ts'>
export default { name: 'DeadlineDialog' };
</script>