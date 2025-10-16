import { useVueFlow } from '@vue-flow/core';
import { ref, watch } from 'vue';

import { NodeType } from '@/apps/work-flow/model/flow';

function getId() {
  return getIdByType(state.draggedType.value || 'basic');
}

export function getIdByType(type: string) {
  return `${type}_${Date.now()}`;
}

export function getNodeLabel(type?: string) {
  switch (type) {
  case NodeType.START:
    return 'Start';
  case NodeType.END:
    return 'End';
  case NodeType.BASIC:
    return 'Basic Node';
  case NodeType.SUB_FLOW:
    return 'SubFlow Node';
  case NodeType.SPLIT:
    return 'Split Node';
  case NodeType.JOIN:
    return 'Merge Node';
  default:
    return 'Node';
  }
}

export function getNodeData(type?: string, data?: { [key: string]: object }): { [key: string]: object } {
  if (data) {
    return data;
  }
  switch (type) {
  case NodeType.START:
    return {
      outcomes: [
        {
          'name': 'NEXT',
          'color': '#01bd6f',
          'label': 'Chuyển',
          'required': []
        }
      ]
    };
  case NodeType.END:
    return {};
  case NodeType.BASIC:
    return {
      outcomes: [
        {
          'label': 'Đồng ý',
          'color': '#01bd6f',
          'name': 'APPROVE',
          'required': []
        },
        {
          'label': 'Từ chối',
          'color': '#d53049',
          'name': 'REJECT',
          'required': []
        }
      ]
    };
  case NodeType.SUB_FLOW:
    return {};
  case NodeType.SPLIT:
    return {
      outcomes: [
        {
          'name': 'SPLIT1',
          'color': '#ffffff',
          'label': 'Split1',
          'required': []
        },
        {
          'name': 'SPLIT2',
          'color': '#ffffff',
          'label': 'Split2',
          'required': []
        }
      ]
    };
  case NodeType.JOIN:
    return {
      outcomes: [
        {
          'name': 'JOIN',
          'color': '#ffffff',
          'label': 'Join',
          'required': []
        }
      ]
    };
  default:
    return {};
  }
}

const state = {
  draggedType: ref<string>(),
  isDragOver: ref(false),
  isDragging: ref(false),
  data: ref<{ [key: string]: object } | undefined>()
};

export default function useDragAndDrop() {
  const {
    draggedType,
    isDragOver,
    isDragging,
    data,
  } = state;
  const {
    addNodes,
    screenToFlowCoordinate,
    onNodesInitialized,
    updateNode
  } = useVueFlow('main');

  watch(isDragging, (dragging) => {
    document.body.style.userSelect = dragging ? 'none' : '';
  });

  function onDragStart(event: DragEvent, type: string, nodeData?: { [key: string]: object }) {
    if (event.dataTransfer) {
      event.dataTransfer.setData('application/vueflow', type);
      event.dataTransfer.effectAllowed = 'move';
    }

    draggedType.value = type;
    isDragging.value = true;
    data.value = nodeData;
    document.addEventListener('drop', onDragEnd);
  }

  function onDragOver(event: DragEvent) {
    event.preventDefault();

    if (draggedType.value) {
      isDragOver.value = true;

      if (event.dataTransfer) {
        event.dataTransfer.dropEffect = 'move';
      }
    }
  }

  function onDragLeave() {
    isDragOver.value = false;
  }

  function onDragEnd() {
    isDragging.value = false;
    isDragOver.value = false;
    draggedType.value = undefined;
    document.removeEventListener('drop', onDragEnd);
  }

  function onDrop(event: DragEvent) {
    const position = screenToFlowCoordinate({
      x: event.clientX,
      y: event.clientY,
    });

    const nodeId = getId();

    const newNode = {
      id: nodeId,
      type: draggedType.value,
      position,
      data: {
        label: getNodeLabel(draggedType.value),
        ...getNodeData(draggedType.value, data.value)
      },
    };

    /**
     * Align node position after drop, so it's centered to the mouse
     *
     * We can hook into events even in a callback, and we can remove the event listener after it's been called.
     */
    const { off } = onNodesInitialized(() => {
      updateNode(nodeId, (node) => ({
        position: {
          x: node.position.x - node.dimensions.width / 2,
          y: node.position.y - node.dimensions.height / 2
        },
      }));

      off();
    });

    addNodes(newNode);
  }

  return {
    draggedType,
    isDragOver,
    isDragging,
    onDragStart,
    onDragLeave,
    onDragOver,
    onDrop,
  };
}