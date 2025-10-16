<template>
  <FilesDiscussion
    :files-on-date='filesByDate'
    style='height:calc(100vh - 17.5rem)'/>
</template>

<script lang="ts" setup>
import { computed } from 'vue';

import { getListFileOfDiscussion } from '@/apps/work/api/graphql/work-attachment';
import type { WorkAttachmentByDate } from '@/apps/work/data/WorkAttachment';
import FilesDiscussion from '@/apps/work/views/project/component/detail/FilesDiscussion.vue';

const props = defineProps({
  projectId: {
    type: String,
    default: undefined
  }
});
// const filesByDate = ref<WorkAttachmentByDate[]>([] as WorkAttachmentByDate[]);
const filesByDate = computed<WorkAttachmentByDate[]>(() => {
  return filesResult.value?.getListFileOfDiscussion;
});

const {
  onResult: filesOnResult,
  refetch: filesRefetch,
  result: filesResult
} = getListFileOfDiscussion(props.projectId || '', false);
// filesOnResult((res) => {
//   filesByDate.value = res.data.getListFileOfDiscussion;
// });
function reload() {
  filesRefetch();
}

defineExpose({ reloadFile: reload });
</script>

<style scoped>

</style>