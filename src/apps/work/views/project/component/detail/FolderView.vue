<template>
  <div
    class='folder px-3'
    :class='gridResponsiveClasses'>
    <div
      aria-haspopup='true'
      class='border-round file-folder-item flex flex-column grid-item hover:surface-100 prevent-select row-gap-2 surface-card'>
      <div class='cursor-pointer p-3'>
        <div class='align-items-center flex justify-content-between'>
          <div></div>
          <div class='align-items-center flex flex-row gap-1'>
            <div class='align-items-center flex'>

            </div>
            <ButtonIcon
              v-if='!disableModify'
              v-tooltip='t("common.action")'
              class='folder-menu p-0'
              icon='more_vert'
              icon-size='1.5'
              severity='secondary'
              text
              @click='toggleActionMenu({event : $event})'/>
          </div>
        </div>

        <div class='align-items-center flex justify-content-center'>
          <img
            v-if='data.isFolder'
            alt='folder icon'
            class='folder-icon'
            draggable='false'
            :src='getFolderIcon()'
            @click='EventBus.emit("goToFolder", data)'/>
          <img
            v-if='data.extension'
            :alt='data.extension'
            class='file-extension-icon'
            draggable='false'
            :src='getFileIcon(data.extension)'
            @error='handleFileImageError'/>
        </div>

        <div class='text-container'>
          {{ data?.name }}
        </div>
      </div>
    </div>
  </div>
</template>

<script lang='ts' setup>
import { inject, type PropType, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import type { WorkAttachment } from '@/apps/work/model/workAttachment';
import { GRID_RESPONSIVE_CLASSES_MAX_7 } from '@/common/constants';
import EventBus from '@/common/helpers/event-bus';
import { getFileIcon, getFolderIcon, handleFileImageError } from '@/common/helpers/file-utils';

const props = defineProps({
  data: {
    type: Object as PropType<WorkAttachment>,
    required: true
  }
});

const emits = defineEmits(['toggleActionMenu']);

const { t } = useI18n();
const gridResponsiveClasses = inject('grid-responsive-classes', GRID_RESPONSIVE_CLASSES_MAX_7);
const disableModify = inject('disableModifyInProject', ref<string>());

function toggleActionMenu({ event }: { event: Event }) {
  const data = props.data;
  emits('toggleActionMenu', {
    event,
    data
  });
}
</script>

<style lang='scss' scoped>
.folder-menu {
  visibility: hidden;
}

.folder:hover {
  .folder-menu {
    visibility: visible;
  }
}

.text-container {
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  padding-top: 1rem;
  row-gap: 0.5rem;
  word-wrap: break-word;
  word-break: break-all;
  overflow-wrap: break-word;
  overflow: hidden;
  white-space: pre-wrap;
  max-width: 100%;
}
</style>
