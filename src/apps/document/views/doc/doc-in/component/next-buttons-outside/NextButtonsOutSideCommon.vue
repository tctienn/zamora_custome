<template>
  <template v-if="!hideButtonsName.includes('ALL')">
    <div class='flex gap-1'>
      <template v-if='!isComplete && isMainHandle'>
        <FlowButtons
          :disabled-func='()=>disabled'
          icon-size='1'
          :outcomes='outcomes'
          size='small'
          :visible-func='visibleFlowButton'
          @action='nextProcess'/>
        <Button
          v-if='doc?.id &&!hideButtonsName.includes("RECEIVE_TO_KNOW")'
          class='border-400 border-round-sm btn-action hover:border-400 justify-content-center over:surface-300 py-1 receive-to-know surface-0 surface-100 text-900'
          icon='pi pi-book'
          :label='t("document.action.receiveToKnow")'
          severity='help'
          size='small'
          @click='receiveToKnow'>
          <template #icon>
            <AppIcon
              class='align-items-center flex pr-1'
              name='file_save'
              size='1.5'>
            </AppIcon>
          </template>
        </Button>
        <Button
          v-if='doc?.id &&((userDeptRole.roleId==RoleType.TRO_LY && mapSupportAction["COMPLETE"])||userDeptRole.roleId!=RoleType.TRO_LY )
            &&!hideButtonsName.includes("COMPLETE")'
          class='border-400 border-round-sm btn-action hover:border-400 justify-content-center over:surface-300 py-1 receive-to-know surface-0 surface-100 text-900'
          :label='t("document.action.finish")'
          severity='success'
          size='small'
          @click='finish'>
          <template #icon>
            <AppIcon
              class='align-items-center flex icon-order_approve pr-1'
              name='order_approve'
              size='20px'>
            </AppIcon>
          </template>
        </Button>
        <ReturnButton
          v-if='doc?.id &&((userDeptRole.roleId==RoleType.TRO_LY && mapSupportAction["RETURN"])||userDeptRole.roleId!=RoleType.TRO_LY )
            && !hideButtonsName.includes("RETURN")'
          :class-name='`border-400  hover:surface-300 justify-content-center surface-100 surface-0 return-btn`'
          :doc-id='doc.id'
          :flow-instance-id='process?.flowInstanceId'
          @return-doc='returnDoc'/>
      </template>
      <Button
        v-if='canRevoke &&((userDeptRole.roleId==RoleType.TRO_LY && mapSupportAction["REVOKE"])||userDeptRole.roleId!=RoleType.TRO_LY)
          && !hideButtonsName.includes("REVOKE")'
        class='revoke-btn'
        :label="t('document.action.revoke')"
        severity='warning'
        size='small'
        @click='visibleDialogRevoke=true'>
        <template #icon>
          <AppIcon
            class='align-items-center flex pr-1'
            name='undo'
            size='1'>
          </AppIcon>
        </template>
      </Button>
    </div>

    <UserSelectNextDialogDocIn
      v-if='visibleDialog'
      v-model:visible='visibleDialog'
      :flow-instance-id='process?.flowInstanceId'
      :is-start-node='false'
      :node-id='currNode?.id||""'
      :org-type='userDeptRole.type'
      :process-id='process?.id'
      :result='selectedOutcome?.name||""'/>
    <RevokeDialog
      v-if='doc?.id'
      v-model:visible='visibleDialogRevoke'
      :doc-id='doc.id'
      @revoke-doc='revoke'/>
    <ConfirmDialog
      group='finish'>
      <template #message='{message}'>
        <div class='align-items-center flex flex gap-3 surface-border w-full'>
          <i
            class='text-6xl text-primary-500'
            :class='message.icon'></i>
          <div
            class='white-space-pre-wrap'
            :class='{flex:(doc?.quote?.length||0) <100}'>{{ message.message }}
            <div
              class='font-semibold word-break-break-word'
              style='max-width:50vw'>{{ doc?.quote }}
            </div>
          </div>
        </div>
      </template>
    </ConfirmDialog>
  </template>
