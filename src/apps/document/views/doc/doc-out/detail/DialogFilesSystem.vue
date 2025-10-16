<template>
  <Dialog
    v-model:visible='visibleDialog'
    :header="'Chọn văn bản liên quan'"
    v-bind='DEFAULT_DIALOG_CONFIG'
    style='width: 70vw'
    @hide="emits('hide-dialog')">
    <div
      class='surface'
      style='height: calc(100vh - 25rem)'>
      <div class='flex justify-content-between'>
        <div class='flex gap-8'>
          <div
            v-for='item in options'
            :key='item.value'
            class='align-content-center'>
            <label>
              <RadioButton
                v-model='source'
                name='source'
                :value='item.value'>
              </RadioButton>
              {{ item.label }}
            </label>
          </div>
        </div>
        <div class='w-20rem'>
          <InputText
            v-model='searchText'
            class='w-full'
            placeholder='Nhập Số/Ký hiệu hoặc trích yếu'
            @keyup.enter='searchDoc'/>
        </div>
      </div>

      <div
        class='surface'>
        <div
          class='py-3'>
          <DataTable
            v-model:selection='selectedRow'
            data-key='attachmentId'
            scroll-height='calc(100vh - 28rem)'
            scrollable
            selection-mode='multiple'
            :value='docs'>
            <template #empty>
              <span class='block font-bold text-600 text-center'>{{
                t("common.emptyRecords", {
                  itemType: toLower(t("văn bản")),
                })
              }}</span>
            </template>
            <Column
              header-style='width: 3rem'
              selection-mode='multiple'></Column>

            <Column
              class='text-center w-2rem'
              header='STT'>
              <template #body='slotProps'>
                {{ slotProps.index + 1 }}
              </template>
            </Column>

            <Column
              class='w-30rem'
              field='quote'
              :header="t('Trích yếu')"></Column>

            <Column
              class='w-20rem'
              field='docCode'
              :header="t('Số/Ký hiệu')"></Column>

            <Column
              class='text-center w-10rem'
              field='docDate'
              :header="t('Ngày văn bản')">
              <template #body='{ data: { docDate } }'>
                {{ docDate ? moment(docDate).format("DD/MM/YYYY") : "" }}
              </template>
            </Column>

            <Column :header="t('Tệp đính kèm')">
              <template #body='{ data: { fullName, size } }'>
                <div
                  v-if='fullName'
                  v-tooltip='fullName'>
                  <div class='flex gap-2'>
                    <img
                      v-if='fullName'
                      :alt='fullName'
                      class='file-extension-icon h-2rem w-2rem'
                      draggable='false'
                      :src='getFileIcon(fullName.split(".")[fullName.split(".").length - 1])'/>
                    <div class='align-content-center'>
                      {{ convertFileSize(size) }}
                    </div>
                  </div>
                </div>
              </template>
            </Column>

            <Column
              class='text-center'
              :header="t('common.action')">
              <template #body='{ data: {filePath, attachmentId, fileExtension} }'>
                <ButtonIcon
                  v-if='filePath'
                  v-tooltip.left='"Tải xuống"'
                  class='btnAction'
                  icon='download'
                  icon-size='1.5'
                  rounded
                  text
                  @click='attachmentId ? downloadAttachment(attachmentId) : undefined'/>
                <ButtonIcon
                  v-if='filePath'
                  v-tooltip.left='"Xem"'
                  class='btnAction'
                  icon='visibility'
                  icon-size='1.5'
                  rounded
                  text
                  @click='viewDetail(filePath, fileExtension)'/>
              </template>
            </Column>
          </DataTable>
        </div>
      </div>
    </div>

    <template #footer>
      <div class='flex flex-row gap-2 justify-content-center py-1'>
        <Button
          icon='pi pi-times'
          :label='t("common.close")'
          severity='danger'
          @click='emits("hide-dialog")'/>
        <Button
          icon='pi pi-check'
          :label='t("common.save")'
          @click='saveFile'/>
      </div>
    </template>
  </Dialog>
</template>

<script setup lang="ts">

