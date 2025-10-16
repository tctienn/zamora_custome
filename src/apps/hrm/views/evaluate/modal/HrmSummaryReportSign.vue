<template>
  <Dialog
    v-model:visible='visible'
    v-bind='DEFAULT_DIALOG_CONFIG'
    :header="t('Tạo mới chân ký')"
    :style='{
      width: "60vw",
    }'
    @hide='hideForm'>
    <div>
      <form
        ref='formRequest'
        class='mb-6'>
        <div class='formgrid grid'>
          <FormInputText
            v-model='summaryReportSign.titleOfSignatoryName'
            class='col-12'
            :error='v$?.$errors?.find((error) => error.$property === "titleOfSignatoryName")?.$message?.toString()'
            :label="t('Tên chân ký')"
            name='titleOfSignatoryName'
            required/>
          <FormInputNumber
            v-model='summaryReportSign.orderNumber'
            class='col-12'
            :error='v$?.$errors?.find((error) => error.$property === "orderNumber")?.$message?.toString()'
            :label="t('Số thứ tự')"
            name='orderNumber'
            required/>
          <div
            class='border-primary-100 border-top-1 bottom-0 fixed flex gap-2 justify-content-center p-3 py-1 surface-overlay'
            style='width: 96%'>
            <Button
              class='p-button-plain'
              icon='pi pi-times'
              :label="t('common.close')"
              severity='secondary'
              @click='hideForm'/>
            <Button
              icon='pi pi-save'
              :label='t(`Thêm mới`)'
              :loading='isSubmitting'
              @click='submit'/>
          </div>
        </div>
      </form>
    </div>
  </Dialog>
</template>

<script setup lang='ts'>
import useVuelidate from '@vuelidate/core';
import { helpers, required } from '@vuelidate/validators';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

import FormInputNumber from '@/apps/hrm/components/form/FormInputNumber.vue';
import FormInputText from '@/apps/hrm/components/form/FormInputText.vue';
import type { SignatureSummaryReport } from '@/apps/hrm/model/evaluate';
import { DEFAULT_DIALOG_CONFIG } from '@/common/constants';

defineProps({
  id: {
    type: String,
    default: null,
  },
});
const emits = defineEmits(['submit']);

const { t } = useI18n();
const visible = defineModel('visible', { type: Boolean });
const summaryReportSign = ref<SignatureSummaryReport>({} as SignatureSummaryReport);
const isSubmitting = ref<boolean>(false);

const validateRules = {
  titleOfSignatoryName: { required: helpers.withMessage(t('Tên chân ký không được để trống'), required) },
  orderNumber: { required: helpers.withMessage(t('Số thứ tự không được để trống'), required) },
};
const v$ = useVuelidate(validateRules, summaryReportSign);

const submit = () => {
  v$.value.$validate()
    .then((isValid) => {
      if (isValid && summaryReportSign.value) {
        isSubmitting.value = true;
        const newItem: SignatureSummaryReport = {
          titleOfSignatoryName: summaryReportSign.value.titleOfSignatoryName,
          orderNumber: summaryReportSign.value.orderNumber,
          isActive: true,
        };
        emits('submit', newItem);
        isSubmitting.value = false;
        visible.value = false;
      }
    });
};

function hideForm() {
  visible.value = false;
}

</script>

<style scoped>

</style>