<template>
  <Dialog
    v-model:visible='visible'
    class='wrapper-processing-dialog'
    header='Gửi tổng hợp'
    v-bind='DEFAULT_DIALOG_CONFIG'
    :pt="{
      content: {
        class: 'pt-3'
      }
    }"
    style='width: 60rem;'
    @hide='handleHide'>
    <div>
      <form ref='formRequestDeadline'>
        <div
          class='formgrid grid'>
          <div class='col-12 field'>
            <label>Chuyển đến</label>
            <div>
              <NamedSelectUser
                v-model='sendSummary.reporterUserId'
                :button-select-user = 'false'
                class='w-full'
                name='reporterUserId'
                style='height: 3rem'/>
              <ValidateErrorMessage :errors='v$.reporterUserId.$errors'/>
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
            class='border-round-sm p-button-plain'
            icon='pi pi-times'
            :label="t('common.close')"
            severity='danger'
            @click='handleHide'/>
          <Button
            class='border-round-sm p-button-plain'
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
import { computed, inject, type Ref, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { updateStatus } from '@/apps/hrm/api/graphql/salary';
import FormInputTextArea from '@/apps/hrm/components/form/FormInputTextArea.vue';
import { PayslipStatus, type SimplifiedSalaryInfoType } from '@/apps/hrm/model/salary';
import NamedSelectUser from '@/common/components/custom/NamedSelectUser.vue';
import ValidateErrorMessage from '@/common/components/custom/ValidateErrorMessage.vue';
import { DEFAULT_DIALOG_CONFIG } from '@/common/constants';
import { toastError, toastSuccess } from '@/common/helpers/custom-toast-service';

interface Props {
  selectedPayslip?: SimplifiedSalaryInfoType | null;
  visible: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: 'update:refetch'): void;
  (e: 'update:visible', value: boolean): void;
}>();
const { t } = useI18n();

// Computed for two-way binding with parent
const visible = computed({
  get: () => props.visible,
  set: (value: boolean) => emit('update:visible', value)
});
const {
  mutate: updateStatusMutate,
  onDone: updateStatusOnDone,
  onError: updateStatusOnError
} = updateStatus();

const sendSummary = ref({
  reporterUserId: '',
  content: ''
});

const rules = {
  reporterUserId: {
    required: helpers.withMessage(t('common.validate.required', { item: 'Người tổng hợp' }), required),
    $autoDirty: true,
  }
};
const v$ = useVuelidate(rules, sendSummary);

// Determine next status based on current status
const getNextStatus = (currentStatus: string): string => {
  switch (currentStatus) {
  case PayslipStatus.DRAFT:
    return PayslipStatus.PENDING_REVIEW;
  case PayslipStatus.PENDING_REVIEW:
    return PayslipStatus.PENDING_APPROVAL;
  case PayslipStatus.PENDING_APPROVAL:
    return PayslipStatus.APPROVED;
  case PayslipStatus.APPROVED:
    return PayslipStatus.APPROVED; // Already approved, no change
  default:
    return PayslipStatus.PENDING_REVIEW; // Default to pending review
  }
};

const save = async () => {
  v$.value.$touch();
  const isValid = await v$.value.$validate();
  if (!isValid) {
    return;
  }

  if (!props.selectedPayslip?.id) {
    toastError({ message: 'Không tìm thấy bảng lương được chọn!' });
    return;
  }

  const currentStatus = props.selectedPayslip.status || PayslipStatus.DRAFT;
  const nextStatus = getNextStatus(currentStatus);

  await updateStatusMutate({
    id: props.selectedPayslip.id,
    status: nextStatus
  });
};

updateStatusOnDone(() => {
  toastSuccess({ message: 'Chuyển duyệt thành công' });
  emit('update:refetch');
});

updateStatusOnError(() => {
  toastError({ message: 'Lỗi khi chuyển duyệt!' });
});

const handleHide = () => {
  emit('update:visible', false);
  // Reset form on close
  sendSummary.value = {
    reporterUserId: '',
    content: ''
  };
};

</script>

<style>
</style>