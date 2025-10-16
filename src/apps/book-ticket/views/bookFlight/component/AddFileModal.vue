<template>
  <Dialog
    v-model:visible='visibleForm'
    v-bind='DEFAULT_DIALOG_CONFIG'
    :header="t('book-ticket.bookFlight.attachment.titleForm')"
    style='max-height: 70vh'
    @hide='handleClose'>
    <form @submit.prevent='handleSubmit'>
      <div class='formgrid grid mb-4'>
        <div class='col'>
          <div class=''>
            <div class='flex flex-column gap-2 justify-content-end pb-3'>
              <label
                v-required>
                {{ t('book-ticket.bookFlight.attachment.table.quote') }}
              </label>
              <InputText
                v-model='fileDataValue.quote'
                class='p-component p-inputtext'
                maxlength='255'
                name='quote'/>
              <ValidateErrorMessage :errors='vi$.quote.$errors'/>
            </div>
          </div>
          <div class='field'>
            <label>{{ t('book-ticket.bookFlight.attachment.table.fileAttached') }}</label>
            <div class='align-items-center border-1 border-round-md flex justify-content-between mb-1 p-2 surface-border'>
              <input
                ref='fileInput'
                accept='.pdf,.doc,.docx'
                class='hidden'
                type='file'
                @change='handleFileUpload($event)' />
              <div class='flex'>
                <AppIcon
                  class='cursor-pointer'
                  name='upload'
                  size='1.7'
                  @click='triggerFileInput'/>
                <p
                  v-if='fileDataValue.attachment'
                  class='text-900'>{{ fileDataValue?.attachment?.name }}</p>
              </div>
              <AppIcon
                v-if='fileDataValue.attachment'
                class='cursor-pointer'
                name='clear'
                size='1.5'
                @click='removeFile(fileDataValue)'/>
            </div>
            <small class='text-600'>{{ t('book-ticket.bookFlight.attachment.note') }}</small>
          </div>
        </div>
      </div>
      <div
        class='border-primary-100 border-top-1 bottom-0 fixed flex gap-2 justify-content-center p-3 py-2 surface-overlay'
        style='width: 96%'>
        <Button
          class='p-button-plain'
          icon='pi pi-times'
          :label="t('common.close')"
          severity='danger'
          @click='handleClose'/>
        <Button
          icon='pi pi-save'
          :label="t('common.save')"
          type='submit'/>
      </div>
    </form>
  </Dialog>
</template>

<script lang="ts" setup>
import useVuelidate from '@vuelidate/core';
import { helpers, required } from '@vuelidate/validators';
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import type { IAttachmentFile } from '@/apps/book-ticket/model/bookFlight';
import AppIcon from '@/common/components/app/AppIcon.vue';
import { DEFAULT_DIALOG_CONFIG } from '@/common/constants';
import { toastError } from '@/common/helpers/custom-toast-service';

const props = defineProps({
  visibleDialog: {
    type: Boolean,
    default: false,
  }
});
const emits = defineEmits(['update:visibleDialog', 'submit']);
const { t } = useI18n();

const visibleForm = computed({
  get: () => props.visibleDialog,
  set: (val) => emits('update:visibleDialog', val),
});
const fileDataValue = ref<IAttachmentFile>({} as IAttachmentFile);

const rules = { quote: { required: helpers.withMessage(t('book-ticket.bookFlight.attachment.required.quote'), required) }, };
const vi$ = useVuelidate(rules, fileDataValue);

const fileInput = ref<HTMLInputElement | null>(null);

const allowedTypes = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 
];

const triggerFileInput = () => {
  if (fileInput.value) {
    fileInput.value.click();
  }
};

const handleFileUpload = (event: Event) => {
  const input = event.target as HTMLInputElement;
  const file = input?.files?.[0];
  if (!file) {
    return;
  }
  if (!allowedTypes.includes(file.type)) {
    toastError({ message: t('book-ticket.bookFlight.attachment.invalidFileType'), });
    fileInput.value = null;
    fileDataValue.value.attachment = null;
    return;
  }
  fileDataValue.value.attachment = file;
};

const removeFile = (row: IAttachmentFile) => {
  row.attachment = null;
};

const handleSubmit = async () => {
  const isValid = await vi$.value.$validate();
  if (!isValid) {
    return;
  }
  emits('submit', fileDataValue.value);
  handleClose();
};

const handleClose = () => {
  emits('update:visibleDialog', false);
  vi$.value.$reset();
};
</script>