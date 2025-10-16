<template>
  <div class='align-items-center justify-content-center'>
    <div class='flex gap-2 h-full w-full'>
      <AppAvatar
        :avatar='generateAvatarUrl(me?.avatar)'
        :label='me?.fullName'
        size='2rem'/>
      <div class='border-2 border-primary-300 border-round flex flex-column shadow-3 surface-0 w-full'>
        <AppEditor
          v-if='!isBlockedComment'
          id='inputMessage'
          v-model='content'
          class='w-full'
          :placeholder='t("media.comment.addComment")'
          :pt='{
            toolbar: {
              style: `border: none;${isShowToolbar?"":"display:none"}`
            },
            content: {
              style: "border: none"
            },
            root:{
              style:"border: none"
            }
          }'>
        </AppEditor>
        <div class='bg-transparent flex justify-content-between pb-1 px-1'>
          <Button
            v-tooltip='t("media.comment.toolbar")'
            rounded
            size='small'
            text
            @click='()=> {
              isShowToolbar=!isShowToolbar
            }'>T
          </Button>
          <div class='flex gap-1'>
            <Button
              severity='warning'
              size='small'
              @click="emits('closeEditor')">
              {{ t('common.close') }}
            </Button>
            <Button
              severity='success'
              size='small'
              @click='sendComment'>
              {{ t('media.comment.comment') }}
            </Button>
          </div>
        </div>
      </div>

    </div>

  </div>
</template>

<script setup lang='ts'>
import { type PropType, ref } from 'vue';

import { saveComment } from '@/apps/media/graphql/comment-graphql';
import { type CommentInterface } from '@/apps/media/model/comment';
import { MediaType } from '@/apps/media/model/media';
import AppAvatar from '@/common/components/app/AppAvatar.vue';
import AppEditor from '@/common/components/custom/AppEditor.vue';
import { toastError } from '@/common/helpers/custom-toast-service';
import { generateAvatarUrl } from '@/common/helpers/file-utils';
import i18n from '@/common/i18n';
import { useUserStore } from '@/common/store/user';

const props = defineProps({

  isBlockedComment: {
    type: Boolean,
    default: false
  },
  objectId: {
    type: String,
    default: ''
  },
  mediaType: {
    type: String as PropType<MediaType>,
    required: true
  },
  preContent: {
    type: String,
    default: ''
  },
  editingId: {
    type: String,
    default: undefined
  }
});

const emits = defineEmits<{
  sentComment: [comment: CommentInterface],
  closeEditor: [],
}>();
let { user: me } = useUserStore();
const { t } = i18n.global;
const isShowToolbar = ref<boolean>(false);
const repliedId = defineModel<string | undefined>('repliedId', { default: undefined });
const content = ref<string>(props.preContent);

const { mutate: saveCommentMutate, onError: saveCommentError } = saveComment();
saveCommentError(() => {
  toastError({ message: t('comment.saveError.') });
});

function sendComment() {
  if (content.value.trim().length != 0) {
    saveCommentMutate({
      commentInput: {
        id: props.editingId,
        content: content.value,
        objectId: props.objectId,
        type: props.mediaType,
        repliedCommentId: repliedId.value
      }
    }).then(
      value => {
        emits('sentComment', value?.data.saveComment);
        content.value = '';
      }
    );
  }
}

</script>

<style scoped>
:deep(.p-editor-container .p-editor-content .ql-editor) {
  background: none;
}

:deep(.ql-editor.ql-blank::before) {
  color: var(--primary-light-color);
}
</style>