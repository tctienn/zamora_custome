<template>
  <div class='align-items-center flex flex-row justify-content-center mt-3'>
    <div class='w-full'>
      <Textarea
        id='inputMessage'
        v-model='content'
        autofocus
        class='input-chat outline-none shadow-none w-full'
        :disabled='!permission.isComment'
        rows='2'
        @blur='focusInputMessage'
        @keydown.enter.prevent='sendMessage'/>
    </div>

    <div class='column-gap-2 flex flex-row mx-2'>
      <ButtonIcon
        class='p-2'
        icon='send'
        rounded
        @click='sendMessage'/>
    </div>
  </div>
</template>

<script setup lang='ts'>
import { storeToRefs } from 'pinia';
import { type PropType, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { useChatStore } from '@/apps/chat/store/chat';
import { type PermissionTask } from '@/apps/work/model/permission';

defineProps({
  permission: {
    type: Object as PropType<PermissionTask>,
    default: {} as PermissionTask
  },
});

const emits = defineEmits(['send-message']);

const { loadingHistory, conversation } = storeToRefs(useChatStore());
const content = ref<string>();

const { t } = useI18n();

function sendMessage(event: KeyboardEvent) {
  if (content.value) {
    emits('send-message', content.value);
    content.value = '';
  }
}

function upload() {
}

function focusInputMessage() {
}

defineExpose({ focusInputMessage });
</script>

<script lang='ts'>
export default { name: 'CommentTaskInput' };
</script>