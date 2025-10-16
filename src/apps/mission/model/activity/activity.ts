export const defaultActivity = {} as ActivityInput;

export interface SearchActivityInput {
  keyword?: string | null;
  year?: string | number | null;
  status?: string | null;
  missionId?: string | null;
  hostUnit?: string | null;
  coordinationUnitName?: string | null;
  fromDate?: string | null; 
  isGetListOfGeneralLeaderNeedSubmitActivity?: boolean
  toDate?: string | null;
}

export interface ActivityInterface {
    id: string
    missionId: string
    activityName: string
    expectedTime: string
    endTime: string
    activityCode: string
    budget: number
    hostUnit: string
    description: string
    coordinationUnitName: string
    youHasExtensionDeadlineRequest?: boolean
    youHaveSubmitActivityRequest?: boolean
    createdTime: Date
    createdBy: string,
    status?: string
}

export interface ActivityInput {
  id?: string;
  missionId: string;
  missionName?: string;
  activityName: string;
  expectedTime: string;
  endTime: string;
  activityCode: string;
  budget: string;
  hostUnit: string;
  status?: string;
  description?: string;
  coordinationUnitName?: string;
  coordinationUnitId: string;
  requiredGeneralLeaderIdToSubmit: string;
  relatedParentActivityId?: string;
  relatedParentActivityName?: string;
}

export interface ActivityDetail {
  id: string;
  missionId: string;
  activityCode: string;
  activityName: string;
  budget: string; 
  coordinationUnitName: string;
  description: string;
  endTime: Date;
  expectedTime: Date;
  hostUnit: string;
  status?: string; 
}

export interface ActivityTreeInterface {
    activityId: string,
    activityName: string,
    level: number,
    children: ActivityTreeInterface[]
}