<template>
  <div
    class='flex justify-content-between surface-0 top-0 w-full'
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
          Thông tin văn bản đến
        </div>
      </div>

    </div>
    <div
      class='flex gap-1'>
      <ButtonIcon
        v-if='doc.bookId
          && doc.bookNumber
          && doc.status != OutgoingDocStatus.DA_BAN_HANH'
        class='border-round-sm flex hover:surface-300 justify-content-center surface-100'
        icon='directions'
        :label="t('Ban hành')"
        raised
        severity='secondary'
        size='small'
        @click='promulgateDoc'/>

      <ButtonIcon
        v-if='isClerk(userDeptRole.roleId) && doc.status == OutgoingDocStatus.DA_BAN_HANH && doc.revokeType == null'
        class='border-round-sm flex hover:surface-300 justify-content-center surface-100'
        icon='close_small'
        :label="t('Hủy ban hành')"
        raised
        severity='secondary'
        size='small'
        @click='cancel'/>

      <ButtonIcon
        v-if='isClerk(userDeptRole.roleId) && doc.status == OutgoingDocStatus.DA_BAN_HANH && doc.revokeType == null'
        class='border-round-sm flex hover:surface-300 justify-content-center surface-100'
        icon='cached'
        :label="t('Thu hồi ban hành')"
        raised
        severity='secondary'
        size='small'
        @click='visiblePromulgateRevoke = true'/>

      <ButtonIcon
        class='border-round-sm flex hover:surface-300 justify-content-center surface-100'
        icon='history'
        :label="t('document.doc.docInDetail.processHistory')"
        raised
        severity='secondary'
        size='small'
        @click='showProcessHistory'/>

      <ButtonIcon
        class='border-round-sm flex hover:surface-300 justify-content-center surface-100'
        icon='table_eye'
        :label="t('document.doc.docInDetail.follower')"
        raised
        severity='secondary'
        size='small'
        @click='showDialogFollow'/>

      <ButtonIcon
        class='border-round-sm'
        icon='splitscreen_right'
        :severity='!expandDetail ? "secondary" : ""'
        size='small'
        @click='expandDetailFn'/>
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

  <SidebarProcessHistoryDocOut
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

  <PromulgateRevokeDialog
    v-if='visiblePromulgateRevoke'
    :doc-id='docId'
    :visible='visiblePromulgateRevoke'
    @hide-dialog='visiblePromulgateRevoke = false'/>

  <ReviewReceivesDialog
    v-if='visibleDialogReview'
    :doc-id='props.docId'
    :is-detail='true'
    :visible='visibleDialogReview'
    @hide-dialog='hideDialogPromulgate'/>
</template>

