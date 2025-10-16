import { useVueFlow } from '@vue-flow/core';
import { storeToRefs } from 'pinia';
import { onBeforeUnmount, type Ref, watch } from 'vue';

import { useNodeProblemsStore } from '@/apps/work-flow/store/node-problems';

export interface NodeError {
    code: string;
    message: string;
}

export function getEdgesOutgoingFromNode(nodeId: string, storeId: string) {
  const { getConnectedEdges } = useVueFlow(storeId);
  const connectedEdges = getConnectedEdges(nodeId);
  return connectedEdges.filter(e => e.source === nodeId);
}

export function getEdgesIncomingToNode(nodeId: string, storeId: string) {
  const { getConnectedEdges } = useVueFlow(storeId);
  const connectedEdges = getConnectedEdges(nodeId);
  return connectedEdges.filter(e => e.target === nodeId);
}

export function useManageNodeProblems(id: string, error: Ref<NodeError[]>) {
  const { problems } = storeToRefs(useNodeProblemsStore());

  watch(() => error.value, (newErrors) => {
    if (newErrors.length > 0) {
      problems.value[id] = newErrors;
    } else {
      delete problems.value[id];
    }
  }, { immediate: true });

  onBeforeUnmount(() => {
    delete problems.value[id];
  });
}

