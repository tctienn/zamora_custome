<template>
  <FlowButtons
    :disabled-func='()=>disabled'
    icon-size='1.2'
    :outcomes='outcomes'
    @action='nextProcess'/>
  <UserSelectNextDialogDocIn
    v-if='visibleDialog'
    v-model:visible='visibleDialog'
    :flow-id='flowId'
    :flow-instance-id='flowInstanceId'
    :is-start-node='false'
    :node-id='currNodeId||currNode?.id||""'
    :org-type='userDeptRole.type'
    :process-id='processId'
    :result='selectedOutcome?.name||""'/>
</template>

<script lang="ts" setup>
//Co 2 TH xay ra
//TH tao moi
//  Tao moi co 2 TH
//  TH1: tao moi khong chon flow => khong co gi de noi
//  TH2: tao moi chon flow => tu flowId tim startNode roi hien nut len
//TH cap nhat  => co processId (ke ca chuyen di va chua chuyen di)
//  => tim process cuoi cung cua van thu
import { storeToRefs } from 'pinia';
import { computed, type PropType, ref, watch } from 'vue';

import { findLastInProcess } from '@/apps/document/api/rest/docIn';
import { getStartNode } from '@/apps/document/api/rest/flowDocument';
import type { DocIn } from '@/apps/document/model/doc/doc-in';
import { useDocumentRolesStore } from '@/apps/document/store/document-role';
import FlowButtons from '@/apps/document/views/doc/component/flow-buttons/FlowButtons.vue';
import UserSelectNextDialogDocIn
  from '@/apps/document/views/doc/component/user-select-next/UserSelectNextDialogDocIn.vue';
import type { NodeInputInterface, Outcome } from '@/apps/work-flow/model/flow';
import { toastError } from '@/common/helpers/custom-toast-service';

const props = defineProps({
  doc: {
    type: Object as PropType<DocIn>,
    default: () => ({})
  },
  flowId: {
    type: String,
    required: true,
  },
  disabled: {
    type: Boolean,
    default: false
  }
});

const { userDeptRole } = storeToRefs(useDocumentRolesStore());

const currNode = ref<NodeInputInterface>();
const outcomes = computed<Outcome[]>(() => {
  return currNode.value?.data?.outcomes || [];
});
const processId = ref<string>();
const flowInstanceId = ref<string>();
const currNodeId = ref<string>();

watch(() => props.flowId, flowId => {
  if (flowId) {
    getStartNode(flowId).then(value => {
      if (value) {
        currNode.value = value;
      }
    }).catch(reason => {
      currNode.value = {} as NodeInputInterface;
      if (reason.code == 'nodeNotFound') {
        toastError({ message: 'Không tìm thấy nốt bắt đầu của quy trình' });
      }
    });
  }
}, { immediate: true });
//TH co doc id nghia la da co process
watch(() => props.doc?.id, (docId) => {
  if (docId) {
    findLastInProcess(
      userDeptRole.value,
      docId,
      userDeptRole.value.deptId,
    ).then((value) => {
      if (value) {
        processId.value = value?.id;
        flowInstanceId.value = value?.flowInstanceId;
        currNodeId.value = value?.stepId;
      }
    });
  }
});

const visibleDialog = ref<boolean>(false);
const selectedOutcome = ref<Outcome>();

function nextProcess(outcome: Outcome) {
  selectedOutcome.value = outcome;
  visibleDialog.value = true;
}

</script>

<style scoped>

</style>