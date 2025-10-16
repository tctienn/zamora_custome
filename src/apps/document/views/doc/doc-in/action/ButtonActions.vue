<template>
  <div
    class='border-bottom-1 border-gray-300 fixed flex justify-content-between p-2 surface-0 top-0 w-full'
    style='z-index: 1000'>
    <div
      class='flex gap-1'>
      <ButtonIcon
        class='border-round-sm flex justify-content-center mr-2 px-0'
        icon='arrow_back'
        severity='danger'
        size='small'
        style='width: 30px; height: 30px;'
        @click='closeSidebar'/>

      <div
        class='align-content-center font-semibold text-2xl'>
        Thông tin văn bản đến
      </div>
    </div>
    <div
      class='flex gap-2'>
      <template
        v-for='action in allActions'
        :key='action.code'>
        <ButtonIcon
          v-if='actionHasPermission(action.code, userDeptRole) && ((userDeptRole.roleId===RoleType.TRO_LY && mapSupportAction[action.code])||userDeptRole.roleId!==RoleType.TRO_LY)'
          class='border-round-sm flex hover:surface-300 justify-content-center surface-100'
          :icon-size='"18px"'
          severity='secondary'
          size='small'
          :style='{
            "--icon-color": action.color || "currentColor",
            fontSize: "14px",
            fontWeight: "400",
          }'
          v-bind='action'/>
      </template>
      <NextButtonsDetail
        :doc='doc as unknown as DocIn'
        :process='process'>
      </NextButtonsDetail>
      <ButtonIcon
        class='border-round-sm'
        icon='splitscreen_right'
        :severity='!expandDetail ? "secondary" : ""'
        size='small'
        @click='expandDetailFn'/>
    </div>
  </div>

  <DialogSendCC
    v-if='visibleDialogPublished'
    v-model:visible-dialog-published='visibleDialogPublished'
    :doc-id='docId'
    :user-dept-role='userDeptRole'/>
  <DialogAdvice
    v-if='visibleDialogAdvice'
    v-model:visible='visibleDialogAdvice'
    :doc-id='docId'
    :doc-type='ObjectTypeEnum.VB_DEN'
    @hide-dialog='hideDialog'/>

  <SidebarProcessHistory
    v-if='visibleProcessHistory'
    :doc-id='props.docId'
    :user-dept-role='userDeptRole'
    :visible-sidebar='visibleProcessHistory'
    @hide-dialog='visibleProcessHistory=false'/>

  <SidebarFollow
    v-if='visibleFollow'
    :doc-id='props.docId'
    :user-dept-role='userDeptRole'
    :visible-sidebar='visibleFollow'
    @hide-dialog='visibleFollow=false'/>
  <SaveTask
    v-model:visible='visibleFormTask'
    :origin-created-id='docId'
    :origin-created-type='OriginModule.DOCUMENT'
    :origin-data='{...pick(doc,"id","attachments","quote"),docType:"DOC_IN"}'>
  </SaveTask>
</template>

