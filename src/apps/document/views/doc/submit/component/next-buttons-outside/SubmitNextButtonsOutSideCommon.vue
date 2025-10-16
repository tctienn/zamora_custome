<template>
  <template v-if="!hideButtonsName.includes('ALL')">
    <div class='flex gap-1'>
      <template v-if='!isComplete && isMainHandle'>
        <FlowButtons
          :disabled-func='() => disabled'
          icon-size='1'
          :outcomes='outcomes'
          size='small'
          @action='nextProcess'/>
        <Button
          v-if='canReturn && process?.id && !hideButtonsName.includes("REJECT") && userDeptRole.roleId!=RoleType.CHUYEN_VIEN'
          :label='t("document.action.reject")'
          severity='danger'
          size='small'
          @click='visibleRejectDialog=true'>
          <template #icon>
            <AppIcon
              class='align-items-center flex pr-1'
              name='block'
              size='1'>
            </AppIcon>
          </template>
        </Button>
      </template>
      <Button
        v-if='canRevoke &&((userDeptRole.roleId==RoleType.TRO_LY && mapSupportAction["REVOKE"])||userDeptRole.roleId!=RoleType.TRO_LY)
          && !hideButtonsName.includes("REVOKE")'
        :label="t('document.action.revoke')"
        severity='warning'
        size='small'
        @click='visibleRevokeDialog=true'>
        <template #icon>
          <AppIcon
            class='align-items-center flex pr-1'
            name='undo'
            size='1'>
          </AppIcon>
        </template>
      </Button>
    </div>

    <UserSelectNextDialogDocSubmit
      v-if='visibleDialog'
      v-model:visible='visibleDialog'
      :flow-instance-id='process?.flowInstanceId'
      :is-start-node='false'
      :node-id='currNode?.id||""'
      :org-type='userDeptRole.type'
      :process-id='process?.id'
      :result='selectedOutcome?.name||""'/>
    <RevokeSubmitDialog
      v-model:visible='visibleRevokeDialog'
      :doc-id='doc?.id||""'
      @revoke-doc='revoke'/>

    <RejectSubmitDialog
      v-model:visible='visibleRejectDialog'
      @reject-doc='handleReject'/>
  </template>
</template>

<script lang='ts' setup>

import { storeToRefs } from 'pinia';
import { computed, type ComputedRef, inject, onMounted, onUnmounted, type PropType, ref, toRef, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

import {
  canReturnDocSubmit,
  canRevokeDocSubmitLazy,
  revokeDocSubmitGraphql
} from '@/apps/document/api/graphql/doc-submit';
import { rejectDocSubmit } from '@/apps/document/api/rest/docSubmit';
import { currentInstanceNode } from '@/apps/document/api/rest/flowDocument';
import type { DocComment } from '@/apps/document/model/comment';
import { TypeOfPresentation } from '@/apps/document/model/doc/doc-in';
import type { DocOut } from '@/apps/document/model/doc/doc-out';
import type { DocSubmit } from '@/apps/document/model/doc/doc-submit-input';
import { RoleType } from '@/apps/document/model/permission';
import { ProcessType } from '@/apps/document/model/process/incoming';
import type { Process } from '@/apps/document/model/process/process';
import type { SubmitProcess } from '@/apps/document/model/process/submit';
import { useDocumentRolesStore } from '@/apps/document/store/document-role';
import FlowButtons from '@/apps/document/views/doc/component/flow-buttons/FlowButtons.vue';
import UserSelectNextDialogDocSubmit
  from '@/apps/document/views/doc/component/user-select-next/UserSelectNextDialogDocSubmit.vue';
import RejectSubmitDialog from '@/apps/document/views/doc/submit/component/next-buttons-dialogs/RejectSubmitDialog.vue';
import RevokeSubmitDialog from '@/apps/document/views/doc/submit/component/next-buttons-dialogs/RevokeSubmitDialog.vue';
import type { NodeInputInterface, Outcome } from '@/apps/work-flow/model/flow';
import { toastError, toastSuccess } from '@/common/helpers/custom-toast-service';
import EventBus from '@/common/helpers/event-bus';

const props = defineProps({
  process: {
    type: Object as PropType<Process>,
    default: undefined,
  },
  doc: {
    type: Object as PropType<DocSubmit>,
    default: undefined,
  },
  disabled: {
    type: Boolean,
    default: false
  }
});

const { userDeptRole } = storeToRefs(useDocumentRolesStore());
const { t } = useI18n();
const canReturn = ref(true);
const router = useRouter();
const currNode = ref<NodeInputInterface>();
const outcomes = computed<Outcome[]>(() => {
  return currNode.value?.data?.outcomes || [];
});
const isComplete = computed(() => props.process?.isComplete || false);
const isMainHandle = computed(() => props.process?.processType == ProcessType.XL_CHINH);
const {
  load: canReturnLoad,
  onResult: canReturnResult
} = canReturnDocSubmit();
const validateSignVariable = ref(false);
const validateQuestionVariable = ref(false);
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
const visibleRevokeDialog = ref<boolean>(false);
const visibleRejectDialog = ref<boolean>(false);

const selectedOutcome = ref<Outcome>();

function nextProcess(outcome: Outcome) {
  selectedOutcome.value = outcome;
  visibleDialog.value = true;
}

function handleReject(form: FormData) {
  if (props.process?.id) {
    form.append('processId', props.process?.id);
    rejectDocSubmit(form).then(() => {
      visibleRejectDialog.value = false;
      afterAction();
    });

    // sendDocBack({
    //   processId: props.currentProcessId,
    //   userDeptRole: userDeptRole,
    //   moreInfo: {}
    // }).then(() => afterAction())

  }
}

const {
  result: canRevokeResult,
  variables,
  refetch: refetchCanRevoke,
  load: loadCanRevoke
} = canRevokeDocSubmitLazy(props.doc?.id || '', userDeptRole.value);
if (props.doc?.id) {
  loadCanRevoke();
}

canReturnResult((res) => {
  canReturn.value = res.data.canReturnDocSubmit;
});

watch(() => props.doc?.id, (value) => {
  if (value) {
    let variables = {
      docId: value,
      userDeptRole: userDeptRole.value
    };
    loadCanRevoke(null, variables) || refetchCanRevoke(variables);
    canReturnLoad(undefined, {
      docId: value,
      userDeptRole: userDeptRole.value,
    });
  }
}, { immediate: true });
const canRevoke = computed(() => {
  if (!props.doc?.id || props.doc?.id.trim().length == 0) {
    return false;
  }
  return canRevokeResult.value?.canRevokeDocSubmit;
});

const { mutate } = revokeDocSubmitGraphql();

function revoke(submitProcesses: SubmitProcess[], comment: DocComment[], reason: string) {
  mutate({
    revokeModelInput: {
      docSubmitProcessIds: submitProcesses.map(e => e.id),
      commentIds: comment.map(e => e.id),
      reason: reason,
    },
    userDeptRole: userDeptRole.value
  }).then(value => {
    visibleRevokeDialog.value = false;
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
const currNodeInj = inject('currentNode', toRef({} as NodeInputInterface));
watch(currNode, (value) => {
  if (value) {
    currNodeInj.value = value;
  }
}, {
  deep: true,
  immediate: true
});

</script>

<style scoped>

</style>