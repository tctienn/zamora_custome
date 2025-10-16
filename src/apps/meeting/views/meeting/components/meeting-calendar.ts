import useMoment from '@/common/helpers/mixins/use-moment';

export function getDatesInWeek(year: number, week: number) {
  const { moment } = useMoment();
  const date = moment().year(year).week(week).startOf('week');
  return Array.from({ length: 7 }, (_, i) => date.clone().add(i, 'day').toDate());
}

export function currentWeekNumber() {
  const now = new Date();
  return weekNumber(now);
}

export function weekNumber(date: Date) {
  const { moment } = useMoment();
  return moment(date).week();
}

export function getDatesInMonth(year: number, month: number) {
  const { moment } = useMoment();
  const m = moment().year(year).month(month);
  return Array.from({ length: m.daysInMonth() }, (_, i) => m.date(i + 1).toDate());
}

export function getDateRange(first: Date | string, last: Date | string) {
  const { moment } = useMoment();
  const fm = moment(first);
  const lm = moment(last);
  if (fm.isSame(lm, 'day')) {
    return [fm.toDate()];
  }
  const range = [];
  let current = fm;
  while (current.isSameOrBefore(lm)) {
    range.push(current.toDate());
    current = current.add(1, 'day');
  }
  return range;
}