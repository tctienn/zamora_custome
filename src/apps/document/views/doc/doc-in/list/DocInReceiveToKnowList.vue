<template>
  <DocInList
    :doc-ins='docIns'
    :loading='loading'
    :selected-document='selectedDocument'
    :total='total'
    @update:selected-document='emits("update:selected-document", $event)'>
    <template #item='{doc, toggleSelected, viewDetail}'>
      <DocInReceiveToKnowItem
        :model='doc'
        :selected='selectedDocument?.cc?.id === doc.cc?.id'
        @click='toggleSelected(doc)'
        @dblclick='viewDetail($router, doc)'/>
    </template>
  </DocInList>
</template>

<script lang='ts' setup>

import type { PropType } from 'vue';

import type { DocIn } from '@/apps/document/model/doc/doc-in';
import DocInList from '@/apps/document/views/doc/doc-in/list/DocInList.vue';
import DocInReceiveToKnowItem from '@/apps/document/views/doc/doc-in/list/item/DocInReceiveToKnowItem.vue';

defineProps({
  docIns: {
    type: Array as PropType<DocIn[]>,
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
  selectedDocument: {
    type: Object as PropType<DocIn | undefined>,
    default: undefined
  }
});
const emits = defineEmits(['update:selected-document']);
</script>

<style scoped>

</style>
