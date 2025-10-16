<template>
  <DocSubmitList
    v-model:selected-document='selectedDocument'
    v-bind='$props'>
    <template #item='{doc, toggleSelected, viewDetail}'>
      <DocSubmitEditorItem
        :model='doc'
        :selected='selectedDocument?.id===doc?.id'
        @click='toggleSelected(doc)'
        @dblclick='viewDetail()'>
      </DocSubmitEditorItem>
    </template>
  </DocSubmitList>
</template>

<script lang='ts' setup>
import { inject, type PropType, type Ref, ref, watch } from 'vue';

import type { DocSubmit } from '@/apps/document/model/doc/doc-submit-input';
import type { DocumentAction } from '@/apps/document/views/doc/doc-in/action/action';
import DocSubmitList from '@/apps/document/views/doc/submit/list/DocSubmitList.vue';
import DocSubmitEditorItem from '@/apps/document/views/doc/submit/list/item/DocSubmitEditorItem.vue';

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

// Inject wrapper reactive data for action buttons communication
const wrapperSelectedDocument = inject('wrapperSelectedDocument', ref<DocSubmit | undefined>()) as Ref<DocSubmit | undefined>;

// Sync local data with wrapper
watch(selectedDocument, (newDoc) => {
  wrapperSelectedDocument.value = newDoc;
}, { immediate: true });

</script>

<style scoped>

</style>
