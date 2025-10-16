<template>
  <div class='flex gap-1'>
    <template v-if='(!isComplete && isMainHandle)||isSpecialistDraft'>
      <FlowButtons
        :class-name-btn='`border-round-sm border-300 btn-action hover:border-1 hover:border-400 hover:surface-200 py-1 surface-0 text-900`'
        :disabled-func='()=>disabled'
        icon-size='1'
        :outcomes='outcomes'
        size='small'
        @action='nextProcess'/>
      <Button
        v-if='process?.id && !hideButtonsName.includes("REJECT") && userDeptRole.roleId!=RoleType.CHUYEN_VIEN'
        class='border-round-sm border-transparent btn-action hover:border-1 hover:border-400 hover:surface-200 py-1 surface-0 text-900'
        :label='t("document.action.reject")'
        severity='danger'
        size='small'
        @click='visibleRejectDialog=true'>
        <template #icon>
          <AppIcon
            class='align-items-center flex pr-1'
            name='block'
            size='1.3'>
          </AppIcon>
        </template>
      </Button>
    </template>
    <Button
      v-if='canRevoke &&((userDeptRole.roleId==RoleType.TRO_LY && mapSupportAction["REVOKE"])||userDeptRole.roleId!=RoleType.TRO_LY)
        && !hideButtonsName.includes("REVOKE")'
      class='border-round-sm border-transparent btn-action hover:border-1 hover:border-400 hover:surface-200 py-1 revoke-btn surface-0 text-900'
      :label="t('document.action.revoke')"
      severity='warning'
      @click='visibleRevokeDialog=true'>
      <template #icon>
        <AppIcon
          class='align-items-center flex pr-1'
          name='undo'
          size='20px'>
        </AppIcon>
      </template>
    </Button>
  </div>

  <UserSelectNextDialogDocOut
    v-if='visibleDialog'
    v-model:visible='visibleDialog'
    :flow-id='doc?.flowId'
    :flow-instance-id='process?.flowInstanceId'
    :is-start-node='!process?.flowInstanceId'
    :node-id='currNode?.id||""'
    :org-type='userDeptRole.type'
    :process-id='process?.id'
    :result='selectedOutcome?.name||""'/>
  <RevokeDialog
    v-model:visible='visibleRevokeDialog'
    :doc-id='doc?.id||""'
    @revoke-doc='revoke'/>

  <RejectDialog
    v-model:visible='visibleRejectDialog'
    @reject-doc='handleReject'/>
</template>

<script lang='ts' setup>

