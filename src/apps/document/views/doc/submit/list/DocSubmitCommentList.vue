<template>
  <DocSubmitList
    v-model:selected-document='selectedDocument'
    v-bind='$props'>
    <template #item='{doc, toggleSelected, viewDetail}'>
      <DocSubmitCommentItem
        :model='doc'
        :selected='selectedDocument?.comment?.id===doc?.comment?.id'
        @click='toggleSelected(doc)'
        @dblclick='viewDetail()'>
      </DocSubmitCommentItem>
    </template>
  </DocSubmitList>
</template>

<script lang='ts' setup>
import type { PropType } from 'vue';

import type { DocSubmit } from '@/apps/document/model/doc/doc-submit-input';
import DocSubmitList from '@/apps/document/views/doc/submit/list/DocSubmitList.vue';
import DocSubmitCommentItem from '@/apps/document/views/doc/submit/list/item/DocSubmitCommentItem.vue';

defineProps({
  docSubmits: {
    type: Array as PropType<DocSubmit[]>,
    default: () => []
  },
  total: {
    type: Number,
    default: 0
  },
  loading: {
    type: Boolean,
    default: false
  },
});

const selectedDocument = defineModel('selectedDocument', {
  type: Object as PropType<DocSubmit | undefined>,
  default: undefined
});
</script>

<style scoped>

</style>
