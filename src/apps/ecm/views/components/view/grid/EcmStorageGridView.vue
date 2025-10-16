<template>
  <div
    class='p-3'
    :class='gridResponsiveClasses'>
    <div
      aria-haspopup='true'
      class='border-round file-folder-item flex flex-column grid-item prevent-select row-gap-2 surface-card'
      :class='{
        "selected-file-folder": selectedFileFolders.includes(data),
        "cut-file-folder": copyPasteAction === CopyPaste.CUT && copyPasteFileFolders.some(f => f.id === data.id)
      }'
      @contextmenu='toggleMenu($event, data)'>
      <label class='cursor-pointer p-3'>
        <div class='align-items-center flex justify-content-between'>
          <EcmCheckbox :data='data'/>
          <div class='align-items-center flex flex-row gap-1'>
            <div class='align-items-center flex'>
              <AppIcon
                v-if='data.isComment && data.treePath.includes("group")'
                name='speaker_notes'
                size='1.25'/>
              <AppIcon
                v-if='data.isImportant && serviceType !== ServiceType.SHARED'
                class='text-yellow-500'
                :fill='true'
                name='star_rate'
                size='1.25'/>
              <ButtonIcon
                v-if='data.isShare'
                icon='group'
                severity='secondary'
                size='1.25'
                text
                @click='showSharedListOfPeopleDialog(data)'/>
            </div>

            <ButtonIcon
              class='p-0'
              icon='more_vert'
              icon-size='1.5'
              severity='secondary'
              text
              @click='toggleMenu($event, data)'/>
          </div>
        </div>

        <div class='align-items-center flex justify-content-center'>
          <slot></slot>
        </div>

        <div class='align-items-center flex flex-column pt-1 row-gap-2'>
          <slot name='name'></slot>
        </div>
      </label>
    </div>
  </div>

  <SharedListOfPeople
    v-if='sharedListOfPeopleVisible'
    :data='data'
    :visible-dialog='sharedListOfPeopleVisible'
    @hide-dialog='hideDialog'/>
</template>

<script setup lang='ts'>

import { storeToRefs } from 'pinia';
import type { PropType } from 'vue';
import { inject, ref } from 'vue';

import { ServiceType } from '@/apps/ecm/api/graphql/file-manage';
import type { EcmFile, EcmFolder } from '@/apps/ecm/model/file-folder';
import { CopyPaste, useStorageStore } from '@/apps/ecm/store/storage';
import SharedListOfPeople from '@/apps/ecm/views/components/share/SharedListOfPeople.vue';
import EcmCheckbox from '@/apps/ecm/views/components/view/custom/EcmCheckbox.vue';
import { GRID_RESPONSIVE_CLASSES_MAX_7 } from '@/common/constants';
import EventBus from '@/common/helpers/event-bus';

defineProps({
  data: {
    type: Object as PropType<EcmFolder | EcmFile>,
    required: true
  }
});

const gridResponsiveClasses = inject('grid-responsive-classes', GRID_RESPONSIVE_CLASSES_MAX_7);

const store = useStorageStore();
const sharedListOfPeopleVisible = ref(false);
const {
  serviceType,
  selectedFileFolders,
  copyPasteFileFolders,
  copyPasteAction
} = storeToRefs(store);

function toggleMenu(event: Event, data: EcmFolder | EcmFile) {
  if (!selectedFileFolders.value.includes(data)) {
    store.selectFileFolder(data);
  }
  EventBus.emit('toggleEcmActionMenu', event);
}

function showSharedListOfPeopleDialog(data: EcmFolder | EcmFile) {
  sharedListOfPeopleVisible.value = true;
}

function hideDialog() {
  sharedListOfPeopleVisible.value = false;
}
</script>

<script lang='ts'>

export default { name: 'EcmStorageGridView' };
</script>
