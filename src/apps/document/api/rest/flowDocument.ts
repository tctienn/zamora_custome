import type { UserDeptRoleInput } from '@/apps/document/model/doc/doc-in';
import type { NodeInputInterface, StartNode } from '@/apps/work-flow/model/flow';
import { DOCUMENT_URL, FLOW_URL } from '@/common/api/configService';
import baseApi from '@/common/api/rest/baseApi';

const requestMapping = 'api/v1/flow/document';

function getStartNode(flowId: string) {
  return baseApi.get<StartNode>(`${FLOW_URL}/api/v1/flow/document/${flowId}/start-node`);
}

function possibleInstanceNextNodes(flowId: string, nodeId: string, result: string) {
  return baseApi.get<NodeInputInterface[]>(`${FLOW_URL}/${requestMapping}/instance/${flowId}/${nodeId}/next-nodes`, { params: { result: result } });
}

function possibleNextNodes(flowId: string, nodeId: string, result: string) {
  return baseApi.get<NodeInputInterface[]>(`${FLOW_URL}/api/v1/flow/document/${flowId}/${nodeId}/next-nodes`, { params: { result: result } });
}

function currentNode(nodeId: string) {
  return baseApi.get<NodeInputInterface>(`${FLOW_URL}/api/v1/flow/document/${nodeId}/current-node`);
}

function currentInstanceNode(flowInstanceId: string, nodeId: string) {
  return baseApi.get<NodeInputInterface>(`${FLOW_URL}/${requestMapping}/instance/${flowInstanceId}/${nodeId}/current-node`);
}

function flowActionWithFiles(currenProcessId: string, userDeptRole: UserDeptRoleInput, result: string, moreInfo: FormData) {
  return baseApi.postWithFile(`${DOCUMENT_URL}/api/v1/flow/flow-action`, moreInfo, {
    params: {
      currentProcessId: currenProcessId,
      ...userDeptRole,
      result: result,
    }
  });
}

function outFlowActionWithFiles(currenProcessId: string, userDeptRole: UserDeptRoleInput, result: string, data: FormData) {
  return baseApi.postWithFile(`${DOCUMENT_URL}/api/v1/flow/out-flow-action`, data, {
    params: {
      currentProcessId: currenProcessId,
      ...userDeptRole,
      result: result,
    }
  });
}

function submitFlowActionWithFiles(currenProcessId: string, userDeptRole: UserDeptRoleInput, result: string, moreInfo: FormData) {
  return baseApi.postWithFile(`${DOCUMENT_URL}/api/v1/flow/submit-flow-action`, moreInfo, {
    params: {
      currentProcessId: currenProcessId,
      ...userDeptRole,
      result: result,
    }
  });
}

function nextConfigNodes(flowInstanceId: string, nodeId: string, result: string) {
  return baseApi.get<NodeInputInterface[]>(`${FLOW_URL}/api/v1/flow/document/instance/${flowInstanceId}/${nodeId}/next-config-nodes`, { params: { result: result } });
}

export {
  currentInstanceNode,
  currentNode,
  flowActionWithFiles,
  getStartNode,
  nextConfigNodes,
  outFlowActionWithFiles,
  possibleInstanceNextNodes,
  possibleNextNodes,
  submitFlowActionWithFiles
};