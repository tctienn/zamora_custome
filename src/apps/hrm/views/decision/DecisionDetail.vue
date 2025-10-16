<template>
  <Sidebar
    v-model:visible='visibleDialog'
    :dismissable='false'
    :header='header'
    v-bind='{...DEFAULT_DIALOG_CONFIG, style : {width: "70rem"}}'
    position='right'
    :pt="{
      header: {
        class: 'border-bottom-1 border-300',
      },
    }"
    :show-close-icon='false'
    @hide='emits("hide-dialog")'>
    <template #header>
      <div
        class='align-items-center flex justify-content-between w-full'
        style='z-index: 1000'>
        <div class='flex gap-1'>
          <Button
            icon='pi pi-arrow-left'
            severity='danger'
            @click='emits("hide-dialog")'/>

          <div class='align-content-center font-semibold text-xl'>
            {{ header }}
          </div>
        </div>
      </div>
    </template>
    <div class='mt-2'>
      <ReceptionDecisionDetail
        v-if="decision.decisionType == 'RECEPTION'"
        :decision='decision'/>

      <DismissalDecisionDetail
        v-if="decision.decisionType == 'DISMISSAL'"
        :decision='decision'/>

      <AppoimentDecisionDetail
        v-if="decision.decisionType == 'APPOINTMENT'"
        :decision='decision'/>

      <CommendationDecisionDetail
        v-if="decision.decisionType == 'COMMENDATION'"
        :decision='decision'/>

      <DisciplineDecisionDetail
        v-if="decision.decisionType == 'DISCIPLINE'"
        :decision='decision'/>

      <TerminationDecisionDetail
        v-if="decision.decisionType == 'CONTRACT_TERMINATION'"
        :decision='decision'/>

      <TransferDecisionDetail
        v-if="decision.decisionType == 'TRANSFER'"
        :decision='decision'/>

      <SalaryAdjustmentDecisionDetail
        v-if="decision.decisionType == 'SALARY_ADJUSTMENT'"
        :decision='decision'/>

      <OtherDecisionDetail
        v-if="decision.decisionType == 'OTHER'"
        :decision='decision'/>
    </div>
    <div
      class='border-300 border-top-1 fixed flex gap-2 justify-content-center p-0 p-2 surface-overlay w-full'
      style='bottom: 0; left: 0'>
      <Button
        class='border-round-sm p-2'
        icon='pi pi-times'
        :label='t("common.close")'
        severity='danger'
        @click='emits("hide-dialog")'/>

      <Button
        class='border-round-sm p-2'
        icon='pi pi-check'
        label='Xem và in quyết định'
        severity='primary'
        @click='printDecision(decisionId)'/>
    </div>

    <DialogViewFileDecision
      v-if='visibleViewFile'
      v-model='visibleViewFile'
      :decision-id='decisionId'
      :decision-name='header'
      :file-blob='fileToView'
      :visible='visibleViewFile'
      @hide-dialog='visibleViewFile = false'/>
  </Sidebar>
</template>

<script setup lang='ts'>

import { cloneDeep } from 'lodash';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { findById } from '@/apps/hrm/api/graphql/decision';
import { exportFileDecisionPdf } from '@/apps/hrm/api/rest/decision';
import type { DecisionInterface } from '@/apps/hrm/model/decision';
import AppoimentDecisionDetail from '@/apps/hrm/views/decision/AppointmentDecision/AppoimentDecisionDetail.vue';
import CommendationDecisionDetail from '@/apps/hrm/views/decision/CommendationDecision/CommendationDecisionDetail.vue';
import DialogViewFileDecision from '@/apps/hrm/views/decision/DialogViewFileDecision.vue';
import DisciplineDecisionDetail from '@/apps/hrm/views/decision/Discipline/DisciplineDecisionDetail.vue';
import DismissalDecisionDetail from '@/apps/hrm/views/decision/Dismissal/DismissalDecisionDetail.vue';
import OtherDecisionDetail from '@/apps/hrm/views/decision/OtherDecision/OtherDecisionDetail.vue';
import ReceptionDecisionDetail from '@/apps/hrm/views/decision/ReceptionDecision/ReceptionDecisionDetail.vue';
import TerminationDecisionDetail from '@/apps/hrm/views/decision/TerminationDecision/TerminationDecisionDetail.vue';
import SalaryAdjustmentDecisionDetail
  from '@/apps/hrm/views/decision/TransferDecision/SalaryAdjustmentDecisionDetail.vue';
import TransferDecisionDetail from '@/apps/hrm/views/decision/TransferDecision/TransferDecisionDetail.vue';
import { DEFAULT_DIALOG_CONFIG } from '@/common/constants';

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  decisionId: {
    type: String,
    default: null
  },
  header: {
    type: String,
    default: null
  }
});
const emits = defineEmits(['hide-dialog']);
const fileToView = ref<Blob | null>(null);
const visibleViewFile = ref(false);
const { t } = useI18n();
const visibleDialog = ref(props.visible);
const decision = ref({} as DecisionInterface);
findById(props.decisionId).onResult((res) => {
  decision.value = cloneDeep(res.data.findDecisionById);
  if (decision.value.employeeDisciplines) {
    decision.value = {
      ...decision.value,
      form: decision.value.employeeDisciplines?.[0]?.form ?? '',
      compensationAmount: decision.value.employeeDisciplines?.[0]?.compensationAmount ?? 0,
      typeExecution: decision.value.employeeDisciplines?.[0]?.typeExecution ?? '',
      title: decision.value.employeeDisciplines?.[0]?.title ?? ''
    };
  }
});

function printDecision(id: string) {
  exportFileDecisionPdf(id)
    .then(file => {
      openPDF(file!);
    });
}

function openPDF(file: Blob) {
  if (!(file instanceof Blob)) {
    throw new Error('Invalid file type');
  }
  fileToView.value = file;
  visibleViewFile.value = true;
}
</script>

<style scoped>

</style>