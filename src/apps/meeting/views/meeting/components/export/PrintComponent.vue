<template>
  <VueToPrint
    :content='getComponentToPrint'
    :document-title='documentTitle'
    :on-after-print='onAfterPrint'
    :on-before-get-content='onBeforeGetContent'
    :on-before-print='onBeforePrint'
    page-style='padding: 2rem'
    remove-after-print>
    <template #trigger>
      <button ref='button'></button>
    </template>
  </VueToPrint>
  <div
    ref='componentRef'
    class='p-2 w-full'>
    <slot name='component'>
    </slot>
  </div>

</template>

<script setup lang="ts">
defineProps({
  onAfterPrint: {
    type: Function,
    default: () => void {}
  },
  onBeforeGetContent: {
    type: Function,
    default: () => void {}
  },
  onBeforePrint: {
    type: Function,
    default: () => void {}
  },
  documentTitle: {
    type: String,
    default: ''
  }

});

import { ref } from 'vue';
import { VueToPrint } from 'vue-to-print';

const button = ref();

function print() {
  button.value.click();
}

const componentRef = ref();
const getComponentToPrint = () => {
  return componentRef.value;
};
defineExpose({ print });

</script>

<script lang="ts">
export default { name: 'PrintComponent' };
</script>

<style scoped>
@media print {
  @page {
    size: landscape;
  }

  :deep(tbody tr) {
    page-break-inside: avoid; /* Prevent page break inside rows */
  }

  :deep(thead) {
    display: table-header-group;
  }
}
</style>