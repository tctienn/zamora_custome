<template>
  <div
    class='p-3'
    :class='GRID_RESPONSIVE_CLASSES_MAX_5'>
    <div
      aria-haspopup='true'
      class='border-round file-folder-item flex flex-column grid-item h-full prevent-select row-gap-2 surface-card'
      :class='{
        "selected-file-folder": selectedFileFolders.includes(data),
        "cut-file-folder": copyPasteAction === CopyPaste.CUT && copyPasteFileFolders.some(f => f.id === data.id)
      }'>
      <label
        class='cursor-pointer p-3'
        @click='selectFileFolder(data)'
        @dblclick='emits("goToFolder", data)'>

        <div class='align-items-center flex justify-content-center'>
          <slot></slot>
        </div>

        <div class='align-items-center flex flex-column pt-1 row-gap-2'>
          <slot name='name'></slot>
        </div>
      </label>
    </div>
  </div>
</template>

<script lang='ts' setup>

import { storeToRefs } from 'pinia';
import type { PropType } from 'vue';

import type { EcmFile, EcmFolder } from '@/apps/ecm/model/file-folder';
import { CopyPaste, useStorageStore } from '@/apps/ecm/store/storage';
import { GRID_RESPONSIVE_CLASSES_MAX_5 } from '@/common/constants';
import EventBus from '@/common/helpers/event-bus';

defineProps({
  data: {
    type: Object as PropType<EcmFolder | EcmFile>,
    required: true
  }
});

const emits = defineEmits(['goToFolder']);

const store = useStorageStore();
const {
  selectedFileFolders,
  copyPasteFileFolders,
  copyPasteAction,
} = storeToRefs(store);

function selectFileFolder(data: EcmFolder | EcmFile) {
  store.selectFileFolder(data);
}

function toggleMenu(event: Event, data: EcmFolder | EcmFile) {
  if (!selectedFileFolders.value.includes(data)) {
    store.selectFileFolder(data);
  }
  EventBus.emit('toggleEcmActionMenu', event);
}
</script>

<style scoped>

</style>
