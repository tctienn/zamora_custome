<template>
  <Dialog
    v-model:visible='visible'
    :close-on-escape='false'
    :header='t("work.detail")'
    style='width: 75vw; height: 90vh;'
    v-bind='DEFAULT_DIALOG_CONFIG'
    @hide='emits("hide-dialog")'>
    <form
      ref='form'
      class='column-gap-2 flex flex-row h-full'>
      <WorkDetailLeftPanel
        :permission='permission'
        :task-fields='taskFields'/>

      <Divider
        class='mx-1'
        layout='vertical'/>
      <div class='flex flex-column main-panel overflow-y-auto row-gap-2 w-full'>
        <WorkDetailMainPanel
          :permission='permission'
          :task-dynamic-fields='taskDynamicFields'
          :task-fields='taskFields'
          @update-dynamic-data='updateDynamicData'
          @update-file='updateDynamicFile'/>
      </div>

      <Divider
        class='mx-1'
        layout='vertical'/>

      <WorkInformationRightPanel
        v-if='task.id'
        :permission='permission'
        :show-action='true'
        :task-fields='taskFields'
        @update-task-dynamic-fields='updateTaskDynamicFields'
        @update-task-optional-fields='updateTaskOptionalFields'/>
    </form>

    <template #footer>
      <div class='flex flex-row justify-content-center'>
        <ButtonIcon
          icon='close'
          :label='t("common.close")'
          severity='danger'
          text
          @click='close'/>
        <ButtonIcon
          v-if='computedPermissions.isUpdateInfo'
          icon='check'
          :label='t("common.save")'
          @click='updateWork'/>
      </div>
    </template>
  </Dialog>
</template>

<script lang='ts' setup>
import '@/apps/work/views/actions/SaveWork.vue';

