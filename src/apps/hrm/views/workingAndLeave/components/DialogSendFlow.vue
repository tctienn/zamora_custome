<template>
  <Dialog
    v-model:visible='visible'
    class='wrapper-processing-dialog'
    header='Chuyển tổng hợp'
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
                v-model='sendSummary.reviewer'
                :button-select-user = 'false'
                class='w-full'
                name='reviewer'
                style='height: 3rem'/>
              <ValidateErrorMessage :errors='v$.reviewer.$errors'/>
            </div>
          </div>
          <FormInputTextArea
            v-model='sendSummary.note'
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
            class='border-round-sm'
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
import { type Ref, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { changeStatus } from '@/apps/hrm/api/graphql/timesheet';
import FormInputTextArea from '@/apps/hrm/components/form/FormInputTextArea.vue';
import { type SendTimeSheetFlow, TimeSheetStatus } from '@/apps/hrm/model/time-sheet';
import NamedSelectUser from '@/common/components/custom/NamedSelectUser.vue';
import { DEFAULT_DIALOG_CONFIG } from '@/common/constants';

const props = defineProps({
  timeSheetId: {
    type: String,
    default: '' 
  } 
});
const emit = defineEmits(['update:refetch']);
const { t } = useI18n();
const visible = defineModel('visible', { type: Boolean });
const {
  mutate: changeStatusTimeSheet,
  onDone: changeStatusTimeSheetDone,
} = changeStatus();

const sendSummary = ref<SendTimeSheetFlow>({} as SendTimeSheetFlow);

const rules = {
  reviewer: {
    required: helpers.withMessage(t('common.validate.required', { item: 'Người nhận' }), required),
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

  await changeStatusTimeSheet({
    id: props.timeSheetId,
    status: TimeSheetStatus.PENDING,
    reviewer: sendSummary.value.reviewer,
    note: sendSummary.value.note || ''
  });
};

const handleHide = ()=>{
  visible.value = false;
};

changeStatusTimeSheetDone((result)=>{
  if (result.data?.changeStatus) {
    emit('update:refetch');
    handleHide();
  }
});

</script>

<style lang="scss" scoped>
:deep(.p-dropdown-panel) {
  z-index: 9999 !important;
}
</style>