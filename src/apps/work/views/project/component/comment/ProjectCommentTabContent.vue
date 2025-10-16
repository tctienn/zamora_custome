<template>
  <div
    v-if='projectId'
    class='flex flex-column h-full justify-content-between pt-2'>
    <ProjectCommentHistory
      ref='projectCommentHistoryRef'
      v-model:target-comment='targetComment'
      v-model:target-type='targetType'
      class='overflow-auto'
      :project-id='projectId'
      style='height:calc(100vh - 20.5rem)'
      @delete='deleteComment'/>
    <ProjectCommentInput
      v-model:target-comment='targetComment'
      v-model:target-type='targetType'
      class='m-1 p-2'
      @cancel-input='cancelInput'
      @edit-message='editMessage'
      @send-message='sendDiscussion'/>
    <!--    <CommentTaskHistory-->
    <!--      :length-chat-history='lengthChatHistory'-->
    <!--      :task-comments='taskComments'-->
    <!--      :total-message='totalMessage'-->
    <!--      @load-more='loadMore'/>-->
    <!--    <CommentTaskInput-->
    <!--      @send-message='sendMessage'/>-->
  </div>
</template>

<script lang="ts" setup>

import { useConfirm } from 'primevue/useconfirm';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { deleteProjectMessage, editProjectMessage, sendMessage } from '@/apps/work/api/rest/project-discussion';
import { type ProjectDiscussion } from '@/apps/work/model/projectDiscussion';
import ProjectCommentHistory from '@/apps/work/views/project/component/comment/ProjectCommentHistory.vue';
import ProjectCommentInput from '@/apps/work/views/project/component/comment/ProjectCommentInput.vue';

const props = defineProps({
  projectId: {
    type: String,
    default: undefined
  }
});
const { t } = useI18n();
const targetComment = ref<ProjectDiscussion>();
const targetType = ref<'reply' | 'edit' | undefined>();
const projectCommentHistoryRef = ref<InstanceType<typeof ProjectCommentHistory> | null>(null);

function sendDiscussion(content: string, attachments: (FileList | undefined)) {

  function createFormComment(content: string, attachments: (FileList | undefined)): FormData {
    const formData = new FormData();
    formData.append('content', content);
    formData.append('projectId', props.projectId || '');
    // formData.append('type', 'TASK');
    targetComment.value?.id && formData.append('replyId', targetComment.value.id);
    if (attachments) {
      formData.append('isAttachment', 'true');
    }
    let index = 0;
    while (attachments?.item(index)) {
      formData.append('attachments', attachments[index]);
      index++;
    }
    return formData;
  }

  sendMessage(
    createFormComment(content, attachments)
  ).then(() => {
    projectCommentHistoryRef.value?.reload();
  });
}

function editMessage(content: string, attachments: (FileList | undefined)) {
  function createFormComment(content: string, attachments: (FileList | undefined)): FormData {
    const formData = new FormData();
    formData.append('content', content);
    formData.append('projectId', props.projectId || '');
    let index = 0;
    while (attachments?.item(index)) {
      formData.append('newAttachments', attachments[index]);
      index++;
    }

    return formData;
  }

  if (targetComment.value?.id) {
    const formData = createFormComment(content, attachments);
    editProjectMessage(targetComment.value.id, formData)
      .then(() => {
        projectCommentHistoryRef.value?.reload();
      });
  }
}

function cancelInput() {

}

const confirm = useConfirm();

function deleteComment(deleteComment: ProjectDiscussion) {
  confirm.require({
    message: 'Bạn có chắc chắn muốn xóa trao đổi này ?',
    header: t('common.confirm'),
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: t('common.delete'),
    acceptClass: 'p-button-danger',
    accept: () => {
      deleteProjectMessage(deleteComment.id).then(() => {
        projectCommentHistoryRef.value?.reload();
      });
    }
  });
}

// onMounted(()=>{
//   readTaskComment(props.taskId);
// });
</script>

<style scoped>

</style>