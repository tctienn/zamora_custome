export type Evaluate = {
    id?: string;
    evaluateName: string;
    reportOfOrganizationId: string;
    reportOfOrganizationName?: string;
    reportPlace: string;
    monthReport: Date;
    testMode?: boolean;
    createReportDate: Date;
    employees: EmployeeReport[];
    note?: string;
    createdBy?: string;
    createdTime?: string;
}

export type EmployeeReport = {
    employeeId?: string;
    employeeName?: string;
    employeeOrganizationId?: string;
    employeeOrganizationName?: string;
    jobPositionCode?: string;
    jobPositionName?: string;
    selectedEmployee?: boolean;
}

export type EvaluateReportDetail = {
  report: Report;
  employees: EmployeePointDetail[];
}

export type EvaluateReportSummaryDetail = {
  summaryReport: SummaryReportDetail;
  detailReport: {
    employees: any[];
  };
}

export type SendSummary = {
  reportId?: string;
  synthesizerUserId: string;
  content?: string;
}

export type Report = {
    id: string;
    evaluateName: string;
    reportOfOrganizationId: string;
    reportOfOrganizationName: string;
    monthReport: string;
    reportPlace: string;
    evaluateStatus: string;
    createdBy: string;
    createdTime: string;
}

export type SummaryReportDetail = {
    id: string;
    evaluateSummaryReportId: string;
    evaluateSummaryReportName: string;
    flowId: string;
    evaluateSummaryReportCode: string;
    organizationCreateId: string;
    organizationCreateName: string;
    monthReport: Date;
    totalOrganization: number;
    totalEmployee: number;
    createdBy: string;
    evaluateEmployeeSummaryReportStatus: string;
}
export type EmployeePointDetail = {
  employeeId: string;
  employeeName: string;
  jobPositionCode: string;
  jobPositionName: string;
  selectedEmployee?: boolean;
  score: Record<string, number>;
}

export type YearBlock = {
  year: number;
  records: EmployeeReportDep[];
}

export type EmployeeReportDep = {
  id: string;
  evaluateName?: string;
  monthReport?: string;
  evaluateStatus?: string;
  createdBy?: string;
}

export enum StatusEvaluate {
  DRAFT = 'DRAFT',
  SYNTHESIZED = 'SYNTHESIZED',
  WAITING_FOR_SYNTHESIS = 'WAITING_FOR_SYNTHESIS'
}

// Chờ tổng hợp

export type YearBlockSummary = {
  year: number;
  months: MonthBlock[];
}

export type MonthBlock = {
  month: number;
  reports: ReportSummaryReport[];
}

export type ReportSummaryReport = {
  id: string;
  evaluateSummaryReportName?: string;
  evaluateName?: string;
  isRead?: boolean;
  reportOfOrganizationId: string;
  evaluateEmployeeSummaryReportStatus?: string;
  reportOfOrganizationName?: string;
  createdTime: string;
  evaluateStatus?: string;
  createdBy?: string;
}

export type SummaryReport = {
    id?: string;
    organizationCreateId: string;
    flowId: string;
    organizationCreateName: string;
    evaluateSummaryReportId: string;
    evaluateSummaryReportName: string;
    monthReport: Date;
    createReportDate: Date;
    reportPlace: string;
    listOfEvaluateEmployeeReportOnEachOrganization: ListOfEvaluateEmployeeReportOnEachOrganization[];
    note?: string;
    createdBy?: string;
    createdTime?: string;
}

export type ListOfEvaluateEmployeeReportOnEachOrganization = {
    evaluateEmployeeReportId?: string;
    evaluateEmployeeReportName?: string;
    reportOfOrganizationId?: string;
    reportOfOrganizationName?: string;
    aggregateByPositionCode?: string | string[];
    aggregateByPositionName?: string | string[];
    selected?: boolean;
}

export type SignatureSummaryReport = {
    id?: string;
    titleOfSignatoryId?: string;
    titleOfSignatoryName: string;
    evaluateSummaryReportId?: string;
    orderNumber: number;
    isActive?: boolean;
    createdBy?: string;
    createdTime?: string;
}