<template>
  <EcmChatAttachmentsHeader/>

  <div
    class='ecm-storage h-full'>
    <DataView
      class='ecm-full-content'
      data-key='id'
      :layout='chatAttachmentLayout'
      lazy
      :value='chatAttachments'>
      <template #empty>
        <div class='my-3 text-center'>
          <span>{{t("ecm.chatAttachment.noAttachments")}}</span>
        </div>
      </template>

      <template #list='{items}'>
        <div
          v-for='(data, index) in items'
          :key='index'>
          <div
            v-if='!index'
            class='flex w-full'>
            <div
              class='flex font-bold'
              style='width: calc(100% - 5rem);'>
              <div class='col-6 pl-6'>{{ t('ecm.storage.name') }}</div>
              <div class='col-2 text-center'>{{ t('ecm.chatAttachment.sender') }}</div>
              <div class='col-2 text-center'>{{ t('ecm.chatAttachment.sentAt') }}</div>
              <div class='col-2 text-center'>{{ t("ecm.storage.fileSize") }}</div>
            </div>
            <div class='w-5rem'></div>
          </div>
          <EcmChatAttachmentItem
            v-if='filterAttachment(data)'
            :attachment='data'/>
        </div>

      </template>

      <template #grid='{items}'>
        <div
          v-for='data in items'
          :key='data.id'>
          <EcmChatAttachmentItem
            v-if='filterAttachment(data)'
            :attachment='data'/>
        </div>

      </template>
    </DataView>
  </div>

  <EcmChatAttachmentActionMenu ref='actionMenu'/>
  <EcmChatAttachmentGroupDialog
    v-if='groupDialogVisible'
    :visible='groupDialogVisible'
    @hide-dialog='hideGroupDialog'/>
</template>

<script setup lang='ts'>
import { assign, cloneDeep, forEach, get, isEmpty } from 'lodash';
import { storeToRefs } from 'pinia';
import { onMounted, onUnmounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';

import { getChatConversationAttachmentsGraphql } from '@/apps/ecm/api/graphql/chat-graphql';
import type { ChatAttachment } from '@/apps/ecm/model/chat';
import { useEcmChatStore } from '@/apps/ecm/store/chat-attachments';
import EcmChatAttachmentsHeader from '@/apps/ecm/views/components/chat-attachments/header/EcmChatAttachmentsHeader.vue';
import EcmChatAttachmentItem from '@/apps/ecm/views/components/chat-attachments/items/EcmChatAttachmentItem.vue';
import EcmChatAttachmentActionMenu
  from '@/apps/ecm/views/components/chat-attachments/menu/EcmChatAttachmentActionMenu.vue';
import EcmChatAttachmentGroupDialog
  from '@/apps/ecm/views/components/chat-attachments/menu/EcmChatAttachmentGroupDialog.vue';
import { FILE_TYPES } from '@/common/constants';
import EventBus from '@/common/helpers/event-bus';
import { getFileExtension } from '@/common/helpers/file-utils';

const { t } = useI18n();
const route = useRoute();
const { conversationId } = route.query;

const {
  chatAttachments,
  chatAttachmentFileTypeFilter,
  chatAttachmentLayout,
} = storeToRefs(useEcmChatStore());

if (!isEmpty(conversationId)) {
  const { onResult: getChatConversationAttachmentsResult } = getChatConversationAttachmentsGraphql(conversationId as string);

  getChatConversationAttachmentsResult((response) => {
    chatAttachments.value = forEach(get(cloneDeep(response), 'data.chatConversationAttachments', []), (attachment) => {
      assign(attachment, { extension: getFileExtension(attachment.name) });
    });
  });
}

function filterAttachment(attachment: ChatAttachment) {
  return !chatAttachmentFileTypeFilter.value || FILE_TYPES.get(chatAttachmentFileTypeFilter.value?.value)?.includes(attachment.extension);
}

const actionMenu = ref();

function toggleMenu(event: Event) {
  actionMenu.value.toggleMenu(event);
}

const groupDialogVisible = ref(false);

function showGroupDialog() {
  groupDialogVisible.value = true;
}

function hideGroupDialog() {
  groupDialogVisible.value = false;
}

onMounted(() => {
  EventBus.on('toggle-chat-attachment-menu', toggleMenu);
  EventBus.on('show-group-dialog', showGroupDialog);
});

onUnmounted(() => {
  EventBus.off('toggle-chat-attachment-menu', toggleMenu);
  EventBus.off('show-group-dialog', showGroupDialog);
});
</script>

<script lang='ts'>
export default { name: 'EcmChatAttachments' };
</script>