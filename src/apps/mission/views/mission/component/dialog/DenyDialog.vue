<template>
  <Dialog
    v-model:visible='visible'
    header='Nhập lý do từ chối'
    :style="{ width: '40vw' }">
    <div class='p-fluid'>
      <Textarea
        v-model='rejectReason'
        auto-resize
        class='w-full'
        placeholder='Nhập lý do từ chối'
        rows='5'/>
    </div>
    <template #footer>
      <Button
        class='p-button-text'
        label='Hủy'
        @click='handleHideDialog'/>
      <Button
        :disabled='!rejectReason.trim()'
        label='Xác nhận'
        severity='danger'
        @click='submit'/>
    </template>
  </Dialog>
</template>

<script lang='ts' setup>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { denyJob } from '@/apps/mission/api/graphql/job-api';
import { toastError, toastSuccess } from '@/common/helpers/custom-toast-service';
const props = defineProps({
  id: {
    type: String,
    default: undefined
  },
});
const emits = defineEmits(['refresh']);
const { t } = useI18n();
const visible = defineModel('visible', { type: Boolean });

const rejectReason = ref('');
const {
  mutate: denyMutate,
  onDone: denyOnDone,
  onError: denyOnError
} = denyJob();

function handleHideDialog(){
  visible.value = false;
}
function submit(){
  denyMutate({
    denyJobInput: {
      jobId: props.id,
      reason: rejectReason.value.trim()
    }
  });
}

denyOnDone(() => {
  toastSuccess({ message: 'Từ chối công việc thành công' });
  visible.value = false;
  emits('refresh');
});

denyOnError(() => {
  toastError({ message: t('mission.mission.errors.errors') });
});

</script>
