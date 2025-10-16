<template>
  <Dialog
    v-model:visible='visible'
    :header='headerDialog'
    v-bind='DEFAULT_DIALOG_CONFIG'
    @hide='emits("hide-dialog")'>
    <div
      v-disabled='{disabled: isDetail}'
      class='flex-column mt-1 p-fluid'>
      <div class='flex flex-column row-gap-2'>
        <div class='col px-3 py-2'>
          <span class='align-items-center flex'>
            <label
              class='w-2'
              for='id'>{{ t('work.taskCost.type') }}</label>
            <Dropdown
              v-model='taskCost.expenseCategory'
              class='w-full'
              :empty-message='t("common.selectEmpty")'
              :filter='true'
              option-label='name'
              option-value='code'
              :options='categories'
              :placeholder='t("common.select") + " " + toLower(t("work.taskCost.type"))'/>
          </span>
          <ValidateErrorMessage :errors='v$.expenseCategory.$errors'/>
        </div>

        <div class='col px-3 py-2'>
          <span class='align-items-center flex'>
            <label
              class='w-2'
              for='id'>{{ t('work.taskCost.expenseTime') }}</label>
            <Calendar
              v-model='taskCost.expenseTime'
              class='w-full'
              hour-format='24'
              show-time/>
          </span>
          <ValidateErrorMessage :errors='v$.expenseTime.$errors'/>
        </div>

        <div class='col px-3 py-2'>
          <span class='align-items-center flex'>
            <label
              class='w-2'
              for='id'>{{ t('work.taskCost.totalMoney') }}</label>
            <InputNumber
              id='number-input'
              v-model='taskCost.totalMoney'
              :max='1000000000000'
              :min='0'/>
          </span>
        </div>

        <div class='col px-3 py-2'>
          <span class='align-items-center flex'>
            <label
              class='w-2'
              for='id'>{{ t('work.taskCost.description') }}</label>
            <InputText
              id='text-input'
              v-model='taskCost.description'
              maxlength='255'/>
          </span>
        </div>

        <div class='col mt-2 px-3 py-2'>
          <div
            class='field'>
            <AppFileAttachment
              :attachments='taskCost.attachments ?? []'
              :title='t("common.attachment")'
              @update-files='updateAttachments'/>
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
import { get, omit, toLower } from 'lodash';
import { provide, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { getCategoryByGroup } from '@/apps/admin/api/graphql/category-graphql-api';
import ValidateErrorMessage from '@/apps/admin/components/custom/ValidateErrorMessage.vue';
import type { CategoryInterface } from '@/apps/admin/model/category';
import { saveExpenseGraphql } from '@/apps/work/api/graphql/task-expense-api';
import type { Task } from '@/apps/work/model/task';
import type { TaskExpense } from '@/apps/work/model/taskCost';
import AppFileAttachment from '@/common/components/app/upload/AppFileAttachment.vue';
import DialogFooter from '@/common/components/dialog/DialogFooter.vue';
import { DEFAULT_DIALOG_CONFIG } from '@/common/constants';
import { toastError, toastSuccess } from '@/common/helpers/custom-toast-service';
import useMoment from '@/common/helpers/mixins/use-moment';
import type { Attachment } from '@/common/model';

const props = withDefaults(defineProps<ConfigFormProps>(), {
  visibleDialog: false,
  isDetail: false,
  item: undefined,
  expense: () => ({} as TaskExpense)
});

const emits = defineEmits(['hide-dialog', 'reload']);

const taskAttachments = ref<Attachment[]>(props.item.attachments ?? []);
const files = ref<FileList>();

const { t } = useI18n();

const visible = ref(props.visibleDialog);
const headerDialog = t('common.editItemName', {
  item: toLower(t('work.taskCost.objectName')),
  name: props.item.name
});
const taskCost = ref<TaskExpense>({
  ...props.expense,
  expenseTime: props.expense.expenseTime ? new Date(props.expense.expenseTime) : new Date()
});

const categories = ref<CategoryInterface[]>([]);

const {
  onResult: getAllCategoryByGroupCodeOnResult,
  onError: getAllCategoryByGroupCodeOnError
} = getCategoryByGroup('COST_TYPE');
getAllCategoryByGroupCodeOnResult(res => {
  categories.value = get(res, 'data.getCategoryByGroup', []);
});
getAllCategoryByGroupCodeOnError(res => {
});

const {
  mutate: saveMutate,
  onDone: saveOnDone,
  onError: saveOnError
} = saveExpenseGraphql();
const validateRules = {
  expenseCategory: { required: helpers.withMessage(t('work.taskCost.message.typeEmpty'), required) },
  expenseTime: { required: helpers.withMessage(t('work.taskCost.message.expenseTimeEmpty'), required) }
};

const v$ = useVuelidate(validateRules, taskCost);
const { moment } = useMoment();

function saveCostTask() {
  v$.value.$validate().then((isValid) => {
    if (isValid) {
      taskCost.value.oldAttachmentIds = taskAttachments.value
        .filter((a: Attachment) => !a.isNew)
        .map((a: Attachment) => a.id)
        .filter((id: string | undefined) => id !== undefined) as string[];
      taskCost.value.taskId = props.item.id ?? '';
      saveMutate({
        taskExpense: omit(taskCost.value, ['attachments', 'lastModifiedBy']),
        attachments: files.value
      });
    }
  });
}

saveOnDone(() => {
  toastSuccess({
    message: t('common.cost.message.updated', {
      itemType: t('work.taskCost.objectName'),
      itemName: props.item.name
    })
  });
  emits('reload');
  emits('hide-dialog');
});
saveOnError(e => {
  toastError();
});

interface ConfigFormProps {
  visibleDialog: boolean,
  item: Task,
  isDetail: boolean,
  expense: TaskExpense
}

const costTaskFormFooterButtons = {
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
    command: () => saveCostTask()
  }
};
provide('dialogFooterButtons', costTaskFormFooterButtons);

function updateAttachments(attachments: Attachment[], fileUploads: FileList) {
  taskAttachments.value = attachments;
  files.value = fileUploads;
}

</script>

<script lang='ts'>
export default { name: 'AddExpenseDialog' };
</script>