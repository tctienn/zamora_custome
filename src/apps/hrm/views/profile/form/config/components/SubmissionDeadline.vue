<template>
  <div class='font-bold'>{{ t(`hrm.config.${type.toLowerCase()}.title`) }}</div>
  <div class='align-items-center flex justify-content-between'>
    <div class='align-items-center gap-2 grid grid-nogutter ml-3 w-full'>
      {{ t(`hrm.config.fromDate`) }}
      <FormInputNumber
        v-model='autoCode.fromDay'
        class='col-2 mb-0'
        label=''/>
      {{ t(`hrm.config.toDate`) }}
      <FormInputNumber
        v-model='autoCode.toDay'
        class='col-2 mb-0'
        label=''/>
      {{ t(`hrm.config.everyMonth`) }}
    </div>
    <div class='align-items-center flex gap-3 mr-5 w-10rem'>
      Áp dụng
      <InputSwitch v-model='autoCode.applicable'/>
    </div>
  </div>

</template>

<script lang='ts' setup>

import { cloneDeep } from 'lodash';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { findSubmissionDeadlineByType, saveSubmissionDeadline } from '@/apps/hrm/api/graphql/parameterConfig';
import FormInputNumber from '@/apps/hrm/components/form/FormInputNumber.vue';
import { SubmissionDeadlineType } from '@/apps/hrm/constants/parameter';

const props = defineProps({
  type: {
    type: String,
    default: SubmissionDeadlineType.EVALUATION
  },
});

const { t } = useI18n();
const autoCode = ref<any>({} as any);

const { onResult } = findSubmissionDeadlineByType(props.type);

const { mutate } = saveSubmissionDeadline();

onResult((res) => {
  autoCode.value = cloneDeep(res.data.findSubmissionDeadlineByType);
});

const submit = () => {
  mutate({ submissionDeadline: autoCode.value });
};

defineExpose({ submit });
</script>

<style scoped>

</style>