</template>

<script lang='ts' setup>

import { storeToRefs } from 'pinia';
import { useConfirm } from 'primevue/useconfirm';
import { computed, type ComputedRef, inject, type PropType, ref, toRef, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

import { canReturnDocLazy, canRevokeDocLazy } from '@/apps/document/api/graphql/doc-in';
import { completeDoc, revokeGraphql, setDocToCC } from '@/apps/document/api/graphql/incoming-doc';
import { rejectDoc, rejectDocWithSpecifyStep } from '@/apps/document/api/rest/docIn';
import { currentInstanceNode, possibleInstanceNextNodes } from '@/apps/document/api/rest/flowDocument';
import type { CCInfo } from '@/apps/document/model/ccdoc';
import type { DocComment } from '@/apps/document/model/comment';
import type { DocIn } from '@/apps/document/model/doc/doc-in';
import { RoleType } from '@/apps/document/model/permission';
import { type InComingProcess, ProcessType } from '@/apps/document/model/process/incoming';
import type { Process } from '@/apps/document/model/process/process';
import { useDocumentRolesStore } from '@/apps/document/store/document-role';
import FlowButtons from '@/apps/document/views/doc/component/flow-buttons/FlowButtons.vue';
import UserSelectNextDialogDocIn
  from '@/apps/document/views/doc/component/user-select-next/UserSelectNextDialogDocIn.vue';
import RevokeDialog from '@/apps/document/views/doc/doc-in/component/next-buttons-dialogs/RevokeDialog.vue';
import ReturnButton from '@/apps/document/views/doc/doc-in/component/NextButtonsSpecial/ReturnButton.vue';
import { type NodeInputInterface, NodeType, type Outcome } from '@/apps/work-flow/model/flow';
import { toastError, toastSuccess } from '@/common/helpers/custom-toast-service';

const props = defineProps({
  process: {
    type: Object as PropType<Process>,
    default: undefined
  },
  doc: {
    type: Object as PropType<DocIn>,
    default: undefined
  },
  disabled: {
    type: Boolean,
    default: false
  }
});

const { userDeptRole } = storeToRefs(useDocumentRolesStore());
const { t } = useI18n();
const confirm = useConfirm();
const router = useRouter();
const currNode = ref<NodeInputInterface>();
const outcomes = computed<Outcome[]>(() => {
  return currNode.value?.data?.outcomes || [];
});
const isComplete = computed(() => props.process?.isComplete || false);
const isMainHandle = computed(() => props.process?.processType == ProcessType.XL_CHINH);
watch(() => props.process?.id, () => {
  if (props.process?.flowInstanceId && props?.process.stepId) {
    currentInstanceNode(props.process?.flowInstanceId, props.process?.stepId).then(value => {
      if (value) {
        currNode.value = value;
      } else {
        currNode.value = undefined;
      }
    }).catch(error => {
      toastError(error);
      currNode.value = undefined;
    });
  } else {
    currNode.value = undefined;
  }
}, { immediate: true });

const visibleDialog = ref<boolean>(false);
const visibleDialogRevoke = ref<boolean>(false);

const selectedOutcome = ref<Outcome>();

function nextProcess(outcome: Outcome) {
  selectedOutcome.value = outcome;
  visibleDialog.value = true;
}

function canReturnFn() {
  return canReturnResult.value?.canReturn;
}

function finish() {
  confirm.require({
    group: 'finish',
    message: t('Bạn có chắc chắn muốn Hoàn thành văn bản: '),
    header: t('common.confirm'),
    icon: 'pi pi-exclamation-triangle',
    accept: () => {
      if (props.process?.id && !isComplete.value) {
        completeDoc().mutate({
          currentProcessId: props.process?.id,
          userDeptRole: userDeptRole.value
        }).then(toastSuccessAndBack)
          .catch(toastError);
      }
    }
  });

}

function returnDoc(form: FormData) {
  if (props.doc?.id) {
    rejectDoc(props.doc.id, form).then(() => {
      toastSuccessAndBack();
    });
  }
}

function returnDocReceive(form: FormData) {
  if (props.doc?.id) {
    rejectDocWithSpecifyStep(props.doc.id, form).then(() => {
      toastSuccessAndBack();
    });
  }
}

function receiveToKnow() {
  if (props.process?.id && !isComplete.value && props.doc?.id) {
    confirm.require({
      group: 'finish',
      message: t('Bạn có chắc chắn muốn Nhận để biết văn bản: '),
      header: t('common.confirm'),
      acceptLabel: t('document.action.receiveToKnow'),
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        setDocToCC().mutate({
          docId: props.doc?.id,
          userDeptRole: userDeptRole.value
        }).then(toastSuccessAndBack)
          .catch(toastError);
      }
    });
  }
}

