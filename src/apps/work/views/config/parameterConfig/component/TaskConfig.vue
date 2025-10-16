<template>
  <div v-if='taskParam'>
    <div
      class='align-items-center border-400 border-bottom-1 flex hover:surface-100 justify-content-between p-3 pr-6'>
      <div>
        <div class='font-bold mb-2'>
          1. Tự động chuyển trạng thái sáng “Đang thực hiện” khi đến ngày bắt
          đầu
        </div>
        <div>
          Công việc A có Ngày bắt đầu là 15/01/2025 , vậy khi đến ngày
          15/01/2025 thì công việc A tự động chuyển trạng thài từ Chưa bắt đầu
          sang Đang làm.
        </div>
      </div>
      <InputSwitch v-model='taskParam.autoChangeStatus' />
    </div>

    <div
      class='align-items-center border-300 border-bottom-1 flex hover:surface-100 justify-content-between p-3 pr-6'>
      <div>
        <div class='font-bold mb-2'>
          2. Cho phép người giao việc được phép xóa công việc
        </div>
        <div>
          Công việc A đang ở trạng thái Chưa bắt đầu hoặc Đã hủy thì mặc định
          người tạo có thể xóa. Nhưng nếu chọn thiết lập này thì chỉ người giao
          được phép xóa
        </div>
      </div>
      <InputSwitch v-model='taskParam.allowCreatorDelete' />
    </div>

    <div
      class='align-items-center border-300 border-bottom-1 flex hover:surface-100 justify-content-between p-3 pr-6'>
      <div>
        <div class='font-bold mb-2'>
          3. Không cho phép người thực hiện xem chéo các công việc thuộc cùng
          công việc cha
        </div>
        <div>
          Công việc A gồm 2 công việc con 1 và 2. Với cài đặt này, người thực
          hiện công việc 1 sẽ không xem được công việc 2
        </div>
      </div>
      <InputSwitch v-model='taskParam.restrictChildTaskView' />
    </div>

    <div
      class='align-items-center border-300 border-bottom-1 flex hover:surface-100 justify-content-between p-3 pr-6'>
      <div>
        <div class='font-bold mb-2'>
          4. Không cho phép người theo dõi xem chéo các công việc thuộc cùng
          công việc cha
        </div>
        <div>
          Công việc A gồm 2 công việc con 1 và 2. Với cài đặt này, người theo
          dõi công việc 1 sẽ không xem được công việc 2
        </div>
      </div>
      <InputSwitch v-model='taskParam.restrictFollowerView' />
    </div>

    <div
      class='align-items-center border-300 border-bottom-1 flex justify-content-between p-3 pr-5'>
      <Accordion
        :active-index='[0, 1, 2, 3, 4]'
        :multiple='true'>
        <AccordionTab
          header='5. Cho phép người thực hiện cập nhật các thông tin sau '>
          <div
            class='align-items-center flex hover:surface-100 justify-content-between mt-2 p-2'>
            <div>Mô tả và mục tiêu của công việc</div>
            <InputSwitch v-model='taskParam.editableFields.descriptionGoal' />
          </div>
          <div
            class='align-items-center flex hover:surface-100 justify-content-between p-2'>
            <div>Thêm người thực hiện</div>
            <InputSwitch v-model='taskParam.editableFields.addAssignee' />
          </div>
          <div
            class='align-items-center flex hover:surface-100 justify-content-between p-2'>
            <div>Thời gian ngày bắt đầu/ngày kết thúc của công việc</div>
            <InputSwitch v-model='taskParam.editableFields.updateDate' />
          </div>
        </AccordionTab>
      </Accordion>
    </div>

    <div class='border-300 border-bottom-1 flex justify-content-between p-3'>
      <Accordion
        :active-index='[0, 1, 2, 3, 4]'
        :multiple='true'>
        <AccordionTab header='6. Thiết lập bộ mã công việc tự sinh'>
          <div
            class='align-items-center flex hover:surface-100 justify-content-between mt-2 p-2 pr-5'>
            <div>Có áp dụng</div>
            <InputSwitch v-model='taskParam.codeSettings.enabled' />
          </div>
          <div
            class='align-items-center flex hover:surface-100 justify-content-between p-2 pr-5 relative'>
            <div>
              Cấu trúc bộ mã: Có thể sử dụng các từ khóa (keyword) để định dạng
              cho bộ mã
            </div>
            <InputText
              v-model='taskParam.codeSettings.structure'
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
              Số bắt đầu khởi tạo: Từ 0 hoặc số bất kỳ, giá trị này sẽ tự tăng
              khi phát sinh công việc
            </div>
            <div class='flex flex-column'>
              <InputNumber
                v-model='taskParam.codeSettings.startValue'
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
            <InputSwitch v-model='taskParam.codeSettings.allowEdit' />
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
import type { ParameterTask } from '@/apps/work/model/parameterConfig';
import { useParameterConfigStore } from '@/apps/work/store/parameter-config';
import DialogTableParameter from '@/apps/work/views/config/parameterConfig/component/DialogTableParameter.vue';
import { toastSuccess } from '@/common/helpers/custom-toast-service';

const { t } = useI18n();
const { fetch } = useParameterConfigStore();
const taskParam = ref<ParameterTask>();
const showForm = ref(false);
const { onResult } = findParameterConfig();
onResult((res) => {
  taskParam.value = cloneDeep(res.data.findParameterConfig.value.task);
});
const { mutate, onDone } = saveParameterConfig();

const shouldShowWarning = computed(() => {
  const structureIncludesCount = taskParam.value?.codeSettings.structure
    ?.toLowerCase()
    .includes('count');
  const isStartValueEmpty = taskParam.value?.codeSettings.startValue == null;
  return structureIncludesCount && isStartValueEmpty;
});

function saveTaskParam() {
  if (shouldShowWarning.value) {
    return;
  }
  mutate({ parameterConfig: { value: { task: taskParam.value } } }).then(() => {
    fetch();
  });
}

onDone(() => {
  toastSuccess({ message: 'Lưu thành công' });
});

function hideDialogFn() {
  showForm.value = false;
}
</script>

<style></style>
