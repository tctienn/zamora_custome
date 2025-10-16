<template>
  <div
    aria-haspopup='true'
    class='col-12 file-folder-item list-item prevent-select'
    :class='{
      "selected-file-folder": selectedFileFolders.includes(data),
      "cut-file-folder": copyPasteAction === CopyPaste.CUT && copyPasteFileFolders.some(f => f.id === data.id)
    }'
    @contextmenu='toggleMenu($event, data)'>
    <div class='align-items-center flex p-1'>
      <label class='align-items-center cursor-pointer flex w-12'>
        <div class='text-center w-3rem'>
          <EcmCheckbox :data='data'/>
        </div>

        <div class='align-items-center file-folder-info flex'>
          <div
            class='align-items-center flex flex-row'
            :class='serviceType===ServiceType.SHARED? "col-6": "col-8"'>
            <slot></slot>
            <span class='column-gap-2 file-folder-name flex flex-row font-bold line-number-1 ml-3'>
              <slot name='name'></slot>
              <AppIcon
                v-if='data.isImportant && serviceType !== ServiceType.SHARED'
                class='text-yellow-500'
                :fill='true'
                name='star_rate'
                size='1.25'/>
              <AppIcon
                v-if='data.isComment && data.treePath.includes("group")'
                class='mt-1'
                name='speaker_notes'
                size='0.95'/>
              <ButtonIcon
                v-if='data.isShare'
                class='overflow-visible'
                icon='group'
                severity='secondary'
                size='1.25'
                text
                @click='showSharedListOfPeopleDialog'/>
            </span>
          </div>

          <div
            v-if='serviceType===ServiceType.SHARED'
            class='align-items-center col-2 flex flex-row'>
            <AppUser
              name-visible
              overlay-visible
              :user-id='data.createdBy'/>
          </div>

          <div class='col-2 text-center word-break-break-word'>
            {{ convertReadableDate(data['lastModifiedAt']) }}
          </div>

          <div class='col-2 text-center'>
            <slot name='size'></slot>
          </div>
        </div>

        <div class='text-center w-3rem'>
          <ButtonIcon
            class='p-0'
            icon='more_vert'
            icon-size='1.5'
            severity='secondary'
            text
            @click='toggleMenu($event, data)'/>
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
import { type PropType, ref } from 'vue';

import { ServiceType } from '@/apps/ecm/api/graphql/file-manage';
import type { EcmFile, EcmFolder } from '@/apps/ecm/model/file-folder';
import { CopyPaste, useStorageStore } from '@/apps/ecm/store/storage';
import SharedListOfPeople from '@/apps/ecm/views/components/share/SharedListOfPeople.vue';
import EcmCheckbox from '@/apps/ecm/views/components/view/custom/EcmCheckbox.vue';
import AppUser from '@/common/components/app/AppUser.vue';
import EventBus from '@/common/helpers/event-bus';
import { convertReadableDate } from '@/common/helpers/utils';

defineProps({
  data: {
    type: Object as PropType<EcmFolder | EcmFile>,
    required: true
  },
  showHeader: {
    type: Boolean,
    default: false
  }
});

const store = useStorageStore();
const sharedListOfPeopleVisible = ref(false);
const {
  selectedFileFolders,
  copyPasteFileFolders,
  copyPasteAction,
  serviceType
} = storeToRefs(store);

function toggleMenu(event: Event, data: EcmFile | EcmFolder) {
  if (!selectedFileFolders.value.includes(data)) {
    store.selectFileFolder(data);
  }
  EventBus.emit('toggleEcmActionMenu', event);
}

function showSharedListOfPeopleDialog() {
  sharedListOfPeopleVisible.value = true;
}

function hideDialog() {
  sharedListOfPeopleVisible.value = false;
}

</script>

<script lang='ts'>

export default { name: 'EcmStorageListView' };
</script>

<style scoped lang='scss'>
</style>
