<template>
  <DocOutList
    v-model:selected-document='selectedDocument'
    v-bind='$props'>
    <template #item='{doc, toggleSelected}'>
      <DocOutPromulgateItem
        :model='doc'
        :selected='selectedDocument?.id===doc?.id'
        @click='toggleSelected(doc)'
        @dblclick='() => {
          visibleSidebarDetail = true;
        }'>
      </DocOutPromulgateItem>
    </template>
  </DocOutList>
  <DocumentOutDetail
    :id='selectedDocument?.id?.toString()'
    :visible='visibleSidebarDetail'
    @hide-sidebar='visibleSidebarDetail = false'/>
</template>

<script lang='ts' setup>

import { type PropType, ref } from 'vue';

import type { DocOut } from '@/apps/document/model/doc/doc-out';
import DocumentOutDetail from '@/apps/document/views/doc/doc-out/detail/DocumentOutDetail.vue';
import DocOutList from '@/apps/document/views/doc/doc-out/list/DocOutList.vue';
import DocOutPromulgateItem from '@/apps/document/views/doc/doc-out/list/item/DocOutPromulgateItem.vue';

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
const visibleSidebarDetail = ref(false);
</script>

<style scoped>

</style>