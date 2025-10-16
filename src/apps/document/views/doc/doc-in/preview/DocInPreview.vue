<template>
  <div class='border-round-sm card flex gap-3 m-0 position-relative px-4 py-3 shadow-none'>
    <div class='flex flex-column flex-grow-1 gap-2'>
      <div class='font-semibold'>
        {{ quote }}
      </div>
      <div class='flex gap-3'>
        <div class='flex flex-column flex-grow-1 gap-1 p-0'>
          <div class='grid grid-nogutter'>
            <div class='col-6'>
              {{ t("document.doc.book.type.label") }}:
              <b>{{
                bookName
              }}</b>
            </div>
            <div class='col-6'>
              {{ t("document.doc.book.docInNumber") }}:
              <b>{{ model?.book?.bookNumber }}</b>
            </div>
            <div class='col-6 py-2'>
              {{ t("document.doc.publisher") }}:
              <b>{{ model?.publisherName }}</b>
            </div>
            <div class='col-6 py-2'>
              {{ t("document.doc.type") }}: <b>{{ model?.docTypeName }}</b>
            </div>
            <div class='col-6'>
              {{ t("document.doc.code") }}: <b>{{ model?.docCode }}</b>
            </div>
            <div class='col-6'>
              {{ t("document.doc.incomingDate") }}:
              <b>{{
                model?.docDate
                  ? moment(model?.docDate).format("DD/MM/YYYY")
                  : ""
              }}</b>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class='flex flex-column flex-grow-0 gap-2'>
      <!-- Fixed action buttons bar - top right -->
      <div class='action-bar-fixed position-absolute'>
        <slot
          :current-attachment='currentAttachment'
          name='action'
          :show-comment='showComment'
          :view-detail='goToDetail'>
          <div class='action-buttons-bar flex gap-2'>
            <div
              v-if='model?.id'
              v-tooltip.bottom="t('document.action.commentDoc')"
              class='action-button action-comment align-items-center cursor-pointer flex hover:border-400 justify-content-center'
              @click='showComment'>
              <AppIcon
                name='chat_add_on'
                size='1.75'></AppIcon>
            </div>
            <div
              v-tooltip.bottom="t('common.view')"
              class='action-button action-view align-items-center cursor-pointer flex hover:border-400 justify-content-center'
              @click='goToDetail'>
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
        <Dropdown
          v-if='model?.attachments && (model?.attachments?.length || 0) > 1'
          v-model='currentAttachment'
          class='custom-dropdown'
          :options='model?.attachments'
          :placeholder="t('common.attachment')"
          :pt="{
            root: {
              class: 'surface-100 hover:surface-300 text-color hover:border-400',
            },
            input: {
              class: 'px-2 py-1'
            }
          }">
          <template #value='value'>
            <div
              v-if='value.value'
              class='attachment-dropdown-value'>
              <i class='pi pi-paperclip'></i>
              <p class='mb-0'> {{ t("common.attachment") }}
                ({{ model.attachments.length }})</p>
            </div>
            <div v-else>{{ value.placeholder }}</div>
          </template>
          <template #option='{ option }'>
            <div
              class='align-items-center flex gap-2 white-space-pre-wrap word-break-break-word'
              :class="{
                'text-primary font-semibold':
                  option?.attachType === AttachType.FILE_CHINH,
              }">
              <img
                alt='option.fullName'
                class='h-1rem'
                :src='getFileIcon(option?.fileExtension)'/>
              {{ option.fullName }}
              ({{ convertFileSize(option?.size) }})
            </div>
          </template>
        </Dropdown>
      </div>
    </div>

  </div>

  <slot name='viewDetail'>
    <FilePreview
      v-if='currentAttachment'
      :name='previewName'
      :url="generatePreviewFileUrl(currentUrl) || ''"/>
  </slot>

  <Sidebar
    v-if='model?.id'
    v-model:visible='visibleComment'
    :dismissable='false'
    :header="t('document.action.commentDoc')"
    :modal='false'
    position='right'
    style='width: 32%'>
    <CommentDocIn
      :content-style="{ maxHeight: '80%' }"
      :disabled='(model.processId?model?.status: model?.book?.status) == "DA_XL"'
      :doc-id='model?.id'/>
  </Sidebar>
  <DocumentInDetail
    v-if='visibleDetail'
    :id='model?.id'
    :visible='visibleDetail'
    @hide-sidebar='visibleDetail = false'/>

  <SidebarProcessHistory
    v-if='visibleProcessHistory && model?.id'
    :doc-id='model.id'
    :user-dept-role='userDeptRole'
    :visible-sidebar='visibleProcessHistory'
    @hide-dialog='visibleProcessHistory=false'/>
