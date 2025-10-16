<template>
  <EcmStorageListView :data='data'>
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
        draggable='false'
        :to='{ query: { folderId: data.id } }'>
        {{ data.name }}
      </router-link>
    </template>
  </EcmStorageListView>
</template>

<script setup lang='ts'>
import type { PropType } from 'vue';

import type { EcmFolder } from '@/apps/ecm/model/file-folder';
import EcmStorageListView from '@/apps/ecm/views/components/view/list/EcmStorageListView.vue';
import { getFolderIcon } from '@/common/helpers/file-utils';

defineProps({
  data: {
    type: Object as PropType<EcmFolder>,
    required: true
  }
});
</script>

<script lang='ts'>
export default { name: 'EcmFolderListView' };
</script>

<style scoped>

</style>