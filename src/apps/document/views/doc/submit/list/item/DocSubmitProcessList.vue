<template>
  <DocSubmitList
    v-model:selected-document='selectedDocument'
    v-bind='$props'>
    <template #item='{doc, toggleSelected, viewDetail}'>
      <DocSubmitProcessItem
        :model='doc'
        :selected='selectedDocument?.process?.id===doc?.process?.id'
        @click='toggleSelected(doc)'
        @dblclick='viewDetail()'>
      </DocSubmitProcessItem>
    </template>
  </DocSubmitList>
</template>

<script lang='ts' setup>
import type { PropType } from 'vue';

import type { DocSubmit } from '@/apps/document/model/doc/doc-submit-input';
import DocSubmitList from '@/apps/document/views/doc/submit/list/DocSubmitList.vue';
import DocSubmitProcessItem from '@/apps/document/views/doc/submit/list/item/DocSubmitProcessItem.vue';

defineProps({
  docOuts: {
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
