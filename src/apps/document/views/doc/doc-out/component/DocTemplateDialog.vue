<template>
  <Sidebar
    v-model:visible='visible'
    header='Chọn tệp mẫu trong kho'
    position='right'
    v-bind='DEFAULT_DIALOG_CONFIG'
    style='width: 27rem'
    @hide="emits('hide-dialog')">
    <div class='relative'>
      <div class='grid grid-nogutter'>
        <div
          v-for='(docTemp, index) in listFile'
          :key='index'
          class='align-items-center col-6 flex justify-content-center'>
          <div
            v-tooltip.bottom="
              'Kích thước: ' + (docTemp.size / 1024).toFixed(2) + ' KB'
            "
            class='cursor-pointer file-item hover:surface-ground mb-2 overflow-hidden relative surface-100'
            :class="{
              'border-blue-500 surface-ground': filesSelected.includes(docTemp),
            }"
            style='height: 120px; width: 160px'
            @click='toggleFileSelection(docTemp)'>
            <div class='file-icon'>
              <img
                alt='File icon'
                :src="
                  getFileIcon(
                    docTemp.fullName.split('.')[
                      docTemp.fullName.split('.')?.length - 1
                    ],
                  )
                "/>
            </div>
            <div class='mt-2'>{{ truncateFileName(docTemp.fullName) }}</div>
            <div
              class='absolute btn-action flex flex-column gap-1'
              style='top: 5px; right: 5px'>
              <AppIcon
                v-tooltip="'Tải xuống'"
                name='download_2'
                size='1.3'
                @click='downloadAttachment(docTemp.fullName, docTemp.filePath)'/>
              <AppIcon
                v-tooltip="'Xem'"
                name='visibility'
                size='1.3'
                @click="
                  viewDetail(docTemp.filePath || '', docTemp.fileExtension)
                "/>
            </div>
          </div>
        </div>
      </div>
      <div
        class='bottom-0 fixed flex gap-2 justify-content-center p-1 surface-overlay w-full'>
        <Button
          class='border-round-sm p-button-plain'
          icon='pi pi-times'
          :label="t('common.close')"
          severity='danger'
          @click="emits('hide-dialog')"/>
        <Button
          class='border-round-sm'
          icon='pi pi-save'
          :label="t('common.save')"
          type='submit'
          @click='chooseTemp'/>
      </div>
    </div>
  </Sidebar>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { findAllDocTemplate } from '@/apps/document/api/graphql/attachment';
import { truncateFileName } from '@/apps/document/helpers/composable/utils';
import type { DocumentAttachment } from '@/apps/document/model/attachment';
import { EDITABLE_FILE_TYPES } from '@/apps/ecm/constants';
import { GATEWAY_URL } from '@/common/api/configService';
import AppIcon from '@/common/components/app/AppIcon.vue';
import { DEFAULT_DIALOG_CONFIG } from '@/common/constants';
import {
  downloadFileUrl,
  generateChatAttachmentDownloadUrl,
  getFileIcon,
} from '@/common/helpers/file-utils';

const props = defineProps({
  visibleDialog: {
    type: Boolean,
    default: false,
  },
});
const emits = defineEmits(['hide-dialog', 'choose-template']);
const { t } = useI18n();
const visible = ref(props.visibleDialog);

const filesSelected = ref<DocumentAttachment[]>([]);
const listFile = ref();

const { onResult: findAllDocTemplateResult } = findAllDocTemplate();
findAllDocTemplateResult((res) => {
  listFile.value = res.data.findAllDocTemplate;
});

function toggleFileSelection(docTemp: DocumentAttachment) {
  const index = filesSelected.value.findIndex(
    (file) => file.fullName === docTemp.fullName,
  );
  if (index === -1) {
    filesSelected.value = [docTemp];
  } else {
    filesSelected.value.splice(index, 1);
  }
}

function downloadAttachment(fullName: string, path?: string) {
  if (!path) {
    return;
  }
  const fileUrl = generateChatAttachmentDownloadUrl(path);
  if (fileUrl) {
    downloadFileUrl(fileUrl, fullName);
  }
}

function chooseTemp() {
  emits('hide-dialog');
  emits('choose-template', filesSelected.value);
}

function viewDetail(filePath: string, extension: string) {
  if (EDITABLE_FILE_TYPES.includes(extension)) {
    window.open(
      GATEWAY_URL
        + '/files/preview/'
        + changeFileExtension(filePath.replace('main', 'preview'), 'pdf'),
    );
  } else {
    window.open(GATEWAY_URL + '/files/preview/' + filePath);
  }
}

function changeFileExtension(filename: string, newExtension: string): string {
  return filename.replace(/\.[^/.]+$/, `.${newExtension}`);
}
</script>

<style scoped>
.file-item {
  position: relative;
  display: inline-block;
  width: 120px;
  padding: 1rem 10px;
  text-align: center;
  border-radius: 8px;
  border: 1px transparent solid;
}

.file-icon img {
  width: 40px;
  height: auto;
}

.btn-action {
  visibility: hidden;
}

.file-item:hover {
  .btn-action {
    visibility: visible;
  }
}
</style>
