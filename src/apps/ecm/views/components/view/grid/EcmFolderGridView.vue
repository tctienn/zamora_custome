<template>
  <EcmStorageGridView :data='data'>
    <img
      alt='folder icon'
      class='folder-icon'
      draggable='false'
      :src='getFolderIcon()'/>
    <template #name>
      <div v-if='data.isDeleted'>{{ data.name }}</div>
      <router-link
        v-else
        v-tooltip.bottom='data.name'
        class='file-folder-name font-bold line-number-1 text-center w-full'
        draggable='false'
        :to='{ query: { folderId: data.id } }'>{{ data['name'] }}
      </router-link>
    </template>
  </EcmStorageGridView>

</template>

<script setup lang='ts'>

import type { PropType } from 'vue';

import type { EcmFolder } from '@/apps/ecm/model/file-folder';
import EcmStorageGridView from '@/apps/ecm/views/components/view/grid/EcmStorageGridView.vue';
import { getFolderIcon } from '@/common/helpers/file-utils';

defineProps({
  data: {
    type: Object as PropType<EcmFolder>,
    required: true
  },
});

</script>

<script lang='ts'>

export default { name: 'EcmFolderGridView', };
</script>

<style scoped>

</style>