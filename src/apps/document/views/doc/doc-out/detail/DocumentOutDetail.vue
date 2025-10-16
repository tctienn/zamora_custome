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
      <ButtonActions
        :doc='doc as unknown as DocOut'
        :doc-id='id.toString()'
        :process='process'
        :user-dept-role='userDeptRole'
        @close-sidebar="emits('hide-sidebar')"/>
    </div>

    <DocumentOutMoreDetail
      ref='docDetailRef'
      :doc-id='id.toString()'/>
  </Sidebar>

</template>

<script lang='ts' setup>
import { storeToRefs } from 'pinia';
import { computed, provide, type Ref, ref, watch, watchEffect } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { findLastOutProcessByDocId } from '@/apps/document/api/graphql/outgoing-process';
import { getDocStatusFromRoute, getHideButtonsStatus, StatusDocRoute } from '@/apps/document/helpers/route-extract';
import type { DocOut, DocOutInput } from '@/apps/document/model/doc/doc-out';
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
  id: {
    type: String,
    default: ''
  }
});
const emits = defineEmits(['hide-sidebar']);
const { userDeptRole } = storeToRefs(useDocumentRolesStore());

const route = useRoute();
const router = useRouter();
const doc = ref<DocOutInput>();
const process = ref<Process>();
const visibleSidebar = ref(props.visible);

watchEffect(() => {
  visibleSidebar.value = props.visible;
});

findLastOutProcessByDocId(props.id.toString(), userDeptRole.value).onResult(res => {
  process.value = res.data?.findLastOutProcessByDocId;
});
const docDetailRef = ref<InstanceType<typeof DocumentOutMoreDetail>>();
watch(() => docDetailRef.value?.doc, (value) => {
  doc.value = value;
}, { immediate: true });

provide<Ref<DocOutInput | undefined>>('doc', doc);
provide('afterAction', () => router.back());
const docStatusDetail = computed(() => getDocStatusFromRoute(route.path));
const isSpecialistDraft = computed(() => {
  return docStatusDetail.value == StatusDocRoute.DRAFT;
});
provide('isSpecialistDraft', isSpecialistDraft);

const hideButtons = computed(() => {
  return getHideButtonsStatus(docStatusDetail.value).value;
});
provide('hideButtonsName', hideButtons);
</script>

<style scoped>

</style>