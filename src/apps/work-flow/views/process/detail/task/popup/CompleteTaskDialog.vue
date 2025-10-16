<template>
  <Dialog
    v-model:visible='visible'
    class='w-30rem'
    header='Complete Task'
    modal>
    <div class='field flex gap-2'>
      <label>{{ t('work-flow.task.selectedResult') }}:</label>
      <div
        v-if='outcome'
        :style='{color: outcome?.color}'>
        {{ outcome?.label }}
      </div>
    </div>

    <div class='flex flex-column gap-1'>
      <label
        for='comment'>{{ t('work-flow.task.comment') }}</label>
      <Textarea
        id='comment'
        v-model='comment'
        class='w-full'
        rows='3'/>
    </div>

    <template #footer>
      <DialogFooter/>
    </template>
  </Dialog>

</template>

<script lang='ts' setup>

import type { ButtonProps } from 'primevue/button';
import { type PropType, provide, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import type { Outcome } from '@/apps/work-flow/model/flow';
import { handleCompleteTask } from '@/apps/work-flow/views/process/task-menu';
import DialogFooter from '@/common/components/dialog/DialogFooter.vue';

const props = defineProps({
  taskId: {
    type: String as PropType<string | undefined>,
    default: undefined
  },
  outcome: {
    type: Object as PropType<Outcome | undefined>,
    default: undefined
  }
});
const emits = defineEmits(['reload']);
const visible = defineModel('visible', {
  type: Boolean,
  default: false
});
const { t } = useI18n();

const comment = ref('');
const dialogFooterButtons: { closeButton: ButtonProps, actionButton: ButtonProps } = {
  closeButton: {
    icon: 'close',
    label: t('common.close'),
    severity: 'danger',
    onClick: () => visible.value = false
  },
  actionButton: {
    icon: 'check',
    label: t('common.confirm'),
    onClick: submit
  }
};

provide('dialogFooterButtons', dialogFooterButtons);

function submit() {
  if (props.taskId && props.outcome?.name) {
    handleCompleteTask(props.taskId, props.outcome?.name, comment.value)
      .then(() => {
        visible.value = false;
        emits('reload');
      });
  }
}
</script>

<style scoped>

</style>