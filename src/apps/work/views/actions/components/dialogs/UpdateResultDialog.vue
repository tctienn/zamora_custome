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
        <div class='col-4 px-3 py-2'>
          <span class='align-items-center flex'>
            <label
              class='w-5'
              for='id'>{{ t('work.taskResult.status') }}</label>
            <Dropdown
              v-model='taskResult.statusId'
              :empty-message='t("common.selectEmpty")'
              :filter='true'
              option-label='name'
              option-value='id'
              :options='statusList'
              :placeholder='t("common.status")'/>
          </span>
          <ValidateErrorMessage :errors='v$.statusId.$errors'/>
        </div>

        <div class='col-3 px-3 py-2'>
          <span class='align-items-center flex'>
            <label
              class='w-7'
              for='id'>{{ t('work.taskResult.percent') + '(%)' }}</label>
            <InputNumber
              v-model='taskResult.percent'
              input-id='percent'
              :max='100'
              :min='0'
              suffix='%'/>
          </span>
          <ValidateErrorMessage :errors='v$.percent.$errors'/>
        </div>

        <div class='col-3 px-3 py-2'>
          <span class='align-items-center flex'>
            <label
              class='w-5'
              for='id'>{{ t('work.taskResult.weight') }}</label>
            <InputNumber
              id='number-input'
              v-model='taskResult.weight'
              :max='1'
              :max-fraction-digits='1'
              :min='0'
              :min-fraction-digits='1'/>
          </span>
          <ValidateErrorMessage :errors='v$.weight.$errors'/>
        </div>
      </div>

      <div class='align-items-center form grid mt-2'>
        <div class='col-11 px-2 py-2'>
          <div class='col field'>
            <label>{{ t('work.taskResult.description') }}</label>
            <Textarea
              v-model='taskResult.description'
              v-trim
              :placeholder='t("work.taskResult.description")'
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
import { get, toLower } from 'lodash';
import { provide, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import ValidateErrorMessage from '@/apps/admin/components/custom/ValidateErrorMessage.vue';
import { allStatus } from '@/apps/work/api/graphql/config-work-status-api';
import { addResultGraphql } from '@/apps/work/api/graphql/task-result-api';
import type { TaskStatus } from '@/apps/work/model/configWorkStatus';
import type { Task } from '@/apps/work/model/task';
import type { TaskResultInput } from '@/apps/work/model/taskResult';
import DialogFooter from '@/common/components/dialog/DialogFooter.vue';
import { DEFAULT_DIALOG_CONFIG } from '@/common/constants';
import { toastError, toastSuccess } from '@/common/helpers/custom-toast-service';

const props = withDefaults(defineProps<ConfigFormProps>(), {
  visibleDialog: false,
  isDetail: false,
  item: undefined
});

const emits = defineEmits(['hide-dialog', 'reload']);

const task = ref<Task>(props.item);
const { t } = useI18n();

const visible = ref(props.visibleDialog);
const headerDialog = t('common.editItemName', {
  task: toLower(t('work.objectName')),
  name: props.item?.name
});
const taskResult = ref<TaskResultInput>({
  id: '',
  taskId: task.value?.id,
  statusId: task.value?.statusId || '',
  statusName: task.value?.statusName,
  percent: task.value?.percent,
  weight: task.value?.weight,
  description: '',
});

const statusList = ref<TaskStatus[]>([]);

const { onResult: getAllStatusResult } = allStatus();

getAllStatusResult((response) => {
  statusList.value = get(response, 'data.allStatus', []);
});

const {
  mutate: saveMutate,
  onError: saveOnError,
  onDone: saveOnDone
} = addResultGraphql();
const validateRules = {
  weight: { required: helpers.withMessage(t('work.taskResult.message.weightEmpty'), required) },
  percent: { required: helpers.withMessage(t('work.taskResult.message.percentEmpty'), required) },
  statusId: { required: helpers.withMessage(t('work.taskResult.message.statusEmpty'), required) }
};

const v$ = useVuelidate(validateRules, taskResult);

function saveResultTask() {
  v$.value.$validate().then((isValid) => {
    if (isValid) {
      const taskResultInput: TaskResultInput = {
        id: '',
        taskId: task.value.id,
        weight: taskResult.value.weight,
        percent: taskResult.value.percent,
        statusId: taskResult.value.statusId,
        statusName: taskResult.value.statusId,
        description: taskResult.value.description,
      };
      saveMutate({ task: taskResultInput });
    }
  });
}

saveOnDone(() => {
  toastSuccess({
    message: t('common.result.message.updated', {
      itemType: t('work.taskResult.objectName'),
      itemName: props.item.name
    })
  });
  emits('reload');
  emits('hide-dialog');
});

saveOnError(error => {
  toastError();
});

interface ConfigFormProps {
  visibleDialog: boolean,
  item: Task,
  isDetail: boolean,
}

const resultTaskFormFooterButtons = {
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
    command: () => saveResultTask()
  }
};
provide('dialogFooterButtons', resultTaskFormFooterButtons);
</script>

<script lang='ts'>
export default { name: 'UpdateResultDialog' };
</script>