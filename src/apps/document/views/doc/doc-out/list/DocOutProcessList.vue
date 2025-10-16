<template>
  <DocOutList
    v-model:selected-document='selectedDocument'
    v-bind='$props'>
    <template #item='{doc, toggleSelected, goToDetailRoute}'>
      <DocOutProcessItem
        :model='doc'
        :selected='selectedDocument?.process?.id===doc?.process?.id'
        @click='toggleSelected(doc)'
        @dblclick='goToDetailRoute($router, doc)'>
      </DocOutProcessItem>
    </template>
  </DocOutList>
</template>

<script lang='ts' setup>
import type { PropType } from 'vue';

import type { DocOut } from '@/apps/document/model/doc/doc-out';
import DocOutList from '@/apps/document/views/doc/doc-out/list/DocOutList.vue';
import DocOutProcessItem from '@/apps/document/views/doc/doc-out/list/item/DocOutProcessItem.vue';

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