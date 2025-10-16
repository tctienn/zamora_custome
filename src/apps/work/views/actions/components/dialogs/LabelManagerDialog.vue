<template>
  <LabelDialog
    v-if='labelDialogFormVisible'
    :id-task='idTask'
    :is-detail='isDetail'
    :visible-dialog='labelDialogFormVisible'
    @hide-dialog='hideLabelDialogFormDialog'
    @reload='reload'/>
  <Dialog
    v-model:visible='visible'
    :header='headerDialog'
    v-bind='DEFAULT_DIALOG_CONFIG'
    @hide='emits("hide-dialog")'>
    <div
      v-disabled='{disabled: isDetail}'
      class='flex-column mt-1 p-fluid'>
      <div
        class='d-flex justify-content-between'>
        <div class='actions mb-2'>
          <ButtonIcon
            icon='add_circle'
            rounded
            text
            @click='showLabelTaskFormDialog'/>
        </div>
      </div>
      <Chip
        v-for='(task, index) in labelTasks'
        :key='index'
        class='mr-2 pb-1 pt-1'
        :outlined='true'
        removable
        :style="{
          backgroundColor: 'white',
          border: '1px solid ' + task.labelColor,
          color: task.labelColor
        }"
        @remove='removeValue(task.id)'>
        <!-- Input để chỉnh sửa label -->
        <input
          v-if='editingIndex === index'
          v-model='labelTitle'
          class='input-no-border'
          :maxlength='100'
          :style='{
            color: task.labelColor
          }'
          @blur='endEditingLabel(task)'
          @keyup.enter='endEditingLabel(task)'/>
        <!-- Hiển thị label hoặc ẩn nó khi đang chỉnh sửa -->
        <span
          v-else
          @click='startEditingLabel(task, index)'>{{ task.labelTitle }}</span>
      </Chip>
    </div>

    <template #footer>
      <DialogFooter/>
    </template>
  </Dialog>
</template>

<script lang='ts' setup>
import { get } from 'lodash';
import { provide, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import {
  removeTaskLabelsByGraphql,
  saveLabelGraphql,
  taskLabelByTaskIdGraphql
} from '@/apps/work/api/graphql/task-label-api';
import type { TaskLabelInput } from '@/apps/work/model/taskLabel';
import LabelDialog from '@/apps/work/views/actions/components/dialogs/LabelDialog.vue';
import ButtonIcon from '@/common/components/custom/ButtonIcon.vue';
import DialogFooter from '@/common/components/dialog/DialogFooter.vue';
import { DEFAULT_DIALOG_CONFIG } from '@/common/constants';
import { toastErrorData, toastSuccess } from '@/common/helpers/custom-toast-service';

const props = withDefaults(defineProps<ConfigFormProps>(), {
  visibleDialog: false,
  isDetail: false,
  taskId: undefined
});

const emits = defineEmits(['hide-dialog', 'reload']);

const { t } = useI18n();

const visible = ref(props.visibleDialog);
const headerDialog = t('work.taskLabel.objectName');
let labelTasks = ref<TaskLabelInput[]>();
let labelInput = ref<TaskLabelInput>();
let labelTitle = ref('');

const {
  onResult: taskLabelByTaskIdOnResult,
  onError: taskLabelByTaskIdOnError,
  refetch: taskLabelByTaskIdRefetch
} = taskLabelByTaskIdGraphql(props.taskId);

taskLabelByTaskIdOnResult((res) => {
  labelTasks.value = get(res, 'data.taskLabelByTaskId', []);
});

taskLabelByTaskIdOnError((error) => {
  toastErrorData({ error });
});

interface ConfigFormProps {
  visibleDialog: boolean,
  taskId: string,
  isDetail: boolean,
}

const taskLabelManagerFormFooterButtons = {
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
    command: () => updateLabel()
  }
};
provide('dialogFooterButtons', taskLabelManagerFormFooterButtons);

const {
  mutate: removeMutate,
  onDone: removeOnDone
} = removeTaskLabelsByGraphql();
const listIdLabelRemove: string[] = [];

function removeValue(label: string) {
  listIdLabelRemove.push(label);
}

function updateLabel() {
  removeMutate({ taskLabels: listIdLabelRemove });
}

removeOnDone(() => {
  toastSuccess({
    message: t('common.result.message.updated', {
      itemType: t('work.taskLabel.objectName'),
      itemName: ''
    })
  });
  emits('reload');
  emits('hide-dialog');
});

const labelDialogFormVisible = ref(false);
let isDetailCreate = ref(false);
const idTask = ref();

function showLabelTaskFormDialog() {
  idTask.value = props.taskId;
  labelDialogFormVisible.value = true;
  isDetailCreate.value = true;
}

function hideLabelDialogFormDialog() {
  labelDialogFormVisible.value = false;
}

const {
  mutate: saveMutate,
  onDone: saveOnDone
} = saveLabelGraphql();

function reload() {
  taskLabelByTaskIdRefetch();
}

const editingIndex = ref(-1);

function startEditingLabel(task: TaskLabelInput, index: number) {
  editingIndex.value = index;
  labelInput.value = task;
  labelTitle.value = task.labelTitle;
}

function endEditingLabel(task: TaskLabelInput) {
  if (labelTitle.value) {
    const taskLabel: TaskLabelInput = {
      id: task.id,
      taskId: task.taskId,
      labelColor: task.labelColor,
      labelId: task.labelId,
      labelTitle: labelTitle.value
    };
    saveMutate({ task: taskLabel });
  }
  editingIndex.value = -1;
}

saveOnDone(() => {
  toastSuccess({
    message: t('common.result.message.updated', {
      itemType: t('work.taskLabel.objectName'),
      itemName: ''
    })
  });
  return taskLabelByTaskIdRefetch();
}
);
</script>

<script lang='ts'>
export default { name: 'LabelManagerDialog' };
</script>

<style>
.input-no-border {
  border: none; /* Xóa viền của input */
  outline: none; /* Loại bỏ đường viền chọn khi input đang được focus */
}
</style>
