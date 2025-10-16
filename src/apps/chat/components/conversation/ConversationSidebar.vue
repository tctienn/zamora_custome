<template>
  <div class='border-left-3 flex flex-column surface-border w-20rem'>
    <div
      class='align-items-center flex flex-column justify-content-center p-2 row-gap-2'>
      <ChatAvatar
        :item='conversation'
        size='10'/>
      <InputText
        v-if='conversationInputNameVisible'
        ref='conversationInputName'
        v-model='conversationName'
        class='align-self-stretch border-bottom-1 border-none mx-3 shadow-none text-center'
        :placeholder='conversation["name"]'
        @blur='changeConversationName'
        @keyup.enter='changeConversationName'/>
      <span
        v-else
        class='p-2 text-center text-xl word-break-break-word'
        @dblclick='showConversationInputName'><strong>{{ conversation["name"] }}</strong></span>
    </div>

    <TabView
      class='chat-tab h-full'
      lazy>
      <TabPanel
        v-if='conversation["isGroup"]'
        :header='t("chat.conversation.member")'>
        <ConversationMembers/>
      </TabPanel>
      <TabPanel :header='t("chat.conversation.attachment")'>
        <ConversationAttachments/>
      </TabPanel>
      <TabPanel :header='t("chat.conversation.link")'>
        <ConversationLinks/>
      </TabPanel>
    </TabView>

    <div
      v-if='!conversation["isGroup"] || (conversation["isGroup"] &&
        conversation["adminIds"].includes(user["id"] as string))'
      class='border-top-1 surface-border text-center'>
      <ButtonIcon
        class='align-content-center w-full'
        icon='delete'
        :label='t("chat.conversation.deleteConversation")'
        severity='danger'
        text
        @click='confirmDeleteChatConversation'/>
    </div>
  </div>
</template>

<script setup lang='ts'>
import { isEmpty } from 'lodash';
import { storeToRefs } from 'pinia';
import { useConfirm } from 'primevue/useconfirm';
import { nextTick, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { deleteConversation, updateConversationName } from '@/apps/chat/api/rest/conversation-api';
import ChatAvatar from '@/apps/chat/components/ChatAvatar.vue';
import ConversationAttachments from '@/apps/chat/components/conversation/ConversationAttachments.vue';
import ConversationLinks from '@/apps/chat/components/conversation/ConversationLinks.vue';
import ConversationMembers from '@/apps/chat/components/conversation/ConversationMembers.vue';
import type { ChatConversation } from '@/apps/chat/model/chat';
import { useChatStore } from '@/apps/chat/store/chat';
import { toastError, toastSuccess } from '@/common/helpers/custom-toast-service';
import { useUserStore } from '@/common/store/user';

const { t } = useI18n();
const confirm = useConfirm();

const { user } = storeToRefs(useUserStore());

const chatStore = useChatStore();
const { conversation } = storeToRefs(chatStore);

const conversationInputNameVisible = ref(false);
const conversationInputName = ref();
const conversationName = ref(conversation.value.name);

function confirmDeleteChatConversation() {
  confirm.require({
    message: t('chat.conversation.confirm.deleteConversation'),
    header: t('common.confirm'),
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: t('common.delete'),
    acceptClass: 'p-button-danger',
    accept: () => {
      deleteChatConversation();
    }
  });
}

function deleteChatConversation() {
  deleteConversation(conversation.value.id).then(() => {
    conversation.value = {} as ChatConversation;
  });
}

function showConversationInputName() {
  conversationInputNameVisible.value = true;
  nextTick(() => {
    conversationInputName.value.$el.focus();
  });
}

function changeConversationName() {
  if (!isEmpty(conversationName.value) && conversation.value.name !== conversationName.value) {
    updateConversationName(conversation.value.id, conversationName.value).then((response) => {
      conversation.value.name = conversationName.value;
      conversationInputNameVisible.value = false;
      chatStore.updateConversations(response as ChatConversation);

      toastSuccess({});
    }).catch(() => {
      toastError({});
    });
  } else {
    conversationInputNameVisible.value = false;
  }
}

</script>

<script lang='ts'>
export default { name: 'ConversationSidebar' };
</script>