export enum LeaveType {
  ANNUAL = 'ANNUAL',
  SICK = 'SICK',
  UNPAID = 'UNPAID',
  MATERNITY = 'MATERNITY',
  PATERNITY = 'PATERNITY',
  BEREAVEMENT = 'BEREAVEMENT',
  PERSONAL = 'PERSONAL',
  MILITARY = 'MILITARY',
}

export type LeaveApplication = {
  id?: string
  title?: string
  employeeId?: string
  leaveType?: LeaveType
  status?: LeaveStatus
  startTime?: string
  endTime?: string
  eFormInstanceId?: string
  eFormCode?: string
  workFlowId?: string
}

export enum LeaveStatus {
  DRAFT = 'DRAFT',
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}