<template>
  <div class='align-items-center justify-content-center'>
    <div class='flex gap-2 h-full w-full'>
      <AppAvatar
        :avatar='generateAvatarUrl(me?.avatar)'
        :label='me?.fullName'
        size='2rem'/>
      <div class='border-2 border-primary-300 border-round flex flex-column shadow-3 surface-0 w-full'>
        {{ uploadFileRef?.files[0]?.name }}
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
              severity='warning'
              size='small'
              @click='uploadFiles'>
              {{ t('common.attachment') }}
            </Button>
            <Button
              severity='success'
              size='small'
              @click='sendComment'>
              {{ t('media.comment.comment') }}
            </Button>
            <input
              ref='uploadFileRef'
              hidden
              multiple
              type='file'
              @change='handleFileUpload'>
          </div>
        </div>
      </div>

    </div>

  </div>
</template>

<script lang='ts' setup>
import { inject, type PropType, ref } from 'vue';

import { type CommentInputInterface } from '@/apps/media/model/comment';
import { MediaType } from '@/apps/media/model/media';
import type { ProjectDiscussionInterface } from '@/apps/work/model/projectDiscussion';
import AppAvatar from '@/common/components/app/AppAvatar.vue';
import AppEditor from '@/common/components/custom/AppEditor.vue';
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
    default: MediaType.ANNOUNCEMENT
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
  sentComment: [comment: ProjectDiscussionInterface],
  closeEditor: [],
  uploadFile: [],
}>();
let { user: me } = useUserStore();
const { t } = i18n.global;
const isShowToolbar = ref<boolean>(false);
const repliedId = defineModel<string | undefined>('repliedId', { default: undefined });
const content = ref<string>(props.preContent);
const saveComment = inject('saveComment', (value:
                                               CommentInputInterface
) => Promise.resolve({} as ProjectDiscussionInterface));
const uploadFilesApi = inject('uploadFiles', (objectId: string, formData: FormData) => Promise.resolve());

function sendComment() {
  if (content.value.trim().length != 0) {
    saveComment(
      {
        id: props.editingId,
        content: content.value,
        objectId: props.objectId,
        repliedCommentId: repliedId.value
      }
    ).then((value: ProjectDiscussionInterface) => {
      if (value) {
        emits('sentComment', value);
        content.value = '';
      }
    }
    );
  }
}

const uploadFileRef = ref();

function uploadFiles() {
  uploadFileRef.value.click();
}

async function handleFileUpload(event: Event) {
  const target = event.target as HTMLInputElement;
  const files = target.files ?? [];
  if (files.length > 0) {
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('objectId', props.objectId);
      if (repliedId.value) {
        formData.append('repliedCommentId', repliedId.value);
      }
      formData.append('attachments', files[i]);
    }
    try {
      const response = await uploadFilesApi(props.objectId, formData);
    } catch (error) {
      console.error('Error uploading file', error);
    }
  }
}
</script>

<style lang="scss" scoped>
:deep(.p-editor-container .p-editor-content .ql-editor) {
  background: none;
}

:deep(.ql-editor) {
  img {
    max-width: 15rem !important;
    max-height: 15rem !important;
    object-fit: cover;
  }
}

:deep(.ql-editor.ql-blank::before) {
  color: var(--primary-light-color);
}
</style>