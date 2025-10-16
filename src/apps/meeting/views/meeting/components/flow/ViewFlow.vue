<template>
  <Dialog
    v-model:visible='visible'
    v-bind='DEFAULT_DIALOG_CONFIG'
    :header="t('common.viewFlowStep')"
    :style=" { width: '30vw'}"
    @hide="emits('hide-dialog')">
    <div>
      <div class='mb-6'>
        <div class='h-full overflow-auto'>
          <div
            v-for='(task, index) in tasks'
            :key='index'
            class='mb-3'>
            <div class='flex gap-3'>
              <div>
                <AppAvatar
                  :avatar='generateAvatarUrl(usersMoreInfo[task.assignedId]?.avatar)'
                  class='flex user-avatar'
                  :class="{
                    'success': task.result === 'APPROVE' || task.result === 'NEXT',
                    'error': task.result === 'REJECT',
                    'progress': task.result === null
                  }"
                  shape='circle'
                  size='3'/>
                <div
                  v-if='index < tasks.length - 1'
                  class='line'></div>
              </div>
              <div class='flex flex-column gap-2 w-full'>
                <div class='align-items-center flex justify-content-between w-full'>
                  <div class='font-bold'>{{ usersMoreInfo[task.assignedId]?.fullName }}</div>
                  <small
                    v-if='task.endTime'>{{ moment(task.endTime).format('HH:mm DD/MM/YYYY') }}
                  </small>
                </div>
                <small>{{ usersMoreInfo[task.assignedId]?.positionName.join(', ') }} |
                  {{ usersMoreInfo[task.assignedId]?.departments.map(dept => dept.name).join(', ') }}</small>
                <div
                  v-if='task.comment'
                  class='border-round p-2 surface-200'
                  :class='user.id === task.assignedId ? "bg-blue-100" : ""'>
                  {{ task.comment }}
                </div>
              </div>
            </div>
          </div>
        </div>
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
      </div>
    </div>
  </Dialog>
</template>

<script setup lang='ts'>

import { storeToRefs } from 'pinia';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { useUserMoreInfoStore } from '@/apps/admin/store/usersMoreInfo';
import { getAllTasksByWorkId, getTaskByObjectId } from '@/apps/work-flow/api/graphql/task';
import type { Task } from '@/apps/work-flow/model/process/work';
import { DEFAULT_DIALOG_CONFIG } from '@/common/constants';
import { generateAvatarUrl } from '@/common/helpers/file-utils';
import useMoment from '@/common/helpers/mixins/use-moment';
import { useUserStore } from '@/common/store/user';

const props = defineProps({
  visibleDialog: {
    type: Boolean,
    default: false,
  },
  id: {
    type: String,
    default: '',
  },
});

const emits = defineEmits(['hide-dialog']);
const { t } = useI18n();
const visible = ref(props.visibleDialog);

const { moment } = useMoment();
const { user } = useUserStore();
const tasks = ref<Task[]>([]);
const store = useUserMoreInfoStore();
const { usersMoreInfo } = storeToRefs(store);

const { onResult: onTaskResult } = getTaskByObjectId(props.id);

onTaskResult((res) => {
  const workId = res.data?.getTaskByObjectId?.workId;
  if (!workId) {
    return;
  }

  const { onResult: onAllTasksResult } = getAllTasksByWorkId(workId);

  onAllTasksResult((res) => {
    tasks.value = res.data?.getAllTasksByWorkId || [];
  });
});

</script>

<style scoped>
.user-avatar {
  position: relative;
}

.user-avatar::after {
  position: absolute;
  bottom: -2px;
  right: -2px;
  color: white;
  font-size: 10px;
  border-radius: 50%;
  width: 12px;
  height: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.user-avatar.success::after {
  content: '✓';
  background-color: #82C95E;
}

.user-avatar.error::after {
  content: '✘';
  background-color: #ef4444;
}

.user-avatar.progress::after {
  content: '';
  background-color: #0D99FF;
}

.line {
  width: 2px;
  height: 100%;
  margin: auto;
  border-left: 1px dashed #999;
}
</style>