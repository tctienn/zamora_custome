<template>
  <div class='font-bold'>{{ t(`hrm.config.${type.toLowerCase()}.title`) }}</div>
  <div>
    {{ t(`hrm.config.${type.toLowerCase()}.description`) }}
  </div>
  <div>{{ t(`hrm.config.${type.toLowerCase()}.example`) }}
    <strong>{{ t(`hrm.config.${type.toLowerCase()}.ex`) }}</strong></div>
  <div class='align-items-center flex justify-content-between'>
    <div class='gap-2 grid grid-nogutter ml-3 w-full'>
      <FormInputText
        v-model='autoCode.symbol'
        class='col-2'
        label='Ký hiệu'/>
      <FormInputNumber
        v-model='autoCode.length'
        class='col-2'
        label='Độ dài'/>
      <FormInputNumber
        v-model='autoCode.initializationNumber'
        class='col-2'
        label='Số khởi tạo'/>
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

import { findAutoIncrementCodeByType, saveAutoIncrementCode } from '@/apps/hrm/api/graphql/parameterConfig';
import FormInputNumber from '@/apps/hrm/components/form/FormInputNumber.vue';
import FormInputText from '@/apps/hrm/components/form/FormInputText.vue';
import { AutoIncrementCodeType } from '@/apps/hrm/constants/parameter';

const props = defineProps({
  type: {
    type: String,
    default: AutoIncrementCodeType.UNIT
  },
});

const { t } = useI18n();
const autoCode = ref<any>({} as any);

const { onResult: findAutoIncrementCodeByTypeResult, } = findAutoIncrementCodeByType(props.type);

const { mutate: saveAutoIncrementCodeMutation, } = saveAutoIncrementCode();

findAutoIncrementCodeByTypeResult((res) => {
  autoCode.value = cloneDeep(res.data.findAutoIncrementCodeByType);
});

const submit = () => {
  saveAutoIncrementCodeMutation({ autoIncrementCode: autoCode.value });
};

defineExpose({ submit });
</script>

<style scoped>

</style>