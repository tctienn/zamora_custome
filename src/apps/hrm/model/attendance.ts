export type Attendance = {
  id?: string
  employeeId?: string

  shiftName?: string
  shiftCode?: string
  startTime?: string
  endTime?: string
  workingDay?: number
  totalHours?: number

  checkIn?: number
  checkOut?: number
  location?: string
  date?: string
  type?: AttendanceType
  symbol?: string
  note?: string
}

export function groupByEmployeeIdAndDate(attendances: Attendance[]) {
  const grouped: Record<string, Record<string, Attendance[]>> = {};
  attendances.forEach((attendance) => {
    if (attendance.employeeId && attendance.date) {
      if (!grouped[attendance.employeeId]) {
        grouped[attendance.employeeId] = {};
      }
      if (!grouped[attendance.employeeId][attendance.date]) {
        grouped[attendance.employeeId][attendance.date] = [];
      }
      grouped[attendance.employeeId][attendance.date].push(attendance);
    }
  });
  return grouped;
}

export enum AttendanceType {
  MANUAL = 'MANUAL',
  FINGER_PRINT = 'FINGER_PRINT',
  CAMERA = 'CAMERA',
  QR_CODE = 'QR_CODE',
  NFC = 'NFC',
}