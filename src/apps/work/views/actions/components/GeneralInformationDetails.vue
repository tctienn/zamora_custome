<template>
  <div
    class='flex flex-column row-gap-2'>
    <h5>{{ t('work.task.generalInformation') }}</h5>
    <div class='p-fluid'>
      <div class='align-items-center flex'>
        <div class='col-2 font-bold'>
          <label>{{ t('work.task.taskName') }}</label>
        </div>

        <div class='col-10'>
          <InputText
            v-model='task.name'
            :disabled='!permission.isUpdateInfo'/>
        </div>
      </div>

      <div class='align-items-center flex'>
        <div class='col-2 font-bold'>
          <label for='code'>{{ t('work.taskLabel.objectName') }}</label>
        </div>

        <div class='col-10'>
          <WorkLabel
            v-if='task.labels'
            v-model='task.labels'
            :editable='permission.isUpdateInfo'
            :options='labelTasks'/>
        </div>
      </div>

      <div class='align-items-center flex'>
        <div class='col-2 font-bold'>
          <label>{{ t('work.task.startDate') }}</label>
        </div>

        <div class='col-4'>
          {{ moment(task.startTime).format('DD/MM/YYYY HH:mm:ss') }}
        </div>

        <div class='col-2 font-bold'>
          <label>{{ t('work.task.completionDeadline') }}</label>
        </div>

        <div class='col-4'>
          {{ task.dueTime != null ? moment(task.dueTime).format('DD/MM/YYYY HH:mm:ss') : '' }}
        </div>
      </div>

      <div
        v-if='taskFields.includes("description")'
        class='align-items-center flex font-bold'>
        <div class='col-2'>
          <label>{{ t('work.task.description') }}</label>
        </div>

        <div class='col-10'>
          <Textarea
            id='inputMessage'
            v-model='task.description'
            autofocus
            class='input-chat outline-none shadow-none w-full'
            :disabled='!permission.isUpdateInfo'
            rows='2'/>
        </div>
      </div>
    </div>
  </div>
  <Divider/>
</template>

<script lang='ts' setup>
import { get } from 'lodash';
import moment from 'moment/moment';
import { storeToRefs } from 'pinia';
import { type PropType, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { getAllLabelGraphql } from '@/apps/work/api/graphql/label-api';
import { type PermissionTask } from '@/apps/work/model/permission';
import type { Label, TaskLabelInput } from '@/apps/work/model/taskLabel';
import { useTaskDetailStore } from '@/apps/work/store/taskDetail';
import WorkLabel from '@/apps/work/views/actions/components/task/WorkLabel.vue';

defineProps({
  taskFields: {
    type: Array as PropType<string[]>,
    default: () => []
  },
  permission: {
    type: Object as PropType<PermissionTask>,
    default: {} as PermissionTask
  },
});

const { t } = useI18n();

const taskDetailStore = useTaskDetailStore();
const { task } = storeToRefs(taskDetailStore);
let labelTasks = ref<TaskLabelInput[]>();
const {
  onResult: getAllLabelOnResult,
  refetch: getAllLabelRefetch
} = getAllLabelGraphql();
getAllLabelOnResult((res) => {
  const allLabel: Label[] = get(res, 'data.getAllLabel', []);
  labelTasks.value = allLabel.map((label) => {
    return {
      id: '',
      labelId: label.id,
      taskId: '',
      labelTitle: label.labelTitle,
      labelColor: label.labelColor,
    };
  });
});

</script>

<script lang='ts'>
export default { name: 'GeneralInformationDetails' };
</script>

<style lang='scss' scoped>
:deep(.left-information-panel) {
  &::-webkit-scrollbar {
    display: none;
  }
}
</style>