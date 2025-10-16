<template>
  <DocSubmitItem v-bind='$props'>
    <template #sender='{doc}'>
      <AppUserDeptRole
        avatar-size='2.5'
        overlay-visible
        :user-dept-role='editorUserDeptRole(doc)'/>
      <AppIcon
        v-if='model?.sendBackType === SendBackType.TU_CHOI'
        v-tooltip='t("document.doc.rejected")'
        name='reply'
        size='1.2'/>
      <AppIcon
        v-if='model?.sendBackType === SendBackType.THU_HOI'
        v-tooltip='t("document.doc.revoked")'
        name='rotate_left'
        size='1.2'/>
    </template>
    <template #date>
      <div
        v-if='model?.docDate'
        class='text-sm'>{{ moment(model?.docDate).format('DD/MM/YYYY HH:mm') }}
      </div>
    </template>
    <template #action='{doc}'>
      <i
        v-if='doc && canEdit(doc)'
        v-tooltip='t("common.edit")'
        class='pi pi-pencil text-blue-500'
        @click='goToEdit(doc.id!!)'></i>
      <i
        v-if='doc && canEdit(doc)'
        v-tooltip='t("common.delete")'
        class='pi pi-trash text-red-500'
        @click='deleteDoc(doc.id!!)'></i>
    </template>

  </DocSubmitItem>
</template>

<script lang='ts' setup>
import { useConfirm } from 'primevue/useconfirm';
import { inject, type PropType } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

import { deleteDocSubmit } from '@/apps/document/api/graphql/doc-submit';
import { SendBackType, type UserDeptRoleInput } from '@/apps/document/model/doc/doc-in';
import { type DocSubmit, DocSubmitStatus } from '@/apps/document/model/doc/doc-submit-input';
import { OrganizationType } from '@/apps/document/model/organization';
import DocSubmitItem from '@/apps/document/views/doc/submit/list/item/DocSubmitItem.vue';
import AppIcon from '@/common/components/app/AppIcon.vue';
import AppUserDeptRole from '@/common/components/app/AppUserDeptRole.vue';
import { toastSuccess } from '@/common/helpers/custom-toast-service';
import useMoment from '@/common/helpers/mixins/use-moment';

defineProps({
  model: {
    type: Object as PropType<DocSubmit>,
    default: undefined
  },
  selected: {
    type: Boolean,
    default: false
  }
});
const router = useRouter();
const { t } = useI18n();
const { moment } = useMoment();
const confirm = useConfirm();
const refetchDocSubmit = inject('refetchDocSubmit', () => void 0);

function canEdit(doc: DocSubmit) {
  return doc.status === DocSubmitStatus.SOAN_THAO;
}

function editorUserDeptRole(doc: DocSubmit | undefined): UserDeptRoleInput {
  return {
    userId: doc?.editorId || '',
    deptId: doc?.editorDeptId || '',
    roleId: doc?.editorRoleId || '',
    userName: doc?.editorName || '',
    deptName: doc?.editorDeptName || '',
    roleName: doc?.editorRoleName || '',
    type: OrganizationType.ADMINISTRATIVE
  };
}

function goToEdit(id: string) {
  router.push({
    name: 'UpdateDocumentSubmitForm',
    params: { id: id }
  });
}

function deleteDoc(docId: string) {
  confirm.require({
    message: 'Bạn có chắc chắn muốn xóa không?',
    header: t('common.confirm'),
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: t('common.delete'),
    acceptClass: 'p-button-danger',
    accept: () => {
      deleteDocSubmit().mutate({ id: docId }).then(() => {
        refetchDocSubmit();
        toastSuccess();
      });
    }
  });
}

</script>

<style scoped>

</style>
