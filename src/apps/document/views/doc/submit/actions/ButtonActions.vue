<template>
  <div class='flex justify-content-between'>
    <div
      class='flex gap-1'
      style='height: 2.4rem'>
      <!--      <ButtonIcon-->
      <!--        icon='arrow_back'-->
      <!--        size='small'-->
      <!--        @click='router.back()'/>-->
      <template
        v-for='action in allActions'
        :key='action.code'>
        <ButtonIcon
          v-if='
            actionHasPermission(action.code, userDeptRole) &&
              ((userDeptRole.roleId == RoleType.TRO_LY &&
                mapSupportAction[action.code]) ||
                userDeptRole.roleId != RoleType.TRO_LY)
          '
          class='border-round-sm border-transparent btn-action hover:border-1 hover:border-400 hover:surface-200 py-1 surface-0 text-900'
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

      <ButtonIcon
        class='border-round-sm border-transparent btn-action hover:border-1 hover:border-400 hover:surface-200 py-1 surface-0 text-900'
        icon='history'
        :label="t('document.doc.docInDetail.processHistory')"
        severity='secondary'
        size='small'
        :style='{
          "--icon-color": "#009482",
          fontSize: "14px",
          fontWeight: "400",
        }'
        @click='showProcessHistory'/>

      <ButtonIcon
        class='border-round-sm border-transparent btn-action hover:border-1 hover:border-400 hover:surface-200 py-1 surface-0 text-900'
        icon='table_eye'
        :label="t('document.doc.docInDetail.follower')"
        severity='secondary'
        size='small'
        :style='{
          fontSize: "14px",
          fontWeight: "400",
        }'
        @click='showDialogFollow'/>

      <ButtonIcon
        v-if='doc.docType == TypeOfPresentation.PHIEU_LAY_Y_KIEN'
        class='border-round-sm border-transparent btn-action hover:border-1 hover:border-400 hover:surface-200 py-1 surface-0 text-900'
        icon='ballot'
        :label="t('Tổng hợp ý kiến')"
        severity='secondary'
        size='small'
        :style='{
          fontSize: "14px",
          fontWeight: "400",
        }'
        @click='viewAdvice'/>

      <Button
        class='border-round-sm border-transparent btn-action hover:border-1 hover:border-400 hover:surface-200 py-1 surface-0 text-900'
        icon='pi pi-file-export'
        :label="t('common.export')"
        severity='secondary'
        :style='{
          fontSize: "14px",
          fontWeight: "400",
        }'
        @click='exportDocSubmit'/>
    </div>

    <div class='flex flow-group-btn gap-1'>
      <!--      <SubmitDocNextButtonsDetail-->
      <!--        :doc-id='docId'-->
      <!--        :flow-id='flowId'-->
      <!--        :flow-instance-id='flowInstanceId'-->
      <!--        :process-id='currentProcessId'-->
      <!--        size='small'>-->
      <!--      </SubmitDocNextButtonsDetail>-->
      <SubmitNextButtonsDetail
        :doc='doc'
        :process='process'/>
    </div>
  </div>
  <Dialog
    v-if='users'
    v-model:visible='visibleDialogPublished'
    class='h-full'
    :header="'Chọn người dùng'"
    v-bind='DEFAULT_DIALOG_CONFIG'
    @hide='visibleDialogPublished = false'>
    <div class='flex h-full'>
      <div class='col-7 h-full'>
        <UserSelectMoreDetail
          v-model='selectedUser'
          class='w-full'
          display-mode='tree'
          :org-type='type!!'
          :remove-empty-dep='true'
          selection-mode='checkbox'
          style='height: 70vh'
          :user-id-only='true'
          :users='users'/>
      </div>
      <div class='col h-full'>
        <ReceiveListUser
          v-model='selectedUser'
          class='w-full'/>
      </div>
    </div>
    <template #footer>
      <div class='flex flex-row gap-2 justify-content-center py-1'>
        <Button
          icon='pi pi-times'
          :label="t('common.close')"
          severity='danger'
          @click='visibleDialogPublished = false'/>
        <Button
          icon='pi pi-check'
          :label="t('common.save')"
          @click='saveCC'/>
      </div>
    </template>
  </Dialog>
  <DialogAdvice
    v-if='visibleDialogAdvice'
    v-model:visible='visibleDialogAdvice'
    :doc-id='docId'
    :doc-type='ObjectTypeEnum.PHIEU_TRINH'/>

  <SidebarProcessHistoryDocSubmit
    v-if='visibleProcessHistory'
    :doc-id='props.docId'
    :user-dept-role='props.userDeptRole'
    :visible-sidebar='visibleProcessHistory'
    @hide-dialog='visibleProcessHistory = false'/>

  <SidebarFollow
    v-if='visibleFollow'
    :doc-id='props.docId'
    :user-dept-role='props.userDeptRole'
    :visible-sidebar='visibleFollow'
    @hide-dialog='visibleFollow = false'/>
  <ViewAdviceDetailSidebar
    v-if='visibleViewQuestionDialog'
    :doc-id='props.docId'
    :visible-dialog='visibleViewQuestionDialog'
    @hide-dialog='visibleViewQuestionDialog = false'/>
