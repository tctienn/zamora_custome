<template>
  <Dialog
    v-model:visible='visible'
    :close-on-escape='false'
    :header='t("work.create")'
    style='width: 75vw;'
    v-bind='DEFAULT_DIALOG_CONFIG'
    @hide='emits("hide-dialog")'>

    <form
      ref='form'
      class='column-gap-2 flex flex-row h-full'>
      <div class='flex flex-column main-panel overflow-y-auto row-gap-2 w-full'>
        <SaveWorkMainPanel
          ref='saveWorkMainPanelRef'
          :task-copy='taskCopy as Task'
          :task-fields='taskFields'/>

        <Divider v-if='taskDynamicFields.length'/>

        <WorkInformationAdditionPanel
          :task-dynamic-fields='taskDynamicFields'
          @update-dynamic-data='updateDynamicData'
          @update-file='updateDynamicFile'/>
      </div>

      <Divider
        class='mx-1'
        layout='vertical'/>

      <WorkInformationRightPanel
        :task-fields='taskFields'
        @update-task-dynamic-fields='updateTaskDynamicFields'
        @update-task-optional-fields='updateTaskOptionalFields'/>
    </form>

    <template #footer>
      <DialogFooter/>
    </template>
  </Dialog>
</template>

<script lang='ts' setup>
import '@/apps/work/views/actions/SaveWork.vue';

import { concat, filter, find, get, map, omit, xor } from 'lodash';
import { computed, type PropType, provide, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { DataType, Property } from '@/apps/admin/model/object/Property';
import { saveTaskGraphql } from '@/apps/work/api/graphql/task-api';
import { StatusType } from '@/apps/work/model/configWorkStatus';
import { ParticipantType, type Task } from '@/apps/work/model/task';
import { useTaskStore } from '@/apps/work/store/task';
import SaveWorkMainPanel from '@/apps/work/views/actions/components/SaveWorkMainPanel.vue';
import WorkInformationAdditionPanel from '@/apps/work/views/actions/components/WorkInformationAdditionPanel.vue';
import WorkInformationRightPanel from '@/apps/work/views/actions/components/WorkInformationRightPanel.vue';
import { getActiveUsersGraphql } from '@/common/api/graphql/user-graphql';
import DialogFooter from '@/common/components/dialog/DialogFooter.vue';
import { DEFAULT_DIALOG_CONFIG } from '@/common/constants';
import { toastErrorData, toastSuccess } from '@/common/helpers/custom-toast-service';
import useMoment from '@/common/helpers/mixins/use-moment';
import type { Attachment } from '@/common/model';
import { User } from '@/common/model/User';

const props = defineProps({
  dialogVisible: {
    type: Boolean,
    default: false
  },
  item: {
    type: Object as PropType<Task>,
    default: {} as Task
  }
});

const emits = defineEmits(['hide-dialog', 'reload']);

const { t } = useI18n();
const { moment } = useMoment();
const taskStore = useTaskStore();
const { statuses } = taskStore;
const taskCopy = ref<Task>(props.item ?? {} as Task);

const saveWorkFooterButtons = {
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
    command: () => saveWork()
  }
};
provide('dialogFooterButtons', saveWorkFooterButtons);

const visible = ref(props.dialogVisible);
const users = ref<User[]>([]);
const saveWorkMainPanelRef = ref();
const taskDynamicFields = ref<Property[]>([]);
const form = ref();
const dynamicFields = ref<{ key: string, value: unknown, type: DataType }[]>([]);
const taskFields = ref(computed(() => {
  let result = [];
  for (const key in props.item) {
    if (props.item[key as keyof Task] !== null) {
      result.push(key);
    }
  }

  result = [...result,
    ...props.item.participants?.map(p => p.type.toLowerCase()) ?? [],
    ...props.item.extends?.map(e => e.fieldName) ?? []];
  return result;
}).value);

function updateTaskOptionalFields(field: string) {
  taskFields.value = xor(taskFields.value, [field]);
}

