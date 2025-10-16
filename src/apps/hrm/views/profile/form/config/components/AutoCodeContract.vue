<template>
  <div class='font-bold'>{{ t(`hrm.config.contract.title`) }}</div>
  <div>
    {{ t(`hrm.config.contract.description`) }}
  </div>
  <div>{{ t(`hrm.config.contract.example`) }}
    <strong>{{ t(`hrm.config.contract.ex`) }}</strong></div>
  <div class='flex justify-content-between'>
    <div class='gap-2 grid grid-nogutter ml-3 w-full'>
      <div class='col-1 text-center'>STT</div>
      <div class='col-2'></div>
      <div class='col-2 text-center'>Trường thông tin</div>
      <div class='col-2 text-center'>Ký tự ngăn cách</div>
      <div class='col-4'></div>

      <div class='col-1'>
        <FormInputNumber
          v-model='initializationNumber.numOrder'
          label=''/>
      </div>
      <div class='align-items-center col-2 flex justify-content-center'>Số khởi tạo</div>
      <div class='col-2'>
        <FormInputText
          v-model='initializationNumber.fieldInfo'
          label=''/>
      </div>
      <div class='col-2 flex justify-content-center'>
        <FormInputText
          v-model='initializationNumber.separatorCharacter'
          class='w-6'
          label=''/>
      </div>
      <div class='col-4'></div>

      <div class='col-1'>
        <FormInputNumber
          v-model='year.numOrder'
          label=''/>
      </div>
      <div class='align-items-center col-2 flex justify-content-center'>Năm</div>
      <div class='col-2'>
        <FormInputText
          v-model='year.fieldInfo'
          label=''/>
      </div>
      <div class='col-2 flex justify-content-center'>
        <FormInputText
          v-model='year.separatorCharacter'
          class='w-6'
          label=''/>
      </div>
      <div class='col-4'></div>

      <div class='col-1'>
        <FormInputNumber
          v-model='symbol.numOrder'
          label=''/>
      </div>
      <div class='align-items-center col-2 flex justify-content-center'>Ký hiệu</div>
      <div class='col-2'>
        <FormInputText
          v-model='symbol.fieldInfo'
          label=''/>
      </div>
      <div class='col-2 flex justify-content-center'>
        <FormInputText
          v-model='symbol.separatorCharacter'
          class='w-6'
          label=''/>
      </div>
      <div class='col-4'></div>
    </div>
    <div class='mr-5 w-10rem'>
      <div class='align-items-center flex gap-3'>
        Áp dụng
        <InputSwitch v-model='data.applicable'/>
      </div>
    </div>
  </div>
</template>

<script setup lang='ts'>
import { cloneDeep } from 'lodash';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { findAutoIncrementCodeContract, saveAutoIncrementCodeContract } from '@/apps/hrm/api/graphql/parameterConfig';
import FormInputNumber from '@/apps/hrm/components/form/FormInputNumber.vue';
import FormInputText from '@/apps/hrm/components/form/FormInputText.vue';

interface Info {
  numOrder: number | null,
  fieldInfo: string,
  separatorCharacter: string,
}

const { t } = useI18n();
const symbol = ref<Info>({} as Info);
const year = ref<Info>({} as Info);
const initializationNumber = ref<Info>({} as Info);
const data = ref<any>({} as any);

const { onResult: findAutoIncrementCodeContractResult } = findAutoIncrementCodeContract();

const { mutate: saveAutoIncrementCodeContractMutation } = saveAutoIncrementCodeContract();

findAutoIncrementCodeContractResult((res) => {
  data.value = cloneDeep(res.data.findAutoIncrementCodeContract);
  symbol.value = data.value.symbol ? { ...data.value.symbol } : {
    numOrder: null,
    fieldInfo: '',
    separatorCharacter: ''
  };
  year.value = data.value.year ? { ...data.value.year } : {
    numOrder: null,
    fieldInfo: '',
    separatorCharacter: ''
  };
  initializationNumber.value = data.value.initializationNumber ? { ...data.value.initializationNumber } : {
    numOrder: null,
    fieldInfo: '',
    separatorCharacter: ''
  };
});

const submit = () => {
  saveAutoIncrementCodeContractMutation({
    autoIncrementCodeContract: {
      id: data.value.id,
      symbol: symbol.value,
      year: year.value,
      initializationNumber: initializationNumber.value,
      applicable: data.value.applicable
    }
  });
};

defineExpose({ submit });
</script>

<style scoped>
:deep(.field) {
  margin: unset;
}

:deep(.p-inputnumber-input) {
  text-align: center;
}

:deep(.p-inputtext) {
  text-align: center;
}
</style>