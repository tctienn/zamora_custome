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
          <div class='flex'>
            <p class='w-12'>{{ t('work.taskEvaluation.result') }}</p>
          </div>
        </div>
        <div class='col-5 px-3 py-2'>
          <span class='align-items-center flex'>
            <Checkbox
              v-model='checkedPass'
              :binary='true'
              @change='changeCheckedPass'/>
            <label
              class='w-5'
              for='id'>{{ t('work.taskEvaluation.pass') }}</label>
          </span>
        </div>

        <div class='col-5 px-3 py-2'>
          <span class='align-items-center flex'>

            <Checkbox
              v-model='checkedNotPass'
              :binary='true'
              @change='changeCheckedNotPass'/>
            <label
              class='w-5'
              for='id'>{{ t('work.taskEvaluation.notPass') }}</label>
          </span>
        </div>
      </div>
      <div class='align-items-center form grid mt-2'>
        <div class='col-2 px-5 py-2'>
          <div class='flex'>
            <p class='w-12'>{{ t('work.taskEvaluation.point') }}</p>
          </div>
        </div>
        <div class='col-5 px-3 py-2'>
          <span class='align-items-center flex'>
            <InputNumber
              id='number-input'
              v-model='point'
              :max='10'
              :min='0'/>
            <label
              class='w-5'
              for='id'>{{ t('work.taskEvaluation.note') }}</label>
          </span>
          <ValidateErrorMessage :errors='v$.point.$errors'/>
        </div>

        <div class='col-5 px-3 py-2'>
          <span class='align-items-center flex'>

          </span>
        </div>
      </div>

      <div class='align-items-center form grid mt-2'>
        <div class='col-11 ml-3 px-2 py-2'>
          <div class='col field'>
            <label>{{ t('work.taskEvaluation.description') }}</label>
            <Textarea
              v-model='description'
              v-trim
              :placeholder='t("work.taskEvaluation.comment")'
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
import { evaluateGraphql } from '@/apps/work/api/graphql/task-evaluation-api';
import type { TaskEvaluationInput } from '@/apps/work/model/taskEvaluation';
import DialogFooter from '@/common/components/dialog/DialogFooter.vue';
import { DEFAULT_DIALOG_CONFIG } from '@/common/constants';
import { toastError, toastSuccess } from '@/common/helpers/custom-toast-service';

const props = withDefaults(defineProps<ConfigFormProps>(), {
  visibleDialog: false,
  isDetail: false,
  taskId: '',
  taskName: ''
});

const emits = defineEmits(['hide-dialog', 'reload']);

const { t } = useI18n();

const visible = ref(props.visibleDialog);
const isCreate = isEmpty(props.taskId);
const headerDialog = isCreate
  ? t('common.createItem', { item: toLower(t('work.deadlineTask.objectName')) })
  : t('common.editItemName', {
    item: toLower(t('work.taskEvaluation.objectName')),
    name: props.taskName
  });
const checkedPass = ref(true);
const checkedNotPass = ref(!checkedPass.value);
const point = ref(0);
const description = ref<string>('');

const {
  mutate: saveMutate,
  onError: saveOnError,
  onDone: saveOnDone
} = evaluateGraphql();

const validateRules = { point: { required: helpers.withMessage(t('work.deadlineTask.message.newDeadlineDayEmpty'), required) } };

const v$ = useVuelidate(validateRules, { point });

function saveEvaluateTask() {
  const task: TaskEvaluationInput = {
    id: '',
    taskId: props.taskId,
    ok: checkedPass.value,
    point: point.value,
    description: description.value,
  };
  saveMutate({ task: task });
}

saveOnDone(() => {
  toastSuccess({
    message: t(`common.result.message.${isCreate ? 'created' : 'updated'}`, {
      itemType: t('work.deadlineTask.objectName'),
      itemName: props.taskId
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
  taskId: string,
  taskName: string,
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
    command: () => saveEvaluateTask()
  }
};
provide('dialogFooterButtons', deadlineTaskFormFooterButtons);

function changeCheckedPass() {
  checkedNotPass.value = !checkedPass.value;
}

function changeCheckedNotPass() {
  checkedPass.value = !checkedNotPass.value;
}
</script>

<script lang='ts'>
export default { name: 'EvaluateResultDialog' };
</script>