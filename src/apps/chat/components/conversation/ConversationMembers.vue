<template>
  <div class='flex flex-column'>
    <div
      v-if='conversation["isGroup"]'
      class='flex flex-row justify-content-end'>
      <ButtonIcon
        class='px-2 py-1 r'
        icon='add'
        :label='t("chat.conversation.addMember")'
        rounded
        text
        @click='showAddMemberDialog'/>
    </div>

    <div class='flex flex-1 flex-column overflow-auto p-2 row-gap-3'>
      <div
        v-for='member in members'
        :key='member.id'
        class='align-items-center column-gap-2 flex flex-row justify-content-between'>
        <AppUser
          avatar-size='3'
          :info-visible='true'
          :user-id='member.id'/>

        <ButtonIcon
          v-if='member.id && user["id"] !== member.id && !conversation["adminIds"].includes(member.id) &&
            conversation["adminIds"].includes(user["id"] as string)'
          class='opacity-80'
          icon='person_remove'
          rounded
          text
          @click='confirmRemoveMember(member)'/>
      </div>
    </div>

    <AddMemberDialog
      v-if='addMemberDialogVisible'
      ref='addMemberDialog'
      :visible='addMemberDialogVisible'
      @hide-dialog='hideAddMemberDialog'/>
  </div>
</template>

<script lang='ts' setup>
import { assign, filter } from 'lodash';
import { storeToRefs } from 'pinia';
import { useConfirm } from 'primevue/useconfirm';
import { onMounted, provide, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { getConversationMembers, removeConversationMember } from '@/apps/chat/api/rest/conversation-api';
import AddMemberDialog from '@/apps/chat/components/conversation/AddMemberDialog.vue';
import { useChatStore } from '@/apps/chat/store/chat';
import AppUser from '@/common/components/app/AppUser.vue';
import { User } from '@/common/model/User';
import { useUserStore } from '@/common/store/user';

const { t } = useI18n();

const addMemberDialogVisible = ref(false);
const addMemberDialog = ref();

const confirm = useConfirm();
const { user } = storeToRefs(useUserStore());
const chatStore = useChatStore();
const { conversation } = storeToRefs(chatStore);
const members = ref<User[]>([]);

const addMemberFooterButtons = {
  closeButton: {
    icon: 'close',
    label: t('common.close'),
    text: true,
    severity: 'danger',
    type: 'button',
    command: () => hideAddMemberDialog()
  },
  actionButton: {
    icon: 'save',
    label: t('common.save'),
    text: false,
    type: 'button',
    command: () => addMemberDialog.value.addMember()
  }
};
provide('dialogFooterButtons', addMemberFooterButtons);

onMounted(() => {
  if (conversation.value?.isGroup) {
    getMembers();
  }
});

function getMembers() {
  getConversationMembers(conversation.value?.id).then(response => {
    if (typeof response === 'object') {
      members.value = response;
    }
  });
}

function confirmRemoveMember(member: User) {
  confirm.require({
    message: t('chat.conversation.confirm.removeMember', { member: member.fullName }),
    header: t('common.confirm'),
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: t('common.delete'),
    acceptClass: 'p-button-danger',
    accept: () => {
      removeMember(member.id as string);
    }
  });
}

function removeMember(memberId: string) {
  if (conversation.value) {
    removeConversationMember(conversation.value?.id, memberId).then(response => {
      members.value = filter(members.value, (member) => member.id !== memberId);
      if (typeof response === 'object') {
        if (response.lastMessage) {
          chatStore.addChatHistory(response.lastMessage);
        }

        const responseConversation = assign(response, { lastMessage: conversation.value?.lastMessage });
        conversation.value = responseConversation;
        chatStore.updateConversations(responseConversation);
      }
    });
  }
}

function hideAddMemberDialog(reload = false) {
  addMemberDialogVisible.value = false;
  if (reload) {
    getMembers();
  }
}

function showAddMemberDialog() {
  addMemberDialogVisible.value = true;
}
</script>

<script lang='ts'>
export default { name: 'ConversationMembers' };
</script>
