<template>
  <div
    class='p-2'
    :class='GRID_RESPONSIVE_CLASSES_MAX_8'>
    <div
      class='card cursor-pointer h-full p-0 sm:hover:surface-ground'
      @click='selectConversation'>
      <div class='h-10rem'>
        <AppAvatar
          :avatar='generateAvatarUrl(conversation.avatar)'
          :fit='true'
          :label='extractAvatarLabel(conversation.name)'
          shape='square'
          size='10'/>
      </div>

      <div class='flex flex-column px-3 py-2'>
        <div class='column-gap-2 flex flex-row justify-content-between my-1'>
          <span class='font-bold text-lg'>{{ conversation.name }}</span>
          <AppIcon
            v-tooltip='t(`ecm.chatAttachment.${conversation.isGroup ? "group" : "personal"}Conversation`)'
            :name='conversation.isGroup ? "groups" : "person"'
            size='1.5'/>
        </div>

        <span v-if='conversation.isGroup'>
          {{ t("ecm.chatAttachment.memberCount", {count: conversation.members.length}) }}
        </span>
      </div>

    </div>
  </div>
</template>

<script setup lang='ts'>
import { storeToRefs } from 'pinia';
import { type PropType } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

import { useEcmChatStore } from '@/apps/ecm/store/chat-attachments';
import { GRID_RESPONSIVE_CLASSES_MAX_8 } from '@/common/constants';
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
export default { name: 'EcmChatConversationGridItem' };
</script>

<style scoped lang='scss'>
:deep(.conversation-avatar) {
  img {
    object-fit: cover;
    border-radius: inherit;
  }
}
</style>