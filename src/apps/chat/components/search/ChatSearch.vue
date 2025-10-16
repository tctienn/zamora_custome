<template>
  <div class='column-gap-2 flex flex-row mb-3 sticky top-0'>
    <div class='align-items-center flex justify-content-center w-3rem'>
      <ButtonIcon
        v-if='searchVisible'
        icon='keyboard_backspace'
        icon-size='1.7'
        rounded
        text
        @click='emits("switch-search")'/>
    </div>

    <IconField class='w-full'>
      <InputIcon>
        <i class='pi pi-search'/>
      </InputIcon>
      <InputText
        v-model='searchKeyword'
        class='border-round-3xl pl-3 w-full'
        :placeholder='t("common.search")'
        @focus='emits("switch-search", true)'
        @keydown.enter='chatSearchStore.search()'/>
    </IconField>

    <div class='align-items-center flex justify-content-center w-3rem'>
      <ButtonIcon
        icon='add'
        icon-size='1.7'
        rounded
        text
        @click='toggleActionMenu'/>
    </div>
  </div>

  <CreateConversationDialog
    v-if='createConversationDialogVisible'
    ref='createConversationDialog'
    :is-group='isCreateGroup'
    :visible='createConversationDialogVisible'
    @hide-dialog='hideCreateConversationDialog'/>

  <Menu
    ref='menuAction'
    :model='menuActions'
    :popup='true'>
    <template #item='{item: {icon, label}}'>
      <MenuItem
        :icon='icon'
        :label='label'/>
    </template>
  </Menu>
</template>

<script setup lang='ts'>
import { storeToRefs } from 'pinia';
import { provide, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import CreateConversationDialog from '@/apps/chat/components/conversation/CreateConversationDialog.vue';
import { useChatSearchStore } from '@/apps/chat/store/chat-search';

defineProps({
  searchVisible: {
    type: Boolean,
    default: false
  }
});
const emits = defineEmits(['switch-search']);
const { t } = useI18n();
const chatSearchStore = useChatSearchStore();
const { searchKeyword } = storeToRefs(chatSearchStore);

const createConversationDialogVisible = ref(false);
const isCreateGroup = ref(false);
const createConversationDialog = ref();

function showCreateConversationDialog() {
  createConversationDialogVisible.value = true;
}

function hideCreateConversationDialog() {
  createConversationDialogVisible.value = false;
}

const createConversationFooterButtons = {
  closeButton: {
    icon: 'close',
    label: t('common.close'),
    text: true,
    severity: 'danger',
    type: 'button',
    command: () => hideCreateConversationDialog()
  },
  actionButton: {
    icon: 'save',
    label: t('common.save'),
    text: false,
    type: 'button',
    command: () => createConversationDialog.value.validateConversation()
  }
};
provide('dialogFooterButtons', createConversationFooterButtons);

const menuAction = ref();
const menuActions = [
  {
    label: t('chat.conversation.create1on1Conversation'),
    icon: 'partner_exchange',
    command: () => {
      isCreateGroup.value = false;
      showCreateConversationDialog();
    }
  },
  {
    label: t('chat.conversation.createGroupConversation'),
    icon: 'groups',
    command: () => {
      isCreateGroup.value = true;
      showCreateConversationDialog();
    }
  }
];

function toggleActionMenu(event: Event) {
  menuAction.value.toggle(event);
}

</script>

<script lang='ts'>
export default { name: 'ChatSearch' };
</script>