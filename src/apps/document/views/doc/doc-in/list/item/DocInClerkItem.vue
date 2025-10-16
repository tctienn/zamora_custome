<template>
  <div>
    <DocInItem
      :model='model'
      :selected='selected'>
      <template #sender='{doc}'>
        <AppAvatar
          :label='doc?.publisherName'
          size='2.5'/>
        <AppIcon
          v-if='model?.sendBackType === SendBackType.TU_CHOI'
          v-tooltip='t("document.doc.returned")'
          name='reply'
          size='1.2'/>
        <AppIcon
          v-if='model?.sendBackType === SendBackType.THU_HOI'
          v-tooltip='t("document.doc.revoked")'
          name='rotate_left'
          size='1.2'/>
      </template>
      <template #date='{doc}'>
        <div class='text-sm'>
          {{ doc?.incomingDate ? moment(doc?.incomingDate).format('DD/MM/YYYY') : '' }}
        </div>
      </template>
      <template #action='{doc}'>
        <template v-if='doc'>
          <i
            v-if='model && canEdit(doc)'
            v-tooltip='t("common.edit")'
            class='pi pi-pencil text-blue-500'
            @click='edit(doc)'></i>
          <i
            v-if='model && canEdit(doc) && model.canDelete'
            v-tooltip='t("common.delete")'
            class='pi pi-trash text-red-500'
            @click='deleteDoc(doc)'></i>
        </template>
      </template>
    </DocInItem>
    <SidebarDocumentIn
      v-if='visibleFormDocIn'
      :doc-id='docId'
      :visible='visibleFormDocIn'
      @hide-sidebar='hideSidebar'/>
  </div>
</template>

<script lang='ts' setup>

import { storeToRefs } from 'pinia';
import { useConfirm } from 'primevue/useconfirm';
import { type PropType, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

import { deleteDocComing } from '@/apps/document/api/rest/docIn';
import { type DocIn, DocStatus, SendBackType } from '@/apps/document/model/doc/doc-in';
import { useDocumentRolesStore } from '@/apps/document/store/document-role';
import SidebarDocumentIn from '@/apps/document/views/doc/doc-in/detail/SidebarDocumentIn.vue';
import DocInItem from '@/apps/document/views/doc/doc-in/list/item/DocInItem.vue';
import AppAvatar from '@/common/components/app/AppAvatar.vue';
import AppIcon from '@/common/components/app/AppIcon.vue';
import { toastSuccess } from '@/common/helpers/custom-toast-service';
import EventBus from '@/common/helpers/event-bus';
import useMoment from '@/common/helpers/mixins/use-moment';

defineProps({
  model: {
    type: Object as PropType<DocIn>,
    default: undefined
  },
  selected: {
    type: Boolean,
    default: false
  }
});
const docId = ref();
const confirm = useConfirm();
const visibleFormDocIn = ref(false);
const { userDeptRole } = storeToRefs(useDocumentRolesStore());
const { moment } = useMoment();
const { t } = useI18n();
const router = useRouter();

function canEdit(doc: DocIn) {
  return doc.status === DocStatus.NHAP;
}

function hideSidebar() {
  visibleFormDocIn.value = false;
  EventBus.emit('reload-doc-in');
}

function deleteDoc(doc: DocIn) {
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
      });
    },
  });
}

function edit(doc: DocIn) {
  docId.value = doc.id;
  visibleFormDocIn.value = true;
  // router.push({
  //   name: 'DocumentDocInUpdate',
  //   params: { id: doc.id }
  // });
}
</script>

<style scoped>
.p-dialog .p-confirm-dialog-message {
  font-weight: normal;
  white-space: pre-wrap;
  word-break: break-word;
}

.p-dialog .p-confirm-dialog-message strong {
  font-weight: bold;
}
</style>
