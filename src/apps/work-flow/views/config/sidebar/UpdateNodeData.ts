import type { GraphNode } from '@vue-flow/core/dist/types/node';

export function updateNodeDataByField(node: GraphNode | undefined, field: string, value: any | ((node: GraphNode) => any), arrayField?: string, index?: number) {
  if (node) {
    if (arrayField !== undefined && index !== undefined) {
      const array = [...node.data[field]];
      array[index] = {
        ...array[index],
        [arrayField]: typeof value === 'function' ? value(node) : value,
      };
      node.data = {
        ...node.data,
        [field]: array
      };
      return array;
    } else {
      node.data = {
        ...node.data,
        [field]: typeof value === 'function' ? value(node) : value,
      };
      return value;
    }
  }
  return undefined;
}
