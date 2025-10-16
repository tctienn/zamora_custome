<template>
  <Dialog
    v-model:visible='isVisibleDialogReturn'
    :header='t("document.action.reject")'
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
      <div class='field pb-3'>
        <label
          v-required
          class='font-semibold'>
          {{ t('document.flowAction.rejectReason') }}
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
        :max-height="'38vh'"/>
      <ValidateErrorMessage :errors='v$.attachments.$errors'/>
    </form>
    <template #footer>
      <Button
        class='p-button-plain'
        :icon='returnNodeButtons.closeButton.icon'
        :label='returnNodeButtons.closeButton.label'
        severity='danger'
        @click='returnNodeButtons.closeButton.command'/>
      <Button
        :disabled='!(note&&note.trim().length>0)'
        :icon='returnNodeButtons.actionButton.icon'
        :label='returnNodeButtons.actionButton.label'
        @click='returnNodeButtons.actionButton.command'>
      </Button>
    </template>

  </Dialog>
</template>

<script lang="ts" setup>

import { useVuelidate } from '@vuelidate/core';
import { helpers, type MessageProps } from '@vuelidate/validators';
import { storeToRefs } from 'pinia';
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import type { DocumentAttachment } from '@/apps/document/model/attachment';
import { useDocumentRolesStore } from '@/apps/document/store/document-role';
import UploadFiles from '@/common/components/custom/UploadFiles.vue';
import { DEFAULT_DIALOG_CONFIG } from '@/common/constants';
import { convertFileSize } from '@/common/helpers/file-utils';

const emits = defineEmits<{
  (e: 'rejectDoc', form: FormData): void,
}>();

const { userDeptRole } = storeToRefs(useDocumentRolesStore());

const { t } = useI18n();
const form = ref();

const isVisibleDialogReturn = defineModel<boolean>('visible', { default: false });
const note = defineModel<string>('note', { default: undefined });
const attachments = ref<DocumentAttachment[]>([]);
const returnNodeButtons = {
  closeButton: {
    icon: 'close',
    label: t('common.close'),
    severity: 'danger',
    type: 'button',
    command: () => isVisibleDialogReturn.value = false
  },
  actionButton: {
    icon: 'pi pi-ban',
    label: t('document.action.reject'),
    text: false,
    type: 'button',
    command: () => submitReject()
  }
};

function submitReject() {
  v$.value.$validate().then((valid) => {
    if (valid) {
      const formData = new FormData(form.value);
      emits('rejectDoc', formData);
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
  }
};
const v$ = useVuelidate(validationRules, { attachments: attachments });

function afterHide() {
  attachments.value = [];
  note.value = '';
}
</script>

<style scoped>

</style>