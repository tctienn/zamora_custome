<template>
  <div
    class='border-300 border-bottom-1 doc-in-action-buttons flex gap-1 p-1 surface-0'
    style='min-height: 39px'>
    <template
      v-for='action in filterActions'
      :key='action.code'>
      <Button
        v-if='
          (userDeptRole.roleId === RoleType.TRO_LY &&
            mapSupportAction[action.code]) ||
            userDeptRole.roleId !== RoleType.TRO_LY
        '
        class='border-round-sm border-transparent btn-action hover:border-1 hover:border-400 hover:surface-200 py-1 surface-0 text-900'
        v-bind='action'></Button>
    </template>
    <template
      v-for='action in menuFilterActions'
      :key='action.code'>
      <Button
        class='border-round-sm border-transparent btn-action hover:border-1 hover:border-400 hover:surface-200 py-1 surface-0 text-900'
        :class='action.class'
        :disabled='action.disabled'
        :label='typeof action.label === "function" ? action.label() : action.label'
        @click='action.command'>
        <template #icon>
          <i
            v-if="action.icon && action.icon.includes('pi pi-')"
            class='mr-2'
            :class='action.icon'/>
          <AppIcon
            v-else-if='action.icon'
            class='mr-2'
            :name='action.icon'
            size='1.5'
            :style="{
              color: action.icon === 'content_copy' ? '#6FBF73 !important' : '',
            }"/>
        </template>
      </Button>
    </template>
    <!-- Transfer Processing Button -->
    <FlowButtons
      :disabled-func='() => !canShowTransferProcessing'
      icon-size='1'
      :outcomes='outcomes'
      size='small'
      @action='nextProcess'/>
    <NextButtonsOutSide
      :doc='docInDetail'
      :process='docInDetail?.process'/>

    <!-- Export Button - Always the last item -->
    <Button
      class='border-round-sm border-transparent btn-action hover:border-1 hover:border-400 hover:surface-200 py-1 surface-0 text-900'
      :disabled='!docInDetail'
      icon='pi pi-file-export'
      label='Export'
      @click='showExportDialogVisibleDialog'>
    </Button>

  </div>
  <DocumentInOCR
    v-if='visibleSidebar'
    :visible-sidebar='visibleSidebar'
    @hide-dialog='hideDialog'/>

  <SidebarDocumentIn
    v-if='visibleFormDocIn'
    :visible='visibleFormDocIn'
    @hide-sidebar='hideSidebar'/>

  <!-- Dialogs moved from DocInPreview -->
  <DialogSendCC
    v-if='visibleDialogPublished'
    v-model:visible-dialog-published='visibleDialogPublished'
    :doc-id="props.doc?.id || ''"
    :user-dept-role='userDeptRole'/>

  <DialogAdvice
    v-if='visibleDialogAdvice'
    v-model:visible='visibleDialogAdvice'
    :doc-id='props.doc?.id'
    :doc-type='ObjectTypeEnum.VB_DEN'/>

  <SaveTask
    v-model:visible='visibleFormTask'
    :origin-created-id='props.doc?.id'
    :origin-created-type='OriginModule.DOCUMENT'
    :origin-data='{...pick(props.doc,"id","attachments","quote"),docType:"DOC_IN"}'>
  </SaveTask>

  <!-- Transfer Processing Dialog -->
  <UserSelectNextDialogDocIn
    v-if='visibleTransferProcessing'
    v-model:visible='visibleTransferProcessing'
    :flow-id='docInDetail?.flowId'
    :flow-instance-id='flowInstanceId'
    :header='t("document.doc.docInDetail.transferProcessing")'
    :is-start-node='false'
    :node-id='currNodeId||currNode?.id||""'
    :org-type='userDeptRole.type'
    :process-id='processId'
    :result='selectedOutcome?.name||"PROCESS"'/>
</template>

<script lang='ts' setup>

