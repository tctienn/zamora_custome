<template>
  <Button
    v-if='firstEdge'
    :disabled='disabled'
    :label='firstEdge?.data?.label ||"Chuyển xử lý"'
    @click='nextAction'>
  </Button>
  <Dialog
    v-model:visible='visible'
    :header="t('document.doc.docInDetail.transferProcessing')"
    modal
    :pt='{
      content: {
        class: {
          "p-0": options.length > 1,
          "py-2": options.length == 1
        }
      }
    }'
    style='max-width:85vw;min-width:50vw'
    @after-hide='hideDialog'>
    <div
      class='flex flex-column gap-3'>
      <Carousel
        v-show='!canAutoSelect'
        :num-scroll='1'
        :num-visible='1'
        :pt='{
          previousButton: {
            class: "w-3rem h-3rem"
          },
          previousButtonIcon: {
            class: "w-2rem h-2rem"
          },
          nextButton: {
            class: "w-3rem h-3rem"
          },
          nextButtonIcon: {
            class: "w-2rem h-2rem"
          }
        }'
        :show-indicators='options?.length>1'
        :show-navigators='options?.length>1'
        :value='options'>
        <template #item='{data}'>
          <SelectUserDataNodeTempFlow
            v-model='dataNextAction.dataNodeMap[data?.id]'
            :options='data?.data.options?.userDeptRoles||[]'>
          </SelectUserDataNodeTempFlow>
        </template>
      </Carousel>
      <div
        :class='{"pt-2 px-4" : options.length > 1,
                 "pt-2": options.length == 1}'>
        <div class='flex'>
          <div class='field w-6'>
            <label class='font-semibold'>
              {{ t('document.doc.deadline') }}
            </label>
            <div>
              <Calendar
                v-model='dataNextAction.deadline'
                date-format='dd/mm/yy'
                show-icon>
              </Calendar>
              <ValidateErrorMessage :errors='v$.deadline.$errors'/>
            </div>
          </div>
          <div class='field w-6'>
            <label class='font-semibold'>
              {{ t('document.doc.deadlineNumber') }}
            </label>
            <div>
              <InputNumber v-model='dataNextAction.deadlineNumber'>
              </InputNumber>
              <ValidateErrorMessage :errors='v$.deadlineNumber.$errors'/>
            </div>
          </div>
        </div>
        <div class='field'>
          <TabView>
            <TabPanel :header='t("document.flowAction.note")'>
              <Textarea
                id='description'
                v-model='dataNextAction.note'
                auto-resize
                class='w-full'
                rows='5'/>
            </TabPanel>
            <TabPanel :header='t("document.flowAction.fileAttachment")'>
              <UploadFilesGridV2
                v-model:file-list='dataNextAction.fileList'
                v-model:files-deleted='listFileDelete'
                v-model:list-file='dataNextAction.attachments'
                :file-attachments-name="'attachmentModel'"
                :header="t('document.flowAction.listFile')"/>

            </TabPanel>
          </TabView>
        </div>
      </div>

    </div>
    <template #footer>
      <div class='flex gap-2'>
        <Button
          icon='pi pi-times'
          :label="t('common.back')"
          :loading='isLoading'
          severity='danger'
          @click='visible = false'/>
        <Button
          icon='pi pi-send'
          :label='t("document.flowAction.process")'
          :loading='isLoading'
          @click='saveDocAndAction'/>
      </div>
    </template>
  </Dialog>
</template>

