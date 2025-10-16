<template>
  <SubmitNextButtonsOutSide
    :disabled='validateButton()'
    :doc='doc'
    :process='process'/>
</template>

<script lang='ts' setup>

import { inject, onMounted, onUnmounted, type PropType, ref, toRef, watch } from 'vue';

import { TypeOfPresentation } from '@/apps/document/model/doc/doc-in';
import type { DocOut } from '@/apps/document/model/doc/doc-out';
import type { DocSubmit } from '@/apps/document/model/doc/doc-submit-input';
import type { Process } from '@/apps/document/model/process/process';
import SubmitNextButtonsOutSide
  from '@/apps/document/views/doc/submit/component/next-buttons-outside/SubmitNextButtonsOutSide.vue';
import type { NodeInputInterface } from '@/apps/work-flow/model/flow';
import EventBus from '@/common/helpers/event-bus';

const props = defineProps({
  process: {
    type: Object as PropType<Process | undefined>,
    required: true,
  },
  doc: {
    type: Object as PropType<DocSubmit | undefined>,
    required: true,
  },
  disabled: {
    type: Boolean,
    default: false
  }
});
const currNode = ref<NodeInputInterface>();
const validateSignVariable = ref(false);
const validateQuestionVariable = ref(false);
onMounted(() => {
  EventBus.on('validate-question-process', validateQuestion);
  EventBus.on('validate-sign-process', validateSign);
});

onUnmounted(() => {
  EventBus.off('validate-question-process', validateQuestion);
  EventBus.off('validate-sign-process', validateSign);
});

function validateQuestion(disableEvent: boolean) {
  validateQuestionVariable.value = !checkSignStatus(props.doc);
  if (props.doc?.docType == TypeOfPresentation.PHIEU_LAY_Y_KIEN) {
    validateQuestionVariable.value = disableEvent;
  }
}

function checkSignStatus(data: any): boolean {
  const signCa = currNode.value?.data.optionActions?.some((option) => option.name === 'SIGN_CA');
  const signApprove = currNode.value?.data.optionActions?.some((option) => option.name === 'SIGN_APPROVE');

  if (!signCa && !signApprove) {
    return true;
  }

  if (signCa && signApprove) {
    if (
      data.filePresentation?.isCaSign && data.filePresentation?.isDigitalSign
        || data.docOuts?.some((docOut: DocOut) =>
          docOut.outGoingAttachments?.some(
            (attachment) => attachment.isCaSign && attachment.isDigitalSign
          )
        )
    ) {
      return true;
    }
  }

  if (signCa) {
    if (
      data.filePresentation?.isCaSign
        || data.docOuts?.some((docOut: DocOut) =>
          docOut.outGoingAttachments?.some((attachment) => attachment.isCaSign)
        )
    ) {
      return true;
    }
  }

  if (signApprove) {
    if (
      data.filePresentation?.isDigitalSign
        || data.docOuts?.some((docOut: DocOut) =>
          docOut.outGoingAttachments?.some((attachment) => attachment.isDigitalSign)
        )
    ) {
      return true;
    }
  }

  return false;
}

function validateSign(disableEvent: boolean) {
  validateSignVariable.value = disableEvent;
}

function validateButton() {
  return validateSignVariable.value || validateQuestionVariable.value;
}

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