import { toLower } from 'lodash';
import Column from 'primevue/column';
import DataTable from 'primevue/datatable';
import { computed, onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { getFilesFromSystemDocIn } from '@/apps/document/api/graphql/doc-in';
import { getFilesFromSystemDocOut } from '@/apps/document/api/graphql/doc-out';
import { findAttachmentByRole } from '@/apps/document/api/graphql/doc-submit';
import { downloadById } from '@/apps/document/api/rest/attachment';
import { DocTypeEnum } from '@/apps/document/model/docInBook';
import { useDocumentRolesStore } from '@/apps/document/store/document-role';
import { EDITABLE_FILE_TYPES } from '@/apps/ecm/constants';
import { GATEWAY_URL } from '@/common/api/configService';
import ButtonIcon from '@/common/components/custom/ButtonIcon.vue';
import { DEFAULT_DIALOG_CONFIG } from '@/common/constants';
import { convertFileSize, downloadFile, getFileIcon } from '@/common/helpers/file-utils';
import useMoment from '@/common/helpers/mixins/use-moment';

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  }
});
const emits = defineEmits(['hide-dialog', 'files']);
const { moment } = useMoment();
const { userDeptRole } = useDocumentRolesStore();
const selectedRow = ref();
const { t } = useI18n();
const visibleDialog = ref(props.visible);
const source = ref<string>('VB_DEN');
const { load: docInLoad, result: docInResult } = getFilesFromSystemDocIn();
const { load: docOutLoad, result: docOutResult } = getFilesFromSystemDocOut();
const { load: docSubmitLoad, result: docSubmitResult } = findAttachmentByRole();

const docInFiles = computed(() => docInResult.value?.getFilesFromSystemDocIn);
const docOutFiles = computed(() => docOutResult.value?.getFilesFromSystemDocOut);
const docSubmitFiles = computed(() => docSubmitResult.value?.findAttachmentByRole);
const searchText = ref<string>('');
const docsTemp = ref();
const docsComputed = computed(() => {
  switch (source.value) {
  case DocTypeEnum.VB_DEN:
    return docInFiles.value;
  case DocTypeEnum.VB_DI:
    return docOutFiles.value;
  case DocTypeEnum.PHIEU_TRINH:
    return docSubmitFiles.value;
  default:
    return undefined;
  }
});

const docs = ref();

watch(docsComputed, (value) => {
  docs.value = value;
});

watch(source, (value) => {
  searchText.value = '';
});

const options = [
  {
    label: 'Văn bản đến ',
    value: 'VB_DEN'
  },
  {
    label: 'Văn bản đi ',
    value: 'VB_DI'
  },
  {
    label: 'Phiếu trình',
    value: 'PHIEU_TRINH'
  }
];

function searchDoc() {
  docs.value = docsComputed.value;
  if (searchText.value.length > 0) {
    docs.value = docs.value.filter((d: any) => d.quote.includes(searchText.value?.trim()) || d.docCode.includes(searchText.value?.trim()));
  }
}

function saveFile() {
  emits('files', selectedRow.value.map((s: any) => {
    return {
      attachmentId: s.attachmentId,
      docCode: s.docCode,
      docDate: s.docDate,
      docId: s.docId,
      fileExtension: s.fileExtension,
      fileName: s.fileName,
      filePath: s.filePath,
      fullName: s.fullName,
      objectId: s.objectId,
      quote: s.quote,
      size: s.size
    };
  }));
  emits('hide-dialog');
}

watch(docs, (value) => {
  docsTemp.value = value;
});

onMounted(() => {
  docInLoad(undefined, { userDeptRole: userDeptRole });
  docOutLoad(undefined, { userDeptRole: userDeptRole });
  docSubmitLoad(undefined, { userDeptRole: userDeptRole });
});

function downloadAttachment(id: string) {
  downloadById(id).then((res) => {
    if (res) {
      downloadFile(res.data, res.headers['content-disposition'] ? decodeURI(res.headers['content-disposition']
        .match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/i)[1]
        .replaceAll('"', '')) : 'unknown');
    }
  });
}

function changeFileExtension(filename: string, newExtension: string): string {
  return filename.replace(/\.[^/.]+$/, `.${newExtension}`);
}

function viewDetail(filePath: string | undefined, extension: string) {
  if (filePath) {
    if (EDITABLE_FILE_TYPES.includes(extension)) {
      window.open(GATEWAY_URL + '/files/preview/' + changeFileExtension(filePath.replace('main', 'preview'), 'pdf'));
    } else {
      window.open(GATEWAY_URL + '/files/preview/' + filePath);
    }
  }
}
</script>

<style scoped></style>

<script lang="ts">
export default { name: 'DialogFilesSystem' };
</script>