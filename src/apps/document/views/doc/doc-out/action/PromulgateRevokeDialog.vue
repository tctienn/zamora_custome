<template>
  <Dialog
    v-model:visible='visibleDialog'
    v-bind='DEFAULT_DIALOG_CONFIG'
    class='p-0'
    :header="'Chọn đơn vị và người đã nhận'"
    style='width: 70vw'
    @hide="emits('hide-dialog')">
    <div
      class='surface-0'
      style='height: 60vh'>
      <label
        v-required
        class='font-semibold pb-2'>Chọn đơn vị và người đã nhận</label>

      <DataTable
        v-model:selection='selectedRow'
        data-key='id'
        edit-mode='row'
        scroll-height='44vh'
        scrollable
        selection-mode='multiple'
        style='height: 45vh'
        :value='receivers'>
        <Column
          header-style='width: 3rem'
          selection-mode='multiple'></Column>

        <Column
          class='col-1'
          :header='t("STT")'>
          <template #body='{ index }'>
            {{ index + 1 }}
          </template>
        </Column>

        <Column
          field='userId'
          :header='t("Họ và tên")'>
          <template #body='{data : {objectId, objectType, objectName}}'>
            <AppUser
              v-if='objectType == ReceiveObjectType.NGUOI_NHAN_TRONG_HE_THONG'
              avatar-size='2.5'
              info-visible
              :infos='["positionName", "departments", "roleName"]'
              name-visible
              :user-id='objectId'/>

            <AppUserDeptRole
              v-else
              avatar-size='2.5'
              info-visible
              :infos='["deptName"]'
              name-visible
              :user-dept-role='{ userId: "",userName: "", deptId: objectId,deptName : objectName, roleId: "",
                                 roleName: "", type: userDeptRole.type, orgOutName: ""}'/>

          </template>
        </Column>

        <Column
          field='userId'
          :header='t("Đơn vị/Phòng ban")'>
          <template #body='{data : {deptName}}'>
            {{ deptName ? `${deptName}` : '' }}
          </template>
        </Column>
      </DataTable>

      <label
        v-required
        class='font-semibold'>Lý do</label>

      <Textarea
        id='positionDescription'
        v-model='reason'
        v-trim
        class='p-0 w-full'
        name='note'
        rows='6'/>
    </div>
    <template #footer>
      <div class='flex flex-row gap-2 justify-content-center py-1'>
        <Button
          icon='pi pi-times'
          :label="t('common.close')"
          severity='danger'
          @click="emits('hide-dialog')"/>
        <Button
          icon='pi pi-check'
          :label="t('common.save')"
          @click='revoke'/>
      </div>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import Column from 'primevue/column';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { revokePromulgatedDoc } from '@/apps/document/api/graphql/outgoing-doc';
import { findByDocIdAndObjectTypeNot } from '@/apps/document/api/graphql/outgoing-doc-receivers';
import type { RevokePromulgatedDocModel } from '@/apps/document/model/doc/doc-out';
import { ReceiveObjectType } from '@/apps/document/model/outgoingDocReceivers';
import { useDocumentRolesStore } from '@/apps/document/store/document-role';
import AppUser from '@/common/components/app/AppUser.vue';
import AppUserDeptRole from '@/common/components/app/AppUserDeptRole.vue';
import { DEFAULT_DATATABLE_CONFIG, DEFAULT_DIALOG_CONFIG } from '@/common/constants';
import { toastError, toastSuccess } from '@/common/helpers/custom-toast-service';

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  docId: {
    type: String,
    default: null
  }
});
const emits = defineEmits(['hide-dialog']);
const { t } = useI18n() || {};
const selectedRow = ref();
const reason = ref<string>('');
const receivers = ref();
const { userDeptRole } = useDocumentRolesStore();
const { onResult } = findByDocIdAndObjectTypeNot(props.docId, ReceiveObjectType.DON_VI_NGOAI);
onResult((res) => {
  receivers.value = res.data.findByDocIdAndObjectTypeNot;
});
const visibleDialog = ref(props.visible);

function revoke() {
  let model: RevokePromulgatedDocModel = {} as RevokePromulgatedDocModel;
  model.docId = props.docId;
  model.reason = reason.value;
  model.userDeptRole = userDeptRole;
  selectedRow.value.forEach((userDept: any) => {
    model.revokeUserDeptRole = [...model.revokeUserDeptRole || [], {
      userId: userDept.objectType == ReceiveObjectType.NGUOI_NHAN_TRONG_HE_THONG ? userDept.objectId : '',
      userName: userDept.objectName,
      deptId: userDept.objectType == ReceiveObjectType.DON_VI_NOI_BO ? userDept.objectId : userDept.deptId,
      deptName: userDept.objectType == ReceiveObjectType.DON_VI_NOI_BO ? userDept.objectName : userDept.deptName,
      roleId: userDept.roleId,
      roleName: userDept.roleName,
      type: userDeptRole.type
    }];
  });
  revokePromulgatedDoc().mutate({
    model,
    userDeptRole
  }).then(() => {
    toastSuccess({ message: t('Thu hồi thành công.') });
    emits('hide-dialog');
  }).catch((err) => {
    toastError({ message: t('document.doc.error.' + err.graphQLErrors[0].extensions.errorCode) });
  });
}
</script>

<style scoped>

</style>

<script lang="ts">
export default { name: 'PromulgateRevokeDialog' };
</script>