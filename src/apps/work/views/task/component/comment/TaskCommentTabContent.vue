<template>
  <div
    class='flex flex-column justify-content-between'>
    <div class='px-2'>
      <TaskCommentHistory
        ref='taskCommentHistoryRef'
        v-model:target-comment='targetComment'
        v-model:target-type='targetType'
        class='overflow-auto pb-3'
        style='height:calc(100vh - 17rem)'
        :task-id='taskId'
        @delete='deleteComment'/>
      <TaskCommentInput
        v-model:target-comment='targetComment'
        v-model:target-type='targetType'
        :disabled='disableModify'
        @cancel-input='cancelInput'
        @edit-message='editMessage'
        @send-message='sendMessage'/>

      <!--    <CommentTaskHistory-->
      <!--      :length-chat-history='lengthChatHistory'-->
      <!--      :task-comments='taskComments'-->
      <!--      :total-message='totalMessage'-->
      <!--      @load-more='loadMore'/>-->
      <!--    <CommentTaskInput-->
      <!--      @send-message='sendMessage'/>-->
    </div>
  </div>
</template>

<script setup lang='ts'>
import { useConfirm } from 'primevue/useconfirm';
import { computed, inject, type Ref, ref, toRef } from 'vue';
import { useI18n } from 'vue-i18n';

import { createTaskComment, deleteTaskComment, editTaskComment } from '@/apps/work/api/rest/task-comment';
import type { StatusType } from '@/apps/work/model/configWorkStatus';
import type { Task } from '@/apps/work/model/task';
import { type TaskComment } from '@/apps/work/model/taskComment';
import { useTaskStore } from '@/apps/work/store/task';
import TaskCommentHistory from '@/apps/work/views/task/component/comment/TaskCommentHistory.vue';
import TaskCommentInput from '@/apps/work/views/task/component/comment/TaskCommentInput.vue';
import { toastErrorData } from '@/common/helpers/custom-toast-service';

const props = defineProps({
  taskId: {
    type: String,
    default: undefined
  }
});
const { t } = useI18n();
const targetComment = ref<TaskComment>();
const targetType = ref<'reply' | 'edit' | undefined>();
const taskCommentHistoryRef = ref<InstanceType<typeof TaskCommentHistory> | null>(null);

function sendMessage(content: string, attachments: (FileList | undefined)) {

  function createFormComment(content: string, attachments: (FileList | undefined)): FormData {
    const formData = new FormData();
    formData.append('content', content);
    formData.append('objectId', props.taskId || '');
    formData.append('type', 'TASK');
    targetComment.value?.id && formData.append('replyId', targetComment.value.id);
    let index = 0;
    while (attachments?.item(index)) {
      formData.append('attachments', attachments[index]);
      index++;
    }

    return formData;
  }

  createTaskComment(
    createFormComment(content, attachments)
  ).then(() => {
    taskCommentHistoryRef.value?.reload();
  }).catch(e => {
    handleError(e);
  });
}

function editMessage(content: string, attachments: (FileList | undefined)) {
  function createFormComment(content: string, attachments: (FileList | undefined)): FormData {
    const formData = new FormData();
    formData.append('content', content);
    let index = 0;
    while (attachments?.item(index)) {
      formData.append('newAttachments', attachments[index]);
      index++;
    }

    return formData;
  }

  if (targetComment.value?.id) {
    const formData = createFormComment(content, attachments);
    editTaskComment(targetComment.value.id, formData)
      .then(() => {
        taskCommentHistoryRef.value?.reload();
      }).catch(e => {
        handleError(e);
      });
  }
}

function cancelInput() {

}

const confirm = useConfirm();

function deleteComment(deleteComment: TaskComment) {
  confirm.require({
    message: 'Bạn có chắc chắn muốn xóa trao đổi này ?',
    header: t('common.confirm'),
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: t('common.delete'),
    acceptClass: 'p-button-danger',
    accept: () => {
      deleteTaskComment(deleteComment.id).then(() => {
        taskCommentHistoryRef.value?.reload();
      }).catch(e => {
        handleError(e);
      });
    }
  });
}

// onMounted(()=>{
//   readTaskComment(props.taskId);
// });
function handleError(error: Record<string, any>) {
  const data = {
    message: '',
    code: '',
  };
  if ((error?.code as string).startsWith('notAllow')) {
    data.message = 'Không có quyền thực hiện';
  }
  if ((error?.code as string).startsWith('taskAlready')) {
    const statusType: StatusType = (error?.data as Record<string, never>)?.statusType;
    data.message = `Công việc ở trạng thái ${t(`common.statuses.${(statusType as string).toLowerCase()}`)}, không thể thực hiện thao tác`;
  }
  toastErrorData({ error: { data: data } });
}

const { canModifyTask } = useTaskStore();
const providedTask = inject<Ref<Task | undefined>>('providedTask', toRef(undefined));
const disableModify = computed(() => {
  return !!providedTask.value && canModifyTask(providedTask.value);
});
</script>

<style scoped>

</style>