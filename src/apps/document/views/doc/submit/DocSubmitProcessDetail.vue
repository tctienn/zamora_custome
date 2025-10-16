<template>
  <ButtonActions
    v-if='docId'
    :doc='doc'
    :doc-id='docId'
    :process='process'
    :user-dept-role='userDeptRole'/>
  <DocSubmitMoreDetail
    v-if='docId'
    :id='docId'
    ref='docDetailRef'/>
</template>

<script setup lang="ts">

import { storeToRefs } from 'pinia';
import { computed, provide, type Ref, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { findSubmitProcessById } from '@/apps/document/api/graphql/submit-process';
import { getDocStatusFromRoute, getHideButtonsStatus } from '@/apps/document/helpers/route-extract';
import type { DocSubmit } from '@/apps/document/model/doc/doc-submit-input';
import type { Process } from '@/apps/document/model/process/process';
import { useDocumentRolesStore } from '@/apps/document/store/document-role';
import ButtonActions from '@/apps/document/views/doc/submit/actions/ButtonActions.vue';
import DocSubmitMoreDetail from '@/apps/document/views/doc/submit/DocSubmitMoreDetail.vue';
import type { NodeInputInterface } from '@/apps/work-flow/model/flow';

const { userDeptRole } = storeToRefs(useDocumentRolesStore());
const doc = ref({} as DocSubmit);
const route = useRoute();
const router = useRouter();
const { processId } = route.params;
const docId = ref<string>();
const process = ref<Process>();
if (processId) {
  findSubmitProcessById(processId.toString()).onResult((res) => {
    docId.value = res.data?.findSubmitProcessById?.docSubmitId;
    process.value = res.data?.findSubmitProcessById;
  });
}

const docDetailRef = ref();
watch(() => docDetailRef.value?.doc, (value) => {
  doc.value = value;
}, { immediate: true });
const currentNode = ref<NodeInputInterface>();
provide<Ref<NodeInputInterface | undefined>>('currentNode', currentNode);
provide<Ref<DocSubmit | undefined>>('doc', doc);
const hideButtons = computed(() => {
  const docStatusDetail = getDocStatusFromRoute(route.path);
  return getHideButtonsStatus(docStatusDetail).value;
});
provide('hideButtonsName', hideButtons);
provide('afterAction', () => router.back());
</script>

<script lang="ts">
export default { name: 'DocSubmitProcessDetail' };
</script>

<style scoped>

</style>