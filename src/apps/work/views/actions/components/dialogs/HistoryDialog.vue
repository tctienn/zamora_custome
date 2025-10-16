<template>
  <Dialog
    v-model:visible='visible'
    :header='t("work.history.title")'
    v-bind='DEFAULT_DIALOG_CONFIG'
    @hide='emits("hide-dialog")'>

    <DataTable
      context-menu
      :value='taskHistory'
      v-bind='DEFAULT_DATATABLE_CONFIG'>

      <Column
        class='bg-transparent text-color'
        field='time'
        :header='t("common.time")'/>

      <Column
        class='bg-transparent text-color'
        field='userName'
        :header='t("work.implementer")'/>

      <Column
        class='bg-transparent text-color'
        field='action'
        :header='t("work.actions.type")'>
        <template #body='{data: {action, attribute}}'>
          {{ action }} {{ attribute }}
        </template>
      </Column>

      <Column
        class='bg-transparent text-color'
        field='content'
        :header='t("common.content")'/>
    </DataTable>

    <template #footer>
      <DialogFooter/>
    </template>
  </Dialog>
</template>

<script lang='ts' setup>
import { type PropType, provide, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { findAllHistoryByTaskIdGraphql } from '@/apps/work/api/graphql/task-history-api';
import type { Task } from '@/apps/work/model/task';
import DialogFooter from '@/common/components/dialog/DialogFooter.vue';
import { DEFAULT_DATATABLE_CONFIG, DEFAULT_DIALOG_CONFIG } from '@/common/constants';
import { toastError } from '@/common/helpers/custom-toast-service';

const props = defineProps({
  visibleDialog: {
    type: Boolean,
    default: false
  },
  task: {
    type: Object as PropType<Task>,
    default: {} as Task
  }
});

const emits = defineEmits(['hide-dialog']);

const visible = ref(props.visibleDialog);

const { t } = useI18n();
const taskHistory = ref();
const historyFooterButtons = {
  closeButton: {
    icon: 'close',
    label: t('common.close'),
    text: true,
    severity: 'danger',
    type: 'button',
    command: () => emits('hide-dialog')
  }
};

const {
  onResult: findAllHistoryByTaskIdOnResult,
  onError: findAllHistoryByTaskIdOnError
} = findAllHistoryByTaskIdGraphql(props.task.id || '');
findAllHistoryByTaskIdOnResult(res => {
  taskHistory.value = res.data.findAllHistoryByTaskId;
});
findAllHistoryByTaskIdOnError(e => {
  toastError();
});

provide('dialogFooterButtons', historyFooterButtons);

</script>

<script lang='ts'>
export default { name: 'HistoryDialog' };
</script>