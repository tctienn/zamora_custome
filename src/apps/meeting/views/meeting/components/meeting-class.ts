import { type MeetingInterface, StatusMeetingEnum, } from '@/apps/meeting/model/meeting';
import useMoment from '@/common/helpers/mixins/use-moment';

const today = new Date();

export function flattenClassName(classes: object) {
  return Object.entries(classes)
    .filter(([, value]) => value)
    .map(([key]) => key)
    .join(' ');
}

export function getClassForMeeting(meeting: MeetingInterface) {
  const { moment } = useMoment();
  return {
    'text-green': moment().isAfter(moment(meeting.endTime)),
    'text-blue':
      moment(meeting.startTime).toDate() > today
      && moment(meeting.startTime).toDate()
      < new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1),
    'text-red line-through': meeting.status === StatusMeetingEnum.CANCEL,
  };
}

export function getClassForDay(date: Date) {
  return {
    'saturdayBgc': date.getDay() === 6,
    'sundayBgc': date.getDay() === 0,
  };
}

export function getBgClassForDay(date: Date) {
  return {
    'saturdayBgc': date.getDay() === 6,
    'sundayBgc': date.getDay() === 0,
  };
}

export function getGender(gender?: number) {
  if (gender === 1) {
    return 'common.male';
  } else if (gender === 0) {
    return 'common.female';
  }
  return '';
}
