<template>
  <div class='chat-wrapper flex grid h-screen overflow-hidden'>
    <ChatBar/>
    <ChatMain ref='chatMain'/>

  </div>
</template>

<script setup lang='ts'>
import '@/apps/chat/assets/sass/overrides/_custom_override.scss';

import { Client, StompHeaders } from '@stomp/stompjs';
import { remove } from 'lodash';
import { storeToRefs } from 'pinia';
import { onMounted, onUnmounted, provide, ref } from 'vue';

import { getConversations } from '@/apps/chat/api/rest/conversation-api';
import ChatBar from '@/apps/chat/components/ChatBar.vue';
import ChatMain from '@/apps/chat/components/ChatMain.vue';
import type { ChatConversation, ChatMessage, Message } from '@/apps/chat/model/chat';
import { type PrivateChannelMessage, PrivateChannelMessageType } from '@/apps/chat/model/chat';
import { useChatStore } from '@/apps/chat/store/chat';
import { WS_CHAT_SERVER } from '@/common/api/configService';
import { refreshToken } from '@/common/api/rest/authApi';
import EventBus from '@/common/helpers/event-bus';
import { convertBase64 } from '@/common/helpers/file-utils';
import type { Attachment } from '@/common/model';
import { useUserStore } from '@/common/store/user';

const chatMain = ref();

const { authentication } = storeToRefs(useUserStore());
const chatStore = useChatStore();
const {
  totalUnreadMessage,
  conversation,
  conversations,
  loadingConversation
} = storeToRefs(chatStore);
let stompClient: Client;

const CONVERSATION_DESTINATION = '/app/chat/send-message';

loadingConversation.value = true;

function connectChatServer() {
  stompClient = new Client({
    brokerURL: WS_CHAT_SERVER,
    connectHeaders: getHeaders(),
    onConnect: subscribePrivateChannel,
    reconnectDelay: 5000,
    onStompError: frame => {
      if (frame.headers['message'] == 'invalidJwt') {
        refreshToken().then(() => stompClient.connectHeaders = getHeaders());
        return;
      }
      stompClient.deactivate();
    },
    onWebSocketError: evt => {
    }
  });
  stompClient.activate();
}

function getHeaders(): StompHeaders {
  return { Authorization: authentication.value };
}

function disconnectChatServer() {
  stompClient?.deactivate();
}

function sendMessage(message: Message) {
  if (conversation.value) {
    stompClient.publish({
      destination: CONVERSATION_DESTINATION,
      headers: {},
      body: JSON.stringify(message)
    });
  }
}

async function sendFiles(files: FileList) {
  if (conversation.value) {
    stompClient.publish({
      destination: CONVERSATION_DESTINATION,
      headers: {},
      body: JSON.stringify({
        conversationId: conversation.value.id,
        content: '',
        files: await mapFiles(files),
      } as Message)
    });
  }
}

async function mapFiles(files: FileList): Promise<Attachment[]> {
  return await Promise.all([...files].map(async f => {
    return {
      name: f.name,
      data: (await convertBase64(f))?.toString() ?? '',
      size: f.size
    };
  }));
}

function subscribeConversation(conversationId: string, isGroup: boolean) {
  const destination = `/chat/${isGroup ? 'group' : 'user'}/${conversationId}`;
  stompClient.subscribe(destination, function (response) {
    const message: ChatMessage = JSON.parse(response.body);
    if (message.conversationId === conversation.value?.id) {
      chatStore.addChatHistory(message);
    } else {
      totalUnreadMessage.value++;
    }
    chatStore.updateConversationMessage(message);
    chatMain.value.resetReplyMessage();
  }, { id: destination });
}

function unsubscribeConversation(conversation: ChatConversation) {
  const {
    isGroup,
    id
  } = conversation;
  stompClient.unsubscribe(`/chat/${isGroup ? 'group' : 'user'}/${id}`);
}

function subscribePrivateChannel() {
  stompClient.subscribe('/user/channel/private', function (response) {
    const message: PrivateChannelMessage = JSON.parse(response.body);
    const {
      type,
      metadata: conversation
    } = message;

    if ([PrivateChannelMessageType[PrivateChannelMessageType.NEW_CONVERSATION], PrivateChannelMessageType[PrivateChannelMessageType.SUBSCRIBE]].includes(type)) {
      conversations.value.unshift(conversation);
      subscribeConversation(conversation.id, conversation.isGroup);
    }

    if (type === PrivateChannelMessageType[PrivateChannelMessageType.UNSUBSCRIBE]) {
      remove(conversations.value, (con) => con.id === conversation.id);
      unsubscribeConversation(conversation);
    }
  });
}

function loadConversations() {
  getConversations().then((response) => {
    conversations.value = response as ChatConversation[];
    totalUnreadMessage.value = 0;
    conversations.value
      .forEach(conversation => {
        subscribeConversation(conversation.id, conversation.isGroup);
        totalUnreadMessage.value += conversation.unread;
      });
  }).catch((error) => {
    // toastError({ message: error });
  }).finally(() => {
    loadingConversation.value = false;
  });
}

provide('chat-send-files', sendFiles);
provide('subscribe-conversation', subscribeConversation);

onMounted(() => {
  const layoutContent = document.getElementsByClassName('layout-content');
  if (layoutContent?.length) {
    layoutContent[0].classList.add('overflow-hidden');
  }
  EventBus.on('send-message', sendMessage);
  connectChatServer();
  setTimeout(loadConversations, 200);
});

onUnmounted(() => {
  const layoutContent = document.getElementsByClassName('layout-content');
  if (layoutContent?.length) {
    layoutContent[0].classList.remove('overflow-hidden');
  }

  EventBus.off('send-message', sendMessage);
  disconnectChatServer();
});

</script>

<script lang='ts'>
export default { name: 'AppChat' };
</script>