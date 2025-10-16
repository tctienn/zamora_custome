import { useLazyQuery } from '@vue/apollo-composable';
import gql from 'graphql-tag';

import { ADMIN_CLIENT_ID } from '@/common/api/graphql/apollo-clients';

function getUserBirthdays() {
  const birthdayFields = generateBirthdayFields();
  return useLazyQuery(
    gql`
        query getUserBirthdays {
            getUserBirthdays {
                ${birthdayFields}
            }
        }
    `, {}, {
      clientId: ADMIN_CLIENT_ID,
      fetchPolicy: 'network-only',
    });
}

function generateBirthdayFields() {
  const fields = ['today'];
  for (let i = 0; i < 12; i++) {
    fields.push(`month${i}`);
  }
  return fields.map(field => `
    ${field} {
      id
      fullName
      birthDay
      roles
      avatar
      organizationName
      positionName
    }
  `).join('\n');
}

export { getUserBirthdays };