import { storeToRefs } from 'pinia';
import { computed, type ComputedRef, inject, type PropType, ref, toRef, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

import { canRevokeDocOutLazy } from '@/apps/document/api/graphql/doc-out';
import { revokeDocOutGraphql } from '@/apps/document/api/graphql/outgoing-doc';
import { findLastOutProcessByDocId } from '@/apps/document/api/graphql/outgoing-process';
import { findLastOutProcess, rejectDocOut } from '@/apps/document/api/rest/docOut';
import { currentInstanceNode, getStartNode } from '@/apps/document/api/rest/flowDocument';
import type { CCInfo } from '@/apps/document/model/ccdoc';
import type { DocComment } from '@/apps/document/model/comment';
import type { DocOut } from '@/apps/document/model/doc/doc-out';
import { RoleType } from '@/apps/document/model/permission';
import { ProcessType } from '@/apps/document/model/process/incoming';
import type { OutgoingProcess } from '@/apps/document/model/process/outgoing';
import type { Process } from '@/apps/document/model/process/process';
import { useDocumentRolesStore } from '@/apps/document/store/document-role';
import FlowButtons from '@/apps/document/views/doc/component/flow-buttons/FlowButtons.vue';
import UserSelectNextDialogDocOut
  from '@/apps/document/views/doc/component/user-select-next/UserSelectNextDialogDocOut.vue';
import RejectDialog from '@/apps/document/views/doc/doc-out/component/next-buttons-dialog/RejectDialog.vue';
import RevokeDialog from '@/apps/document/views/doc/doc-out/component/next-buttons-dialog/RevokeDialog.vue';
import type { NodeInputInterface, Outcome } from '@/apps/work-flow/model/flow';
import { toastError, toastSuccess } from '@/common/helpers/custom-toast-service';

const props = defineProps({
  doc: {
    type: Object as PropType<DocOut>,
    default: undefined,
  },
  disabled: {
    type: Boolean,
    default: false
  },
  //Dung de phan biet du thao va xu ly
  //Neu du thao thi se tim process theo dept ma khong quan tam gui cho ai
  //Neu khong thi tim process gui cho minh
  isSpecialistDraft: {
    type: Boolean,
    default: false
  }
});

const { userDeptRole } = storeToRefs(useDocumentRolesStore());
const { t } = useI18n();
const router = useRouter();
const process = ref<Process | undefined>();
const currNode = ref<NodeInputInterface>();
const outcomes = computed<Outcome[]>(() => {
  return currNode.value?.data?.outcomes || [];
});
const isComplete = computed(() => process.value?.isComplete || false);
const isMainHandle = computed(() => process.value?.processType == ProcessType.XL_CHINH);
watch(() => props.doc?.id, (value) => {
  if (!value) {
    return;
  }
  //Neu du thao thi tim process cuoi cung ma gui den dept minh
  if (props.isSpecialistDraft) {
    findLastOutProcess(userDeptRole.value, value as string, userDeptRole.value.deptId).then(value => {
      if (value) {
        process.value = value;
      }
    });
  } else {
    //Tim process cuoi cung ma userDeptRole nhan la minh
    findLastOutProcessByDocId(value, userDeptRole.value)
      .onResult(res => {
        process.value = res.data?.findLastOutProcessByDocId;
      });
  }
});
watch(() => process.value?.id, () => {
  if (process.value?.flowInstanceId && process.value?.stepId) {
    currentInstanceNode(process.value?.flowInstanceId, process.value?.stepId).then(value => {
      if (value) {
        currNode.value = value;
      } else {
        currNode.value = undefined;
      }
    }).catch(error => {
      toastError(error);
      currNode.value = undefined;
    });
    //Neu khong co ca flowInstanceId va stepId nhung co flowId thi hien nut bat dau
  } else {
    if (props.doc?.flowId) {
      getStartNode(props.doc?.flowId).then(value => {
        if (value) {
          currNode.value = value;
        } else {
          currNode.value = undefined;
        }
      }).catch(reason => {
        currNode.value = undefined;
        if (reason.code == 'nodeNotFound') {
          toastError({ message: 'Không tìm thấy nốt bắt đầu của quy trình' });
        }
      });
    } else {
      currNode.value = undefined;
    }
  }
}, { immediate: true });

const visibleDialog = ref<boolean>(false);
const visibleRevokeDialog = ref<boolean>(false);
const visibleRejectDialog = ref<boolean>(false);

const selectedOutcome = ref<Outcome>();

function nextProcess(outcome: Outcome) {
  selectedOutcome.value = outcome;
  visibleDialog.value = true;
}

function handleReject(form: FormData) {
  if (process.value?.id) {
    form.append('processId', process.value?.id);
    rejectDocOut(form).then(() => {
      visibleRejectDialog.value = false;
      afterAction();
    });
  }
}

const {
  result: canRevokeResult,
  refetch: refetchCanRevoke,
  load: loadCanRevoke
} = canRevokeDocOutLazy(props.doc?.id || '', userDeptRole.value);
if (props.doc?.id) {
  loadCanRevoke();
}

watch(() => props.doc?.id, (value) => {
  if (value) {
    let variables = {
      docId: value,
      userDeptRole: userDeptRole.value
    };
    loadCanRevoke(null, variables) || refetchCanRevoke(variables);
  }
}, { immediate: true });
const canRevoke = computed(() => {
  if (!props.doc?.id || props.doc?.id.trim().length == 0) {
    return false;
  }
  return canRevokeResult.value?.canRevokeDocOut;
});

const { mutate } = revokeDocOutGraphql();
const refetchDocOuts = inject('reloadDoc', () => void 0);

function revoke(outgoingProcess: OutgoingProcess[], ccInfo: CCInfo[], comment: DocComment[], reason: string) {
  mutate({
    revokeModelInput: {
      outgoingProcessIds: outgoingProcess.map(e => e.id),
      commentIds: comment.map(e => e.id),
      reason: reason
    },
    userDeptRole: userDeptRole.value
  }).then(() => {
    loadCanRevoke() || refetchCanRevoke();
    refetchDocOuts();
    visibleRevokeDialog.value = false;
    toastSuccess();
  }).catch(toastError);
}

function toastSuccessAndBack() {
  toastSuccess();
  afterAction();
}

const afterAction = inject('afterAction', () => router.back());

const mapSupportAction = inject('mapSupportAction', {} as ComputedRef<Record<string, true>>);
const hideButtonsName = inject('hideButtonsName', toRef<string[]>([]));
</script>

<style lang="scss" scoped>
.revoke-btn {
  :deep(.custom-icon) {
    color: #F87168;
  }
}
</style>