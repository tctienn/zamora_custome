<template>
  <Sidebar
    v-model:visible='visibleSidebar'
    :dismissable='false'
    position='right'
    v-bind='{...DEFAULT_DIALOG_CONFIG,style: {width: "75vw"}}'
    :pt="{
      header: 'p-2 border-bottom-1 surface-border',
    }"
    :show-close-icon='false'
    @hide='emits("hide-sidebar")'>
    <template #header>
      <div
        class='border-gray-200 flex justify-content-between w-full'>
        <div class='flex gap-2'>
          <ButtonIcon
            class='border-round-sm flex justify-content-center px-0'
            icon='arrow_back'
            severity='danger'
            size='small'
            style='width: 30px; height: 30px;'
            @click='emits("hide-sidebar")'/>
          <div class='align-content-center font-semibold text-2xl'>Thông tin tiếp nhận văn bản</div>
        </div>
        <div id='teleport-header-target'></div>
      </div>
    </template>

    <DocSubmitDetail
      :doc-id='props.docId'
      :has-sidebar='true'/>
  </Sidebar>
</template>

<script setup lang="ts">
import { ref, watchEffect } from 'vue';

import DocSubmitDetail from '@/apps/document/views/doc/submit/DocSubmitDetail.vue';
import { DEFAULT_DIALOG_CONFIG } from '@/common/constants';
const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  docId: {
    type: String,
    default: null,
  },
});
const emits = defineEmits(['hide-sidebar']);
const visibleSidebar = ref(props.visible);
watchEffect(() => {
  visibleSidebar.value = props.visible;
});
</script>

<style scoped>

</style>