<template>
  <div class='align-items-center flex flex-row justify-content-between my-1'>
    <h5 class='m-0 ml-2'>{{ t("ecm.chatAttachment.listConversation") }}</h5>
    <DataViewLayoutOptions v-model='chatConversationLayout' />
  </div>

  <DataView
    data-key='id'
    :layout='chatConversationLayout'
    lazy
    :value='chatConversations' >
    <template #list='{items}'>
      <div
        v-for='(data, index) in items'
        :key='index'>
        <div
          v-if='!index'
          class='flex flex-row font-bold w-full'>
          <div class='col-6 text-center'> {{ t("ecm.chatAttachment.name") }}</div>
          <div class='col-2 text-center'> {{ t("ecm.chatAttachment.totalAttachment") }}</div>
          <div class='col-2 text-center'> {{ t("ecm.chatAttachment.member") }}</div>
          <div class='col-2 text-center'> {{ t("ecm.chatAttachment.type") }}</div>
        </div>
        <EcmChatConversationItem
          :conversation='data'
          :layout='chatConversationLayout'/>
      </div>
    </template>

    <template #grid='{items}'>
      <div
        v-for='data in items'
        :key='data.id'>
        <EcmChatConversationItem
          :conversation='data'
          :layout='chatConversationLayout'/>
      </div>
    </template>
  </DataView>
</template>

<script setup lang="ts">
import { get } from 'lodash';
import { storeToRefs } from 'pinia';
import { useI18n } from 'vue-i18n';

import { getChatConversationsGraphql } from '@/apps/ecm/api/graphql/chat-graphql';
import { useEcmChatStore } from '@/apps/ecm/store/chat-attachments';
import EcmChatConversationItem from '@/apps/ecm/views/components/chat-attachments/items/EcmChatConversationItem.vue';

const { chatConversations, chatConversationLayout } = storeToRefs(useEcmChatStore());

const { onResult: getChatConversationsResult } = getChatConversationsGraphql();

getChatConversationsResult((response) => {
  chatConversations.value = get(response, 'data.chatConversations', []);
});

const { t } = useI18n();
</script>

<script lang="ts">
export default { name: 'EcmChatConversations' };
</script>