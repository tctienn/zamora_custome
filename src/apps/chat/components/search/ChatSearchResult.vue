<template>
  <TabView
    v-model:activeIndex='searchType'
    class='chat-tab h-full'
    lazy>
    <TabPanel :header='t("chat.conversation.conversation")'>
      <ConversationSearchResult/>
    </TabPanel>
    <TabPanel :header='t("common.user")'>
      <UserSearchResult/>
    </TabPanel>
    <TabPanel :header='t("common.group")'>
      <GroupSearchResult/>
    </TabPanel>
    <TabPanel :header='t("chat.conversation.message")'>
      <MessageSearchResult/>
    </TabPanel>
  </TabView>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useI18n } from 'vue-i18n';

import ConversationSearchResult from '@/apps/chat/components/search/ConversationSearchResult.vue';
import GroupSearchResult from '@/apps/chat/components/search/GroupSearchResult.vue';
import MessageSearchResult from '@/apps/chat/components/search/MessageSearchResult.vue';
import UserSearchResult from '@/apps/chat/components/search/UserSearchResult.vue';
import { useChatSearchStore } from '@/apps/chat/store/chat-search';

const chatSearchStore = useChatSearchStore();
const { searchType } = storeToRefs(chatSearchStore);
const { t } = useI18n();
</script>

<script lang="ts">

export default { name: 'ChatSearchResult' };
</script>