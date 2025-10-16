<template>
  <div
    class='flex h-full justify-content-center'>
    <div style=' width: 70%'>

      <div class='border-round-sm card'>
        <div class='card-header'>
          <h3>{{ t('work.taskLabel.objectName') }}</h3>
        </div>
        <div
          class='flex-column mt-1 p-fluid'>
          <div
            class='d-flex justify-content-between'>
            <div class='actions mb-2'>
              <ButtonIcon
                icon='add_circle'
                rounded
                text
                @click='showLabelTaskFormDialog'/>
            </div>
          </div>
          <Divider/>
          <Chip
            v-for='(task, index) in labelTasks'
            :key='index'
            class='mr-2'
            :label='task.labelTitle'
            :outlined='true'
            removable
            :style="{
              backgroundColor: 'white',
              border: '1px solid ' + task.labelColor,
              color: task.labelColor
            }"
            @remove='removeValue(task.id)'/>
          <Divider/>
        </div>

        <template>
          <DialogFooter/>
        </template>
        <LabelFormDialog
          v-if='labelDialogFormVisible'
          :visible-dialog='labelDialogFormVisible'
          @hide-dialog='hideLabelDialogFormDialog'
          @reload='reload'/>
      </div>
    </div>
  </div>
</template>

<script setup lang='ts'>

import { get } from 'lodash';
import { provide, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { getAllLabelGraphql, removeLabelByIdGraphql } from '@/apps/work/api/graphql/label-api';
import type { Label } from '@/apps/work/model/taskLabel';
import LabelFormDialog from '@/apps/work/views/actions/components/dialogs/LabelFormDialog.vue';
import DialogFooter from '@/common/components/dialog/DialogFooter.vue';
import { toastSuccess } from '@/common/helpers/custom-toast-service';

const emits = defineEmits(['hide-dialog', 'reload']);
const { t } = useI18n();
const labelDialogFormVisible = ref(false);
let isDetailCreate = ref(false);
let labelTasks = ref<Label[]>();
const { onResult: getAllLabelOnResult, refetch: getAllLabelRefetch } = getAllLabelGraphql();
const { mutate: removeLabelMutate, onDone: removeLabelOnDone } = removeLabelByIdGraphql();

function showLabelTaskFormDialog() {
  labelDialogFormVisible.value = true;
  isDetailCreate.value = true;
}

const taskLabelManagerFormFooterButtons = {
  closeButton: {
    icon: 'close',
    label: t('common.close'),
    text: true,
    severity: 'danger',
    type: 'button',
    command: () => emits('hide-dialog')
  }
};

getAllLabelOnResult((res) => {
  labelTasks.value = get(res, 'data.getAllLabel', []);
});

provide('dialogFooterButtons', taskLabelManagerFormFooterButtons);

function removeValue(label: string) {
  removeLabelMutate({ id: label });
}

removeLabelOnDone(() => {
  toastSuccess({
    message: t('common.result.message.updated', {
      itemType: t('work.taskLabel.objectName'),
      itemName: ''
    })
  });
  reload();
});

function hideLabelDialogFormDialog() {
  labelDialogFormVisible.value = false;
}

function reload() {
  getAllLabelRefetch();
}
</script>

<script lang='ts'>
export default { name: 'LabelConfig' };
</script>