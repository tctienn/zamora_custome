<template>
  <Sidebar
    v-model:visible='visible'
    :dismissable='false'
    header='Gán tài liệu vào hồ sơ'
    position='right'
    v-bind='DEFAULT_DIALOG_CONFIG'
    style='width: 60vw'
    @hide="emits('hide-dialog')">
    <div class='flex justify-content-between'>
      <div class='flex gap-4'>
        <div
          v-for='item in options'
          :key='item.value'
          class='align-items-center flex gap-2'>
          <RadioButton
            v-model='source'
            name='source'
            :value='item.value'>
          </RadioButton>
          {{ item.label }}
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
    <div class='py-3'>
      <DataTable
        v-model:selection='selectedRows'
        data-key='attachmentId'
        selection-mode='multiple'
        :value='docs'
        v-bind='DEFAULT_DATATABLE_CONFIG'>
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
          field='quote'
          :header="t('Trích yếu')"></Column>

        <Column
          class='text-center'
          field='docCode'
          :header="t('Số/Ký hiệu')"></Column>

        <Column
          class='text-center'
          field='docDate'
          :header="t('Ngày văn bản')">
          <template #body='{ data: { docDate } }'>
            {{ docDate ? moment(docDate).format("DD-MM-YYYY") : "" }}
          </template>
        </Column>

        <Column
          field='createdBy'
          header='Người tạo'>
          <template #body='{ data: { createdBy } }'>
            <div
              v-if='createdBy'
              class='flex justify-content-center'>
              <AppUser :user-id='createdBy' />
            </div>
          </template>
        </Column>
      </DataTable>
    </div>

    <div
      class='bottom-0 fixed flex gap-2 justify-content-center p-1 surface-overlay w-full'>
      <Button
        class='p-button-plain'
        icon='pi pi-times'
        :label="t('common.close')"
        severity='danger'
        @click="emits('hide-dialog')"/>
      <Button
        icon='pi pi-save'
        :label="t('common.save')"
        @click='submit' />
    </div>
  </Sidebar>
</template>

<script setup lang="ts">
import { toLower } from 'lodash';
import Column from 'primevue/column';
import DataTable from 'primevue/datatable';
import { computed, onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { getFilesFromSystemDocIn } from '@/apps/document/api/graphql/doc-in';
import { getFilesFromSystemDocOut } from '@/apps/document/api/graphql/doc-out';
import { saveDocs } from '@/apps/document/api/graphql/file';
import { DocTypeEnum } from '@/apps/document/model/docInBook';
import { useDocumentRolesStore } from '@/apps/document/store/document-role';
import AppUser from '@/common/components/app/AppUser.vue';
import {
  DEFAULT_DATATABLE_CONFIG,
  DEFAULT_DIALOG_CONFIG,
} from '@/common/constants';
import {
  toastErrorData,
  toastSuccess,
} from '@/common/helpers/custom-toast-service';
import useMoment from '@/common/helpers/mixins/use-moment';

const props = defineProps({
  visibleDialog: {
    type: Boolean,
    default: false,
  },
  id: {
    type: String,
    default: null,
  },
});
const emits = defineEmits(['hide-dialog', 'reload']);
const { moment } = useMoment();
const { userDeptRole } = useDocumentRolesStore();
const selectedRows = ref();
const { t } = useI18n();

const visible = ref(props.visibleDialog);
const source = ref<string>('VB_DEN');
const { load: docInLoad, result: docInResult } = getFilesFromSystemDocIn();
const { load: docOutLoad, result: docOutResult } = getFilesFromSystemDocOut();

const docInFiles = computed(() => docInResult.value?.getFilesFromSystemDocIn);
const docOutFiles = computed(
  () => docOutResult.value?.getFilesFromSystemDocOut,
);
const searchText = ref<string>('');
const docsTemp = ref();
const docs = computed(() => {
  switch (source.value) {
  case DocTypeEnum.VB_DEN:
    return docInFiles.value;
  case DocTypeEnum.VB_DI:
    return docOutFiles.value;
  default:
    return undefined;
  }
});
const {
  mutate: saveDocsMutate,
  onDone: saveDocsOnDone,
  onError: saveDocsOnError,
} = saveDocs();

const submit = () => {
  saveDocsMutate({
    id: props.id,
    listDocs: selectedRows.value.map((item: any) => ({
      docId: item.docId,
      type: source.value,
    })),
  });
};

saveDocsOnDone(() => {
  toastSuccess({ message: t('document.file.saveDone') });
  emits('hide-dialog');
  emits('reload');
});

saveDocsOnError((error) => {
  toastErrorData({ error });
  emits('hide-dialog');
  emits('reload');
});

const options = [
  {
    label: 'Văn bản đến ',
    value: 'VB_DEN',
  },
  {
    label: 'Văn bản đi ',
    value: 'VB_DI',
  },
  {
    label: 'Phiếu trình',
    value: 'PHIEU_TRINH',
  },
];

watch(docs, (value) => {
  docsTemp.value = value;
});

onMounted(() => {
  docInLoad(undefined, { userDeptRole: userDeptRole });
  docOutLoad(undefined, { userDeptRole: userDeptRole });
});

function searchDoc() {}
</script>

<style scoped></style>
