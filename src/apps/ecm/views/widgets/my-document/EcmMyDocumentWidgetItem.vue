<template>
  <div
    v-for='document in documents'
    :key='document.id'
    class='align-items-center column-gap-2 flex flex-row'>
    <div class='flex'>
      <img
        :alt='document.extension'
        class='h-3rem w-3rem'
        draggable='false'
        :src='getFileIcon(document.extension)'
        @error='handleFileImageError'/>
    </div>

    <div class='flex flex-column flex-grow-1 overflow-hidden row-gap-1'>
      <router-link
        class='font-bold line-number-1 w-full'
        target='_blank'
        :to='{name: "EcmFileViewer", params: {fileId: document.id}}'>{{ document.name }}
      </router-link>
      <small class='font-italic opacity-80'>
        {{
          `${convertFileSize(document.size)} - ${t("ecm.storage.lastModifiedAt")}: ${convertReadableDate(document.lastModifiedAt)}`
        }}
      </small>
    </div>

    <div class=''>
      <ButtonIcon
        class='p-1'
        icon='more_vert'
        rounded
        text
        @click='emits("toggle-menu", $event, document)'/>
    </div>
  </div>
</template>

<script setup lang="ts">
import { type PropType } from 'vue';
import { useI18n } from 'vue-i18n';

import type { EcmFile } from '@/apps/ecm/model/file-folder';
import { convertFileSize, getFileIcon, handleFileImageError } from '@/common/helpers/file-utils';
import { convertReadableDate } from '@/common/helpers/utils';

defineProps({
  documents: {
    type: Array as PropType<EcmFile[]>,
    default: () => []
  }
});

const emits = defineEmits(['toggle-menu']);

const { t } = useI18n();

</script>

<script lang="ts">
export default { name: 'EcmMyDocumentWidgetItem' };
</script>