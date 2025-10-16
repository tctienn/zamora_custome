<template>
  <Dropdown
    v-if='totalAttachments > 1'
    v-model='currentAttachment'
    class='custom-dropdown'
    option-group-children='items'
    option-group-label='label'
    option-label='fullName'
    :options='groupedAttachments'
    :pt="{
      root: {
        class: 'surface-100 hover:surface-300 text-color hover:border-400',
      },
      input: {
        class: 'px-2 py-1'
      }
    }">
    <template
      #value='value'>
      <div
        v-if='value.value'
        class='attachment-dropdown-value'>
        <i class='pi pi-paperclip'></i>
        {{ t('common.attachment') }}
        ({{ totalAttachments }})
      </div>
      <div v-else>{{ value.placeholder }}</div>

    </template>

    <template #option='{option}'>
      <div
        class='align-items-center flex gap-2 white-space-pre-wrap word-break-break-word'
        :class='{"text-primary font-semibold": option?.attachType === AttachType.FILE_CHINH}'>
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
import type { DocOut } from '@/apps/document/model/doc/doc-out';
import { convertFileSize, getFileIcon } from '@/common/helpers/file-utils';
import { AttachType } from '@/common/model/attachment';

const props = defineProps({
  model: {
    type: Object as PropType<DocOut | undefined>,
    default: undefined
  },
});
const { t } = useI18n();

const currentAttachment = defineModel('currentAttachment', {
  type: Object as PropType<DocumentAttachment | undefined>,
  default: undefined
});

type GroupedAttachments = {
  label: string
  items: DocumentAttachment[]
};

function getMainAttachment() {
  return props.model?.outGoingAttachments?.find(attachment => attachment.attachType === AttachType.FILE_CHINH)
      || props.model?.outGoingAttachments?.[0];
}

watch(() => props.model, () => {
  currentAttachment.value = getMainAttachment();
}, { immediate: true });

const groupedAttachments = computed((): GroupedAttachments[] => [
  {
    label: t('document.doc.docOut.mainAttachments'),
    items: props.model?.outGoingAttachments || []
  },
  {
    label: t('document.doc.docOut.otherAttachments'),
    items: props.model?.outGoingFilesRelate || []
  }
]);
const totalAttachments = computed(() => (props.model?.outGoingAttachments?.length || 0) + (props.model?.outGoingFilesRelate?.length || 0));
</script>

<style scoped>
.attachment-dropdown-value {
  align-items: center;
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
  color: var(--text-color);
  white-space: pre-wrap;
  word-break: break-word;
}
</style>