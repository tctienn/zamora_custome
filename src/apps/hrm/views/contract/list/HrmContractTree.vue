<template>
  <HrmTree
    ref='treeRef'
    class='border-none h-full'
    @update-count='updateCount'/>
</template>

<script lang='ts' setup>

import { ref } from 'vue';

import { countContracts } from '@/apps/hrm/api/graphql/contract';
import HrmTree from '@/apps/hrm/components/tree/HrmTree.vue';

const treeRef = ref<InstanceType<typeof HrmTree>>();

function updateCount(id: string) {
  countContracts({ organization: id })
    .onResult(res => {
      if (res.loading) {
        return;
      }
      treeRef.value?.updateModelCount(id, res.data.countContracts);
    });
}
</script>

<style scoped>

</style>
