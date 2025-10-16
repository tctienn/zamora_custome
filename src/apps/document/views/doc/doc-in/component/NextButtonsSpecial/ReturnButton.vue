<template>
  <Button
    :class='className + ` border-round-sm btn-action hover:border-1 hover:border-400 hover:surface-200 py-1 surface-0 text-900`'
    :label='t("document.action.return")'
    severity='danger'
    size='small'
    @click='isVisibleDialogReturn = true;'>
    <template #icon>
      <AppIcon
        class='icon-arrow_circle_left pr-1'
        name='arrow_circle_left'
        size='20px'/>
    </template>
  </Button>

  <ReturnDialog
    v-model:visible='isVisibleDialogReturn'
    :doc-id='docId'
    :flow-instance-id='flowInstanceId'
    @return-doc='returnDoc'>
  </ReturnDialog>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

import ReturnDialog from '@/apps/document/views/doc/doc-in/component/next-buttons-dialogs/ReturnDialog.vue';
import AppIcon from '@/common/components/app/AppIcon.vue';

const props = defineProps({
  docId: {
    type: String,
    required: true
  },
  flowInstanceId: {
    type: String,
    required: false,
    default: ''
  },
  isReceive: {
    type: Boolean,
    default: false
  },
  className: {
    type: String,
    default: ''
  }
});
const emits = defineEmits<{
  (e: 'click'): void,
  (e: 'return-doc', formData: FormData): void,
  (e: 'return-doc-receive', formData: FormData): void,
}>();
const isVisibleDialogReturn = ref<boolean>(false);
const { t } = useI18n();

function returnDoc(formData: FormData) {
  if (props.isReceive) {
    emits('return-doc-receive', formData);
  } else {
    emits('return-doc', formData);
  }
  isVisibleDialogReturn.value = false;
}

</script>

<style lang="scss" scoped>
.btn-action {
  font-size: 14px;
  font-weight: 400;
  border-radius: 4px;

  :deep(.p-button-label) {
    font-size: 14px;
    font-weight: 400;
  }

  :deep(.pi-trash) {
    color: #FF4406 !important;
  }

  :deep(.pi-comments) {
    color: #BF7CD3 !important;
  }

  :deep(.pi-send) {
    color: #3E84F6 !important;
  }

  :deep(.pi-plus-circle) {
    color: #34A853;
  }
  :deep(.icon-arrow_circle_left) {
    color: #FF4406 !important;
    font-size: 14px;
  }
}
</style>