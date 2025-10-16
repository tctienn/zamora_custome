<template>
  <div
    class='align-items-start border-round chat-item column-gap-3 flex p-2 surface-border'>
    <div class='relative w-3rem'>
      <ChatAvatar :item='item'/>
      <!--      <Badge-->
      <!--        v-if='item.id.length % 2 === 0'-->
      <!--        class='absolute border-2 border-white bottom-0 h-1rem right-0 w-1rem'-->
      <!--        severity='success'-->
      <!--        value=''-->
      <!--      />-->
    </div>

    <div class='chat-item-info flex flex-grow-1 flex-row'>
      <div class='flex flex-column w-full'>
        <span class='font-bold line-number-1'>{{ item.name }}</span>
        <span
          v-if='item.lastMessage && Object.keys(item.lastMessage).length'
          class='line-number-1'
          style='font-family: Segoe UI Emoji,emoji'>{{ displayLastMessage() }}</span>
      </div>
    </div>

    <div class='flex flex-column w-3rem'>
      <small class='text-right'>
        {{
          item.lastMessage && Object.keys(item.lastMessage).length ?
            moment(item.lastMessage.sentAt).format(moment(item.lastMessage.sentAt).isSame(new Date(), 'day') ? 'HH:ss' : 'DD/MM') : ''
        }}
      </small>
      <div class='text-right'>
        <Badge
          v-if='item.unread'
          severity='danger'
          :value='item.unread <= 9 ? item.unread : "9+"'/>
      </div>
    </div>
  </div>
</template>

<script setup lang='ts'>
import { every } from 'lodash';
import type { PropType } from 'vue';
import { useI18n } from 'vue-i18n';

import ChatAvatar from '@/apps/chat/components/ChatAvatar.vue';
import { IMAGE_FILE_TYPES_SUPPORTED } from '@/apps/chat/constants';
import type { ChatConversation } from '@/apps/chat/model/chat';
import { MessageType } from '@/apps/chat/model/chat';
import { getFileExtension } from '@/common/helpers/file-utils';
import useMoment from '@/common/helpers/mixins/use-moment';
import { useUserStore } from '@/common/store/user';

const props = defineProps({
  item: {
    type: Object as PropType<ChatConversation>,
    required: true
  }
});
const { t } = useI18n();
const { moment } = useMoment();

const { user } = useUserStore();

function displayLastMessage() {
  const {
    isGroup,
    lastMessage
  } = props.item;
  if (typeof lastMessage === 'undefined' || lastMessage.type === MessageType[MessageType.ACTION]) {
    return '';
  }

  let prefix = '';
  if (isGroup) {
    if (lastMessage.fromUserId === user.id) {
      prefix = t('common.you');
    } else {
      prefix = lastMessage.sender as string;
    }
    prefix += ': ';
  }

  let suffix = lastMessage.content;
  if (lastMessage.attachments?.length) {
    suffix = t('chat.conversation.sentMessage', {
      count: lastMessage.attachments.length,
      type: t(`chat.conversation.${ every(lastMessage.attachments,
        (file) => file && IMAGE_FILE_TYPES_SUPPORTED.includes(getFileExtension(file.name))) ? 'imageMessage' : 'fileMessage' }`)
    });
  }

  return `${ prefix }${ suffix }`;
}
</script>

<script lang='ts'>
export default { name: 'ChatConversationItem' };
</script>