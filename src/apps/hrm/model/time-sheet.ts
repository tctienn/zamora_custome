export interface TimeSheetDataItem {
    id?: string;
    name: string;
    status?: string;
    month: number;
    year: number;
    organizationId: string;
    createdDate: string | Date | null;
    createdUserId: string;
    createdUsername?: string;
    isDeleted?: boolean;
    employeeIds: string[];
    createdPlace: string;
}

export enum TimeSheetStatus {
    DRAFT = 'DRAFT',
    PENDING = 'PENDING',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED',
}

export interface TimeSheetMonthGroup {
    month: number;
    timesheets: TimeSheetDataItem[];
}

export interface TimeSheetYearGroup {
    year: number;
    months: TimeSheetMonthGroup[];
}

// Structure that matches the exact format returned by groupTimesheetsByYearAndMonth
// This is an array of TimeSheetYearGroup objects
export type TimeSheetGroupByMonth = TimeSheetYearGroup[];

export interface EmployeeDataMinimal {
    id: string;
    code: string;
    fullName: string;
    avatar: string;
    jobTitle: string;
    organizationId: string;
    jobTitleName: string | number;
    organizationName: string;
}

export interface SendTimeSheetFlow {
    id: string;
    status: string;
    reviewer: string;
    note: string;
}