import type { Edge } from '@vue-flow/core/dist/types/edge';
import type { Node } from '@vue-flow/core/dist/types/node';
import { cloneDeep } from 'lodash';
import { storeToRefs } from 'pinia';
import { v4 as uuidv4 } from 'uuid';
import { computed } from 'vue';

import { useDocumentRolesStore } from '@/apps/document/store/document-role';
import { NodeType } from '@/apps/work-flow/model/flow';
import { mapNotNull } from '@/common/helpers/extension/array.extension';

export type NodeGroup = {
  id: string,
  nodes: Node[],
  isSelected: boolean,
  groupType: 'START' | 'END' | 'BASIC',
  splitNode?: Node,
  joinNode?: Node,
}
export type EdgeGroup = {
  id: string,
  data: Record<string, any> & { label: string },
  targetGroup: string,
  sourceGroup: string,
}

export function defaultEdges(): Edge[] {
  return [
    {
      id: 'EDGE_INIT1',
      source: 'START',
      target: 'BASIC_INIT',
      data: {
        label: 'Chuyển xử lý',
        outcome: 'NEXT'
      },
      type: 'TEMP',
      sourceHandle: 'source-right',
      targetHandle: 'target-left',
    },
    {
      id: 'EDGE_INIT2',
      source: 'BASIC_INIT',
      target: 'END',
      data: {
        label: 'Chuyển xử lý',
        outcome: 'NEXT'
      },
      type: 'TEMP',
      sourceHandle: 'source-right',
      targetHandle: 'target-left',
    },
  ];
}

export function defaultNodes(position: { x: number, y: number } = {
  x: 0,
  y: 0
}): Node[] {
  return [
    {
      id: 'START',
      position,
      data: {
        label: 'Bắt đầu',
        outcomes: [{
          label: 'Chuyển xử lý',
          name: 'NEXT',
          required: [],
        }],
        options: { userDeptRoles: [] },
        notEditable: true
      },
      type: NodeType.START
    },
    {
      id: 'BASIC_INIT',
      position,
      data: {
        label: 'Nốt mới',
        outcomes: [{
          label: 'Chuyển xử lý',
          name: 'NEXT',
          required: [],
        }],
        options: { userDeptRoles: [] },
        notEditable: true
      },
      type: NodeType.BASIC
    },
    {
      id: 'END',
      position,
      data: {
        label: 'Kết thúc',
        options: { userDeptRoles: [] },
        notEditable: true
      },
      type: NodeType.END
    },
  ];
}

export function defaultNodeGroups(position: { x: number, y: number } = {
  x: 0,
  y: 0
}): NodeGroup[] {
  return [
    {
      id: 'GROUP_START',
      isSelected: false,
      nodes: [{
        id: 'START',
        position,
        data: {
          label: 'Bắt đầu',
          outcomes: [{
            label: 'Chuyển xử lý',
            name: 'NEXT',
            required: [],
          }],
          options: { userDeptRoles: [] },
          notEditable: true,
          groupId: 'GROUP_START'
        },
        type: NodeType.START
      }],
      groupType: 'START'
    }, {
      id: 'GROUP_BASIC_INIT',
      isSelected: false,
      nodes: [{
        id: 'BASIC_INIT',
        position,
        data: {
          label: 'Nốt mới',
          outcomes: [{
            label: 'Chuyển xử lý',
            name: 'NEXT',
            required: [],
          }],
          options: { userDeptRoles: [] },
          notEditable: true,
          groupId: 'GROUP_BASIC_INIT'
        },
        type: NodeType.BASIC
      }],
      groupType: 'BASIC'
    }, {
      id: 'GROUP_END',
      isSelected: false,
      nodes: [{
        id: 'END',
        position,
        data: {
          label: 'Kết thúc',
          options: { userDeptRoles: [] },
          notEditable: true,
          groupId: 'GROUP_END'
        },
        type: NodeType.END
      },],
      groupType: 'END'
    },
  ];
}

export function defaultEdgeGroups(): EdgeGroup[] {
  return [
    {
      id: 'EDGE_GROUP_INIT1',
      sourceGroup: 'GROUP_START',
      targetGroup: 'GROUP_BASIC_INIT',
      data: {
        label: 'Chuyển xử lý',
        outcome: 'NEXT'
      }
    }, {
      id: 'EDGE_GROUP_INIT2',
      sourceGroup: 'GROUP_BASIC_INIT',
      targetGroup: 'GROUP_END',
      data: {
        label: 'Chuyển xử lý',
        outcome: 'NEXT'
      }
    }
  ];
}