import { pick } from 'lodash';
import { storeToRefs } from 'pinia';
import type { ButtonProps } from 'primevue/button';
import type { MenuItem } from 'primevue/menuitem';
import { useConfirm } from 'primevue/useconfirm';
import { computed, inject, type PropType, provide, ref, toRef, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

import { hasPermission } from '@/apps/admin/services/permission';
import { deleteDocComing, findDocById } from '@/apps/document/api/rest/docIn';
import { findLastInProcess } from '@/apps/document/api/rest/docIn';
import { currentInstanceNode, getStartNode, possibleInstanceNextNodes } from '@/apps/document/api/rest/flowDocument';
import { ObjectTypeEnum } from '@/apps/document/model/comment';
import { type DocIn, DocStatus } from '@/apps/document/model/doc/doc-in';
import { RoleType } from '@/apps/document/model/permission';
import { type Process } from '@/apps/document/model/process/process';
import { useDocumentRolesStore } from '@/apps/document/store/document-role';
import FlowButtons from '@/apps/document/views/doc/component/flow-buttons/FlowButtons.vue';
import UserSelectNextDialogDocIn
  from '@/apps/document/views/doc/component/user-select-next/UserSelectNextDialogDocIn.vue';
import DialogAdvice from '@/apps/document/views/doc/dialog/DialogAdvice.vue';
import DialogSendCC from '@/apps/document/views/doc/dialog/DialogSendCC.vue';
import {
  actionHasPermission,
  actionRequireDoc,
  DocumentAction,
  mapActionRole
} from '@/apps/document/views/doc/doc-in/action/action';
import NextButtonsOutSide from '@/apps/document/views/doc/doc-in/component/next-buttons-outside/NextButtonsOutSide.vue';
import DocumentInOCR from '@/apps/document/views/doc/doc-in/detail/DocumentInOCR.vue';
import SidebarDocumentIn from '@/apps/document/views/doc/doc-in/detail/SidebarDocumentIn.vue';
import { OriginModule } from '@/apps/work/model/task';
import SaveTask from '@/apps/work/views/task/component/form/SaveTask.vue';
import { type NodeInputInterface, NodeType, type Outcome } from '@/apps/work-flow/model/flow';
import AppIcon from '@/common/components/app/AppIcon.vue';
import { toastError, toastSuccess } from '@/common/helpers/custom-toast-service';
import EventBus from '@/common/helpers/event-bus';

const props = defineProps({
  doc: {
    type: Object as PropType<DocIn | undefined>,
    default: undefined,
  },
  menuActions: {
    type: Array as PropType<DocumentAction[]>,
    default: () => [],
  },
  nodeId: {
    type: String,
    default: '',
  },
});
const emits = defineEmits(['show-dialog']);
const afterAction = inject('afterAction', () => void {});

function showExportDialogVisibleDialog() {
  emits('show-dialog');
}

function hideSidebar() {
  visibleFormDocIn.value = false;
  EventBus.emit('reload-doc-in');
}

function hideDialog() {
  visibleSidebar.value = false;
  afterAction();
}

function canEdit(doc: DocIn) {
  return doc.status === DocStatus.NHAP;
}

const visibleSidebar = ref(false);
const visibleFormDocIn = ref(false);
const visibleDialogPublished = ref<boolean>(false);
const visibleDialogAdvice = ref<boolean>(false);
const visibleFormTask = ref<boolean>(false);
const visibleTransferProcessing = ref<boolean>(false);
const router = useRouter();
const { t } = useI18n();
const confirm = useConfirm();

// Delete function following the same pattern as DocInClerkItem
function deleteDoc(doc: DocIn) {
  if (!doc) {
    return;
  }

  confirm.require({
    message: t('common.confirmDelete', {
      itemType: t('văn bản'),
      itemName: doc.quote,
    }),
    header: t('common.confirm'),
    acceptLabel: t('common.delete'),
    acceptClass: 'p-button-danger',
    icon: 'pi pi-exclamation-triangle',
    accept: () => {
      deleteDocComing(doc.id, userDeptRole.value).then(() => {
        toastSuccess({ message: t('Xóa văn bản thành công.') });
        EventBus.emit('reload-doc-in');
        afterAction();
      });
    },
  });
}

// Check if document can be deleted (same logic as DocInClerkItem)
function canDelete(doc: DocIn | undefined): boolean {
  if (!doc) {
    return false;
  }
  return doc.status === DocStatus.NHAP && doc.canDelete === true;
}

const allActions = computed(() => [
  {
    code: DocumentAction.PUT_INTO_BOOK,
    label: t('document.action.putIntoBook'),
    severity: 'primary',
    icon: 'pi pi-plus-circle',
    checkPermission: () =>
      hasPermission(
        '/DOCUMENT/DOCUMENT_DOC-IN/DOCUMENT_DOC-IN_RECEIVE/PUT_INTO_BOOK',
      ),
    onClick: () =>
    // router.push({ name: 'DocumentDocInFormDocument' })
      visibleFormDocIn.value = true
    ,
  },
  {
    code: DocumentAction.PUT_INTO_BOOK,
    label: 'Nhận dạng OCR',
    severity: 'primary',
    icon: 'pi pi-book',

    onClick: () => visibleSidebar.value = true,
  },
  {
    code: DocumentAction.PUT_INTO_BOOK,
    label: 'Nhận từ trục',
    severity: 'primary',
    icon: 'pi pi-cloud-download',

    onClick: () => visibleSidebar.value = true,
  },
  {
    code: DocumentAction.PUT_INTO_BOOK,
    label: 'Xóa',
    severity: 'danger',
    icon: 'pi pi-trash',
    disabled: !canDelete(props.doc),
    checkPermission: () =>
      hasPermission(
        '/DOCUMENT/DOCUMENT_DOC-IN/DOCUMENT_DOC-IN_RECEIVE/PUT_INTO_BOOK',
      ),
    onClick: () => props.doc && deleteDoc(props.doc),
  },
] as (ButtonProps & {
  code: DocumentAction;
  checkPermission?: () => boolean;
})[]);

const filterActions = computed(() =>
  allActions.value
    .filter((action) => props.menuActions.includes(action.code))
    .filter((action) => actionHasPermission(action.code, userDeptRole.value))
    .filter((action) => actionRequireDoc(action.code) ? !!props.doc : true)
    .filter((action) =>
      action.checkPermission ? action.checkPermission() : true,
    ),
);

const { userDeptRole } = storeToRefs(useDocumentRolesStore());
const docInDetail = ref<DocIn>();
const process = ref<Process | undefined>();
const currNode = ref<NodeInputInterface>();
const processId = ref<string>();
const flowInstanceId = ref<string>();
const currNodeId = ref<string>();

// Add selectedOutcome for Transfer Processing like NextButtonsOutSideClerk
const selectedOutcome = ref<Outcome>();
const outcomes = computed<Outcome[]>(() => {
  return currNode.value?.data?.outcomes || [];
});

// Add nextProcess function like NextButtonsOutSideClerk
function nextProcess(outcome: Outcome) {
  selectedOutcome.value = outcome;
  visibleTransferProcessing.value = true;
}

watch(() => props.doc, value => {
  docInDetail.value = value;
}, { immediate: true });
watch(
  () => props.doc?.id,
  (value) => {
    if (!value) {
      return;
    }
    findDocById(userDeptRole.value, value).then((docIn) => {
      if (docIn) {
        docInDetail.value = {
          ...docInDetail.value,
          flowId: docInDetail.value?.flowId ?? docIn.flowId
        };
      }
    });
  },
  { immediate: true, },
);

// Watch flowId to get start node - same logic as NextButtonsInForm
watch(() => docInDetail.value?.flowId, flowId => {
  if (flowId) {
    getStartNode(flowId).then(value => {
      if (value) {
        currNode.value = value;
      }
    }).catch(reason => {
      currNode.value = {} as NodeInputInterface;
      if (reason.code == 'nodeNotFound') {
        toastError({ message: 'Không tìm thấy nốt bắt đầu của quy trình' });
      }
    });
  }
}, { immediate: true });

// Watch doc.id to get last process - EXACT same logic as NextButtonsInForm
watch(() => props.doc?.id, (docId) => {
  if (docId) {
    findLastInProcess(
      userDeptRole.value,
      docId,
      userDeptRole.value.deptId,
    ).then((value) => {
      if (value) {
        process.value = value;
        processId.value = value?.id;
        flowInstanceId.value = value?.flowInstanceId;
        currNodeId.value = value?.stepId;
      }
    });
  }
}, { immediate: true });

function getCurrentNode(process: Process | void, flowId: string | undefined) {
  if (process?.flowInstanceId && process?.stepId && process) {
    currentInstanceNode(process?.flowInstanceId, process?.stepId).then(value => {
      if (value) {
        currNode.value = value;
      } else {
        currNode.value = undefined;
      }
    }).catch(error => {
      toastError(error);
      currNode.value = undefined;
    });
  } else if (flowId) {
    if (props.doc?.flowId) {
      getStartNode(props.doc?.flowId).then(value => {
        if (value) {
          currNode.value = value;
        } else {
          currNode.value = undefined;
        }
      }).catch(reason => {
        currNode.value = undefined;
        if (reason.code == 'nodeNotFound') {
          toastError({ message: 'Không tìm thấy nốt bắt đầu của quy trình' });
        }
      });
    }
  }
}

const docRef = toRef(props.doc);
watch(() => props.doc, value => {
  docRef.value = value;
});
provide('doc', docRef);

// Provide saveDocPromise for UserSelectNextDialogDocIn
const saveDocPromise = inject('saveDocPromise', () =>
  Promise.resolve(props.doc || {} as DocIn)
);
provide('saveDocPromise', saveDocPromise);

const mapSupportAction = inject('mapSupportAction', {} as Record<string, true>);

// Menu actions (moved from DocInPreview)
const additionalActions: (MenuItem & { code: DocumentAction })[] = [
  {
    code: DocumentAction.PROCLAIM,
    label: t('document.action.proclaim'),
    icon: mapActionRole[DocumentAction.PROCLAIM].icon,
    command(payload) {
      visibleDialogPublished.value = true;
    },
  },
  {
    code: DocumentAction.ASK_FOR_OPINION,
    label: t('document.action.askForOpinion'),
    icon: mapActionRole[DocumentAction.ASK_FOR_OPINION].iconSub || mapActionRole[DocumentAction.ASK_FOR_OPINION].icon,
    command(payload) {
      visibleDialogAdvice.value = true;
    },
  },
  {
    code: DocumentAction.COPY,
    label: t('document.action.copy'),
    icon: mapActionRole[DocumentAction.COPY].icon,
    command(payload) {
    },
  },
  {
    code: DocumentAction.CREATE_DRAFT,
    label: t('document.action.createDraft'),
    icon: mapActionRole[DocumentAction.CREATE_DRAFT].icon,
    command(payload) {
    },
  },
  {
    code: DocumentAction.CREATE_WORK,
    label: t('document.action.createWork'),
    icon: mapActionRole[DocumentAction.CREATE_WORK].icon,
    class: 'create-work-menu-item',
    command(payload) {
      createTask();
    },
  },
];

const menuFilterActions = computed(() =>
  additionalActions
    .filter(
      (action) =>
        !props.menuActions.length || props.menuActions.includes(action.code),
    )
    .filter((action) => actionHasPermission(action.code, userDeptRole.value))
    .map((action) => {
      const disabled = actionRequireDoc(action.code) ? !props.doc : false;
      return {
        ...action,
        disabled
      };
    }),
);

function createTask() {
  visibleFormTask.value = true;
}

// Transfer Processing functionality
const canShowTransferProcessing = computed(() => {
  // Only show transfer processing button if document has ID, is not processed, and has a flowId
  return props.doc?.id && props.doc.status !== DocStatus.DA_XL && (docInDetail.value?.flowId || props.doc?.flowId);
});

function showTransferProcessingDialog() {

  // Use nextProcess function like NextButtonsOutSideClerk does
  nextProcess(outcomes.value[0]);
}

async function visibleFlowButton(outcome: (Outcome & Record<string, any>)): Promise<boolean> {
  if (process.value) {
    const nodes = await possibleInstanceNextNodes(process.value.flowInstanceId || '', process.value.stepId || '', outcome.name);
    return Promise.resolve(!(nodes && nodes.length === 1 && nodes[0].type === NodeType.END));
  }
  return Promise.resolve(true);
}
</script>

<style lang="scss" scoped>
.btn-action {
  font-size: 14px;
  font-weight: 400;
  border-radius: 4px;

  :deep(.p-button-label) {
    font-size: 14px;
    font-weight: 400;
  }

  :deep(.pi-trash) {
    color: #FF4406 !important;
  }

  :deep(.pi-comments) {
    color: #BF7CD3 !important;
  }

  :deep(.pi-send) {
    color: #3E84F6 !important;
  }

  :deep(.pi-plus-circle) {
    color: #34A853;
  }
  &.create-work-menu-item {
    .custom-icon {
      color: #D08A8A;
    }
  }
}
</style>
