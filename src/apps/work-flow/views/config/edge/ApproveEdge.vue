<template>
  <BaseEdge
    :id='id'
    :marker-end='markerEnd'
    :path='edgePathParams[0]'
    :style='style'/>
  <EdgeLabelRenderer v-if='!hideLabel'>
    <div
      class='nodrag nopan'
      :style="{
        pointerEvents: 'all',
        position: 'absolute',
        transform: `translate(-50%, -50%) translate(${edgePathParams[1]}px,${edgePathParams[2]}px)`,
      }">
      <div
        ref='menuRef'
        :class='`border-round-xl text-center ${!data["notEditable"]?"cursor-pointer":""} node-label py-0 px-3 relative`'
        :style='{background: backgroundColor, color: calculateColorBasedOnBackgroundColor(backgroundColor)}'
        @click='showOutcomes=!showOutcomes'>
        <p
          class='mb-0 text-center'
          style='padding-bottom: 0.1rem'>{{ mapNameLabelOutcomes[data['outcome']] || t('work-flow.flow.config.selectOutcome') }}</p>
        <div
          v-if="!data['notEditable']"
          class='absolute actions flex flex-column'
          style='top:0; right: -1.2rem'>
          <!--          <AppIcon-->
          <!--            class='cursor-pointer hover:text-blue-600 text-blue-500'-->
          <!--            name='settings'/>-->
          <AppIcon
            class='cursor-pointer hover:text-red-600 text-red-500'
            name='delete'
            @click.stop='deleteEdge'/>
        </div>
      </div>
    </div>
    <div
      v-if="!data['notEditable']"
      :style="{
        pointerEvents: 'all',
        position: 'absolute',
        'z-index':1001,
        transform: `translate(-50%, 0%) translate(${edgePathParams[1]}px,${edgePathParams[2]+20}px)`,
      }">
      <Menu
        v-if='showOutcomes'
        class='border-1 border-round p-0'
        :model='items'>
        <template #item='{item}'>
          <MenuItem
            class='border-round hover:surface-hover'
            :label='item.label'
            :style='`background: ${item.color};
            `'>
          </MenuItem>
        </template>
      </Menu>
    </div>
  </EdgeLabelRenderer>

</template>

<script lang="ts" setup>

import { BaseEdge, EdgeLabelRenderer, type EdgeProps, getSmoothStepPath, useVueFlow } from '@vue-flow/core';
import type { GraphEdge } from '@vue-flow/core/dist/types/edge';
import type { GraphNode } from '@vue-flow/core/dist/types/node';
import { cloneDeep } from 'lodash';
import type Menu from 'primevue/menu';
import type { MenuItemCommandEvent } from 'primevue/menuitem';
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import type { Outcome } from '@/apps/work-flow/model/flow';
import { calculateColorBasedOnBackgroundColor } from '@/common/helpers/color-util';

const props = defineProps<EdgeProps & { storeId?: string, hideLabel?: boolean }>();
const { t } = useI18n();
const {
  updateEdgeData,
  findNode,
  getEdges,
  getConnectedEdges,
  removeEdges,
} = useVueFlow(props.storeId || 'main');
const nodeSource: GraphNode | undefined = findNode(props.source);
const mapNameLabelOutcomes = computed(() => {
  const rs: { [name: string]: string | undefined } = {};
  nodeSource?.data.outcomes.forEach((e: Outcome) => {
    rs[e.name] = e.label;
  });
  return rs;
});
function getOutcomeAutofill(connectedEdges: GraphEdge[]) {
  const edgesFromNode: GraphEdge[] = connectedEdges.filter(e => e.source === nodeSource?.id);
  const remainOutcome: Outcome[] = cloneDeep(nodeSource?.data.outcomes);
  const updatedOutcome = remainOutcome.filter(outcome =>
    !edgesFromNode.some(edge => edge.data.outcome === outcome.name)
  );
  if (updatedOutcome.length === 1) {
    if (!props.data.outcome) {
      updateEdgeData(props.id, { outcome: updatedOutcome[0].name });
    }
  }
}

function getLastUnusedOutcome(connectedEdges: GraphEdge[]) {
  const edgesFromNode: GraphEdge[] = connectedEdges.filter(e => e.source === nodeSource?.id);
  const updatedOutcome = (nodeSource?.data.outcomes as Outcome[]).filter(outcome =>
    !edgesFromNode.some(edge => edge.data.outcome === outcome.name)
  );
  if (updatedOutcome.length === 1) {
    return updatedOutcome[0];
  }
  return undefined;
}
watch(() => getConnectedEdges(nodeSource?.id || ''), (edges) => {
  getOutcomeAutofill(edges);
}, { immediate: true });

const items = computed(() =>
  nodeSource?.data?.outcomes?.map((e: Outcome) => {
    return {
      label: e.label,
      name: e.name,
      command: (event: MenuItemCommandEvent) => {
        handleEdgeChange(event);
        showOutcomes.value = false;
      },
      color: e.color
    };
  })
);
const menuRef = ref<HTMLElement>();
const edgePathParams = computed(() => getSmoothStepPath({ ...props }));

function handleEdgeChange(event: MenuItemCommandEvent) {
  const preValue = props.data?.outcome;
  let edge: GraphEdge | undefined;
  let edgeAutoFill: GraphEdge[] = [];
  const connectedEdges = getConnectedEdges(props.source);
  connectedEdges.forEach(e => {
    if (e.source === props.source && e.data?.outcome === event.item.name) {
      edge = e;
    }
  });

  if (edge) {
    updateEdgeData(edge.id, { outcome: preValue });
  }
  updateEdgeData(props.id, {
    outcome: event.item.name,
    label: event.item.label
  });
  getEdges.value.forEach(e => {
    if (e.source === props.source && !e.data?.outcome) {
      edgeAutoFill.push(e);
    }
  });
  if (edgeAutoFill.length == 1) {
    const outcome = getLastUnusedOutcome(connectedEdges);
    updateEdgeData(edgeAutoFill[0].id, {
      outcome: outcome?.name,
      label: outcome?.label
    });
  }
}

const showOutcomes = ref<boolean>(false);
const backgroundColor = computed<string>(() => {
  const outcome: Outcome = nodeSource?.data?.outcomes.find((e: Outcome) => e.name == props.data.outcome);
  return outcome?.color || '#ffffff';
});

const handleClickOutside = (event: MouseEvent) => {
  if (menuRef.value && !menuRef.value.contains(event.target as Node)) {
    showOutcomes.value = false;
  }
};

function deleteEdge() {
  removeEdges(props.id);
}
onMounted(() => {
  if (menuRef.value) {
    document.addEventListener('click', handleClickOutside);
  }
});

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside);
});

</script>

<script lang="ts">
export default { name: 'ApproveEdge' };

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