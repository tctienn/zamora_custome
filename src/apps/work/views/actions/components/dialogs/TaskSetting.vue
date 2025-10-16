<template>
  <Dialog
    v-model:visible='visible'
    :header='t("work.taskSetting.title")'
    v-bind='DEFAULT_DIALOG_CONFIG'
    @hide='emits("hide-dialog")'>
    <DataTable
      context-menu
      :value='taskSetting.tasks'
      v-bind='DEFAULT_DATATABLE_CONFIG'>

      <template #empty>
        <span class='block font-bold text-600 text-center'>{{
          t('common.emptyRecords', {itemType: toLower(t('work.weight'))})
        }}</span>
      </template>

      <template #header>
        <div class='align-items-center flex flex-wrap justify-content-between'>
          <span class='font-bold ml-2 text-primary text-white text-xl'>{{ t('work.weight') }} - {{ task.name }}</span>
        </div>
      </template>

      <Column
        class='bg-transparent text-color'
        header='#'>
        <template #body='{index}'>
          {{ index + 1 }}
        </template>
      </Column>

      <Column
        class='bg-transparent text-color'
        field='name'
        :header='t("work.name")'>
      </Column>

      <Column
        class='bg-transparent text-color'
        field='description'
        :header='t("work.description")'/>

      <Column
        class='bg-transparent text-color'
        field='implement'
        :header='t("work.implementer")'>
        <template #body='{data:{participants}}'>
          <AppGroupAvatar
            v-if='(participants as Participant[]).length > 0'
            :users='(participants as Participant[]).map(item=>({id: item.id, fullName: item.participantName}))'/>
        </template>
      </Column>

      <Column
        class='bg-transparent max-w-6rem text-color'
        field='weight'
        :header='t("work.weight")'>
        <template #body='{data:{weight,id}}'>
          <span
            v-if='id === editValue'
            class='p-input-icon-right'>
            <i
              class='pi pi-check'
              @click='closeEdit'/>
            <InputNumber
              input-class='w-6rem'
              :max='1'
              :max-fraction-digits='1'
              :min='0'
              :min-fraction-digits='1'
              :model-value='weight'
              @update:model-value='updateWeight($event,id)'/>
          </span>
          <div
            v-else
            class='flex justify-content-between'>
            <span>{{ weight }}</span>
            <i
              class='cursor-pointer pi pi-pencil'
              @click='editWeight(id)'/>
          </div>
        </template>
      </Column>

    </DataTable>
    <DataTable
      class='mt-5'
      :value='taskSetting.participantTaskSettingResponse'
      v-bind='DEFAULT_DATATABLE_CONFIG'>

      <template #empty>
        <span class='block font-bold text-600 text-center'>{{
          t('common.emptyRecords', {itemType: toLower(t('work.taskSetting.resource.title'))})
        }}</span>
      </template>

      <template #header>
        <div class='align-items-center flex flex-wrap justify-content-between'>
          <span class='font-bold ml-2 text-primary text-white text-xl'>{{ t('work.taskSetting.resource.title') }}</span>
        </div>
      </template>

      <Column
        class='bg-transparent text-color'
        header='#'>
        <template #body='{index}'>
          {{ index + 1 }}
        </template>
      </Column>

      <Column
        class='bg-transparent text-color'
        field='participantName'
        :header='t("work.taskSetting.resource.name")'/>

      <Column
        class='bg-transparent text-color'
        field='positionName'
        :header='t("work.taskSetting.resource.position")'/>

      <Column
        class='bg-transparent text-color'
        field='percent'
        :header='t("work.taskSetting.resource.participationRate")'>
        <template #body='{data:{percent,id}}'>
          <div class='flex justify-content-between'>
            <span>{{ percent * 100 }}%</span>
            <i
              class='cursor-pointer pi pi-delete-left text-red-300'
              @click='deleteParticipant(id)'/>
          </div>
        </template>
      </Column>
    </DataTable>

    <div class='card mt-5 w-full'>
      <h5>{{ t('work.taskSetting.warningReminder.title') }}</h5>
      <div class='align-items-center flex gap-2'>
        <span class='ml-4 w-3'>{{ t('work.taskSetting.warningReminder.advance') }}:</span>
        <InputNumber
          id='warningBeforeDays'
          v-model='taskSetting.remind.warningBeforeDays'/>
        <span>{{ t('common.date') }}</span>
      </div>
      <div class='align-items-center flex flex-wrap gap-3 mt-4'>
        <span class='ml-4 w-3'>{{ t('work.taskSetting.warningReminder.method') }}:</span>
        <div class='align-items-center flex'>
          <Checkbox
            v-model='taskSetting.remind.emailAlert'
            binary
            input-id='email'/>
          <label
            class='ml-2'
            for='email'> {{ t('common.email') }} </label>
        </div>
        <div class='align-items-center flex'>
          <Checkbox
            v-model='taskSetting.remind.notification'
            binary
            input-id='notification'/>
          <label
            class='ml-2'
            for='notification'> {{ t('work.taskSetting.warningReminder.notification') }} </label>
        </div>
      </div>
    </div>

    <template #footer>
      <DialogFooter/>
    </template>

  </Dialog>

