
import { MISSION_URL } from '@/common/api/configService';
import baseApi from '@/common/api/rest/baseApi';

import type { ActivityTreeInterface } from '../../model/activity/activity';

export function saveActivity(formData: FormData) {
  return baseApi.postWithFile<string>(`${ MISSION_URL }/activity`, formData);
} 

export function getActivityTree() {
  return baseApi.get<ActivityTreeInterface[]>(`${ MISSION_URL }/activity/get-tree`);
}