import moment from 'moment';

import type { User } from '@/common/model/User';

export function sortUsersByBirthday(users: User[]) {
  return [...users].sort((a, b) => {
    const dateA = moment(a.birthDay, 'YYYY-MM-DD').date();
    const dateB = moment(b.birthDay, 'YYYY-MM-DD').date();
    return dateA - dateB;
  });
}
