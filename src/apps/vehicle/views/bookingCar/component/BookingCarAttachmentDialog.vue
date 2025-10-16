<template>
  <Dialog
    v-model:visible='visibleForm'
    v-bind='DEFAULT_DIALOG_CONFIG'
    header='Thêm tệp đính kèm'
    style='width: 40rem'
    @hide="emits('hide-dialog')">
    <div>
      <form ref='form'>
        <div class='formgrid grid mb-4'>
          <div class='col-12 field'>
            <label
              v-required
              class='font-bold'>Trích yếu</label>
            <InputText
              v-model='attachment.quote'
              class='p-component p-inputtext w-full'
              maxlength='255'
              name='quote'/>
            <ValidateErrorMessage :errors='v$.quote.$errors'/>
          </div>

          <div class='col-12 field'>
            <FileUpload
              accept='.pdf,.doc,.docx'
              class='mb-2'
              custom-upload
              mode='basic'
              name='attachment'
              @select='onSelectFile'/>
            <ValidateErrorMessage
              :errors='v$.attachment.$errors'/>
            Ghi chú: chỉ tải file có định dạng .PDF, DOC
          </div>
        </div>
      </form>

      <div
        class='border-primary-100 border-top-1 bottom-0 fixed flex gap-2 justify-content-center p-3 py-2 surface-overlay'
        style='width: 96%'>
        <Button
          class='p-button-plain'
          icon='pi pi-times'
          :label="t('common.close')"
          severity='danger'
          @click="emits('hide-dialog')"/>
        <Button
          icon='pi pi-save'
          :label="t('common.save')"
          @click='submitForm'/>
      </div>
    </div>
  </Dialog>
</template>

<script setup lang='ts'>

import { useVuelidate } from '@vuelidate/core';
import { helpers, required } from '@vuelidate/validators';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

import type { BookingCarAttachmentInput } from '@/apps/vehicle/model/bookingCar';
import { DEFAULT_DIALOG_CONFIG } from '@/common/constants';

const props = defineProps({
  visibleDialog: {
    type: Boolean,
    default: false,
  },
});

const emits = defineEmits(['hide-dialog', 'submit-attachment']);
const { t } = useI18n();
const visibleForm = ref(props.visibleDialog);
const attachment = ref<BookingCarAttachmentInput>({} as BookingCarAttachmentInput);

const validateRules = {
  quote: {
    required: helpers.withMessage(
      t('vehicle.locationPoint.error.requiredQuote'),
      required,
    ),
  },
  attachment: {
    required: helpers.withMessage(
      t('vehicle.locationPoint.error.requiredAttachment'),
      required,
    ),
  },
};

const v$ = useVuelidate(validateRules, attachment);

const onSelectFile = (event: any) => {
  const file = event.files?.[0];
  attachment.value.attachment = file;
};

const submitForm = () => {
  v$.value
    .$validate()
    .then((isValid) => {
      if (isValid && attachment.value.attachment) {
        emits('submit-attachment', attachment.value);
        emits('hide-dialog');
      }
    });
};
</script>

<style scoped>

</style>