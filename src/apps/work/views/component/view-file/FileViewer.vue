<template>
  <div class='column-gap-2 ecm-group flex flex-grow-1 flex-row h-full'>
    <div class='flex flex-column flex-grow-1 row-gap-3'>
      <div
        v-if='isSuccessful == null'
        class='mx-0 my-auto'>
        <AppLoader/>
      </div>
      <div
        v-else-if='isSuccessful'
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
            {{ file['name'] }}
          </h3>

          <div class='col-1 column-gap-1 flex flex-row justify-content-end text-right'>
            <a
              class='p-0 p-button p-button-text p-component'
              :href='generateDownloadUrl(file.downloadPath)'>
              <AppIcon
                name='download'
                size='2'/>
            </a>
            <!--            <ButtonIcon-->
            <!--              v-if='EDITABLE_FILE_TYPES.includes(toLower(file.extension))'-->
            <!--              v-tooltip='t("common.edit")'-->
            <!--              icon='edit'-->
            <!--              icon-size='2'-->
            <!--              text-->
            <!--              @click='gotoEditor'/>-->
            <ButtonIcon
              v-tooltip='t("common.info")'
              icon='info'
              icon-size='2'
              text
              @click='showInfo'/>
          </div>
        </div>
        <div class='align-items-center flex flex-grow-1 justify-content-center w-full'>
          <component
            :is='viewerType'
            v-bind='file'/>
        </div>
      </div>

      <div
        v-else
        class='align-items-center flex flex-column h-full justify-content-center row-gap-5 w-full'>
        <h3>{{ t('ecm.storage.error.unableLoadFile') }}</h3>
      </div>
    </div>

    <!--    <CommentSidebar-->
    <!--      v-if='!file.personal'-->
    <!--      @toggle-sidebar='updateGridResponsiveClasses'/>-->

    <FileFolderInformation
      v-if='informationVisible'
      :is-folder='false'
      :item='file'
      :visible-dialog='informationVisible'
      @hide-dialog='hideDialogInfo'/>
  </div>
</template>

<script setup lang='ts'>
import { get, toLower } from 'lodash';
import { onMounted, onUnmounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';

import { readFile } from '@/apps/work/api/graphql/work-attachment';
import type { WorkAttachment } from '@/apps/work/model/workAttachment';
import FileFolderInformation from '@/apps/work/views/component/view-file/FileFolderInformation.vue';
import EventBus from '@/common/helpers/event-bus';
import {
  checkFileTypeViewer, generateDownloadUrl,
  generateFileEditorUrl
} from '@/common/helpers/file-utils';

const { t } = useI18n();
const file = ref<WorkAttachment>({} as WorkAttachment);
const isSuccessful = ref();
const viewerType = ref('');

const route = useRoute();
const router = useRouter();
const { fileId } = route.query;
const { objectId } = route.query;
const getFile = readFile(objectId, fileId);

const {
  onResult: getFileResult,
  onError: getFileError
} = getFile;

getFileResult(async (response: any) => {
  file.value = await get(response, 'data.readFile', null) as WorkAttachment;
  if (file.value) {
    isSuccessful.value = true;
    const { extension } = file.value;
    if (extension) {
      const lowerExtension = toLower(extension);
      viewerType.value = checkFileTypeViewer(lowerExtension);
    }
  } else {
    isSuccessful.value = false;
  }
});

getFileError(() => {
  isSuccessful.value = false;
});

function gotoEditor() {
  window.open(generateFileEditorUrl(file.value.id), '_blank');
}

const informationVisible = ref(false);

function showInfo() {
  informationVisible.value = true;
}

function hideDialogInfo() {
  informationVisible.value = false;
}

onMounted(() => {
  const layoutContent = document.getElementsByClassName('layout-content');
  if (layoutContent?.length) {
    layoutContent[0].classList.add('overflow-hidden');
  }

  EventBus.emit('close-menu');
});

onUnmounted(() => {
  const layoutContent = document.getElementsByClassName('layout-content');
  if (layoutContent?.length) {
    layoutContent[0].classList.remove('overflow-hidden');
  }
});

</script>

<script lang='ts'>

import AudioViewer from '@/apps/work/views/component/view-file/AudioViewer.vue';
import EditableViewer from '@/apps/work/views/component/view-file/EditableViewer.vue';
import ImageViewer from '@/apps/work/views/component/view-file/ImageViewer.vue';
import PdfViewer from '@/apps/work/views/component/view-file/PdfViewer.vue';
import UnsupportedFile from '@/apps/work/views/component/view-file/UnsupportedFile.vue';
import VideoViewer from '@/apps/work/views/component/view-file/VideoViewer.vue';

export default {
  name: 'FileViewer',

  components: {
    AudioViewer,
    ImageViewer,
    PdfViewer,
    UnsupportedFile,
    VideoViewer,
    EditableViewer
  }
};
</script>