<template>
  <Dialog
    v-bind='DEFAULT_DIALOG_CONFIG'
    v-model:visible='dialogVisible'
    :header='t(`chat.conversation.create${isGroup ? "Group" : "1on1"}Conversation`)'
    @hide='emits("hide-dialog")'>
    <div
      v-if='isGroup'
      class='align-items-center column-gap-2 flex flex-row'>
      <Avatar
        shape='circle'
        size='large'>
        <slot name='icon'>
          <div class='p-avatar p-avatar-circle p-avatar-lg p-component'>
            <AppIcon
              name='groups'
              size='2'/>
          </div>
        </slot>
      </Avatar>

      <div class='flex-grow-1'>
        <InputText
          v-model='groupName'
          class='border-bottom-1 border-none border-noround shadow-none w-full'
          :class='{"p-invalid": v$.groupName.$errors.length}'
          name='groupName'
          :placeholder='t("chat.conversation.groupName")'/>
        <ValidateErrorMessage :errors='v$.groupName.$errors'/>
      </div>
    </div>

    <div class='flex flex-column mt-3 row-gap-2'>
      <div
        v-if='isGroup'
        class='column-gap-3 flex flex-row'>
        <SelectUser
          ref='userList'
          :member-errors='v$.members.$errors'
          :title='t("chat.conversation.addMember")'
          :users='users'
          @search-user='searchUsers'
          @select-user='selectUser'/>

        <SelectUser
          ref='memberList'
          :is-selected='true'
          :title='t("chat.conversation.selectedMembers", {count: allMember.length})'
          :users='members'
          @search-user='searchMembers'
          @select-user='selectUser'/>
      </div>

      <div v-else>
        <SelectUser
          :member-errors='v$.members.$errors'
          :members='members'
          :title='t("chat.conversation.selectMember")'
          :users='users'
          @search-user='searchUsers'
          @select-user='selectUser'/>
      </div>

    </div>

    <template #footer>
      <DialogFooter/>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { useVuelidate } from '@vuelidate/core';
import { helpers, requiredIf } from '@vuelidate/validators';
import { filter, find, indexOf, join, map } from 'lodash';
import { inject, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { createConversation } from '@/apps/chat/api/rest/conversation-api';
import { searchUser } from '@/apps/chat/api/rest/search-api';
import SelectUser from '@/apps/chat/components/conversation/SelectUser.vue';
import type { ChatConversation } from '@/apps/chat/model/chat';
import { useChatStore } from '@/apps/chat/store/chat';
import DialogFooter from '@/common/components/dialog/DialogFooter.vue';
import { DEFAULT_DIALOG_CONFIG } from '@/common/constants';
import { toastErrorData } from '@/common/helpers/custom-toast-service';
import { convertAlias } from '@/common/helpers/utils';
import { User } from '@/common/model/User';
import { useUserStore } from '@/common/store/user';

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  isGroup: {
    type: Boolean,
    default: false
  }
});

const emits = defineEmits(['hide-dialog']);
const { user: storedUser } = useUserStore();
const { conversations } = useChatStore();

const groupName = ref('');
const dialogVisible = ref(props.visible);

let all: User[] = [];
let allUser = ref<User[]>([]);
let allMember = ref<User[]>([]);
const users = ref<User[]>([]);
const members = ref<User[]>([]);

const userList = ref();
const memberList = ref();

const { t } = useI18n();

const subscribeConversation = inject('subscribe-conversation', (conversationId: string, isGroup: boolean) => {
  return {
    conversationId,
    isGroup
  };
});
const selectChatConversation = inject('select-conversation', (conversation: ChatConversation) => {
  return conversation;
});

const validateMembers = () => members.value.length > 0;

const validateRules = {
  groupName: { required: helpers.withMessage(t('chat.conversation.groupNameEmpty'), requiredIf(props.isGroup)) },
  members: { required: helpers.withMessage(t('chat.conversation.membersNotSelected'), validateMembers) }
};

const v$ = useVuelidate(validateRules, {
  groupName: groupName,
  members: members.value
});

onMounted(() => {
  searchUser('').then((response) => {
    if (typeof response === 'object') {
      all = response.filter(user => storedUser.id !== user.id);
      allUser.value = all;
      users.value = all;
    }
  });
});

function selectUser(user: User) {
  if (props.isGroup) {
    const index = indexOf(allMember.value, user);
    if (index >= 0) {
      allMember.value.splice(index, 1);
    } else {
      allMember.value.push(user);
    }
    members.value = allMember.value;

    allUser.value = filter(all, (u) => {
      return !allMember.value.includes(u);
    });
    users.value = allUser.value;

    userList.value.clearSearchInput();
    memberList.value.clearSearchInput();
  } else {
    members.value = [user];
    groupName.value = user.fullName as string;
  }
}

function searchUsers(keyword: string) {
  users.value = filter(allUser.value, user => convertAlias(user.fullName as string).includes(convertAlias(keyword)));
}

function searchMembers(keyword: string) {
  members.value = filter(allMember.value, user => convertAlias(user.fullName as string).includes(convertAlias(keyword)));
}

function validateConversation() {
  v$.value.$validate().then((isValid) => {
    if (isValid) {
      const existConversation = checkConversationExist();
      if (existConversation) {
        emits('hide-dialog');
        selectChatConversation(existConversation);
      } else {
        create();
      }
    }
  });
}

function create() {
  const formData = new FormData();
  formData.append('name', groupName.value);
  formData.append('isGroup', `${props.isGroup}`);
  // formData.append('avatar', conversation.value.name);
  formData.append('members', join(map(members.value, 'id'), ','));

  createConversation(formData).then(response => {
    if (typeof response === 'object') {
      conversations.unshift(response);
      subscribeConversation(response.id, response.isGroup);
      selectChatConversation(response);
    }
    emits('hide-dialog');
  }).catch(error => {
    toastErrorData({
      error,
      prefix: 'chat.conversation'
    });
  });
}

function checkConversationExist() {
  if (!props.isGroup) {
    return find(conversations, (conversation) => !conversation.isGroup && conversation.members.includes(members.value[0].id as string));
  }
  return null;
}

defineExpose({ validateConversation });
</script>

<script lang="ts">
export default { name: 'CreateConversationDialog' };
</script>