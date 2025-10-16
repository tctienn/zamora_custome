<template>
  <div>
    <DataTable
      v-model:selection='selectedRow'
      class='overflow-auto w-full'
      row-hover
      selection-mode='single'
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
        class='col-5 text-left'
        field='quote'
        :header='t(`book-ticket.bookFlight.attachment.table.quote`)'
        header-class='float-left'>
        <template #body='{ data: {quote} }'>
          <div
            class='align-items-center flex gap-2'>
            <AppIcon
              class='text-red-500'
              name='description'
              size='1.5'/>
            {{ quote }}
          </div>
        </template>
      </Column>
      <Column
        class='col-4 text-center'
        field='attachment'
        :header='t(`book-ticket.bookFlight.attachment.table.fileName`)'>
        <template #body='{ data: { attachment } }'>
          {{ attachment?.name }}
        </template>
      </Column>
      <Column
        class='col-2 text-center'
        field='attachment'
        :header='t(`book-ticket.bookFlight.attachment.table.fileSize`)'>
        <template #body='{ data: { attachment } }'>
          {{ formatFileSize(attachment?.size) }}
        </template>
      </Column>
      <Column
        class='col-1 text-center'
        style='width: 5%'>
        <template #body='{data}'>
          <ButtonIcon
            class='text-color'
            icon='more_vert'
            icon-size='1.7'
            rounded
            text
            @click='toggleActionMenu({event : $event, data : data})'/>
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
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

import type { IAttachmentFile } from '@/apps/book-ticket/model/bookFlight';
import { generateDownloadUrl, generatePreviewFileUrl, } from '@/common/helpers/file-utils';

const props = defineProps({
  receivingDocs: {
    type: Array as PropType<IAttachmentFile[]>,
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
const { t } = useI18n();
const selectedRow = ref<IAttachmentFile>({} as IAttachmentFile);
const menuAction = ref();
function handlePreviewFile(file: File | string | undefined) {
  let fileUrl: string | undefined;
  if (typeof file === 'string') {
    fileUrl = generatePreviewFileUrl(file);
  } else if (file instanceof File) {
    fileUrl = URL.createObjectURL(file);
  }
  window.open(fileUrl, '_blank');
}

function handleDownloadFile(file: File | IAttachmentFile) {
  let fileUrl: string | undefined;
  let filename = 'document.pdf';

  if (file instanceof File) {
    fileUrl = URL.createObjectURL(file);
    filename = file.name;
  } else {
    fileUrl = generateDownloadUrl(file.downloadPath);
    filename = file?.attachment?.name || 'document.pdf';
  }

  if (!fileUrl) {
    return;
  }

  const link = document.createElement('a');
  link.href = fileUrl;
  link.download = filename;
  link.click();

}

const removeFile = async (row: IAttachmentFile) => {
  const isServerFile = !(row.attachment instanceof File) && row.id;
  if (isServerFile && props.onDelete) {
    try {
      if(row.id) {
        await props.onDelete(row.id);
      }
      const updatedReceivingDocs = props.receivingDocs.filter(item => item.id !== row.id);
      emit('update:receiving-docs', updatedReceivingDocs);
    } catch (error) {
      console.error('Lỗi khi xóa file:', error);
    }
  } else {
    const updated = props.receivingDocs.filter(item => item !== row);
    emit('update:receiving-docs', updated);
  }
};

function formatFileSize(bytes?: number): string {
  if (!bytes || isNaN(bytes)) {
    return '';
  }
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
}: { event: Event, data: IAttachmentFile }) {
  menuAction.value.toggle(event);
  selectedRow.value = data;
  
}
const menuActionCondition = [
  {
    label: 'Xem nội dung',
    icon: 'visibility',
    show: true,
    command: () => handlePreviewFile(selectedRow.value.attachment instanceof File ? selectedRow.value.attachment : selectedRow.value.downloadPath)
  },
  {
    label: 'Tải xuống',
    icon: 'download',
    show: true,
    command: () => handleDownloadFile(selectedRow.value.attachment instanceof File ? selectedRow.value.attachment : selectedRow.value)
  },
  {
    label: t('common.delete'),
    icon: 'delete',
    show: !props.isDetail,
    command: () => removeFile(selectedRow.value)
  },
];
const menuActions = computed(() => {
  return menuActionCondition.filter((item) => item.show);
});
</script>

<style scoped>

</style>