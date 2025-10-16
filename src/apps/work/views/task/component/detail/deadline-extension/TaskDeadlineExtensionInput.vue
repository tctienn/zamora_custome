<template>
  <div class='align-items-end flex gap-2 justify-content-between w-full'>
    <div class='align-items-end gap-2 grid grid-nogutter w-full'>
      <div class='col-9 flex flex-column flex-grow-1 h-full p-component p-inputtext'>
        <div
          v-if='previews.length>0'
          class='align-items-center flex gap-2 mt-2'>
          <div>
            <ButtonIcon
              icon='attach_file_add'
              @click='addAttachment'>
            </ButtonIcon>
          </div>
          <div
            v-for='(file, index) in previews'
            :key='index'
            class='attachment-items bg-primary-200 border-round p-2 relative'>
            <AppIcon
              v-tooltip='t("Xoá tệp đính kèm")'
              class='absolute bg-primary-300 border-circle cursor-pointer delete-attachment-button'
              name='close'
              size='1.3'
              :style='{top:"-0.5rem" ,right:"-0.5rem"}'
              @click='deleteAttachment(index)'>
            </AppIcon>
            <!-- Image preview -->
            <img
              v-if="file.type.startsWith('image/')"
              :alt='file.name'
              :src='file.url'
              style='max-width: 10rem; max-height: 10rem;'/>
            <!-- Generic file preview -->
            <div
              v-else
              class='align-items-center flex gap-2'>
              <img
                v-if='file.name'
                alt=''
                class='file-extension-icon h-2rem w-2rem'
                draggable='false'
                :src='getFileIcon(getFileExtension(file.name))'
                @error='handleFileImageError'/>
              <div>
                <span class='flex flex-column'>
                  {{ file.name }}
                </span>
                <span>
                  {{ convertFileSize(file.size) }}
                </span>
              </div>
            </div>
            <!--          <a-->
            <!--            v-else-->
            <!--            :href='file.url'-->
            <!--            target='_blank'>{{ file.name }}</a>-->
          </div>
        </div>
        <div class='align-items-end flex h-full justify-content-between w-full'>
          <div class='align-items-end flex pb-1 pr-2'>
            <div
              v-tooltip='t("chat.conversation.emoji")'
              class='cursor-pointer hover-buttons p-1 text-lg'
              :class='{"p-disabled": disabled}'
              @click='openEmoji'>
              😀
            </div>
          </div>
          <Textarea
            v-model.trim='reason'
            auto-resize
            class='input-no-border px-0 shadow-none w-full'
            :disabled='disabled'
            rows='1'
            @keydown.enter.prevent='handleKeyInput'
            @keyup.esc.prevent.stop='cancel'/>
          <div
            class='align-items-end flex flex-column gap-0 h-full justify-content-end pl-2'>
            <div class='align-items-end flex pb-1 pr-2'>
              <div
                v-tooltip='t("chat.conversation.attachment")'
                class='cursor-pointer p-1 pi pi-paperclip text-lg'
                :class='{"p-disabled": disabled}'
                @click='upload'>
                <input
                  ref='inputFile'
                  hidden
                  multiple
                  name='attachment'
                  type='file'
                  @change='onChangeFiles'/>
              </div>
              <!--              <div-->
              <!--                v-tooltip='t("Thêm")'-->
              <!--                class='cursor-pointer p-1 pi pi-plus-circle text-lg'>-->

              <!--              </div>-->
              <!--          <div-->
              <!--            v-tooltip='t("chat.conversation.send")'-->
              <!--            class='cursor-pointer hover-buttons p-1 pi pi-send text-2xl text-primary'-->
              <!--            :class='{"p-disabled": disabled}'-->
              <!--            @click='sendReport'></div>-->
            </div>
          </div>
        </div>

      </div>
      <div>
        <Calendar
          v-model='newDeadline'
          class='w-9rem'
          date-format='dd/mm/yy'
          icon-display='input'
          show-icon>
        </Calendar>
        <ValidateErrorMessage :errors='v$?.newDeadLine?.$errors'/>
      </div>

      <Button
        class='col flex p-2'
        icon='pi pi-send'
        :label='t("Gửi gia hạn")'
        style='height:40px'
        @click='sendTaskExtension'>
      </Button>
    </div>

  </div>
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

<script lang="ts" setup>