import { get, omit, pick, sumBy, xor } from 'lodash';
import { storeToRefs } from 'pinia';
import { computed, onMounted, provide, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { DataType, Property } from '@/apps/admin/model/object/Property';
import { getObjectPropertiesGraphql } from '@/apps/work/api/graphql/object-template-api';
import { saveTaskGraphql } from '@/apps/work/api/graphql/task-api';
import { type PermissionTask, TaskAction } from '@/apps/work/model/permission';
import type { Participant, TaskLabel, TaskLocation, Work } from '@/apps/work/model/task';
import { useTaskPermissionStore } from '@/apps/work/store/task_permission';
import { useTaskDetailStore } from '@/apps/work/store/taskDetail';
import WorkDetailLeftPanel from '@/apps/work/views/actions/components/WorkDetailLeftPanel.vue';
import WorkDetailMainPanel from '@/apps/work/views/actions/components/WorkDetailMainPanel.vue';
import WorkInformationRightPanel from '@/apps/work/views/actions/components/WorkInformationRightPanel.vue';
import { getActiveUsersGraphql } from '@/common/api/graphql/user-graphql';
import { DEFAULT_DIALOG_CONFIG } from '@/common/constants';
import { toastError, toastSuccess } from '@/common/helpers/custom-toast-service';
import { type Attachment } from '@/common/model';
import { User } from '@/common/model/User';

const props = defineProps({
  dialogVisible: {
    type: Boolean,
    default: false
  }
});

const emits = defineEmits(['hide-dialog', 'reload']);

const permissionStore = useTaskPermissionStore();
const {
  mutate: saveTaskMutate,
  onDone: saveTaskOnDone,
  onError: saveTaskOnError
} = saveTaskGraphql();

const taskDetailStore = useTaskDetailStore();
const { task } = storeToRefs(taskDetailStore);
task.value = {
  ...task.value,
  dueTime: task.value.dueTime ? task.value.dueTime : undefined,
  completionTime: task.value.completionTime ? task.value.completionTime : undefined,
  checkLists: task.value.checkLists ? task.value.checkLists : [],
  locations: task.value.locations ? task.value.locations : [],
  attachments: task.value.taskAttachments ? task.value.taskAttachments : [],
  taskCustomers: task.value.taskCustomers ? task.value.taskCustomers : []
};

const { t } = useI18n();
const visible = ref(props.dialogVisible);
const users = ref<User[]>([]);
const dynamicFields = ref<{ key: string, value: unknown, type: DataType }[]>([]);
const properties = ref<Property[]>([]);
const permission = ref<PermissionTask>({} as PermissionTask);

const taskFields = ref(computed(() => {
  let result = [];
  for (const key in task.value) {
    if (task.value[key as keyof Work] !== null) {
      result.push(key);
    }
  }

  result = [...result,
    ...task.value.participants?.map(p => p.type.toLowerCase()) ?? [],
    ...task.value.extends?.map(e => e.fieldName) ?? []];
  return result;
}).value);

const taskDynamicFields = ref<Property[]>([]);
const dynamicAttachments = ref<Attachment[]>([]);
const form = ref();

const {
  onResult: getObjectPropertiesOnResult,
  onError: getObjectPropertiesOnError
} = getObjectPropertiesGraphql();
getObjectPropertiesOnResult(res => {
  properties.value = res.data.getObjectProperties;
  taskDynamicFields.value = properties.value.filter(p => task.value.extends?.map(e => e.fieldName === p.fieldName));
});
getObjectPropertiesOnError(e => {
  toastError();
});

function updateTaskOptionalFields(field: string) {
  const dependentFields = [['assessorId', 'evaluate']];
  const fields = dependentFields.find(f => f.includes(field)) || [field];
  taskFields.value = xor(taskFields.value, fields);
}

function updateWork() {
  let {
    implementer,
    supervisor,
    cooperator,
    locations,
    labels,
    participants
  } = task.value;
  let listImplement: Participant[] = implementer?.map((user) =>
    participants?.find(p => p.type === 'IMPLEMENTER' && p.participantId === user.id)
      ?? {
        type: 'IMPLEMENTER',
        participantId: user.id || '',
      }) || [];
  if (sumBy(listImplement, 'percent') !== 1) {
    const defaultImplPercent = 1 / (listImplement?.length || 0) ?? 0;
    listImplement = listImplement.map(p => ({
      ...p,
      percent: defaultImplPercent
    }));
  }

  const listSupervisor: Participant[] = supervisor?.map((user) =>
    participants?.find(p => p.type === 'SUPERVISOR' && p.participantId === user.id)
      ?? {
        type: 'SUPERVISOR',
        participantId: user.id || '',
      }) || [];

  const listCooperator: Participant[] = cooperator?.map((user) =>
    participants?.find(p => p.type === 'COOPERATOR' && p.participantId === user.id)
      ?? {
        type: 'COOPERATOR',
        participantId: user.id || '',
      }) || [];

  const taskStore: Work = {
    ...task.value,
    participants: listCooperator.concat(listSupervisor, listImplement).map(p => pick(p, 'type', 'participantId', 'percent')),
    checkLists: task.value.checkLists?.map((task) => ({
      isComplete: task.isComplete,
      taskId: task.id,
      name: task.name
    })),
    locations: locations?.map((location: TaskLocation) => ({
      name: location.name,
      taskId: task.value.id
    })),
    labels: labels?.map((label: TaskLabel) => ({
      id: task.value.id,
      labelColor: label.labelColor,
      labelTitle: label.labelTitle
    })),
    repeatConfig: task.value.isRepeat ? omit(task.value.repeatConfig, 'id') : undefined,
    oldAttachmentIds: (task.value.taskAttachments?.filter((a: Attachment) => !a.isNew).map((a: Attachment) => (a.id || '') as string) ?? [])
      .concat(dynamicAttachments.value ? dynamicAttachments.value.filter((a: Attachment) => !a.isNew).map((a: Attachment) => a.id as string) : [])
  };

  saveTaskMutate({
    task: omit(taskStore, 'completionType', 'assigner', 'lastModifiedTime', 'lastModifiedBy', 'attachments',
      'hasExpense', 'hasDynamicField', 'isEvaluated', 'copyFrom',
      'createdBy', 'evaluation', 'children', 'parent',
      'assessor', 'assignerName', 'assessorName',
      'hasAttachment', 'hasChecklist', 'hasCustomer', 'implementer',
      'cooperator', 'supervisor', 'taskAttachments', 'files', 'extends'),
    attachments: task.value.files,
    otherInfos: dynamicFields.value
  });
}

saveTaskOnDone(() => {
  toastSuccess({ message: t('work.task.success.updateSuccess') });
  emits('hide-dialog');
  emits('reload');
});

saveTaskOnError((err) => {
  toastError({ message: t('work.task.error.' + err.graphQLErrors[0].extensions.errorCode) });
});

function updateTaskDynamicFields(field: Property) {
  taskDynamicFields.value = xor(taskDynamicFields.value, [field]);
  updateTaskOptionalFields(field.fieldName);
}

function close() {
  taskDetailStore.clear();
  emits('hide-dialog');
}

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
  dynamicAttachments.value = attachments;
  dynamicFields.value.push({
    key: attachments[0].objectId ?? '',
    value: files,
    type: DataType.FILE
  });
}

