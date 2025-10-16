<template>
  <Panel
    v-if='!isAllEmpty(result)'
    class='mb-5'
    :header='header'
    :toggleable='true'>
    <ResultNameHeader/>
    <ResultNameItem
      v-for='(items, index) in result'
      :key='index'
      :file-folders='items'
      :search-type='searchType'/>
  </Panel>
</template>

<script setup lang="ts">
import { type PropType } from 'vue';

import type { EcmFile, EcmFolder } from '@/apps/ecm/model/file-folder';
import { isAllEmpty } from '@/common/helpers/file-utils';
import ResultNameHeader from '@/common/views/search/components/ResultNameHeader.vue';
import ResultNameItem from '@/common/views/search/components/ResultNameItem.vue';

defineProps({
  header: {
    type: String,
    default: '',
  },
  result: {
    type: Array as PropType<Array<EcmFile[] | EcmFolder[]>>,
    default: () => []
  },
  searchType: {
    type: String,
    default: ''
  }
});
</script>

<script lang="ts">
export default { name: 'ResultNamePanel' };
</script>