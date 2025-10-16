<template>
  <Sidebar
    v-model:visible='visibleSidebar'
    class='sidebar-detail'
    position='right'
    :show-close-icon='false'
    v-bind='{...DEFAULT_DIALOG_CONFIG,style: {width: "95vw"}}'
    @hide='emits("hide-sidebar")'>
    <ButtonActions
      :doc='doc'
      :doc-id='docId'
      :process='process'
      :user-dept-role='userDeptRole'/>
    <DocumentInMoreDetail
      ref='docDetailRef'
      :doc-id='docId'>
    </DocumentInMoreDetail>
    <Divider class='my-0 py-0'/>
  </Sidebar>
</template>

<script lang='ts' setup>
import { storeToRefs } from 'pinia';
import { computed, onMounted, onUnmounted, provide, type Ref, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { findByProcessId } from '@/apps/document/api/graphql/incoming-process';
import { getDocStatusFromRoute, getHideButtonsStatus } from '@/apps/document/helpers/route-extract';
import type { DocInInput } from '@/apps/document/model/doc/doc-in';
import type { Process } from '@/apps/document/model/process/process';
import { useDocumentRolesStore } from '@/apps/document/store/document-role';
import ButtonActions from '@/apps/document/views/doc/doc-in/action/ButtonActions.vue';
import DocumentInMoreDetail from '@/apps/document/views/doc/doc-in/detail/DocumentInMoreDetail.vue';
import { DEFAULT_DIALOG_CONFIG } from '@/common/constants';
import EventBus from '@/common/helpers/event-bus';

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
const { userDeptRole } = storeToRefs(useDocumentRolesStore());
const route = useRoute();
const router = useRouter();
const docId = ref<string>('');
const process = ref<Process>();
// const { processId } = route.params;
const visibleSidebar = ref(props.visible);
if (props.processId) {
  findByProcessId(props.processId.toString()).onResult(res => {
    docId.value = res.data?.findByProcessId?.docId;
    process.value = res.data?.findByProcessId;
  });
}
const doc = ref<DocInInput>();

const docDetailRef = ref<InstanceType<typeof DocumentInMoreDetail>>();
watch(() => docDetailRef.value?.doc, (value) => {
  doc.value = value;
}, { immediate: true });
const disableComment = computed(() => docDetailRef.value?.doc?.status == 'DA_XL');
provide<Ref<DocInInput | undefined>>('doc', doc);
provide('disableComment', disableComment);
provide('afterAction', () => router.back());
const hideButtons = computed(() => {
  const docStatusDetail = getDocStatusFromRoute(route.path);
  return getHideButtonsStatus(docStatusDetail).value;
});

onMounted(() => {
  EventBus.on('close-sidebar', () => emits('hide-sidebar'));
});

onUnmounted(() => {
  EventBus.off('close-sidebar', () => emits('hide-sidebar'));
});

provide('hideButtonsName', hideButtons);
</script>

<style scoped>
.sidebar-detail .p-sidebar-header {
  display: none
}

.sidebar-detail .p-sidebar-content {
  padding-left: 0;
  padding-right: 0
}
</style>