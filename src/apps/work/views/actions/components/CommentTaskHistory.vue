<template>
  <div
    class='chat-history flex flex-column-reverse flex-grow-1 justify-content-start overflow-auto overflow-y-scroll px-2 w-full'
    style='height: 300px'
    @scroll='onScroll'>
    <div
      v-for='(taskComment,key) in props.taskComments'
      :key='key'
      class='align-items-center flex w-full'>
      <div
        class='col-2'>
        <AppAvatar
          :avatar='generateChatAttachmentDownloadUrl("")'
          :label='taskComment.objectId'/>
      </div>
      <div class='col-10'>
        {{ taskComment.content }}
      </div>
    </div>
  </div>

  <MessageActionMenu ref='messageActionMenu'/>
</template>

<script setup lang='ts'>
import { inject, type PropType, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import MessageActionMenu from '@/apps/chat/components/history/MessageActionMenu.vue';
import type { Comment } from '@/apps/work/model/exchangeLog';
import { generateChatAttachmentDownloadUrl } from '@/common/helpers/file-utils';
import { User } from '@/common/model/User';

const props = defineProps({
  taskComments: {
    type: Array as PropType<Comment[]>,
    required: true
  },
  totalMessage: {
    type: Number,
    required: true
  },
  lengthChatHistory: {
    type: Number,
    required: true
  }
});

const emits = defineEmits(['loadMore']);

const users = inject('all-active-user', ref<User[]>([]));
const { t } = useI18n();
const messages = ref(props.taskComments);
const loadingMore = ref(false);

function onScroll(event: Event) {
  let { scrollTop, scrollHeight, clientHeight, offsetHeight } = event.target as HTMLElement;
  if (offsetHeight - scrollHeight >= scrollTop - scrollHeight * 0.1 && !loadingMore.value
      && props.totalMessage && props.lengthChatHistory < props.totalMessage) {
    loadingMore.value = true;
    emits('loadMore');
  }
}
</script>

<script lang='ts'>
export default { name: 'CommentTaskHistory' };
</script>

<style>
.message-spacer {
  background-color: transparent;
}
</style>