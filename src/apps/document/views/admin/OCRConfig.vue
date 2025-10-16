<template>
  <div class='align-items-center flex flex-wrap justify-content-between pb-2'>
    <span class='font-bold text-primary text-xl'>{{
      t(`document.ocrConfig.title`)
    }}</span>
  </div>

  <div class='flex justify-content-between'>
    <TabView
      v-model:activeIndex='activeStatus'
      @tab-change='tabChange'>
      <TabPanel
        v-for='(tab, index) in tabMenus'
        :key='index'
        class='hover:surface-hover'
        :header='tab.title'>
      </TabPanel>
    </TabView>
    <div class='block p-input-icon-left'>
      <div class='actions flex gap-2'>
        <ButtonIcon
          class='btn-create'
          icon='add'
          @click='addRowOCRConfig'/>
      </div>
    </div>
  </div>
  <DataTable
    edit-mode='cell'
    :value='ocrConfigs'>
    <Column
      header='#'
      style='width: 5%; text-align: center'>
      <template #body='slotProps'>
        <div
          class='align-items-center flex items-center justify-content-center'>
          {{ slotProps.index + 1 }}
        </div>
      </template>
    </Column>

    <Column
      v-for='col in editableColumns'
      :key='col.field'
      :field='col.field'
      :header='col.header'
      :style='col.style'>
      <template #body='{ index }'>
        <template v-if='ocrConfigs[index][col.field]'>
          {{
            col.displayFormatter
              ? col.displayFormatter(ocrConfigs[index][col.field])
              : ocrConfigs[index][col.field]
          }}
        </template>
        <template v-else>
          <component
            :is='col.component'
            v-model='ocrConfigs[index][col.field]'
            v-bind='col.props'
            autofocus
            :class="
              col.validationClass
                ? col.validationClass(ocrConfigs[index][col.field])
                : ''
            "
            @input="
              col.field === 'field'
                ? (ocrConfigs[index][col.field] =
                  ocrConfigs[index][col.field]?.replace(/\s+/g, '') || '')
                : null
            "/>

          <small
            v-if='col.errorMessage && !ocrConfigs[index][col.field]'
            class='p-error'>
            {{ col.errorMessage }}
          </small>
        </template>
      </template>
      <template #editor='{ index }'>
        <component
          :is='col.component'
          v-model='ocrConfigs[index][col.field]'
          v-bind='col.props'
          autofocus
          :class="
            col.validationClass
              ? col.validationClass(ocrConfigs[index][col.field])
              : ''
          "
          @input="
            col.field === 'field'
              ? (ocrConfigs[index][col.field] =
                ocrConfigs[index][col.field]?.replace(/\s+/g, '') || '')
              : null
          "/>
        <small
          v-if='col.errorMessage && !ocrConfigs[index][col.field]'
          class='p-error'>
          {{ col.errorMessage }}
        </small>
      </template>
    </Column>

    <Column style='width: 10%; text-align: center'>
      <template #body='slotProps'>
        <ButtonIcon
          v-tooltip.top="t('common.delete')"
          icon='delete'
          icon-size='1.7'
          rounded
          text
          @click='deleteOCR(slotProps.index, slotProps.data)'/>
      </template>
    </Column>
  </DataTable>

  <div class='flex justify-content-center mt-2'>
    <Button
      icon='pi pi-save'
      :label="t('common.save')"
      :loading='isProcessing'
      @click='submit'/>
  </div>
</template>

<script setup lang="ts">
import { cloneDeep } from 'lodash';
import Column from 'primevue/column';
import type { MenuItem } from 'primevue/menuitem';
import { useConfirm } from 'primevue/useconfirm';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

import {
  deleteOCRConfig,
  DocumentType,
  FieldType,
  getAllOCRConfigs,
  saveOCRConfigs,
} from '@/apps/document/api/graphql/ocr-config';
import ButtonIcon from '@/common/components/custom/ButtonIcon.vue';
import { toastSuccess } from '@/common/helpers/custom-toast-service';

const { t } = useI18n();
const isProcessing = ref(false);
const activeStatus = ref<number>(0);
const currentTab = ref('INCOMING_DOC');

type Config = {
  id: string | null;
  field: string | null;
  name: string | null;
  regex: string | null;
  type: string | null;
};

const ocrConfigs = ref<Config[]>([]);

