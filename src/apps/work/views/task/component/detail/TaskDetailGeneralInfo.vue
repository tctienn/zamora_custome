<template>
  <div
    class='grid'
    style='height: calc(100vh - 9rem)'>
    <div
      class='border-right-3 col-8 flex flex-column gap-2 overflow-auto surface-border'
      style='height:calc(100vh - 9rem)'>
      <div class='align-items-start flex flex-column font-semibold gap-2 justify-content-between text-xl'>
        <div>
          {{ task?.name }}
        </div>
        <OriginCreatedModule
          :origin-created-id='task?.originCreatedId'
          :origin-created-type='task?.originCreatedType'
          :origin-data='task?.originData'/>
      </div>
      <div class='flex justify-content-between'>
        <div class='align-items-center flex gap-2'>Mã công việc:
          <span class='font-semibold'>
            {{ task?.code }}
          </span>
        </div>
        <div class='align-items-center flex gap-1'>
          <span class='align-items-center flex'>
            {{ t('work.project.createdBy') }}
            <AppUser
              class='pl-2 pr-1'
              overlay-visible
              :user-id='task?.createdBy'/>
            <span class='color-link font-semibold'>
              {{ task?.createdBy ? usersMoreInfo[task?.createdBy]?.fullName : '' }}
            </span>
          </span>
          <span>
            {{ t('common.date') }}
            <span>
              {{ formatDate(task?.createdDate, 'DD/MM/YYYY') }}
            </span>
          </span>
        </div>
      </div>
      <div
        v-if='task?.groupId'
        class='align-items-center grid'>
        <div class='align-items-center col flex gap-2'>
          Thuộc nhóm:
          <span class='font-semibold'>
            {{ task?.taskGroup?.name }}
          </span>
        </div>
      </div>
      <div class='align-items-center grid'>
        <div class='align-items-center col-2 flex gap-2 py-1'>
          <AppIcon
            name='account_circle'
            size='1.5'/>
          {{ t('work.task.assigner') }}
        </div>
        <div class='col-10 flex py-1'>
          <AppUser
            :is-highlight='true'
            :name-visible='true'
            overlay-visible
            :user-id='task?.assignerId'/>
        </div>
        <div class='align-items-center col-2 flex gap-2 py-1'>
          <AppIcon
            name='account_circle'
            size='1.5'
            style='opacity:0'/>
          {{ t('work.task.implementer') }}
        </div>
        <div class='col-10 flex py-1'>
          <AppGroupAvatar
            :user-ids='implementerIds'
            :users-highlight='task?.assignerId?[task?.assignerId]:[]'></AppGroupAvatar>
        </div>
        <template v-if='followerIds?.length|| -1 >0'>
          <div class='align-items-center col-2 flex gap-2'>
            <AppIcon
              name='account_circle'
              size='1.5'
              style='opacity:0'/>
            {{ t('work.task.follower') }}
          </div>
          <div class='col-10 flex'>
            <AppGroupAvatar
              :user-ids='followerIds'
              :users-highlight='task?.assignerId?[task?.assignerId]:[]'></AppGroupAvatar>
          </div>
        </template>
      </div>

      <div class='flex justify-content-between'>
        <div class='align-items-center flex gap-2'>
          <AppIcon
            name='schedule'
            size='1.5'/>
          {{ t('work.task.startDate') }}:
          <span class='font-semibold'> {{ formatDate(task?.startTime, formatDateTime) }}</span>
        </div>
        <div class='align-items-center flex gap-2'>
          {{ t('work.task.dueDate') }}:
          <span class='font-semibold'> {{ formatDate(task?.dueTime, formatDateTime) }}</span>
        </div>
        <div class='align-items-center flex gap-2'>
          {{ t('work.task.updateDate') }}:
          <span class='font-semibold text-orange-400'> {{ formatDate(task?.lastModifiedTime) }}</span>
        </div>
        <div></div>
      </div>
      <div class='align-items-center flex gap-2 py-2'>
        {{ t('work.task.priority.this') }}:
        <span class='font-semibold'> {{
          task?.priority ? t(`work.task.priority.${camelCase(task?.priority)}`) : ''
        }} </span>
      </div>

      <div class='py-2'>
        <span class='align-items-center flex gap-2'>
          <AppIcon
            name='edit_note'
            size='1.7'/>
          {{ t('common.description') }}
        </span>
        <div
          v-sanitize-html='task?.description'
          class='ml-2'>
        </div>
      </div>

      <div class='py-2'>
        <span class='align-items-center flex gap-2'>
          <AppIcon
            name='tv_options_edit_channels'
            size='1.6'/>
          {{ t('common.target') }}
        </span>
        <div
          v-sanitize-html='task?.target'
          class='ml-2'>
        </div>
      </div>
      <div class='py-2'>
        <span class='align-items-center flex gap-2'>
          <AppIcon
            name='label'
            size='1.5'/>
          Nhãn
        </span>
        <div
          class='ml-2'>
          <template
            v-for='label in task?.labels'
            :key='label?.id'>
            <Chip
              class='mr-1'
              :label='label?.labelTitle'
              :outlined='true'
              :style="{
                backgroundColor: 'white',
                border: '1px solid ' + label?.labelColor,
                color: label?.labelColor
              }">
            </Chip>
          </template>
        </div>
      </div>

      <div class='py-2'>
        <span class='align-items-center flex gap-2 pb-1'>
          <AppIcon
            name='percent'
            size='1.5'/>
          {{ t('work.task.percent') }}
        </span>
        <div
          class='gap-2 ml-2'>
          <span class='font-semibold text-xl'>
            {{ task?.percent || 0 + '%' }}
          </span>
          <ProgressBar
            class='w-full'
            :pt='{
              root:{
                class:["bg-orange-400"]
              },
              value:{
                class:["bg-blue-400"]
              }
            }'
            :show-value='false'
            style='height:0.5rem'
            :value='task?.percent||0'/>
        </div>

      </div>

      <TaskCheckList
        :task-id='taskId'
        :title="'Checklist'">
      </TaskCheckList>
      <SubTasks
        v-if='taskId'
        :task-id='taskId'
        :title="t('work.task.subTask')">
      </SubTasks>
    </div>
    <TaskDiscussion
      class='col-4 pb-0 surface-border'
      :task-id='taskId'>
    </TaskDiscussion>
  </div>
