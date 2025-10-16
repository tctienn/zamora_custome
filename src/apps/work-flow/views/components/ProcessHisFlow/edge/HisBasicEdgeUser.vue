<template>
  <BaseEdge
    :id='id'
    :marker-end='markerEnd'
    :path='edgePathParams[0]'
    :style='props.data.style'/>
  <EdgeLabelRenderer>
    <div
      :style="{
        pointerEvents: 'all',
        position: 'absolute',
        transform: `translate(-50%, -50%) translate(${edgePathParams[1]}px,${edgePathParams[2]}px)`,
      }">
      <div
        class='border-1 border-round cursor-pointer p-1 surface-border'
        :class="{'bg-gray-800':layoutConfig.colorScheme.value==='dark',
                 'bg-white':layoutConfig.colorScheme.value==='light'}"
        :style='{ color: calculateColorBasedOnBackgroundColor(backgroundColor)}'>
        {{ data?.label || 'Chuyển xử lý' }}
      </div>
    </div>
  </EdgeLabelRenderer>

</template>

<script lang="ts" setup>

import { BaseEdge, EdgeLabelRenderer, getSmoothStepPath, Position } from '@vue-flow/core';
import type { ElementData } from '@vue-flow/core/dist/types/flow';
import { computed, type PropType } from 'vue';

import { useLayout } from '@/common/components/app/composables/layout';
import { calculateColorBasedOnBackgroundColor } from '@/common/helpers/color-util';

const props = defineProps({
  id: {
    type: String,
    required: true,
  },
  data: {
    type: Object as PropType<ElementData>,
    required: true
  },
  source: {
    type: String,
    required: true,
  },
  target: {
    type: String,
    required: true,
  },
  sourceX: {
    type: Number,
    required: true,
  },
  sourceY: {
    type: Number,
    required: true,
  },
  targetX: {
    type: Number,
    required: true,
  },
  targetY: {
    type: Number,
    required: true,
  },
  sourcePosition: {
    type: String as PropType<Position>,
    default: Position.Right,
  },
  targetPosition: {
    type: String as PropType<Position>,
    default: Position.Left,
  },
  markerEnd: {
    type: String,
    default: '',
  }
});
const { layoutConfig } = useLayout();
const edgePathParams = computed(() => getSmoothStepPath({ ...props }));
const backgroundColor = computed<string>(() => {
  return layoutConfig.colorScheme.value == 'light' ? '#ffffff' : '#000000';
});
</script>

<style lang="scss" scoped>
.node-label {
  .actions {
    opacity: 0;

  }

  &:hover {
    .actions {
      opacity: 1;
    }
  }
}
</style>