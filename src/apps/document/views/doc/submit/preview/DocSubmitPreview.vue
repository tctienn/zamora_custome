<template>
  <div class='border-round card flex gap-3 m-0 px-4 py-3'>
    <div class='flex flex-column flex-grow-1 gap-2'>
      <div>
        {{ t('document.doc.about') }}:
        <b>{{ about }}</b>
      </div>
      <div class='flex gap-3'>
        <div class='col-9 flex flex-column gap-1 p-0'>
          <div class='grid grid-nogutter'>
            <div class='col-6'>{{ t('document.doc.number') }}: <b>{{ model?.number }}</b></div>
            <div class='col-6'>{{ t('document.doc.createdDate') }}:
              <b>{{ model?.createdTime ? moment(model?.createdTime).format('DD/MM/YYYY') : '' }}</b></div>
            <div class='col-6'>{{ t('document.doc.symbol') }}: <b>{{ model?.symbol }}</b></div>
            <div class='col-6'>{{ t('common.year') }}: <b>{{ model?.year }}</b></div>
            <div class='col-6'>{{ t('document.doc.editorDeptName') }}: <b>{{ model?.editorDeptName }}</b></div>
            <div class='col-6'>{{ t('document.doc.toPresentDeptName') }}: <b>{{ model?.toDeptPresentName }}</b></div>
          </div>
        </div>

      </div>
    </div>
    <div class='flex flex-column flex-grow-0 gap-2'>
      <!-- Fixed action buttons bar - top right -->
      <div class='action-bar-fixed position-absolute'>
        <slot
        
          name='action'>
          <div class='action-buttons-bar flex gap-2'>
            <div
              v-if='model?.id'
              v-tooltip.bottom="t('document.action.commentDoc')"
              class='action-button action-comment align-items-center cursor-pointer flex hover:border-400 justify-content-center'
              @click='visibleComment=true'>
              <AppIcon
                name='chat_add_on'
                size='1.75'></AppIcon>
            </div>
            <div
              v-tooltip.bottom="t('common.view')"
              class='action-button action-view align-items-center cursor-pointer flex hover:border-400 justify-content-center'
              @click='goToDetailRoute($router, props.model as DocSubmit)'>
              <i
                class='pi pi-eye'
                style='font-size: 18px'></i>
            </div>
            <div
              v-tooltip.bottom="t('document.doc.docInDetail.processHistory')"
              class='action-button align-items-center cursor-pointer flex hover:bg-teal-50 hover:border-400 hover:text-teal-600 justify-content-center'
              @click='viewHistory'>
              <i
                class='pi pi-history'
                style='font-size: 16px'></i>
            </div>
            <div
              v-if='currentAttachment'
              v-tooltip.bottom="t('document.doc.viewInNewTab')"
              class='action-button action-new-tab align-items-center cursor-pointer flex hover:border-400 justify-content-center'>
              <a
                class='text-decoration-none'
                :href='generatePreviewFileUrl(currentUrl)'
                target='_blank'>
                <i
                  class='pi pi-window-maximize'
                  style='font-size: 18px'></i>
              </a>
            </div>
          </div>
        </slot>
      </div>

      <!-- Reverted dropdown attachment display - bottom right -->
      <div class='attachment-dropdown-fixed relative'>
        <div class='col p-0'>
          <DocSubmitAttachmentButton
            v-model:current-attachment='currentAttachment'
            :model='model'/>
        </div>
      </div>
    </div>
  </div>
  <slot name='viewDetail'>
    <FilePreview
      v-if='currentAttachment'
      :name='previewName'
      :url='generatePreviewFileUrl(currentUrl) || ""'/>
  </slot>
  <Sidebar
    v-if='model?.id'
    v-model:visible='visibleComment'
    :dismissable='false'
    :header='t("document.action.commentDoc")'
    :modal='false'
    position='right'
    style='width: 32%'>
    <CommentDocSubmit
      :content-style='{maxHeight:"80%"}'
      :doc-id='model?.id'/>
  </Sidebar>
  <SidebarProcessHistory
    v-if='visibleProcessHistory && model?.id'
    :doc-id='model.id'
    :user-dept-role='userDeptRole'
    :visible-sidebar='visibleProcessHistory'
    @hide-dialog='visibleProcessHistory=false'/>
</template>

