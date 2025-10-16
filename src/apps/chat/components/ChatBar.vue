<template>
  <div class='col-3 h-full m-0 p-2 relative'>
    <AppLoader
      v-if='loadingConversation'
      :size='10'/>

    <template v-else>
      <ChatSearch
        :search-visible='searchVisible'
        @switch-search='switchSearch'/>

      <ChatSearchResult v-if='searchVisible'/>
      <ChatBarTabView v-else/>
    </template>
  </div>
</template>

<script setup lang='ts'>
import { assign, cloneDeep, find } from 'lodash';
import { storeToRefs } from 'pinia';
import { onMounted, provide, ref } from 'vue';
import { useRoute } from 'vue-router';

import { getConversationHistory } from '@/apps/chat/api/rest/chat-api';
import { readConversation } from '@/apps/chat/api/rest/conversation-api';
import ChatSearch from '@/apps/chat/components/search/ChatSearch.vue';
import ChatSearchResult from '@/apps/chat/components/search/ChatSearchResult.vue';
import ChatBarTabView from '@/apps/chat/components/sidebar/ChatBarTabView.vue';
import type { ChatConversation, ChatMessage } from '@/apps/chat/model/chat';
import { useChatStore } from '@/apps/chat/store/chat';
import { useChatSearchStore } from '@/apps/chat/store/chat-search';
import { DEFAULT_CHAT_LOAD_MESSAGE_SIZE } from '@/common/constants';
import { type RestPageable } from '@/common/model/query';

const chatStore = useChatStore();
const chatSearchStore = useChatSearchStore();
const {
  totalUnreadMessage,
  conversations,
  conversation,
  chatHistories,
  loadingConversation,
  loadingHistory,
  chatPageable
} = storeToRefs(chatStore);
const { searchKeyword } = storeToRefs(chatSearchStore);

const route = useRoute();
let { conversationId } = route.params;

const searchVisible = ref(false);

const pageable = {
  page: 0,
  size: DEFAULT_CHAT_LOAD_MESSAGE_SIZE,
  sort: 'time,desc'
};

onMounted(() => {
  if (conversationId) {
    const conversation = find(conversations.value, ['id', conversationId]);
    if (conversation) {
      switchConversation(conversation);
    }
  } else {
    conversation.value = {} as ChatConversation;
  }
});

function switchConversation(item: ChatConversation) {
  conversation.value = item;
  if (conversationId != item.id) {
    loadHistory(item);
    loadingHistory.value = true;
  }

  const hrefWithoutConversationId = window.location.href.replace(conversationId as string, '');
  const newUrl = `${hrefWithoutConversationId}${hrefWithoutConversationId.endsWith('/') ? '' : '/'}${item.id}`;
  history.pushState({}, '', newUrl);
  conversationId = item.id;
}

function loadHistory(item: ChatConversation) {
  getConversationHistory({
    conversationId: item.id,
    ...pageable
  }).then((response: void | RestPageable<ChatMessage>) => {
    updateHistories(cloneDeep(response));
    markAsRead(item);
  }).finally(() => {
    searchVisible.value = false;
    const itemElement = document.getElementById(`conversation_${item.id}`);
    if (itemElement) {
      itemElement.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest'
      });
    }
  });
}

provide('select-conversation', switchConversation);

function updateHistories(response: void | RestPageable<ChatMessage>) {
  if (typeof response === 'object') {
    chatHistories.value = response.content;
    chatPageable.value = assign(response, { content: [] });
  }
}

function markAsRead(item: ChatConversation) {
  loadingHistory.value = false;
  readConversation(item.id).then(() => {
    chatStore.markAsReadConversation(item.id, item.isGroup);
    totalUnreadMessage.value -= item.unread;
  });
}

function switchSearch(visible: null | boolean) {
  searchVisible.value = typeof visible === 'undefined' || visible === null ? !searchVisible.value : visible;
  if (searchVisible.value) {
    chatSearchStore.search();
  } else {
    searchKeyword.value = '';
  }
}
</script>

<script lang='ts'>
export default { name: 'ChatBar' };
</script>