<template>
  <EcmNoRouteGridView
    :data='data'
    @go-to-folder='emits("goToFolder", $event)'>
    <img
      alt='folder icon'
      class='folder-icon'
      draggable='false'
      :src='getFolderIcon()'/>
    <template #name>
      {{ data.name }}
    </template>
  </EcmNoRouteGridView>
</template>

<script lang='ts' setup>

import type { PropType } from 'vue';

import type { EcmFile, EcmFolder } from '@/apps/ecm/model/file-folder';
import EcmNoRouteGridView from '@/apps/ecm/views/components/dialog/save/grid/EcmNoRouteGridView.vue';
import { getFolderIcon } from '@/common/helpers/file-utils';

defineProps({
  data: {
    type: Object as PropType<EcmFolder | EcmFile>,
    required: true
  },
});

const emits = defineEmits(['goToFolder']);
</script>

<style scoped>

</style>
