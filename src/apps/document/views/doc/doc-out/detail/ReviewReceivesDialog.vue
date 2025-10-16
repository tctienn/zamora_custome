<template>
  <Dialog
    v-model:visible='visibleDialog'
    v-bind='{...DEFAULT_DIALOG_CONFIG, "style": "width: 60vw"}'
    header='Danh sách Người/Phòng ban nhận'
    :pt="{
      content: {
        class: 'py-2 px-3'
      },
      header: {
        class: 'py-2'
      }
    }"
    @hide="emits('hide-dialog')">
    <div
      class='h-auto'
      style='height: 70vh'>
      <DataTable
        :value='doc?.receivers'
        v-bind='{...DEFAULT_DATATABLE_CONFIG, "scroll-height": "45rem", "show-gridlines": true}'>
        <Column
          class='col-5'
          header='Người/Phòng ban'>
          <template #body='{data: {objectId, objectName,objectType, roleId, roleName, deptId, deptName}}'>
            <AppUserDeptRole
              avatar-size='2.5'
              info-visible
              :infos='["positionName", "deptName", "roleName"]'
              name-visible
              :user-dept-role='{roleId: roleId,
                                userId: objectType == ReceiveObjectType.NGUOI_NHAN_TRONG_HE_THONG ? objectId : "",
                                userName: objectType == ReceiveObjectType.NGUOI_NHAN_TRONG_HE_THONG ? objectName : "",
                                deptId: objectType != ReceiveObjectType.NGUOI_NHAN_TRONG_HE_THONG ? objectId : deptId,
                                deptName : objectType != ReceiveObjectType.NGUOI_NHAN_TRONG_HE_THONG ? objectName : deptName,
                                roleName: roleName,
                                type: userDeptRole.type}'/>
          </template>
        </Column>

        <Column
          class='col-3 text-center'
          header='Loại'>
          <template #body='{data: {objectType}}'>
            <div class='w-auto'>
              {{ mapReceiveObjectTypeName(objectType) }}
            </div>
          </template>
        </Column>
      </DataTable>
    </div>

    <template #footer>
      <div class='flex flex-row gap-2 justify-content-center py-1'>
        <Button
          class='border-round-sm'
          icon='pi pi-times'
          :label="t('common.close')"
          severity='danger'
          @click="emits('hide-dialog')"/>
        <Button
          class='border-round-sm'
          icon='pi pi-check'
          :label="t('document.action.promulgate')"
          @click='promulgateDoc'/>
      </div>
    </template>
  </Dialog>
</template>

<script setup lang="ts">

import { storeToRefs } from 'pinia';
import { useConfirm } from 'primevue/useconfirm';
import { inject, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

import { findDocOutByIdGraph, promulgate } from '@/apps/document/api/graphql/doc-out';
import { ReceiveObjectType } from '@/apps/document/model/outgoingDocReceivers';
import { useDocumentRolesStore } from '@/apps/document/store/document-role';
import AppUserDeptRole from '@/common/components/app/AppUserDeptRole.vue';
import { DEFAULT_DATATABLE_CONFIG, DEFAULT_DIALOG_CONFIG } from '@/common/constants';
import { toastSuccess } from '@/common/helpers/custom-toast-service';

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  docId: {
    type: String,
    default: null
  },
  isDetail: {
    type: Boolean,
    default: false
  }
});
const emits = defineEmits(['hide-dialog']);
const doc = ref();
const refetchDocOuts = inject('reloadDoc', () => void 0);
const confirm = useConfirm();
const router = useRouter();
const { userDeptRole } = storeToRefs(useDocumentRolesStore());
const {
  mutate: promulgateMutate,
  onDone: promulgateOnDone
} = promulgate();

const visibleDialog = ref(props.visible);
const { t } = useI18n();

findDocOutByIdGraph(userDeptRole.value, props.docId).onResult((res) => {
  doc.value = res.data.findByDocOutById;
});

function mapReceiveObjectTypeName(objectType: ReceiveObjectType) {
  if (objectType == ReceiveObjectType.DON_VI_NOI_BO) {
    return 'Đơn vị nội bộ';
  } else if (objectType == ReceiveObjectType.NGUOI_NHAN_TRONG_HE_THONG) {
    return 'Người nhận trong hệ thống';
  } else if (objectType == ReceiveObjectType.DON_VI_NGOAI) {
    return 'Đơn vị ngoài';
  }
}

function promulgateDoc() {
  confirm.require({
    message: t('document.doc.docOut.validate.questionPromulgate'),
    header: t('common.confirm'),
    icon: 'pi pi-exclamation-triangle',
    accept: () => {
      promulgateMutate({
        docId: doc.value.id,
        userDeptRole: userDeptRole.value
      });
    },
  });
}

promulgateOnDone(() => {
  toastSuccess({ message: t('document.doc.docOut.validate.promulgateSuccess') });
  emits('hide-dialog');
  if (props.isDetail) {
    router.back();
  } else {
    refetchDocOuts();
  }
});
</script>

<style scoped>
:deep([class*="col-"]) {
  padding: 0.5rem 0.75rem;
}
</style>

<script lang="ts">
export default { name: 'ReviewReceivesDialog' };
</script>