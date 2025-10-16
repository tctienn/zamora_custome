import { useLazyQuery, useMutation } from '@vue/apollo-composable';
import gql from 'graphql-tag';

import { WORK_CLIENT_ID } from '@/common/api/graphql/apollo-clients';

function findByShiftTypeGraphql() {
  return useLazyQuery(
    gql`
            query findByShiftType($shiftType: String){
                findByShiftType(shiftType: $shiftType){
                    id
                    shiftName
                    shiftType
                    start
                    end
                    labour
                }
            }
        `, {},
    {
      clientId: WORK_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}

function saveShiftGraphql() {
  return useMutation(
    gql`
            mutation saveShift($shiftInput: ShiftInput){
                saveShift(shiftInput: $shiftInput){
                    id
                    shiftName
                    shiftType
                    start
                    end
                    labour
                }
            }
        `,
    {
      clientId: WORK_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}

function deleteShiftGraphql() {
  return useMutation(
    gql`
            mutation deleteShift($id: String){
                deleteShift(id: $id)
            }
        `,
    {
      clientId: WORK_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}

function findByShiftTypeAndStatusGraphql() {
  return useLazyQuery(
    gql`
            query findByShiftTypeAndStatus($shiftType: String, $status: String){
                findByShiftTypeAndStatus(shiftType: $shiftType, status: $status){
                    id
                    shiftName
                    shiftType
                    start
                    end
                    labour
                }
            }
        `, {},
    {
      clientId: WORK_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}

export { deleteShiftGraphql, findByShiftTypeAndStatusGraphql, findByShiftTypeGraphql, saveShiftGraphql };

