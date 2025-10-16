<template>
  <UserSelectNextDialogCommon
    v-if='visible'
    v-model:visible='visible'
    :flow-id='flowId'
    :flow-instance-id='flowInstanceId'
    hide-receive-to-know
    :is-loading='isLoading'
    :is-start-node='!flowInstanceId'
    :node-id='nodeId'
    :org-type='orgType'
    :process-name-type='ProcessNameType.OUTGOING'
    :result='result'
    :should-show-checkbox='shouldShowCheckbox'
    @action='action'/>
</template>

<script lang="ts" setup>
import { storeToRefs } from 'pinia';
import type { TreeNode } from 'primevue/treenode';
import { inject, type PropType, type Ref, ref } from 'vue';

import { findFirstProcess } from '@/apps/document/api/rest/docOut';
import { outFlowActionWithFiles } from '@/apps/document/api/rest/flowDocument';
import { useOrganizationByType } from '@/apps/document/helpers/composable/handle-organization-type';
import type { DocOut, DocOutInput } from '@/apps/document/model/doc/doc-out';
import type { OrganizationType } from '@/apps/document/model/organization';
import { ProcessNameType } from '@/apps/document/model/userNextAction';
import { useDocumentRolesStore } from '@/apps/document/store/document-role';
import type { DataNextAction } from '@/apps/document/views/doc/component/user-select-next/process-data';
import UserSelectNextDialogCommon
  from '@/apps/document/views/doc/component/user-select-next/UserSelectNextDialogCommon.vue';
import { DateTimeFormat } from '@/common/constants';
import { toastError, toastSuccess } from '@/common/helpers/custom-toast-service';
import useMoment from '@/common/helpers/mixins/use-moment';

const props = defineProps({
  flowId: {
    type: String,
    default: undefined,
  },
  flowInstanceId: {
    type: String,
    default: undefined,
  },
  result: {
    type: String,
    required: true,
  },
  nodeId: {
    type: String,
    required: true,
  },
  isStartNode: {
    type: Boolean,
    default: false,
  },
  orgType: {
    type: String as PropType<OrganizationType>,
    default: undefined
  },
  header: {
    type: String,
    default: undefined
  },
  processId: {
    type: String,
    default: undefined
  }
});
const { moment } = useMoment();
const { userDeptRole } = storeToRefs(useDocumentRolesStore());
const { allOrgMap } = useOrganizationByType(userDeptRole.value.type);
const visible = defineModel<boolean>('visible', { default: false });
const isLoading = ref<boolean>(false);
const currProcessId = ref(props.processId);
const saveDocPromise = inject('saveDocPromise', () =>
  Promise.resolve({} as DocOut),
);
const doc = inject('doc', {} as Ref<DocOutInput | DocOut>);

async function action(data: DataNextAction, callback: () => void) {
  isLoading.value = true;
  currProcessId.value = props.processId;

  if (!currProcessId.value || !props.flowInstanceId || doc.value?.id) {
    try {
      let savedDoc: DocOut | null = null;
      try {
        savedDoc = await saveDocPromise();
      } catch (error) {
        toastError({ message: 'Có lỗi xảy ra khi lưu văn bản' });
        isLoading.value = false;
        return;
      }

      if (!currProcessId.value && !props.flowInstanceId) {
        const processIdRes = await findFirstProcess(userDeptRole.value, savedDoc?.id ?? doc.value?.id as string);
        if (processIdRes) {
          currProcessId.value = processIdRes.id;
        }
      }
    } catch (error) {
      toastError({ message: error as string });
      isLoading.value = false;
      return;
    }
  }

  if (currProcessId.value) {
    try {
      await doAction(data);
      toastSuccess({ message: `${props.header || 'Chuyển xử lý'} thành công` });
      callback();
      visible.value = false;
    } catch (error) {
      const err = error as Record<string, any>;
      const errMessage: {
        message: string,
      } = { message: error as string, };
      if (err?.code == 'noDefaultFlow') {
        errMessage.message = `Không có luồng mặc định cho phòng ban ${allOrgMap.value[err?.data?.deptId]?.name}`;
      }
      toastError(errMessage);
      isLoading.value = false;
    }
  } else {
    isLoading.value = false;
  }

}

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
    value1.processes.forEach((value2, index2) => {
      value2.receiverId && formData.append(`dataNodes[${index1}].outgoingProcesses[${index2}].receiverId`, value2.receiverId);
      value2.receiverName && formData.append(`dataNodes[${index1}].outgoingProcesses[${index2}].receiverName`, value2.receiverName);
      value2.receiverDeptId && formData.append(`dataNodes[${index1}].outgoingProcesses[${index2}].receiverDeptId`, value2.receiverDeptId);
      value2.receiverDeptName && formData.append(`dataNodes[${index1}].outgoingProcesses[${index2}].receiverDeptName`, value2.receiverDeptName);
      value2.receiverRoleId && formData.append(`dataNodes[${index1}].outgoingProcesses[${index2}].receiverRoleId`, value2.receiverRoleId);
      value2.receiverRoleName && formData.append(`dataNodes[${index1}].outgoingProcesses[${index2}].receiverRoleName`, value2.receiverRoleName);
      value2.processType && formData.append(`dataNodes[${index1}].outgoingProcesses[${index2}].processType`, value2.processType);
    });
    index1++;
  });
  //
  // data.processes.forEach((process, index) => {
  //   process.receiverId && formData.append(`outgoingProcesses[${index}].receiverId`, process.receiverId);
  //   process.receiverName && formData.append(`outgoingProcesses[${index}].receiverName`, process.receiverName);
  //   process.receiverDeptId && formData.append(`outgoingProcesses[${index}].receiverDeptId`, process.receiverDeptId);
  //   process.receiverDeptName && formData.append(`outgoingProcesses[${index}].receiverDeptName`, process.receiverDeptName);
  //   process.receiverRoleId && formData.append(`outgoingProcesses[${index}].receiverRoleId`, process.receiverRoleId);
  //   process.receiverRoleName && formData.append(`outgoingProcesses[${index}].receiverRoleName`, process.receiverRoleName);
  //   process.processType && formData.append(`outgoingProcesses[${index}].processType`, process.processType);
  // });
  //
  data?.attachments.forEach((attachment, index) => {
    if (data?.fileList?.[index]) {
      formData.append(`attachments[${index}]`, data.fileList[index]);
    }
  });

  return formData;
}

async function doAction(data: DataNextAction): Promise<unknown> {
  const formData = createFormData(data);
  return outFlowActionWithFiles(currProcessId.value || '', userDeptRole.value, props.result, formData);
}

function shouldShowCheckbox(node: TreeNode): boolean {
  return !(node.data?.__typename === 'Organization');
}
</script>

<style scoped>

</style>