const { onResult: getActiveUsersResult } = getActiveUsersGraphql();

getActiveUsersResult((response) => {
  users.value = get(response, 'data.getAllUserStatusActive', []);
});

const computedPermissions = computed(() => {
  return {
    isUpdateInfo: permissionStore.hasPermission(task.value.id || '', TaskAction.UPDATE_INFO),
    isCancel: permissionStore.hasPermission(task.value.id || '', TaskAction.CANCEL),
    isStop: permissionStore.hasPermission(task.value.id || '', TaskAction.STOP),
    isCopy: permissionStore.hasPermission(task.value.id || '', TaskAction.COPY),
    isConfigure: permissionStore.hasPermission(task.value.id || '', TaskAction.CONFIGURE),
    isDelete: permissionStore.hasPermission(task.value.id || '', TaskAction.DELETE),
    isUpdateImplementer: permissionStore.hasPermission(task.value.id || '', TaskAction.UPDATE_IMPLEMENTER),
    isUpdateCooperator: permissionStore.hasPermission(task.value.id || '', TaskAction.UPDATE_COOPERATOR),
    isUpdateSupervisor: permissionStore.hasPermission(task.value.id || '', TaskAction.UPDATE_SUPERVISOR),
    isUpdateAssessor: permissionStore.hasPermission(task.value.id || '', TaskAction.UPDATE_ASSESSOR),
    isUpdateAttributes: permissionStore.hasPermission(task.value.id || '', TaskAction.UPDATE_ATTRIBUTES),
    isComment: permissionStore.hasPermission(task.value.id || '', TaskAction.COMMENT),
    isViewHistory: permissionStore.hasPermission(task.value.id || '', TaskAction.VIEW_HISTORY),
    isChangeDeadline: permissionStore.hasPermission(task.value.id || '', TaskAction.CHANGE_DEADLINE),
    isUpdateResult: permissionStore.hasPermission(task.value.id || '', TaskAction.UPDATE_RESULT),
    isUpdateExpense: permissionStore.hasPermission(task.value.id || '', TaskAction.UPDATE_EXPENSE),
    isEvaluate: permissionStore.hasPermission(task.value.id || '', TaskAction.EVALUATE),
  };
});

onMounted(async () => {
  await permissionStore.getPermissionsForTask(task.value.id || '');
  permission.value = computedPermissions.value;
});

provide('all-active-user', users);

</script>

<script lang='ts'>
export default { name: 'WorkDetailComponent' };
</script>

<style lang='scss' scoped>
:deep(.main-panel) {
  &::-webkit-scrollbar {
    display: none;
  }
}
</style>