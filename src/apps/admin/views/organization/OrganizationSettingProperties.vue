<template>
  <Dialog
    v-bind='DEFAULT_DIALOG_CONFIG'
    v-model:visible='visible'
    header='Cấu hình thuộc tính phòng ban'
    @hide='emits("hide-dialog")'>
    <div class='flex flex-column gap-2'>

      <p class='align-content-center'>(*) Thiết lập tiêu đề cho mẫu Sơ yếu lý lịch (Mẫu 2C/TCTW-98)</p>
      <div class='field'>
        <input
          v-model='configOrganization.id'
          hidden/>
        <input
          v-model='configOrganization.organizationId'
          hidden/>
        <label
          class='font-bold'>Bộ, tỉnh</label>
        <InputText
          v-model='configOrganization.ministry'
          class='p-component p-inputtext w-full'
          name='title'/>
      </div>

      <div class='field'>
        <label
          class='font-bold'>Đơn vị trực thuộc</label>
        <InputText
          v-model='configOrganization.affiliatedUnit'
          class='p-component p-inputtext w-full'
          name='title'/>
      </div>

      <div class='field'>
        <label
          class='font-bold'>Đơn vị cơ sở</label>
        <InputText
          v-model='configOrganization.baseUnit'
          class='p-component p-inputtext w-full'
          name='title'/>
      </div>
    </div>

    <template #footer>
      <Button
        icon='pi pi-times'
        :label="t('common.close')"
        severity='danger'
        @click="emits('hide-dialog')"/>
      <Button
        icon='pi pi-check'
        :label="t('common.save')"
        @click='saveConfig'/>
    </template>
  </Dialog>
</template>

<script setup lang='ts'>
import { cloneDeep } from 'lodash';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { findByOrganizationId, saveConfigOrganization } from '@/apps/admin/api/graphql/config-organization-api';
import { getAllLabelGraphql } from '@/apps/work/api/graphql/label-api';
import type { Label } from '@/apps/work/model/taskLabel';
import { DEFAULT_DIALOG_CONFIG } from '@/common/constants';
import { toastSuccess } from '@/common/helpers/custom-toast-service';

const props = defineProps({
  visibleDialog: {
    type: Boolean,
    default: false
  },
  orgId: {
    type: String,
    default: null
  }
});

const emits = defineEmits(['hide-dialog', 'save-label']);

const visible = ref(props.visibleDialog);
const configOrganization = ref<{
  id: null,
  organizationId: null,
  ministry: null,
  affiliatedUnit: null,
  baseUnit: null
}>({
  id: null,
  organizationId: null,
  ministry: null,
  affiliatedUnit: null,
  baseUnit: null
});
const { t } = useI18n();
const tags = ref<Label[]>([]);

getAllLabelGraphql().onResult((res) => {
  tags.value = res.data.getAllLabel;
});

function saveConfig() {
  saveConfigOrganization().mutate({
    configOrganizationPayload: {
      ...configOrganization.value,
      organizationId: props.orgId
    }
  }).then(() => {
    toastSuccess({ message: 'Thêm cấu hình thành công.' });
    emits('hide-dialog');
  });
}

findByOrganizationId(props.orgId).onResult((res) => {
  configOrganization.value = cloneDeep(res.data.findByOrganizationId);
});
</script>

<style scoped>
</style>

<script lang='ts'>
export default { name: 'OrganizationSettingProperties' };
</script>