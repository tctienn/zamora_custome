<template>
  <Sidebar
    v-model:visible='visible'
    :dismissable='false'
    position='right'
    :pt='{
      header: {
        class: "p-0",
      },
    }'
    :show-close-icon='false'
    style='width:55rem;height: 100%'>
    <template #header>
      <div class='w-full'>
        <div class='align-items-center border-300 border-bottom-1 flex justify-content-between p-3 w-full'>
          <div class='align-items-center flex gap-1 max-h-3rem'>
            <Button
              class='border-round-sm h-2rem mr-2 py-1 w-2rem'
              icon='pi pi-arrow-left'
              severity='danger'
              @click='visible=false'/>
          </div>
          <div class='flex justify-content-between w-full'>
            <span class='font-bold text-lg'>
              {{ taskId ? t("work.update") : t("work.create") }}
            </span>
          </div>
        </div>
      </div>
    </template>
    <div>
      <TabView
        v-model:active-index='activeIndex'>
        <TabPanel :header='t("Thông tin chung")'>
          <form
            class='column-gap-2 flex flex-row h-full mb-4'>
            <div class='flex flex-column main-panel row-gap-2 w-full'>
              <SaveWorkMainPanel
                ref='saveWorkMainPanelRef'
                v-model:task='task'
                :disabled-phase-selection='!taskId&&!!phaseId'
                :project-id='projectId'
                :task-id='taskId'/>
            </div>
          </form>
        </TabPanel>
        <TabPanel :header='t("Thuộc tính")'>
          <SaveTaskProperties
            v-model='task'>
          </SaveTaskProperties>
        </TabPanel>
      </TabView>
    </div>

    <div
      class='border-primary-100 border-top-1 bottom-0 fixed flex gap-2 justify-content-center p-1 surface-overlay w-full'>
      <Button
        class='border-round-sm p-button-p-sm p-button-plain'
        icon='pi pi-times'
        :label="t('common.close')"
        :loading='saveLoading'
        severity='danger'
        @click='visible=false'/>
      <Button
        class='border-round-sm p-button-p-sm'
        icon='pi pi-save'
        :label="t('common.save')"
        :loading='saveLoading'
        @click='saveWork'/>
    </div>
  </Sidebar>
</template>

<script lang='ts' setup>
import '@/apps/work/views/actions/SaveWork.vue';

