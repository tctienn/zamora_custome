<template>
  <Sidebar
    v-model:visible='visibleSidebar'
    class='sidebar-detail'
    :dismissable='false'
    position='right'
    :show-close-icon='false'
    v-bind='{...DEFAULT_DIALOG_CONFIG,style: {width: "95vw"}}'
    @hide='emits("hide-sidebar")'>
    <ButtonActionsForPromulgate
      :current-process-id='""'
      :doc='doc'
      :doc-id='props.docId'
      :flow-id='doc?.flowId'
      :user-dept-role='userDeptRole'
      @hide-sidebar='hideSidebar'/>
    <PromulgateMoreDetail
      ref='docDetailRef'
      :attachments='attachments'
      :disable='disable'
      :doc='doc'
      :doc-id='props.docId'
      :options-tree='optionsTree'
      :related-documents='relatedDocuments'/>

    <Divider class='my-0 py-0'/>
  </Sidebar>
</template>

<script setup lang='ts'>

import { storeToRefs } from 'pinia';
import { ref } from 'vue';
import { useRoute } from 'vue-router';

import { findDocOutByIdGraph } from '@/apps/document/api/graphql/doc-out';
import type { DocumentAttachment } from '@/apps/document/model/attachment';
import { PRIORITIES, SECURITIES } from '@/apps/document/model/doc/doc-in';
import { type DocOutInput, OutgoingDocStatus } from '@/apps/document/model/doc/doc-out';
import { useDocumentRolesStore } from '@/apps/document/store/document-role';
import ButtonActionsForPromulgate from '@/apps/document/views/doc/doc-out/action/ButtonActionsForPromulgate.vue';
import PromulgateMoreDetail from '@/apps/document/views/doc/doc-out/detail/PromulgateMoreDetail.vue';
import { DEFAULT_DIALOG_CONFIG } from '@/common/constants';

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

const emits = defineEmits(['hide-sidebar']);

const relatedDocuments = ref([] as DocumentAttachment[]);
const { userDeptRole } = storeToRefs(useDocumentRolesStore());
const disable = ref(false);
const attachments = ref([] as DocumentAttachment[]);
const optionsTree = ref<{ label: string, value: any }[]>([]);
const visibleSidebar = ref(props.visible);
const doc = ref({
  securityCode: SECURITIES[0].value,
  priorityCode: PRIORITIES[0].value,
} as DocOutInput);
const route = useRoute();

findDocOutByIdGraph(userDeptRole.value, props.docId).onResult((res) => {
  doc.value = res.data.findByDocOutById;
  disable.value = doc.value.status == OutgoingDocStatus.DA_BAN_HANH;
  relatedDocuments.value = doc.value.outGoingFilesRelate;
  attachments.value = doc.value.outGoingAttachments;
  optionsTree.value = doc.value.receivers.map((re: any) => {
    return {
      label: re.objectName,
      value: {
        id: re.id,
        receiveStatus: re.receiveStatus,
        receiveType: re.receiveType,
        objectType: re.objectType,
        objectId: re.objectId,
        objectName: re.objectName,
        orderNo: re.orderNo
      }
    };
  });
});

function hideSidebar() {
  emits('hide-sidebar');
}
</script>

<script lang='ts'>
export default { name: 'SidebarPromulgateDetail' };
</script>

<style>
.field-custom {
  display: inline-block;
  width: auto;
}

.sidebar-detail .p-sidebar-header {
  display: none
}

.sidebar-detail .p-sidebar-content {
  padding-left: 0;
  padding-right: 0
}
</style>