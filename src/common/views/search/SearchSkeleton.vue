<template>
  <div
    class='loading-skeleton'>
    <div
      v-for='skeleton in range(5)'
      :key='skeleton'
      class='mb-5'>
      <Skeleton
        class='mb-3'
        :height='randomSkeleton(2, 3, "rem")'
        :width='randomSkeleton(10, 50, "vw")'></Skeleton>
      <Skeleton
        class='mb-2'
        :width='randomSkeleton(10, 50, "rem")'></Skeleton>
      <Skeleton
        class='mb-2'
        :width='randomSkeleton(60, 80, "vw")'></Skeleton>
      <Skeleton
        class='mb-2'
        :height='randomSkeleton(2, 5, "rem")'
        :width='randomSkeleton(60, 80, "vw" )'></Skeleton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { range } from 'lodash';

import { randomSkeleton } from '@/common/helpers/utils';</script>

<script lang="ts">
export default { name: 'SearchSkeleton' };
</script>

<style scoped>

</style>