<script lang='ts' setup>
import { storeToRefs } from 'pinia';
import { useConfirm } from 'primevue/useconfirm';
import { type PropType, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';

import { getAllUserMoreInfoGraphql } from '@/apps/admin/api/graphql/admin-customer-tenant';
import type { UserMoreInfo } from '@/apps/admin/model/User';
import { promulgate } from '@/apps/document/api/graphql/doc-out';
import { getAllProcessByDocIdForDrawRealFlow } from '@/apps/document/api/graphql/incoming-process';
import { cancelPromulgateDoc } from '@/apps/document/api/graphql/outgoing-doc';
import { ccDoc } from '@/apps/document/api/rest/ccInfo';
import type { CcdocInterface } from '@/apps/document/model/ccdoc';
import { type DocIn, type UserDeptRoleInput } from '@/apps/document/model/doc/doc-in';
import { type DocOut, type DocOutInput, OutgoingDocStatus } from '@/apps/document/model/doc/doc-out';
import { isClerk, RoleType } from '@/apps/document/model/permission';
import type { InComingProcess } from '@/apps/document/model/process/incoming';
import { useDocumentRolesStore } from '@/apps/document/store/document-role';
import { actionHasPermission } from '@/apps/document/views/doc/doc-in/action/action';
import NextButtonsDetail from '@/apps/document/views/doc/doc-in/component/next-buttons-detail/NextButtonsDetail.vue';
import SidebarFollow from '@/apps/document/views/doc/doc-in/detail/SidebarFollow.vue';
import PromulgateRevokeDialog from '@/apps/document/views/doc/doc-out/action/PromulgateRevokeDialog.vue';
import ReviewReceivesDialog from '@/apps/document/views/doc/doc-out/detail/ReviewReceivesDialog.vue';
import SidebarProcessHistoryDocOut from '@/apps/document/views/doc/doc-out/detail/SidebarProcessHistoryDocOut.vue';
import ReceiveListUser from '@/apps/work-flow/views/components/ReceiveListUserDept/ReceiveListUser.vue';
import UserSelectMoreDetail from '@/apps/work-flow/views/components/UserSelectMoreDetail/UserSelectMoreDetail.vue';
import { DEFAULT_DIALOG_CONFIG } from '@/common/constants';
import { toastSuccess } from '@/common/helpers/custom-toast-service';
import EventBus from '@/common/helpers/event-bus';

const props = defineProps({
  flowId: {
    type: String,
    default: undefined
  },
  docId: {
    type: String,
    required: true
  },
  currentProcessId: {
    type: String,
    default: undefined
  },
  disabled: {
    type: Boolean,
    default: false
  },
  isReceive: {
    type: Boolean,
    default: false
  },
  doc: {
    type: Object as PropType<DocOutInput>,
    default: {} as DocOut
  }
});

const emits = defineEmits(['hide-sidebar']);

const {
  mutate: promulgateMutate,
  onDone: promulgateOnDone
} = promulgate();
const selectedUser = ref<Array<UserDeptRoleInput & { id: string }>>([]);
const { t } = useI18n() || {};
const visiblePromulgateRevoke = ref(false);
const users = ref([] as UserMoreInfo[]);
const userIds = ref([] as string[]);
const visibleDialogPublished = ref(false);
const visibleProcessHistory = ref(false);
const visibleFollow = ref(false);
const incomingProcess = ref([] as InComingProcess[]);
const data = ref([]);
const { type } = storeToRefs(useDocumentRolesStore());
const confirm = useConfirm();
const visibleDialogReview = ref(false);

const expandDetail = ref(true);
getAllUserMoreInfoGraphql().onResult(res => {
  users.value = res.data.getAllUserMoreInfo;
  userIds.value = users.value.map((u) => u.id);
});
const { userDeptRole } = storeToRefs(useDocumentRolesStore());

function cancel() {
  confirm.require({
    message: t('Bạn có chắc chắn hủy ban hành văn bản này không?'),
    header: t('common.confirm'),
    icon: 'pi pi-exclamation-triangle',
    accept: () => {
      cancelPromulgateDoc().mutate({
        model: {
          docId: props.docId,
          userDeptRole: userDeptRole.value
        }
      }).then(() => {
        toastSuccess({ message: 'Đã hủy ban hành thành công.' });
        emits('hide-sidebar');
      });
    },
  });
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
  ccDocModel.userDeptRole = userDeptRole.value;
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

function promulgateDoc() {
  visibleDialogReview.value = true;
}

watch(props, (value) => {
  const { onResult: getProcessResult } = getAllProcessByDocIdForDrawRealFlow(value.docId, userDeptRole.value);
  getProcessResult((res) => {
    incomingProcess.value = res.data.getAllProcessByDocIdForDrawRealFlow;
    data.value = res.data.getAllProcessByDocIdForDrawRealFlow;
  });
});

promulgateOnDone(() => {
  toastSuccess({ message: t('document.doc.docOut.validate.promulgateSuccess') });
  emits('hide-sidebar');
});

function hideDialogPromulgate() {
  visibleDialogReview.value = false;
  emits('hide-sidebar');
}

function expandDetailFn() {
  expandDetail.value = !expandDetail.value;
  EventBus.emit('expand-doc-in-detail', expandDetail.value);
}
const route = useRoute();
const router = useRouter();
const handleClose = () => {
  if(route.params?.id) {
    router.back();
  } else {
    emits('hide-sidebar');
  }
};
</script>

<script lang='ts'>
export default { name: 'ButtonActionsForPromulgate' };
</script>

<style scoped>

</style>