<script lang='ts' setup>
import { storeToRefs } from 'pinia';
import { computed, inject, type PropType, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import type { Router } from 'vue-router';

import type { DocumentAttachment } from '@/apps/document/model/attachment';
import type { DocSubmit } from '@/apps/document/model/doc/doc-submit-input';
import { useDocumentRolesStore } from '@/apps/document/store/document-role';
import CommentDocSubmit from '@/apps/document/views/doc/component/comment/comment-doc-submit/CommentDocSubmit.vue';
import { DocumentAction } from '@/apps/document/views/doc/doc-in/action/action';
import SidebarProcessHistory from '@/apps/document/views/doc/doc-in/detail/SidebarProcessHistoryDocIn.vue';
import FilePreview from '@/apps/document/views/doc/preview/FilePreview.vue';
import DocSubmitAttachmentButton from '@/apps/document/views/doc/submit/preview/DocSubmitAttachmentButton.vue';
import { EDITABLE_FILE_TYPES } from '@/apps/ecm/constants';
import AppIcon from '@/common/components/app/AppIcon.vue';
import { convertFileSize, generatePreviewFileUrl, getFileIcon } from '@/common/helpers/file-utils';
import useMoment from '@/common/helpers/mixins/use-moment';
import { AttachType } from '@/common/model/attachment';

const props = defineProps({
  model: {
    type: Object as PropType<DocSubmit>,
    default: undefined
  },
  menuActions: {
    type: Array as PropType<DocumentAction[]>,
    default: () => []
  },
});

const { t } = useI18n();
const about = computed(() => {
  return props.model?.about ? props.model.about.length > 240 ? props.model?.about?.substring(0, 240) + '...' : props.model.about : '';
});
const { moment } = useMoment();
const currentAttachment = ref<DocumentAttachment>();
const goToDetailRoute = inject('goToDetailRoute', (router: Router, doc: DocSubmit) => void {});
const { userDeptRole } = storeToRefs(useDocumentRolesStore());
const currentUrl = computed(() => {
  const extension = currentAttachment.value?.fileExtension;
  if (extension && EDITABLE_FILE_TYPES.includes(extension)) {
    return currentAttachment.value?.filePath?.replace('/main/', '/preview/')
      .replace(`.${extension}`, '.pdf');
  }
  return currentAttachment.value?.filePath;
});
const previewName = computed(() => {
  const extension = currentAttachment.value?.fileExtension;
  if (extension && EDITABLE_FILE_TYPES.includes(extension)) {
    return currentAttachment.value?.fullName.replace(`.${extension}`, '.pdf');
  }
  return currentAttachment.value?.fullName;
});
const visibleComment = ref<boolean>(false);
const visibleProcessHistory = ref(false);

const viewHistory = () => {
  visibleProcessHistory.value = true;
};
</script>

<style scoped>
/* Fixed positioning for action bar - top right */
.action-bar-fixed {
  position: relative;
  top: -12px;
  right: -5px;
  z-index: 10;
}

.action-buttons-bar {
  padding: 4px;
  float: right;
}

/* Fixed positioning for attachment dropdown - bottom right */
.attachment-dropdown-fixed {
  bottom: -10px;
  right: -5px;
  z-index: 10;
}

.attachment-dropdown-fixed .custom-dropdown {
  width: auto;
  min-width: 13rem;
  border-radius: 4px;
}

/* Action buttons styling */
.action-button {
  width: 32px;
  height: 32px;
  background: transparent;
  border: 1px solid transparent;
  transition: all 0.2s ease;
  border-radius: 4px;
  font-size: 16px;
  color: var(--text-color-secondary);
}

.action-button:hover {
  background: var(--surface-100);
  border-radius: 4px;
}

.action-view:hover {
  color: var(--orange-500);
  background: var(--orange-50);
}

.action-new-tab:hover {
  color: var(--primary-color);
  background: var(--primary-50);
}

.action-new-tab:hover a {
  color: var(--primary-color);
}

.action-comment:hover {
  color: var(--orange-500);
  background: var(--orange-50);
}

.action-button a {
  color: inherit;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  text-decoration: none;
}

/* Ensure parent container has proper positioning context */
.card.position-relative {
  position: relative;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .action-bar-fixed {
    top: 8px;
    right: 8px;
  }

  .attachment-dropdown-fixed {
    bottom: 8px;
    right: 8px;
  }

  .action-buttons-bar {
    flex-direction: column;
    gap: 4px;
  }

  .action-button {
    width: 28px;
    height: 28px;
    font-size: 14px;
  }
}

:deep(.p-dropdown-trigger) {
  width: 32px !important;
}

/* Clean up unused styles from previous image-based interface */
.attachment-gallery,
.attachment-header,
.attachment-grid,
.attachment-item,
.attachment-item:hover,
.attachment-item.attachment-active,
.attachment-item.attachment-main,
.attachment-icon,
.attachment-name,
.attachment-size,
.main-indicator {
  /* These styles are no longer needed as we reverted to dropdown */
}

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