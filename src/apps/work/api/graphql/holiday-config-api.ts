import { useLazyQuery, useMutation } from '@vue/apollo-composable';
import gql from 'graphql-tag';

import { WORK_CLIENT_ID } from '@/common/api/graphql/apollo-clients';

function saveHolidayConfig() {
  return useMutation(
    gql`
            mutation saveHolidayConfig($holidayConfigInput: HolidayConfigInput){
                saveHolidayConfig(holidayConfigInput: $holidayConfigInput){
                    id
                    calendar
                    type
                    description
                }
            }
        `,
    {
      clientId: WORK_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}

function deleteHolidayConfig() {
  return useMutation(
    gql`
            mutation deleteHolidayConfig($id: String){
                deleteHolidayConfig(id: $id)
            }
        `,
    {
      clientId: WORK_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}

function findHolidayConfigByType() {
  return useLazyQuery(
    gql`
            query findHolidayConfigByType($type: String){
                findHolidayConfigByType(type: $type){
                    id
                    calendar
                    type
                    description
                }
            }
        `, {},
    {
      clientId: WORK_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}

export { deleteHolidayConfig, findHolidayConfigByType, saveHolidayConfig };

