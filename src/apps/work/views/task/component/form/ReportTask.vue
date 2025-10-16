<template>
  <Dialog
    v-model:visible='visible'
    :header='t("Báo cáo")'
    v-bind='DEFAULT_DIALOG_CONFIG'>
    <!--    Co vong viec con-->
    <template v-if='leafTask.length>0'>

      <div class='flex flex-column gap-3 mb-3'>
        <div class='font-semibold text-xl' >
          1. Chọn công việc con để báo cáo
        </div>
        <div
          v-for='task in leafTask'
          :key='task.id'
          class='align-items-center flex gap-2'>
          <Checkbox
            v-model='selectedTask'
            :value='task'>
          </Checkbox>
          <span>{{task.name}} </span>
        </div>
      </div>
      <div class='flex flex-column gap-3'>
        <div class='font-semibold text-xl' >
          2. Báo cáo công việc
        </div>
        <div>
          Ngày báo cáo: {{formaterDateTime(new Date(),'DD/MM/YYYY')}}
        </div>
        <div class='w-full'>
          Tên công việc:
          <div class='flex flex-column gap-2 mt-2'>
            <div
              v-for='task in selectedTask'
              :key='task.id'
              class='align-items-center flex gap-2'>
              <span class='ml-8 w-4'>
                {{task.name}}
              </span>
              <InputNumber
                v-model='task.percent'
                :max='100'
                :min='0'/>
            </div>
          </div>
        </div>
        <div class='flex flex-column gap-2'>
          Nội dung
          <div class='align-items-center flex gap-2 mx-3'>
            <Textarea
              v-model='note'
              class='w-full'
              rows='5'>
          </Textarea>
          </div>
        </div>
      </div>
    </template>

    <template v-else>
      <div >
        <div class='font-semibold mb-3 text-xl' >
          Báo cáo công việc
        </div>
        <div class='flex flex-column gap-3'>
          <div>
            Ngày báo cáo: {{formaterDateTime(new Date(),'DD/MM/YYYY')}}
          </div>
          <div class='w-full'>
            Tên công việc: {{subTaskClone?.name}}
          </div>
          <div>
            Tiến độ hoàn thành (%)
            <InputNumber
              v-model='subTaskClone.percent'
              :max='100'
              :min='0'
              style='width:fit-content;'/>
          </div>
          <div class='flex flex-column gap-2'>
            Nội dung
            <div class='align-items-center flex gap-2 mx-3'>
              <Textarea
                v-model='note'
                class='w-full'
                rows='5'>
          </Textarea>
            </div>
          </div>
        </div>
      </div>
    </template>

    <template #footer>
      <DialogFooter/>
    </template>
  </Dialog>
</template>

<script setup lang="ts">

import { not } from '@vuelidate/validators';
import { cloneDeep } from 'lodash';
import { type PropType, provide, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { getLeafByTaskId } from '@/apps/work/api/graphql/task-api';
import { addResultGraphql } from '@/apps/work/api/graphql/task-result-api';
import type { Task } from '@/apps/work/model/task';
import type { TaskResultInput } from '@/apps/work/model/taskResult';
import DialogFooter from '@/common/components/dialog/DialogFooter.vue';
import { DEFAULT_DIALOG_CONFIG } from '@/common/constants';
import { formatDateTime, formaterDateTime } from '@/common/helpers/time-util';

const props = defineProps({
  subTask: {
    type: Object as PropType<Task>,
    default: ()=>({})
  }
});
const leafTask = ref<Task[]>([]);
const selectedTask = ref<Task[]>([]);
const subTaskClone = ref<Task>({} as Task);
const note = ref<string>('');

watch(()=>props.subTask, value=>{
  subTaskClone.value = cloneDeep(value);
  note.value = '';
}, { immediate: true });
const visible = defineModel<boolean>('visible', { default: false });
const { t } = useI18n();
const { load: loadLeaf, onResult: leafOnResult, refetch: refetchLeaf } = getLeafByTaskId(props.subTask?.id || '');
watch(()=>props.subTask?.id, value=>{
  if(value){
    loadLeaf(null, { taskId: value })
      || refetchLeaf({ taskId: value }) ;
    leafOnResult(res=>{
      return; 
    });
  }
});

leafOnResult(res=>{
  leafTask.value = cloneDeep(res.data?.getLeafByTaskId || []);
});

provide('dialogFooterButtons', {
  closeButton: {
    icon: 'pi pi-times',
    label: t('common.close'),
    severity: 'danger',
    type: 'button',
    command: () =>visible.value = false
  },
  actionButton: {
    icon: 'pi pi-save',
    label: t('common.save'),
    text: false,
    type: 'submit',
    command: () => addResult()
  }
});
const { mutate: addResultMutate } = addResultGraphql();
function addResult(){
  const taskResultInput: TaskResultInput = {
    id: '',
    taskId: subTaskClone.value.id,
    weight: subTaskClone.value.weight,
    percent: subTaskClone.value.percent,
    statusId: subTaskClone.value?.statusId || '',
    statusName: subTaskClone.value?.statusId || '',
    description: note.value,
  };
  addResultMutate({ task: taskResultInput });
}

</script>

<style scoped>
.no-border {
  border: none;
  outline: none;
  background-color: transparent;
}
</style>