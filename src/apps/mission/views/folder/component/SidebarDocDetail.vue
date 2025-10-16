<template>
  <Sidebar
    v-model:visible='visible'
    header='Tài liệu'
    position='right'
    v-bind='DEFAULT_DIALOG_CONFIG'
    @hide="emits('hide-dialog')">
    <AttachFileMission
      v-model:receiving-docs='attachments'
      class='mt-2'
      :is-detail='true'/>
  </Sidebar>
</template>

<script setup lang='ts'>
import { ref } from 'vue';

import { findAllJobAttachmentByJobIdIn } from '@/apps/mission/api/graphql/job-api';
import type { FileAttachmentInterface } from '@/apps/mission/model/mission/mission';
import AttachFileMission from '@/apps/mission/views/mission/component/AttachFileMission.vue';
import { DEFAULT_DIALOG_CONFIG } from '@/common/constants';

const props = defineProps({
  visibleDialog: {
    type: Boolean,
    default: false,
  },
  jobId: {
    type: String,
    default: null,
  },
});

const emits = defineEmits(['hide-dialog']);
const visible = ref(props.visibleDialog);
const attachments = ref<any>(null);
const { onResult: findAllJobAttachmentByJobIdInResult, } = findAllJobAttachmentByJobIdIn([props.jobId]);

findAllJobAttachmentByJobIdInResult((res) => {
  attachments.value = res.data.findAllJobAttachmentByJobIdIn?.map((att: FileAttachmentInterface) => ({
    quote: att.quote || '',
    attachment: {
      name: att.attachment,
      size: att.size
    },
    downloadPath: att.downloadPath,
    id: att.id
  }));
});
</script>

<style scoped></style>
