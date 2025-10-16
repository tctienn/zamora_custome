<template>
  <Dialog
    v-model:visible='visibleForm'
    v-bind='DEFAULT_DIALOG_CONFIG'
    header='Chuyển xử lý '
    @hide="emits('hide-dialog')">
    <div>
      <form ref='form'>
        <div class='formgrid grid mb-4'>
          <div class='col-12 field'>
            <label
              class='font-bold'>Chuyển đến: </label>
            <div>
              <AppUser
                avatar-size='2.5'
                class='p-2'
                info-visible
                :infos="['positionName', 'departments']"
                name-visible
                :user-id='user'></AppUser>
            </div>

          </div>
          <div class='col-12 field'>
            <label
              class='font-bold'>Nội dung: </label>
            <Textarea
              v-model='note'
              class='w-full'
              cols='30'
              name='note'
              rows='3'/>
          </div>
        </div>

        <div
          class='border-primary-100 border-top-1 bottom-0 fixed flex gap-2 justify-content-center p-3 py-2 surface-overlay'
          style='width: 96%'>
          <Button
            class='p-button-plain'
            icon='pi pi-times'
            :label="t('common.close')"
            severity='danger'
            @click="emits('hide-dialog')"/>
          <Button
            icon='pi pi-save'
            :label="t('common.save')"
            @click='startWorkFlow'/>
        </div>
      </form>
    </div>
  </Dialog>
</template>

<script setup lang='ts'>

import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { firstBasicNodes } from '@/apps/work-flow/api/graphql/flow-api';
import { getTaskByObjectId, nextNodesIgnoreStatus } from '@/apps/work-flow/api/graphql/task';
import { createNextTasks, createWorkAndSendToFirstNodes } from '@/apps/work-flow/api/graphql/work';
import { FlowTypePredefined } from '@/apps/work-flow/components/start-flow';
import { Priority, type Task } from '@/apps/work-flow/model/process/work';
import { handleCompleteTask } from '@/apps/work-flow/views/process/task-menu';
import { DEFAULT_DIALOG_CONFIG } from '@/common/constants';
import { toastSuccess } from '@/common/helpers/custom-toast-service';

const props = defineProps({
  visibleDialog: {
    type: Boolean,
    default: false,
  },
  id: {
    type: String,
    default: null,
  },
  flowId: {
    type: String,
    default: null,
  },
});
const emits = defineEmits(['hide-dialog']);
const { t } = useI18n();
const form = ref<HTMLFormElement>();
const visibleForm = ref(props.visibleDialog);
const note = ref();

const nodes = ref();
const user = ref();

const task = ref<Task>({} as Task);

const {
  load,
  refetch
} = firstBasicNodes();

(load(undefined, { id: props?.flowId }) || refetch({ id: props?.flowId }))
  ?.then(result => {
    if (result) {
      nodes.value = result?.firstBasicNodes || [];
      user.value = nodes.value[0]?.data?.options?.userIds?.[0];
    }
  });

const { onResult } = getTaskByObjectId(props.id);

onResult((res) => {
  task.value = res.data?.getTaskByObjectId;

  if (!task.value) {
    return;
  }
  const {
    load: nextNodesIgnoreStatusLoad,
    refetch: nextNodesIgnoreStatusRefetch
  } = nextNodesIgnoreStatus(task.value.workId, task.value.nodeId, 'APPROVE');

  (nextNodesIgnoreStatusLoad() || nextNodesIgnoreStatusRefetch())
    ?.then(result => {
      if (result) {
        nodes.value = result?.nextNodesIgnoreStatus || [];
        user.value = nodes.value[0]?.data?.options?.userIds?.[0];
      }
    });
});

const startWorkFlow = () => {
  if (task.value) {
    handleCompleteTask(task.value.id, 'APPROVE', note.value)
      .then(() => {
        const firstNode = nodes.value[0];

        if (firstNode?.data?.options) {
          return createNextTasks().mutate({
            workId: task.value.workId,
            currentTaskId: task.value.id,
            assignedIds: [user.value],
            currentNodeId: task.value.nodeId,
            nextNodeId: firstNode.id
          }) as Promise<any>;
        }

        return Promise.resolve();
      })
      .then(async () => {
        await new Promise(resolve => setTimeout(resolve, 1000));
        emits('hide-dialog');
      });
  } else {
    createWorkAndSendToFirstNodes().mutate({
      work: {
        flowId: props?.flowId,
        name: 'flow',
        objectId: props?.id,
        priority: Priority.MEDIUM,
        type: FlowTypePredefined.VEHICLE_BOOKING_CAR
      },
      assigns: {
        nodeId: nodes.value[0].id,
        assignedIds: nodes.value[0].data?.options?.userIds
      },
      comment: note.value
    }).then(async result => {
      if (result) {
        toastSuccess();
        await new Promise(resolve => setTimeout(resolve, 1000));
        emits('hide-dialog');
      }
    });
  }
};
</script>

<style scoped>

</style>