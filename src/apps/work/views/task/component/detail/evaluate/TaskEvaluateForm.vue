<template>
  <Dialog
    v-model:visible='visible'
    :dismissable-mask='false'
    :header='t("Đánh giá kết quả công việc")'
    modal
    style='width:50vw'
    @hide='resetState'>
    <div
      v-if='evaluateType==EvaluationType.ACCEPT'
      class='align-items-center field flex gap-2'>
      <label class='font-semibold'>
        {{ t('Ngày đánh giá') }}
      </label>
      <Calendar
        v-model='evaluateDate'
        date-format='dd/mm/yy'
        icon-display='input'
        show-icon>

      </Calendar>
    </div>

    <div
      v-if='evaluateType==EvaluationType.ACCEPT'
      class='field'>
      <label class='font-semibold'>
        {{ t('Tiến độ báo cáo') }}
      </label>
      <div class='align-items-center flex flex-column'>
        <InputNumber
          v-model='percent'
          class='input-no-border'
          :max='100'
          :min='0'
          suffix='%'/>
        <Slider
          v-model='percent'
          class='w-full'
          :max='100'
          :min='0'/>
      </div>
    </div>

    <div
      class='field'>
      <label class='font-semibold'>
        {{ t('Nội dung đánh giá') }}
      </label>
      <div class='align-items-center flex p-0 p-component p-inputtext px-2'>
        <div class='w-full'>
          <div
            v-if='previews.length>0'
            class='align-items-center flex gap-2 mt-2'>
            <div
              v-for='(file, index) in previews'
              :key='file.lastModified+file.name'
              class='attachment-items bg-primary-200 border-round p-1 relative'>
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
                style='max-width: 6rem; max-height: 6rem;'/>
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
          <Textarea
            v-model='description'
            auto-resize
            class='input-no-border shadow-none w-full'
            :placeholder='t("Nội dung đánh giá")'
            rows='5'
            style='max-height:150px'>
          </Textarea>
        </div>
        <div
          v-tooltip='t("chat.conversation.emoji")'
          class='cursor-pointer hover-buttons p-1 text-lg'
          @click='openEmoji'>
          😀
        </div>
        <div
          v-tooltip='t("chat.conversation.attachment")'
          class='cursor-pointer hover-buttons p-1 pi pi-paperclip text-lg'
          @click='addAttachment'>
          <input
            ref='inputFile'
            hidden
            multiple
            name='attachment'
            type='file'
            @change='onChangeFiles'/>
        </div>
      </div>
    </div>

    <template #footer>
      <div class='align-items-center flex justify-content-between w-full'>
        <div>
          <StarRate
            v-if='evaluateType==EvaluationType.ACCEPT'
            v-model='starRating'
            size='1.5'>
          </StarRate>
        </div>
        <Button
          :label='t("Gửi đánh giá")'
          @click='sendEvaluate'>
        </Button>
      </div>
    </template>
  </Dialog>

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
import { type PropType, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import ChatEmoji from '@/apps/chat/components/ChatEmoji.vue';
import { EvaluationType } from '@/apps/work/model/taskEvaluation';
import type { TaskReport } from '@/apps/work/model/taskReport';
import StarRate from '@/apps/work/views/task/component/detail/evaluate/StarRate.vue';
import type { EvaluateSendEvent, EvaluateType } from '@/apps/work/views/task/component/detail/evaluate/type';
import { convertFileSize, getFileExtension, getFileIcon, handleFileImageError } from '@/common/helpers/file-utils';

const props = defineProps({
  evaluateType: {
    type: String as PropType<EvaluateType>,
    default: 'reject'
  },
  report: {
    type: Object as PropType<TaskReport>,
    default: undefined
  }
});
const emits = defineEmits<{
  (e: 'sendEvaluate', event: EvaluateSendEvent): void
}>();

const visible = defineModel<boolean>('visible', { default: false });
const { t } = useI18n();

const description = ref<string>('');
const attachments = ref<File[]>([]);
const percent = ref<number>(props.report?.percent || 0);
watch(() => props.report?.percent, value => {
  percent.value = value || 0;
}, { once: true });
const starRating = ref<number>(3);
const evaluateDate = ref<Date>(new Date());

function resetState() {
  description.value = '';
  attachments.value = [];
  percent.value = props.report?.percent || 0;
  starRating.value = 3;
  evaluateDate.value = new Date();
}

function sendEvaluate() {
  if (!props.report) {
    return;
  }
  const event: EvaluateSendEvent = {
    report: props.report,
    description: description.value,
    attachments: attachments.value,
    ...props.evaluateType == EvaluationType.ACCEPT && {
      starRating: starRating.value,
      percent: percent.value,
      evaluateDate: evaluateDate.value
    }
  };
  emits('sendEvaluate', event);
}

//Handle attachment
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
  attachments.value = attachments.value.filter((value, index1) => index1 != index);
}

function onChangeFiles(e: Event) {
  const inputElement = (e.target as HTMLInputElement);
  const fileList = inputElement.files;
  if (isAddFiles.value) {
    fileList && (attachments.value = [...attachments.value, ...fileList]);
  } else {
    fileList && (attachments.value = [...fileList]);
  }

  //Reset inputElement
  inputElement.value = '';
}

type Preview = { name: string; type: string; url: string; size: number, lastModified: number }
const previews = ref<Preview[]>([]);

watch(
  attachments,
  (newAttachments, oldAttachments) => {
    // Detect added files
    const addedFiles = newAttachments.filter(
      (newFile) => !oldAttachments.some((oldFile) => oldFile === newFile)
    );

    // Detect removed files
    const removedFiles = oldAttachments.filter(
      (oldFile) => !newAttachments.some((newFile) => newFile === oldFile)
    );

    // Process added files
    addedFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        previews.value.push({
          name: file.name,
          type: file.type,
          url: reader.result as string,
          size: file.size,
          lastModified: file.lastModified,
        });
      };
      reader.readAsDataURL(file);
    });

    // Remove deleted files from previews
    previews.value = previews.value.filter(
      (preview) => !removedFiles.some((file) => file.name === preview.name)
    );
  },
  { deep: true }
);

//Emoji
const emoji = ref();

function openEmoji(event: Event) {
  emoji.value.toggle(event);
}

function insertEmoji(s: string) {
  description.value = description.value + s;
}
</script>

<style scoped>
:deep(.input-no-border > input) {
  border: none !important; /* Xóa viền của input */
  outline: none !important; /* Loại bỏ đường viền chọn khi input đang được focus */
  font-weight: 600;
  font-size: large;
  box-shadow: none !important;
  text-align: center
}

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

img {
  display: block;
}
</style>