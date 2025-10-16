<template>
  <div
    class='surface-0 top-0 w-full'
    style='z-index: 1000'>
    <div
      class='flex gap-1 justify-content-between'
      style='height: 2.4rem'>
      <div
        class='flex gap-1'>
        <ButtonIcon
          class='border-round-sm flex justify-content-center mr-2 px-0'
          icon='arrow_back'
          severity='danger'
          size='small'
          style='width: 30px; height: 30px;'
          @click='handleClose'/>

        <div
          class='align-content-center font-semibold text-2xl'>
          Thông tin văn bản
        </div>
      </div>
      <div
        class='flex gap-2'>
        <template
          v-for='action in allActions'
          :key='action.code'>
          <ButtonIcon
            v-if='actionHasPermission(action.code, userDeptRole)&&((userDeptRole.roleId==RoleType.TRO_LY && mapSupportAction[action.code])||userDeptRole.roleId!=RoleType.TRO_LY )'
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
        <ButtonIcon
          class='border-round-sm flex hover:surface-300 justify-content-center surface-100'
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
          class='border-round-sm flex hover:surface-300 justify-content-center surface-100'
          icon='table_eye'
          :label="t('document.doc.docInDetail.follower')"
          severity='secondary'
          size='small'
          :style='{
            "--icon-color": "#d76b11",
            fontSize: "14px",
            fontWeight: "400",
          }'
          @click='showDialogFollow'/>
        <div
          class='flex gap-1'>
          <OutNextButtonsDetail
            :doc='doc'
            :process='process'/>
          <!--      <OutNextButtons-->
          <!--        :current-process-id='currentProcessId'-->
          <!--        :doc-id='docId'-->
          <!--        :flow-id='flowId'-->
          <!--        size='small'-->
          <!--        :user-dept-role='userDeptRole'>-->
          <!--      </OutNextButtons>-->
          <ButtonIcon
            class='border-round-sm'
            icon='splitscreen_right'
            :severity='!expandDetail ? "secondary" : ""'
            size='small'
            @click='expandDetailFn'/>
        </div>
      </div>

      <!--      <ButtonIcon-->
      <!--        icon='export_notes'-->
      <!--        :label="t('Kết xuất phiếu')"-->
      <!--        raised-->
      <!--        severity='secondary'-->
      <!--        size='small'/>-->
    </div>

  </div>
  <Dialog
    v-if='users'
    v-model:visible='visibleDialogPublished'
    class='h-full'
    :header='"Chọn người dùng"'
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
    :doc-type='ObjectTypeEnum.VB_DI'/>

  <SidebarProcessHistoryDocOut
    v-if='visibleProcessHistory'
    :doc-id='props.docId'
    :user-dept-role='props.userDeptRole'
    :visible-sidebar='visibleProcessHistory'
    @hide-dialog='visibleProcessHistory=false'/>

  <SidebarFollow
    v-if='visibleFollow'
    :doc-id='props.docId'
    :user-dept-role='props.userDeptRole'
    :visible-sidebar='visibleFollow'
    @hide-dialog='visibleFollow=false'/>
</template>

