<template>
  <Stepper linear>
    <StepperPanel :header='t("work-flow.common.step-1")'>
      <template #content='{ nextCallback }'>
        <WorkFlowGeneralDialog v-model:input='workInput'/>
        <div class='flex justify-content-end'>
          <div class='flex justify-content-end'>
            <Button
              :disabled='isDisabled("WorkFlowGeneralDialog")'
              icon='pi pi-arrow-right'
              icon-pos='right'
              label='Next'
              @click='nextCallback'/>
          </div>
        </div>
      </template>
    </StepperPanel>
    <StepperPanel :header='t("work-flow.common.step-2")'>
      <template #content='{ prevCallback }'>
        <ChooseNextFirstUsers
          v-model:select-user-ids-record='selectUserIdsRecord'
          :flow-id='workInput.flowId'/>
        <div class='flex justify-content-between'>
          <Button
            icon='pi pi-arrow-left'
            icon-pos='left'
            label='Back'
            severity='secondary'
            @click='prevCallback'/>
          <Button
            :disabled='isDisabled("ChooseNextFirstUsers")'
            icon='pi pi-check'
            label='Confirm'
            @click='submit'/>
        </div>
      </template>
    </StepperPanel>
  </Stepper>

</template>

<script lang='ts' setup>
import { type Validation } from '@vuelidate/core';
import { type ComputedRef, inject, provide, reactive, type Ref, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { createWorkAndSendToFirstNodes } from '@/apps/work-flow/api/graphql/work';
import ChooseNextFirstUsers from '@/apps/work-flow/components/ChooseNextFirstUsers.vue';
import WorkFlowGeneralDialog from '@/apps/work-flow/components/WorkFlowGeneralDialog.vue';
import { Priority, type StartWorkAssigned, type WorkInput } from '@/apps/work-flow/model/process/work';
import { toastError, toastSuccess } from '@/common/helpers/custom-toast-service';

const dialogRef = inject<ComputedRef>('dialogRef');
const workInput = ref<WorkInput>({ priority: Priority.MEDIUM });
const selectUserIdsRecord = ref<Record<string, Set<string>>>({});
const { t } = useI18n();
const validations = reactive<Record<string, Ref<Validation>>>({});
provide('registerValidation', (key: string, v$: Ref<Validation>) => {
  validations[key] = v$;
});

function isDisabled(key: string): boolean {
  return validations[key]?.value?.$invalid ?? false;
}

function submit() {
  const assigns = Object.entries(selectUserIdsRecord.value).map(([nodeId, userIds]): StartWorkAssigned => ({
    nodeId,
    assignedIds: Array.from(userIds)
  }));

  createWorkAndSendToFirstNodes().mutate({
    work: workInput.value,
    assigns
  }).then(result => {
    if (result) {
      toastSuccess();
      dialogRef?.value?.close();
    }
  }).catch(error => {
    toastError();
  });
}
</script>

<style scoped>

</style>