</template>

<script lang="ts" setup>
import { storeToRefs } from 'pinia';
import type { ButtonProps } from 'primevue/button';
import { type ComputedRef, inject, type PropType, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

import { getAllUserMoreInfoGraphql } from '@/apps/admin/api/graphql/admin-customer-tenant';
import type { UserMoreInfo } from '@/apps/admin/model/User';
import { findDocSubmitById } from '@/apps/document/api/graphql/doc-submit';
import { getAllProcessByDocIdForDrawRealFlow } from '@/apps/document/api/graphql/incoming-process';
import { ccDoc } from '@/apps/document/api/rest/ccInfo';
import { exportWordDocSubmit } from '@/apps/document/api/rest/docSubmit';
import type { CcdocInterface } from '@/apps/document/model/ccdoc';
import { ObjectTypeEnum } from '@/apps/document/model/comment';
import { TypeOfPresentation, type UserDeptRoleInput } from '@/apps/document/model/doc/doc-in';
import type { DocSubmit } from '@/apps/document/model/doc/doc-submit-input';
import { RoleType } from '@/apps/document/model/permission';
import type { InComingProcess } from '@/apps/document/model/process/incoming';
import type { Process } from '@/apps/document/model/process/process';
import { useDocumentRolesStore } from '@/apps/document/store/document-role';
import DialogAdvice from '@/apps/document/views/doc/dialog/DialogAdvice.vue';
import { actionHasPermission, DocumentAction, mapActionRole, } from '@/apps/document/views/doc/doc-in/action/action';
import SidebarFollow from '@/apps/document/views/doc/doc-in/detail/SidebarFollow.vue';
import SubmitNextButtonsDetail
  from '@/apps/document/views/doc/submit/component/next-buttons-detail/SubmitNextButtonsDetail.vue';
import SidebarProcessHistoryDocSubmit from '@/apps/document/views/doc/submit/SidebarProcessHistoryDocSubmit.vue';
import ViewAdviceDetailSidebar from '@/apps/document/views/doc/submit/ViewAdviceDetailSidebar.vue';
import ReceiveListUser from '@/apps/work-flow/views/components/ReceiveListUserDept/ReceiveListUser.vue';
import UserSelectMoreDetail from '@/apps/work-flow/views/components/UserSelectMoreDetail/UserSelectMoreDetail.vue';
import { DEFAULT_DIALOG_CONFIG } from '@/common/constants';
import { toastSuccess } from '@/common/helpers/custom-toast-service';
import { downloadFile } from '@/common/helpers/file-utils';

const props = defineProps({
  docId: {
    type: String,
    required: true,
  },
  doc: {
    type: Object as PropType<DocSubmit>,
    default: () => ({})
  },
  process: {
    type: Object as PropType<Process>,
    default: undefined
  },
  userDeptRole: {
    type: Object as PropType<UserDeptRoleInput>,
    required: true,
  },
  disabled: {
    type: Boolean,
    default: false,
  }
});

const selectedUser = ref<Array<UserDeptRoleInput & { id: string }>>([]);
const router = useRouter();
const { t } = useI18n() || {};
const allActions: (ButtonProps & { code: DocumentAction })[] = [
  {
    code: DocumentAction.ASK_FOR_OPINION,
    label: t('document.action.askForOpinion'),
    icon: mapActionRole[DocumentAction.ASK_FOR_OPINION].icon,
    color: '#BF7CD3',
    onClick(payload) {
      openDialogAdvice();
    },
  },
  // {
  //   code: DocumentAction.COPY,
  //   label: t('document.action.copy'),
  //   icon: mapActionRole[DocumentAction.COPY].icon,
  //   onClick(payload) {
  //   },
  // },
];
const users = ref([] as UserMoreInfo[]);
const userIds = ref([] as string[]);
const visibleDialogPublished = ref(false);
const visibleDialogAdvice = ref(false);
const visibleProcessHistory = ref(false);
const visibleViewQuestionDialog = ref(false);
const visibleFollow = ref(false);
const incomingProcess = ref([] as InComingProcess[]);
const data = ref([]);
const { type } = storeToRefs(useDocumentRolesStore());
getAllUserMoreInfoGraphql().onResult((res) => {
  users.value = res.data.getAllUserMoreInfo;
  userIds.value = users.value.map((u) => u.id);
});

function openDialogAdvice() {
  visibleDialogAdvice.value = true;
}

function viewAdvice() {
  visibleViewQuestionDialog.value = true;
}

function saveCC() {
  const ccDocModel: CcdocInterface = {} as CcdocInterface;
  ccDocModel.ccInfoModels = selectedUser.value.map((item) => ({
    docId: props.docId,
    receiverId: item.userId,
    receiverRoleId: item.roleId,
    receiverDeptId: item.deptId,
    receiverName: item.userName,
    receiverRoleName: item.roleName,
    receiverDeptName: item.deptName,
  }));
  ccDocModel.userDeptRole = props.userDeptRole;
  ccDoc(ccDocModel).then(() => {
    toastSuccess({ message: 'Gửi để biết thành công.' });
    visibleDialogPublished.value = false;
  });
}

function showProcessHistory() {
  visibleProcessHistory.value = true;
}

function showDialogFollow() {
  visibleFollow.value = true;
}

watch(props, (value) => {
  const { onResult: getProcessResult } = getAllProcessByDocIdForDrawRealFlow(
    value.docId,
    value.userDeptRole,
  );
  getProcessResult((res) => {
    incomingProcess.value = res.data.getAllProcessByDocIdForDrawRealFlow;
    data.value = res.data.getAllProcessByDocIdForDrawRealFlow;
  });
});
const mapSupportAction = inject(
  'mapSupportAction',
    {} as ComputedRef<Record<string, true>>,
);

function exportDocSubmit() {
  let number: any;
  findDocSubmitById(props.docId, props.userDeptRole).onResult((res) => {
    number = res.data.findDocSubmitById.number;
  });
  exportWordDocSubmit(props.docId, props.userDeptRole).then((value: any) => {
    if (value) {
      downloadFile(value.data, 'Tờ trình số ' + number.toString());
    }
  });
}
</script>

<script lang="ts">
export default { name: 'ButtonActions' };
</script>

<style lang="scss" scoped>
:deep(.custom-icon),
:deep(.material-symbols-outlined),
:deep(.p-button-icon-left) {
  color: var(--icon-color, currentColor) !important;
}
:deep(.p-button-label) {
  font-weight: 500;
}
#teleport-header-target {
  .btn-action {
    background-color: var(--surface-100) !important;
    border-color: var(--surface-400) !important;
    border-width: 1px;
    &:hover {
      background-color: var(--surface-200) !important;
    }
  }
  .flow-group-btn  {
    margin-left: 0.25rem;
  }
}
</style>
