<template>
  <div class='border-round-sm card flex gap-3 m-0 px-4 py-3'>
    <div class='flex flex-column flex-grow-1 gap-2'>
      <div class='font-semibold'>
        {{ quote }}
      </div>
      <div class='flex gap-3'>
        <div class='col-12 flex flex-column gap-1 p-0'>
          <div
            v-if='model?.docInBook'
            class='grid grid-nogutter'>
            <div class='col-6'>{{ t('document.doc.book.type.label') }}:
              <b>{{ bookName }}</b></div>
            <div class='col-6'>{{ t('document.doc.book.docOutNumber') }}: <b>{{ model?.docInBook?.bookNumber }}</b>
            </div>
            <div class='col-6'>{{ t('document.doc.publisher') }}: <b>{{ model?.drafterDeptName }}</b></div>
            <div class='col-6'>{{ t('document.doc.type') }}: <b>{{ model?.docTypeName }}</b></div>
            <div class='col-6'>{{ t('document.doc.code') }}: <b>{{ model?.docCode }}</b></div>
            <div class='col-6'>{{ t('document.doc.docDate') }}:
              <b>{{ model?.docDate ? moment(model?.docDate).format('DD/MM/YYYY') : '' }}</b>
            </div>
          </div>
          <div
            v-else
            class='grid grid-nogutter'>
            <div class='col-6'>{{ t('document.doc.code') }}: <b>{{ model?.docCode }}</b></div>
            <div class='col-6'>{{ t('document.doc.deadline') }}:
              <b>{{ model?.deadlineDate ? moment(model?.deadlineDate).format('DD/MM/YYYY') : '' }}</b>
            </div>
            <div class='col-6'>{{ t('document.doc.type') }}: <b>{{ model?.docTypeName }}</b></div>
            <div class='col-6'>{{ t('document.doc.numberOfProcessDays') }}: <b>{{ model?.deadlineNumber }}</b></div>
            <div class='col-6'>{{ t('document.doc.issuingDept') }}: <b>{{ model?.issuerDeptName }}</b></div>
            <div class='col-6'>{{ t('document.doc.area') }}: <b>{{ model?.areaName }}</b></div>
          </div>
        </div>
      </div>
    </div>
    <div class='flex flex-column flex-grow-0 gap-2'>
      <!-- Fixed action buttons bar - top right -->
      <div class='action-bar-fixed position-absolute'>
        <slot name='action'>
          <div class='action-buttons-bar flex gap-2'>
            <!--        <i-->
            <!--          v-tooltip='t("common.action")'-->
            <!--          class='cursor-pointer pi pi-align-justify text-blue-500'-->
            <!--          @click='toggleMenu'></i>-->
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
              @click='goToDetail(model?.id)'>
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
      <div class='attachment-dropdown-fixed relative'>
        <DocOutAttachmentButton
          v-model:current-attachment='currentAttachment'
          :model='model'/>
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
    <CommentDocOut
      :content-style='{maxHeight:"80%"}'
      :disabled='model.status==OutgoingDocStatus.DA_BAN_HANH'
      :doc-id='model?.id'/>
  </Sidebar>
  <SaveTask
    v-model:visible='visibleFormTask'
    :origin-created-id='model?.id'
    :origin-created-type='OriginModule.DOCUMENT'
    :origin-data='{...pick(model,"id","attachments","quote"),docType:"DOC_OUT"}'>
  </SaveTask>

  <SidebarPromulgateDetail
    v-if='visibleDialogDetailPromulgate'
    :doc='model'
    :doc-id='docId'
    :visible='visibleDialogDetailPromulgate'
    @hide-sidebar='closeSidebar'/>
  <SidebarProcessHistoryDocOut
    v-if='visibleProcessHistory && model?.id'
    :doc-id='model?.id'
    :user-dept-role='userDeptRole'
    :visible-sidebar='visibleProcessHistory'
    @hide-dialog='visibleProcessHistory = false'/>
</template>

<script lang='ts' setup>

import { pick } from 'lodash';
import { storeToRefs } from 'pinia';
import { computed, inject, type PropType, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { getBookByIdReturnList } from '@/apps/document/api/graphql/book';
import type { DocumentAttachment } from '@/apps/document/model/attachment';
import { type DocOut, OutgoingDocStatus } from '@/apps/document/model/doc/doc-out';
import { useDocumentRolesStore } from '@/apps/document/store/document-role';
import CommentDocOut from '@/apps/document/views/doc/component/comment/comment-doc-out/CommentDocOut.vue';
import { DocumentAction } from '@/apps/document/views/doc/doc-in/action/action';
import SidebarProcessHistoryDocOut from '@/apps/document/views/doc/doc-out/detail/SidebarProcessHistoryDocOut.vue';
import SidebarPromulgateDetail from '@/apps/document/views/doc/doc-out/detail/SidebarPromulgateDetail.vue';
import DocOutAttachmentButton from '@/apps/document/views/doc/doc-out/preview/DocOutAttachmentButton.vue';
import FilePreview from '@/apps/document/views/doc/preview/FilePreview.vue';
import { EDITABLE_FILE_TYPES } from '@/apps/ecm/constants';
import { OriginModule } from '@/apps/work/model/task';
import SaveTask from '@/apps/work/views/task/component/form/SaveTask.vue';
import AppIcon from '@/common/components/app/AppIcon.vue';
import { generatePreviewFileUrl } from '@/common/helpers/file-utils';
import useMoment from '@/common/helpers/mixins/use-moment';

const props = defineProps({
  model: {
    type: Object as PropType<DocOut>,
    default: undefined
  },
  menuActions: {
    type: Array as PropType<DocumentAction[]>,
    default: () => []
  },
});
const refetchDocOuts = inject('reloadDoc', () => void 0);
const { userDeptRole } = storeToRefs(useDocumentRolesStore());
const visibleDialogDetailPromulgate = ref(false);
const visibleProcessHistory = ref(false);
const { t } = useI18n();
const { moment } = useMoment();
const docId = ref();
const bookName = ref();
const currentAttachment = ref<DocumentAttachment>();
const quote = computed(() => {
  return props.model?.quote ? props.model.quote.length > 240 ? props.model?.quote?.substring(0, 240) + '...' : props.model.quote : '';
});
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

const visibleFormTask = ref<boolean>(false);

watch(
  () => props.model,
  () => {
    getBookByIdReturnList(props.model?.docInBook?.bookId || '').onResult((res) => {
      if (res.data.getBookByIdReturnList.length > 0) {
        bookName.value = res.data.getBookByIdReturnList[0].bookName;
      } else {
        bookName.value = '-';
      }
    });
  },
  { immediate: true },
);

function goToDetail(dId: string | undefined) {
  if (!dId) {
    return;
  }
  docId.value = dId;
  visibleDialogDetailPromulgate.value = true;
}

function closeSidebar() {
  visibleDialogDetailPromulgate.value = false;
  refetchDocOuts();
}

function viewHistory() {
  visibleProcessHistory.value = true;
}
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
  min-width: 14rem;
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
</style>
