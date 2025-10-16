<template>
  <template v-if="!hideButtonsName.includes('ALL')">
    <div class='flex gap-1'>
      <template v-if='(!isComplete && isMainHandle)||isClerkReceive'>
        <FlowButtons
          :disabled-func='()=>disabled'
          icon-size='1'
          :outcomes='outcomes'
          size='small'
          @action='nextProcess'/>
        <template v-if='!isClerkReceive'>
          <Button
            v-if='doc?.id &&!hideButtonsName.includes("RECEIVE_TO_KNOW")'
            icon='pi pi-book'
            :label='t("document.action.receiveToKnow")'
            severity='help'
            size='small'
            @click='receiveToKnow'>
            <template #icon>
              <AppIcon
                class='align-items-center flex pr-1'
                name='save_as'
                size='20px'>
              </AppIcon>
            </template>
          </Button>
          <Button
            v-if='doc?.id &&((userDeptRole.roleId==RoleType.TRO_LY && mapSupportAction["COMPLETE"])||userDeptRole.roleId!=RoleType.TRO_LY )
              &&!hideButtonsName.includes("COMPLETE")'
            icon='pi pi-check-circle'
            :label='t("document.action.finish")'
            severity='success'
            size='small'
            @click='finish'/>

        </template>
        <ReturnButton
          v-if='doc?.id && process?.flowInstanceId
            &&((userDeptRole.roleId==RoleType.TRO_LY && mapSupportAction["RETURN"])||userDeptRole.roleId!=RoleType.TRO_LY)
            && !hideButtonsName.includes("RETURN") && canReturnFn()'
          :doc-id='doc.id'
          :is-receive='isClerkReceive'
          @return-doc='returnDoc'
          @return-doc-receive='returnDocReceive'/>
      </template>
      <Button
        v-if='canRevoke &&((userDeptRole.roleId==RoleType.TRO_LY && mapSupportAction["REVOKE"])||userDeptRole.roleId!=RoleType.TRO_LY)
          && !hideButtonsName.includes("REVOKE")'
        class='border-round-sm border-transparent btn-action hover:border-1 hover:border-400 hover:surface-200 py-1 revoke-btn surface-0 text-900'
        :label="t('document.action.revoke')"
        @click='visibleDialogRevoke=true'>
        <template #icon>
          <AppIcon
            class='align-items-center flex pr-1'
            name='undo'
            size='20px'>
          </AppIcon>
        </template>
      </Button>
    </div>
    <UserSelectNextDialogDocIn
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

<script lang="ts" setup>