export function useFlowTempPrototype() {
  const { type } = storeToRefs(useDocumentRolesStore());
  const position = {
    x: 0,
    y: 0
  };
  const nodePrototype = computed(() => ({
    position: position,
    data: {
      label: 'Nốt mới',
      outcomes: [{
        label: 'Chuyển xử lý',
        name: 'APPROVE',
        required: [],
      }],
      orgType: type.value,
      options: { userDeptRoles: [] },
      notEditable: true
    },
    type: NodeType.BASIC
  }));
  const edgePrototype = {
    label: 'Chuyển xử lý',
    data: {
      label: 'Chuyển xử lý',
      outcome: 'NEXT',
      notEditable: true
    },
    sourceHandle: 'source-right',
    targetHandle: 'target-left',
    type: 'TEMP'
  };
  const nodeGroupPrototype = (id?: string) => ({
    isSelected: false,
    nodes: [{
      ...cloneDeep(nodePrototype.value),
      id: 'BASIC_' + uuidv4(),
      position: position,
      groupId: id
    }]
  });
  const edgeGroupPrototype = () => ({
    data: {
      label: 'Chuyển xử lý',
      outcome: 'NEXT'
    },
  });

  function getNodeClone(): Node {
    return cloneDeep({
      ...nodePrototype.value,
      id: 'BASIC_' + uuidv4()
    });
  }

  function getEdgeClone(source: string, target: string, outcome?: string, id?: string, initData: Record<string, any> = {}): Edge {
    return cloneDeep({
      ...edgePrototype,
      data: outcome ? {
        ...edgePrototype.data,
        ...initData,
        outcome: outcome
      } : edgePrototype.data,
      id: id || 'EDGE_' + uuidv4(),
      source: source,
      target: target,
    });
  }

  function getNodeGroupClone(): NodeGroup {
    const groupId = 'GROUP_' + uuidv4();
    return cloneDeep({
      id: groupId,
      ...nodeGroupPrototype(groupId),
      isSelected: false,
      groupType: 'BASIC'
    });
  }

  function getEdgeGroupClone(source: string, target: string): EdgeGroup {
    const id = 'EDGE_GROUP_' + uuidv4();
    return cloneDeep({
      id: id,
      ...edgeGroupPrototype(),
      sourceGroup: source,
      targetGroup: target
    });
  }

  return {
    nodePrototype,
    getNodeClone,
    edgePrototype,
    getEdgeClone,
    nodeGroupPrototype,
    getNodeGroupClone,
    getEdgeGroupClone
  };

}

export function transformNodeEdgeGroupToData(nodeGroups: NodeGroup[], edgeGroups: EdgeGroup[], mergeOption: 'ALL' | 'ANY' = 'ALL'): {
  nodes: Node[],
  edges: Edge[],
} {
  const position = {
    x: 0,
    y: 0
  };
  const { getEdgeClone } = useFlowTempPrototype();

  function createSplitJoinNode(nodeGroup: NodeGroup, mergeOption: 'ALL' | 'ANY' = 'ALL') {
    const size = nodeGroup.nodes.length;
    const splitNode: Node = {
      id: `SPLIT_${nodeGroup.id}`,
      data: { outcomes: Array.from({ length: size }, (_, index) => ({ name: `SPLIT${index}` })) },
      position,
      type: NodeType.SPLIT
    };
    const joinNode: Node = {
      id: `JOIN_${nodeGroup.id}`,
      data: {
        outcomes: [{ name: 'JOIN' }],
        mergeOption: mergeOption
      },
      position,
      type: NodeType.JOIN
    };
    return {
      splitNode: splitNode,
      joinNode: joinNode
    };
  }

  function addSplitJoinNode(nodeGroup: NodeGroup, nodes: Node[]) {
    if (nodeGroup.groupType == 'BASIC') {
      const { splitNode, joinNode } = createSplitJoinNode(nodeGroup, mergeOption);
      nodes.push(splitNode, joinNode);
      nodeGroup.splitNode = splitNode;
      nodeGroup.joinNode = joinNode;
    }
  }

  //Moi moi edge group, noi cac node truoc vao join node, noi join node voi split node tiep theo va noi split node voi cac node tiep theo
  //TH la node truoc la start node, va node sau la end node xu ly rieng
  function addEdge(edgeGroup: EdgeGroup, edges: Edge[]) {
    const basicGroupSource = mapIdNodeGroup[edgeGroup.sourceGroup];
    const basicGroupTarget = mapIdNodeGroup[edgeGroup.targetGroup];

    const createEdge = (sourceId: string, targetId: string, outcomeName: string, edgeId: string, data?: object) => {
      const newEdge = getEdgeClone(sourceId, targetId, outcomeName, edgeId, data);
      edges.push(newEdge);
    };

    const processStartGroup = () => {
      const startNode = basicGroupSource.nodes[0];
      const splitNode = basicGroupTarget.splitNode;

      if (splitNode) {
        createEdge(startNode.id, splitNode.id, edgeGroup.data?.outcome, 'EDGE_' + startNode.id + splitNode.id, edgeGroup.data);
      }
    };

    const processBasicGroupSource = () => {
      const joinNodeSource = basicGroupSource.joinNode;
      if (!joinNodeSource) {
        return;
      }

      basicGroupSource.nodes.forEach((node: Node) => {
        createEdge(node.id, joinNodeSource.id, node.data?.outcomes[0]?.name, 'EDGE_' + node.id + joinNodeSource.id, node.data);
      });

      const splitNodeTarget = basicGroupTarget.splitNode;
      if (splitNodeTarget) {
        createEdge(joinNodeSource.id, splitNodeTarget.id, 'JOIN', 'EDGE_' + joinNodeSource.id + splitNodeTarget.id);
      }
    };

    const processEndGroup = () => {
      const endNode = basicGroupTarget.nodes[0];
      const joinNodeSource = basicGroupSource.joinNode;

      if (joinNodeSource) {
        createEdge(joinNodeSource.id, endNode?.id, 'JOIN', 'EDGE_' + joinNodeSource.id + endNode?.id,);
      }
    };

    const processBasicGroupTarget = () => {
      const splitNode = basicGroupTarget.splitNode;
      if (!splitNode) {
        return;
      }

      basicGroupTarget.nodes.forEach((node: Node, index: number) => {
        createEdge(splitNode.id, node.id, splitNode.data?.outcomes[index]?.name, 'EDGE_' + splitNode.id + node.id);
      });
    };

    switch (basicGroupSource.groupType) {
    case 'START':
      processStartGroup();
      break;
    case 'BASIC':
      processBasicGroupSource();
      break;
    default:
      break;
    }

    switch (basicGroupTarget.groupType) {
    case 'END':
      processEndGroup();
      break;
    case 'BASIC':
      processBasicGroupTarget();
      break;
    default:
      break;
    }
  }

  const nodes: Node[] = [];
  const edges: Edge[] = [];
  const mapIdNodeGroup: Record<string, NodeGroup> = {};

  nodeGroups.forEach(
    group => {
      mapIdNodeGroup[group.id] = group;
      //Voi moi group tao 1 split node va 1 join node
      addSplitJoinNode(group, nodes);
      //Tao canh noi cac nut split join voi nhau, noi nut split,join voi cac nut basic
      group.nodes.forEach(
        node => {
          nodes.push(node);
        }
      );
    }
  );

  edgeGroups.forEach(
    edge => {
      addEdge(edge, edges);
    }
  );

  return {
    nodes: nodes,
    edges: edges
  };
}

