<template>
  <Dialog
    v-model:visible='visible'
    v-bind='DEFAULT_DIALOG_CONFIG'
    header='Chuyển xử lý '
    @hide='handleHide'>
    <div>
      <form ref='form'>
        <div class='formgrid grid mb-4'>
          <div class='col-12 field'>
            <label
              class='font-bold'>Chuyển đến: </label>
            <div>
              <AppUser
                v-if='user'
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
            @click='handleHide'/>
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

import type { PropType } from 'vue';
import { inject, type Ref, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { transferProcessingEvaluateEmployeeSummaryReport } from '@/apps/hrm/api/graphql/evaluate';
import type { EvaluateReportSummaryDetail } from '@/apps/hrm/model/evaluate';
import { firstBasicNodes } from '@/apps/work-flow/api/graphql/flow-api';
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
  node: {
    type: Array,
    default: null, 
  },
  handleUsers: {
    type: String,
    default: null, 
  },
  taskPr: {
    type: Object as PropType<Task | null>,
    default: null 
  }
});

const { t } = useI18n();
const form = ref<HTMLFormElement>();
const visible = defineModel('visible', { type: Boolean });
const selectedSummaryReport = inject('selectedSummaryReport') as Ref<EvaluateReportSummaryDetail | null>;
const isRefresh = inject('isRefresh', ref(0));
const note = ref();

const nodes = ref();
const user = ref();

const task = ref<Task>({} as Task);

const {
  load,
  refetch
} = firstBasicNodes();

const { mutate } = transferProcessingEvaluateEmployeeSummaryReport();

if (props.taskPr && props.node){
  task.value = props.taskPr;
  nodes.value = props.node;
  user.value = props.handleUsers;
} else {
  (load(undefined, { id: selectedSummaryReport.value?.summaryReport.flowId }) || refetch({ id: selectedSummaryReport.value?.summaryReport.flowId }))
    ?.then(result => {
      if (result) {
        nodes.value = result?.firstBasicNodes || [];
        user.value = nodes.value[0]?.data?.options?.userIds?.[0];
      }
    });

}

const startWorkFlow = () => {
  if (task.value?.id) {
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
        toastSuccess();
        await new Promise(resolve => setTimeout(resolve, 1000));
        isRefresh.value++;
        await mutate({
          transferProcessingEvaluateEmployeeSummaryReportInput: {
            evaluateEmployeeSummaryReportId: selectedSummaryReport.value?.summaryReport?.id,
            handlerId: nodes.value[0]?.data?.options?.userIds?.[0],
            content: note.value || ''
          }
        });
      }).finally(()=>{
        visible.value = false;
      });
  } else{
    createWorkAndSendToFirstNodes().mutate({
      work: {
        flowId: selectedSummaryReport.value?.summaryReport.flowId,
        name: 'flow',
        objectId: selectedSummaryReport.value?.summaryReport.id,
        priority: Priority.MEDIUM,
        type: FlowTypePredefined.HRM_EVALUATE_REPORT
      },
      assigns: {
        nodeId: nodes.value[0]?.id,
        assignedIds: nodes.value[0]?.data?.options?.userIds
      },
      comment: note.value
    }).then(async () => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toastSuccess();
      isRefresh.value++;
      await mutate({
        transferProcessingEvaluateEmployeeSummaryReportInput: {
          evaluateEmployeeSummaryReportId: selectedSummaryReport.value?.summaryReport?.id,
          handlerId: nodes.value[0]?.data?.options?.userIds?.[0],
          content: note.value || ''
        }
      });
    }).finally(()=>{
      visible.value = false;
    });
  }
};

const handleHide = ()=>{
  visible.value = false;
};
</script>

<style scoped>

</style>