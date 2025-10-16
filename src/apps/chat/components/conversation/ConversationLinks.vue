<template>
  <div class='flex flex-column p-2 row-gap-2'>
    <div
      v-for='link in links'
      :key='link.id'
      class='column-gap-2 cursor-pointer flex flex-row'>
      <ChatAvatar :item='link'/>
      <div class='flex flex-column row-gap-1'>
        <LinkMessage
          class='link-message'
          :item='link'/>
        <small>
          {{ moment(link.sentAt).fromNow() }}
        </small>
      </div>
    </div>
  </div>
</template>

<script setup lang='ts'>
import * as linkify from 'linkifyjs';
import { map, omit } from 'lodash';
import { storeToRefs } from 'pinia';
import { computed } from 'vue';

import ChatAvatar from '@/apps/chat/components/ChatAvatar.vue';
import LinkMessage from '@/apps/chat/components/history/messages/LinkMessage.vue';
import { type ChatMessage, MessageType } from '@/apps/chat/model/chat';
import { useChatStore } from '@/apps/chat/store/chat';
import useMoment from '@/common/helpers/mixins/use-moment';

const { moment } = useMoment();
const chatStore = useChatStore();
const { chatHistories } = storeToRefs(chatStore);

const links = computed<ChatMessage[]>(() => {
  return map(chatHistories.value.filter((message) => {
    return message.type === MessageType[MessageType.MESSAGE] && linkify.find(message.content).length;
  }), (message) => {
    return omit(message, 'replyMessage');
  });
});

</script>

<script lang='ts'>
export default { name: 'ConversationLinks' };
</script>

<style scoped lang='scss'>
:deep(.link-message) {
  span a.underline {
    color: var(--primary-color) !important;
  }
}
</style>