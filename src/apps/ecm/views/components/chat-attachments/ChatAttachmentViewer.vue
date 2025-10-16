<template>
  <div v-if='isSuccessful == null'>
    <AppLoader/>
  </div>

  <div
    v-if='isSuccessful && attachment'
    class='align-items-center flex flex-column h-full justify-content-center'>
    <div class='flex flex-row justify-content-between my-3 w-full'>
      <div class='col-1'>
        <ButtonIcon
          icon='arrow_back'
          icon-size='2'
          rounded
          text
          @click='router.back()'/>
      </div>
      <h3 class='col-10 m-0 text-center'>
        {{ attachment['name'] }}
      </h3>
      <div class='col-1 column-gap-3 flex flex-row justify-content-end text-right'>
        <a
          class='p-0 p-button p-button-text p-component'
          :href='generateChatAttachmentDownloadUrl(attachment["path"])'>
          <AppIcon
            name='download'
            size='2'/>
        </a>
      </div>
    </div>

    <div class='align-items-center flex flex-grow-1 justify-content-center w-full'>
      <component
        :is='viewerType'
        v-bind='{treePath: attachment["path"], name: attachment["name"], extension: getFileExtension(attachment["name"]), isChatAttachment: true}'/>
    </div>
  </div>

  <div
    v-else
    class='align-items-center flex flex-column h-full justify-content-center row-gap-5 w-full'>
    <h3>{{ t('ecm.storage.error.unableLoadFile') }}</h3>
  </div>
</template>

<script setup lang='ts'>
import { get, toLower } from 'lodash';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';

import { getChatAttachmentGraphql } from '@/apps/ecm/api/graphql/chat-graphql';
import type { ChatAttachment } from '@/apps/ecm/model/chat';
import { checkFileTypeViewer, generateChatAttachmentDownloadUrl, getFileExtension } from '@/common/helpers/file-utils';

const { t } = useI18n();
const route = useRoute();
const router = useRouter();

const isSuccessful = ref();
const viewerType = ref('');
const attachment = ref<ChatAttachment>({} as ChatAttachment);
const { attachmentId } = route.params;

const {
  onResult: getChatAttachmentResult,
  onError: getChatAttachmentError
} = getChatAttachmentGraphql(attachmentId as string);
getChatAttachmentResult((response) => {
  attachment.value = get(response, 'data.chatAttachment', null);

  if (attachment.value) {
    isSuccessful.value = true;
    const lowerExtension = toLower(getFileExtension(attachment.value?.name));
    viewerType.value = checkFileTypeViewer(lowerExtension);
  } else {
    isSuccessful.value = false;
  }
});

getChatAttachmentError(() => {
  isSuccessful.value = false;
});

</script>

<script lang='ts'>
import AudioViewer from '@/apps/ecm/views/components/view-file/AudioViewer.vue';
import ImageViewer from '@/apps/ecm/views/components/view-file/ImageViewer.vue';
import PdfViewer from '@/apps/ecm/views/components/view-file/PdfViewer.vue';
import UnsupportedFile from '@/apps/ecm/views/components/view-file/UnsupportedFile.vue';
import VideoViewer from '@/apps/ecm/views/components/view-file/VideoViewer.vue';

export default {
  name: 'ChatAttachmentViewer',

  components: {
    AudioViewer,
    ImageViewer,
    PdfViewer,
    UnsupportedFile,
    VideoViewer,
  }
};
</script>