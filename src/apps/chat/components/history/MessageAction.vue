<template>
  <span class='py-3 surface-200 text-center'>
    {{ t(`chat.conversation.messageAction.${camelCase(item.content)}`, {sender: item.sender}) }}
  </span>
</template>

<script setup lang='ts'>
import { camelCase } from 'lodash';
import { type PropType } from 'vue';
import { useI18n } from 'vue-i18n';

import type { ChatMessage } from '@/apps/chat/model/chat';

defineProps({
  item: {
    type: Object as PropType<ChatMessage>,
    default: {} as ChatMessage
  }
});

const { t } = useI18n();

</script>

<script lang='ts'>
export default { name: 'MessageAction' };
</script>