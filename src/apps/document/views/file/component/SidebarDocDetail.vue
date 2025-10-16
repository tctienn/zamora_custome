<template>
  <Sidebar
    v-model:visible='visible'
    :header="t('document.doc.docInDetail.infoDoc')"
    position='right'
    v-bind='DEFAULT_DIALOG_CONFIG'
    @hide="emits('hide-dialog')">
    <div v-if="objectType === 'VB_DEN'">
      <DocInDetail :doc-id='props.docId' />
    </div>
    <div v-if="objectType === 'VB_DI'">
      <DocOutDetail :doc-id='props.docId' />
    </div>
    <div v-if="objectType === 'PHIEU_TRINH'">
      <DocSubmitDetail :doc-id='props.docId' />
    </div>
  </Sidebar>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

import DocSubmitDetail from '@/apps/document/views/doc/submit/DocSubmitDetail.vue';
import DocInDetail from '@/apps/document/views/file/component/DocInDetail.vue';
import DocOutDetail from '@/apps/document/views/file/component/DocOutDetail.vue';
import { DEFAULT_DIALOG_CONFIG } from '@/common/constants';

const props = defineProps({
  visibleDialog: {
    type: Boolean,
    default: false,
  },
  docId: {
    type: String,
    default: null,
  },
  objectType: {
    type: String,
    default: null,
  },
});

const emits = defineEmits(['hide-dialog']);
const visible = ref(props.visibleDialog);
const objectType = ref(props.objectType);
const { t } = useI18n();
</script>

<style scoped></style>
