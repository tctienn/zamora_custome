// Từ server
export interface Attachment {
    id?: string;
    objectId: string;
    name: string;
    extension: string;
    path: string;
    size: number;
    type: string;
    fileName: string;
}

export interface PlaningEmployee {
    id?: string;
    planingGroupId?: string;
    employeeId: string;
    employeeName: string;
    gender: string | boolean;
    birthDate: string;
    position: string;
    nation: string;
    jobTitle?: string; // optional, if needed
    dateOfJoiningParty: string;
    specialization: string;
    politicalTheoryLevel: string;
    computerSkill: string;
    languageSkill: string;
    note: string;
    organizationName?: string; // optional, if needed
}

export interface PlaningGroup {
    id?: string;
    planingId?: string;
    groupName: string;
    employees: PlaningEmployee[];
    note?: string;
}

export interface Planing {
    id?: string;
    code: string;
    planingDate: string | Date;
    planingName: string;
    classification: string;
    term: string;
    totalEmployees?: string;
    formNumber: string;
    creator: string;
    status?: string;
    planingGroups: PlaningGroup[];
    attachments?: Attachment[];

    [key: string]: any;
}

export interface AttachmenFiles {
    name: string;
    file: File | any

}

export interface PlanListItemEmployee {
    id?: string;
    employeeId: string;
    employeeName: string;
    gender: string | boolean;
    birthDate: string;
    position: string;
    nation: string;
    dateOfJoiningParty: string; // partyEntryDayOfficial
    specialization: string; // professionalLevel
    politicalTheoryLevel: string; // highestLevel
    computerSkill: string; // informationTechnologyLevel
    languageSkill: string; // foreignLanguageLevel
    jobTitle?: string; // optional, if needed
    note: string;
    employeeType?: string;
    positionName?: string;
    organizationName?: string;
}

export interface PlanListItem {
    planingId?: string;
    id?: string;
    groupName: string;
    employees: PlanListItemEmployee[];
    note: string;
}

export interface PlanningInterface {
    id?: string;
    code: string;
    planingDate: string | Date;
    expireDate: string | Date;
    effectDate: string | Date;
    planingName: string;
    classification: string;
    term: string;
    formNumber: string;
    creator: string;
    planingGroups: PlanListItem[];
    totalEmployees?: string;
    status?: string;
    oldFileIds?: AttachmenFiles[]; // converted from attachments
    attachments?: Attachment[];
    files?: AttachmenFiles[];
}
