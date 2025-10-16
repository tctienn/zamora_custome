<template>
  <Dialog
    v-model:visible='visible'
    class='wapprer-processing-dialog'
    header='Gửi tổng hợp'
    v-bind='DEFAULT_DIALOG_CONFIG'
    :pt="{
      content: {
        class: 'pt-3'
      }
    }"
    style='width: 60rem;'
    @hide='handleHile'>
    <div>
      <form ref='formRequestDeadline'>
        <div
          class='formgrid grid'>
          <div class='col-12 field'>
            <label>Chuyển đến</label>
            <div>
              <NamedSelectUser
                v-model='sendSummary.synthesizerUserId'
                :button-select-user = 'false'
                class='w-full'
                name='synthesizerUserId'
                style='height: 3rem'/>
              <ValidateErrorMessage :errors='v$.synthesizerUserId.$errors'/>
            </div>
          </div>
          <FormInputTextArea
            v-model='sendSummary.content'
            class='col-12 pt-2'
            :label="t('Nội dung')"
            rows='10'/>
        </div>
        <div
          class='border-primary-100 border-top-1 bottom-0 fixed flex gap-2 justify-content-center p-3 py-1 surface-overlay'
          style='width: 96%'>
          <Button
            class='p-button-plain'
            icon='pi pi-times'
            :label="t('common.close')"
            severity='danger'
            @click='handleHile'/>
          <Button
            icon='pi pi-send'
            :label='t(`Thực hiện`)'
            @click='save'/>
        </div>
      </form>
    </div>
  </Dialog>
</template>

<script lang='ts' setup>
import useVuelidate, { type Validation } from '@vuelidate/core';
import { helpers, required } from '@vuelidate/validators';
import { inject, type Ref, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { sendEvaluateEmployeeReportToSynthesizer } from '@/apps/hrm/api/graphql/evaluate';
import FormInputTextArea from '@/apps/hrm/components/form/FormInputTextArea.vue';
import type { EvaluateReportDetail, SendSummary } from '@/apps/hrm/model/evaluate';
import NamedSelectUser from '@/common/components/custom/NamedSelectUser.vue';
import { DEFAULT_DIALOG_CONFIG } from '@/common/constants';
import { toastSuccess } from '@/common/helpers/custom-toast-service';

const { t } = useI18n();
const visible = defineModel('visible', { type: Boolean });
const isRefresh = inject('isRefresh', ref(0));
const selectedReport = inject('selectedReport') as Ref<EvaluateReportDetail | null>;
const {
  mutate: sendReportEvaluateMutate,
  onDone: reportEvaluateOnDone
} =
  sendEvaluateEmployeeReportToSynthesizer();

const sendSummary = ref<SendSummary>({} as SendSummary);

const rules = {
  synthesizerUserId: {
    required: helpers.withMessage(t('common.validate.required', { item: 'Người tổng hợp' }), required),
    $autoDirty: true,
  }
};
const v$: Ref<Validation> = useVuelidate(rules, sendSummary);
const save = async () =>{
  v$.value.$touch();
  const isValid = await v$.value.$validate();
  if (!isValid) {
    return;
  }
  sendSummary.value.reportId = selectedReport.value?.report?.id;
  sendReportEvaluateMutate({ sendEvaluateEmployeeReportToSynthesizerInput: sendSummary.value });
};

reportEvaluateOnDone(() => {
  toastSuccess({ message: 'Gửi tổng hợp thành công' });
  isRefresh.value++;
  visible.value = false;
});

const handleHile = ()=>{
  visible.value = false;
};

</script>

<style>
</style>