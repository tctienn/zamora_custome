<template>
  <Teleport
    v-if='isMounted && hasSidebar'
    to='#teleport-header-target'>
    <div class='align-items-center flex gap-2'>
      <ButtonActions
        :doc='doc'
        :doc-id='id.toString()'
        :process='process'
        :user-dept-role='userDeptRole'/>
      <ButtonIcon
        class='border-round-sm'
        icon='splitscreen_right'
        :severity='!isCommentVisible ? "secondary" : ""'
        size='small'
        @click='toggleCommentVisibility'/>

    </div>
  </Teleport>
  <div
    v-else
    class='align-items-center flex gap-2'>
    <ButtonActions
      :doc='doc'
      :doc-id='id.toString()'
      :process='process'
      :user-dept-role='userDeptRole'/>
    <Button 
      class='p-button-secondary p-button-sm p-button-text'
      :icon="isCommentVisible ? 'pi pi-comments' : 'pi pi-comment'"
      :label="isCommentVisible ? 'Ẩn ý kiến' : 'Hiển thị ý kiến'"
      @click='toggleCommentVisibility'/>
  </div>

  <DocSubmitMoreDetail
    :id='id.toString()'
    ref='docDetailRef'/>
</template>

<script setup lang="ts">

import { storeToRefs } from 'pinia';
import Button from 'primevue/button';
import { computed, onMounted, provide, type Ref, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { findLastProcessByDocSubmitId } from '@/apps/document/api/graphql/submit-process';
import { getDocStatusFromRoute, getHideButtonsStatus, StatusDocRoute } from '@/apps/document/helpers/route-extract';
import type { DocSubmit } from '@/apps/document/model/doc/doc-submit-input';
import type { Process } from '@/apps/document/model/process/process';
import { useDocumentRolesStore } from '@/apps/document/store/document-role';
import ButtonActions from '@/apps/document/views/doc/submit/actions/ButtonActions.vue';
import DocSubmitMoreDetail from '@/apps/document/views/doc/submit/DocSubmitMoreDetail.vue';
import EventBus from '@/common/helpers/event-bus';

const props = defineProps({
  docId: {
    type: String,
    default: null,
  },
  hasSidebar: {
    type: Boolean,
    default: false,
  }
});
const { userDeptRole } = storeToRefs(useDocumentRolesStore());
const doc = ref({} as DocSubmit);
const route = useRoute();
const router = useRouter();
const id = computed(() => props.docId || route.params.id);
const isMounted = ref(false);
const docDetailRef = ref();
const isCommentVisible = ref(true);

watch(() => docDetailRef.value?.doc, (value) => {
  doc.value = value;
}, { immediate: true });

const hideButton = ref<string[]>(['REJECT']);
provide('hideButtonsName', hideButton);
provide('afterAction', () => router.back());
provide<Ref<DocSubmit | undefined>>('doc', doc);

const process = ref<Process>();
findLastProcessByDocSubmitId(id.value.toString(), userDeptRole.value).onResult(res => {
  process.value = res.data?.findLastProcessByDocSubmitId;
});

const docStatusDetail = computed(() => getDocStatusFromRoute(route.path));
const isSpecialistDraft = computed(() => {
  return docStatusDetail.value == StatusDocRoute.DRAFT;
});
provide('isSpecialistDraft', isSpecialistDraft);

const hideButtons = computed(() => {
  return getHideButtonsStatus(docStatusDetail.value).value;
});
provide('hideButtonsName', hideButtons);

// Hàm toggle hiển thị comment
function toggleCommentVisibility() {
  isCommentVisible.value = !isCommentVisible.value;
  // Gửi sự kiện để DocSubmitMoreDetail biết thay đổi trạng thái
  EventBus.emit('expand-doc-submit-detail');
}

onMounted(() => {
  isMounted.value = true;
});
</script>

<script lang="ts">
export default { name: 'DocSubmitDetail' };
</script>

<style scoped>

</style>