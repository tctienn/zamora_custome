<template>
  <div class='align-items-center flex flex-row justify-content-between p-2'>
    <div class='flex font-bold text-xl'>
      {{ t(`ecm.chatAttachment.commentFile`) }}
    </div>
    <div class='flex'>
      <ButtonIcon
        v-if='permission === Permission.FULL_CONTROL || permission === Permission.EDITOR'
        v-tooltip='statusComment ? t("ecm.fileFolder.tooltip.turnOffComment") : t("ecm.fileFolder.tooltip.turnOnComment")'
        class='p-2'
        :icon='statusComment ? "speaker_notes" : "speaker_notes_off"'
        text
        @click='turnOnOffComment'/>
      <ButtonIcon
        v-if='file?.personal'
        v-tooltip='statusComment ? t("ecm.fileFolder.tooltip.turnOffComment") : t("ecm.fileFolder.tooltip.turnOnComment")'
        class='p-2'
        :icon='statusComment ? "speaker_notes" : "speaker_notes_off"'
        text
        @click='turnOnOffComment'/>
    </div>
  </div>
  <div
    class='h-full m-0 overflow-hidden surface-100'>
    <div class='flex flex-column flex-grow-1 gap-3 h-full p-2'>
      <!--comment-->
      <div
        class='chat-history flex flex-column-reverse flex-grow-1 gap-2 overflow-y-auto topic-comment-wrapper'
        @scroll='onScroll'>
        <div
          v-for='comment in comments'
          :key='comment.id'
          class='align-items-center column-gap-2 flex'
          :class='comment.senderId === user.id ? "flex-row-reverse": "flex-row"'>
          <AppUser
            avatar-only
            :user-id='comment.senderId'/>
          <div
            class='border-round flex-grow-1 p-2 text-white'
            :class='comment.senderId === user.id ? "bg-primary-400": "bg-orange-400"'>
            <div
              class='align-items-center flex flex-row flex-wrap justify-content-between'>
              <span class='font-bold'>{{ comment.sender }}</span>
              <small
                class='font-italic opacity-90'>
                {{ moment(comment.sentAt).fromNow() }}</small>
            </div>
            <span>
              {{ comment.content }}
            </span>
          </div>
        </div>
      </div>
      <div
        v-if='statusComment && ( file?.isShare || !file?.personal )'
        class='align-items-center flex flex-row gap-2 justify-content-center'>
        <div class='w-full'>
          <Textarea
            id='inputMessage'
            v-model='commentContent'
            auto-resize
            autofocus
            class='input-chat outline-none resize-none shadow-none w-full'
            rows='2'
            @keydown.enter.prevent='addComment'/>
        </div>

        <div class='column-gap-2 flex flex-row'>
          <ButtonIcon
            class='p-button-icon-only'
            icon='send'
            rounded
            @click='addComment'/>
        </div>
      </div>
      <!--comment-->
    </div>
  </div>
</template>

