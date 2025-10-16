<template>
  <div>
    <div class='align-items-center flex flex-column gap-1 justify-content-evenly'>
      <AppGroupAvatar
        :avatar-size='"2.5"'
        :number-avatar-display='5'
        :user-ids='userInTaskIds'
        :users-highlight='[task?.assignerId||""]'>
        <template #header>
          <div class='flex font-semibold'>
            <div class='w-3'>
              {{ t('work.project.joiner') }}
            </div>
            <div class='w-3'>
              {{ t('common.role') }}
            </div>
            <div class='flex justify-content-center w-3'>
              {{ t('work.common.views') }}
            </div>
            <div class='w-3'>
              {{ t('work.common.lastViewTime') }}
            </div>
            <div
              style='width:21px'>
            </div>
          </div>
        </template>
        <template #userTile='{user:user}'>
          <div class='flex gap-1 w-full'>
            <div class='flex  w-3'>
              <AppUser
                avatar-size='2.5'
                info-visible
                :infos='["positionName", "departments"]'
                :is-highlight='user.id===task?.assignerId'
                name-visible
                :user-id='user.id'>
              </AppUser>
            </div>
            <div class='align-items-center flex w-3'>
              <span>
                {{
                  user.id ? mapUserType[user.id]?.join(', ')
                  : ""
                }}
              </span>
            </div>
            <div class='align-items-center flex justify-content-center w-3'>
              <span
                v-if='user.id'
                class='number-user'> {{ mapViewsUser[user.id]?.views || 0 }} </span>
            </div>
            <div class='align-items-center flex w-3'>
              <span v-if='user.id'>
                {{ formatDate(mapViewsUser[user.id]?.lastViewTime) }}
              </span>
            </div>
          </div>
        </template>
      </AppGroupAvatar>
      <slot
        name='status-badge'
        :task='task'>
        <span
          v-if='task?.statusId'
          class='status-badge text-sm'
          :style="{'background-color':`#${mapStatuses[task.statusId]?.color||'ffffff'}`,
                   'color':calculateColorBasedOnBackgroundColor(`#${mapStatuses[task.statusId]?.color||'ffffff'}`)}">
          {{ mapStatuses[task.statusId]?.name }}
        </span>
      </slot>
    </div>
  </div>
</template>

<script lang="ts" setup>

import { storeToRefs } from 'pinia';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

import { getViewsByTaskId } from '@/apps/work/api/graphql/task-history-api';
import { ParticipantType, type Task } from '@/apps/work/model/task';
import { useTaskStore } from '@/apps/work/store/task';
import AppGroupAvatar from '@/common/components/app/AppGroupAvatar.vue';
import { calculateColorBasedOnBackgroundColor } from '@/common/helpers/color-util';
import { associateBy, filterThenMap } from '@/common/helpers/extension/array.extension';
import { formatDate } from '@/common/helpers/utils';

const props = defineProps({
  taskId: {
    type: String,
    default: undefined
  }
});
const task = defineModel<Task>();

const taskStore = storeToRefs(useTaskStore());
const { t } = useI18n();
const { mapStatuses } = taskStore;

const userInTaskIds = computed(() => {
  const rs = new Set<string>();
  if (task.value?.assignerId) {
    rs.add(task.value.assignerId);
  }
  task.value?.participants?.forEach(value => {
    rs.add(value.participantId);
  });
  return [...rs];
});

const mapUserType = computed<Record<string, string[]>>(() => {
  const rs: Record<string, string[]> = {};
  if (task.value?.assignerId) {
    rs[task.value?.assignerId] = [t('Giao việc')];
  }
  filterThenMap(task.value?.participants || [], item => item.type === ParticipantType.IMPLEMENTER, item => {
    rs[item.participantId] = [...rs[item.participantId] || [], t('work.project.implement')];
  });

  filterThenMap(task.value?.participants || [], item => item.type === ParticipantType.FOLLOWER, item => {
    rs[item.participantId] = [...rs[item.participantId] || [], t('work.project.follow')];
  });
  return rs;
});
const { load: loadViews, result: resultViews } = getViewsByTaskId(props.taskId || '');
type ViewsWorkProjection = {
  userId: string,
  views: number,
  lastViewTime: string
}
if (props.taskId) {
  loadViews(null, { taskId: props.taskId });
}
const mapViewsUser = computed(() => {
  const views = (resultViews.value?.getViewsByTaskId || []) as ViewsWorkProjection[];
  return associateBy(views, item => item?.userId);
});

</script>

<style scoped>

</style>