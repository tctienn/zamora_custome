import { useLazyQuery, useMutation } from '@vue/apollo-composable';
import gql from 'graphql-tag';

import { WORK_CLIENT_ID } from '@/common/api/graphql/apollo-clients';

function findScheduleByShiftTypeGraphql() {
  return useLazyQuery(
    gql`
            query findScheduleByShiftType($shiftType: String){
                findScheduleByShiftType(shiftType: $shiftType){
                    id
                    day
                    shiftType
                    shift
                    totalLabour
                }
            }
        `, {},
    {
      clientId: WORK_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}

function saveScheduleGraphql() {
  return useMutation(
    gql`
            mutation saveSchedule($scheduleInput: ScheduleInput){
                saveSchedule(scheduleInput: $scheduleInput){
                    id
                    day
                    shiftType
                    shift
                    totalLabour
                }
            }
        `,
    {
      clientId: WORK_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}

export { findScheduleByShiftTypeGraphql, saveScheduleGraphql };