import { storeToRefs } from 'pinia';
import { useConfirm } from 'primevue/useconfirm';
import { capitalize, computed, type ComputedRef, inject, type PropType, ref, toRef, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

import { canReturnDocLazy, canRevokeDocLazy } from '@/apps/document/api/graphql/doc-in';
import { completeDoc, revokeGraphql, setDocToCC } from '@/apps/document/api/graphql/incoming-doc';
import { findLastProcessByDocId } from '@/apps/document/api/graphql/incoming-process';
import { findLastInProcess, rejectDoc, rejectDocWithSpecifyStep } from '@/apps/document/api/rest/docIn';
import { currentInstanceNode, getStartNode } from '@/apps/document/api/rest/flowDocument';
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
import type { NodeInputInterface, Outcome } from '@/apps/work-flow/model/flow';
import { toastError, toastSuccess } from '@/common/helpers/custom-toast-service';

const props = defineProps({
  doc: {
    type: Object as PropType<DocIn>,
    default: undefined
  },
  disabled: {
    type: Boolean,
    default: false
  },
  isClerkReceive: {
    type: Boolean,
    default: false
  }
});

const { userDeptRole } = storeToRefs(useDocumentRolesStore());
const { t } = useI18n();
const confirm = useConfirm();
const router = useRouter();
const process = ref<Process | undefined>();
const currNode = ref<NodeInputInterface>();
const outcomes = computed<Outcome[]>(() => {
  return currNode.value?.data?.outcomes || [];
});
const isComplete = computed(() => process.value?.isComplete || false);
const isMainHandle = computed(() => process.value?.processType == ProcessType.XL_CHINH);
watch([() => props.doc?.id, () => props.doc?.flowId], ([docId, flowId]) => {
  if (!docId || !flowId) {
    currNode.value = undefined;
    return;
  }
  //Neu tiep nhan thi tim process cuoi cung ma gui den dept minh
  if (props.isClerkReceive) {
    findLastInProcess(userDeptRole.value, docId as string, userDeptRole.value.deptId).then(value => {
      if (value) {
        process.value = value;
      }
      return value;
    }).then((value) => getCurrentNode(value, flowId));
  } else {
    //Tim process cuoi cung ma userDeptRole nhan la minh
    findLastProcessByDocId(docId, userDeptRole.value)
      .onResult(res => {
        let process = res.data?.findLastProcessByDocId;
        process.value = process;
        getCurrentNode(process, flowId);
      });
  }
}, { immediate: true, });
//
// watch(() => process.value?.id, () => {
//   if (process.value?.flowInstanceId && process.value?.stepId) {
//     currentInstanceNode(process.value?.flowInstanceId, process.value?.stepId).then(value => {
//       if (value) {
//         console.log('instance');
//
//         currNode.value = value;
//       }
//     }).catch(error => {
//       toastError(error);
//     });
//   }
// }, { immediate: true });
// watch(() => props.doc?.flowId, value => {
//   if (!(process.value?.flowInstanceId && process.value?.stepId)) {
//     if (props.doc?.flowId) {
//       getStartNode(props.doc?.flowId).then(value => {
//         console.log('no instance');
//         if (value) {
//           currNode.value = value;
//         }
//       }).catch(reason => {
//         currNode.value = {} as NodeInputInterface;
//         if (reason.code == 'nodeNotFound') {
//           toastError({ message: 'Không tìm thấy nốt bắt đầu của quy trình' });
//         }
//       });
//     }
//   }
// });

function canReturnFn() {
  return canReturnResult.value?.canReturn;
}

function getCurrentNode(process: Process | void, flowId: string | undefined) {
  if (process?.flowInstanceId && process?.stepId && process) {
    currentInstanceNode(process?.flowInstanceId, process?.stepId).then(value => {
      if (value) {
        currNode.value = value;
      } else {
        currNode.value = undefined;
      }
    }).catch(error => {
      toastError(error);
      currNode.value = undefined;
    });
  } else if (flowId) {
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
    }
  }
}

const visibleDialog = ref<boolean>(false);
const visibleDialogRevoke = ref<boolean>(false);

const selectedOutcome = ref<Outcome>();

function nextProcess(outcome: Outcome) {
  selectedOutcome.value = outcome;
  visibleDialog.value = true;
}

function finish() {
  confirm.require({
    group: 'finish',
    message: t('Bạn có chắc chắn muốn Hoàn thành văn bản: '),
    header: t('common.confirm'),
    icon: 'pi pi-exclamation-triangle',
    accept: () => {
      if (process.value?.id && !isComplete.value) {
        completeDoc().mutate({
          currentProcessId: process.value?.id,
          userDeptRole: userDeptRole.value
        }).then(toastSuccessAndBack)
          .catch(toastError);
      }
    }
  });

}

function returnDoc(form: FormData) {
  if (props.doc?.id) {
    confirm.require({
      group: 'finish',
      message: t(`Bạn có chắc chắn muốn ${capitalize(t('document.action.return'))}: `),
      header: t('common.confirm'),
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        rejectDoc(props.doc?.id || '', form).then(() => {
          toastSuccessAndBack();
        });
      }
    });
  }
}

function returnDocReceive(form: FormData) {
  if (props.doc?.id) {
    confirm.require({
      group: 'finish',
      message: t(`Bạn có chắc chắn muốn ${capitalize(t('document.action.return'))}: `),
      header: t('common.confirm'),
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        rejectDocWithSpecifyStep(props.doc?.id || '', form).then(() => {
          toastSuccessAndBack();
        });
      }
    });

  }
}

function receiveToKnow() {
  if (process.value?.id && !isComplete.value && props.doc?.id) {
    confirm.require({
      group: 'finish',
      message: t('Bạn có chắc chắn muốn Nhận để biết văn bản: '),
      header: t('common.confirm'),
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

const afterAction = inject('afterAction', () => router.back());

const mapSupportAction = inject('mapSupportAction', {} as ComputedRef<Record<string, true>>);
const hideButtonsName = inject('hideButtonsName', toRef<string[]>([]));
</script>

<style lang="scss" scoped>
.btn-action {
  font-size: 14px;
  font-weight: 400;
  border-radius: 4px;
  min-height: 30px;

  :deep(.p-button-label) {
    font-size: 14px;
    font-weight: 400;
  }
}
.revoke-btn {
  :deep(.custom-icon) {
    color: #F87168;
  }
}
</style>