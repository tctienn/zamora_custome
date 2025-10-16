export type Shift = {
  code?: string
  name?: string
  startTime?: string
  endTime?: string
  status?: boolean
  breakTimeStart?: string
  breakTimeEnd?: string
  totalHours?: number
  minutesConsideredLate?: number
  workingDay?: number
}

export type EmployeeShifts = {
  employeeId?: string
  code?: string
  fullName?: string
  avatar?: string
  totalHours?: number
  workingDay?: number
  shifts?: Shift[]
}