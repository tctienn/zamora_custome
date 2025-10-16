<template>
  <div
    class='cursor-pointer flex flex-row sm:hover:surface-ground w-full'
    @click='selectConversation'>
    <div class='align-items-center col-6 column-gap-2 flex flex-row'>
      <AppAvatar
        :avatar='generateAvatarUrl(conversation.avatar)'
        :label='extractAvatarLabel(conversation.name)'
        shape='square'
        size='2'/>
      <span class='font-bold'>
        {{ conversation.name }}
      </span>
    </div>

    <div class='col-2 text-center'>
      {{ conversation.totalAttachment }}
    </div>

    <div class='col-2 text-center'>
      <template v-if='conversation.isGroup'>
        {{ conversation.members.length }}
      </template>
    </div>

    <div class='col-2 text-center'>
      {{ t(`ecm.chatAttachment.${conversation.isGroup ? "group" : "personal"}Conversation`) }}
    </div>
  </div>

</template>

<script setup lang='ts'>
import { storeToRefs } from 'pinia';
import { type PropType } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

import { useEcmChatStore } from '@/apps/ecm/store/chat-attachments';
import { generateAvatarUrl } from '@/common/helpers/file-utils';
import { extractAvatarLabel } from '@/common/helpers/utils';
import type { ChatConversation } from '@/common/model';

const props = defineProps({
  conversation: {
    type: Object as PropType<ChatConversation>,
    default: {} as ChatConversation
  }
});

const { t } = useI18n();
const router = useRouter();

const { chatConversation } = storeToRefs(useEcmChatStore());

function selectConversation() {
  chatConversation.value = props.conversation;
  router.push({
    name: 'EcmPersonalDocumentsAttachments',
    query: { conversationId: props.conversation?.id }
  });
}

</script>

<script lang='ts'>
export default { name: 'EcmChatConversationListItem' };
</script>

<style scoped lang='scss'>
:deep(.conversation-avatar) {
  img {
    object-fit: cover;
    border-radius: inherit;
  }
}
</style>