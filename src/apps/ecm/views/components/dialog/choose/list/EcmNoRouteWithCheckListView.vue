<template>
  <div
    aria-haspopup='true'
    class='col-12 file-folder-item list-item prevent-select'
    :class='{
      "selected-file-folder": selectedFileFolders.includes(data)
    }'
    @contextmenu='toggleMenu($event, data)'>
    <div class='align-items-center flex p-1'>
      <label
        class='align-items-center cursor-pointer flex w-12'
        @dblclick='emits("goToFolder", data)'>

        <div class='text-center w-3rem'>
          <EcmCheckbox :data='data'/>
        </div>

        <div class='flex flex-grow-1'>
          <div
            class='align-items-center col-8 flex flex-row'>
            <slot></slot>
            <span class='column-gap-2 file-folder-name flex flex-row font-bold line-number-1 ml-3'>
              <slot name='name'></slot>
            </span>
          </div>

          <div class='col-2 text-center word-break-break-word'>
            {{ convertReadableDate(data['lastModifiedAt']) }}
          </div>

          <div class='col-2 text-center'>
            <slot name='size'></slot>
          </div>
        </div>

      </label>
    </div>
  </div>
</template>

<script lang='ts' setup>

import { storeToRefs } from 'pinia';
import type { PropType } from 'vue';

import type { EcmFile, EcmFolder } from '@/apps/ecm/model/file-folder';
import { useStorageStore } from '@/apps/ecm/store/storage';
import EcmCheckbox from '@/apps/ecm/views/components/view/custom/EcmCheckbox.vue';
import EventBus from '@/common/helpers/event-bus';
import { convertReadableDate } from '@/common/helpers/utils';

defineProps({
  data: {
    type: Object as PropType<EcmFolder | EcmFile>,
    required: true
  },
});
const emits = defineEmits(['goToFolder']);
const store = useStorageStore();
const {
  selectedFileFolders,
  folderId
} = storeToRefs(store);

function toggleMenu(event: Event, data: EcmFile | EcmFolder) {
  if (!selectedFileFolders.value.includes(data)) {
    store.selectFileFolder(data);
  }
  EventBus.emit('toggleEcmActionMenu', event);
}

</script>

<style scoped>

</style>
