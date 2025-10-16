import type { EmployeeDocumentI } from '@/apps/admin/model/documentConfig';
import { DataType } from '@/apps/admin/model/object/Property';
import type { Attachment } from '@/common/model';

export type Employee = {
  id: string
  fullName: string
  dateOfBirth: Date
  gender: Gender
  ethnic: string
  religion: string
  manager?: string
  personalNumber: string
  issueDate: Date
  placeOfIssue: string
  personalPhone: string
  type?: string
  personalEmail: string
  workEmail: string
  taxNumber?: string
  permanentResident: string
  residence: string
  accountNumber?: string
  bankCode?: string
  insuranceNumber?: string
  recruitmentDate: Date
  permanentRecruitmentDate: Date
  offWorkDate?: Date
  profileImage?: string
  status: string
  maritalStatus: boolean
  department: string
  positionId?: string
  positionName?: string
  userId: string
  employeeExtends: EmployeeExtend[]
  attachments: Attachment[]
  employeeDocuments: EmployeeDocumentI[]
}

export type EmployeeExtend = {
  fieldName: string
  type: DataType
  value: string
}

export interface EmployeesEdge {
  cursor: string,
  node: Employee
}

export enum Gender {
  MALE, FEMALE
}

export const EmployeeFileFields = ['jobDescription', 'curriculumVitae', 'recruitmentDocument'];

export enum ObjectType {
  EMPLOYEE, EMPLOYEE_EXTEND, DOCUMENT
}