<script lang="ts" setup>
import { storeToRefs } from 'pinia';
import type { ButtonProps } from 'primevue/button';
import { type ComputedRef, inject, type PropType, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';

import { getAllUserMoreInfoGraphql } from '@/apps/admin/api/graphql/admin-customer-tenant';
import type { UserMoreInfo } from '@/apps/admin/model/User';
import { getAllProcessByDocIdForDrawRealFlow } from '@/apps/document/api/graphql/incoming-process';
import { ccDoc } from '@/apps/document/api/rest/ccInfo';
import type { CcdocInterface } from '@/apps/document/model/ccdoc';
import { ObjectTypeEnum } from '@/apps/document/model/comment';
import { type DocInInput, type UserDeptRoleInput } from '@/apps/document/model/doc/doc-in';
import type { DocOut } from '@/apps/document/model/doc/doc-out';
import { RoleType } from '@/apps/document/model/permission';
import type { InComingProcess } from '@/apps/document/model/process/incoming';
import type { Process } from '@/apps/document/model/process/process';
import { useDocumentRolesStore } from '@/apps/document/store/document-role';
import DialogAdvice from '@/apps/document/views/doc/dialog/DialogAdvice.vue';
import { actionHasPermission, DocumentAction, mapActionRole } from '@/apps/document/views/doc/doc-in/action/action';
import SidebarFollow from '@/apps/document/views/doc/doc-in/detail/SidebarFollow.vue';
import OutNextButtonsDetail
  from '@/apps/document/views/doc/doc-out/component/next-buttons-detail/OutNextButtonsDetail.vue';
import SidebarProcessHistoryDocOut from '@/apps/document/views/doc/doc-out/detail/SidebarProcessHistoryDocOut.vue';
import ReceiveListUser from '@/apps/work-flow/views/components/ReceiveListUserDept/ReceiveListUser.vue';
import UserSelectMoreDetail from '@/apps/work-flow/views/components/UserSelectMoreDetail/UserSelectMoreDetail.vue';
import { DEFAULT_DIALOG_CONFIG } from '@/common/constants';
import { toastSuccess } from '@/common/helpers/custom-toast-service';
import EventBus from '@/common/helpers/event-bus';

const props = defineProps({

  docId: {
    type: String,
    required: true
  },
  doc: {
    type: Object as PropType<DocOut>,
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
  disabled: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['close-sidebar']);
const selectedUser = ref<Array<UserDeptRoleInput & { id: string }>>([]);
const router = useRouter();
const { t } = useI18n() || {};
const allActions: (ButtonProps & { code: DocumentAction })[] = [
  // {
  //   code: DocumentAction.PROCLAIM,
  //   label: t('document.action.proclaim'),
  //   icon: mapActionRole[DocumentAction.PROCLAIM].icon,
  //   onClick(payload) {
  //     openDialogPublished();
  //   },
  // },
  {
    code: DocumentAction.ASK_FOR_OPINION,
    label: t('document.action.askForOpinion'),
    color: '#BF7CD3',
    icon: mapActionRole[DocumentAction.ASK_FOR_OPINION].icon,
    onClick(payload) {
      openDialogAdvice();
    },
  },
  {
    code: DocumentAction.COPY,
    label: t('document.action.copy'),
    color: '#6FBF73',
    icon: mapActionRole[DocumentAction.COPY].icon,
    onClick(payload) {
    },
  },
];
const users = ref([] as UserMoreInfo[]);
const userIds = ref([] as string[]);
const visibleDialogPublished = ref(false);
const visibleDialogAdvice = ref(false);
const visibleProcessHistory = ref(false);
const visibleFollow = ref(false);
const incomingProcess = ref([] as InComingProcess[]);
const data = ref([]);
const expandDetail = ref(true);
const { type } = storeToRefs(useDocumentRolesStore());
getAllUserMoreInfoGraphql().onResult(res => {
  users.value = res.data.getAllUserMoreInfo;
  userIds.value = users.value.map((u) => u.id);
});

function openDialogAdvice() {
  visibleDialogAdvice.value = true;
}

function saveCC() {
  const ccDocModel: CcdocInterface = {} as CcdocInterface;
  ccDocModel.ccInfoModels = selectedUser.value.map(item => ({
    docId: props.docId,
    receiverId: item.userId,
    receiverRoleId: item.roleId,
    receiverDeptId: item.deptId,
    receiverName: item.userName,
    receiverRoleName: item.roleName,
    receiverDeptName: item.deptName
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
  const { onResult: getProcessResult } = getAllProcessByDocIdForDrawRealFlow(value.docId, value.userDeptRole);
  getProcessResult((res) => {
    incomingProcess.value = res.data.getAllProcessByDocIdForDrawRealFlow;
    data.value = res.data.getAllProcessByDocIdForDrawRealFlow;
  });
});
const mapSupportAction = inject('mapSupportAction', {} as ComputedRef<Record<string, true>>);
const route = useRoute();

const handleClose = () => {
  if(route.params?.id) {
    router.back();
  } else {
    emit('close-sidebar');
  }
};

function expandDetailFn() {
  expandDetail.value = !expandDetail.value;
  EventBus.emit('expand-doc-in-detail', expandDetail.value);
}
</script>

<script lang="ts">
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