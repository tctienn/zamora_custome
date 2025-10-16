<template>
  <div class='font-bold mb-1'>
    3. Số ngày thông báo trước khi đến hạn
  </div>
  <div
    class='align-items-center flex hover:surface-100 justify-content-between p-2 pr-5'>
    <div>
      Bảo hiểm xe
    </div>
    <div class='flex flex-column'>
      <InputNumber
        v-model='deadlineNotice.carInsurance'
        class='w-30rem'/>
    </div>
  </div>
  <div
    class='align-items-center flex hover:surface-100 justify-content-between p-2 pr-5'>
    <div>
      Đăng kiểm xe
    </div>
    <div class='flex flex-column'>
      <InputNumber
        v-model='deadlineNotice.vehicleRegistration'
        class='w-30rem'/>
    </div>
  </div>
  <div
    class='align-items-center flex hover:surface-100 justify-content-between p-2 pr-5'>
    <div>
      Hạn bằng lái
    </div>
    <div class='flex flex-column'>
      <InputNumber
        v-model='deadlineNotice.driverLicense'
        class='w-30rem'/>
    </div>
  </div>
</template>

<script setup lang='ts'>
import { cloneDeep } from 'lodash';
import { ref } from 'vue';

import { findParameterConfig, saveParameterConfig } from '@/apps/vehicle/api/graphql/parameter-config';
import type { DeadlineNotice } from '@/apps/vehicle/model/config/parameter';

const deadlineNotice = ref<DeadlineNotice>({
  carInsurance: null,
  vehicleRegistration: null,
  driverLicense: null
});

const { onResult } = findParameterConfig();
onResult((res) => {
  deadlineNotice.value = cloneDeep(res.data.findParameterConfig.value.deadlineNotice);
});
const { mutate } = saveParameterConfig();

function save() {
  mutate({ parameterConfig: { value: { deadlineNotice: deadlineNotice.value } } });
}

defineExpose({ save });
</script>

<style scoped>

</style>