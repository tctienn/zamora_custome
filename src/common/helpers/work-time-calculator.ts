import type { WorkProcessInternal } from '@/apps/hrm/model/employee';

/**
 * Calculate total work time based on a list of work processes
 * @param processes List of work processes
 * @returns A string describing the total work time in the format "X years Y months Z days"
 */
export function calculateTotalWorkTime(processes: WorkProcessInternal[] | undefined): string {
  if (!processes || processes.length === 0) {
    return '0 năm 0 tháng 0 ngày';
  }

  const now = new Date();

  const filtered = processes.filter(p => p.isConcurrent === false || p.isConcurrent == null);

  const sorted = [...filtered].sort(
    (a, b) => new Date(a.fromDate).getTime() - new Date(b.fromDate).getTime()
  );

  let totalDays = 0;

  for (let i = 0; i < sorted.length; i++) {
    const from = new Date(sorted[i].fromDate);

    let to: Date;
    if (sorted[i].toDate) {
      to = new Date(sorted[i].toDate);
    } else if (i < sorted.length - 1) {
      to = new Date(sorted[i + 1].fromDate);
    } else {
      to = now;
    }

    if (to > now) {
      to = now;
    }

    const diffMs = to.getTime() - from.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1;

    if (diffDays > 0) {
      totalDays += diffDays;
    }
  }

  const years = Math.floor(totalDays / 365);
  const months = Math.floor(totalDays % 365 / 30);
  const days = totalDays - years * 365 - months * 30;

  return `${years} năm ${months} tháng ${days} ngày`;
}

export function convertMilliseconds(t: (key: string) => string, msString: string) {
  // Parse string to integer
  const ms = parseInt(msString);
  if (isNaN(ms)) {
    return `0 ${t('common.date')}`;
  }

  // Convert to days
  const days = Math.floor(ms / (1000 * 60 * 60 * 24));

  // Calculate years
  const years = Math.floor(days / 365.25);
  const remainingDaysAfterYears = days % 365.25;

  // Calculate months and days
  const months = Math.floor(remainingDaysAfterYears / 30.42);
  const remainingDays = Math.floor(remainingDaysAfterYears % 30.42);
  const result = [];
  if (years > 0) {
    result.push(`${years} ${t('common.year')}`);
  }
  if (months > 0) {
    result.push(`${months} ${t('common.month')}`);
  }
  if (remainingDays > 0) {
    result.push(`${remainingDays} ${t('common.date')}`);
  }
  return result.length > 0 ? result.join(' ') : `0 ${t('common.date')}`;

}
