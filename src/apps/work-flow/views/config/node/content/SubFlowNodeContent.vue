<template>
  <div
    :class='`${isError?"hover:border-red-500":"hover:border-blue-500"} border-round-sm flex node-basic surface-0`'>
    <div
      class='bg-orange-400 h-full node-header p-1 text-center'
      style='width: 2.5rem;'>
      <AppIcon
        class='text-white'
        name='subdirectory_arrow_right'
        size='1.5'/>
    </div>
    <div class='align-items-center flex justify-content-center node-content p-2'>
      <input
        v-if='editable && editing'
        class='border-none outline-none w-full'
        :value='label'
        @blur='editing = false'
        @input='updateLabel'
        @keyup.enter='editing = false'>
      <div
        v-else
        class='text-center'
        :class='{"div-editable": editable}'
        @dblclick='editing = true'>
        {{ label }}
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useVueFlow } from '@vue-flow/core';
import type { GraphNode } from '@vue-flow/core/dist/types/node';
import { ref } from 'vue';

const props = defineProps({
  id: {
    type: String,
    default: ''
  },
  label: {
    type: String,
    default: ''
  },
  editable: {
    type: Boolean,
    default: false
  },
  isError: {
    type: Boolean,
    default: false
  },
  storeId: {
    type: String,
    default: 'main'
  }
});
const { updateNodeData, } = useVueFlow(props.storeId);
const editing = ref(false);

function updateLabel(event: Event) {
  const target = event.target as HTMLInputElement;
  updateNodeData(props.id, (node: GraphNode) => ({ label: target.value }), { replace: false });
}
</script>

<style scoped>
.node-basic {
  box-shadow: 0 0 1px rgba(37, 45, 91, .04), 0 0 2px rgba(84, 95, 111, .16);
  .node-header {
    border-radius: 0.15rem 0 0 0.15rem;
  }

  .node-content {
    min-width: 7rem;

    .div-editable {
      cursor: text;
    }
  }

  &:hover {
    .node-header {
      background-color: var(--green-600);
    }
    box-shadow: 0 0 0 1px var(--blue-400), 0 0 10px 0 #d6d7e7;
  }
}
</style>