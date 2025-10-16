<template>
  <Dialog
    v-bind='DEFAULT_DIALOG_CONFIG'
    v-model:visible='visible'
    header='Thiết lập trạng thái'
    @hide='emits("hide-dialog")'>
    <div class='flex flex-column gap-4'>
      <div class='flex'>
        <RadioButton
          v-model='status'
          name='status'
          value='DRAFT'/>
        <label
          class='ml-2'
          for='radiobutton1'>Dự thảo</label>
      </div>

      <div class='flex'>
        <RadioButton
          v-model='status'
          name='status'
          value='WAITING_APPROVE'/>
        <label
          class='ml-2'
          for='radiobutton1'>Chờ duyệt</label>
      </div>

      <div class='flex'>
        <RadioButton
          v-model='status'
          name='status'
          value='APPROVED'/>
        <label
          class='ml-2'
          for='radiobutton1'>Đã duyệt</label>
      </div>

      <div class='flex'>
        <RadioButton
          v-model='status'
          name='status'
          value='REJECTED'/>
        <label
          class='ml-2'
          for='radiobutton1'>Từ chối</label>
      </div>
    </div>

    <template #footer>
      <Button
        icon='pi pi-times'
        :label='t("common.close")'
        severity='danger'
        @click='emits("hide-dialog")'/>
      <Button
        icon='pi pi-check'
        :label='t("common.select")'
        @click='setting'/>
    </template>
  </Dialog>
</template>

<script setup lang='ts'>

import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { settingStatus } from '@/apps/hrm/api/graphql/decision';
import { DEFAULT_DIALOG_CONFIG } from '@/common/constants';
import { toastSuccess } from '@/common/helpers/custom-toast-service';

const props = defineProps({
  visibleDialog: {
    type: Boolean,
    default: false
  },
  decisionId: {
    type: String,
    default: null
  },
  decisionStatus: {
    type: String,
    default: null
  }
});
const emits = defineEmits(['hide-dialog']);
const status = ref(props.decisionStatus);
const visible = ref(props.visibleDialog);
const { t } = useI18n() || {};
const {
  mutate,
  onDone
} = settingStatus();

function setting() {
  mutate({
    decisionId: props.decisionId,
    status: status.value
  });
}

onDone(() => {
  emits('hide-dialog');
  toastSuccess({ message: 'Cập nhật trạng thái thành công.' });
});
</script>

<style scoped>

</style>