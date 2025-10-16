<template>
  <ContextMenu
    ref='actionMenu'
    :model='actions'
    :popup='true'>
    <template #item='{item: {icon, label}}'>
      <MenuItem
        :icon='icon'
        icon-size='1.25'
        :label='label'/>
    </template>
  </ContextMenu>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import type { MenuItem } from 'primevue/menuitem';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

import { saveChatAttachmentToPersonnelGraphql } from '@/apps/ecm/api/graphql/chat-graphql';
import { useEcmChatStore } from '@/apps/ecm/store/chat-attachments';
import { toastError, toastSuccess } from '@/common/helpers/custom-toast-service';
import EventBus from '@/common/helpers/event-bus';
import { downloadFileUrl, generateChatAttachmentDownloadUrl } from '@/common/helpers/file-utils';

const router = useRouter();
const { t } = useI18n();
let { chatSelectedAttachments } = storeToRefs(useEcmChatStore());

const actionMenu = ref();
const actions: MenuItem[] = [
  {
    label: t('ecm.storage.fileFolderActions.open'),
    icon: 'file_open',
    command: viewAttachment
  },
  {
    label: t('ecm.storage.fileFolderActions.download'),
    icon: 'download',
    command: downloadAttachment
  },
  {
    label: t('ecm.chatAttachment.actions.saveToPersonnel'),
    icon: 'person',
    command: saveAttachmentToPersonnel
  },
  {
    label: t('ecm.chatAttachment.actions.saveToGroup'),
    icon: 'groups',
    command: () => EventBus.emit('show-group-dialog')
  }
];

function toggleMenu(event: Event) {
  actionMenu.value.show(event);
}

function viewAttachment() {
  if (chatSelectedAttachments.value.length) {
    const attachment = chatSelectedAttachments.value[0];
    router.push({
      name: 'ChatAttachmentViewer',
      params: { attachmentId: attachment.id }
    });
  }
}

function downloadAttachment() {
  if (chatSelectedAttachments.value.length) {
    const attachment = chatSelectedAttachments.value[0];
    const fileUrl = generateChatAttachmentDownloadUrl(attachment.path);
    if(fileUrl) {
      downloadFileUrl(fileUrl, attachment.name);
    }
  }
}

function saveAttachmentToPersonnel() {
  if (chatSelectedAttachments.value.length) {
    const attachment = chatSelectedAttachments.value[0];
    const {
      mutate: saveChatAttachmentToPersonnelMutate,
      onDone: saveChatAttachmentToPersonnelDone,
      onError: saveChatAttachmentToPersonnelError
    } = saveChatAttachmentToPersonnelGraphql();

    saveChatAttachmentToPersonnelMutate({ attachmentId: attachment.id });

    saveChatAttachmentToPersonnelDone(() => {
      toastSuccess({});
    });

    saveChatAttachmentToPersonnelError((error) => {
      toastError({ message: error.message });
    });
  }
}

defineExpose({ toggleMenu });
</script>

<script lang="ts">
export default { name: 'EcmChatAttachmentActionMenu' };
</script>