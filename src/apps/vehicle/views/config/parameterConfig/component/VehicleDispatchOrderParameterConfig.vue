<template>
  <div
    v-if='parameter'
    class='flex justify-content-between p-3'>
    <Accordion
      :active-index='[0, 1, 2, 3, 4]'
      :multiple='true'>
      <AccordionTab header='2. Thiết lập bộ mã Lệnh điều xe tự sinh'>
        <div
          class='align-items-center flex hover:surface-100 justify-content-between mt-2 p-2 pr-5'>
          <div>Có áp dụng</div>
          <InputSwitch v-model='parameter.enabled'/>
        </div>
        <div
          class='align-items-center flex hover:surface-100 justify-content-between p-2 pr-5 relative'>
          <div>
            Cấu trúc bộ mã: Có thể sử dụng các từ khóa (keyword) để định dạng
            cho bộ mã
          </div>
          <InputText
            v-model='parameter.structure'
            class='w-30rem'/>
          <AppIcon
            class='absolute cursor-pointer'
            name='help'
            size='2'
            style='right: -0.1rem'
            @click='showForm = true'/>
        </div>
        <div
          class='align-items-center flex hover:surface-100 justify-content-between p-2 pr-5'>
          <div>
            Số bắt đầu khởi tạo: Từ 0 hoặc số bất kỳ, giá trị này sẽ tự tăng khi
            phát sinh công việc
          </div>
          <div class='flex flex-column'>
            <InputNumber
              v-model='parameter.startValue'
              class='w-30rem'/>
            <span
              v-if='shouldShowWarning'
              class='text-red-500'>Số bắt đầu khởi tạo không được để trống</span>
          </div>
        </div>
        <div
          class='align-items-center flex hover:surface-100 justify-content-between p-2 pr-5'>
          <div>
            Cho phép hiệu chỉnh lại mã : Mặc định không cho chỉnh sửa lại bộ mã,
            nếu chọn sẽ được hiệu chỉnh lại
          </div>
          <InputSwitch v-model='parameter.allowEdit'/>
        </div>
      </AccordionTab>
    </Accordion>
  </div>

  <DialogTableParameter
    v-if='showForm'
    :visible-dialog='showForm'
    @hide-dialog='hideDialogFn'/>
</template>

<script setup lang='ts'>
import { cloneDeep } from 'lodash';
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { findParameterConfig, saveParameterConfig, } from '@/apps/vehicle/api/graphql/parameter-config';
import type { Parameter } from '@/apps/vehicle/model/config/parameter';
import DialogTableParameter from '@/apps/work/views/config/parameterConfig/component/DialogTableParameter.vue';
import { toastSuccess } from '@/common/helpers/custom-toast-service';

const { t } = useI18n();
const parameter = ref<Parameter>();
const showForm = ref(false);
const { onResult } = findParameterConfig();
onResult((res) => {
  parameter.value = cloneDeep(
    res.data.findParameterConfig.value.vehicleDispatchOrder,
  );
});
const {
  mutate,
  onDone
} = saveParameterConfig();

const shouldShowWarning = computed(() => {
  const structureIncludesCount = parameter.value?.structure
    ?.toLowerCase()
    .includes('count');
  const isStartValueEmpty = parameter.value?.startValue == null;
  return structureIncludesCount && isStartValueEmpty;
});

function save() {
  if (shouldShowWarning.value) {
    return;
  }
  mutate({ parameterConfig: { value: { vehicleDispatchOrder: parameter.value } }, });
}

onDone(() => {
  toastSuccess({ message: 'Lưu thiết lập bộ mã Lệnh điều xe thành công' });
});

function hideDialogFn() {
  showForm.value = false;
}

defineExpose({ save });
</script>

<style scoped>
:deep(.p-accordion-header-link) {
  padding: unset;
  display: flex;
  border: none;
  background: none;
  flex-direction: row-reverse;
  justify-content: space-between;
}

:deep(.p-accordion-content) {
  border: none;
  padding: unset;
}

:deep(.p-accordion) {
  width: 100%;
}

:deep(.p-tabview-panels) {
  padding: unset !important;
}
</style>
