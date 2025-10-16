<template>
  <div
    class='p-checkbox'
    :class='{"p-highlight": selectedFileFolders.includes(data)}'>
    <div class='p-hidden-accessible'>
      <input
        v-model='selectedFileFolders'
        type='checkbox'
        :value='data'/>
    </div>
    <div
      class='p-checkbox-box text-white'>
      <AppIcon
        v-if='selectedFileFolders.includes(data)'
        name='check'></AppIcon>
    </div>
  </div>
</template>

<script setup lang='ts'>
import { storeToRefs } from 'pinia';

import { useStorageStore } from '@/apps/ecm/store/storage';

const { selectedFileFolders } = storeToRefs(useStorageStore());
</script>

<script lang='ts'>
import type { PropType } from 'vue';

import type { EcmFile, EcmFolder } from '@/apps/ecm/model/file-folder';

export default {
  name: 'EcmCheckbox',

  props: {
    data: {
      type: Object as PropType<EcmFile | EcmFolder>,
      required: true
    },
  }
};
</script>