export function transformDataToNodeEdgeGroup(nodes: Node[], edges: Edge[]): {
  nodeGroups: NodeGroup[],
  edgeGroups: EdgeGroup[]
} {
  const rs: {
    nodeGroups: NodeGroup[],
    edgeGroups: EdgeGroup[]
  } = {
    nodeGroups: [],
    edgeGroups: []
  };

  function filter<T>(array: T[], predicate: (item: T, index: number) => boolean): T[] {
    return array.filter(predicate);
  }

  //Find possible next nodes, omit split and join node,
  function possibleNextNodes(nodes: Node[], edges: Edge[], nodeId: string): Node[] {
    function nextNodes(nodes: Node[], edges: Edge[], nodeId: string): Node[] {
      const edgesFromNode = filter(edges, e => e.source == nodeId);
      return mapNotNull(edgesFromNode, e => nodes.find(node => node.id == e.target));
    }

    return nextNodes(nodes, edges, nodeId).flatMap(n => {
      if (n.type == NodeType.SPLIT || n.type == NodeType.JOIN) {
        return possibleNextNodes(nodes, edges, n.id);
      } else {
        return [n];
      }
    });
  }

  if (nodes.length === 0 || edges.length === 0) {
    return rs;
  }
  const { getEdgeGroupClone } = useFlowTempPrototype();
  const startNode = filter(nodes, e => e.type === NodeType.START)[0];
  rs.nodeGroups.push({
    id: 'GROUP_START',
    nodes: startNode ? [startNode] : [],
    isSelected: false,
    groupType: 'START'
  });
  let prevGroupId = 'GROUP_START';
  let currentNode = startNode;
  let nextGroupNodes: Node[] = possibleNextNodes(nodes, edges, startNode.id);

  while (!nextGroupNodes.some(n => n.type === NodeType.END)) {
    const currentGroupId = 'GROUP_BASIC' + uuidv4();
    const newNodeGroup: NodeGroup = {
      id: currentGroupId,
      nodes: nextGroupNodes,
      isSelected: false,
      groupType: 'BASIC'
    };

    const splitNodeEdgeIn = filter(edges, e => e.source == currentNode.id)[0];
    const splitNode = filter(nodes, n => n.id === splitNodeEdgeIn.target)[0];
    const nodeIds = nextGroupNodes.map(e => e.id);
    const edgeToJoinNode = filter(edges, e => nodeIds.includes(e.source));
    const joinNode = filter(nodes, n => n.id == edgeToJoinNode[0].target)[0];

    newNodeGroup.splitNode = splitNode;
    newNodeGroup.joinNode = joinNode;

    rs.nodeGroups.push(newNodeGroup);
    rs.edgeGroups.push(getEdgeGroupClone(prevGroupId, currentGroupId));

    prevGroupId = currentGroupId;
    currentNode = joinNode;
    nextGroupNodes = possibleNextNodes(nodes, edges, currentNode.id);
  }
  rs.nodeGroups.push({
    id: 'GROUP_END',
    nodes: nextGroupNodes,
    isSelected: false,
    groupType: 'END'
  });
  rs.edgeGroups.push(getEdgeGroupClone(prevGroupId, 'GROUP_END'));

  return rs;
}
