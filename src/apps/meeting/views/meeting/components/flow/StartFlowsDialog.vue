<template>
  <Dialog
    v-model:visible='visible'
    v-bind='DEFAULT_DIALOG_CONFIG'
    header='Xác nhận'
    :style=" { width: '30vw'}"
    @hide="emits('hide-dialog')">
    <div>
      <div class='font-bold mb-6'>
        Xác nhận {{ type === StatusMeetingEnum.DRAFT ? 'chuyển xử lý' : 'phê duyệt' }}
      </div>
      <div
        class='border-primary-100 border-top-1 bottom-0 fixed flex gap-2 justify-content-center p-3 py-2 surface-overlay'
        style='width: 100%; left: 0; z-index: 1000'>
        <Button
          class='p-button-plain'
          icon='pi pi-times'
          :label="t('common.close')"
          severity='danger'
          @click="emits('hide-dialog')"/>
        <Button
          icon='pi pi-send'
          :label="t('common.perform')"
          :loading='isLoading'
          @click='startWorkFlow'/>
      </div>
    </div>
  </Dialog>
</template>

<script setup lang='ts'>

import { type PropType, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { StatusMeetingEnum } from '@/apps/meeting/model/meeting';
import { completeTasksAndCreateNextTasks, createWorksAndSendToFirstNodes } from '@/apps/work-flow/api/graphql/work';
import { DEFAULT_DIALOG_CONFIG } from '@/common/constants';
import { toastSuccess } from '@/common/helpers/custom-toast-service';

const props = defineProps({
  meetings: {
    type: Array as PropType<any>,
    default: () => []
  },
  visibleDialog: {
    type: Boolean,
    default: false,
  },
  type: {
    type: String,
    default: StatusMeetingEnum.DRAFT,
  }
});
const emits = defineEmits(['hide-dialog']);
const { t } = useI18n();
const visible = ref(props.visibleDialog);
const isLoading = ref(false);

const startWorkFlow = () => {
  isLoading.value = true;
  if (props.type === StatusMeetingEnum.DRAFT) {
    const payload = props.meetings
      .filter((item: any) => item.status === StatusMeetingEnum.DRAFT)
      .map((item: any) => ({
        objectId: item.id,
        flowId: item.flowId
      }));
    createWorksAndSendToFirstNodes().mutate({ payload }).then(async result => {
      if (result) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        toastSuccess();
        emits('hide-dialog');
        isLoading.value = false;
      }
    });
  } else {
    const objectIds = props.meetings
      .filter((item: any) => item.status === StatusMeetingEnum.PENDING)
      .map((item: any) => item.id);
    completeTasksAndCreateNextTasks().mutate({ objectIds }).then(async result => {
      if (result) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        toastSuccess();
        emits('hide-dialog');
        isLoading.value = false;
      }
    });
  }
};
</script>

<style scoped>

</style>