</template>

<script lang="ts" setup>
import { storeToRefs } from 'pinia';
import { computed, inject, type PropType, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { type Router, useRouter } from 'vue-router';

import { getBookByIdReturnList } from '@/apps/document/api/graphql/book';
import { findLastProcessByDocId } from '@/apps/document/api/graphql/incoming-process';
import type { DocumentAttachment } from '@/apps/document/model/attachment';
import { type DocIn } from '@/apps/document/model/doc/doc-in';
import type { Process } from '@/apps/document/model/process/process';
import { useDocumentRolesStore } from '@/apps/document/store/document-role';
import CommentDocIn from '@/apps/document/views/doc/component/comment/comment-doc-in/CommentDocIn.vue';
import DocumentInDetail from '@/apps/document/views/doc/doc-in/detail/DocumentInDetail.vue';
import SidebarProcessHistory from '@/apps/document/views/doc/doc-in/detail/SidebarProcessHistoryDocIn.vue';
import FilePreview from '@/apps/document/views/doc/preview/FilePreview.vue';
import { EDITABLE_FILE_TYPES } from '@/apps/ecm/constants';
import AppIcon from '@/common/components/app/AppIcon.vue';
import { convertFileSize, generatePreviewFileUrl, getFileIcon, } from '@/common/helpers/file-utils';
import useMoment from '@/common/helpers/mixins/use-moment';
import { AttachType } from '@/common/model/attachment';

const props = defineProps({
  model: {
    type: Object as PropType<DocIn>,
    default: undefined,
  },
});
const process = ref<Process>();
const { userDeptRole } = storeToRefs(useDocumentRolesStore());

findLastProcessByDocId(props.model?.id, userDeptRole.value).onResult(res => {
  process.value = res.data?.findLastProcessByDocId;
});

const quote = computed(() => {
  return props.model?.quote ? props.model.quote.length > 240 ? props.model?.quote?.substring(0, 240) + '...' : props.model.quote : '';
});
const { moment } = useMoment();
const { t } = useI18n();
const router = useRouter();
const bookName = ref();
const visibleDetail = ref(false);
const visibleProcessHistory = ref(false);
const goToDetailRoute = inject(
  'goToDetailRoute',
  (router: Router, docIn: DocIn) => void {},
);
const currentAttachment = ref<DocumentAttachment | undefined>();

function getMainAttachment() {
  return (
    props.model?.attachments?.find(
      (attachment) => attachment.attachType === AttachType.FILE_CHINH,
    ) || props.model?.attachments?.[0]
  );
}

watch(
  () => props.model,
  () => {
    currentAttachment.value = getMainAttachment();
    getBookByIdReturnList(props.model?.book?.bookId || '').onResult((res) => {
      if (res.data.getBookByIdReturnList.length > 0) {
        bookName.value = res.data.getBookByIdReturnList[0].bookName;
      } else {
        bookName.value = '-';
      }
    });
  },
  { immediate: true },
);

const currentUrl = computed(() => {
  const extension = currentAttachment.value?.fileExtension;
  if (extension && EDITABLE_FILE_TYPES.includes(extension)) {
    return currentAttachment.value?.filePath
      ?.replace('/main/', '/preview/')
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

function showComment() {
  visibleComment.value = true;
}

function goToDetail() {
  visibleDetail.value = true;
}

// Helper function for attachment selection
function selectAttachment(attachment: DocumentAttachment) {
  currentAttachment.value = attachment;
}

// Helper function to truncate file names
function truncateFileName(fileName: string, maxLength: number): string {
  if (fileName.length <= maxLength) {
    return fileName;
  }
  const extension = fileName.split('.').pop() || '';
  const nameWithoutExt = fileName.substring(0, fileName.lastIndexOf('.'));
  const truncatedName = nameWithoutExt.substring(0, maxLength - extension.length - 4) + '...';
  return `${truncatedName}.${extension}`;
}

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
