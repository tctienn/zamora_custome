<template>
  <Dropdown
    v-if='totalAttachments > 1'
    v-model='currentAttachment'
    option-group-children='items'
    option-group-label='label'
    option-label='fullName'
    :options='groupedAttachments'
    :pt='{
      root: {
        class: "bg-primary hover:bg-primary-600",
      }
    }'>
    <template
      #value='value'>
      <div
        v-if='value.value'
        class='align-items-center flex gap-1 text-white white-space-pre-wrap word-break-break-word'>
        <i class='pi pi-paperclip'></i>
        {{ t('common.attachment') }}
        ({{ totalAttachments }})
      </div>
      <div v-else>{{ value.placeholder }}</div>

    </template>

    <template #option='{option}'>
      <div
        class='align-items-center flex gap-2 white-space-pre-wrap word-break-break-word'
        :class='{"text-primary font-semibold": option?.attachType === AttachType.FILE_TRINH_KY}'>
        <img
          alt='option.fullName'
          class='h-1rem'
          :src='getFileIcon(option?.fileExtension)'>
        {{ option.fullName }}
        ({{ convertFileSize(option?.size) }})
      </div>
    </template>
  </Dropdown>
</template>

<script lang='ts' setup>
import { computed, type PropType, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import type { DocumentAttachment } from '@/apps/document/model/attachment';
import type { DocSubmit } from '@/apps/document/model/doc/doc-submit-input';
import { convertFileSize, getFileIcon } from '@/common/helpers/file-utils';
import { AttachType } from '@/common/model/attachment';

const props = defineProps({
  model: {
    type: Object as PropType<DocSubmit | undefined>,
    default: undefined
  },
});
const currentAttachment = defineModel('currentAttachment', {
  type: Object as PropType<DocumentAttachment | undefined>,
  default: undefined
});
const { t } = useI18n();

type GroupedAttachments = {
  label: string
  items: DocumentAttachment[]
};

function getMainAttachment() {
  return props.model?.filePresentationDocSubmit?.find(attachment => attachment.attachType === AttachType.FILE_TRINH_KY)
      || props.model?.filePresentationDocSubmit?.[0];
}

watch(() => props.model, () => {
  currentAttachment.value = getMainAttachment();
}, { immediate: true });

const groupedAttachments = computed((): GroupedAttachments[] => [
  {
    label: t('document.doc.docSubmit.presentFile'),
    items: props.model?.filePresentationDocSubmit || []
  },
  {
    label: t('document.doc.docSubmit.relatedDocs'),
    items: props.model?.relatedDocuments || []
  }
]);
const totalAttachments = computed(() => (props.model?.filePresentationDocSubmit?.length || 0) + (props.model?.relatedDocuments?.length || 0));
</script>

<style scoped>

</style>