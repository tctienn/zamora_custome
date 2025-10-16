<template>
  <div
    class='flex gap-2'
    style='height: calc(100vh - 9rem)'>
    <div
      class='h-full overflow-x-hidden overflow-y-auto p-0'
      style='width: 35rem'>
      <slot name='list'>
        <DocSubmitList
          v-model:selectedDocument='selectedDocument'
          :doc-submits='docSubmits'
          :loading='loading'
          :total='total'/>
      </slot>
    </div>
    <div class='col h-full overflow-x-auto p-0'>
      <div
        class='flex flex-column gap-1'
        style='height: calc(100vh - 9rem)'>
        <!--        <DocSubmitButtonActions-->
        <!--          :doc='selectedDocument'-->
        <!--          :menu-actions='menuActions'/>-->
        <slot
          v-if='selectedDocument'
          name='preview'
          :selected-document='selectedDocument'>
          <DocSubmitPreview :model='selectedDocument'/>
        </slot>

        <EmptyDocSelectedPreview v-else/>
      </div>
    </div>
  </div>
</template>

<script lang='ts' setup>

import { storeToRefs } from 'pinia';
import { onMounted, type PropType, provide, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import type { DocSubmit } from '@/apps/document/model/doc/doc-submit-input';
import { DocumentAction } from '@/apps/document/views/doc/doc-in/action/action';
import EmptyDocSelectedPreview from '@/apps/document/views/doc/EmptyDocSelectedPreview.vue';
import DocSubmitButtonActions from '@/apps/document/views/doc/submit/actions/DocSubmitButtonActions.vue';
import DocSubmitList from '@/apps/document/views/doc/submit/list/DocSubmitList.vue';
import DocSubmitPreview from '@/apps/document/views/doc/submit/preview/DocSubmitPreview.vue';
import useMoment from '@/common/helpers/mixins/use-moment';
import { useGlobalSearchStore } from '@/common/store/search';

const props = defineProps({
  menuActions: {
    type: Array as PropType<DocumentAction[]>,
    default: () => [],
  },
  docSubmits: {
    type: Array as PropType<DocSubmit[]>,
    default: () => [],
  },
  total: {
    type: Number,
    default: 0,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  fields: {
    type: Object as PropType<any>,
    default: null,
  },
});
const selectedDocument = defineModel('selectedDocument', {
  type: Object as PropType<DocSubmit | undefined>,
  default: undefined,
});
provide('doc', selectedDocument);

watch(
  () => props.docSubmits,
  (value) => {
    const find = value.find(
      (doc) =>
        doc.id === selectedDocument.value?.id
              && (doc.processId
                ? doc.processId === selectedDocument.value?.processId
                : true)
              && (doc.commentId
                ? doc.commentId === selectedDocument.value?.commentId
                : true),
    );
    if (find) {
      selectedDocument.value = find;
      return;
    }
    if (value.length > 0) {
      selectedDocument.value = value[0];
    } else {
      selectedDocument.value = undefined;
    }
  },
);
const { t } = useI18n();
const { moment } = useMoment();
const { submit, model } = storeToRefs(useGlobalSearchStore());
const { setFields } = useGlobalSearchStore();
onMounted(() => {
  if (props.fields) {
    setFields(props.fields);
  }
});
</script>

<style scoped>

</style>