import { omit } from 'lodash';
import { storeToRefs } from 'pinia';
import type Button from 'primevue/button';
import { type PropType, provide, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { increaseTaskStartValue } from '@/apps/work/api/graphql/parameter-config';
import { countMyAssignTask, getTaskGraphql, saveTaskGraphql } from '@/apps/work/api/graphql/task-api';
import type { StatusType } from '@/apps/work/model/configWorkStatus';
import {
  CompletionType,
  OriginModule,
  ParticipantType,
  type Task,
  type TaskInput,
  TaskPriority
} from '@/apps/work/model/task';
import SaveWorkMainPanel from '@/apps/work/views/actions/components/SaveWorkMainPanel.vue';
import SaveTaskProperties from '@/apps/work/views/task/component/form/SaveTaskProperties.vue';
import { toastErrorData, toastSuccess } from '@/common/helpers/custom-toast-service';
import useMoment from '@/common/helpers/mixins/use-moment';
import { useUserStore } from '@/common/store/user';

const props = defineProps({
  taskId: {
    type: String,
    default: undefined
  },
  originCreatedType: {
    type: String as PropType<OriginModule>,
    default: undefined
  },
  originCreatedId: {
    type: String,
    default: undefined
  },
  originData: {
    type: Object,
    default: undefined
  },
  projectId: {
    type: String,
    default: undefined
  },
  phaseId: {
    type: String,
    default: undefined
  },
  parentTaskId: {
    type: String,
    default: undefined
  }
});

const emits = defineEmits(['hide-dialog', 'reload']);

const visible = defineModel<boolean>('visible', { default: false });

const task = ref<Task>();
const { t } = useI18n();
const { moment } = useMoment();
const { user } = storeToRefs(useUserStore());
watch(() => visible.value, (value) => {
  if (!value) {
    return;
  }
  if (!props.taskId) {
    task.value = defaultTask() as Task;
    countMyAssignTask().onResult(res => {
      if (task.value?.orderNo) {
        task.value.orderNo = res.data?.countMyAssignTask ?? 1;
      }
    });
    return;
  }
  getTaskGraphql(props.taskId).onResult(res => {
    const taskData = res.data?.task;
    task.value = {
      ...taskData,
      startTime: new Date(taskData?.startTime),
      dueTime: taskData?.dueTime ? new Date(taskData?.dueTime) : undefined,
      createdDate: new Date(taskData?.createdDate)
    };
  });
}, { immediate: true });

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

const saveWorkMainPanelRef = ref();
const activeIndex = ref<number>(0);
const {
  mutate: saveTaskMutate,
  onDone: saveTaskOnDone,
  onError: saveTaskOnError,
  loading: saveLoading,
} = saveTaskGraphql();

async function saveWork() {
  const validateTask = saveWorkMainPanelRef.value?.validateTask;
  // const startStatus = find(statuses, ['type', StatusType.START]);
  // if (startStatus?.id) {
  if (!task.value) {
    return;
  }
  const {
    startTime,
    dueTime,
    createdDate,
  } = task.value;
  const originModuleData = {
    originCreatedType: props.originCreatedType ?? undefined,
    originCreatedId: props.originCreatedId ?? undefined,
    originData: props.originData ?? undefined,
  };

  const taskInput: TaskInput = {
    ...task.value,
    ...originModuleData,
    completionType: task.value?.completionType,
    statusId: task.value.statusId,
    startTime: moment(startTime).format('YYYY-MM-DDTHH:mm:ss'),
    createdDate: moment(createdDate).format('YYYY-MM-DD'),
    dueTime: dueTime ? moment(dueTime).format('YYYY-MM-DDTHH:mm:ss') : undefined,
    participants: task.value.participants.map(e => ({
      type: e.type,
      participantId: e.participantId,
      percent: e.percent
    })),
    parentId: props.parentTaskId

  };
  const isValidForm = await validateTask();
  if (isValidForm) {
    await saveTaskMutate({
      task: omit(taskInput, 'assigner', 'assessor',
        'assessorName', 'assignerName', 'statusName', 'checkListCount',
        'commentCount', 'createdBy', 'createdTime',
        'labels', 'lastModifiedTime', 'hasLocation', 'hasAttachment',
        'hasChecklist', 'hasCustomer', 'hasExpense', 'hasDynamicField',
        'isEvaluated', 'copyFrom', 'lastModifiedBy', 'lastModifiedTime',
        'taskAttachments', 'evaluation', 'extends', 'children', 'parent'
      ),
    });
    emits('reload');
    // }
  } else {
    //If form is invalid then back tab 0
    activeIndex.value = 0;
  }
}

const { mutate } = increaseTaskStartValue();
saveTaskOnDone(res => {
  toastSuccess({});
  visible.value = false;
  task.value = defaultTask() as Task;
  mutate({});
});

saveTaskOnError((error) => {
  const extension = error.graphQLErrors[0]?.extensions;
  const data = {
    message: '',
    code: '',
  };

  if ((extension?.errorCode as string).startsWith('userNotInProject')) {
    data.message = 'Bạn phải chọn người thuộc trong dự án.';
  }

  if ((extension?.errorCode as string).startsWith('codeIsEarlyExists')) {
    data.message = 'Mã công việc đã tồn tại.';
  }

  if ((extension?.errorCode as string).startsWith('notAllow')) {
    data.message = 'Không có quyền thực hiện';
  }
  if ((extension?.errorCode as string).startsWith('taskAlready')) {
    const statusType: StatusType = (extension?.errorDetail as Record<string, never>)?.statusType;
    data.message = `Công việc ở trạng thái ${t(`common.statuses.${(statusType as string).toLowerCase()}`)}, không thể thực hiện thao tác`;
  }
  toastErrorData({ error: { data: data } });
});

function defaultTask(): Partial<Task> {
  return {
    supervisor: undefined,
    priority: TaskPriority.NORMAL,
    startTime: new Date(),
    completionType: CompletionType.AUTO,
    createdDate: new Date(),
    assignerId: user.value.id,
    projectId: props.projectId,
    participants: [{
      participantId: user.value.id || '',
      type: ParticipantType.IMPLEMENTER,
      percent: 1,
    }],
    orderNo: 1,
    weight: 1,
    phaseId: props.phaseId
  };
}
</script>

<style lang='scss' scoped>

</style>