<script lang='ts' setup>
import { pick } from 'lodash';
import type { ButtonProps } from 'primevue/button';
import { type ComputedRef, inject, type PropType, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

import { ObjectTypeEnum } from '@/apps/document/model/comment';
import { type DocIn, type DocInInput, type UserDeptRoleInput } from '@/apps/document/model/doc/doc-in';
import { RoleType } from '@/apps/document/model/permission';
import type { Process } from '@/apps/document/model/process/process';
import DialogAdvice from '@/apps/document/views/doc/dialog/DialogAdvice.vue';
import DialogSendCC from '@/apps/document/views/doc/dialog/DialogSendCC.vue';
import { actionHasPermission, DocumentAction, mapActionRole } from '@/apps/document/views/doc/doc-in/action/action';
import NextButtonsDetail from '@/apps/document/views/doc/doc-in/component/next-buttons-detail/NextButtonsDetail.vue';
import SidebarFollow from '@/apps/document/views/doc/doc-in/detail/SidebarFollow.vue';
import SidebarProcessHistory from '@/apps/document/views/doc/doc-in/detail/SidebarProcessHistoryDocIn.vue';
import { OriginModule } from '@/apps/work/model/task';
import SaveTask from '@/apps/work/views/task/component/form/SaveTask.vue';
import EventBus from '@/common/helpers/event-bus';

const props = defineProps({
  docId: {
    type: String,
    required: true
  },
  doc: {
    type: Object as PropType<DocInInput>,
    default: () => ({})
  },
  process: {
    type: Object as PropType<Process>,
    default: undefined
  },
  userDeptRole: {
    type: Object as PropType<UserDeptRoleInput>,
    required: true
  },
});
const emits = defineEmits<{
  (e: 'after-action', actionCode: DocumentAction): void
}>();
const router = useRouter();
const { t } = useI18n() || {};
const allActions: (ButtonProps & { code: DocumentAction })[] = [
  {
    code: DocumentAction.PROCLAIM,
    label: t('document.action.proclaim'),
    icon: mapActionRole[DocumentAction.PROCLAIM].icon,
    color: '',
    onClick(payload) {
      openDialogPublished();
    },
  },
  {
    code: DocumentAction.ASK_FOR_OPINION,
    label: t('document.action.askForOpinion'),
    icon: mapActionRole[DocumentAction.ASK_FOR_OPINION].icon,
    color: '#BF7CD3',
    onClick(payload) {
      openDialogAdvice();
    },
  },
  {
    code: DocumentAction.COPY,
    label: t('document.action.copy'),
    color: '#6FBF73',
    icon: mapActionRole[DocumentAction.COPY].icon,
  },
  {
    code: DocumentAction.CREATE_DRAFT,
    label: t('document.action.createDraft'),
    color: '',
    icon: mapActionRole[DocumentAction.CREATE_DRAFT].icon,
    onClick() {
      router.push({
        name: 'DocumentDocOutFormDocument',
        query: { incomingDocId: props.docId }
      });
    },
  },
  {
    code: DocumentAction.CREATE_WORK,
    label: t('document.action.createWork'),
    icon: mapActionRole[DocumentAction.CREATE_WORK].icon,
    onClick() {
      visibleFormTask.value = true;
    }
  },
  {
    code: DocumentAction.PROCESS_HISTORY,
    label: t('document.doc.docInDetail.processHistory'),
    color: '#009482',
    icon: mapActionRole[DocumentAction.PROCESS_HISTORY].icon,
    onClick: showProcessHistory
  },
  {
    code: DocumentAction.VIEW_HISTORY,
    label: t('document.doc.docInDetail.follower'),
    color: '#d76b11',
    icon: mapActionRole[DocumentAction.VIEW_HISTORY].icon,
    onClick: showDialogFollow
  },
];
const visibleDialogPublished = ref(false);
const visibleDialogAdvice = ref(false);
const visibleProcessHistory = ref(false);
const visibleFollow = ref(false);
const expandDetail = ref(true);

function openDialogPublished() {
  visibleDialogPublished.value = true;
}

function hideDialog() {
  visibleDialogAdvice.value = false;
  emits('after-action', DocumentAction.ASK_FOR_OPINION);
}

function openDialogAdvice() {
  visibleDialogAdvice.value = true;
}

function showProcessHistory() {
  visibleProcessHistory.value = true;
}

function showDialogFollow() {
  visibleFollow.value = true;
}

function expandDetailFn() {
  expandDetail.value = !expandDetail.value;
  EventBus.emit('expand-doc-in-detail', expandDetail.value);
}

function closeSidebar() {
  EventBus.emit('close-sidebar');
}

const mapSupportAction = inject('mapSupportAction', {} as ComputedRef<Record<string, true>>);

const visibleFormTask = ref<boolean>(false);
</script>

<script lang='ts'>
export default { name: 'ButtonActions' };
</script>

<style scoped>
:deep(.custom-icon),
:deep(.material-symbols-outlined),
:deep(.p-button-icon-left) {
  color: var(--icon-color, currentColor) !important;
}
:deep(.p-button-label) {
  font-weight: 500;
}
</style>
