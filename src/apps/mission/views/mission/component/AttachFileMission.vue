<template>
  <div>
    <DataTable
      v-model:selection='selectedRow'
      class='overflow-auto w-full'
      row-hover
      show-gridlines
      striped-rows
      style='max-height: unset'
      :value='props.receivingDocs'>
      <Column
        class='text-center'
        frozen
        header='TT'
        style='width: 5%'>
        <template #body='slotProps'>
          <div
            class='align-items-center flex items-center justify-content-center'>
            {{ slotProps.index + 1 }}
          </div>
        </template>
      </Column>
      <Column
        class='col-4 text-left'
        field='quote'
        :header='t(`mission.mission.properties.shortDes`)'
        header-class='float-left'>
        <template #body='{ data }'>
          <div
            class='align-items-center cursor-pointer flex gap-2'
            @click='() => handlePreviewFile(data)'>
            <AppIcon
              class='text-red-500'
              name='description'
              size='1.5'/>
            {{ data.quote }}
          </div>
        </template>
      </Column>
      <Column
        class='col-3 text-center'
        field='attachment'
        :header='t(`mission.mission.properties.attach`)'>
        <template #body='{ data: { attachment } }'>
          {{ attachment?.name }}
        </template>
      </Column>
      <Column
        class='col-3 text-center'
        field='attachmentInfo'
        :header='t(`mission.mission.properties.size`)'>
        <template #body='{ data: { attachment } }'>
          {{ formatFileSize(attachment?.size) }}
        </template>
      </Column>
      <Column
        class='col-1 px-0 text-center'
        :header='t(`mission.mission.common.action1`)'>
        <template #body='{data}'>
          <Button
            icon='pi pi-ellipsis-v'
            rounded
            text
            @click='toggleActionMenu({event : $event, data : data})'>
          </Button>
        </template>
      </Column>
    </DataTable>
    <Menu
      ref='menuAction'
      :model='menuActions'
      :popup='true'>
      <template #item='{ item, props:itemProps }'>
        <div
          v-bind='itemProps'
          class='align-items-center cursor-pointer flex gap-2 px-4 py-2'>
          <AppIcon
            :class="item.icon === 'delete' ? 'text-red-500' : 'text-color'"
            :name='item.icon'
            size='1.5'/>
          <span>{{ item.label }}</span>
        </div>
      </template>
    </Menu>
  </div>
</template>

<script lang='ts' setup>
import Column from 'primevue/column';
import { type PropType, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import type { IFileAttachment } from '@/apps/mission/model/mission/mission';
import { generateDownloadUrl, generatePreviewFileUrl, } from '@/common/helpers/file-utils';

import { downloadFile, generateFileEditorUrl } from '../../../../../common/helpers/file-utils';
import { downloadMultiple } from '../../../../ecm/api/rest/manage';

const props = defineProps({
  receivingDocs: {
    type: Array as PropType<IFileAttachment[]>,
    required: false,
    default: () => []
  },
  onDelete: {
    type: Function as PropType<(id: string) => Promise<void>>,
    default: undefined,
  },
  isDetail: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['update:receiving-docs']);
const deletedAttachment = defineModel<Set<string>>('deletedAttachment', { default: () => new Set() });
const { t } = useI18n();
const selectedRow = ref<IFileAttachment>({} as IFileAttachment);
const menuAction = ref();

function handlePreviewFile(selectedRow: IFileAttachment) {
  console.log(selectedRow);
  
  let fileUrl: string | undefined;
  if(selectedRow.type === 'CLOUD' && selectedRow.id){
    const editUrl = generateFileEditorUrl(selectedRow.id);
    window.open(editUrl);
  } else if (typeof selectedRow.downloadPath === 'string') {
    fileUrl = generatePreviewFileUrl(selectedRow.downloadPath);
  } else if (selectedRow.attachment instanceof File) {
    fileUrl = URL.createObjectURL(selectedRow.attachment);
  }
  window.open(fileUrl, '_blank');
}

function handleDownloadFile(selectedRow: IFileAttachment) {
  let fileUrl: string | undefined;
  let filename = 'document.pdf';
  if(selectedRow.type === 'CLOUD' && selectedRow.id){
    download([{
      id: selectedRow.id,
      isFolder: false 
    }]);
  } else if (selectedRow.attachment instanceof File) {
    fileUrl = URL.createObjectURL(selectedRow.attachment);
    filename = selectedRow.attachment.name;
  } else {
    fileUrl = generateDownloadUrl(selectedRow.downloadPath);
    filename = selectedRow?.attachment?.name || 'document.pdf';
  }

  if (!fileUrl) {
    return;
  }

  const link = document.createElement('a');
  link.href = fileUrl;
  link.download = filename;
  link.click();

}

const removeFile = async (row: IFileAttachment) => {
  const isServerFile = !(row.attachment instanceof File) && row.id && row.type !== 'CLOUD';
  if (isServerFile) {
    if(row.id) {
      deletedAttachment.value.add(row.id);
      console.log(deletedAttachment.value);
    }
    const updatedReceivingDocs = props.receivingDocs.filter(item => item.id !== row.id);
    emit('update:receiving-docs', updatedReceivingDocs);
    
  } else {
    const updated = props.receivingDocs.filter(item => item !== row);
    emit('update:receiving-docs', updated);
  }
};

function download(id: { id: string, isFolder: boolean }[]) {
  downloadMultiple(undefined, id).then((res) => {
    downloadFile(res.data, res.headers['content-disposition'] ? decodeURI(res.headers['content-disposition']
      .match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/i)[1]
      .replaceAll('"', '')) : 'unknown');
  });
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024){
    return `${bytes} B`;
  } else if (bytes < 1024 * 1024){
    return `${(bytes / 1024).toFixed(2)} KB`;
  }else {
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  }
}

function toggleActionMenu({
  event,
  data
}: { event: Event, data: IFileAttachment }) {
  menuAction.value.toggle(event);
  selectedRow.value = data;
  
}
const menuActionCondition = [
  {
    label: 'Xem nội dung',
    icon: 'visibility',
    show: true,
    command: () => handlePreviewFile(selectedRow.value)
  },
  {
    label: 'Tải xuống',
    icon: 'download',
    show: true,
    command: () => handleDownloadFile(selectedRow.value)
  },
  {
    label: t('common.delete'),
    icon: 'delete',
    show: !props.isDetail,
    command: () => removeFile(selectedRow.value)
  },
];
const menuActions = menuActionCondition.filter(item => item.show);
</script>

<style scoped>
:deep(.p-datatable td) {
  white-space: normal;
  word-break: break-word;
}
</style>