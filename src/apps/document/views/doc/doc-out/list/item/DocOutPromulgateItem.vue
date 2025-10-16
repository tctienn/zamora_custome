<template>
  <div>
    <DocOutItem v-bind='$props'>
      <template #sender='{doc}'>
        <AppUser
          avatar-size='2.5'
          overlay-visible
          :user-id='doc?.signerId'/>
        <AppIcon
          v-if='model?.revokeType === RevokeType.REVOKE'
          v-tooltip='t("document.doc.revokeProclaimed")'
          name='unpublished'
          size='1.2'/>
      </template>
      <template #action='{doc}'>
        <template v-if='doc'>
          <i
            v-if='model'
            v-tooltip='t("common.edit")'
            class='pi pi-pencil text-blue-500'
            @click='edit(doc)'></i>
          <i
            v-if='model && canDelete(doc)'
            v-tooltip='t("common.delete")'
            class='pi pi-trash text-red-500'
            @click='deleteDoc(doc)'></i>
        </template>
      </template>
    </DocOutItem>

    <SidebarPromulgate
      v-if='visiblePromulgate'
      :doc-id='docId'
      :visible='visiblePromulgate'
      @hide-sidebar='hideSidebar'/>
  </div>
</template>

<script lang='ts' setup>

import { useConfirm } from 'primevue/useconfirm';
import { inject, type PropType, provide, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { deleteDocOut } from '@/apps/document/api/graphql/doc-out';
import { type DocOut, RevokeType } from '@/apps/document/model/doc/doc-out';
import { useDocumentRolesStore } from '@/apps/document/store/document-role';
import SidebarPromulgate from '@/apps/document/views/doc/doc-out/detail/SidebarPromulgate.vue';
import DocOutItem from '@/apps/document/views/doc/doc-out/list/item/DocOutItem.vue';
import AppIcon from '@/common/components/app/AppIcon.vue';
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
const refetchDocOuts = inject('reloadDoc', () => void 0);
const confirm = useConfirm();
const { userDeptRole } = useDocumentRolesStore();
const { t } = useI18n();
const docId = ref<string>();
const visiblePromulgate = ref(false);
const {
  mutate,
  onDone
} = deleteDocOut();
onDone(() => {
  toastSuccess({ message: 'Xóa văn bản đi thành công.' });
  refetchDocOuts();
});

function edit(doc: DocOut) {
  visiblePromulgate.value = true;
  docId.value = doc.id;
  // router.push('waiting-proclaim/update/' + doc.id);
}

function canDelete(doc: DocOut) {
  return doc.isFromOutsidePaper;
}

function hideSidebar() {
  docId.value = '';
  visiblePromulgate.value = false;
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

provide('hasBook', (doc: DocOut | undefined): boolean => !!doc?.docInBook);
</script>

<style scoped>

</style>