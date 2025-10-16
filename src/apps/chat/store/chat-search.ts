import { filter, reject } from 'lodash';
import { defineStore, storeToRefs } from 'pinia';
import { ref, watch } from 'vue';

import { searchGroupUserIn, searchMessage, searchUser } from '@/apps/chat/api/rest/search-api';
import type { ChatConversation } from '@/apps/chat/model/chat';
import type { Group } from '@/apps/chat/model/group';
import { useChatStore } from '@/apps/chat/store/chat';
import { convertAlias } from '@/common/helpers/utils';
import { User } from '@/common/model/User';
import { useUserStore } from '@/common/store/user';

export const useChatSearchStore = defineStore('chat-search', () => {
  const searchType = ref(0);
  const searchKeyword = ref('');
  const conversationResults = ref<ChatConversation[]>([]);
  const userResults = ref<User[]>([]);
  const groupResults = ref<Group[]>([]);
  const messageResults = ref<ChatConversation[]>([]);

  const { conversations } = storeToRefs(useChatStore());
  const { user } = storeToRefs(useUserStore());

  function searchChatConversation() {
    conversationResults.value = filter(conversations.value, conversation => convertAlias(conversation.name as string).includes(convertAlias(searchKeyword.value)));
  }

  function searchChatUser() {
    searchUser(searchKeyword.value).then(response => {
      if (typeof response === 'object') {
        userResults.value = reject(response, ['id', user.value.id]);
      }
    });
  }

  function searchChatGroup() {
    searchGroupUserIn(searchKeyword.value).then(response => {
      if (typeof response === 'object') {
        groupResults.value = response;
      }
    });
  }

  function searchChatMessage() {
    searchMessage(searchKeyword.value).then(response => {
      if (typeof response === 'object') {
        messageResults.value = response;
      }
    });
  }

  function search() {
    switch (searchType.value) {
    case 0:
      searchChatConversation();
      break;
    case 1:
      searchChatUser();
      break;
    case 2:
      searchChatGroup();
      break;
    case 3:
      searchChatMessage();
      break;
    default:
      break;
    }
  }

  watch(() => searchType.value, () => {
    search();
  });

  return {
    searchType,
    conversationResults,
    userResults,
    groupResults,
    messageResults,
    search,
    searchKeyword
  };
});