<template>
  <Dialog
    v-bind='DEFAULT_DIALOG_CONFIG'
    v-model:visible='dialogVisible'
    :header='t(`chat.conversation.addMember`)'
    @hide='emits("hide-dialog")'>

    <SelectUser
      :members='members'
      :title='t("chat.conversation.selectMember")'
      :users='users'
      @search-user='searchUsers'
      @select-user='selectUser'/>

    <template #footer>
      <DialogFooter/>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { assign, filter, findIndex } from 'lodash';
import { storeToRefs } from 'pinia';
import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { addConversationMembers } from '@/apps/chat/api/rest/conversation-api';
import { searchUser } from '@/apps/chat/api/rest/search-api';
import SelectUser from '@/apps/chat/components/conversation/SelectUser.vue';
import { useChatStore } from '@/apps/chat/store/chat';
import DialogFooter from '@/common/components/dialog/DialogFooter.vue';
import { DEFAULT_DIALOG_CONFIG } from '@/common/constants';
import { convertAlias } from '@/common/helpers/utils';
import { User } from '@/common/model/User';
import { useUserStore } from '@/common/store/user';

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  }
});

const emits = defineEmits(['hide-dialog']);
const { user: storedUser } = useUserStore();
const chatStore = useChatStore();
const { conversation } = storeToRefs(chatStore);

const dialogVisible = ref(props.visible);

let allUser = ref<User[]>([]);
const users = ref<User[]>([]);
const members = ref<User[]>([]);

const { t } = useI18n();

onMounted(() => {
  searchUser('').then((response) => {
    if (typeof response === 'object') {
      allUser.value = response.filter(user => storedUser.id !== user.id && !conversation.value?.members.includes(user.id as string));
      users.value = allUser.value;
    }
  });
});

function selectUser(user: User) {
  const userIndex = findIndex(members.value, ['id', user.id]);
  if (userIndex >= 0) {
    members.value.splice(userIndex, 1);
  } else {
    members.value.push(user);
  }
}

function searchUsers(keyword: string) {
  users.value = filter(allUser.value, user => convertAlias(user.fullName as string).includes(convertAlias(keyword)));
}

function addMember() {
  if (conversation.value) {
    addConversationMembers(conversation.value.id, members.value.map((member) => member.id as string)).then(response => {
      if (typeof response === 'object') {
        if (response.lastMessage) {
          chatStore.addChatHistory(response.lastMessage);
        }

        const responseConversation = assign(response, { lastMessage: conversation.value?.lastMessage });
        conversation.value = responseConversation;
        chatStore.updateConversations(responseConversation);

        emits('hide-dialog', true);
      }
    });
  }
}

defineExpose({ addMember });
</script>

<script lang="ts">
export default { name: 'AddMemberDialog' };
</script>