import type { EmployeeSummaryWithCheckin } from '@/apps/hrm/model/employee';

export type Checkin = {
  id?: string
  employeeId?: string
  detectedImageUrl?: string
  placeName?: string
  timeStamp?: number
}

export type CheckinAndOut = {
  employeeId?: string
  personId?: string
  firstCheckin?: number
  lastCheckout?: number
}

export function transformCheckInCounts(
  checkInCounts: Record<string, CheckinAndOut[]>
): Record<string, EmployeeSummaryWithCheckin> {
  const result: Record<string, EmployeeSummaryWithCheckin> = {};

  for (const date in checkInCounts) {
    const records = checkInCounts[date];
    for (const record of records) {
      const employeeId = record.employeeId;
      if (!employeeId) {
        continue;
      }

      if (!result[employeeId]) {
        result[employeeId] = {
          id: employeeId,
          checkins: {}
        };
      }

      // Update checkin data for the date
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      result[employeeId].checkins![date] = {
        firstCheckin: record.firstCheckin,
        lastCheckout: record.lastCheckout
      };
    }
  }

  return result;
}
