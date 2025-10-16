<template>
  <Dialog
    v-model:visible='visible'
    :header='"Chọn tài liệu"'
    style='width: 70vw;'
    v-bind='DEFAULT_DIALOG_CONFIG'
    @show='showDialog'>
    <div class='flex justify-content-end'>
      <InputText
        v-model.trim='search'
        class='mb-2'
        placeholder='Nhập Số/Ký hiệu hoặc trích yếu'
        style='min-width:20rem'>
      </InputText>
    </div>
    <DataTable
      v-model:selection='selectedRow'
      data-key='attachmentId'
      selection-mode='multiple'
      :value='docsFiltered'>
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

      <!--      <Column-->
      <!--        class='text-center'-->
      <!--        header='STT'>-->
      <!--        <template #body='slotProps'>-->
      <!--          {{ slotProps.index + 1 }}-->
      <!--        </template>-->
      <!--      </Column>-->

      <Column
        class='w-4'
        field='quote'
        :header="t('Trích yếu')"></Column>

      <Column
        class='w-2'
        field='docCode'
        :header="t('Số/Ký hiệu')"
        header-class='text-center'></Column>

      <!--      <Column-->
      <!--        body-class='text-center'-->
      <!--        field='docDate'-->
      <!--        :header="t('Ngày văn bản')">-->
      <!--        <template #body='{ data: { docDate } }'>-->
      <!--          {{ docDate ? moment(docDate).format("DD-MM-YYYY") : "" }}-->
      <!--        </template>-->
      <!--      </Column>-->
      <Column
        field='docType'
        :header="t('Loại văn bản')"
        header-class='text-center'>
        <template #body='{data}'>
          {{ data?.docType ? (docTypeLabel?.[data.docType] || '') : '' }}
        </template>
      </Column>

      <Column :header="t('Tệp đính kèm')">
        <template #body='{ data:{attachment} }'>
          <div

            class='align-items-center flex hover:text-blue-400'
            @click.stop='viewDocument(attachment)'>
            <img
              v-if='attachment?.id'
              :alt='attachment?.fileName'
              class='file-extension-icon h-2rem w-2rem'
              draggable='false'
              :src='getFileIcon(attachment?.fileExtension)'/>
            <span
              v-tooltip='t("Xem văn bản")'
              class='word-break-break-word'>
              {{ attachment?.fullName }}
            </span>
          </div>
        </template>
      </Column>
    </DataTable>
    <template #footer>
      <div class='flex flex-row gap-2 justify-content-center py-1'>
        <Button
          icon='pi pi-times'
          :label='t("common.close")'
          severity='danger'
          @click='close'/>
        <Button
          icon='pi pi-check'
          :label='t("common.save")'
          @click='submit'/>
      </div>
    </template>
  </Dialog>
</template>

<script lang="ts" setup>
import { toLower } from 'lodash';
import Column from 'primevue/column';
import DataTable from 'primevue/datatable';
import { computed, reactive, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { getDocInByUserId } from '@/apps/document/api/graphql/doc-in';
import { getDocOutByUserId } from '@/apps/document/api/graphql/doc-out';
import type { Attachment, DocAttachment } from '@/apps/work/views/task/component/detail/document/type';
import { GATEWAY_URL } from '@/common/api/configService';
import { DEFAULT_DIALOG_CONFIG } from '@/common/constants';
import { getFileIcon } from '@/common/helpers/file-utils';
import useMoment from '@/common/helpers/mixins/use-moment';
import { normalizeString } from '@/common/helpers/utils';
import type { Pageable } from '@/common/model/query';

const emits = defineEmits<{
  (e: 'close'): void,
  (e: 'submit', data: DocAttachment[]): void
}>();

const visible = defineModel<boolean>('visible', { default: false });
const { t } = useI18n();
const { moment } = useMoment();
const page = reactive<Pageable>(
  {
    page: 0,
    size: 999999
  }
);

const docTypeLabel: Record<string, string> = {
  DOC_IN: 'Văn bản đến',
  DOC_OUT: 'Văn bản đi'
};
const { load: docInLoad, result: docInResult, refetch: docInRefetch } = getDocInByUserId(page);
const { load: docOutLoad, result: docOutResult, refetch: docOutRefetch } = getDocOutByUserId(page);

const docs = computed(() => {
  const docsIn: DocAttachment[] = docInResult.value?.getAllDocInByUserId?.edges?.flatMap((e: any) =>
    e?.node?.attachments?.map((attachment: any) => ({
      id: e.node.id,
      quote: e.node.quote,
      docCode: e.node.docCode,
      docType: 'DOC_IN',
      attachment: attachment,
      attachmentId: attachment?.id
    })) || []
  ) || [];
  const docsOut: DocAttachment[] = docOutResult.value?.getAllDocOutByUserId?.edges?.flatMap((e: any) =>
    e?.node?.outGoingAttachments?.map((attachment: any) => ({
      id: e.node.id,
      quote: e.node.quote,
      docCode: e.node.docCode,
      docType: 'DOC_OUT',
      attachment: attachment,
      attachmentId: attachment?.id
    })) || []
  ) || [];

  return [...docsIn, ...docsOut];
});
const docsFiltered = computed(() => {
  if (!search.value) {
    return docs.value;
  } else {
    const searchTerm = normalizeString(search.value);
    return docs.value.filter((e: { quote: string, docCode: string }) =>
      normalizeString(e.quote || '').includes(searchTerm)
        || normalizeString(e.docCode || '').includes(searchTerm)
    );
  }
});
const selectedRow = ref();

function showDialog() {
  docInLoad() || docInRefetch();
  docOutLoad() || docOutRefetch();
}

function close() {
  visible.value = false;
  emits('close');
  selectedRow.value = undefined;
}

function submit() {
  emits('submit', selectedRow.value);
  selectedRow.value = undefined;
}

function viewDocument(attachment: Attachment) {
  window.open(GATEWAY_URL + '/files/preview/' + attachment.filePath,);
  // if (EDITABLE_FILE_TYPES.includes(extension)) {
  //   downloadAttachment(fileName, filePath);
  // } else {
  //
  // }
}

//Filter
const search = ref<string>();
</script>

<style scoped>

</style>