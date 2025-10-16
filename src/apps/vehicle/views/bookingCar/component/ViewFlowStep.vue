<template>
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
</template>

<script setup lang='ts'>
import { storeToRefs } from 'pinia';
import { ref, watch } from 'vue';

import { useUserMoreInfoStore } from '@/apps/admin/store/usersMoreInfo';
import { getAllTasksByWorkId } from '@/apps/work-flow/api/graphql/task';
import type { Task } from '@/apps/work-flow/model/process/work';
import { generateAvatarUrl } from '@/common/helpers/file-utils';
import useMoment from '@/common/helpers/mixins/use-moment';
import { useUserStore } from '@/common/store/user';

const props = defineProps({
  id: {
    type: String,
    default: '',
  },
});
const { moment } = useMoment();
const tasks = ref<Task[]>([]);
const { user } = useUserStore();

const {
  onResult,
  refetch
} = getAllTasksByWorkId(props.id);

onResult(res => {
  tasks.value = res.data?.getAllTasksByWorkId;
});

watch(() => props.id, newVal => {
  refetch({ id: newVal });
});

const store = useUserMoreInfoStore();
const { usersMoreInfo } = storeToRefs(store);

const reloadTask = () => {
  refetch();
};

defineExpose({ reloadTask });
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