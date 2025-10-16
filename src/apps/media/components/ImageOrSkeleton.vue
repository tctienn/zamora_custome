<template>
  <Skeleton
    v-if='error'
    :class='getBgClass()'
    :height='height'
    :width='width'/>
  <div
    v-else
    class='overflow-hidden'
    :style='`width: ${width}; height: ${height}`'>
    <img
      :alt='title'
      class='w-full'
      :src='src'
      @error='error = true'/>
  </div>

</template>

<script lang='ts' setup>
import { ref } from 'vue';

import { getBackgroundColorClass } from '@/common/helpers/color-util';

const props = defineProps({
  src: {
    type: String,
    default: ''
  },
  title: {
    type: String,
    default: ''
  },
  width: {
    type: String,
    default: '100%'
  },
  height: {
    type: String,
    default: '100%'
  }
});

const error = ref(false);

function getBgClass() {
  return getBackgroundColorClass(props.title);
}
</script>

<style scoped>

</style>
