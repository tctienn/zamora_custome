import moment from 'moment';
import { useI18n } from 'vue-i18n';

import useMoment from '@/common/helpers/mixins/use-moment';
import Diff = moment.unitOfTime.Diff;

export function diffDuration(time: string | Date) {
  const { locale } = useI18n();
  const { moment } = useMoment();
  moment.locale(locale.value);
  const notificationTime = moment(time);
  return notificationTime.fromNow();
}

export function formatDay(time: string | Date) {
  return formaterDateTime(time, 'dddd');
}

export function compareDates(date1: Date, date2: Date): number {
  const d1 = new Date(date1.getFullYear(), date1.getMonth(), date1.getDate());
  const d2 = new Date(date2.getFullYear(), date2.getMonth(), date2.getDate());

  if (d1.getTime() > d2.getTime()) {
    return 1; // date1 is after date2
  } else if (d1.getTime() < d2.getTime()) {
    return -1; // date1 is before date2
  } else {
    return 0; // dates are equal
  }
}

export function formatDateTime(time: string | Date | null | undefined, format = 'DD/MM/YYYY HH:mm') {
  return time ? formaterDateTime(time, format) : '';
}

export function formaterDateTime(time: string | Date, format: string) {
  const { locale } = useI18n();
  const { moment } = useMoment();
  moment.locale(locale.value);
  return moment(time).format(format);
}

export function normalizeDate(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function daysBetweenDates(startDate: string | Date, endDate: string | Date): number {
  const { moment } = useMoment();

  const startMoment = moment(startDate);

  const endMoment = moment(endDate);

  return endMoment.diff(startMoment, 'days');
}

export function diffDurationDates(startDate: string | Date, endDate: string | Date): number {
  const { moment } = useMoment();

  const startMoment = moment(startDate);

  const endMoment = moment(endDate);

  return endMoment.diff(startMoment, 'seconds');
}

export function getDateDifference(
  startDate: string | Date,
  endDate: string | Date,
  unit?: Diff) {
  const { moment } = useMoment();

  const momentDate1 = moment(startDate);
  const momentDate2 = moment(endDate);

  // Calculate the difference in days only once
  if (momentDate2.isValid()) {

    const diffInDays = momentDate2.diff(momentDate1, 'days');
    // Return directly if 'days' is specified or the difference is under 30 days
    if (unit === 'days' || diffInDays < 30) {
      return diffInDays;
    }

    const unitCal: Diff = unit || (diffInDays < 365 ? 'months' : 'years');

    return momentDate2.diff(momentDate1, unitCal);
  }
  return null;
}

export function getYearMonthDiff(start: Date, end: Date): string {
  if (start == null || end == null) {
    return '';
  }
  let startDate = new Date(start);
  let endDate = new Date(end);

  // Đảm bảo startDate <= endDate
  if (startDate > endDate) {
    [startDate, endDate] = [endDate, startDate];
  }

  let years = endDate.getFullYear() - startDate.getFullYear();
  let months = endDate.getMonth() - startDate.getMonth();

  if (months < 0) {
    years--;
    months += 12;
  }

  if (endDate.getDate() < startDate.getDate()) {
    months--;
    if (months < 0) {
      years--;
      months += 12;
    }
  }

  const parts = [];
  if (years > 0) {
    parts.push(`${years} năm`);
  }
  if (months > 0) {
    parts.push(`${months} tháng`);
  }
  if (parts.length === 0) {
    return 'Dưới 1 tháng';
  }

  return parts.join(' ');
}
