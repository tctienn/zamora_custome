<template>
  <div
    class='overflow-auto'>
    <div class='align-items-center flex gap-3'>
      <AppIcon
        v-if='!isRoot'
        v-tooltip.top='t("common.back")'
        class='cursor-pointer'
        name='arrow_back'
        size='1.5'
        @click='emits("back-folder")'/>
      <h4 class='m-0'>Folders</h4>
    </div>
    <DataView
      v-if='folders.length'
      class='ecm-full-content mt-1'
      data-key='id'
      layout='grid'
      lazy
      :value='folders'>
      <template #grid='{items}'>
        <div class='grid grid-nogutter p-grid p-nogutter'>
          <FolderView
            v-for='data in items'
            :key='data.id'
            :data='data'
            @toggle-action-menu='toggleActionMenu'/>
        </div>
      </template>
    </DataView>

    <div
      v-if='files.length'
      class='mt-4'>
      <h4 class='m-0'>Tệp</h4>
    </div>
    <DataView
      v-if='files.length'
      class='ecm-full-content mt-1'
      data-key='id'
      layout='grid'
      lazy
      :value='files'>
      <template #grid='{items}'>
        <div class='grid grid-nogutter p-grid p-nogutter'>
          <FolderView
            v-for='data in items'
            :key='data.id'
            :data='data'
            @toggle-action-menu='toggleActionMenu'/>
        </div>
      </template>
    </DataView>
  </div>

</template>

<script setup lang="ts">

import { computed, type PropType } from 'vue';
import { useI18n } from 'vue-i18n';

import type { WorkAttachment } from '@/apps/work/model/workAttachment';
import FolderView from '@/apps/work/views/project/component/detail/FolderView.vue';
import AppIcon from '@/common/components/app/AppIcon.vue';

const props = defineProps({
  workAttachments: {
    type: Array as PropType<WorkAttachment[]>,
    required: true
  },
  isRoot: {
    type: Boolean,
    required: true
  }
});

const emits = defineEmits(['back-folder', 'go-to-folder', 'toggleActionMenu']);
const { t } = useI18n();
const folders = computed(() => {
  return props.workAttachments.filter((attachment) => attachment.isFolder);
});

const files = computed(() => {
  return props.workAttachments.filter((attachment) => !attachment.isFolder);
});

function toggleActionMenu({
  event,
  data
}: { event: Event, data: WorkAttachment }) {
  emits('toggleActionMenu', {
    event,
    data
  });
}

</script>

<style scoped>
.folder-menu {
  visibility: hidden;
}

.folder:hover {
  .folder-menu {
    visibility: visible;
  }
}
</style>