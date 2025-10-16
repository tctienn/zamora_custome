<template>
  <div class='column-gap-2 ecm-group flex flex-grow-1 flex-row h-full'>
    <div class='flex flex-column flex-grow-1 h-full row-gap-3'>
      <div
        v-if='isSuccessful == null'
        class='mx-0 my-auto'>
        <AppLoader/>
      </div>
      <div
        v-else-if='isSuccessful'
        class='align-items-center flex flex-column h-full'>
        <div class='flex flex-row justify-content-between my-3 w-full'>
          <div class='col-1'>
            <ButtonIcon
              icon='arrow_back'
              icon-size='2'
              rounded
              text
              @click='$router.back()'/>
          </div>
          <h3 class='col-10 m-0 text-center'>
            {{ file['name'] }}
          </h3>

          <div class='col-1 column-gap-1 flex flex-row justify-content-end text-right'>
            <ButtonIcon
              v-tooltip='"Tải xuống"'
              class='p-0 p-button p-button-text p-component'
              icon='download'
              icon-size='2'
              @click='download'/>
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
        <div
          class='align-items-center flex flex-grow-1 justify-content-center w-full'>
          <FilePreview
            v-if='file'
            :name='file.name'
            :url='(url as string ||"").replace("/download/","/preview/")'/>
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

<script setup lang="ts">
import { get } from 'lodash';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';

import FilePreview from '@/apps/document/views/doc/preview/FilePreview.vue';
import { getFileByIdGraphql } from '@/apps/work/api/graphql/attachment-api';
import { saveDownloadTaskAttachmentLog } from '@/apps/work/api/rest/task-attachment';
import type { AttachmentInterface } from '@/apps/work/model/attachmentTask';
import FileFolderInformation from '@/apps/work/views/component/view-file/FileFolderInformation.vue';
import { downloadFileUrl } from '@/common/helpers/file-utils';

const route = useRoute();
const { attachmentId, url } = route.query;
const { t } = useI18n();
const file = ref<AttachmentInterface>({} as AttachmentInterface);
const isSuccessful = ref();

const getFile = getFileByIdGraphql(attachmentId as string);

const {
  onResult: getFileResult,
  onError: getFileError
} = getFile;

getFileResult(async (response: any) => {
  file.value = await get(response, 'data.getFileById', null) as AttachmentInterface;
  isSuccessful.value = !!file.value;
});

getFileError(() => {
  isSuccessful.value = false;
});

const informationVisible = ref(false);

function showInfo() {
  informationVisible.value = true;
}

function hideDialogInfo() {
  informationVisible.value = false;
}

function download() {
  downloadFileUrl(url as string, file.value.name);
  saveDownloadTaskAttachmentLog(attachmentId as string);
}
</script>

<style scoped>

</style>