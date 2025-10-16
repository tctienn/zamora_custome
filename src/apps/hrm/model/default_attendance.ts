import { AttendanceType } from '@/apps/hrm/model/attendance';

export type DefaultAttendance = {
  type: AttendanceType,
  enabled?: boolean
}

export type FingerUser = {
  id: string,
  name?: string,
  enabled?: boolean
}