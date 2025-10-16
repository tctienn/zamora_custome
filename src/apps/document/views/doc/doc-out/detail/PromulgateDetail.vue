<template>
  <Sidebar
    v-model:visible='visibleSidebar'
    class='sidebar-detail'
    position='right'
    :show-close-icon='false'
    v-bind='{...DEFAULT_DIALOG_CONFIG,style: {width: "75vw"}}'
    @hide='emits("hide-sidebar")'>
    <div
      class='border-300 border-bottom-1 flex gap-1 justify-content-between mb-2 p-2 surface-0'
      style='min-height: 39px'>
      <ButtonActionsForPromulgate
        :current-process-id='""'
        :doc='doc'
        :doc-id='id.toString()'
        :flow-id='doc?.flowId'
        :user-dept-role='userDeptRole'
        @hide-sidebar="emits('hide-sidebar')"/>
    </div>

    <PromulgateMoreDetail
      ref='docDetailRef'
      :attachments='attachments'
      :disable='disable'
      :doc='doc'
      :doc-id='id.toString()'
      :options-tree='optionsTree'
      :related-documents='relatedDocuments'/>
  </Sidebar>

</template>

<script setup lang="ts">

import { storeToRefs } from 'pinia';
import { ref, watchEffect } from 'vue';
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
  id: {
    type: String,
    default: ''
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
watchEffect(() => {
  visibleSidebar.value = props.visible;
  if (props.visible && props.id) {
    findDocOutByIdGraph(userDeptRole.value, props.id.toString()).onResult((res) => {
      doc.value = res.data.findByDocOutById;
      disable.value = doc.value.status == OutgoingDocStatus.DA_BAN_HANH;
      relatedDocuments.value = doc.value.outGoingFilesRelate;
      attachments.value = doc.value.outGoingAttachments;
      optionsTree.value = doc.value.receivers.map((re: any) => ({
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
      }));
    });
  }
});

// findDocOutByIdGraph(userDeptRole.value, props.id.toString()).onResult((res) => {
//   doc.value = res.data.findByDocOutById;
//   disable.value = doc.value.status == OutgoingDocStatus.DA_BAN_HANH;
//   relatedDocuments.value = doc.value.outGoingFilesRelate;
//   attachments.value = doc.value.outGoingAttachments;
//   optionsTree.value = doc.value.receivers.map((re: any) => {
//     return {
//       label: re.objectName,
//       value: {
//         id: re.id,
//         receiveStatus: re.receiveStatus,
//         receiveType: re.receiveType,
//         objectType: re.objectType,
//         objectId: re.objectId,
//         objectName: re.objectName,
//         orderNo: re.orderNo
//       }
//     };
//   });
// });
</script>

<script lang="ts">
export default { name: 'PromulgateDetail' };
</script>

<style scoped>
.field-custom {
  display: inline-block;
  width: auto;
}
</style>