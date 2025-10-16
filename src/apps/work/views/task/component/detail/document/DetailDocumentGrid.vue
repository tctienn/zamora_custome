<template>
  <DataView
    :data-key="'id'"
    layout='grid'
    lazy
    :value='taskAttachments'>

    <template #grid='slotProps'>
      <div class='grid grid-nogutter p-grid p-nogutter'>
        <div
          v-for='item in slotProps.items'
          :key='item?.id'
          class='col-12 md:col-4 sm:col-6 xl:col-6'
          :class='GRID_RESPONSIVE_CLASSES_MAX_7'>
          <div
            aria-haspopup='true'
            class='border-round file-folder-item flex flex-column folder grid-item hover:surface-100 prevent-select row-gap-2 surface-card'>
            <div class='cursor-pointer p-2'>
              <div class='align-items-center flex justify-content-end'>
                <div class='align-items-center flex flex-row gap-1'>
                  <ButtonIcon
                    v-if='!disableModify'
                    v-tooltip='t("common.action")'
                    class='folder-menu p-0'
                    icon='more_vert'
                    icon-size='1.5'
                    severity='secondary'
                    text
                    @click='toggleActionMenu({ event: $event, data: item })'/>
                </div>
              </div>

              <div class='align-items-center flex justify-content-center'>
                <img
                  v-if='item.extension'
                  :alt='item.extension'
                  class='h-5rem'
                  draggable='false'
                  :src='getFileIcon(item.extension)'
                  @error='handleFileImageError'/>
              </div>

              <div class='text-container'>
                {{ item?.name }}
              </div>
            </div>
          </div>

        </div>
      </div>
    </template>
  </DataView>
</template>

<script lang='ts' setup>
import DataView from 'primevue/dataview';
import { inject, type PropType, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import type { TaskAttachment } from '@/apps/work/model/taskAttachment';
import { GRID_RESPONSIVE_CLASSES_MAX_7 } from '@/common/constants';
import { getFileIcon, handleFileImageError } from '@/common/helpers/file-utils';

const props = defineProps({
  taskAttachments: {
    type: Array as PropType<TaskAttachment[]>,
    default: () => []
  }
});
const emits = defineEmits<{
  (e: 'toggleActionMenu', payload: { event: Event, data: TaskAttachment }): void
  (e: 'viewFile', selectedRow: TaskAttachment): void
}>();
const disableModify = inject('disableModify', ref<boolean>());
const selectedRow = defineModel<TaskAttachment>('selection', { default: undefined });
const { t } = useI18n();

function toggleActionMenu(payload: {
  event: Event;
  data: TaskAttachment;
}) {
  emits('toggleActionMenu', payload);
}
</script>

<style scoped>
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

.folder-menu {
  visibility: hidden;
}

.folder:hover {
  .folder-menu {
    visibility: visible;
  }
}
</style>