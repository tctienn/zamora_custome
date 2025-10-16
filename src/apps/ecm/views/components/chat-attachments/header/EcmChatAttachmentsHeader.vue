<template>
  <div class='align-items-center border-y-1 flex flex-row justify-content-between mx-3 py-2 surface-border'>
    <div class='align-items-center column-gap-3 flex flex-row'>
      <ButtonIcon
        icon='arrow_back'
        icon-size='2'
        rounded
        text
        @click='router.back()'/>

      <AppIcon
        :name='chatConversation["isGroup"] ? "groups" : "person"'
        size='2'></AppIcon>
      <span class='font-bold text-xl'>
        {{ chatConversation["name"] }}
        <span class='font-italic font-normal text-base'>
          ({{ t(`ecm.chatAttachment.${chatConversation["isGroup"] ? "group" : "personal"}Conversation`) }})
        </span>
      </span>
    </div>

    <div class=''>

    </div>

    <div class='column-gap-2 flex flex-row'>
      <EcmChatAttachmentsSort/>
      <EcmChatAttachmentsFilter/>
      <DataViewLayoutOptions v-model='chatAttachmentLayout'/>
    </div>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

import { useEcmChatStore } from '@/apps/ecm/store/chat-attachments';
import EcmChatAttachmentsFilter from '@/apps/ecm/views/components/chat-attachments/header/EcmChatAttachmentsFilter.vue';
import EcmChatAttachmentsSort from '@/apps/ecm/views/components/chat-attachments/header/EcmChatAttachmentsSort.vue';

const { chatConversation, chatAttachmentLayout } = storeToRefs(useEcmChatStore());

const router = useRouter();

const { t } = useI18n();
</script>

<script lang="ts">
export default { name: 'EcmChatAttachmentsHeader' };
</script>

<style scoped lang='scss'>
:deep(.filter-selection) {
  .p-dropdown-label {
    padding-top: 0.5rem;
    padding-bottom: 0.5rem;
  }
}
</style>