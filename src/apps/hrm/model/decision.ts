import type { EmployeeAttachment } from '@/apps/hrm/model/attachment';
import type { ContractSalary } from '@/apps/hrm/model/contract';

export interface DecisionInterface {
  id?: string,
  order: number;
  fullName: string;
  noDecision: string;
  effectStartDate: Date;
  effectEndDate: Date;
  decisionDate: Date;
  decisionType: string;
  status: string;
  createDate: Date;
  creator: string;
  decisionMakingLevelId: string,
  decisionMakingLevelName: string, //Cấp ra quyết định
  placeOfDecision: string, //Nơi lập quyết định
  decisionId?: string,
  employeeDecisionId?: string,
  employeeId: string, //Nhân sự
  employeeName: string, //Nhân sự
  reason: string, //Lý do bổ nhiệm
  oldDeptId: string, //Phòng ban cũ
  oldDeptName: string, //Phòng ban cũ
  newDeptId: string, //Phòng ban bổ nhiệm
  newDeptName: string, //Phòng ban bổ nhiệm
  oldTitleId: string, //Vị trí cũ
  oldTitleName: string, //Vị trí cũ
  newTitleId: string, //Vị trí bổ nhiệm
  newTitleName?: string, //Vị trí bổ nhiệm
  oldPositionId: string, //Chức vụ cũ
  oldPositionName: string, //Chức vụ cũ
  newPositionId: string, //Chức vụ bổ nhiệm
  newPositionName: string, //Chức vụ bổ nhiệm
  employeeType: string, //Loại nhân viên
  professionalWork: string, //Công việc chuyên môn
  signerId: string, //Người ký
  signerName: string, //Người ký
  welfareAdjustment: boolean, //Điều chỉnh chế độ
  description: string
  salaryDecision?: ContractSalary
  files?: EmployeeAttachment[]
  createdTime: Date
  createdBy: string
  lastModifiedTime: Date
  lastModifiedBy: string
  employeeDecisions: EmployeeDecision[]
  contract: string | null
  employees: EmployeeDecision[]
  reward?: number
  typePayment?: string,
  form?: string
  title?: string
  template2c?: boolean
  commendationObject?: string
  employeeIds: string[]
  organizationIds: string[]
  employeeCommendations: any[],
  employeeDisciplines: any[],
  typeExecution: string,
  compensationAmount: number
  receptionId: string
  receptionName: string
  dismissalDate: Date
  isConcurrent: boolean
  salaryAdjustmentDecision: SalaryAdjustmentDecision
  otherDecisionType: string
}

export interface SalaryAdjustmentDecision {
  salaryScaleNew: string,
  salaryGradeNew: string,
  salaryCoefficientNew: string,
  salaryLevelNew: string,
  regionalMinimumWageNew: string,
  isAutoUpdateProcessSalary: boolean,
  salaryScaleOld: string,
  salaryGradeOld: string,
  salaryCoefficientOld: string,
  salaryLevelOld: string,
  regionalMinimumWageOld: string,
}

export interface EmployeeDecision {
  id: string,
  decisionId: string,
  employeeId: string,
  oldDeptId: string,
  oldTitleId: string,
  oldPositionId: string,
  newDeptId: string,
  newTitleId: string,
  newPositionId: string
  receptionId: string

  employeeName: string,
  oldDeptName: string,
  oldTitleName: string,
  oldPositionName: string,
  newDeptName: string,
  newTitleName: string,
  newPositionName: string
  receptionName: string
  isConcurrent?: boolean
  professionalWork: string
  employeeType: string
}

export const decisionTypes = [
  {
    name: 'Quyết định tiếp nhận',
    code: 'RECEPTION'
  },
  {
    name: 'Quyết định bổ nhiệm',
    code: 'APPOINTMENT'
  },
  {
    name: 'Quyết định khen thưởng',
    code: 'COMMENDATION'
  },
  {
    name: 'Quyết định kỷ luật lao động',
    code: 'DISCIPLINE'
  },
  {
    name: 'Quyết định điều chuyển',
    code: 'TRANSFER'
  },
  {
    name: 'Quyết định điều chỉnh lương',
    code: 'SALARY_ADJUSTMENT'
  },
  {
    name: 'Quyết định miễn nhiệm',
    code: 'DISMISSAL'
  },
  {
    name: 'Quyết định chấm dứt Hợp đồng lao động',
    code: 'CONTRACT_TERMINATION'
  },
  {
    name: 'Quyết định khác',
    code: 'OTHER'
  },
];

export const decisionStatus = [{
  code: 'DRAFT',
  name: 'Dự thảo'
}, {
  code: 'WAITING_APPROVE',
  name: 'Chờ duyệt'
}, {
  code: 'APPROVED',
  name: 'Đã duyệt'
}, {
  code: 'REJECTED',
  name: 'Từ chối'
}];

export function mapDecisionStatus(code: string) {
  return decisionStatus.find((status: any) => status.code == code);
}

export function mapDecisionType(code: string) {
  return decisionTypes.find((type: any) => type.code == code);
}

export {
  // dropdownAppointmentReasons,
  // dropdownDecisionLevels,
  // dropdownDepartments,
  // dropdownEmployees,
  // dropdownPositions,
  // dropdownSigners,
  // dropdownTitles
};
