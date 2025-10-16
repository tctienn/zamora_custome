<template>
  <Splitter
    ref='wrapperRef'
    :gutter-size='8'
    style='height: calc(100vh - 9rem)'>
    <!-- Sidebar -->
    <SplitterPanel
      v-show='!isHidden'
      class='sidebar-panel'
      :size='25'>
      <slot name='tree' />
    </SplitterPanel>
    <SplitterPanel :size='isHidden ? 100 : 75'>
      <slot name='list' />
    </SplitterPanel>
  </Splitter>
</template>

<script lang="ts" setup>
import Splitter from 'primevue/splitter';
import SplitterPanel from 'primevue/splitterpanel';
import { ref } from 'vue';

const isHidden = ref(false);

function toggleTree() {
  isHidden.value = !isHidden.value;
}

defineExpose({ toggleTree });
</script>

<style scoped>
.sidebar-panel {
  max-width: 50rem;
  min-width: 0;
  background: var(--surface-overlay);
}

:deep(.p-splitter-gutter){
  background: #edf2f7;
}
</style>