function updateTaskDynamicFields(field: Property) {
  taskDynamicFields.value = xor(taskDynamicFields.value, [field]);
  updateTaskOptionalFields(field.fieldName);
}

const { onResult: getActiveUsersResult } = getActiveUsersGraphql();

getActiveUsersResult((response) => {
  users.value = get(response, 'data.getAllUserStatusActive', []);
});

provide('all-active-user', users);

const {
  mutate: saveTaskMutate,
  onDone: saveTaskOnDone,
  onError: saveTaskOnError
} = saveTaskGraphql();

async function saveWork() {
  const mainTask = saveWorkMainPanelRef.value.mainTask;
  const taskData = saveWorkMainPanelRef.value.taskData;
  const validateTask = saveWorkMainPanelRef.value.validateTask;
  const startStatus = find(statuses, ['type', StatusType.START]);
  if (startStatus?.id) {
    const {
      startTime,
      dueTime,
      assigner,
      assessor,
      isRepeat
    } = mainTask;
    const {
      attachments,
      files,
      checklist,
      source,
      location,
      parent,
      repeatConfig,
      taskCustomers
    } = taskData;
    const task: Task = {
      ...mainTask,
      statusId: startStatus.id,
      startTime: moment(startTime).format('YYYY-MM-DDTHH:mm:ss'),
      dueTime: dueTime ? moment(dueTime).format('YYYY-MM-DDTHH:mm:ss') : null,
      assignerId: assigner?.id,
      assessorId: assessor?.id,
      parentId: parent.value?.id,
      participants: concat(...map(Object.keys(taskData.participants.value), (key: ParticipantType) => {
        return map(taskData.participants.value[key], (user) => ({
          type: ParticipantType[key],
          participantId: user.id,
          percent: 1 / taskData.participants.value[key].length || 0
        }));
      })),
      checkLists: map(filter(checklist.value, 'name'), (checklist) => ({
        taskId: '',
        name: checklist.name
      })),
      locations: map(filter(location.value, 'name'), (location) => ({
        taskId: '',
        name: location.name
      })),
      oldAttachmentIds: attachments.value.filter((a: Attachment) => !a.isNew).map((a: Attachment) => a.id),
      repeatConfig: isRepeat ? {
        ...repeatConfig,
        createTimeConfig: moment(repeatConfig.createTimeConfig).format('HH:mm:ss')
      } : null,
      taskCustomers: map(taskCustomers.value, (taskCustomer) => ({
        taskId: '',
        clientId: taskCustomer.id
      })),
    };

    if (await validateTask()) {
      await saveTaskMutate({
        task: omit(task, 'completionType', 'assigner', 'assessor',
          'assessorName', 'assignerName', 'statusName', 'checkListCount',
          'commentCount', 'completionType', 'createdBy', 'createdTime',
          'labels', 'lastModifiedTime', 'hasLocation', 'hasAttachment'),
        attachments: files.value,
        otherInfos: dynamicFields.value
      });
    }
  }
}

saveTaskOnDone(res => {
  toastSuccess({});
  taskStore.addTask(res.data.saveTask);
  // emits('reload');
});

saveTaskOnError((error) => {
  toastErrorData({ error });
});

function updateDynamicData(fieldName: string, inputData: unknown, type: DataType) {
  const keyIndex = dynamicFields.value.findIndex(item => item.key === fieldName);
  if (keyIndex !== -1) {
    dynamicFields.value[keyIndex].value = inputData;
  } else {
    dynamicFields.value.push({
      key: fieldName,
      value: inputData,
      type: type
    });
  }
}

function updateDynamicFile(attachments: Attachment[], files: FileList) {
  dynamicFields.value.push({
    key: attachments[0].objectId ?? '',
    value: files,
    type: DataType.FILE
  });
}
</script>

<script lang='ts'>
export default { name: 'SaveWork' };
</script>

<style lang='scss' scoped>
:deep(.main-panel) {
  &::-webkit-scrollbar {
    display: none;
  }
}
</style>