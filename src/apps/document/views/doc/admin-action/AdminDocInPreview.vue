<template>
  <DocInPreview
    :menu-actions='menuActions'
    :model='model'>
    <template #action='{viewDetail,currentAttachment,showComment}'>
      <div class='flex flex-column gap-2'>
        <i
          v-tooltip="t('common.view')"
          class='cursor-pointer hover:text-orange-500 pi pi-eye'
          @click='viewDetail'></i>
        <a
          v-if='currentAttachment'
          v-tooltip="t('document.doc.viewInNewTab')"
          class='cursor-pointer hover:text-primary pi pi-window-maximize'
          :href='currentUrl(currentAttachment)'
          target='_blank'></a>
        <AppIcon
          v-if='model?.id'
          v-tooltip="t('document.action.commentDoc')"
          class='cursor-pointer hover:text-orange-500'
          name='speaker_notes'
          size='1.15'
          @click='showComment'/>
      </div>
    </template>

  </DocInPreview>
</template>

<script setup lang="ts">

import { computed, type PropType } from 'vue';
import { useI18n } from 'vue-i18n';

import type { DocumentAttachment } from '@/apps/document/model/attachment';
import type { DocIn } from '@/apps/document/model/doc/doc-in';
import { DocumentAction } from '@/apps/document/views/doc/doc-in/action/action';
import DocInPreview from '@/apps/document/views/doc/doc-in/preview/DocInPreview.vue';
import { EDITABLE_FILE_TYPES } from '@/apps/ecm/constants';
import AppIcon from '@/common/components/app/AppIcon.vue';
import { generatePreviewFileUrl } from '@/common/helpers/file-utils';
const props = defineProps({
  model: {
    type: Object as PropType<DocIn>,
    default: undefined,
  },
  menuActions: {
    type: Array as PropType<DocumentAction[]>,
    default: () => [],
  },
});

const { t } = useI18n();

const currentUrl = (currentAttachment:DocumentAttachment) => {
  const extension = currentAttachment.fileExtension;
  if (extension && EDITABLE_FILE_TYPES.includes(extension)) {
    return currentAttachment?.filePath
      ?.replace('/main/', '/preview/')
      .replace(`.${extension}`, '.pdf');
  }
  return currentAttachment?.filePath;
};
</script>

<style scoped>

</style>