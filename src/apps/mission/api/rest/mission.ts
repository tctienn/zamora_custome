import { MISSION_URL } from '@/common/api/configService';
import baseApi from '@/common/api/rest/baseApi';

import type { MissionInterface, MissionTreeInterface } from '../../model/mission/mission';

export function createMission(formData: FormData) {
  return baseApi.postWithFile<MissionInterface>(`${ MISSION_URL }/mission`, formData);
}

export function updateMission(formData: FormData, id:string) {
  return baseApi.putWithFile<MissionInterface>(`${ MISSION_URL }/mission/${id}`, formData);
}

export function getMissionTree() {
  return baseApi.get<MissionTreeInterface[]>(`${ MISSION_URL }/mission/get-tree`);
}