<template>
  <DataTable
    row-hover
    :value='Object.entries(mapUserType)'>
    <Column
      :header="t('Tên thành viên')">
      <template #body='{data}'>
        <AppUser
          :info-visible='true'
          :infos='["positionName", "departments"]'
          name-visible
          :user-id='data[0]'>
        </AppUser>
      </template>
    </Column>
    <Column
      :header="t('Vai trò')">
      <template #body='{data}'>
        {{ data[1]?.join(', ') }}
      </template>
    </Column>
    <Column
      :header="t('Lượt xem')">
      <template #body='{data}'>
        <span class='m-auto number-user'>
          {{ mapViewsUser[data[0]]?.views||0}}
        </span>
      </template>
    </Column>
    <Column
      body-class='text-center'
      :header="t('Truy cập gần nhất')">
      <template #body='{data}'>
        {{ formatDate(mapViewsUser[data[0]]?.lastViewTime) }}
      </template>
    </Column>
    <Column>
      <template #body='{data}'>
        <AppIcon
          v-if='data[0].id !== currentUser.id'
          v-tooltip.top="t('common.chat')"
          class='cursor-pointer'
          name='chat'
          size='1.5'
          @click='gotoChat(data[0].id!)'/>
      </template>
    </Column>
  </DataTable>
</template>

<script lang="ts" setup>
import { computed, type PropType } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

import { getViewsByTaskId } from '@/apps/work/api/graphql/task-history-api';
import { ParticipantType, type Task } from '@/apps/work/model/task';
import { associateBy, filterThenMap } from '@/common/helpers/extension/array.extension';
import { formatDate } from '@/common/helpers/utils';
import { useUserStore } from '@/common/store/user';

const props = defineProps({
  task: {
    type: Object as PropType<Task>,
    default: undefined
  }
});
const { t } = useI18n();
const { user: currentUser } = useUserStore();

const mapUserType = computed<Record<string, string[]>>(() => {
  const rs: Record<string, string[]> = {};
  if (props.task?.assignerId) {
    rs[props.task?.assignerId] = [t('Giao việc')];
  }
  filterThenMap(props.task?.participants || [], item => item.type === ParticipantType.IMPLEMENTER, item => {
    rs[item.participantId] = [...rs[item.participantId] || [], t('work.project.implement')];
  });

  filterThenMap(props.task?.participants || [], item => item.type === ParticipantType.FOLLOWER, item => {
    rs[item.participantId] = [...rs[item.participantId] || [], t('work.project.follow')];
  });
  return rs;
});
const { load: loadViews, result: resultViews } = getViewsByTaskId(props.task?.id || '');
type ViewsWorkProjection = {
  userId: string,
  views: number,
  lastViewTime: string
}
const mapViewsUser = computed(()=>{
  const views = (resultViews.value?.getViewsByTaskId || []) as ViewsWorkProjection[];
  return associateBy(views, item => item?.userId) ;
});
if (props.task?.id) {
  loadViews(null, { taskId: props.task?.id });
}

const router = useRouter();
function gotoChat(userId: string) {
  const route = router.resolve({
    name: 'AppChat',
    params: { conversationId: userId }
  });
  window.open(route.href, '_blank');
}
</script>

<style scoped>

</style>