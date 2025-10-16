<template>
  <Sidebar
    v-model:visible='visibleSidebar'
    class='sidebar-detail'
    position='right'
    :show-close-icon='false'
    v-bind='{...DEFAULT_DIALOG_CONFIG,style: {width: "75vw"}}'
    @hide='emits("hide-sidebar")'>

    <div class='sidebar-detail-action'>
      <ButtonActions
        :doc='doc'
        :doc-id='id'
        :process='process'
        :user-dept-role='userDeptRole'
        @after-action='action'/>
    </div>

    <DocumentInMoreDetail
      ref='docDetailRef'
      :doc-id='id'>
    </DocumentInMoreDetail>
    <Divider class='my-0 py-0'/>
  </Sidebar>
</template>

<script lang='ts' setup>

import { storeToRefs } from 'pinia';
import { computed, onMounted, onUnmounted, provide, type Ref, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { findLastProcessByDocId } from '@/apps/document/api/graphql/incoming-process';
import { getDocStatusFromRoute, getHideButtonsStatus, StatusDocRoute } from '@/apps/document/helpers/route-extract';
import { type DocInInput, } from '@/apps/document/model/doc/doc-in';
import type { Process } from '@/apps/document/model/process/process';
import { useDocumentRolesStore } from '@/apps/document/store/document-role';
import { DocumentAction } from '@/apps/document/views/doc/doc-in/action/action';
import ButtonActions from '@/apps/document/views/doc/doc-in/action/ButtonActions.vue';
import DocumentInMoreDetail from '@/apps/document/views/doc/doc-in/detail/DocumentInMoreDetail.vue';
import { DEFAULT_DIALOG_CONFIG } from '@/common/constants';
import EventBus from '@/common/helpers/event-bus';

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
const { userDeptRole } = storeToRefs(useDocumentRolesStore());
const route = useRoute();
const doc = ref<DocInInput>();
// const { id } = route.params;
const process = ref<Process>();
const router = useRouter();
const visibleSidebar = ref(props.visible);
provide('afterAction', () => router.back());
findLastProcessByDocId(props.id, userDeptRole.value).onResult(res => {
  process.value = res.data?.findLastProcessByDocId;
});
const docDetailRef = ref<InstanceType<typeof DocumentInMoreDetail>>();
watch(() => docDetailRef.value?.doc, (value) => {
  doc.value = value;
}, { immediate: true });

function action(actionCode: DocumentAction) {
  if (actionCode === DocumentAction.ASK_FOR_OPINION) {
    docDetailRef.value?.commentDocInRef?.loadComments();
  }
}

provide<Ref<DocInInput | undefined>>('doc', doc);
const docStatusDetail = computed(() => getDocStatusFromRoute(route.path));
const isClerkReceive = computed(() => {
  return docStatusDetail.value == StatusDocRoute.RECEIVE;
});
const hideButtons = computed(() => {
  return getHideButtonsStatus(docStatusDetail.value).value;
});
provide('isClerkReceive', isClerkReceive);
provide('hideButtonsName', hideButtons);

const disableComment = computed(() => docDetailRef.value?.doc?.docInBookStatus == 'DA_XL');
provide('disableComment', disableComment);

onMounted(() => {
  EventBus.on('close-sidebar', () => emits('hide-sidebar'));
});

onUnmounted(() => {
  EventBus.off('close-sidebar', () => emits('hide-sidebar'));
});
</script>

<style lang="scss" scoped>
.sidebar-detail-action {
  :deep(.receive-to-know) {
    border-color: var(--surface-400) !important;
    background-color: var(--surface-100) !important;
    &:hover {
      background-color: var(--surface-300) !important;
    }
  }

  :deep(.complete) {
    border-color: var(--surface-400) !important;
    background-color: var(--surface-100) !important;
    &:hover {
      background-color: var(--surface-300) !important;
    }
  }

  :deep(.return-btn) {
    border-color: var(--surface-400) !important;
    background-color: var(--surface-100) !important;
    &:hover {
      background-color: var(--surface-300) !important;
    }
  }
}
:deep(.revoke-btn) {
  border-color:  var(--surface-300) !important;
  background-color: var(--surface-100) !important;
  .custom-icon {
    color: #F87168 !important;
  }
  &:hover {
    border-color: var(--surface-400) !important;
    background-color: var(--surface-300) !important;
  }
}
:deep(.p-datatable.p-component ) {
  padding-left: 1rem;
}
</style>