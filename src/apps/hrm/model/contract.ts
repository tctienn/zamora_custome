import type { EmployeeAttachment } from '@/apps/hrm/model/attachment';
import type { Attachment } from '@/apps/hrm/views/planning/model';

export type Contract = {
  id?: string
  employeeId: string
  code: string
  type: string
  organization: string
  organizationName: string
  jobTitle: string
  jobTitleName: string
  position: string
  positionName?: string
  rank?: string
  workType?: string
  workLocation?: string
  workingHoursPerWeek?: number
  workDescription?: string
  managerId?: string
  employeeType?: string
  employeeRank?: string
  effectiveDate: string | Date
  expiryDate?: string | Date
  signedDate?: string | Date
  signatory?: string
  haveInsurance?: boolean
  status?: ContractStatus
  isContractConcurrent: boolean
  professionalWork?: string
  salary?: ContractSalary
  attachments?: EmployeeAttachment[]
  hdTemplate?: string
  files: Attachment[]
  hasContractAppendix?: boolean
}

export type ContractFilter = {
  keyword?: string
  organization?: string
  status?: ContractStatus
  signatory?: string[]
  type?: string[]
  jobTitle?: string[]
  workType?: string[]
  position?: string[]
  haveInsurance?: boolean
  expiryDateTo?: Date | string
  expiryDateFrom?: Date | string
  signedDateTo?: Date | string
  signedDateFrom?: Date | string
}

export type ContractSalary = {
  id?: string
  contractId?: string
  type?: ContractSalaryType
  jobTitle?: string
  rank?: string
  grade?: string
  scale?: string
  coefficient?: number
  coefficientSalary?: string
  regionalMinimum?: number
  agreementSalary?: number
  totalSalary?: number

  bonuses?: SalaryBonus[]
  isAutoUpdateProcessSalary?: boolean
}

export type DecisionSalary = {
  id?: string
  salaryScaleOld?: string
  salaryGradeOld?: string
  salaryCoefficientOld?: string
  salaryLevelOld?: string
  regionalMinimumWageOld?: string
  salaryScaleNew?: string
  salaryGradeNew?: string
  salaryCoefficientNew?: string
  salaryLevelNew?: string
  regionalMinimumWageNew?: string
  isAutoUpdateProcessSalary?: boolean
}

export type SalaryBonus = {
  id?: string
  salaryId?: string
  type?: string
  amount?: number
  name?: string
}

export enum ContractSalaryType {
  COEFFICIENT = 'COEFFICIENT',
  AGREEMENT = 'AGREEMENT',
  PAYROLL = 'PAYROLL',
}

export enum ContractStatus {
  NOT_YET_VALID = 'NOT_YET_VALID',
  VALID = 'VALID',
  EXPIRED = 'EXPIRED',
  LIQUIDATED = 'LIQUIDATED',
}

export enum InvalidEmployeeType {
  CCCD = 'CCCD',
  EMPLOYEECODE = 'EMPLOYEECODE',
}