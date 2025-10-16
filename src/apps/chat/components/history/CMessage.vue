<template>
  <div
    class='cursor-pointer flex flex-column max-w-75 message row-gap-2'
    @contextmenu='toggleActionMenu'>
    <CUpload
      v-if='item.upload'
      :id='item.id'/>

    <span
      v-else-if='item.isDeleted'
      class='align-items-center column-gap-1 flex flex-row justify-content-center'>
      {{ t('chat.conversation.deletedMessage') }}
      <AppIcon name='warning'/>
    </span>

    <template v-else>
      <component
        :is='messageType'
        :item='item'/>
      <small
        class='font-italic opacity-70 text-right'>{{ moment(item.sentAt).fromNow() }}</small>
    </template>
  </div>
</template>

<script lang='ts' setup>
import * as linkify from 'linkifyjs';
import { every } from 'lodash';
import { onMounted, type PropType, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import CUpload from '@/apps/chat/components/history/upload/CUpload.vue';
import { IMAGE_FILE_TYPES_SUPPORTED } from '@/apps/chat/constants';
import type { ChatMessage } from '@/apps/chat/model/chat';
import EventBus from '@/common/helpers/event-bus';
import { getFileExtension } from '@/common/helpers/file-utils';
import useMoment from '@/common/helpers/mixins/use-moment';

const props = defineProps({
  item: {
    type: Object as PropType<ChatMessage>,
    default: {} as ChatMessage
  }
});

const { moment } = useMoment();

const messageType = ref('TextMessage');

const { t } = useI18n();

function toggleActionMenu(event: Event) {
  event.preventDefault();
  EventBus.emit('toggle-chat-action-menu', {
    event,
    item: props.item
  });
}

onMounted(() => {
  if (props.item) {
    if (props.item.attachments?.length) {
      messageType.value = every(props.item.attachments,
        (file) => file && IMAGE_FILE_TYPES_SUPPORTED.includes(getFileExtension(file.name))) ? 'ImageMessage' : 'FileMessage';
    } else if (linkify.find(props.item.content).length) {
      messageType.value = 'LinkMessage';
    } else {
      messageType.value = 'TextMessage';
    }
  }
});

</script>

<script lang='ts'>

import FileMessage from '@/apps/chat/components/history/messages/FileMessage.vue';
import ImageMessage from '@/apps/chat/components/history/messages/ImageMessage.vue';
import LinkMessage from '@/apps/chat/components/history/messages/LinkMessage.vue';
import TextMessage from '@/apps/chat/components/history/messages/TextMessage.vue';

export default {
  name: 'CMessage',

  components: {
    FileMessage,
    ImageMessage,
    LinkMessage,
    TextMessage,
  }
};
</script>