<template>
  <div class='relative'>
    <Textarea
      v-model='content'
      auto-resize
      class='pr-8 w-full'
      :disabled='disabled'
      rows='1'
      @keydown.enter.prevent='handleKeyInput'
      @keyup.esc.prevent.stop='cancel'/>
    <div
      class='absolute align-items-center flex gap-0 pr-2 right-0'
      style='bottom:0.5rem'>
      <div
        v-if='content.trim().length>0'
        v-tooltip='t("document.comment.action.cancel")'
        class='cursor-pointer hover-buttons p-1 pi pi-times text-lg text-primary'
        :class='{"p-disabled": disabled}'
        @click='closeInput'>
      </div>
      <div
        v-tooltip='t("chat.conversation.emoji")'
        class='cursor-pointer hover-buttons p-1 text-lg'
        :class='{"p-disabled": disabled}'
        @click='openEmoji'>
        😀
      </div>
      <div
        v-tooltip='t("chat.conversation.attachment")'
        class='cursor-pointer hover-buttons p-1 pi pi-paperclip text-lg'
        :class='{"p-disabled": disabled}'
        @click='upload'>
      </div>
      <div
        v-tooltip='t("chat.conversation.send")'
        class='cursor-pointer hover-buttons p-1 pi pi-send text-2xl text-primary'
        :class='{"p-disabled": disabled}'
        @click='sendMessage'></div>
    </div>
  </div>
  <div class='gap-2 grid grid-nogutter relative'>
    <Badge
      v-for='(file,index) in files'
      :key='file.name'
      class='align-items-center flex gap-1'
      severity='info'>

      <img
        alt='extension'
        class='h-1rem'
        :src='getFileIcon(getFileExtension(file.name))'/>
      <span>
        {{ file.name }} - {{ convertFileSize(file.size) }}
      </span>
      <AppIcon
        v-tooltip.top="t('document.comment.commentInput.delFile')"
        class='cursor-pointer'
        name='close'
        @click='deleteAttachment(index)'/>
    </Badge>
  </div>

  <input
    ref='inputFile'
    hidden
    multiple
    name='attachment'
    type='file'
    @change='onChangeFiles'/>

  <OverlayPanel
    ref='emoji'
    :pt='{
      content: {
        class: "pt-0"
      }
    }'>
    <ChatEmoji @insert-emoji='insertEmoji'/>
  </OverlayPanel>

</template>

<script lang='ts' setup>

import { isEmpty, trim } from 'lodash';
import type Textarea from 'primevue/textarea';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

import ChatEmoji from '@/apps/chat/components/ChatEmoji.vue';
import AppIcon from '@/common/components/app/AppIcon.vue';
import { convertFileSize, getFileExtension, getFileIcon } from '@/common/helpers/file-utils';

const props = defineProps({
  disabled: {
    type: Boolean,
    default: undefined
  },
  initContent: {
    type: String,
    default: '',
  }
});
const emits = defineEmits<{
  (e: 'send-message', content: string, attachments: FileList | undefined): void,
  (e: 'cancel-input'): void,
  (e: 'close'): void
}>();
const { t } = useI18n();
const content = ref<string>(props.initContent);
const emoji = ref();
const files = ref<FileList>();

function openEmoji(event: Event) {
  emoji.value.toggle(event);
}

function insertEmoji(s: string) {
  content.value = content.value + s;
}

function cancel() {
  content.value = '';
  files.value = undefined;
  emits('cancel-input');
}

function handleKeyInput(event: KeyboardEvent) {
  if (event.shiftKey && (event.code === 'Enter' || event.code === 'NumpadEnter') && content.value) {
    content.value += '\n';
  } else {
    sendMessage();
  }
}

function sendMessage() {
  if (props.disabled) {
    return;
  }
  const message = trim(content.value);
  if (!isEmpty(message) || (files?.value?.length || -1 > 0)) {
    emits('send-message', message, files.value);
  }
  content.value = '';
  files.value = undefined;
}

const inputFile = ref();

function upload() {
  inputFile.value?.click();
}

function onChangeFiles(e: Event) {
  const value = (e.target as HTMLInputElement).files;
  value && (files.value = value);
}

function deleteAttachment(index: number) {
  if (files.value) {
    files.value = removeFileFromFileList(index, files.value);
  }
}

function removeFileFromFileList(index: number, files: FileList) {
  const dt = new DataTransfer();

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    if (index !== i) {
      dt.items.add(file);
    }
  }
  return dt.files;
}

function closeInput() {
  content.value = '';
  emits('close');
}
</script>

<style scoped>
.hover-buttons:hover {
  background-color: var(--surface-300);
  border-radius: var(--border-radius);
}

</style>
