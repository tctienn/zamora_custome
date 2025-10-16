<template>
  <div class='h-fit relative'>
    <Avatar
      class='border-2 border-circle surface-border text-white uppercase'
      :class='sizeClass'
      :image='generateAvatarUrl(avatar)'
      :label='avatarLabel'
      shape='circle'
      size='large'
      :style='avatarLabel ? {backgroundColor: extractAvatarBackgroundColor(avatarLabel)} : {}'
      @error='onErrorAvatar'/>

    <AppIcon
      v-if='conversation["isGroup"] &&
        (("sender" in item) && conversation["adminIds"].includes(item.fromUserId) || (("fullName" in item) &&
          conversation["adminIds"].includes(item.id as string)))'
      class='-rotate-45 absolute bg-white border-1 border-round bottom-0 surface-border'
      color='var(--yellow-500)'
      name='key'/>
  </div>
</template>

<script setup lang='ts'>
import { storeToRefs } from 'pinia';
import { computed, onMounted, type PropType, ref } from 'vue';

import type { ChatConversation, ChatMessage } from '@/apps/chat/model/chat';
import { useChatStore } from '@/apps/chat/store/chat';
import { generateAvatarUrl } from '@/common/helpers/file-utils';
import { extractAvatarBackgroundColor, extractAvatarLabel } from '@/common/helpers/utils';
import { User } from '@/common/model/User';

const props = defineProps({
  item: {
    type: Object as PropType<ChatConversation | ChatMessage | User>,
    required: true
  },
  size: {
    type: String,
    default: '3'
  }
});

const { conversation } = storeToRefs(useChatStore());

const avatar = ref(props.item?.avatar);
const avatarLabel = ref('');
const sizeClass = computed(() => `w-${ props.size }rem h-${ props.size }rem`);
const fontSize = computed(() => `${ parseInt(props.size) / 2.5 }rem`);

function onErrorAvatar() {
  let label: string | undefined = '';
  if ('sender' in props.item) {
    label = props.item.sender;
  }
  if ('name' in props.item) {
    label = props.item.name;
  }
  if ('fullName' in props.item) {
    label = props.item.fullName;
  }
  avatarLabel.value = extractAvatarLabel(label ?? '');
}

onMounted(()=>{
  if(!avatar.value) {
    onErrorAvatar();
  }
});

</script>

<script lang='ts'>
export default { name: 'ChatAvatar' };
</script>

<style scoped>
:deep(.p-avatar-text) {
  font-size: v-bind(fontSize);
}

:deep(.absolute) {
  right: 0;
}
</style>