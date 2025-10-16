import { RepeatMeeting } from '@/apps/meeting/model/meeting';

export function createCron(repeatType: RepeatMeeting, value: string): string{
  switch (repeatType) {
  case RepeatMeeting.NO_REPEAT:
    return '';
  case RepeatMeeting.DAILY_REPEAT:
    return '0 0 0 * * *';
  case RepeatMeeting.WEEKLY_REPEAT:
    return `0 0 0 * * ${value}`;
  case RepeatMeeting.MONTHLY_REPEAT:
    return `0 0 0 ${value} * *`;
  case RepeatMeeting.YEARLY_REPEAT:
    return `0 0 0 * * ${value}`;
  }
}
export function cronToText(cronExpression: string): string {
  const parts = cronExpression.split(' ');

  const second = parts[0];
  const minute = parts[1];
  const hour = parts[2];
  const dayOfMonth = parts[3];
  const month = parts[4];
  const dayOfWeek = parts[5];

  const secondText = convertFieldToText(second, 'second');
  const minuteText = convertFieldToText(minute, 'minute');
  const hourText = convertFieldToText(hour, 'hour');
  const dayOfMonthText = convertFieldToText(dayOfMonth, 'day of the month');
  const monthText = convertFieldToText(month, 'month');
  const dayOfWeekText = convertFieldToText(dayOfWeek, 'day of the week');

  return `At ${minuteText} past ${hourText}, on the ${dayOfMonthText} of ${monthText}, ${dayOfWeekText}.`;
}

function convertFieldToText(field: string, fieldName: string): string {
  const values = field.split(',');
  const texts = values.map(value => convertValueToText(value));
  return `${fieldName}s: ${texts.join(', ')}`;
}

function convertValueToText(value: string): string {
  if (value.includes('/')) {
    const parts = value.split('/');
    return `every ${parts[1]} ${parts[0]}`;
  } else if (value.includes('-')) {
    const range = value.split('-');
    return `from ${range[0]} to ${range[1]}`;
  } else if (value === '*') {
    return 'every';
  } else {
    return value;
  }
}

