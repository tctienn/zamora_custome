<template>
  <DocOutList
    v-model:selected-document='selectedDocument'
    v-bind='$props'>
    <template #item='{doc, toggleSelected, goToDetailRoute}'>
      <DocOutCommentItem
        :model='doc'
        :selected='selectedDocument?.comment?.id===doc?.comment?.id'
        @click='toggleSelected(doc)'
        @dblclick='goToDetailRoute($router, doc)'>
      </DocOutCommentItem>
    </template>
  </DocOutList>
</template>

<script lang='ts' setup>
import type { PropType } from 'vue';

import type { DocOut } from '@/apps/document/model/doc/doc-out';
import DocOutList from '@/apps/document/views/doc/doc-out/list/DocOutList.vue';
import DocOutCommentItem from '@/apps/document/views/doc/doc-out/list/item/DocOutCommentItem.vue';

defineProps({
  docOuts: {
    type: Array as PropType<DocOut[]>,
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
  type: Object as PropType<DocOut | undefined>,
  default: undefined
});
</script>

<style scoped>

</style>