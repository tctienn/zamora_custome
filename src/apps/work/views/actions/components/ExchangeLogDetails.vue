<template>
  <div class='flex flex-column row-gap-2'>
    <h5>{{ t('work.task.exchangeLog') }}</h5>
    <div class='p-fluid'>
      <div class='chat-wrapper flex grid overflow-hidden'>
        <div class='col-12 flex flex-row m-0 surface-0'>
          <div class='flex flex-column flex-grow-1'>
            <CommentTaskHistory
              :length-chat-history='lengthChatHistory'
              :task-comments='taskComments'
              :total-message='totalMessage'
              @load-more='loadMore'/>
            <CommentTaskInput
              :permission='permission'
              @send-message='sendMessage'/>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang='ts' setup>
import { storeToRefs } from 'pinia';
import { type PropType, reactive, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { addCommentGraphql, findCommentsGraphql } from '@/apps/work/api/graphql/comment-api';
import type { Comment, CommentEdge } from '@/apps/work/model/exchangeLog';
import type { PermissionTask } from '@/apps/work/model/permission';
import { useTaskDetailStore } from '@/apps/work/store/taskDetail';
import CommentTaskHistory from '@/apps/work/views/actions/components/CommentTaskHistory.vue';
import CommentTaskInput from '@/apps/work/views/actions/components/CommentTaskInput.vue';
import { Direction, type Pageable } from '@/common/model/query';

defineProps({
  permission: {
    type: Object as PropType<PermissionTask>,
    default: {} as PermissionTask
  },
});
const { t } = useI18n();
const taskDetailStore = useTaskDetailStore();
const { task } = storeToRefs(taskDetailStore);
const taskComments = ref<Comment[]>([]);
const totalMessage = ref(0);
const lengthChatHistory = ref(10);

const pageable = reactive<Pageable>({
  page: 0,
  size: 10,
  sort: [{
    property: 'createdTime',
    direction: Direction.ASC
  }]
});
const {
  onResult: findExchangeLogOnResult,
  refetch: findExchangeLogRefetch
} = findCommentsGraphql('TASK', task.value.id || '', '', pageable);

const {
  mutate: addCommentMutate,
  onDone: addCommentOnDone
} = addCommentGraphql();

findExchangeLogOnResult((res) => {
  totalMessage.value = res.data.totalCount;
  taskComments.value = res.data.findComments.edges.map((a: CommentEdge) => a.node);
});

function loadMore() {
  pageable.page = pageable.page + 1;
  findExchangeLogRefetch();
}

function sendMessage(message: string) {
  addCommentMutate({
    type: 'TASK',
    objectId: task.value.id,
    replyId: '',
    content: message
  });
}

addCommentOnDone(() => {
  pageable.page = 0;
  taskComments.value = [];
  findExchangeLogRefetch();
});

</script>

<script lang='ts'>
export default { name: 'ExchangeLogDetails' };
</script>

<style scoped lang='scss'>
:deep(.left-information-panel) {
  &::-webkit-scrollbar {
    display: none;
  }
}
</style>