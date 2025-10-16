<template>
  <Sidebar
    v-model:visible='visible'
    :block-scroll='true'
    :dismissable='false'
    :header="t('hrm.insurance.config')"
    position='right'
    :show-close-icon='false'
    style='width:80rem'>
    <template #header>
      <div class='align-items-center flex justify-content-between w-full'>
        <div class='align-items-center flex gap-2 p-sidebar-header-content'>
          <Button
            icon='pi pi-arrow-left'
            severity='danger'
            @click='visible = false'/>
          {{ t('hrm.insurance.config') }}
        </div>
        <Button
          icon='pi pi-save'
          :label='t("common.save")'
          @click='save'/>
      </div>
    </template>
    <div class='flex flex-column gap-3'>
      <AutoCodeUnit
        ref='submitUnit'
        :type='AutoIncrementCodeType.UNIT'/>
      <AutoCodeUnit
        ref='submitEmployee'
        :type='AutoIncrementCodeType.EMPLOYEE'/>
      <AutoCodeContract ref='submitContract'/>
      <div class='font-bold'>4. Tỷ lệ % mức đóng bảo hiểm giữ đơn vị và người lao động</div>
      <div class='ml-3'>Là mức đóng Bảo hiểm xã hội; Bảo hiểm y tế; Bảo hiểm thất nghiệp; Bảo hiểm tai nạn lao
        động giữa đơn vị đóng và người lao động đóng theo quy định
      </div>
      <div class='gap-2 grid grid-nogutter ml-3'>
        <FormInputNumber
          v-model='parameter.parameterBHXH'
          class='col-1'
          label='BHXH'
          :max='100'
          :max-fraction-digits='2'/>
        <FormInputNumber
          v-model='parameter.parameterBHYT'
          class='col-1'
          label='BHYT'
          :max='100'
          :max-fraction-digits='2'/>
        <FormInputNumber
          v-model='parameter.parameterBHTN'
          class='col-1'
          label='BHTN'
          :max='100'
          :max-fraction-digits='2'/>
        <FormInputNumber
          v-model='parameter.parameterBHTNLD'
          class='col-1'
          label='BHTNLĐ'
          :max='100'
          :max-fraction-digits='2'/>
        <FormInputNumber
          v-model='parameter.parameterTotalPay'
          class='col-2'
          disabled=''
          label='Tổng đóng'
          :max='100'
          :max-fraction-digits='2'/>
        <FormInputNumber
          v-model='parameter.parameterCompanyPay'
          class='col-2'
          label='Công ty đóng'
          :max='100'
          :max-fraction-digits='2'/>
        <FormInputNumber
          v-model='parameter.parameterEmployeePay'
          class='col-2'
          label='NLĐ đóng'
          :max='100'
          :max-fraction-digits='2'/>
      </div>
      <RestDayConfig></RestDayConfig>
      <AutoCodeUnit
        ref='submitRecruitmentCandidate'
        :type='AutoIncrementCodeType.RECRUITMENT_CANDIDATE'/>
      <AutoCodeUnit
        ref='submitRecruitmentCampaign'
        :type='AutoIncrementCodeType.RECRUITMENT_CAMPAIGN'/>
      <SubmissionDeadline
        ref='submitEvaluation'
        :type='SubmissionDeadlineType.EVALUATION'/>
      <SubmissionDeadline
        ref='submitTimekeeping'
        :type='SubmissionDeadlineType.TIMEKEEPING'/>
    </div>
  </Sidebar>
</template>

<script lang='ts' setup>
import { cloneDeep } from 'lodash';
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { findParameterConfig, saveParameterConfig } from '@/apps/hrm/api/graphql/parameterConfig';
import FormInputNumber from '@/apps/hrm/components/form/FormInputNumber.vue';
import { AutoIncrementCodeType, SubmissionDeadlineType } from '@/apps/hrm/constants/parameter';
import type { ParameterConfig } from '@/apps/hrm/model/parameter';
import AutoCodeContract from '@/apps/hrm/views/profile/form/config/components/AutoCodeContract.vue';
import AutoCodeUnit from '@/apps/hrm/views/profile/form/config/components/AutoCodeUnit.vue';
import RestDayConfig from '@/apps/hrm/views/profile/form/config/components/RestDayConfig.vue';
import SubmissionDeadline from '@/apps/hrm/views/profile/form/config/components/SubmissionDeadline.vue';
import { toastSuccess } from '@/common/helpers/custom-toast-service';

const visible = defineModel('visible', { type: Boolean });
const { t } = useI18n();
const parameter = ref<ParameterConfig>({} as ParameterConfig);

watch(
  () => [
    parameter.value.parameterBHXH,
    parameter.value.parameterBHYT,
    parameter.value.parameterBHTN,
    parameter.value.parameterBHTNLD,
  ],
  ([bhxh, bhyt, bhtn, bhtnld]) => {
    const total =
      (bhxh || 0) + (bhyt || 0) + (bhtn || 0) + (bhtnld || 0);
    parameter.value.parameterTotalPay = parseFloat(total.toFixed(2));
  }
);

findParameterConfig().onResult((res) => {
  parameter.value = cloneDeep(res.data.findParameterConfig);
});

const {
  mutate: saveParameterConfigMutation,
  onDone: saveParameterConfigOnDone
} = saveParameterConfig();

const save = () => {
  saveParameterConfigMutation({ parameterConfig: parameter.value });
  callChildFunction();
};

saveParameterConfigOnDone(() => {
  toastSuccess({ message: t('Cập nhật thành công') });
});

const submitUnit = ref<any>(null);
const submitEmployee = ref<any>(null);
const submitContract = ref<any>(null);
const submitRecruitmentCandidate = ref<any>(null);
const submitRecruitmentCampaign = ref<any>(null);
const submitTimekeeping = ref<any>(null);
const submitEvaluation = ref<any>(null);

function callChildFunction() {
  submitUnit.value?.submit();
  submitEmployee.value?.submit();
  submitContract.value?.submit();
  submitRecruitmentCandidate.value?.submit();
  submitRecruitmentCampaign.value?.submit();
  submitTimekeeping.value?.submit();
  submitEvaluation.value?.submit();
}
</script>

<style scoped>

</style>