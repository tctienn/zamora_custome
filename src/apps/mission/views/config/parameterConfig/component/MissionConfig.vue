<template>
  <div>
    <div
      v-for='(type, index) in types'
      :key='type'
      class='border-300 border-bottom-1 flex justify-content-between p-3'>
      <Accordion
        :active-index='[0]'
        :multiple='true'>
        <AccordionTab :header='`${index + 1}. Thiết lập bộ mã ${labelMap[type] } tự sinh`'>
          <div
            class='align-items-center flex hover:surface-100 justify-content-between mt-2 p-2 pr-5'>
            <div>Có áp dụng</div>
            <InputSwitch v-model='parameters[type].enabled' />
          </div>
          <div
            class='align-items-center flex hover:surface-100 justify-content-between p-2 pr-5 relative'>
            <div>
              Cấu trúc bộ mã: Có thể sử dụng các từ khóa (keyword) để định dạng
              cho bộ mã
            </div>
            <InputText
              v-model='parameters[type].structure'
              class='w-30rem' />
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
                v-model='parameters[type].startValue'
                class='w-30rem' />
              <span
                v-if='shouldShowWarning(type)'
                class='text-red-500'>Số bắt đầu khởi tạo không được để trống</span>
            </div>
          </div>
          <div
            class='align-items-center flex hover:surface-100 justify-content-between p-2 pr-5'>
            <div>
              Cho phép hiệu chỉnh lại mã : Mặc định không cho chỉnh sửa lại bộ mã,
              nếu chọn sẽ được hiệu chỉnh lại
            </div>
            <InputSwitch v-model='parameters[type].allowEdit' />
          </div>
        </AccordionTab>
      </Accordion>
    </div>

    <div class='flex justify-content-center mt-2 w-full'>
      <Button
        icon='pi pi-save'
        :label="t('common.save')"
        @click='saveTaskParam'/>
    </div>

    <DialogTableParameter
      v-if='showForm'
      :visible-dialog='showForm'
      @hide-dialog='showForm = false;'/>
  </div>
</template>

<script setup lang="ts">
import { cloneDeep } from 'lodash';
import { reactive, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { findParameterMsConfig, saveMsParameterConfig } from '@/apps/mission/api/graphql/parameter-config';
import type { Parameter } from '@/apps/mission/model/config/parameter';
import DialogTableParameter from '@/apps/work/views/config/parameterConfig/component/DialogTableParameter.vue';
import { toastSuccess } from '@/common/helpers/custom-toast-service';

const showForm = ref<boolean>(false);
const idRef = ref<string>('');
const { t } = useI18n();
const defaultParam: Parameter = {
  enabled: false,
  structure: '',
  startValue: 0,
  allowEdit: false
};

const types = ['mission', 'activity', 'job'] as const;
type CodeType = typeof types[number];

const labelMap: Record<CodeType, string> = {
  mission: 'nhiệm vụ',
  activity: 'hoạt động',
  job: 'công việc',
};

const parameters = reactive<Record<CodeType, Parameter>>({
  mission: cloneDeep(defaultParam),
  activity: cloneDeep(defaultParam),
  job: cloneDeep(defaultParam),
});
const { onResult } = findParameterMsConfig();
onResult((res) => {
  const config = res.data.findParameterMsConfig?.value;
  idRef.value = res.data.findParameterMsConfig?.id || '';

  if (config?.mission?.codeSettings) {
    parameters.mission = cloneDeep(config.mission.codeSettings);
  }
  if (config?.activity?.codeSettings) {
    parameters.activity = cloneDeep(config.activity.codeSettings);
  }
  if (config?.job?.codeSettings) {
    parameters.job = cloneDeep(config.job.codeSettings);
  }
});

const { mutate, onDone } = saveMsParameterConfig();

function shouldShowWarning(type: CodeType) {
  const param = parameters[type];
  return param.structure?.toLowerCase().includes('count') && param.startValue == null;
}

function saveTaskParam() {
  const hasWarning = types.some((type) => shouldShowWarning(type));
  if (hasWarning) {
    return;
  }

  mutate({
    msParameterConfig: {
      id: idRef.value || undefined,
      value: {
        mission: { codeSettings: parameters.mission },
        activity: { codeSettings: parameters.activity },
        job: { codeSettings: parameters.job },
      },
    },
  });
}
onDone(() => {
  toastSuccess({ message: 'Lưu thành công' });
});

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