</template>

<script lang='ts' setup>
import { camelCase } from 'lodash';
import { storeToRefs } from 'pinia';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

import { useUserMoreInfoStore } from '@/apps/admin/store/usersMoreInfo';
import { ParticipantType, type Task } from '@/apps/work/model/task';
import TaskDiscussion from '@/apps/work/views/task/component/comment/TaskDiscussion.vue';
import TaskCheckList from '@/apps/work/views/task/component/detail/checklist/TaskCheckList.vue';
import OriginCreatedModule from '@/apps/work/views/task/component/detail/origin-created-module/OriginCreatedModule.vue';
import SubTasks from '@/apps/work/views/task/component/detail/sub-task/SubTasks.vue';
import AppGroupAvatar from '@/common/components/app/AppGroupAvatar.vue';
import AppUser from '@/common/components/app/AppUser.vue';
import { filterThenMap } from '@/common/helpers/extension/array.extension';
import { formatDate } from '@/common/helpers/utils';

const props = defineProps({
  taskId: {
    type: String,
    required: true
  }
});
const task = defineModel<Task>();

const { t } = useI18n();
const { usersMoreInfo } = storeToRefs(useUserMoreInfoStore());
const formatDateTime = computed(() => {
  return task.value?.isAssignWithTime ? 'DD/MM/YYYY HH:mm' : 'DD/MM/YYYY';
});

const implementerIds = computed(() => {
  return filterThenMap(task.value?.participants || [], item => item.type == ParticipantType.IMPLEMENTER, item => item.participantId);
});
const followerIds = computed(() => {
  return filterThenMap(task.value?.participants || [], item => item.type == ParticipantType.FOLLOWER, item => item.participantId);
});

</script>

<style scoped>

</style>