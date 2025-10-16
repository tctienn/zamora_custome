<template>
  <div
    class='align-items-center border-round-sm flex hover:text-red-600 node-basic surface-0 w-fit'>
    <div
      class='h-full node-header p-1 text-center'
      style='width: 2.5rem;'>
      <AppIcon
        class='text-white'
        name='stop_circle'
        size='1.5'/>
    </div>
    <div class='node-content p-2'>
      <input
        v-if='editable && editing'
        class='bg-transparent border-none outline-none text-red-500'
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
  box-shadow: 0 0 1px rgba(37, 45, 91, .04), 0 0 1px rgba(84, 95, 111, .16);
  .node-header {
    background-color: var(--red-400);
    border-radius: 0.15rem 0 0 0.15rem;
  }

  .node-content {
    .div-editable {
      cursor: text;
    }
  }

  &:hover {
    .node-header {
      background-color: var(--red-600);
    }
    box-shadow: 0 0 0 1px var(--blue-400), 0 0 10px 0 #d6d7e7;
  }
}

</style>