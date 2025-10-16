<template>
  <DocOutPreview v-bind='$props'>
    <template #action>
      <div></div>
    </template>
    <template #viewDetail>
      <div class='align-items-start flex p-3 text-xl w-full'>
        {{ t('document.action.revokeReason') }}: {{ model?.process?.note }}
      </div>
    </template>
  </DocOutPreview>
</template>

<script lang='ts' setup>
import type { PropType } from 'vue';
import { useI18n } from 'vue-i18n';

import type { DocOut } from '@/apps/document/model/doc/doc-out';
import { DocumentAction } from '@/apps/document/views/doc/doc-in/action/action';
import DocOutPreview from '@/apps/document/views/doc/doc-out/preview/DocOutPreview.vue';

defineProps({
  model: {
    type: Object as PropType<DocOut>,
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