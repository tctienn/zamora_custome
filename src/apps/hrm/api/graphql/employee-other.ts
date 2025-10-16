import { useMutation, useQuery } from '@vue/apollo-composable';
import gql from 'graphql-tag';

import { HRM_CLIENT_ID } from '@/common/api/graphql/apollo-clients';

function getOtherProfessionByEmployeeId(employeeId: string) {
  return useQuery(
    gql`
        query findVacationByEmployeeId($employeeId: String!){
            findVacationByEmployeeId(employeeId: $employeeId){
                id
                type
                fromDate
                toDate
                description
                 files {
                    id
                    objectId
                    name
                    extension
                    fileName
                    path
                    size
                }
            }
        }
    `, { employeeId },
    {
      clientId: HRM_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}
function deleteEmployeeOtherProfession() {
  console.log('deleteEmployeeOtherProfession');
  return useMutation(
    gql`
        mutation DeleteVacationType($id: String!) {
            deleteVacationType(id: $id)
        }`,
    { clientId: HRM_CLIENT_ID });
}

export { deleteEmployeeOtherProfession, getOtherProfessionByEmployeeId };