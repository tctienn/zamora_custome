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
          </div>
          <h3 class='col-10 m-0 text-center'>
            {{ file['name'] }}
          </h3>
          <div class='col-1 column-gap-1 flex flex-row justify-content-end text-right'>
            <a
              class='p-0 p-button p-button-text p-component'
              :href='generateFileDownloadUrl(file.treePath)'>
              <AppIcon
                name='download'
                size='2'/>
            </a>
            <ButtonIcon
              v-if='EDITABLE_FILE_TYPES.includes(toLower(file.extension))'
              v-tooltip='t("common.edit")'
              icon='edit'
              icon-size='2'
              text
              @click='gotoEditor'/>
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
            :md5='md5'
            v-bind='file'/>
        </div>
      </div>

      <div
        v-else
        class='align-items-center flex flex-column h-full justify-content-center row-gap-5 w-full'>
        <h3>{{ t('ecm.storage.error.unableLoadFile') }}</h3>
      </div>
    </div>

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
import { storeToRefs } from 'pinia';
import { computed, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';

import { getFileGraphql } from '@/apps/ecm/api/graphql/file-graphql';
import { getSharedFileGraphql } from '@/apps/ecm/api/graphql/share';
import { EDITABLE_FILE_TYPES } from '@/apps/ecm/constants';
import type { EcmFile } from '@/apps/ecm/model/file-folder';
import { useStorageStore } from '@/apps/ecm/store/storage';
import FileFolderInformation from '@/apps/ecm/views/components/contextMenu/FileFolderInformation.vue';
import EventBus from '@/common/helpers/event-bus';
import { checkFileTypeViewVersion, generateFileDownloadUrl, generateFileEditorUrl } from '@/common/helpers/file-utils';

const { t } = useI18n();
const { serviceType } = storeToRefs(useStorageStore());
const file = ref<EcmFile>({} as EcmFile);
const isSuccessful = ref();
const viewerType = ref('');

const route = useRoute();
const router = useRouter();
const { fileId } = route.params;
const isShared = computed(() => router.currentRoute.value.name === 'EcmSharedFile');
const getFile = isShared.value ? getSharedFileGraphql(fileId as string) : getFileGraphql(serviceType.value, fileId as string);

const { md5 } = route.query;
const {
  onResult: getFileResult,
  onError: getFileError
} = getFile;

getFileResult((response) => {
  file.value = get(response, `data.${isShared.value ? 'sharedFile' : 'file'}`, null) as EcmFile;
  if (file.value) {
    isSuccessful.value = true;
    const { extension } = file.value;
    const lowerExtension = toLower(extension);
    viewerType.value = checkFileTypeViewVersion(lowerExtension);
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

</script>

<script lang='ts'>
import AudioViewerVersion from '@/apps/ecm/views/components/view-file/AudioViewerVersion.vue';
import EditableViewerVersion from '@/apps/ecm/views/components/view-file/EditableViewerVersion.vue';
import ImageViewerVersion from '@/apps/ecm/views/components/view-file/ImageViewerVersion.vue';
import PdfViewerVersion from '@/apps/ecm/views/components/view-file/PdfViewerVersion.vue';
import UnsupportedFile from '@/apps/ecm/views/components/view-file/UnsupportedFile.vue';
import VideoViewerVersion from '@/apps/ecm/views/components/view-file/VideoViewerVersion.vue';

export default {
  name: 'ViewFileVersion',

  components: {
    AudioViewerVersion,
    ImageViewerVersion,
    PdfViewerVersion,
    UnsupportedFile,
    VideoViewerVersion,
    EditableViewerVersion
  }
};
</script>