<template>
  <div class='h-full relative'>
    <div
      ref='messagesContainer'
      class='flex flex-column-reverse h-full mb-8 messages-container'
      style='overflow: auto'
      @scroll='onScroll'>
      <div style='padding-bottom:130px'>
        <div
          v-for='message in listMessage'
          :key='message.id'
          class='cursor-move'>
          <AppUserLeftMessage
            v-if='userId != message.sendId'
            avatar-size='2.5'
            class='pb-3'
            :message='message'
            :user-id='message.sendId'/>
          <AppUserRightMessage
            v-if='userId == message.sendId'
            avatar-size='2.5'
            class='pb-3'
            :is-show-avatar='false'
            :message='message'
            :user-id='message.sendId'/>
        </div>
      </div>
      <div
        class='bottom-0 w-full'
        style='position: absolute'>
        <ChatInput/>
      </div>
    </div>
  </div>

</template>

<script setup lang="ts">

import { onMounted, type PropType, ref, watch } from 'vue';

import type { ProjectDiscussion } from '@/apps/work/model/projectDiscussion';
import AppUserLeftMessage from '@/common/components/app/AppUserLeftMessage.vue';
import AppUserRightMessage from '@/common/components/app/AppUserRightMessage.vue';
import ChatInput from '@/common/components/app/ChatInput.vue';
import { useUserStore } from '@/common/store/user';

const props = defineProps({
  messages: {
    type: Array as PropType<ProjectDiscussion[]>,
    default: null
  },
  numberMessage: {
    type: Number,
    default: 0
  }
});

const emits = defineEmits(['load-more']);

const totalMessage = ref(0);
const totalCurrentMessage = ref(0);
const loadingMore = ref(false);
const userId = useUserStore().user.id;
const messagesContainer = ref();
const listMessage = ref<ProjectDiscussion[]>([] as ProjectDiscussion[]);
const previousScrollHeight = ref(0);

function scrollToBottom() {
  const container = messagesContainer.value;
  container.scrollTop = container.scrollHeight;
}

function onScroll(event: Event) {
  const {
    scrollTop,
    offsetHeight,
    scrollHeight
  } = event.target as HTMLElement;
  if (offsetHeight - scrollHeight >= scrollTop - scrollHeight * 0.1 && !loadingMore.value) {
    loadingMore.value = true;
    previousScrollHeight.value = scrollHeight;
    emits('load-more');
  }
}

watch(props, () => {
  listMessage.value = props.messages;
  totalMessage.value = props.numberMessage;
  totalCurrentMessage.value = listMessage.value.length;
  if (totalCurrentMessage.value < totalMessage.value) {
    loadingMore.value = false;
    const container = messagesContainer.value;
    if (container) {
      container.scrollTop = container.scrollHeight - previousScrollHeight.value;
    }
  }
});

onMounted(() => {
  scrollToBottom();
});
</script>

<script lang="ts">
export default { name: 'AppChat' };
</script>

<style scoped>
.messages-container {
  overflow-y: auto;
}
</style>