<script lang="ts" setup>
import { useVuelidate } from '@vuelidate/core';
import { helpers } from '@vuelidate/validators';
import { storeToRefs } from 'pinia';
import { computed, inject, type PropType, type Ref, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { findFirstProcess } from '@/apps/document/api/rest/docOut';
import { outFlowActionWithFiles } from '@/apps/document/api/rest/flowDocument';
import { useOrganizationByType } from '@/apps/document/helpers/composable/handle-organization-type';
import type { DocOut, DocOutInput } from '@/apps/document/model/doc/doc-out';
import { useDocumentRolesStore } from '@/apps/document/store/document-role';
import type { DataNextAction } from '@/apps/document/views/doc/component/user-select-next/process-data';
import SelectUserDataNodeTempFlow
  from '@/apps/document/views/doc/doc-out/component/temp-flow-buttons/SelectUserDataNodeTempFlow.vue';
import {
  type BasicNode,
  type EdgeInputInterface,
  type FlowInterface,
  type NodeInputInterface,
  NodeType,
  type SplitNode,
  type StartNode
} from '@/apps/work-flow/model/flow';
import UploadFilesGridV2 from '@/common/components/custom/UploadFilesGridV2.vue';
import { DateTimeFormat } from '@/common/constants';
import { toastError, toastSuccess } from '@/common/helpers/custom-toast-service';
import useMoment from '@/common/helpers/mixins/use-moment';
import { daysBetweenDates, normalizeDate } from '@/common/helpers/time-util';

const props = defineProps({
  nodes: {
    type: Array as PropType<NodeInputInterface[]>,
    default: () => []
  },
  edges: {
    type: Array as PropType<EdgeInputInterface[]>,
    default: () => []
  },
  disabled: {
    type: Boolean,
    default: false,
  }
});
const { t } = useI18n();
const { moment } = useMoment();
const { userDeptRole } = storeToRefs(useDocumentRolesStore());
const { allOrgMap } = useOrganizationByType(userDeptRole.value.type);

const firstEdge = computed<EdgeInputInterface | undefined>(() => {
  const startNode: StartNode = props.nodes.find(e => e.type == NodeType.START) as StartNode;
  if (startNode) {
    return props.edges.find(e => e.source == startNode.id);
  }
  return undefined;
});
const firstBasicGroupNode = computed<BasicNode[] | undefined>(() => {
  let firstSplitNode: SplitNode | undefined = undefined;
  if (firstEdge.value) {
    firstSplitNode = props.nodes.find(e => e.type == NodeType.SPLIT && e.id == firstEdge.value?.target) as SplitNode;
  }
  const edgesFromSplitNode = props.edges.filter(e => e.source == firstSplitNode?.id);
  return edgesFromSplitNode.map(e => props.nodes.find(node => node.id == e.target) as BasicNode);
});
const visible = defineModel<boolean>('visible', { default: false });
const dataNextAction = ref<DataNextAction>({
  attachments: [],
  dataNodeMap: {}
});
watch(firstBasicGroupNode, value => {
  value?.forEach(
    node => {
      dataNextAction.value.dataNodeMap[node.id] = {
        ...dataNextAction.value.dataNodeMap[node.id],
        node: node,
        edge: props.edges.find(e => e.target == node.id) as EdgeInputInterface
      };
    }
  );
}, { immediate: true });

const options = computed(() => firstBasicGroupNode.value?.map(node => node
) || []);
const doc = inject('doc', {} as Ref<DocOutInput | DocOut>);

const deadlineDateComputed = computed<Date | undefined>(() => {
  if (doc.value?.deadlineDate) {
    if (doc.value?.deadlineDate instanceof Date) {
      return doc.value.deadlineDate;
    } else {
      return new Date(doc.value?.deadlineDate);
    }
  }
  return undefined;
});
watch(() => deadlineDateComputed.value, value => {
  dataNextAction.value.deadline = value || undefined;
}, { immediate: true });
watch([() => doc.value?.deadlineNumber, () => dataNextAction.value.deadline], ([newDeadlineNumber, newDeadline]) => {
  dataNextAction.value.deadlineNumber = newDeadlineNumber || (newDeadline ? daysBetweenDates(new Date(), newDeadline) : undefined);
}, { immediate: true });
const validateRules = {
  deadline: {
    checkBeforeEndDeadline: helpers.withMessage(t('document.common.error.deadlineAfterEndDeadline'), (value: Date | undefined) => {
      return value == undefined || !deadlineDateComputed.value || value <= deadlineDateComputed.value;
    }),
    checkAfterNow: helpers.withMessage(t('document.common.error.deadlineBeforeNow'), (value: Date | undefined) => {
      return value == undefined || normalizeDate(value) >= normalizeDate(new Date());
    }),
  },
  deadlineNumber: { required: helpers.withMessage(t('document.common.error.deadlineNumber'), (value: number | undefined) => !value || value > 0) }
};

const v$ = useVuelidate(validateRules, {
  deadline: dataNextAction.value.deadline,
  deadlineNumber: dataNextAction.value.deadlineNumber
});
const afterAction = inject('afterAction', () => void {});

const isLoading = ref(false);
const listFileDelete = ref<string[]>([]);

function nextAction() {
  visible.value = true;
}

function hideDialog() {
}

const canAutoSelect = computed(() => options.value.every(e => e?.data?.options?.userDeptRoles?.length == 1));

// Save config

const saveTempFlowPromise = inject('saveTempFlowPromise', () =>
  Promise.resolve({} as FlowInterface),
);
const saveDocPromise = inject('saveDocPromise', () =>
  Promise.resolve({} as DocOut),
);

function doAction(currProcessId: string, data: DataNextAction) {
  function createFormData(data: DataNextAction) {
    const formData = new FormData();

    formData.append('note', data.note || '');
    if (data?.deadlineNumber) {
      formData.append('deadlineNumber', data.deadlineNumber.toString());
    }
    if (data?.deadline) {
      formData.append('deadlineDate', moment(data.deadline).format(DateTimeFormat.ISO_LOCAL_DATE));
    }
    let index1 = 0;
    Object.entries(data.dataNodeMap).forEach(([, value1]) => {
      //Append dataNodes
      value1.edge?.data?.outcome && formData.append(`dataNodes[${index1}].hint`, value1.edge.data.outcome);
      value1.processes?.forEach((value2, index2) => {
        formData.append(`dataNodes[${index1}].outgoingProcesses[${index2}].receiverId`, value2.receiverId);
        formData.append(`dataNodes[${index1}].outgoingProcesses[${index2}].receiverName`, value2.receiverName);
        formData.append(`dataNodes[${index1}].outgoingProcesses[${index2}].receiverDeptId`, value2.receiverDeptId);
        formData.append(`dataNodes[${index1}].outgoingProcesses[${index2}].receiverDeptName`, value2.receiverDeptName);
        formData.append(`dataNodes[${index1}].outgoingProcesses[${index2}].receiverRoleId`, value2.receiverRoleId);
        formData.append(`dataNodes[${index1}].outgoingProcesses[${index2}].receiverRoleName`, value2.receiverRoleName);
        formData.append(`dataNodes[${index1}].outgoingProcesses[${index2}].processType`, value2.processType);
      });
      index1++;
    });
    data?.attachments.forEach((attachment, index) => {
      if (data?.fileList?.[index]) {
        formData.append(`attachments[${index}]`, data.fileList[index]);
      }
    });

    return formData;
  }

  const formData = createFormData(data);
  return outFlowActionWithFiles(currProcessId, userDeptRole.value, firstEdge.value?.data?.outcome || '', formData);
}

async function saveDocAndAction() {
  try {
    isLoading.value = true;
    await saveTempFlowPromise();

    const doc: DocOut = await saveDocPromise();

    const processIdRes = await findFirstProcess(userDeptRole.value, doc.id || '');

    if (processIdRes?.id) {
      await doAction(processIdRes.id, dataNextAction.value);
      toastSuccess({ message: `${firstEdge.value?.data?.label || 'Chuyển xử lý'} thành công` });
    }
    afterAction();
  } catch (error) {
    const err = error as Record<string, any>;
    const errMessage: {
      message: string,
    } = { message: error as string, };
    if (err?.code == 'noDefaultFlow') {
      errMessage.message = `Không có luồng mặc định cho phòng ban ${allOrgMap.value[err?.data?.id]?.name}`;
    }
    toastError(errMessage);
  } finally {
    isLoading.value = false;
  }
}
</script>

<style scoped>

</style>