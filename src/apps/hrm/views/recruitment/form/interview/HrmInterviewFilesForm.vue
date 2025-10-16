<template>
  <Button
    class='mb-2 p-button-plain'
    icon='pi pi-plus'
    label='Chọn file'
    size='small'
    @click='showAddFileDialog=true'/>
  <AttachmentFileList
    v-model:receiving-docs='files'/>
  <AddFileModal
    v-if='showAddFileDialog'
    v-model:visible-dialog='showAddFileDialog'
    @submit='handleSubmitFile' />
</template>

<script lang='ts' setup>
import type { PropType } from 'vue';
import { ref } from 'vue';

import type { IAttachmentFile } from '@/apps/book-ticket/model/bookFlight';
import AddFileModal from '@/apps/book-ticket/views/bookFlight/component/AddFileModal.vue';
import AttachmentFileList from '@/apps/book-ticket/views/bookFlight/component/AttachmentFileList.vue';
const files = defineModel('files', {
  type: Array as PropType<IAttachmentFile[]>,
  default: [], 
});

const showAddFileDialog = ref<boolean>(false);
const handleSubmitFile = (fileData: IAttachmentFile) => {
  files.value = [...files.value, fileData];
};
</script>
