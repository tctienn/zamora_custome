<template>
  <div>
    <DocOutItem v-bind='$props'>
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
      <template #action='{doc}'>
        <template v-if='doc'>
          <i
            v-if='doc && canEdit(doc)'
            v-tooltip='t("common.edit")'
            class='pi pi-pencil text-blue-500'
            @click='edit(doc)'></i>
          <i
            v-if='doc && canEdit(doc)'
            v-tooltip='t("common.delete")'
            class='pi pi-trash text-red-500'
            @click='deleteDoc(doc)'></i>
        </template>
      </template>
    </DocOutItem>
    <SidebarDocumentOut
      v-if='visibleFormDocIn'
      :doc-id='docOutId'
      :visible='visibleFormDocIn'
      @hide-sidebar='hideSidebar'/>
  </div>
</template>

<script lang='ts' setup>

import { useConfirm } from 'primevue/useconfirm';
import { inject, type PropType, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

import { deleteDocOut } from '@/apps/document/api/graphql/doc-out';
import { SendBackType, type UserDeptRoleInput } from '@/apps/document/model/doc/doc-in';
import { type DocOut, OutgoingDocStatus } from '@/apps/document/model/doc/doc-out';
import { OrganizationType } from '@/apps/document/model/organization';
import { useDocumentRolesStore } from '@/apps/document/store/document-role';
import SidebarDocumentOut from '@/apps/document/views/doc/doc-out/detail/SidebarDocumentOut.vue';
import DocOutItem from '@/apps/document/views/doc/doc-out/list/item/DocOutItem.vue';
import AppIcon from '@/common/components/app/AppIcon.vue';
import AppUserDeptRole from '@/common/components/app/AppUserDeptRole.vue';
import { toastSuccess } from '@/common/helpers/custom-toast-service';

defineProps({
  model: {
    type: Object as PropType<DocOut>,
    default: undefined
  },
  selected: {
    type: Boolean,
    default: false
  }
});

const { t } = useI18n();
const visibleFormDocIn = ref(false);
const docOutId = ref();
const router = useRouter();
const {
  mutate,
  onDone
} = deleteDocOut();
const { userDeptRole } = useDocumentRolesStore();
const confirm = useConfirm();
const refetchDocOuts = inject('reloadDoc', () => void 0);
onDone(() => {
  toastSuccess({ message: 'Xóa văn bản đi thành công.' });
  refetchDocOuts();
});

function canEdit(doc: DocOut) {
  return doc.status === OutgoingDocStatus.DU_THAO;
}

function edit(doc: DocOut) {
  docOutId.value = doc.id;
  visibleFormDocIn.value = true;
  // router.push('draft/update/' + doc.id);
}

function hideSidebar() {
  visibleFormDocIn.value = false;
  refetchDocOuts();
}

function deleteDoc(doc: DocOut) {
  confirm.require({
    message: 'Bạn có muốn xóa văn bản này không?',
    header: t('common.confirm'),
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: t('common.delete'),
    acceptClass: 'p-button-danger',
    accept: () => {
      mutate({
        id: doc.id,
        userDeptRole: userDeptRole
      });
    },
  });
}

function editorUserDeptRole(doc: DocOut | undefined): UserDeptRoleInput {
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
</script>

<style scoped>

</style>
