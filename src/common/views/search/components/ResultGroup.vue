<template>
  <Panel
    v-if='!isAllEmpty(result)'
    class='mb-5'
    :header='header'
    :toggleable='true'>
    <ResultNameHeaderForGroup/>
    <ResultNameItemForGroup
      v-for='(items, index) in result'
      :key='index'
      :datas='items'/>
  </Panel>
</template>

<script setup lang="ts">
import { type PropType } from 'vue';

import type { UserGroupInterface } from '@/apps/admin/model/userGroup';
import { isAllEmpty } from '@/common/helpers/file-utils';
import ResultNameHeaderForGroup from '@/common/views/search/components/ResultNameHeaderForGroup.vue';
import ResultNameItemForGroup from '@/common/views/search/components/ResultNameItemForGroup.vue';

defineProps({
  header: {
    type: String,
    default: '',
  },
  result: {
    type: Array as PropType<Array<UserGroupInterface[]>>,
    default: () => []
  },
});

</script>

<script lang="ts">
export default { name: 'ResultGroup' };
</script>