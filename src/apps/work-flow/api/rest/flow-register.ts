import type { FlowType, ObjectInfo } from '@/apps/work-flow/model/process/flow-type';
import { FLOW_URL } from '@/common/api/configService';
import baseApi from '@/common/api/rest/baseApi';

function flowTypes() {
  return baseApi.get<FlowType[]>(`${ FLOW_URL }/register`);
}

function flowType(type: string) {
  return baseApi.get<FlowType>(`${FLOW_URL}/register/${type}`);
}

function listObjectInfos(type: string) {
  return baseApi.get<ObjectInfo[]>(`${ FLOW_URL }/object-info/list?type=${ type }`);
}

export {
  flowType,
  flowTypes,
  listObjectInfos
};