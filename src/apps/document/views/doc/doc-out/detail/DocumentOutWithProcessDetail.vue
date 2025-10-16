<template>
  <Sidebar
    v-model:visible='visibleSidebar'
    class='sidebar-detail'
    position='right'
    :show-close-icon='false'
    v-bind='{...DEFAULT_DIALOG_CONFIG,style: {width: "75vw"}}'
    @hide='emits("hide-sidebar")'>
    <div
      class='border-300 border-bottom-1 flex gap-1 justify-content-between mb-2 p-1 surface-0'
      style='min-height: 39px'>
      <ButtonActions
        :doc='doc'
        :doc-id='docId'
        :process='process'
        :user-dept-role='userDeptRole'
        @close-sidebar='visibleSidebar = false'/>
    </div>

    <DocumentOutMoreDetail
      ref='docDetailRef'
      :doc-id='docId'>
    </DocumentOutMoreDetail>
  </Sidebar>

</template>

<script lang='ts' setup>
import { storeToRefs } from 'pinia';
import { computed, provide, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { findOutProcessById } from '@/apps/document/api/graphql/outgoing-process';
import { getDocStatusFromRoute, getHideButtonsStatus } from '@/apps/document/helpers/route-extract';
import { type DocOut, OutgoingDocStatus } from '@/apps/document/model/doc/doc-out';
import type { Process } from '@/apps/document/model/process/process';
import { useDocumentRolesStore } from '@/apps/document/store/document-role';
import ButtonActions from '@/apps/document/views/doc/doc-out/action/ButtonActions.vue';
import DocumentOutMoreDetail from '@/apps/document/views/doc/doc-out/detail/DocumentOutMoreDetail.vue';
import { DEFAULT_DIALOG_CONFIG } from '@/common/constants';

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  processId: {
    type: String,
    default: ''
  }
});

const emits = defineEmits(['hide-sidebar']);
const visibleSidebar = ref(props.visible);
watch(() => props.visible, (newVal) => {
  visibleSidebar.value = newVal;
});
const { userDeptRole } = storeToRefs(useDocumentRolesStore());
const docDetailRef = ref<InstanceType<typeof DocumentOutMoreDetail>>();
const route = useRoute();
const router = useRouter();
const docId = ref<string>('');
const process = ref<Process>();
if (props.processId) {
  findOutProcessById(props.processId.toString()).onResult(res => {
    docId.value = res.data?.findOutProcessById?.docId;
    process.value = res.data?.findOutProcessById;
  });
}
provide('afterAction', () => router.back());

const doc = ref<DocOut>();
watch(() => docDetailRef.value?.doc, (value) => {
  doc.value = value as unknown as DocOut;
}, { immediate: true });
provide('doc', doc);
const disableComment = computed(() => docDetailRef.value?.doc?.status == OutgoingDocStatus.DA_BAN_HANH);
provide('disableComment', disableComment);
const hideButtons = computed(() => {
  const docStatusDetail = getDocStatusFromRoute(route.path);
  return getHideButtonsStatus(docStatusDetail).value;
});
provide('hideButtonsName', hideButtons);

</script>

<style scoped>

</style>

