<template>
  <Dialog
    v-bind='DEFAULT_DIALOG_CONFIG'
    v-model:visible='visible'
    :header="'Chọn văn bản dự thảo'"
    style='width: 70vw;height: 80vh'
    @hide="emits('hide-dialog')">
    <div style='height: 60vh'>
      <div class='flex justify-content-end pb-2'>
        <InputText
          v-model='searchKeyword'
          class='w-20rem'
          :placeholder="t('common.search')"
          @keyup.enter='searchDatatable'/>
      </div>
      <DataTable
        v-model:selection='selectedRow'
        class='overflow-auto'
        data-key='id'
        selection-mode='multiple'
        :value='docs'
        v-bind="{
          ...DEFAULT_DATATABLE_CONFIG,
          'scroll-height': 'calc(100vh - 30rem)',
        }">
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
          class='text-center'
          header='STT'>
          <template #body='slotProps'>
            {{ slotProps.index + 1 }}
          </template>
        </Column>

        <Column
          class='text-center'
          :header="t('Trích yếu')">
          <template #body='{data: {quote, outGoingAttachments}}'>
            <div class='flex gap-2'>
              <img
                v-if='outGoingAttachments'
                :alt='outGoingAttachments[0]?.fullName'
                class='file-extension-icon h-2rem w-2rem'
                draggable='false'
                :src='getFileIcon(outGoingAttachments[0]?.fullName.split(".")[outGoingAttachments[0]?.fullName.split(".").length - 1])'/>
              <div class='align-content-center'>
                {{ quote }}
              </div>
            </div>
          </template>
        </Column>

        <Column :header="t('Tên tệp đính kèm')">
          <template #body='{ data: { outGoingAttachments } }'>
            <div
              v-if='outGoingAttachments'>
              {{ outGoingAttachments[0]?.fullName + ' (' + convertFileSize(outGoingAttachments[0]?.size) + ')' }}
            </div>
          </template>
        </Column>
      </DataTable>
    </div>
    <template #footer>
      <div class='flex flex-row gap-2 justify-content-center py-1'>
        <Button
          icon='pi pi-times'
          :label="t('common.close')"
          severity='danger'
          @click="emits('hide-dialog')"/>
        <Button
          icon='pi pi-check'
          :label="t('common.save')"
          @click='chooseDocs()'/>
      </div>
    </template>
  </Dialog>
</template>

<script setup lang="ts">

import { toLower } from 'lodash';
import { storeToRefs } from 'pinia';
import Column from 'primevue/column';
import DataTable from 'primevue/datatable';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { docOutDrafts } from '@/apps/document/api/graphql/doc-out';
import type { DocOut } from '@/apps/document/model/doc/doc-out';
import { useDocumentRolesStore } from '@/apps/document/store/document-role';
import { DEFAULT_DATATABLE_CONFIG, DEFAULT_DIALOG_CONFIG } from '@/common/constants';
import { convertFileSize, getFileIcon } from '@/common/helpers/file-utils';
import { AttachType } from '@/common/model/attachment';
import type { Edge } from '@/common/model/page';

const props = defineProps({
  visibleDialog: {
    type: Boolean,
    default: false
  }
});
const emits = defineEmits(['hide-dialog', 'choose-docs']);
const { userDeptRole } = storeToRefs(useDocumentRolesStore());
const docs = ref([] as DocOut[]);
const docsStore = ref([] as DocOut[]);
const searchKeyword = ref<string>('');
const selectedRow = ref();
const visible = ref(props.visibleDialog);
const { t } = useI18n();
const { onResult: docOutDraftsResult, load: docOutDraftsLoad } = docOutDrafts(undefined, userDeptRole.value, {
  page: 0,
  size: 999999999
});

docOutDraftsResult((res) => {
  docs.value = res.data.docOutDrafts.edges.map((edge: Edge<DocOut>) => edge.node);
  docs.value = docs.value.map((item: DocOut) => ({
    ...item,
    outGoingAttachments: item.outGoingAttachments?.filter((attachment) => attachment.attachType == AttachType.FILE_CHINH)
  }));
  docsStore.value = docs.value;
});

function searchDatatable() {
  docs.value = docsStore.value;
  if (searchKeyword.value.length > 0) {
    docs.value = docs.value.filter((doc: any) =>
      removeAccents(doc.quote).toLowerCase().includes(removeAccents(searchKeyword.value).toLowerCase())
    );
  } else {
    docs.value = docsStore.value;
  }
}

docOutDraftsLoad();

function chooseDocs() {
  emits('choose-docs', selectedRow.value);
  emits('hide-dialog');
}

function removeAccents(str: string): string {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');

}
</script>

<script lang="ts">
export default { name: 'DialogDraftDocs' };
</script>

<style scoped>

</style>