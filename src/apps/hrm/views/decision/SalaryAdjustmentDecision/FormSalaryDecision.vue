<template>
  <Sidebar
    v-model:visible='visibleDialog'
    :dismissable='false'
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
            {{ modelValue.id ? 'Cập nhật' : 'Thêm mới' }} quyết
            định điều chỉnh lương
          </div>
        </div>
        <div class='flex gap-1'>
          <ButtonIcon
            icon='save'
            :label='t("common.save")'
            size='small'
            @click='submit'/>
        </div>
      </div>
    </template>
    <div
      class='mt-2 overflow-y-auto surface-0'
      style='height: calc(100vh - 6rem)'>
      <div class='form'>
        <form ref='formRef'>
          <Accordion
            :active-index='[0, 1, 2]'
            multiple>
            <AccordionTab :header='t("hrm.contract.general.title")'>
              <SalaryGeneralForm v-model:model-value='modelValue'/>
            </AccordionTab>
            <AccordionTab header='Thông tin lương cũ'>
              <DecisionSalaryOldForm :model-value='modelValue?.salaryAdjustmentDecision'/>
            </AccordionTab>
            <AccordionTab header='Thông tin lương mới'>
              <DecisionSalaryNewForm :model-value='modelValue?.salaryAdjustmentDecision'/>
            </AccordionTab>
            <AccordionTab :header='t("hrm.contract.attachment")'>
              <AppUpload
                v-model:old-files='modelValue.files'
                multiple
                name='files'/>
            </AccordionTab>
          </Accordion>
        </form>
      </div>
    </div>
  </Sidebar>
</template>

<script setup lang='ts'>

import { useVuelidate, type Validation } from '@vuelidate/core';
import { cloneDeep } from 'lodash';
import { type PropType, reactive, type Ref, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { findById } from '@/apps/hrm/api/graphql/decision';
import { getSalaryProcessByEmployeeIdAndStatus } from '@/apps/hrm/api/graphql/salary';
import { createSalaryAdjustment, updateSalaryAdjustment, } from '@/apps/hrm/api/rest/decision';
import type { DecisionInterface, SalaryAdjustmentDecision } from '@/apps/hrm/model/decision';
import DecisionSalaryNewForm from '@/apps/hrm/views/decision/SalaryAdjustmentDecision/DecisionSalaryNewForm.vue';
import DecisionSalaryOldForm from '@/apps/hrm/views/decision/SalaryAdjustmentDecision/DecisionSalaryOldForm.vue';
import SalaryGeneralForm from '@/apps/hrm/views/decision/SalaryAdjustmentDecision/SalaryGeneralForm.vue';
import AppUpload from '@/common/components/app/upload/AppUpload.vue';
import { DEFAULT_DIALOG_CONFIG } from '@/common/constants';
import { toastSuccess } from '@/common/helpers/custom-toast-service';

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  decisionId: {
    type: String,
    default: null
  }
});
const emits = defineEmits(['hide-dialog']);
const {
  onResult: getSalaryResult,
  load: getSalaryLoad
} = getSalaryProcessByEmployeeIdAndStatus();
const formRef = ref<HTMLFormElement>();

const modelValue = defineModel('modelValue', {
  type: Object as PropType<DecisionInterface>,
  default: {} as DecisionInterface,
});

const { t } = useI18n();
const visibleDialog = ref(props.visible);
const v$: Ref<Validation> = useVuelidate();
if (props.decisionId) {
  findById(props.decisionId).onResult((res) => {
    modelValue.value = cloneDeep(res.data.findDecisionById);
  });
} else {
  modelValue.value = { salaryAdjustmentDecision: { isAutoUpdateProcessSalary: true } as SalaryAdjustmentDecision } as DecisionInterface;
}

async function submit() {
  v$.value.$touch();
  const isValid = await v$.value.$validate();
  if (!isValid) {
    return;
  }
  if (formRef.value) {
    const data = new FormData(formRef.value);
    if (!modelValue.value.id) {
      createSalaryAdjustment(data).then(() => {
        toastSuccess({ message: 'Thêm mới quyết định thành công.' });
        emits('hide-dialog');
      });
    } else {
      updateSalaryAdjustment(modelValue.value.id, data).then(() => {
        toastSuccess({ message: 'Cập nhật quyết định thành công.' });
        emits('hide-dialog');
      });
    }
  } else {
    return Promise.reject();
  }
}

const salary = ref();
getSalaryResult((res) => {
  const salaryData = res.data.getSalaryProcessByEmployeeIdAndStatus;
  if (!salaryData) {
    return;
  }

  salary.value = salaryData;

  modelValue.value.salaryAdjustmentDecision = reactive({
    ...modelValue.value.salaryAdjustmentDecision || {},
    salaryScaleOld: salaryData.salaryLevel,
    salaryGradeOld: salaryData.salaryScale,
    salaryCoefficientOld: salaryData.salaryCoefficient,
    salaryLevelOld: salaryData.salary,
    regionalMinimumWageOld: salaryData.regionalMinimumWage
  });
});

watch(() => modelValue.value.employeeId, (value) => {
  getSalaryLoad(undefined, {
    employeeId: value,
    status: true
  });
});

defineExpose({ submit });
</script>

<style scoped>

</style>