</template>

<script lang='ts' setup>
import { cloneDeep, toLower } from 'lodash';
import Column from 'primevue/column';
import { type PropType, provide, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { getTaskSettingGraphql, saveTaskSettingGraphql } from '@/apps/work/api/graphql/task-setting-api';
import type { Participant, Task, TaskSetting } from '@/apps/work/model/task';
import AppGroupAvatar from '@/common/components/app/AppGroupAvatar.vue';
import DialogFooter from '@/common/components/dialog/DialogFooter.vue';
import { DEFAULT_DATATABLE_CONFIG, DEFAULT_DIALOG_CONFIG } from '@/common/constants';
import { toastError, toastSuccess } from '@/common/helpers/custom-toast-service';

const props = defineProps({
  visibleDialog: {
    type: Boolean,
    default: false
  },
  task: {
    type: Object as PropType<Task>,
    default: {} as Task
  }
});
const emits = defineEmits(['hide-dialog']);
const { t } = useI18n();
const visible = ref(props.visibleDialog);
const editValue = ref();
const updatedWeight = ref<{ id: string, weight: number }[]>([]);
const removeParticipantIds = ref<string[]>([]);
let taskSetting = ref<TaskSetting>({
  tasks: [],
  participantTaskSettingResponse: [],
  remind: {
    id: '',
    taskId: '',
    warningBeforeDays: 0,
    emailAlert: true,
    notification: true
  }
});

const {
  onResult: getTaskSettingOnResult,
  onError: getTaskSettingOnError
} = getTaskSettingGraphql(props.task?.id || '');
getTaskSettingOnResult(res => {
  taskSetting.value = cloneDeep(res.data.getTaskSetting);
});

getTaskSettingOnError(error => {
  toastError();
});

const taskSettingFooterButtons = {
  closeButton: {
    icon: 'close',
    label: t('common.close'),
    text: true,
    severity: 'danger',
    type: 'button',
    command: () => emits('hide-dialog')
  },
  actionButton: {
    icon: 'check',
    label: t('common.save'),
    text: false,
    type: 'button',
    command: () => saveTaskSetting()
  }
};
provide('dialogFooterButtons', taskSettingFooterButtons);

function editWeight(id: string) {
  editValue.value = id;
}

function deleteParticipant(id: string) {
  removeParticipantIds.value.push(id);
  const indexToDelete = taskSetting.value.participantTaskSettingResponse.findIndex(item => item.id === id);
  if (indexToDelete !== -1) {
    taskSetting.value.participantTaskSettingResponse.splice(indexToDelete, 1);
  }
}

const {
  mutate: saveTaskSettingMutate,
  onDone: saveTaskSettingOnDone,
  onError: saveTaskSettingOnError
} = saveTaskSettingGraphql();
saveTaskSettingOnDone(() => {
  toastSuccess({ message: t('common.result.message.updateSuccess') });
});
saveTaskSettingOnError(res => {
  toastError();
});

function saveTaskSetting() {
  taskSetting.value.tasks.unshift();
  saveTaskSettingMutate({
    taskSettingInput: {
      tasks: taskSetting.value.tasks.map(item => ({
        id: item.id,
        weight: item.weight
      })),
      participantRemove: removeParticipantIds.value,
      remind: taskSetting.value.remind,
      parentId: props.task.id
    }
  });
}

function updateWeight(value: number, id: string) {
  const taskToUpdate = taskSetting.value.tasks.find(task => task.id === id);
  if (taskToUpdate) {
    const existingItemIndex = updatedWeight.value.findIndex(item => item.id === id);
    if (existingItemIndex > -1) {
      const weightToUpdate = updatedWeight.value.find(item => item.id === id);
      if (weightToUpdate) {
        weightToUpdate.weight = value;
      }
    } else {
      updatedWeight.value = [...updatedWeight.value, {
        id: id,
        weight: value
      }];
    }

    if (updatedWeight.value.length === taskSetting.value.tasks.length) {
      updatedWeight.value.shift();
    }

    taskToUpdate.weight = value;
    let valueToSubtract = 1;
    for (const item of updatedWeight.value) {
      valueToSubtract -= item.weight;
    }
    while (valueToSubtract < 0) {
      if (updatedWeight.value[0].id !== id) {
        valueToSubtract += updatedWeight.value[0].weight;
        updatedWeight.value.shift();
      } else {
        valueToSubtract += updatedWeight.value[1].weight;
        updatedWeight.value.splice(1, 1);
      }
    }
    let count = 0;
    for (const task of taskSetting.value.tasks) {
      if (!updatedWeight.value.some(item => item.id === task.id) && task.id !== props.task.id) {
        task.weight = parseFloat((valueToSubtract / (taskSetting.value.tasks.length - updatedWeight.value.length - count)).toFixed(1));
        valueToSubtract -= task.weight;
        count++;
      }
    }
  }
}

function closeEdit() {
  editValue.value = '';
}

</script>

<script lang='ts'>
export default { name: 'TaskSetting' };
</script>

<style scoped>

</style>