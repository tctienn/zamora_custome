<template>
  <EcmNoRouteWithCheckListView
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
  </EcmNoRouteWithCheckListView>
</template>

<script lang='ts' setup>
import type { PropType } from 'vue';

import type { EcmFolder } from '@/apps/ecm/model/file-folder';
import EcmNoRouteWithCheckListView
  from '@/apps/ecm/views/components/dialog/choose/list/EcmNoRouteWithCheckListView.vue';
import { getFolderIcon } from '@/common/helpers/file-utils';

defineProps({
  data: {
    type: Object as PropType<EcmFolder>,
    required: true
  }
});

const emits = defineEmits(['goToFolder']);
</script>

<style scoped>

</style>
