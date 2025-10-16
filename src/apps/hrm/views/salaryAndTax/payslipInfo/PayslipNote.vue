<template>
  <Dialog
    v-model:visible='visibleForm'
    v-bind='DEFAULT_DIALOG_CONFIG'
    :header="t('hrm.salary.titleNote')"
    @hide="emits('hide-dialog')">
    <div>
      <AppEditor
        ref='editor'
        v-model='note'
        editor-style='height: 25rem;'
        name='note'/>
    </div>
    <div
      class='border-primary-100 border-top-1 bottom-0 fixed flex gap-2 justify-content-center p-3 py-2 surface-overlay'
      style='width: 96%'>
      <Button
        class='p-button-plain'
        icon='pi pi-times'
        :label="t('common.close')"
        severity='danger'
        @click="emits('hide-dialog')"/>
      <Button
        icon='pi pi-save'
        :label="t('common.save')"
        @click='submit'/>
    </div>
  </Dialog>
</template>

<script setup lang='ts'>

import { type PropType, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { getPayslipNode, savePayslipNote } from '@/apps/hrm/api/graphql/salary';
import AppEditor from '@/common/components/custom/AppEditor.vue';
import { DEFAULT_DIALOG_CONFIG } from '@/common/constants';
import { toastSuccess } from '@/common/helpers/custom-toast-service';

const props = defineProps({
  visibleDialog: {
    type: Boolean,
    default: false,
  },
  selectedPayslip: {
    type: Object as PropType<any>,
    required: true,
  },
});
const emits = defineEmits(['hide-dialog']);
const { t } = useI18n();
const visibleForm = ref(props.visibleDialog);
const payslipNote = ref<any>({} as any);
const note = ref('');

if (props.selectedPayslip) {
  getPayslipNode(props.selectedPayslip.code).onResult(res => {
    payslipNote.value = res.data.getPayslipNode;
    note.value = payslipNote.value?.note;
  });
}

const {
  mutate,
  onDone
} = savePayslipNote();

const submit = () => {
  mutate({
    payslipNote: {
      ...payslipNote.value,
      payslipCode: props.selectedPayslip.code,
      payslipName: props.selectedPayslip.name,
      note: note.value
    }
  });
};

onDone(() => {
  toastSuccess({ message: t('common.saveSuccess') });
  emits('hide-dialog');
});
</script>

<style scoped>
:deep(.p-editor-container) {
  .p-editor-toolbar {
    display: none;
  }
}
</style>