export interface IMissionFocusReport{
    name?: string;
    description?: string;
    completedTime?: string;
    hostUnit?: string;
}

export interface IMissionActivityReport{
    activityName ?: string;
    activityDescription?: string;
    completedTime?: string;
    hostUnit?: string;
    coordinationUnitName?: string;
    activityBudget?: string;
    jobName?: string;
    otherInformation?: string;
}

export interface IMissionJobReport{
    jobName?: string;
    implementationUnit?: string;
    implementationPerson?: string;
    jobDesc?: string;
    completedTime?: string;
    jobBudget?: string;
}

export interface ISearchMissionReport{
    status?: string | null;
    coordinationUnitId?: string | null;
    missionType?: string | null
    fromDate?: string | null;
    toDate?: string | null;
    fromBudget?: number;
    toBudget?: number;
    year?: number;
    textSearch?: string;
    missionId?: string;
    activityId?: string;
}