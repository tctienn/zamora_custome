<template>
  <Dialog
    v-model:visible='isVisibleDialogReturn'
    :header='t("document.action.return")'
    v-bind='DEFAULT_DIALOG_CONFIG'
    @after-hide='afterHide'>
    <form
      ref='form'
      @submit.prevent='submitReject'>

      <input
        v-model='userDeptRole.userId'
        hidden
        name='userDeptRole.userId'/>

      <input
        v-model='userDeptRole.userName'
        hidden
        name='userDeptRole.userName'/>

      <input
        v-model='userDeptRole.deptId'
        hidden
        name='userDeptRole.deptId'/>

      <input
        v-model='userDeptRole.deptName'
        hidden
        name='userDeptRole.deptName'/>

      <input
        v-model='userDeptRole.roleId'
        hidden
        name='userDeptRole.roleId'/>

      <input
        v-model='userDeptRole.roleName'
        hidden
        name='userDeptRole.roleName'/>

      <input
        v-model='userDeptRole.type'
        hidden
        name='userDeptRole.type'/>
      
      <!-- Step selection (only show when flowInstanceId is provided) -->
      <div
        v-if='flowInstanceId'
        class='field pb-3'>
        <label class='font-semibold'>
          {{ t('document.flowAction.returnSteps') }}
        </label>
        <div>
          <Dropdown 
            v-model='selectedStep'
            class='w-full'
            :loading='isLoadingNodes'
            option-label='data.label'
            option-value='id'
            :options='flowNodes'
            :placeholder="t('document.flowAction.selectStep')"
            show-clear>
            <template #option='slotProps'>
              <div class='align-items-center flex'>
                <span>{{ slotProps.option.data?.label || slotProps.option.id }}</span>
              </div>
            </template>
          </Dropdown>
          <small
            v-if='v$.selectedStep.$error'
            class='p-error'>
            {{ v$.selectedStep.$errors[0]?.$message }}
          </small>
        </div>
      </div>

      <div class='field pb-3'>
        <label
          v-required
          class='font-semibold'>
          {{ t('document.flowAction.returnReason') }}
        </label>
        <div>
          <Textarea
            id='description'
            v-model='note'
            class='overflow-auto w-full'
            name='note'
            :rows='5'/>
        </div>
      </div>
      <UploadFiles
        v-model:list-file='attachments'
        :file-attachments-name='"attachments"'
        :header='t("common.attachment")'
        :max-height='"38vh"'/>
      <ValidateErrorMessage :errors='v$.attachments.$errors'/>
    </form>
    <template #footer>
      <Button
        class='border-round-sm p-button-plain'
        :icon='returnNodeButtons.closeButton.icon'
        :label='returnNodeButtons.closeButton.label'
        severity='danger'
        @click='returnNodeButtons.closeButton.command'/>
      <Button
        class='border-round-sm'
        :disabled='!(note&&note?.trim().length>0)'
        :icon='returnNodeButtons.actionButton.icon'
        :label='returnNodeButtons.actionButton.label'
        @click='returnNodeButtons.actionButton.command'>
      </Button>
    </template>
  </Dialog>
</template>

<script lang="ts" setup>

import { useVuelidate } from '@vuelidate/core';
import { helpers, type MessageProps, required } from '@vuelidate/validators';
import { storeToRefs } from 'pinia';
import Dropdown from 'primevue/dropdown';
import { computed, provide, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import type { DocumentAttachment } from '@/apps/document/model/attachment';
import { useDocumentRolesStore } from '@/apps/document/store/document-role';
import { loadFlowInstance } from '@/apps/work-flow/api/graphql/flow-api';
import type { NodeInputInterface } from '@/apps/work-flow/model/flow';
import UploadFiles from '@/common/components/custom/UploadFiles.vue';
import { DEFAULT_DIALOG_CONFIG } from '@/common/constants';
import { convertFileSize } from '@/common/helpers/file-utils';

const props = defineProps({
  docId: {
    type: String,
    required: true
  },
  flowInstanceId: {
    type: String,
    required: false,
    default: ''
  }
});

const emits = defineEmits<{
  (e: 'returnDoc', form: FormData): void,
}>();

const { userDeptRole } = storeToRefs(useDocumentRolesStore());

const { t } = useI18n();
const form = ref();

const isVisibleDialogReturn = defineModel<boolean>('visible', { default: false });
const note = defineModel<string>('note', { default: undefined });
const attachments = ref<DocumentAttachment[]>([]);
const selectedStep = ref<string | null>(null);
const flowNodes = ref<NodeInputInterface[]>([]);
const isLoadingNodes = ref(false);

// Load flow nodes when dialog is visible and flowInstanceId is provided
watch(isVisibleDialogReturn, async (visible) => {
  if (visible && props.flowInstanceId) {
    await loadFlowNodes();
  }
});

async function loadFlowNodes() {
  if (!props.flowInstanceId) {
    return;
  }
  
  isLoadingNodes.value = true;
  try {
    const result = loadFlowInstance(props.flowInstanceId);
    result.onResult((res) => {
      const nodes = res.data?.loadFlowInstance?.nodes || [];
      // Filter out only relevant node types (BASIC, START, END)
      flowNodes.value = nodes.filter((node: any) =>
        node.type === 'BASIC' || node.type === 'START' || node.type === 'END'
      );
      isLoadingNodes.value = false;
    });
  } catch (error) {
    console.error('Failed to load flow nodes:', error);
    flowNodes.value = [];
    isLoadingNodes.value = false;
  }
}

const returnNodeButtons = {
  closeButton: {
    icon: 'pi pi-times',
    label: t('common.close'),
    severity: 'danger',
    type: 'button',
    command: () => isVisibleDialogReturn.value = false
  },
  actionButton: {
    icon: 'pi pi-ban',
    label: t('document.action.return'),
    text: false,
    type: 'button',
    command: () => submitReject()
  }
};

function submitReject() {
  v$.value.$validate().then((valid) => {
    if (valid) {
      const formData = new FormData(form.value);
      // Add selected step to form data as targetNodeIds
      if (selectedStep.value) {
        formData.append('targetNodeId', selectedStep.value);
      }
      emits('returnDoc', formData);
    }
  });
}

const fileSizeComputed = computed(() => {
  return attachments.value.reduce((previousValue, currentValue) => {
    return previousValue + currentValue.size;
  }, 0);
});
const validationRules = {
  attachments: {
    maxFileSize: helpers.withMessage((params: MessageProps) => {
      return t('Tổng dung lượng tệp không vượt quá 100MB.') + 'Hiện tại: ' + convertFileSize(fileSizeComputed.value);
    }, () => {
      return fileSizeComputed.value <= 100 * 1000 * 1000;
    })
  },
  selectedStep: {
    required: helpers.withMessage(
      () => t('document.flowAction.stepRequired'),
      (value: string | null) => {
        // Only required when flowInstanceId is provided
        if (props.flowInstanceId) {
          return value !== null && value !== '';
        }
        return true;
      }
    )
  }
};
const v$ = useVuelidate(validationRules, {
  attachments: attachments,
  selectedStep: selectedStep 
});

function afterHide() {
  attachments.value = [];
  note.value = '';
  selectedStep.value = null;
}

provide('dialogFooterButtons', returnNodeButtons);
</script>

<style scoped>

</style>