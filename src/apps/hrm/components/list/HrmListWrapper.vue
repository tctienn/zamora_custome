<template>
  <div
    ref='wrapperRef'
    class='ease-linear list-wrapper transition-all transition-duration-300'
    :class='{"hide-tree": isHidden}'>
    <div
      ref='treeRef'
      class='overflow-hidden transition-all'
      :class="{ '-translate-x-full': isHidden }">
      <slot name='tree'/>
    </div>
    <slot name='list'/>
  </div>
</template>

<script lang='ts' setup>
import { ref } from 'vue';

const treeRef = ref<HTMLElement>();
const wrapperRef = ref<HTMLElement>();
const isHidden = ref(false);

function toggleTree() {
  isHidden.value = !isHidden.value;
}

defineExpose({ toggleTree });
</script>

<style scoped>
.list-wrapper {
  display: grid;
  grid-template-columns: 30rem 1fr;
  gap: 0.5rem;
  height: calc(100vh - 9rem);

  &.hide-tree {
    grid-template-columns: 0 1fr;
    gap: 0;
  }
}
</style>