<script setup lang='ts'>
import { CompatClient, Stomp } from '@stomp/stompjs';
import { useVuelidate } from '@vuelidate/core';
import { required } from '@vuelidate/validators';
import { assign, cloneDeep, get, map } from 'lodash';
import { storeToRefs } from 'pinia';
import { onMounted, onUnmounted, reactive, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';

import { Permission } from '@/apps/admin/model/userGroup';
import { findByIdGroupIdAndIdUserIdAndIdPath } from '@/apps/ecm/api/graphql/file-folder-permission-graphql-api';
import { findFileById, turnOnOffCommentGrapdql } from '@/apps/ecm/api/graphql/file-graphql';
import { getCommentFilesGraphql } from '@/apps/ecm/api/graphql/group-graphql-api';
import { WS_CHAT_SERVER } from '@/common/api/configService';
import AppUser from '@/common/components/app/AppUser.vue';
import { DEFAULT_CHAT_LOAD_MESSAGE_SIZE, DEFAULT_PAGE_SIZE } from '@/common/constants';
import { toastSuccess } from '@/common/helpers/custom-toast-service';
import useMoment from '@/common/helpers/mixins/use-moment';
import type { GroupCommentFile } from '@/common/model/group';
import { Direction, type Pageable } from '@/common/model/query';
import { useUserStore } from '@/common/store/user';

const {
  mutate: turnOnOffCommentMutate,
  onDone: turnOnOffCommentOnDone
} = turnOnOffCommentGrapdql();
const comments = ref<GroupCommentFile[]>([]);
const route = useRoute();
const { fileId } = route.params;
const { moment } = useMoment();
const { t } = useI18n();
const statusComment = ref(false);
const pageable = reactive<Pageable>({
  page: 0,
  size: DEFAULT_CHAT_LOAD_MESSAGE_SIZE,
  sort: [{
    property: 'createdAt',
    direction: Direction.DESC
  }]
});

const {
  load: getCommentFilesLoad,
  onResult: getCommentFilesResult,
  onError: getCommentFilesError
} = getCommentFilesGraphql({
  fileId: fileId as string,
  pageable
});

const loadingMore = ref(false);
const commentContent = ref('');
const validateCommentRules = { commentContent: { required } };
const v$Comment = useVuelidate(validateCommentRules, { commentContent }, { $scope: false });
const { authentication } = storeToRefs(useUserStore());

const { user } = useUserStore();
let socket: WebSocket;
let stompClient: CompatClient;
const totalComment = ref(0);
const loadedComment = ref(0);
const manualAddComment = ref(0);
const permission = ref('');
getCommentFilesError(() => {
  loadingMore.value = false;
});
const file = ref();

findFileById(fileId as string).onResult((res) => {
  file.value = res.data.findFileById;
  statusComment.value = file.value.statusComment;
  const splitTreePath = file.value.treePath.split('/');
  findByIdGroupIdAndIdUserIdAndIdPath(splitTreePath[2], user.id as string, '/groups/' + splitTreePath[2]).onResult((response) => {
    permission.value = response.data.findByIdGroupIdAndIdUserIdAndIdPath.permission;
  });
});

getCommentFilesResult((response) => {
  const clonedResponseComments = cloneDeep(comments.value);
  const {
    totalCount,
    edges
  } = get(response, 'data.getCommentFiles', {
    totalCount: 0,
    edges: []
  });
  loadedComment.value += edges.length;
  totalComment.value = totalCount;
  manualAddComment.value = 0;
  clonedResponseComments.push(...map(edges, 'node'));
  comments.value = clonedResponseComments;
  loadingMore.value = false;
});

function loadComment() {
  getCommentFilesLoad(undefined, {
    fileId: fileId as string,
    pageable
  });
}

function turnOnOffComment() {
  turnOnOffCommentMutate({ fileId: fileId });
}

turnOnOffCommentOnDone((res) => {
  statusComment.value = res.data.turnOnOffComment.statusComment;
  toastSuccess({ message: t('ecm.fileFolder.message.statusComment', { status: t(statusComment.value ? 'ecm.fileFolder.message.turnOn' : 'ecm.fileFolder.message.turnOff') }) });
});

onMounted(() => {
  connectChatServer();
});

onUnmounted(() => {
  unsubscribeCommentFile(fileId as string);
  disconnectChatServer();
});

function connectChatServer() {
  socket = new WebSocket(WS_CHAT_SERVER);
  stompClient = Stomp.over(socket);
  stompClient.connect({ Authorization: authentication.value }, (_: string) => {
    if (fileId) {
      loadComment();
      subscribeCommentFile(fileId as string);
    }
  });
}

function disconnectChatServer() {
  stompClient?.disconnect();
  socket?.close();
}

function addComment(event: KeyboardEvent) {
  if (event.shiftKey && event.code === 'Enter' && commentContent.value) {
    commentContent.value += '\n';
  } else {
    v$Comment.value.$validate().then((isValid) => {
      if (isValid) {
        sendMessage(commentContent.value);
      }
    });
  }
}

function subscribeCommentFile(fileId: string) {
  const destination = `/group/file/${fileId}`;
  stompClient.subscribe(destination, function (response) {
    const comment: GroupCommentFile = JSON.parse(response.body);
    comments.value.unshift(comment);
    loadedComment.value += 1;
    totalComment.value += 1;
    manualAddComment.value += 1;
  }, { id: destination });
}

function unsubscribeCommentFile(fileId: string) {
  stompClient.unsubscribe(`/group/file/${fileId}`);
}

const CONVERSATION_DESTINATION = '/app/group-comment-file/send-comment';

function sendMessage(comment: string) {
  stompClient.send(CONVERSATION_DESTINATION, {}, JSON.stringify({
    content: comment,
    ...{ fileId: fileId }
  }));
  commentContent.value = '';
}

const onScroll = () => {
  const layoutContentWrapperElement = document.getElementsByClassName('topic-comment-wrapper')[0];

  if (layoutContentWrapperElement) {
    const offsetHeight = layoutContentWrapperElement.scrollHeight - layoutContentWrapperElement.clientHeight;
    const scrollTop = layoutContentWrapperElement.scrollTop;

    if (offsetHeight - offsetHeight * 0.1 >= scrollTop && !loadingMore.value && loadedComment.value < totalComment.value) {
      loadingMore.value = true;
      assign(pageable, {
        page: pageable.page + 1,
        size: manualAddComment.value ? loadedComment.value : DEFAULT_PAGE_SIZE
      });
      loadComment();
    }
  }
};
</script>

<script lang='ts'>
export default { name: 'CommentFileGroup', };
</script>