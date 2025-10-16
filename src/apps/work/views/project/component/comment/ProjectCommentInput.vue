<template>
  <div>
    <div class='p-1 p-component p-inputtext p-inputtextarea p-inputtextarea-resizable w-full'>
      <template v-if='targetComment'>
        <div v-if='targetType=="reply"'>
          <ProjectCommentReply
            :comment='targetComment'
            @cancel-reply='cancelCommentTarget'/>
          <Divider class='m-2'></Divider>
        </div>
        <div v-if='targetType=="edit"'>
          <ProjectCommentEdit
            :comment='targetComment'
            @cancel-edit='cancelCommentTarget'>
          </ProjectCommentEdit>
          <Divider class='m-2'></Divider>
        </div>
      </template>
      <div class='align-items-center flex h-full justify-content-between'>
        <div class='align-items-end flex pr-2'>
          <div
            v-tooltip='t("chat.conversation.emoji")'
            class='cursor-pointer hover-buttons p-1 text-lg'
            :class='{"p-disabled": disabled}'
            @click='openEmoji'>
            😀
          </div>
        </div>

        <Textarea
          v-model='content'
          auto-resize
          class='input-no-border px-0 shadow-none w-full'
          :disabled='disabled'
          rows='1'
          @keydown.enter.prevent='handleKeyInput'
          @keyup.esc.prevent.stop='cancel'/>
        <div
          class='align-items-end flex flex-column gap-0 h-full justify-content-end pl-2'>
          <div class='align-items-end flex pr-2'>
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
      </div>
    </div>
    <div class='gap-2 grid grid-nogutter relative'>
      <!--    <AppIcon-->
      <!--      v-if='files?.length || -1 >0'-->
      <!--      v-tooltip.left='t("Xoá tất cả tệp")'-->
      <!--      class='absolute cursor-pointer'-->
      <!--      name='close'-->
      <!--      size='1.3'-->
      <!--      style = 'right:2px'-->
      <!--      @click='deleteAllAttachment'>-->
      <!--    </AppIcon>-->
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
          {{ truncateFileName(file.name) }} - {{ convertFileSize(file.size) }}
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
  </div>

</template>

<script lang='ts' setup>

import { isEmpty, trim } from 'lodash';
import type Textarea from 'primevue/textarea';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

import ChatEmoji from '@/apps/chat/components/ChatEmoji.vue';
import { truncateFileName } from '@/apps/document/helpers/composable/utils';
import type { ProjectDiscussion, ProjectDiscussionInterface } from '@/apps/work/model/projectDiscussion';
import ProjectCommentEdit from '@/apps/work/views/project/component/comment/ProjectCommentEdit.vue';
import ProjectCommentReply from '@/apps/work/views/project/component/comment/ProjectCommentReply.vue';
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
  (e: 'edit-message', content: string, attachments: FileList | undefined): void,
  (e: 'cancel-input'): void,
  (e: 'close'): void
}>();
const targetComment = defineModel<ProjectDiscussion | undefined>('targetComment', { default: undefined });
const targetType = defineModel<'reply' | 'edit' | undefined>('targetType', { default: undefined });

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
    if (targetType.value == 'edit') {
      emits('edit-message', message, files.value);
    } else {
      emits('send-message', message, files.value);
    }
  }
  content.value = '';
  files.value = undefined;
  targetType.value = undefined;
  targetComment.value = undefined;
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

function cancelCommentTarget() {
  targetComment.value = undefined;
  targetType.value = undefined;
}

</script>

<style scoped>
.hover-buttons:hover {
  background-color: var(--surface-300);
  border-radius: var(--border-radius);
}

.input-no-border {
  border: none; /* Xóa viền của input */
  outline: none; /* Loại bỏ đường viền chọn khi input đang được focus */
}
</style>