import { useVuelidate } from '@vuelidate/core';
import { helpers, required } from '@vuelidate/validators';
import type Textarea from 'primevue/textarea';
import { inject, type Ref, ref, toRef, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import ChatEmoji from '@/apps/chat/components/ChatEmoji.vue';
import type { Task } from '@/apps/work/model/task';
import type { SendTaskDeadlineExtensionEvent } from '@/apps/work/views/task/component/detail/deadline-extension/type';
import { convertFileSize, getFileExtension, getFileIcon, handleFileImageError } from '@/common/helpers/file-utils';

const props = defineProps({
  disabled: {
    type: Boolean,
    default: false
  }
});

const emits = defineEmits<{
  (e: 'sendTaskDeadlineExtension', event: SendTaskDeadlineExtensionEvent): void,
  (e: 'cancelInput'): void
}>();

const { t } = useI18n();

const reason = defineModel<string>('message', { default: '' });
const newDeadline = defineModel<Date | undefined>('newDeadline', { default: undefined });

function resetState() {
  reason.value = '';
  newDeadline.value = undefined;
  files.value = [];
}

function sendTaskExtension() {
  v$.value.$validate().then(isValid => {
    if (isValid) {
      emits('sendTaskDeadlineExtension', {
        reason: reason.value,
        newDeadline: newDeadline.value,
        attachments: files.value
      });
      resetState();
    }
  });

}

function cancel() {
  emits('cancelInput');
  resetState();
}

function handleKeyInput(event: KeyboardEvent) {
  if (event.shiftKey && (event.code === 'Enter' || event.code === 'NumpadEnter') && reason.value) {
    reason.value += '\n';
  } else {
    sendTaskExtension();
  }
}

const files = ref<File[]>([]);
const inputFile = ref<HTMLInputElement | null>(null);
const isAddFiles = ref<boolean>(false);

function upload() {
  inputFile.value?.click();
  isAddFiles.value = false;
}

function addAttachment() {
  inputFile.value?.click();
  isAddFiles.value = true;
}

function deleteAttachment(index: number) {
  files.value = files.value.filter((value, index1) => index1 != index);
}

function onChangeFiles(e: Event) {
  const inputElement = (e.target as HTMLInputElement);
  const fileList = inputElement.files;
  if (isAddFiles.value) {
    fileList && (files.value = [...files.value, ...fileList]);
  } else {
    fileList && (files.value = [...fileList]);
  }

  //Reset inputElement
  inputElement.value = '';
}

type Preview = { name: string; type: string; url: string; size: number }
const previews = ref<Preview[]>([]);

watch(files, () => {
  previews.value = []; // Clear previous previews

  files.value.forEach((file) => {
    const reader = new FileReader();

    reader.onload = () => {
      previews.value.push({
        name: file.name,
        type: file.type,
        url: reader.result as string,
        size: file.size
      });
    };

    reader.readAsDataURL(file); // Read images and PDFs as Data URLs
  });
});

const emoji = ref();

function openEmoji(event: Event) {
  emoji.value.toggle(event);
}

function insertEmoji(s: string) {
  reason.value = reason.value + s;
}

const providedTask = inject<Ref<Task | undefined>>('providedTask', toRef(undefined));
const validateRules = {
  newDeadline: {
    required: helpers.withMessage(t('Ngày kết thúc mới không được để trống'), required),
    dueTimeNull: helpers.withMessage(t('Ngày kết thúc không tồn tại nên không cần gia hạn'), value => {
      return !!providedTask.value?.dueTime;
    }),
    afterCurrentDeadline: helpers.withMessage(t('Ngày kết thúc mới phải sau ngày kết thúc cũ'), (value: Date) => {
      return true;
      // if(!providedTask.value?.dueTime){
      //   return true;
      // }else{
      //   const dueTimeReal = moment(providedTask.value.dueTime)
      //   return providedTask.value.dueTime <dueTimeReal
      // }
      // return false;
    })
  },
};

const v$ = useVuelidate(validateRules, { newDeadline: newDeadline });

defineExpose({ resetState });
</script>

<style scoped>
.input-no-border {
  border: none; /* Xóa viền của input */
  outline: none; /* Loại bỏ đường viền chọn khi input đang được focus */
}

.attachment-items:hover {
  & .delete-attachment-button {
    opacity: 1
  }
}

.delete-attachment-button {
  opacity: 0
}

</style>