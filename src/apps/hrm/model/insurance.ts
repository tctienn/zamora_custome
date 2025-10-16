import type { EmployeeAttachment } from '@/apps/hrm/model/attachment';
import type { FileAttachment } from '@/apps/media/model/media';

export enum InsuranceTab {
  GENERAL_INFORMATION = 'GENERAL_INFORMATION',
  TRACKING_TABLE = 'TRACKING_TABLE',
}

export type Insurance = {
  id?: string
  employeeId?: string
  codeBHXH?: string
  bookNumBHXH?: string
  organizationId?: string
  socialInsuranceProvinceCode?: string
  cardNumBHYT?: string
  medicalExaminationCode?: string
  hospitalCode?: string
  socialInsuranceParticipation?: string
  files?: FileAttachment[]
}

export type SearchInsurance = {
  keyword?: string
  organizationId?: string
  dateTo?: any
  dateFrom?: any
  hospitalCode?: string[]
  jobPositions?: string[]
}

interface InsuranceMonth {
  paymentLevel: number;
  paymentBHXH: number;
  paymentBHYT: number;
  paymentBHTN: number;
  paymentBHTNLD: number;
  paymentTotal: number;
  companyPays: number;
  nldpays: number;
  fullName: string;
  id: string;
  year: number;
  month: number;
  insuranceId: string;
  employeeId: string;
}

export interface InsuranceYearData {
  year: number;
  months: InsuranceMonth[];
  paymentTotal: number;
}

export interface InsuranceYear {
  year: number;
  records: InsuranceMonth[];
}