const {
  result: canRevokeResult,
  variables,
  refetch: refetchCanRevoke,
  load: loadCanRevoke
} = canRevokeDocLazy(props.doc?.id || '', userDeptRole.value);

const {
  result: canReturnResult,
  load: loadCanReturn,
  refetch: refetchCanReturn
} = canReturnDocLazy(props.doc?.id || '', userDeptRole.value);

if (props.doc?.id) {
  loadCanRevoke();
  loadCanReturn();
}

watch(() => props.doc?.id, (value) => {
  if (value) {
    let variables = {
      docId: value,
      userDeptRole: userDeptRole.value
    };
    loadCanRevoke(null, variables) || refetchCanRevoke(variables);
    loadCanReturn(null, variables) || refetchCanReturn(variables);
  }
}, { immediate: true });
const canRevoke = computed(() => {
  if (!props.doc?.id || props.doc?.id.trim().length == 0) {
    return false;
  }
  return canRevokeResult.value?.canRevokeDoc;
});

const { mutate } = revokeGraphql();

function revoke(incomingProcess: InComingProcess[], ccInfo: CCInfo[], comment: DocComment[], reason: string) {
  mutate({
    revokeModelInput: {
      incomingProcessIds: incomingProcess.map(e => e.id),
      ccInfoIds: ccInfo.map(e => e.id),
      commentIds: comment.map(e => e.id),
      reason: reason
    },
    userDeptRole: userDeptRole.value
  }).then(value => {
    visibleDialogRevoke.value = false;
    toastSuccess();
    refetchCanRevoke();
    afterAction();
  }).catch(toastError);
}

function toastSuccessAndBack() {
  toastSuccess();
  afterAction();
}

async function visibleFlowButton(outcome: (Outcome & Record<string, any>)): Promise<boolean> {
  if (props.process) {
    const nodes = await possibleInstanceNextNodes(props.process.flowInstanceId || '', props.process.stepId || '', outcome.name);
    return Promise.resolve(!(nodes && nodes.length === 1 && nodes[0].type === NodeType.END));
  }
  return Promise.resolve(true);
}

const afterAction = inject('afterAction', () => router.back());

const mapSupportAction = inject('mapSupportAction', {} as ComputedRef<Record<string, true>>);
const hideButtonsName = inject('hideButtonsName', toRef<string[]>([]));
</script>

<style lang="scss" scoped>
.btn-action {
  font-size: 14px;
  font-weight: 400;
  border-radius: 4px;

  &.receive-to-know {
    .custom-icon {
      color: #7A87D0 !important;
    }
  }

  :deep(.p-button-label) {
    font-size: 14px;
    font-weight: 400;
  }

  :deep(.pi-trash) {
    color: #FF4406 !important;
  }

  :deep(.pi-comments) {
    color: #BF7CD3 !important;
  }

  :deep(.pi-send) {
    color: #3E84F6 !important;
  }

  :deep(.pi-plus-circle) {
    color: #34A853;
  }

  :deep(.icon-order_approve) {
    color: #6FBF73 !important;
  }

}
</style>