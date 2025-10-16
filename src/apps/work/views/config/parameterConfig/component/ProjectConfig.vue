<template>
  <div v-if='projectParam'>
    <div
      class='align-items-center border-400 border-bottom-1 flex hover:surface-100 justify-content-between p-3 pr-6'>
      <div>
        <div class='font-bold mb-2'>
          1. Khi đến ngày bắt đầu thì trạng thái dự án tự động chuyển sang Đang
          thực hiện
        </div>
        <div>
          Dự án A có ngày bắt đầu là 15/01/2025, khi đến ngày 15/01/2025, dự án
          A sẽ tự động chuyển từ trạng thái Đang xây dựng và Chuẩn bị triển khai
          sang Đang thực hiện
        </div>
      </div>
      <InputSwitch v-model='projectParam.autoChangeStatus' />
    </div>

    <div
      class='align-items-center border-300 border-bottom-1 flex hover:surface-100 justify-content-between p-3 pr-6'>
      <div>
        <div class='font-bold mb-2'>
          2. Không cho phép người thực hiện xem được công việc chéo thuộc cùng
          một dự án
        </div>
        <div>
          Dự án A gồm 2 công việc 1 và 2, người thực hiện công việc 1 sẽ không
          được xem công việc 2 nếu người đó không phải là người thực hiện công
          việc 2
        </div>
      </div>
      <InputSwitch v-model='projectParam.restrictChildTaskView' />
    </div>

    <div
      class='align-items-center border-300 border-bottom-1 flex hover:surface-100 justify-content-between p-3 pr-6'>
      <div>
        <div class='font-bold mb-2'>
          3. Không cho phép người theo dõi xem được các công việc con thuộc dự
          án
        </div>
        <div>
          Dự án A gồm 2 công việc 1 và 2, người theo dõi dự án A sẽ không được
          xem công việc 1 và 2 nếu người đó không phải là người theo dõi công
          việc 1 và 2
        </div>
      </div>
      <InputSwitch v-model='projectParam.restrictFollowerView' />
    </div>

    <div
      class='align-items-center border-300 border-bottom-1 flex hover:surface-100 justify-content-between p-3 pr-6'>
      <div>
        <div class='font-bold mb-2'>
          4. Cho phép người thực hiện thêm người thực hiện
        </div>
        <div>
          Công việc A gồm 2 công việc con 1 và 2. Với cài đặt này, người theo
          dõi công việc 1 sẽ không xem được công việc 2
        </div>
      </div>
      <InputSwitch v-model='projectParam.addAssignee' />
    </div>

    <div
      class='align-items-center border-300 border-bottom-1 flex hover:surface-100 justify-content-between p-3 pr-6'>
      <div>
        <div class='font-bold mb-2'>
          5. Cho phép người thực hiện thêm người theo dõi
        </div>
        <div>Mô tả và mục tiêu của công việc</div>
      </div>
      <InputSwitch v-model='projectParam.addFollower' />
    </div>

    <div
      class='align-items-center border-300 border-bottom-1 flex justify-content-between p-3'>
      <Accordion
        :active-index='[0, 1, 2, 3, 4]'
        :multiple='true'>
        <AccordionTab header='6. Thiết lập bộ mã dự án tự sinh '>
          <div
            class='align-items-center flex hover:surface-100 justify-content-between mt-2 p-2 pr-5'>
            <div>Có áp dụng</div>
            <InputSwitch v-model='projectParam.codeSettings.enabled' />
          </div>
          <div
            class='align-items-center align-items-center flex hover:surface-100 justify-content-between p-2 pr-5 relative'>
            <div>
              Cấu trúc bộ mã: Có thể sử dụng các từ khóa (keyword) để định dạng
              cho bộ mã
            </div>
            <InputText
              v-model='projectParam.codeSettings.structure'
              class='w-30rem'/>
            <AppIcon
              class='absolute cursor-pointer'
              name='help'
              size='2'
              style='right: -0.1rem'
              @click='showForm = true'/>
          </div>
          <div
            class='align-items-center align-items-center flex hover:surface-100 justify-content-between p-2 pr-5'>
            <div>
              Số bắt đầu khởi tạo: Từ 0 hoặc số bất kỳ, giá trị này sẽ tự tăng
              khi phát sinh công việc
            </div>
            <div class='flex flex-column'>
              <InputNumber
                v-model='projectParam.codeSettings.startValue'
                class='w-30rem'/>
              <span
                v-if='shouldShowWarning'
                class='text-red-500'>Số bắt đầu khởi tạo không được để trống</span>
            </div>
          </div>
          <div
            class='align-items-center flex hover:surface-100 justify-content-between p-2 pr-5'>
            <div>
              Cho phép hiệu chỉnh lại mã : Mặc định không cho chỉnh sửa lại bộ
              mã, nếu chọn sẽ được hiệu chỉnh lại
            </div>
            <InputSwitch v-model='projectParam.codeSettings.allowEdit' />
          </div>
        </AccordionTab>
      </Accordion>
    </div>
    <div class='flex justify-content-center mt-2 w-full'>
      <Button
        icon='pi pi-save'
        :label="t('common.save')"
        @click='saveProjectParam'/>
    </div>
  </div>

  <DialogTableParameter
    v-if='showForm'
    :visible-dialog='showForm'
    @hide-dialog='hideDialogFn'/>
</template>

<script setup lang="ts">
import { cloneDeep } from 'lodash';
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import {
  findParameterConfig,
  saveParameterConfig,
} from '@/apps/work/api/graphql/parameter-config';
import type { ParameterProject } from '@/apps/work/model/parameterConfig';
import { useParameterConfigStore } from '@/apps/work/store/parameter-config';
import DialogTableParameter from '@/apps/work/views/config/parameterConfig/component/DialogTableParameter.vue';
import { toastSuccess } from '@/common/helpers/custom-toast-service';

const { t } = useI18n();
const { fetch } = useParameterConfigStore();

const projectParam = ref<ParameterProject>();
const showForm = ref(false);
const { onResult } = findParameterConfig();
onResult((res) => {
  projectParam.value = cloneDeep(res.data.findParameterConfig.value.project);
});

const { mutate, onDone } = saveParameterConfig();

const shouldShowWarning = computed(() => {
  const structureIncludesCount = projectParam.value?.codeSettings.structure
    ?.toLowerCase()
    .includes('count');
  const isStartValueEmpty = projectParam.value?.codeSettings.startValue == null;
  return structureIncludesCount && isStartValueEmpty;
});

function saveProjectParam() {
  if (shouldShowWarning.value) {
    return;
  }
  mutate({ parameterConfig: { value: { project: projectParam.value } } }).then(
    () => {
      fetch();
    },
  );
}

onDone(() => {
  toastSuccess({ message: 'Lưu thành công' });
});

function hideDialogFn() {
  showForm.value = false;
}
</script>

<style scoped></style>
