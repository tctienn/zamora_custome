<template>
  <DocInPreview v-bind='$props'>
    <template #action>
      <div></div>
    </template>
    <template #viewDetail>
      <div class='align-items-start flex p-3 text-xl w-full'>
        {{ t('document.action.revokeReason') }}: {{ model?.process?.note }}
      </div>
    </template>
  </DocInPreview>
</template>

<script lang='ts' setup>

import type { PropType } from 'vue';
import { useI18n } from 'vue-i18n';

import type { DocIn } from '@/apps/document/model/doc/doc-in';
import { DocumentAction } from '@/apps/document/views/doc/doc-in/action/action';
import DocInPreview from '@/apps/document/views/doc/doc-in/preview/DocInPreview.vue';

defineProps({
  model: {
    type: Object as PropType<DocIn>,
    default: undefined
  },
  menuActions: {
    type: Array as PropType<DocumentAction[]>,
    default: () => []
  },
});
const { t } = useI18n();
</script>

<style scoped>

</style>