function addRowOCRConfig() {
  ocrConfigs.value = [
    ...ocrConfigs.value,
    {
      id: null,
      field: '',
      name: null,
      regex: null,
      type: FieldType.TEXT,
    },
  ];
}

const { onResult: getAllOCRConfigsOnResult, refetch: getAllOCRConfigsRefetch } =
    getAllOCRConfigs(DocumentType.INCOMING_DOC);

getAllOCRConfigsOnResult((res) => {
  ocrConfigs.value = cloneDeep(res.data.getAllOCRConfigs);
});

function tabChange() {
  currentTab.value = tabMenus.value[activeStatus.value].code;
  if (currentTab.value) {
    getAllOCRConfigsRefetch({ docType: currentTab.value });
  }
}

const { mutate: saveOCRConfigsMutate, onDone: saveOCRConfigsOnDone } =
    saveOCRConfigs();

function submit() {
  const errorFields = document.querySelectorAll('.p-invalid');
  if (
    isProcessing.value
      || ocrConfigs.value.length === 0
      || errorFields.length > 0
  ) {
    return;
  }
  isProcessing.value = true;
  saveOCRConfigsMutate({
    configs: ocrConfigs.value,
    typeDoc: currentTab.value,
  });
}

saveOCRConfigsOnDone(() => {
  isProcessing.value = false;
  toastSuccess({ message: t('Lưu thành công.') });
  getAllOCRConfigsRefetch({ docType: currentTab.value });
});

const tabMenus = ref<MenuItem & { code: string; title: string }[]>([
  {
    code: DocumentType.INCOMING_DOC,
    title: t('document.book.docCome'),
  },
  {
    code: DocumentType.OUTGOING_DOC,
    title: t('document.book.docOut'),
  },
  {
    code: DocumentType.SUBMIT_DOC,
    title: t('document.book.docSubmit'),
  },
]);

const types = ref([
  {
    label: 'Ký tự',
    code: FieldType.TEXT,
  },
  {
    label: 'Số',
    code: FieldType.NUMBER,
  },
  {
    label: 'Ngày',
    code: FieldType.DATE,
  },
]);

const { mutate: deleteOCRConfigMutate, onDone: deleteOCRConfigDone } =
    deleteOCRConfig();
const confirm = useConfirm();

function deleteOCR(index: number, data: any) {
  confirm.require({
    message:
        t('document.ocrConfig.confirmDelete') + ': ' + data.name || data.field,
    header: t('common.confirm'),
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: t('common.delete'),
    acceptClass: 'p-button-danger',
    accept: () => {
      deleteOCRConfigMutate({ id: data.id });
      ocrConfigs.value = ocrConfigs.value.filter((_, i) => i !== index);
    },
  });
}

deleteOCRConfigDone(() => {
  toastSuccess({ message: t('document.ocrConfig.deleteDone') });
});

type ColumnConfig = {
  field: keyof Config;
  header: string;
  style?: string;
  component?: string;
  props?: Record<string, any>;
  validationClass?: (value: any) => string;
  displayFormatter?: (value: any) => string;
  errorMessage?: string;
};

const editableColumns: ColumnConfig[] = [
  {
    field: 'field',
    header: 'Trường',
    style: 'width: 20%',
    component: 'InputText',
    props: { class: 'w-full' },
    validationClass: (value: any) => !value ? 'p-invalid' : '',
    errorMessage: t('document.ocrConfig.requiredField'),
  },
  {
    field: 'name',
    header: 'Tên',
    style: 'width: 20%',
    component: 'InputText',
    props: { class: 'w-full' },
    validationClass: () => '',
  },
  {
    field: 'regex',
    header: 'Regex',
    style: 'width: 20%',
    component: 'InputText',
    props: { class: 'w-full' },
    validationClass: (value: any) => !value ? 'p-invalid' : '',
    errorMessage: t('document.ocrConfig.requiredRegex'),
  },
  {
    field: 'type',
    header: 'Kiểu',
    style: 'width: 20%',
    component: 'Dropdown',
    props: {
      class: 'w-full',
      'option-label': 'label',
      'option-value': 'code',
      options: types.value,
      placeholder: 'Chọn',
    },
    validationClass: () => '',
    displayFormatter: (value: any) =>
      types.value.find((type) => type.code === value)?.label || '',
  },
];
</script>

<style scoped>
:deep(.p-tabview-panels) {
  display: none;
}

:deep(.p-tabview-nav-link) {
  padding: 1rem 1rem;
}
</style>
